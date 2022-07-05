var fs = require('fs');
var path = require('path');

// todo : use flood fill to merge pixels into continuous vector shapes

console.log("*** initializing bitsy ***");

// HACK: combine and evaluate the bitsy engine scripts in module scope
// so that we can call `parseWorld` on the icon data
eval(
	[
		'system',
		'font',
		'transition',
		'script',
		'dialog',
		'renderer',
		'bitsy'
	]
		.map(file => fs.readFileSync(path.resolve(__dirname, `../../editor/script/engine/${file}.js`), "utf8"))
		.join(';\n')
);

console.log("*** loading drawings ***")

parseWorld(fs.readFileSync(path.resolve(__dirname, "icons.bitsy"), "utf8"));

console.log("*** generating icons ***");

function drawingToSvg(bitmapArray, width, height, filename) {
	var svg = "";
	svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + '\n';
	svg += '<svg viewBox="0 0 ' + (width*10) + ' ' + (height*10) + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">' + '\n';

	svg += '<path d="';

	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			if (bitmapArray[i][j] == 1) {
				svg += 'M' + (j * 10) + ',' + (i * 10) +
					' L' + ((j+1) * 10) + ',' + (i * 10) +
					' L' + ((j+1) * 10) + ',' + ((i+1) * 10) +
					' L' + (j * 10) + ',' + ((i+1) * 10) +
					' L' + (j * 10) + ',' + (i * 10) + ' ';
			}
		}
	}

	svg += 'Z" />' + '\n';

	svg += '</svg>' + '\n';

	fs.writeFileSync(filename, svg);
}

for (var t in tile) {
	var drwId = tile[t].drw;
	var name = tile[t].name;

	console.log(name);

	var imageSource = renderer.GetImageSource(drwId);

	var frame0 = imageSource[0];

	drawingToSvg(frame0, 8, 8, path.resolve(__dirname, "../resources/icons/icon_" + name + ".svg"));

	if (imageSource.length > 1) {
		var frame1 = imageSource[1];
		drawingToSvg(frame1, 8, 8, path.resolve(__dirname, "../resources/icons/icon_" + name + "_f1.svg"));
	}
}