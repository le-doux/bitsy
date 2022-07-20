var fs = require('fs');
var path = require('path');

var dirIcons = "../resources/icons";

// delete existing icons
fs.readdirSync(path.resolve(__dirname, dirIcons))
	.map(file => path.join(dirIcons, file))
	.forEach(file => {
		fs.unlinkSync(path.resolve(__dirname, file));
	});


// todo : use flood fill to merge pixels into continuous vector shapes

console.log("*** initializing bitsy ***");

function bitsyLog(str) {
	console.log("bitsy:: " + str);
}

// mock out global dependencies of `world.js`
var bitsy = {
	log: bitsyLog,
	MAP_SIZE: 16,
	TILE_SIZE: 8,
};
var scriptUtils = {
	ReadDialogScript(_, index){
		return { index };
	},
};
// evaluate `world.js` to provide access to `parseWorld` in global scope
eval(fs.readFileSync(path.resolve(__dirname, "../../editor/script/engine/world.js"), { encoding: "utf8" }));

console.log("*** loading drawings ***")

var iconBitsySrc = fs.readFileSync(path.resolve(__dirname, "icons.bitsy"), { encoding: "utf8" });
iconBitsySrc = iconBitsySrc.replace(/\r\n/g, "\n"); // clean up line endings
var world = parseWorld(iconBitsySrc);
var tile = world.tile;

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

	fs.writeFileSync(filename, svg, { encoding: "utf-8" });
}

for (var t in tile) {
	var drwId = tile[t].drw;
	var name = tile[t].name;

	console.log(name);

	var imageSource = world.drawings[drwId];

	var frame0 = imageSource[0];

	drawingToSvg(frame0, 8, 8, path.resolve(__dirname, dirIcons, "icon_" + name + ".svg"));

	if (imageSource.length > 1) {
		var frame1 = imageSource[1];
		drawingToSvg(frame1, 8, 8, path.resolve(__dirname, dirIcons, "icon_" + name + "_f1.svg"));
	}
}
