/*
SERVICE WORKER GENERATOR SCRIPT
*/

var fs = require('fs');

console.log("generating service worker...");

var templateHtml = fs.readFileSync("sw_template.js", "utf8");

console.log(templateHtml);

console.log(">>>");

var cacheFileRootDir = "../../editor/";
var ignoreFiles = [".DS_Store", "sw.js"];
var cacheFilePaths = [];

function findCacheFilesRecursive(searchDir, cachePath) {
	var files = fs.readdirSync(searchDir);

	for (var i = 0; i < files.length; i++) {
		var fileName = files[i];
		var filePath = searchDir + fileName;

		if (fs.lstatSync(filePath).isDirectory()) {
			findCacheFilesRecursive(searchDir + fileName + "/", cachePath + fileName + "/");
		}
		else if (ignoreFiles.indexOf(fileName) === -1) {
			cacheFilePaths.push(cachePath + fileName);
		}
	}
}

findCacheFilesRecursive(cacheFileRootDir, "./");

var cacheListStr = "[\n";

for (var i = 0; i < cacheFilePaths.length; i++) {
	cacheListStr += "\t\t\t\t\"" + cacheFilePaths[i] + "\",\n";
}

cacheListStr += "\t\t\t]";

var swHtml = templateHtml.replace("/*__CACHE_ITEMS__*/", cacheListStr);

console.log(swHtml);

fs.writeFileSync("../../editor/sw.js", swHtml);

console.log(">>> done!");