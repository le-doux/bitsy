/*
TODO
- use callbacks
- remove globals
	- tilesize
	- scale
	- palette data
	- sprite, tile, item data
- pass in loading update room?
- tile picker is BROKEN!!!!
- it's too flashy & slow right now :(
- what if INSTEAD of doing everything at once.. I just rendered on an AS-NEEDED basis
	- one image at a time
	- need cacheing strategy
	- need to keep editor renderer up-to-date when you change something WITHOUT re-rendering everything
	- will this get rid of the need for a loading screen?
	- renderer can CONTAIN an "imageStore" variable (instead of the game state)
	- the longer it goes.. the more expensive rendering seems to get
		- keep a memory limit? up to a certain number of sprites in memory? (IF THEY ARE NOT ON SCREEN DELETE THEM)
*/

function Renderer(tilesize, scale) {

console.log("!!!!! NEW RENDERER");

var imageStore = {
	source: {},
	render: {}
};

var palettes = null; // TODO : need null checks?
var context = null;

function setPalettes(paletteObj) {
	palettes = paletteObj;

	// TODO : should this really clear out the render cache?
	for (pal in palettes) {
		imageStore.render[pal] = {
			"1" : {}, //images with primary color index 1 (usually tiles)
			"2" : {}  //images with primary color index 2 (usually sprites)
		}
	}
}

function getPaletteColor(paletteId, colorIndex) {
	var palette = palettes[paletteId];

	if (colorIndex > palette.colors.length) { // do I need this failure case? (seems un-reliable)
		colorIndex = 0;
	}

	var color = palette.colors[colorIndex];

	return {
		r : color[0],
		g : color[1],
		b : color[2]
	};
}

// TODO : change image store path from (pal > col > draw) to (draw > pal > col)
function renderImage(drawing, paletteId) {
	var col = drawing.col;
	var colStr = "" + col;
	var pal = paletteId;
	var drwId = drawing.drw;
	var imgSrc = imageStore.source[ drawing.drw ];

	// slightly hacky initialization of image store for palettes with more than 3 colors ~~~ SECRET FEATURE DO NOT USE :P ~~~
	if(imageStore.render[pal][colStr] === undefined || imageStore.render[pal][colStr] === null) {
		imageStore.render[pal][colStr] = {};
	}

	imageStore.render[pal][colStr][drwId] = []; // create array of ImageData frames
	for (var i = 0; i < imgSrc.length; i++) {
		var frameSrc = imgSrc[i];
		var frameData = imageDataFromImageSource( frameSrc, pal, col );
		imageStore.render[pal][colStr][drwId].push(frameData);
	}
}

function imageDataFromImageSource(imageSource, pal, col) {
	//console.log(imageSource);

	var img = context.createImageData(tilesize*scale,tilesize*scale);

	var backgroundColor = getPaletteColor(pal,0);
	var foregroundColor = getPaletteColor(pal,col);

	for (var y = 0; y < tilesize; y++) {
		for (var x = 0; x < tilesize; x++) {
			var px = imageSource[y][x];
			for (var sy = 0; sy < scale; sy++) {
				for (var sx = 0; sx < scale; sx++) {
					var pxl = (((y * scale) + sy) * tilesize * scale * 4) + (((x*scale) + sx) * 4);
					if ( px === 1 ) {
						img.data[pxl + 0] = foregroundColor.r;
						img.data[pxl + 1] = foregroundColor.g;
						img.data[pxl + 2] = foregroundColor.b;
						img.data[pxl + 3] = 255;
					}
					else { //ch === 0
						img.data[pxl + 0] = backgroundColor.r;
						img.data[pxl + 1] = backgroundColor.g;
						img.data[pxl + 2] = backgroundColor.b;
						img.data[pxl + 3] = 255;
					}
				}
			}
		}
	}

	return img;
}

function isImageRendered(drawing, paletteId) {
	var col = drawing.col;
	var colStr = "" + col;
	var pal = paletteId;
	var drwId = drawing.drw;

	return !(imageStore.render[pal][colStr][drwId] === undefined || imageStore.render[pal][colStr][drwId] === null);
}

function getImageSet(drawing, paletteId) {
	return imageStore.render[paletteId][drawing.col][drawing.drw];
}

function getImageFrame(drawing, paletteId, frameOverride) {
	var frameIndex = 0;
	if (drawing.animation.isAnimated) {
		if (frameOverride != undefined && frameOverride != null) {
			frameIndex = frameOverride;
		}
		else {
			frameIndex = drawing.animation.frameIndex;
		}
	}

	return getImageSet(drawing, paletteId)[frameIndex];
}

function getOrRenderImage(drawing, paletteId, frameOverride) {
	if (!isImageRendered(drawing, paletteId)) {
		renderImage(drawing, paletteId);
	}

	return getImageFrame(drawing, paletteId, frameOverride);
}

/* PUBLIC INTERFACE */
this.GetImage = getOrRenderImage;

this.SetPalettes = setPalettes;

this.SetImageSource = function(drawingId, imageSourceData) {
	imageStore.source[drawingId] = imageSourceData;
}

this.GetImageSource = function(drawingId) {
	return imageStore.source[drawingId];
}

this.GetFrameCount = function(drawingId) {
	return imageStore.source[drawingId].length;
}

this.AttachContext = function(ctx) {
	context = ctx;
}

} // Renderer()


function Timer() {
	var start = Date.now();

	this.Seconds = function() {
		return Math.floor( (Date.now() - start) / 1000 );
	}

	this.Milliseconds = function() {
		return Date.now() - start;
	}
}