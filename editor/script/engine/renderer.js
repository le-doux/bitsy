// todo : rename to RenderCache or something?
function Renderer(tilesize, scale) {

bitsyLog("!!!!! NEW RENDERER");

var EMPTY_TILE_ID = "__EMPTY_TILE__";

var emptyTileData = [[
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
]];

var imageCache = {
	source: {},
	render: {},
};

var palettes = null; // TODO : need null checks?
var context = null; // todo : remove?

// todo : remove?
function setPalettes(paletteObj) {
	palettes = paletteObj;

	// TODO : should this really clear out the render cache?
	imageCache.render = {};
}

// todo : remove?
function getPaletteColor(paletteId, colorIndex) {
	if (palettes[paletteId] === undefined) {
		paletteId = "default";
	}

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

var debugRenderCount = 0;

// TODO : change image store path from (pal > col > draw) to (draw > pal > col)
function renderImage(drawing, paletteId) {
	// debugRenderCount++;
	// bitsyLog("RENDER COUNT " + debugRenderCount);

	var col = (drawing === null) ? 0 : drawing.col;
	var colStr = "" + col;
	var pal = paletteId;
	var drwId = (drawing === null) ? EMPTY_TILE_ID : drawing.drw;
	var imgSrc = (drawing === null) ? emptyTileData : imageCache.source[drwId];

	// initialize render cache entry
	if (imageCache.render[drwId] === undefined || imageCache.render[drwId] === null) {
		imageCache.render[drwId] = {};
	}

	if (imageCache.render[drwId][pal] === undefined || imageCache.render[drwId][pal] === null) {
		imageCache.render[drwId][pal] = {};
	}

	// create array of ImageData frames
	imageCache.render[drwId][pal][colStr] = [];

	for (var i = 0; i < imgSrc.length; i++) {
		var frameSrc = imgSrc[i];
		var frameTileId = renderTileFromImageSource(frameSrc, pal, col);
		imageCache.render[drwId][pal][colStr].push(frameTileId);
	}
}

function renderTileFromImageSource(imageSource, pal, col) {
	//bitsyLog(imageSource);

	var tileId = bitsyAddTile();

	var backgroundColor = tileColorStartIndex + 0;
	var foregroundColor = tileColorStartIndex + col;

	bitsyDrawBegin(tileId);

	for (var y = 0; y < tilesize; y++) {
		for (var x = 0; x < tilesize; x++) {
			var px = imageSource[y][x];

			if (px === 1) {
				bitsyDrawPixel(foregroundColor, x, y);
			}
			else {
				bitsyDrawPixel(backgroundColor, x, y);
			}
		}
	}

	bitsyDrawEnd();

	return tileId;
}

// TODO : move into core
function undefinedOrNull(x) {
	return x === undefined || x === null;
}

function isImageRendered(drawing, paletteId) {
	var col = (drawing === null) ? 0 : drawing.col;
	var colStr = "" + col;
	var pal = paletteId;
	var drwId = (drawing === null) ? EMPTY_TILE_ID : drawing.drw;

	if (undefinedOrNull(imageCache.render[drwId]) ||
		undefinedOrNull(imageCache.render[drwId][pal]) ||
		undefinedOrNull(imageCache.render[drwId][pal][colStr])) {
			return false;
	}
	else {
		return true;
	}
}

function getImageSet(drawing, paletteId) {
	var col = (drawing === null) ? 0 : drawing.col;
	var colStr = "" + col;
	var pal = paletteId;
	var drwId = (drawing === null) ? EMPTY_TILE_ID : drawing.drw;

	return imageCache.render[drwId][pal][colStr];
}

function getImageFrameTileId(drawing, paletteId, frameOverride) {
	var frameIndex = 0;

	if (drawing != null && drawing.animation.isAnimated) {
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

	return getImageFrameTileId(drawing, paletteId, frameOverride);
}

/* PUBLIC INTERFACE */
this.GetImage = getOrRenderImage;

this.SetPalettes = setPalettes;

this.SetImageSource = function(drawingId, imageSourceData) {
	imageCache.source[drawingId] = imageSourceData;
	imageCache.render[drawingId] = {}; // reset render cache for this image
}

this.GetImageSource = function(drawingId) {
	return imageCache.source[drawingId];
}

this.GetFrameCount = function(drawingId) {
	return imageCache.source[drawingId].length;
}

this.AttachContext = function(ctx) {
	context = ctx;
}

this.ClearCache = function() {
	imageCache.render = {};
}

} // Renderer()