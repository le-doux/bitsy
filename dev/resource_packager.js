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
	/* system scripts */
	"../editor/script/system/input.js",
	"../editor/script/system/soundchip.js",
	"../editor/script/system/graphics.js",
	"../editor/script/system/system.js",
	/* engine scripts */
	"../editor/script/engine/world.js",
	"../editor/script/engine/sound.js",
	"../editor/script/engine/font.js",
	"../editor/script/engine/transition.js",
	"../editor/script/engine/script.js",
	"../editor/script/engine/dialog.js",
	"../editor/script/engine/renderer.js",
	"../editor/script/engine/bitsy.js",
];

var resourceDirectories = [
  "resources/icons",
  "resources/tool_data",
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
	result = result.replace(/\r\n/g, "\n");
	resourcePackage[fileName] = result;
}

for (var i = 0; i < resourceDirectories.length; i++) {
	var dir = resourceDirectories[i];
	var fileNames = fs.readdirSync(dir);
	for (var j = 0; j < fileNames.length; j++) {
		var fileName = fileNames[j];
		var result = fs.readFileSync(dir + "/" + fileName, "utf8");
		/* if this program is checked out with git on Windows, our text fiels
		 * will use CR LF lines. we try to deal with this in places where it
		 * may break, but we should really just make sure the resource files
		 * consistently only have LF. */
		result = result.replace(/\r\n/g, "\n");
		resourcePackage[fileName] = result;
	}
}

var resourceJavascriptFile = "var Resources = " + JSON.stringify(resourcePackage, null, 2) + ";";

fs.writeFile("../editor/script/generated/resources.js", resourceJavascriptFile, function () {});

// console.log(resourcePackage);

console.log("done!");