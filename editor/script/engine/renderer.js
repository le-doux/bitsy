function TileRenderer(tilesize) {
// todo : do I need to pass in tilesize? or can I use the global value?

bitsyLog("!!!!! NEW TILE RENDERER");

var drawingCache = {
	source: {},
	render: {},
};

// var debugRenderCount = 0;

function createRenderCacheId(drawingId, colorIndex) {
	return drawingId + "_" + colorIndex;
}

function renderDrawing(drawing) {
	// debugRenderCount++;
	// bitsyLog("RENDER COUNT " + debugRenderCount);

	var col = drawing.col;
	var drwId = drawing.drw;
	var drawingFrames = drawingCache.source[drwId];

	// initialize render cache entry
	var cacheId = createRenderCacheId(drwId, col);
	if (drawingCache.render[cacheId] === undefined) {
		// initialize array of frames for drawing
		drawingCache.render[cacheId] = [];
	}

	for (var i = 0; i < drawingFrames.length; i++) {
		var frameData = drawingFrames[i];
		var frameTileId = renderTileFromDrawingData(frameData, col);
		drawingCache.render[cacheId].push(frameTileId);
	}
}

function renderTileFromDrawingData(drawingData, col) {
	var tileId = bitsyAddTile();

	var backgroundColor = tileColorStartIndex + 0;
	var foregroundColor = tileColorStartIndex + col;

	bitsyDrawBegin(tileId);

	for (var y = 0; y < tilesize; y++) {
		for (var x = 0; x < tilesize; x++) {
			var px = drawingData[y][x];

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

function isDrawingRendered(drawing) {
	var cacheId = createRenderCacheId(drawing.drw, drawing.col);
	return drawingCache.render[cacheId] != undefined;
}

function getRenderedDrawingFrames(drawing) {
	var cacheId = createRenderCacheId(drawing.drw, drawing.col);
	return drawingCache.render[cacheId];
}

function getDrawingFrameTileId(drawing, frameOverride) {
	var frameIndex = 0;

	if (drawing != null && drawing.animation.isAnimated) {
		if (frameOverride != undefined && frameOverride != null) {
			frameIndex = frameOverride;
		}
		else {
			frameIndex = drawing.animation.frameIndex;
		}
	}

	return getRenderedDrawingFrames(drawing)[frameIndex];
}

function getOrRenderDrawingFrame(drawing, frameOverride) {
	// bitsyLog("frame render: " + drawing.type + " " + drawing.id + " f:" + frameOverride);

	if (!isDrawingRendered(drawing)) {
		// bitsyLog("frame render: doesn't exist");
		renderDrawing(drawing);
	}

	return getDrawingFrameTileId(drawing, frameOverride);
}

/* PUBLIC INTERFACE */
this.GetDrawingFrame = getOrRenderDrawingFrame;

this.SetDrawingSource = function(drawingId, drawingData) {
	drawingCache.source[drawingId] = drawingData;
	// TODO : reset render cache for this image
}

this.GetDrawingSource = function(drawingId) {
	return drawingCache.source[drawingId];
}

this.GetFrameCount = function(drawingId) {
	return drawingCache.source[drawingId].length;
}

this.ClearCache = function() {
	drawingCache.render = {};
}

} // Renderer()