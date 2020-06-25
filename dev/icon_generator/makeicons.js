var fs = require('fs');

// todo : use flood fill to merge pixels into continuous vector shapes

console.log("*** initializing bitsy ***");

// load the bitsy engine
eval(fs.readFileSync("../../editor/script/engine/color_util.js", "utf8"))
eval(fs.readFileSync("../../editor/script/engine/font.js", "utf8"))
eval(fs.readFileSync("../../editor/script/engine/transition.js", "utf8"))
eval(fs.readFileSync("../../editor/script/engine/script.js", "utf8"))
eval(fs.readFileSync("../../editor/script/engine/dialog.js", "utf8"))
eval(fs.readFileSync("../../editor/script/engine/renderer.js", "utf8"))
eval(fs.readFileSync("../../editor/script/engine/bitsy.js", "utf8"))

console.log("*** loading drawings ***")

parseWorld(fs.readFileSync("icons.bitsy", "utf8"));

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

	var frame0 = renderer.GetImageSource(drwId)[0];

	drawingToSvg(frame0, 8, 8, "../resources/icons/icon_" + name + ".svg");
}