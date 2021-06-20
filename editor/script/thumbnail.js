function ThumbnailRenderer() {
	console.log("NEW THUMB RENDERER");

	var drawingThumbnailCanvas, drawingThumbnailCtx;
	drawingThumbnailCanvas = document.createElement("canvas");
	drawingThumbnailCanvas.width = 8 * scale; // TODO: scale constants need to be contained somewhere
	drawingThumbnailCanvas.height = 8 * scale;
	drawingThumbnailCtx = drawingThumbnailCanvas.getContext("2d");

	var thumbnailRenderEncoders = {};
	var cache = {};

	function render(imgId,drawingId,frameIndex,imgElement) {
		var isAnimated = (frameIndex === undefined || frameIndex === null) ? true : false;

		var palId = getRoomPal(curRoom); // TODO : should NOT be hardcoded like this

		var hexPalette = [];
		var roomColors = getPal(palId);
		for (i in roomColors) {
			var hexStr = rgbToHex(roomColors[i][0], roomColors[i][1], roomColors[i][2]).slice(1);
			hexPalette.push(hexStr);
		}

		// console.log(id);

		var drawingFrameData = [];

		if( isAnimated || frameIndex == 0 ) {
			drawingId.draw( drawingThumbnailCtx, 0, 0, palId, 0 /*frameIndex*/ );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		}
		if( isAnimated || frameIndex == 1 ) {
			drawingId.draw( drawingThumbnailCtx, 0, 0, palId, 1 /*frameIndex*/ );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		}

		// create encoder
		var gifData = {
			frames: drawingFrameData,
			width: 8*scale,
			height: 8*scale,
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
	this.Render = function(imgId,drawingId,frameIndex,imgElement) {
		render(imgId,drawingId,frameIndex,imgElement);
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
	renderCanvas.width = 8 * scale; // TODO: scale constants need to be contained somewhere
	renderCanvas.height = 8 * scale;

	var renderCtx = renderCanvas.getContext("2d");

	var thumbnailRenderEncoders = {};
	var cache = {};

	function render(id, options) {
		var renderable = getRenderable(id);

		var hexPalette = getHexPalette(renderable);
		var renderFrames = onRender(renderable, renderCtx, options);

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

	this.GetCacheEntry = function(id) {
		if (!cache[id]) {
			cache[id] = {
				uri : null,
				outOfDate : true,
			};
		}

		return cache[id];
	}
}

function createDrawingThumbnailRenderer(source) {
	var getRenderable = function(id) {
		return source[id];
	}

	var getHexPalette = function(drawing) {
		var palId = getRoomPal(curRoom);

		var hexPalette = [];
		var roomColors = getPal(palId);
		for (i in roomColors) {
			var hexStr = rgbToHex(roomColors[i][0], roomColors[i][1], roomColors[i][2]).slice(1);
			hexPalette.push(hexStr);
		}

		return hexPalette;
	}

	var onRender = function(drawing, ctx, options) {
		var palId = getRoomPal(curRoom);
		var renderFrames = [];

		if (drawing && drawing.id in source) {
			for (var i = 0; i < drawing.animation.frameCount; i++) {
				if (options.isAnimated || options.frameIndex === i) {
					var renderedImg = renderer.GetImage(drawing, palId, i);
					ctx.drawImage(renderedImg, 0, 0, tilesize * scale, tilesize * scale);

					renderFrames.push(ctx.getImageData(0, 0, 8 * scale, 8 * scale).data);
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

function ThumbnailControl(id, renderer, options) {
	var div = document.createElement("div");
	div.classList.add("bitsy-thumbnail");
	div.onclick = options.onclick;
	div.title = options.text;

	var thumbnailContainer = document.createElement("div");
	thumbnailContainer.classList.add("bitsy-thumbnail-image-container");
	thumbnailContainer.appendChild(createIconElement(options.icon));
	div.appendChild(thumbnailContainer);

	var renderOptions = options.renderOptions ? options.renderOptions : {};
	renderOptions.callback = function(uri) {
		thumbnailContainer.innerHTML = "";

		var thumbnailImg = document.createElement("img");
		thumbnailImg.src = uri;

		thumbnailContainer.appendChild(thumbnailImg);
	};

	renderer.Render(id, renderOptions);

	div.appendChild(createLabelElement({
		icon: options.icon,
		text: options.text,
	}));

	this.GetElement = function() {
		return div;
	};
}