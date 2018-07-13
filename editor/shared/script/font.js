function FontManager() {

var self = this;
var fontExtension = ".bitsyfont";

// feels very hacky to initialize this seperately and late
var externalResources = null;
this.InitResourceLoader = function() {
	externalResources = new ResourceLoader();// NOTE : this class doesn't exist in exported game
}

this.LoadResources = function(filenames, onLoadAll) {
	if (externalResources == null)
		return;

	// TODO : is this being called too many times?
	var onLoad = function() {
		var count = externalResources.getResourceLoadedCount();

		if (count >= filenames.length && onLoadAll != null) {
			onLoadAll();
		}
	}

	for (var i = 0; i < filenames.length; i++) {
		externalResources.load("bitsyfont", filenames[i], onLoad);
	}
}

// "manually" add resource
this.AddResource = function(filename, fontdata) {
	if (externalResources == null)
		return;

	externalResources.set(filename, fontdata);
}

// store font data that is part of the local game data
var localResources = {};
this.AddLocalResource = function(fontName, fontData) {
	localResources[fontName] = fontData;
}

this.GetLocalResource = function(fontName) {
	console.log("GET LOCAL RESOURCE " + fontName);
	console.log(localResources[fontName]);
	return localResources[fontName];
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
		fontData = self.GetData(fontName); // in editor
	}
	else {
		// OLD VERSION : from separate font file
		// fontData = document.getElementById(fontName).text.slice(1); // exported

		// NEW VERSION : stored in game data
		fontData = localResources[fontName];
	}

	return self.Create(fontData); // also need access to create
}

function Font(fontData) {
	var name = "unknown";
	var width = 6; // default size so if you have NO font or an invalid font it displays boxes
	var height = 8;
	var fontdata = {};
	var invalidCharData = [];

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

	this.hasChar = function(char) {
		var codepoint = char.charCodeAt(0);
		return fontdata[codepoint] != null;
	}

	this.getChar = function(char) {

		var codepoint = char.charCodeAt(0);

		if (fontdata[codepoint] != null) {
			return fontdata[codepoint];
		}
		else {
			return invalidCharData;
		}
	}

	function parseFont(fontData) {
		if (fontData == null)
			return;

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

		// init invalid character box
		invalidCharData = [];
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				if (x < width-1 && y < height-1) {
					invalidCharData.push(1);
				}
				else {
					invalidCharData.push(0);
				}
			}
		}
	}

	parseFont(fontData);
}

} // FontManager