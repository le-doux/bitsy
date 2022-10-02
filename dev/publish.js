var fs = require("fs");
var ssh2 = require("ssh2");

var srcRoot = process.argv[2];
var destRoot = process.argv[3];

var sftpSettings = {
	username: process.argv[4],
	host: process.argv[5],
	port: parseInt(process.argv[6]),
	password: process.argv[7]
};

function serial(list, process, callback) {
	var i = -1;

	function next() {
		i++;

		if (i < list.length) {
			process(list[i], next);
		}
		else {
			callback();
		}
	}

	next();
}

function parallel(list, process, callback) {
	var count = 0;
	function next() {
		count++;
		if (count >= list.length) {
			callback();
		}
	}

	if (list.length > 0) {
		for (var i = 0; i < list.length; i++) {
			process(list[i], next);
		}
	}
	else {
		callback();
	}
}

function getFiles(fs, dir, callback) {
	fs.readdir(dir, function(err, list) {
		if (err) {
			console.log("readdir error: " + err);
			callback([]);
		}
		else {
			var files = [];
			parallel(list,
				function(entry, next) {
					var file = {
						name: (entry.filename != undefined) ? entry.filename : entry,
					};
					var path = dir + "/" + file.name;
					fs.stat(path, function(err, stat) {
						if (err) {
							console.log("file stat error (" + path + "): " + err);
						}
						else {
							file.isDirectory = stat.isDirectory();
						}

						files.push(file);
						next();
					});
				},
				function() {
					callback(files);
				});
		}
	});
}

function getFilesRecursive(fs, root, callback) {
	console.log("getting files in: " + root);
	var paths = [];

	getFiles(fs, root, function(files) {
		serial(files,
			function(file, next) {
				var path = root + "/" + file.name;
				file.path = path;
				paths.push(file);
				if (file.isDirectory) {
					getFilesRecursive(fs, path, function(list) {
						paths = paths.concat(list);
						next();
					});
				}
				else {
					next();
				}
			},
			function() {
				callback(paths);
			})
	});
}

var connection = new ssh2.Client();
connection.on("ready", function() {
	connection.sftp(function (err, sftp) {
		if (err) {
			console.log("connection error: " + err);
			connection.end();
		}
		else {
			console.log("connected!");

			function cleanDestination(callback) {
				console.log("checking for existing files in: " + destRoot);
				getFilesRecursive(sftp, destRoot, function(serverPaths) {
					if (serverPaths.length > 0) {
						console.log("found " + serverPaths.length + " files - cleaning");
					}

					// delete in reverse order to ensure each directory
					// is empty of files before trying to delete it
					serverPaths.reverse();
					serial(serverPaths,
						function(serverPath, next) {
							if (serverPath.isDirectory) {
								console.log("deleting directory: " + serverPath.path);
								sftp.rmdir(serverPath.path, function(err) {
									if (err) {
										console.log("rmdir err (" + serverPath.path + ")" + err);
									}
									next();
								});
							}
							else {
								sftp.unlink(serverPath.path, function(err) {
									if (err) {
										console.log("unlink err (" + serverPath.path + ")" + err);
									}
									next();
								});
							}
						},
						function() {
							console.log("cleanup done!");
							callback();
						});
				});
			}

			function copyToServer(callback) {
				console.log("finding files to copy in: " + srcRoot);
				getFilesRecursive(fs, srcRoot, function(localPaths) {
					console.log("found " + localPaths.length + " files - copying");

					var localDirectoryPaths = [];
					var localFilePaths = [];
					for (var i = 0; i < localPaths.length; i++) {
						if (localPaths[i].isDirectory) {
							localDirectoryPaths.push(localPaths[i].path);
						}
						else {
							localFilePaths.push(localPaths[i].path);
						}
					}

					console.log("creating directory structure");
					serial(localDirectoryPaths,
						function(localDirPath, next) {
							var relativeDirPath = localDirPath.replace(srcRoot, "");
							var serverDirPath = destRoot + relativeDirPath;

							console.log("creating directory: " + serverDirPath);
							sftp.mkdir(serverDirPath, function(err) {
								if (err) {
									console.log("mkdir err (" + serverDirPath + ")" + err);
								}
								next();
							});
						},
						function() {
							console.log("finished directory structure");
							copyFilesToServer(localFilePaths, callback);
						});
				});
			}

			function copyFilesToServer(localFilePaths, callback) {
				console.log("copying files");
				parallel(localFilePaths,
					function(localFilePath, next) {
						var relativeFilePath = localFilePath.replace(srcRoot, "");
						var serverFilePath = destRoot + relativeFilePath;
						sftp.fastPut(localFilePath, serverFilePath, function(err) {
							if (err) {
								console.log("put err (" + relativeFilePath + ")" + err);
							}
							else {
								console.log("copied " + relativeFilePath);
							}
							next();
						});
					},
					function() {
						console.log("copied all files");
						callback();
					});
			}

			cleanDestination(
				function() {
					copyToServer(
						function() {
							console.log("done!");
							connection.end();
						});
				});
		}
	});
}).connect(sftpSettings);