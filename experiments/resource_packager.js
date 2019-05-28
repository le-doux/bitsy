var fs = require("fs");

var resourceFiles = [
	"../editor/index.html",
	"../editor/shared/script/font.js",
];

var resourcePackage = {};

function getFileName(path) {
	var splitPath = path.split("/");
	return splitPath[splitPath.length - 1];
}

for (var i = 0; i < resourceFiles.length; i++) {
	var path = resourceFiles[i];
	var fileName = getFileName(path);
	var result = fs.readFileSync(path, "utf8");
	resourcePackage[fileName] = result;
}

var resourceJavascriptFile = "var Resources = " + JSON.stringify(resourcePackage, null, 2) + ";";

fs.writeFile("resources.js", resourceJavascriptFile, function () {});

// console.log(resourcePackage);

console.log("done!");