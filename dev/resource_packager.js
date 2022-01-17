var fs = require("fs");

/* NOTE: this is made to deal with text files. if you add binaries to it,
 * it WILL break! */
var resourceFiles = [
	/* localization */
	"resources/localization.tsv",
	/* bitsy game data */
	"resources/defaultGameData.bitsy",
	/* bitsy fonts */
	"resources/bitsyfont/ascii_small.bitsyfont",
	"resources/bitsyfont/unicode_european_small.bitsyfont",
	"resources/bitsyfont/unicode_european_large.bitsyfont",
	"resources/bitsyfont/unicode_asian.bitsyfont",
	"resources/bitsyfont/arabic.bitsyfont",
	/* export */
	"resources/export/exportTemplate.html",
	"resources/export/exportStyleFixed.css",
	"resources/export/exportStyleFull.css",
	/* engine scripts */
	"../editor/script/engine/system.js",
	"../editor/script/engine/bitsy.js",
	"../editor/script/engine/font.js",
	"../editor/script/engine/dialog.js",
	"../editor/script/engine/script.js",
	"../editor/script/engine/renderer.js",
	"../editor/script/engine/transition.js",
];

var resourceDirectories = [
  "resources/icons",
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
	/* if this program is checked out with git on Windows, our text fiels
	 * will use CR LF lines. we try to deal with this in places where it
	 * may break, but we should really just make sure the resource files
	 * consistently only have LF. */
	result = result.replaceAll(/\r\n/g, "\n");
	resourcePackage[fileName] = result;
}

for (var i = 0; i < resourceDirectories.length; i++) {
	var dir = resourceDirectories[i];
	var fileNames = fs.readdirSync(dir);
	for (var j = 0; j < fileNames.length; j++) {
		var fileName = fileNames[j];
		var result = fs.readFileSync(dir + "/" + fileName, "utf8");
		resourcePackage[fileName] = result;
	}
}

var resourceJavascriptFile = "var Resources = " + JSON.stringify(resourcePackage, null, 2) + ";";

fs.writeFile("../editor/script/generated/resources.js", resourceJavascriptFile, function () {});

// console.log(resourcePackage);

console.log("done!");
