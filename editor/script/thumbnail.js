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
} // ThumbnailRenderer()