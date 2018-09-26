/* NOTES
	- 9 x 13 is the max size pixels
	- BUT not all have the same width
	- AND some have negative X start values

TODO
- handle variable widths
- handle RIGHT to LEFT
- handle negative X OFFSETs

look at hmtx
 - width
 - lsb (left offset)
*/

// imports
var fs = require('fs');
var xml2js = require('xml2js');


// vector math
function isPointInPoly(p, poly) {
	var crossings = 0;
	var p0 = poly[poly.length-1];
	for (var i = 0; i < poly.length; i++) {
		var p1 = poly[i];
		var pNudged = {x:p.x, y:p.y+0.1}; // nudging the ray origin a bit avoids double counting vertices
		if ( rayIntersectsLine( pNudged, {x:1,y:0}, p0, p1 ) )
			crossings++;
		p0 = p1;
	}
	return ( crossings % 2 ) == 1;
}

function rayIntersectsLine(p, r, l0, l1) {
	var q = l0;
	var s = sub(l1,l0);

	if ( cross(r,s) == 0 ) return false;

	var t = cross( sub(q,p), s ) / cross( r, s );
	var u = cross( sub(q,p), r ) / cross( r, s );

	return ( t >= 0 && u >= 0 && u <= 1 );
}

function sub(p0, p1) {
	return {
		x: p0.x - p1.x,
		y: p0.y - p1.y
	};
}

function cross(p0, p1) {
	return (p0.x * p1.y) - (p0.y * p1.x);
}


// xml parsing
fs.readFile("arabic.ttx", "utf8", function(err, data) {
	// console.log(data);
	// console.log(xml2js);
	xml2js.parseString(data, function(err, result) {
		var bitsyFontData = "FONT arabic\n";

		var font = result.ttFont;

		var head = font.head[0];
		function getHeadValue(id) {
			return head[id][0]["$"]["value"];
		}

		var unitsPerEm = getHeadValue("unitsPerEm");
		var pixelsPerEm = getHeadValue("lowestRecPPEM");
		var pixelsPerUnit = pixelsPerEm / unitsPerEm;
		var unitsPerPixel = unitsPerEm / pixelsPerEm;

		var xMax = getHeadValue("xMax");
		var yMax = getHeadValue("yMax");
		var width = xMax * pixelsPerUnit;
		var height = yMax * pixelsPerUnit;

		function pixelToPoint(x,y) {
			return {
				x : ((x / width) * xMax) + (unitsPerPixel * 0.5),
				y : ((1 - (y / height)) * yMax) + (unitsPerPixel * 0.5)
			};
		}

		// console.log("SIZE " + width + " " + height);
		bitsyFontData += "SIZE " + width + " " + height + "\n";

		var cmap = font.cmap[0].cmap_format_4[0].map;
		var nameToCharCode = {};
		for (var i = 0; i < cmap.length; i++) {
			var map = cmap[i];
			nameToCharCode[map["$"].name] = map["$"].code;
		}

		var glyphList = font.glyf[0].TTGlyph;
		for (var i = 0; i < glyphList.length; i++) {
			var glyph = glyphList[i];
			var name = glyph["$"].name;

			if (!nameToCharCode[name])
				continue;

			var code = parseInt( nameToCharCode[name] );

			console.log(name);

			bitsyFontData += "CHAR " + code + "\n";

			var pathList = [];
			if (glyph.contour) {
				for (var j = 0; j < glyph.contour.length; j++) {
					var path = [];
					var contour = glyph.contour[j];
					for (var k = 0; k < contour.pt.length; k++) {
						var pt = contour.pt[k];
						var point = { x: parseInt(pt["$"].x), y: parseInt(pt["$"].y) };
						path.push(point);
					}
					pathList.push(path);
				}
			}

			for (var y = 0; y < height; y++) {
				var row = "";
				for (var x = 0; x < width; x++) {
					var pixelPoint = pixelToPoint(x,y);
					var isPixelFilled = false;
					for (var p = 0; p < pathList.length; p++) {
						var path = pathList[p];
						if (isPointInPoly(pixelPoint,path)) {
							isPixelFilled = true;
						}
					}
					// row += "(" + point.x + "," + point.y + ")\t";
					row += isPixelFilled ? "1" : "0";
				}
				// console.log(row);
				bitsyFontData += row + "\n";
			}
		}

		fs.writeFile("arabic.txt", bitsyFontData);
	});
});