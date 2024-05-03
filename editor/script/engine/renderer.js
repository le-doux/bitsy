function TileRenderer(debugName) {
bitsy.log("!!!!! NEW TILE RENDERER: " + debugName);

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
	// bitsy.log("RENDER COUNT " + debugRenderCount);

	var col = drawing.col;
	var bgc = drawing.bgc;
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
		var frameTileId = renderTileFromDrawingData(frameData, col, bgc);
		drawingCache.render[cacheId].push(frameTileId);
	}
}

function renderTileFromDrawingData(drawingData, col, bgc) {
	var tileId = bitsy.tile();

	var backgroundColor = tileColorStartIndex + bgc;
	var foregroundColor = tileColorStartIndex + col;

	bitsy.fill(tileId, backgroundColor);

	for (var y = 0; y < bitsy.TILE_SIZE; y++) {
		for (var x = 0; x < bitsy.TILE_SIZE; x++) {
			var px = drawingData[y][x];
			if (px === 1) {
				bitsy.set(tileId, (y * bitsy.TILE_SIZE) + x, foregroundColor);
			}
		}
	}

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
	// bitsy.log("frame render: " + drawing.type + " " + drawing.id + " f:" + frameOverride);

	if (!isDrawingRendered(drawing)) {
		bitsy.log("frame render: doesn't exist " + drawing.id);
		renderDrawing(drawing);
	}

	return getDrawingFrameTileId(drawing, frameOverride);
}

function deleteRenders(drawingId) {
	for (var cacheId in drawingCache.render) {
		if (cacheId.indexOf(drawingId) === 0) {
			var tiles = drawingCache.render[cacheId];
			for (var i = 0; i < tiles.length; i++) {
				bitsy.delete(tiles[i]);
			}
			delete drawingCache.render[cacheId];
		}
	}
}

/* PUBLIC INTERFACE */
this.GetDrawingFrame = getOrRenderDrawingFrame;

// todo : leave individual get and set stuff for now - should I remove later?
// todo : better name for function?
this.SetDrawings = function(drawingSource) {
	drawingCache.source = drawingSource;
	// need to reset entire render cache when all the drawings are changed
	drawingCache.render = {};
};

this.SetDrawingSource = function(drawingId, drawingData) {
	deleteRenders(drawingId);
	drawingCache.source[drawingId] = drawingData;
};

this.GetDrawingSource = function(drawingId) {
	return drawingCache.source[drawingId];
};

this.GetFrameCount = function(drawingId) {
	return drawingCache.source[drawingId].length;
};

// todo : forceReset option is hacky?
this.ClearCache = function(forceReset) {
	if (forceReset === undefined || forceReset === true) {
		// delete all tiles from system memory before clearing the cache
		for (var cacheId in drawingCache.render) {
			var tiles = drawingCache.render[cacheId];
			for (var i = 0; i < tiles.length; i++) {
				bitsy.delete(tiles[i]);
			}
		}
	}

	drawingCache.render = {};
};

this.deleteDrawing = deleteRenders;

} // Renderer()