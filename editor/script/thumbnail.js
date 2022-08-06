// renders a tile to canvas (kind of hackily recreates some of the TileRenderer logic - oh well)
function renderTileToCanvas(drawing, frameIndex) {
	var selectedRoomId = state.room;
	if (roomTool) {
		selectedRoomId = roomTool.getSelected();
	}

	// get frame data
	var imageSource;
	var frameData;
	
	imageSource = getDrawingImageSource(drawing);

	if (imageSource != undefined) {
		frameData = imageSource[frameIndex];
	}

	// get palette colors
	var palId = room[selectedRoomId].pal;
	var palColors = getPal(palId);

	// clamp tile colors to available palette size
	var bgc = Math.min(palColors.length - 1, Math.max(0, drawing.bgc));
	var col = Math.min(palColors.length - 1, Math.max(0, drawing.col));

	// draw
	var tileThumbCanvas = document.createElement("canvas");
	tileThumbCanvas.width = tilesize * scale;
	tileThumbCanvas.height = tilesize * scale;

	var ctx = tileThumbCanvas.getContext("2d");
	ctx.fillStyle = "rgb(" + palColors[bgc][0] + "," + palColors[bgc][1] + "," + palColors[bgc][2] + ")";
	ctx.fillRect(0, 0, tilesize * scale, tilesize * scale);

	ctx.fillStyle = "rgb(" + palColors[col][0] + "," + palColors[col][1] + "," + palColors[col][2] + ")";

	if (frameData != undefined) {
		for (var y = 0; y < tilesize; y++) {
			for (var x = 0; x < tilesize; x++) {
				if (frameData[y][x] === 1) {
					ctx.fillRect(x * scale, y * scale, scale, scale);
				}
			}
		}
	}

	return tileThumbCanvas;
}

// todo : deprecate this old version of the thumbnail renderer
function ThumbnailRenderer() {
	bitsyLog("NEW THUMB RENDERER", "editor");

	var drawingThumbnailCanvas, drawingThumbnailCtx;
	drawingThumbnailCanvas = document.createElement("canvas");
	drawingThumbnailCanvas.width = tilesize * scale; // TODO: scale constants need to be contained somewhere
	drawingThumbnailCanvas.height = tilesize * scale;
	drawingThumbnailCtx = drawingThumbnailCanvas.getContext("2d");

	var thumbnailRenderEncoders = {};
	var cache = {};

	function thumbnailGetImage(drawing, frameIndex) {
		if (drawing.type === TileType.Sprite || drawing.type === TileType.Avatar) {
			return getSpriteFrame(sprite[drawing.id], frameIndex);
		}
		else if(drawing.type === TileType.Item) {
			return getItemFrame(item[drawing.id], frameIndex);
		}
		else if(drawing.type === TileType.Tile) {
			return getTileFrame(tile[drawing.id], frameIndex);
		}
		return null;
	}

	function thumbnailDraw(drawing, context, x, y, frameIndex) {
		var renderedImg = renderTileToCanvas(drawing, frameIndex);
		if (renderedImg) {
			context.drawImage(renderedImg, x, y, tilesize * scale, tilesize * scale);
		}
		else {
			bitsyLog("oh no! image render for thumbnail failed", "editor");
		}
	}

	function render(imgId,drawing,frameIndex,imgElement) {
		var isAnimated = (frameIndex === undefined || frameIndex === null) ? true : false;

		var palId = getRoomPal(state.room); // TODO : should NOT be hardcoded like this

		var hexPalette = [];
		var roomColors = getPal(palId);
		for (i in roomColors) {
			var hexStr = rgbToHex(roomColors[i][0], roomColors[i][1], roomColors[i][2]).slice(1);
			hexPalette.push(hexStr);
		}

		// bitsyLog(id, "editor");

		var drawingFrameData = [];

		if( isAnimated || frameIndex == 0 ) {
			thumbnailDraw(drawing, drawingThumbnailCtx, 0, 0, 0 /*frameIndex*/);
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,tilesize*scale,tilesize*scale).data );
		}
		if( isAnimated || frameIndex == 1 ) {
			thumbnailDraw(drawing, drawingThumbnailCtx, 0, 0, 1 /*frameIndex*/);
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,tilesize*scale,tilesize*scale).data );
		}

		// create encoder
		var gifData = {
			frames: drawingFrameData,
			width: tilesize*scale,
			height: tilesize*scale,
			palette: hexPalette,
			loops: 0,
			delay: animationTime / 10 // TODO why divide by 10???
		};
		var encoder = new gif();

		// cancel old encoder (if in progress already)
		if( thumbnailRenderEncoders[imgId] != null )
			thumbnailRenderEncoders[imgId].cancel();
		thumbnailRenderEncoders[imgId] = encoder;

		// start encoding new GIF
		if (imgElement === undefined || imgElement === null) {
			imgElement = document.getElementById(imgId);
		}
		encoder.encode( gifData, createThumbnailRenderCallback(imgElement) );
	}
	this.Render = function(imgId,drawing,frameIndex,imgElement) {
		render(imgId,drawing,frameIndex,imgElement);
	};

	function createThumbnailRenderCallback(img) {
		return function(uri) {
			// update image
			img.src = uri;
			img.style.background = "none";

			// update cache
			cache[img.id] = {
				uri : uri,
				outOfDate : false
			};
		};
	}

	this.GetCacheEntry = function(imgId) {
		if (!cache[imgId]) {
			cache[imgId] = {
				uri : null,
				outOfDate : true
			};
		}
		return cache[imgId];
	}
}

function ThumbnailRendererBase(getRenderable, getHexPalette, onRender) {
	var renderCanvas = document.createElement("canvas");
	renderCanvas.width = tilesize * scale; // TODO: scale constants need to be contained somewhere
	renderCanvas.height = tilesize * scale;

	var renderCtx = renderCanvas.getContext("2d");

	var thumbnailRenderEncoders = {};
	var cache = {};

	function render(id, options) {
		var renderable = getRenderable(id);

		if (!renderable) {
			// todo : find and fix the root cause of these render issues
			bitsyLog("oh no! thumbnail renderer can't get renderable object! :(", "editor");
			return;
		}

		var hexPalette = getHexPalette(renderable);
		var renderFrames = onRender(renderable, renderCtx, options);

		if (renderFrames.length <= 0) {
			bitsyLog("oh no! the thumbnail frame list is empty >:(", "editor");
			return;
		}

		var cacheId = options && options.cacheId ? options.cacheId : id;

		// create encoder
		var gifData = {
			frames: renderFrames,
			width: renderCanvas.width,
			height: renderCanvas.height,
			palette: hexPalette,
			loops: 0,
			delay: animationTime / 10, // TODO why divide by 10???
		};
		var encoder = new gif();

		// cancel old encoder (if in progress already)
		if (thumbnailRenderEncoders[cacheId] != null) {
			thumbnailRenderEncoders[cacheId].cancel();
		}
		thumbnailRenderEncoders[cacheId] = encoder;

		// start encoding new GIF
		encoder.encode(gifData, function(uri) {
			// update cache
			cache[cacheId] = {
				uri : uri,
				outOfDate : false
			};

			if (options && options.callback) {
				options.callback(uri);
			}
		});
	}
	this.Render = render;

	function getCacheEntry(id) {
		if (!cache[id]) {
			cache[id] = {
				uri : null,
				outOfDate : true,
			};
		}

		return cache[id];
	}
	this.GetCacheEntry = getCacheEntry;

	function invalidateCache() {
		for (var id in cache) {
			cache[id].outOfDate = true;
		}
	}
	this.InvalidateCache = invalidateCache;
}

function createDrawingThumbnailRenderer(source) {
	var getRenderable = function(id) {
		return source[id];
	}

	var getHexPalette = function(drawing) {
		var palId = roomTool ? getRoomPal(roomTool.getSelected()) : getRoomPal(state.room);

		var hexPalette = [];
		var roomColors = getPal(palId);
		for (i in roomColors) {
			var hexStr = rgbToHex(roomColors[i][0], roomColors[i][1], roomColors[i][2]).slice(1);
			hexPalette.push(hexStr);
		}

		return hexPalette;
	}

	var onRender = function(drawing, ctx, options) {
		var palId = getRoomPal(state.room);
		var renderFrames = [];

		if (drawing && drawing.id in source) {
			for (var i = 0; i < drawing.animation.frameCount; i++) {
				if (options.isAnimated || options.frameIndex === i) {
					var renderedImg = renderTileToCanvas(drawing, i);
					if (renderedImg) {
						ctx.drawImage(renderedImg, 0, 0, tilesize * scale, tilesize * scale);
						renderFrames.push(ctx.getImageData(0, 0, tilesize * scale, tilesize * scale).data);
					}
					else {
						bitsyLog("oh no! image render for thumbnail failed", "editor");
					}
				}
			}
		}

		return renderFrames;
	}

	return new ThumbnailRendererBase(getRenderable, getHexPalette, onRender);
}

function createSpriteThumbnailRenderer() {
	return createDrawingThumbnailRenderer(sprite);
}

function createTileThumbnailRenderer() {
	return createDrawingThumbnailRenderer(tile);
}

function createItemThumbnailRenderer() {
	return createDrawingThumbnailRenderer(item);
}

function createPaletteThumbnailRenderer() {
	var getRenderable = function(id) {
		return palette[id];
	}

	var getHexPaletteBase = function(pal) {
		var hexPalette = [];

		if (pal.id in palette) {
			var palId = pal.id;
			var colors = getPal(palId);

			for (i in colors) {
				var hexStr = rgbToHex(colors[i][0], colors[i][1], colors[i][2]).slice(1);
				hexPalette.push(hexStr);
			}
		}

		return hexPalette;
	}

	// always include black for border, but not in palette itself
	var getHexPalette = function(pal) {
		return getHexPaletteBase(pal).concat('000000');
	}

	var onRender = function(pal, ctx, options) {
		var padding = 0.125;
		var fillSize = 1 - padding*2;
		if (pal.id in palette) {
			var hexPalette = getHexPaletteBase(pal);
			var bar = (1 / hexPalette.length) * fillSize;

			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, tilesize * scale, tilesize * scale);

			for (i in hexPalette) {
				ctx.fillStyle = "#" + hexPalette[i];
				ctx.fillRect(tilesize * scale * padding, tilesize * scale * (padding + i * bar), tilesize * scale * fillSize, tilesize * scale * bar);
			}
		}

		return [ctx.getImageData(0, 0, tilesize * scale, tilesize * scale).data];
	}

	return new ThumbnailRendererBase(getRenderable, getHexPalette, onRender);
}

function createRoomThumbnailRenderer() {
	var getRenderable = function(id) {
		return room[id];
	}

	var getHexPalette = function(r) {
		var hexPalette = [];

		if (r.id in room) {
			var palId = getRoomPal(r.id);
			var colors = getPal(palId);

			for (i in colors) {
				var hexStr = rgbToHex(colors[i][0], colors[i][1], colors[i][2]).slice(1);
				hexPalette.push(hexStr);
			}

			return hexPalette;
		}
	}

	function onRender(r, ctx, options) {
		var roomRenderSize = tilesize * scale;
		var tileRenderSize = roomRenderSize / mapsize;

		if (r.id in room) {
			var roomId = r.id;
			var hexPalette = getHexPalette(r);

			bitsyLog(hexPalette, "editor");

			ctx.fillStyle = "#" + hexPalette[0];
			ctx.fillRect(0, 0, roomRenderSize, roomRenderSize);

			// tiles
			for (var ry = 0; ry < mapsize; ry++) {
				for (var rx = 0; rx < mapsize; rx++) {
					var tileId = r.tilemap[ry][rx];

					if (tileId != "0" && (tileId in tile)) {
						ctx.fillStyle = "#" + hexPalette[parseInt(tile[tileId].col)];
						ctx.fillRect(rx * tileRenderSize, ry * tileRenderSize, tileRenderSize, tileRenderSize);
					}
				}
			}

			// items
			for (var i = 0; i < r.items.length; i++) {
				var itm = r.items[i];

				if (itm.id in item) {
					var rx = itm.x;
					var ry = itm.y;
					ctx.fillStyle = "#" + hexPalette[parseInt(item[itm.id].col)];
					ctx.fillRect(rx * tileRenderSize, ry * tileRenderSize, tileRenderSize, tileRenderSize);
				}
			}

			// sprites
			for (id in sprite) {
				var spr = sprite[id];
				if (spr.room === r.id) {
					var rx = spr.x;
					var ry = spr.y;
					ctx.fillStyle = "#" + hexPalette[parseInt(spr.col)];
					ctx.fillRect(rx * tileRenderSize, ry * tileRenderSize, tileRenderSize, tileRenderSize);
				}
			}
		}

		return [ctx.getImageData(0, 0, roomRenderSize, roomRenderSize).data];
	}

	var renderer = new ThumbnailRendererBase(getRenderable, getHexPalette, onRender);
	renderer.renderToCtx = onRender;

	return renderer;
}

// todo : make better blip thumbnail renderer
function createBlipThumbnailRenderer() {
	var getRenderable = function(id) {
		return blip[id];
	}

	var getHexPalette = function(blipObj) {
		var hexPalette = [];

		if (roomTool) {
			var colors = roomTool.world.palette["0"].colors;
			for (i in colors) {
				var hexStr = rgbToHex(colors[i][0], colors[i][1], colors[i][2]).slice(1);
				hexPalette.push(hexStr);
			}
		}

		return hexPalette;
	}

	var onRender = function(blipObj, ctx, options) {
		var hexPalette = getHexPalette(blipObj);

		ctx.fillStyle = "#" + hexPalette[2];
		ctx.fillRect(0, 0, tilesize * scale, tilesize * scale);

		if (soundPlayer) {
			ctx.fillStyle = "#" + hexPalette[0];

			// draw waveform (copied from makeBlipTile())
			var blipSamples = soundPlayer.sampleBlip(blipObj, 8);
			for (var i = 0; i < blipSamples.frequencies.length; i++) {
				var freq = 1 + Math.floor(blipSamples.frequencies[i] * 4);
				for (var j = 0; j < freq; j++) {
					ctx.fillRect(i * scale, (3 - j) * scale, scale, scale);
					ctx.fillRect(i * scale, (4 + j) * scale, scale, scale);
				}
			}
		}

		return [ctx.getImageData(0, 0, tilesize * scale, tilesize * scale).data];
	}

	return new ThumbnailRendererBase(getRenderable, getHexPalette, onRender);
}

function ThumbnailControl(options) {
	var id = options.id;
	var renderer = options.renderer;

	var div = document.createElement("div");
	div.classList.add("bitsy-thumbnail");
	div.title = options.tooltip;

	if (options.onclick) {
		div.onclick = options.onclick;
	}

	var isSelected = options.isSelectedFunc;
	if (isSelected(id)) {
		div.classList.add("bitsy-thumbnail-selected");
	}

	var thumbnailContainer = document.createElement("div");
	thumbnailContainer.classList.add("bitsy-thumbnail-image-container");
	thumbnailContainer.appendChild(createIconElement(options.icon));
	div.appendChild(thumbnailContainer);

	div.appendChild(createLabelElement({
		icon: options.icon,
		text: options.text,
	}));

	var renderOptions = options.renderOptions ? options.renderOptions : {};
	renderOptions.callback = function(uri) {
		thumbnailContainer.innerHTML = "";

		var thumbnailImg = document.createElement("img");
		thumbnailImg.src = uri;

		thumbnailContainer.appendChild(thumbnailImg);
	};

	this.GetElement = function() {
		return div;
	};

	this.LoadThumbnailImage = function() {
		if (id && renderer) {
			var entry = renderer.GetCacheEntry(id);

			if (entry.uri != null) {
				renderOptions.callback(entry.uri);
			}

			if (entry.outOfDate) {
				renderer.Render(id, renderOptions);
			}
		}
	};

	this.UpdateSelected = function() {
		if (isSelected(id)) {
			div.classList.add("bitsy-thumbnail-selected");
		}
		else {
			div.classList.remove("bitsy-thumbnail-selected");
		}
	};
}