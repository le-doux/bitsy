function GraphicsSystem() {
	var self = this;

	var canvas;
	var ctx;

	var scale;
	var textScale;
	var palette = [];
	var images = [];
	var imageFillColors = [];

	function makeFillStyle(color, isTransparent) {
		var i = color * 3;
		if (isTransparent) {
			return "rgba(" + palette[i + 0] + "," + palette[i + 1] + "," + palette[i + 2] + ", 0)";
		}
		else {
			return "rgb(" + palette[i + 0] + "," + palette[i + 1] + "," + palette[i + 2] + ")";
		}
	}

	this._images = images;
	this._getPalette = function() {
		return palette;
	};

	// todo : do I really need to pass in size here?
	this.attachCanvas = function(c, size) {
		canvas = c;
		canvas.width = size * scale;
		canvas.height = size * scale;
		ctx = canvas.getContext("2d");
	};

	this.getCanvas = function() {
		return canvas;
	};

	this.getContext = function() {
		return ctx;
	};

	this.setScale = function(s) {
		scale = s;
	};

	this.setTextScale = function(s) {
		textScale = s;
	};

	this.getTextScale = function() {
		return textScale;
	};

	this.setPalette = function(p) {
		palette = p;
	};

	// todo : rename this since it doesn't always create a totally new canvas?
	this.createImage = function(id, width, height, pixels, useTextScale) {
		var imageScale = useTextScale === true ? textScale : scale;
		var widthScaled = width * imageScale;
		var heightScaled = height * imageScale;

		// try to use an existing image canvas if it is the right size,
		// instead of expensively creating a new one
		var imageCanvas = images[id];
		if (imageCanvas === undefined || imageCanvas.width != widthScaled || imageCanvas.height != heightScaled) {
			imageCanvas = document.createElement("canvas");
			imageCanvas.width = widthScaled;
			imageCanvas.height = heightScaled;
		}

		var imageCtx = imageCanvas.getContext("2d");

		// if we know the fill color for this image, we can speed things up
		// by filling the whole image with that color
		var fillColor;
		if (imageFillColors[id] != undefined) {
			fillColor = imageFillColors[id];
			var isTransparent = (fillColor === 0);
			if (isTransparent) {
				imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
			}
			else {
				imageCtx.fillStyle = makeFillStyle(fillColor, isTransparent);
				imageCtx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
			}
		}

		for (var i = 0; i < pixels.length; i++) {
			var x = i % width;
			var y = Math.floor(i / width);
			var color = pixels[i];
			if (color != fillColor) {
				var isTransparent = (color === 0);
				imageCtx.fillStyle = makeFillStyle(color, isTransparent);
				imageCtx.fillRect(x * imageScale, y * imageScale, imageScale, imageScale);
			}
		}

		images[id] = imageCanvas;
	};

	this.setImageFill = function(id, color) {
		imageFillColors[id] = color;
	};

	this.drawImage = function(id, x, y, destId) {
		if (!images[id]) {
			bitsyLog("image doesn't exist: " + id, "graphics");
			return;
		}

		var destCtx = ctx;
		if (destId != undefined) {
			// if there's a destination ID, that means we're drawing this image *onto* another image canvas
			var destCanvas = images[destId];
			destCtx = destCanvas.getContext("2d");
		}

		destCtx.drawImage(images[id], x * scale, y * scale, images[id].width, images[id].height);
	};

	this.hasImage = function(id) {
		return images[id] != undefined;
	};

	this.getImage = function(id) {
		return images[id];
	};

	this.deleteImage = function(id) {
		delete images[id];
		delete imageFillColors[id];
	};

	this.getCanvas = function() {
		return canvas;
	};

	this.clearCanvas = function(color) {
		bitsyLog("pal? " + palette.length + " / " + color, "graphics");
		ctx.fillStyle = makeFillStyle(color);
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	};
}