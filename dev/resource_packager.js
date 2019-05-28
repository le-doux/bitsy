var fs = require("fs");

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
	"../editor/script/engine/bitsy.js",
	"../editor/script/engine/font.js",
	"../editor/script/engine/dialog.js",
	"../editor/script/engine/script.js",
	"../editor/script/engine/color_util.js",
	"../editor/script/engine/renderer.js",
	"../editor/script/engine/transition.js",
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

fs.writeFile("../editor/script/generated/resources.js", resourceJavascriptFile, function () {});

// console.log(resourcePackage);

console.log("done!");