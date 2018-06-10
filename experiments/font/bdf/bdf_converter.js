var fs = require('fs');

fs.readFile("6x9.bdf", "utf8", function(err, data) {
	// console.log(data);

	var lines = data.split("\n");

	var codePoint = 0;
	var isReadingBitmap = false;
	var bitList = [];
	var fontData = {};

	var name = "ucs_fixed_6x9"
	var width = 6;
	var height = 9;
	var offset = (Math.ceil(width/4)*4) - width;

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
				var bit = (hexInt >> j + offset) & 1; // +4 was +2
				bitList.push( bit );
			}
		}

		if (line.indexOf("BITMAP") != -1) {
			isReadingBitmap = true;
			bitList = [];
		}
	}

	var strFontData = "";
	strFontData += "FONT " + name + "\n";
	strFontData += "SIZE " + width + " " + height + "\n";

	for (var code in fontData)
	{
		strFontData += "CHAR " + code + "\n";
		for (var y = 0; y < height; y++)
		{
			for (var x = 0; x < width; x++)
			{
				var i = (y * width) + x;
				strFontData += "" + fontData[code][i];
			}
			strFontData += "\n";
		}
	}

	// console.log(JSON.stringify(fontData));

	fs.writeFile(name + "_font.txt", strFontData);

});