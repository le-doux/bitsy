/*
TODO:
- can I simplify this more now that I've removed the external resources stuff?
*/

function FontManager(packagedFontNames) {

var self = this;

var fontExtension = ".bitsyfont";
this.GetExtension = function() {
	return fontExtension;
}

// place to store font data
var fontResources = {};

// load fonts from the editor
if (packagedFontNames != undefined && packagedFontNames != null && packagedFontNames.length > 0
		&& Resources != undefined && Resources != null) {

	for (var i = 0; i < packagedFontNames.length; i++) {
		var filename = packagedFontNames[i];
		fontResources[filename] = Resources[filename];
	}
}

// manually add resource
this.AddResource = function(filename, fontdata) {
	fontResources[filename] = fontdata;
}

this.ContainsResource = function(filename) {
	return fontResources[filename] != null;
}

function GetData(fontName) {
	return fontResources[fontName + fontExtension];
}
this.GetData = GetData;

function Create(fontData) {
	return new Font(fontData);
}
this.Create = Create;

this.Get = function(fontName) {
	var fontData = self.GetData(fontName);
	return self.Create(fontData);
}

function Font(fontData) {
	bitsy.log("create font");

	var name = "unknown";
	var width = 6; // default size so if you have NO font or an invalid font it displays boxes
	var height = 8;
	var chardata = {};

	// create invalid char data at default size in case the font is missing
	var invalidCharData = {};
	updateInvalidCharData();

	this.getName = function() {
		return name;
	}

	this.getData = function() {
		return chardata;
	}

	this.getWidth = function() {
		return width;
	}

	this.getHeight = function() {
		return height;
	}

	this.hasChar = function(char) {
		var codepoint = char.charCodeAt(0);
		return chardata[codepoint] != null;
	}

	this.getChar = function(char) {

		var codepoint = char.charCodeAt(0);

		if (chardata[codepoint] != null) {
			return chardata[codepoint];
		}
		else {
			return invalidCharData;
		}
	}

	this.allCharCodes = function() {
		var codeList = [];
		for (var code in chardata) {
			codeList.push(code);
		}
		return codeList;
	}

	function createCharData() {
		return { 
			width: width,
			height: height,
			offset: {
				x: 0,
				y: 0
			},
			spacing: width,
			data: [],
		};
	}

	function updateInvalidCharData() {
		invalidCharData = createCharData();
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				if (x < width-1 && y < height-1) {
					invalidCharData.data.push(1);
				}
				else {
					invalidCharData.data.push(0);
				}
			}
		}
	}

	function parseFont(fontData) {
		if (fontData == null) {
			return;
		}

		bitsy.log("split font lines");
		// NOTE: this is where we run out of memory - split creates a lot of memory issues
		// var lines = fontData.split("\n");
		bitsy.log("after split lines");

		var isReadingChar = false;
		var isReadingCharProperties = false;
		var curCharLineCount = 0;
		var curCharCode = 0;

		var lineStart = 0;
		var lineEnd = fontData.indexOf("\n", lineStart) != -1
			? fontData.indexOf("\n", lineStart)
			: fontData.length;

		// for (var i = 0; i < lines.length; i++) {
		// 	var line = lines[i];
		while (lineStart < fontData.length) {
			var line = fontData.substring(lineStart, lineEnd);
			// bitsy.log("parse font xx " + line);

			if (line[0] === "#") {
				// skip comment lines
			}
			else if (!isReadingChar) {
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
					isReadingCharProperties = true;

					curCharLineCount = 0;
					curCharCode = parseInt(args[1]);
					chardata[curCharCode] = createCharData();
				}
			}
			else {
				// CHAR PROPERTIES
				if (isReadingCharProperties) {
					var args = line.split(" ");
					if (args[0].indexOf("CHAR_") == 0) { // Sub-properties start with "CHAR_"
						if (args[0] == "CHAR_SIZE") {
							// Custom character size - overrides the default character size for the font
							chardata[curCharCode].width = parseInt(args[1]);
							chardata[curCharCode].height = parseInt(args[2]);
							chardata[curCharCode].spacing = parseInt(args[1]); // HACK : assumes CHAR_SIZE is always declared first
						}
						else if (args[0] == "CHAR_OFFSET") {
							// Character offset - shift the origin of the character on the X or Y axis
							chardata[curCharCode].offset.x = parseInt(args[1]);
							chardata[curCharCode].offset.y = parseInt(args[2]);
						}
						else if (args[0] == "CHAR_SPACING") {
							// Character spacing:
							// specify total horizontal space taken up by the character
							// lets chars take up more or less space on a line than its bitmap does
							chardata[curCharCode].spacing = parseInt(args[1]);
						}
					}
					else {
						isReadingCharProperties = false;
					}
				}

				// CHAR DATA
				if (!isReadingCharProperties) {
					// READING CHARACTER DATA LINE
					for (var j = 0; j < chardata[curCharCode].width; j++)
					{
						chardata[curCharCode].data.push( parseInt(line[j]) );
					}

					curCharLineCount++;
					if (curCharLineCount >= chardata[curCharCode].height) {
						isReadingChar = false;
					}
				}
			}

			lineStart = lineEnd + 1;
			lineEnd = fontData.indexOf("\n", lineStart) != -1
				? fontData.indexOf("\n", lineStart)
				: fontData.length;
		}

		// re-init invalid character box at the actual font size once it's loaded
		updateInvalidCharData();
	}

	bitsy.log("parse font");
	parseFont(fontData);

	bitsy.log("create font");
}

} // FontManager
