var fs = require('fs');
var font = require('./font_module.js');

console.log("hello");

var svg = "";
svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + '\n';
svg += '<svg width="60" height="80" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">' + '\n';
svg += '<rect width="10" height="10" fill="#000"/>' + '\n';
svg += '</svg>' + '\n';

function bitmapToSvg( bitmapArray, width, height, filename ) {
	var svg = "";
	svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + '\n';
	svg += '<svg width="' + (width*10) + '" height="' + (height*10) + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">' + '\n';

	for( var i = 0; i < height; i++ ) {
		for( var j = 0; j < width; j++ ) {
			if( bitmapArray[ (i * width ) + j ] == 1 )
				svg += '<rect x="' + (j*10) + '" y="' + (i*10) + '" width="10" height="10" fill="#000"/>' + '\n';
		}
	}

	svg += '</svg>' + '\n';

	fs.writeFile(filename, svg);
}

/* FONT */
function charToSvg( char ) {
	var charData = font.getChar( char );
	bitmapToSvg( charData, 6, 8, "font/char_" + char.charCodeAt(0) + ".svg" );
}

function exportFont() {
	for( var i = 0; i < 256; i++ ) {
		var char = String.fromCharCode( i );
		console.log("export " + char);
		charToSvg( char );
	}
}
// exportFont();

/* CAT */
var cat_data = 
[
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,1,0,1,0,0,0,1,
	0,1,1,1,0,0,0,1,
	0,1,1,1,0,0,1,0,
	0,1,1,1,1,1,0,0,
	0,0,1,1,1,1,0,0,
	0,0,1,0,0,1,0,0
];
// bitmapToSvg( cat_data, 8, 8, "font/char_cat.svg" );

/* ARROW */
var arrowdata = [
	1,1,1,1,1,
	0,1,1,1,0,
	0,0,1,0,0
];
// bitmapToSvg( arrowdata, 5, 3, "font/char_arrow.svg" );

console.log("svg done!");