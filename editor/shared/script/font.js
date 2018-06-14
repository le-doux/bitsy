/*
TODO:
- fix SAY funcs on import old files
- download font data
- asian fonts
- translate new text
- warn people about missing characters in fonts?
- consider moving export options into settings panel??
- pick bitsy font file extension (".bitsyfont??")
*/

var fontLoadSettings = {
	useExternal : false,
	resources : null
};

function Font(fontName) {

var name = "unknown";
var width = 0;
var height = 0;
var fontdata = {};

this.getName = function() {
	return name;
}

this.getData = function() {
	return fontdata;
}

this.getWidth = function() {
	return width;
}

this.getHeight = function() {
	return height;
}

var charSize = 6 * 8;
this.getChar = function(char) {

	var codepoint = char.charCodeAt(0);

	if (fontdata[codepoint] != null) {
		return fontdata[codepoint];
	}
	else {
		var invalidCharData = [];
		for (var i = 0; i < width*height; i++)
			invalidCharData.push(1);
		return invalidCharData;
	}
}

function parseFont(fontData) {
	var lines = fontData.split("\n");

	var isReadingChar = false;
	var curCharLineCount = 0;
	var curCharCode = 0;

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (!isReadingChar) {
			// READING NON CHARACTER DATA LINE
			var args = line.split(" ");
			if (args[0] == "FONT") {
				name = args[1];
			}
			else if (args[0] == "SIZE") {
				width = parseInt(args[1]);
				height = parseInt(args[2]);
			}
			else if (args[0] == "CHAR") {
				isReadingChar = true;
				curCharLineCount = 0;
				curCharCode = parseInt(args[1]);
				fontdata[curCharCode] = [];
			}
		}
		else {
			// READING CHARACTER DATA LINE
			for (var j = 0; j < width; j++)
			{
				fontdata[curCharCode].push( parseInt(line[j]) );
			}

			curCharLineCount++;
			if (curCharLineCount >= height) {
				isReadingChar = false;
			}
		}
	}
}

var bitsyFontData = "";
if (fontLoadSettings.useExternal) {
	bitsyFontData = fontLoadSettings.resources.get(fontName + ".txt"); // in editor
}
else {
	bitsyFontData = document.getElementById(fontName).text.slice(1); // exported
}

// console.log(bitsyFontData);
parseFont(bitsyFontData);

} // Font()