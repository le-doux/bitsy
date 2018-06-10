/*
TODO: for fonts
- auto font selection (how does this work??)
- manual font selection
	- dropdown in settings?
- font upload (how store??? and how many)
	- the easy way is to start with one
- how are fonts stored in the game export?
	 - BDF text file and then loaded at game start? or some in-code representation?
- how are fonts called out in the game data?
	 - store font name in the file so at least people know what it wants.. even if it doesn't exist
- X bitsy to BDF
- X sprite glyphs (custom-size characters?? or double wide characters??)


BIG ISSUES:
- how are fonts stored?
	- javascript array
	- BDF plain-text format (not well supported)
	- new Bitsy plain-text format (in the main game_data or not?)
- how is font chosen?
	- manual only (which default? old? new?) [EASIEST]
	- auto-switch on detect "special" character
	- ask user to switch on detect special character (on play? edit?)

TODOs:
	- clean up font code
		- font -> renderer / buffer code
		- textBoxInfo code & update
	- X clean up sprite glyph code
	- test sprite glyphs WITH different sized fonts
	- font selection

MISC:
	- X rename SAY -> PRINT func
		- fix SAY funcs on import old files

key thing: fonts are single objects, like rooms, or drawings... they're just made of a bunch of drawings

Qs about font format:
	- do we need to specify a name for the font in the bitsy file format?
	- multiple fonts?
	- should the font specify a character size?
	- should individual characters be able to override the default size?
	- should we be able to overwrite characters or add new characters in the game_data?
	- should the font itself be stored in the game data?

current relationship between font & game data
- font is assumed to ALWAYS be the same
- game data is only responsible for the text itself

future relationship
- game data still responsible for text
- game data can also REQUEST a font
- hopefully that font was exported with the game and it can be used to render OTHERWISE??
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