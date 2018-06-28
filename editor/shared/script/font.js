/*
TODO:
- fix SAY funcs on import old files
- X download font data
- X asian fonts
- translate new text
	- X add "Write your game's title here"
	- X make sure localization for all font & settings stuff is there
- warn people about missing characters in fonts?
- consider moving export options into settings panel??
- X pick bitsy font file extension (".bitsyfont??")
- X custom fonts
- X fix blinky bug in editor (it's as if clearInterval isn't called for the room renderer)
- text direction?
- update version number
- update default game data
X another pass on font names & descriptions
	X unicode vs ucs
X change ".txt" to ".bitsyfont" everywhere

test text
你好！ 你好 吗 안녕 하세요, 당신은 어떠 세요 こんにち は世界ﾀ ﾁﾂﾃ ﾄ界ﾅﾆﾇ ﾈﾉ界ﾊﾍ カｶ界 안ㅠ hello
*/
function FontManager() {

var fontExtension = ".bitsyfont";

var externalResources = null;
this.LoadResources = function(filenames) {
	// NOTE : only used by the editor -- should I move this out somehow so it isn't sitting in the exported games?
	externalResources = new ResourceLoader(); // WARNING : this class doesn't exist in exported game
	for (var i = 0; i < filenames.length; i++) {
		externalResources.load("bitsyfont", filenames[i]);
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