/*
TODO:
- fix SAY funcs on import old files
- X download font data
- asian fonts
- translate new text
- warn people about missing characters in fonts?
- consider moving export options into settings panel??
- X pick bitsy font file extension (".bitsyfont??")

TODO custom font:
- store custom font in browser memory
- get name somehow?
- display in UI (list)
- make custom font accessible to game
	- X in editor
	- on export
*/
function FontManager() {

var fontExtension = ".txt";

var externalResources = null;
this.LoadResources = function(filenames) {
	// NOTE : only used by the editor -- should I move this out somehow so it isn't sitting in the exported games?
	externalResources = new ResourceLoader(); // WARNING : this class doesn't exist in exported game
	for (var i = 0; i < filenames.length; i++) {
		externalResources.load("bitsy_fonts", filenames[i]);
	}
}

// "manually" add resource
this.AddResource = function(filename, fontdata) {
	externalResources.set(filename, fontdata);
}

function GetData(fontName) {
	return externalResources.get(fontName + fontExtension);
}
this.GetData = GetData;

function Create(fontData) {
	return new Font(fontData);
}
this.Create = Create;

this.Get = function(fontName) {
	var fontData = "";
	if (externalResources != null) {
		// TODO : need access to GetData method.. (self, =>, other?)
		fontData = GetData(fontName); // in editor
	}
	else {
		fontData = document.getElementById(fontName).text.slice(1); // exported
	}

	return Create(fontData); // also need access to create
}

function Font(fontData) {
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

	parseFont(fontData);
}

} // FontManager