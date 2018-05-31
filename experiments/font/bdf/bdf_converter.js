var fs = require('fs');

fs.readFile("8x13.bdf", "utf8", function(err, data) {
	// console.log(data);

	var lines = data.split("\n");

	var codePoint = 0;
	var isReadingBitmap = false;
	var bitList = [];
	var fontData = {};

	var width = 8;

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];

		if (line.indexOf("ENCODING") != -1) {
			codePoint = parseInt( line.split(" ")[1] );
		}

		if (line.indexOf("ENDCHAR") != -1) {
			isReadingBitmap = false;
			// console.log("----");
			fontData[codePoint] = bitList;
		}

		if (isReadingBitmap) {
			var hexInt = parseInt("0x" + line);
			
			for (var j = (width-1); j >= 0; j--) {
				var bit = (hexInt >> j + 0) & 1; // +4 was +2
				bitList.push( bit );
			}
		}

		if (line.indexOf("BITMAP") != -1) {
			isReadingBitmap = true;
			bitList = [];
		}
	}

	// console.log(JSON.stringify(fontData));

	fs.writeFile("bdfFontData.js", JSON.stringify(fontData));

});