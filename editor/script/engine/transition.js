var TransitionManager = function() {
	var transitionStart = null;
	var transitionEnd = null;

	var isTransitioning = false;
	var transitionTime = 0; // milliseconds
	var minStepTime = 125; // cap the frame rate
	var curStep = -1; // used to avoid running post-process effect constantly

	this.BeginTransition = function(startRoom, startX, startY, endRoom, endX, endY, effectName) {
		bitsyLog("--- START ROOM TRANSITION ---");

		curEffect = effectName;

		var tmpRoom = player().room;
		var tmpX = player().x;
		var tmpY = player().y;

		if (transitionEffects[curEffect].showPlayerStart) {
			player().room = startRoom;
			player().x = startX;
			player().y = startY;
		}
		else {
			player().room = "_transition_none"; // kind of hacky!!
		}

		var startRoomPixels = createRoomPixelBuffer(room[startRoom]);
		var startPalette = getPal(room[startRoom].pal);
		var startImage = new PostProcessImage(startRoomPixels);
		transitionStart = new TransitionInfo(startImage, startPalette, startX, startY);

		if (transitionEffects[curEffect].showPlayerEnd) {
			player().room = endRoom;
			player().x = endX;
			player().y = endY;
		}
		else {
			player().room = "_transition_none";
		}

		var endRoomPixels = createRoomPixelBuffer(room[endRoom]);
		var endPalette = getPal(room[endRoom].pal);
		var endImage = new PostProcessImage(endRoomPixels);
		transitionEnd = new TransitionInfo(endImage, endPalette, endX, endY);

		isTransitioning = true;
		transitionTime = 0;
		curStep = -1;

		player().room = tmpRoom;
		player().x = tmpX;
		player().y = tmpY;
	}

	this.UpdateTransition = function(dt) {
		if (!isTransitioning) {
			return;
		}

		// todo : shouldn't need to set this every frame!
		bitsySetGraphicsMode(0);

		transitionTime += dt;

		var maxStep = transitionEffects[curEffect].stepCount;

		if (transitionTime >= minStepTime) {
			curStep++;

			var step = curStep;
			bitsyLog("transition step " + step);

			if (transitionEffects[curEffect].paletteEffectFunc) {
				var colors = transitionEffects[curEffect].paletteEffectFunc(transitionStart, transitionEnd, (step / maxStep));

				for (var i = 0; i < colors.length; i++) {
					bitsySetColor(tileColorStartIndex + i, colors[i][0], colors[i][1], colors[i][2]);
				}
			}

			bitsyDrawBegin(0);
			for (var y = 0; y < 128; y++) {
				for (var x = 0; x < 128; x++) {
					var color = transitionEffects[curEffect].pixelEffectFunc(transitionStart, transitionEnd, x, y, (step / maxStep));
					bitsyDrawPixel(color, x, y);
				}
			}
			bitsyDrawEnd();

			transitionTime = 0;
		}

		if (curStep >= (maxStep - 1)) {
			isTransitioning = false;
			transitionTime = 0;
			transitionStart = null;
			transitionEnd = null;
			curStep = -1;

			if (transitionCompleteCallback != null) {
				transitionCompleteCallback();
			}
			transitionCompleteCallback = null;
		}
	}

	this.IsTransitionActive = function() {
		return isTransitioning;
	}

	// todo : should this be part of the constructor?
	var transitionCompleteCallback = null;
	this.OnTransitionComplete = function(callback) {
		if (isTransitioning) { // TODO : safety check necessary?
			transitionCompleteCallback = callback;
		}
	}

	var transitionEffects = {};
	var curEffect = "none";
	this.RegisterTransitionEffect = function(name, effect) {
		transitionEffects[name] = effect;
	}

	this.RegisterTransitionEffect("none", {
		showPlayerStart : false,
		showPlayerEnd : false,
		paletteEffectFunc : function() {},
		pixelEffectFunc : function() {},
	});

	this.RegisterTransitionEffect("fade_w", { // TODO : have it linger on full white briefly?
		showPlayerStart : false,
		showPlayerEnd : true,
		stepCount : 6,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			return delta < 0.5 ? start.Image.GetPixel(pixelX, pixelY) : end.Image.GetPixel(pixelX, pixelY);
		},
		paletteEffectFunc : function(start, end, delta) {
			var colors = [];

			if (delta < 0.5) {
				delta = delta / 0.5;

				for (var i = 0; i < start.Palette.length; i++) {
					colors.push(lerpColor(start.Palette[i], [255, 255, 255], delta));
				}
			}
			else {
				delta = ((delta - 0.5) / 0.5);

				for (var i = 0; i < end.Palette.length; i++) {
					colors.push(lerpColor([255, 255, 255], end.Palette[i], delta));
				}
			}

			return colors;
		},
	});

	this.RegisterTransitionEffect("fade_b", {
		showPlayerStart : false,
		showPlayerEnd : true,
		stepCount : 6,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			return delta < 0.5 ? start.Image.GetPixel(pixelX, pixelY) : end.Image.GetPixel(pixelX, pixelY);
		},
		paletteEffectFunc : function(start, end, delta) {
			var colors = [];

			if (delta < 0.5) {
				delta = delta / 0.5;

				for (var i = 0; i < start.Palette.length; i++) {
					colors.push(lerpColor(start.Palette[i], [0, 0, 0], delta));
				}
			}
			else {
				delta = ((delta - 0.5) / 0.5);

				for (var i = 0; i < end.Palette.length; i++) {
					colors.push(lerpColor([0, 0, 0], end.Palette[i], delta));
				}
			}

			return colors;
		},
	});

	this.RegisterTransitionEffect("wave", {
		showPlayerStart : true,
		showPlayerEnd : true,
		stepCount : 12,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			var waveDelta = delta < 0.5 ? delta / 0.5 : 1 - ((delta - 0.5) / 0.5);

			var offset = (pixelY + (waveDelta * waveDelta * 0.2 * start.Image.Height));
			var freq = 4;
			var size = 2 + (14 * waveDelta);
			pixelX += Math.floor(Math.sin(offset / freq) * size);

			if (pixelX < 0) {
				pixelX += start.Image.Width;
			}
			else if (pixelX >= start.Image.Width) {
				pixelX -= start.Image.Width;
			}

			var curImage = delta < 0.5 ? start.Image : end.Image;
			return curImage.GetPixel(pixelX, pixelY);
		},
		paletteEffectFunc : function(start, end, delta) {
			return delta < 0.5 ? start.Palette : end.Palette;
		},
	});

	this.RegisterTransitionEffect("tunnel", {
		showPlayerStart : true,
		showPlayerEnd : true,
		stepCount : 12,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			if (delta <= 0.4) {
				var tunnelDelta = 1 - (delta / 0.4);

				var xDist = start.PlayerCenter.x - pixelX;
				var yDist = start.PlayerCenter.y - pixelY;
				var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (dist > start.Image.Width * tunnelDelta) {
					return 0;
				}
				else {
					return start.Image.GetPixel(pixelX, pixelY);
				}
			}
			else if (delta <= 0.6) {
				return 0;
			}
			else {
				var tunnelDelta = (delta - 0.6) / 0.4;

				var xDist = end.PlayerCenter.x - pixelX;
				var yDist = end.PlayerCenter.y - pixelY;
				var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (dist > end.Image.Width * tunnelDelta) {
					return 0;
				}
				else {
					return end.Image.GetPixel(pixelX, pixelY);
				}
			}
		},
		paletteEffectFunc : function(start, end, delta) {
			return delta < 0.5 ? start.Palette : end.Palette;
		},
	});

	this.RegisterTransitionEffect("slide_u", {
		showPlayerStart : false,
		showPlayerEnd : true,
		stepCount : 8,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			var pixelOffset = -1 * Math.floor(start.Image.Height * delta);
			var slidePixelY = pixelY + pixelOffset;

			var colorDelta = clampLerp(delta, 0.4);

			if (slidePixelY >= 0) {
				return start.Image.GetPixel(pixelX, slidePixelY);
			}
			else {
				slidePixelY += start.Image.Height;
				return end.Image.GetPixel(pixelX, slidePixelY);
			}
		},
		paletteEffectFunc : function(start, end, delta) {
			var colors = [];

			for (var i = 0; i < start.Palette.length; i++) {
				colors.push(lerpColor(start.Palette[i], end.Palette[i], delta));
			}

			return colors;
		},
	});

	this.RegisterTransitionEffect("slide_d", {
		showPlayerStart : false,
		showPlayerEnd : true,
		stepCount : 8,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			var pixelOffset = Math.floor(start.Image.Height * delta);
			var slidePixelY = pixelY + pixelOffset;

			var colorDelta = clampLerp(delta, 0.4);

			if (slidePixelY < start.Image.Height) {
				return start.Image.GetPixel(pixelX, slidePixelY);
			}
			else {
				slidePixelY -= start.Image.Height;
				return end.Image.GetPixel(pixelX, slidePixelY);
			}
		},
		paletteEffectFunc : function(start, end, delta) {
			var colors = [];

			for (var i = 0; i < start.Palette.length; i++) {
				colors.push(lerpColor(start.Palette[i], end.Palette[i], delta));
			}

			return colors;
		},
	});

	this.RegisterTransitionEffect("slide_l", {
		showPlayerStart : false,
		showPlayerEnd : true,
		stepCount : 8,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			var pixelOffset = -1 * Math.floor(start.Image.Width * delta);
			var slidePixelX = pixelX + pixelOffset;

			var colorDelta = clampLerp(delta, 0.4);

			if (slidePixelX >= 0) {
				return start.Image.GetPixel(slidePixelX, pixelY);
			}
			else {
				slidePixelX += start.Image.Width;
				return end.Image.GetPixel(slidePixelX, pixelY);
			}
		},
		paletteEffectFunc : function(start, end, delta) {
			var colors = [];

			for (var i = 0; i < start.Palette.length; i++) {
				colors.push(lerpColor(start.Palette[i], end.Palette[i], delta));
			}

			return colors;
		},
	});

	this.RegisterTransitionEffect("slide_r", {
		showPlayerStart : false,
		showPlayerEnd : true,
		stepCount : 8,
		pixelEffectFunc : function(start, end, pixelX, pixelY, delta) {
			var pixelOffset = Math.floor(start.Image.Width * delta);
			var slidePixelX = pixelX + pixelOffset;

			var colorDelta = clampLerp(delta, 0.4);

			if (slidePixelX < start.Image.Width) {
				return start.Image.GetPixel(slidePixelX, pixelY);
			}
			else {
				slidePixelX -= start.Image.Width;
				return end.Image.GetPixel(slidePixelX, pixelY);
			}
		},
		paletteEffectFunc : function(start, end, delta) {
			var colors = [];

			for (var i = 0; i < start.Palette.length; i++) {
				colors.push(lerpColor(start.Palette[i], end.Palette[i], delta));
			}

			return colors;
		},
	});

	// todo : move to Renderer()?
	function createRoomPixelBuffer(room) {
		var pixelBuffer = [];

		for (var i = 0; i < 128 * 128; i++) {
			pixelBuffer.push(tileColorStartIndex);
		}

		var drawTileInPixelBuffer = function(sourceData, frameIndex, colorIndex, tx, ty, pixelBuffer) {
			var frameData = sourceData[frameIndex];

			for (var y = 0; y < tilesize; y++) {
				for (var x = 0; x < tilesize; x++) {
					var color = tileColorStartIndex + (frameData[y][x] === 1 ? colorIndex : 0);
					pixelBuffer[(((ty * tilesize) + y) * 128) + ((tx * tilesize) + x)] = color;
				}
			}
		}

		//draw tiles
		for (i in room.tilemap) {
			for (j in room.tilemap[i]) {
				var id = room.tilemap[i][j];
				var x = parseInt(j);
				var y = parseInt(i);

				if (id != "0" && tile[id] != null) {
					drawTileInPixelBuffer(
						renderer.GetDrawingSource(tile[id].drw),
						tile[id].animation.frameIndex,
						tile[id].col,
						x,
						y,
						pixelBuffer);
				}
			}
		}

		//draw items
		for (var i = 0; i < room.items.length; i++) {
			var itm = room.items[i];
			drawTileInPixelBuffer(
				renderer.GetDrawingSource(item[itm.id].drw),
				item[itm.id].animation.frameIndex,
				item[itm.id].col,
				itm.x,
				itm.y,
				pixelBuffer);
		}

		//draw sprites
		for (id in sprite) {
			var spr = sprite[id];
			if (spr.room === room.id) {
				drawTileInPixelBuffer(
					renderer.GetDrawingSource(spr.drw),
					spr.animation.frameIndex,
					spr.col,
					spr.x,
					spr.y,
					pixelBuffer);
			}
		}

		return pixelBuffer;
	}

	function clampLerp(deltaIn, clampDuration) {
		var clampOffset = (1.0 - clampDuration) / 2;
		var deltaOut = Math.min(clampDuration, Math.max(0.0, deltaIn - clampOffset)) / clampDuration;
		return deltaOut;
	}

	function lerpColor(colorA, colorB, t) {
		return [
			colorA[0] + ((colorB[0] - colorA[0]) * t),
			colorA[1] + ((colorB[1] - colorA[1]) * t),
			colorA[2] + ((colorB[2] - colorA[2]) * t),
		];
	};
}; // TransitionManager()

// todo : is this wrapper still useful?
var PostProcessImage = function(imageData) {
	this.Width = 128;
	this.Height = 128;

	this.GetPixel = function(x, y) {
		return imageData[(parseInt(y) * 128) + parseInt(x)];;
	};

	this.GetData = function() {
		return imageData;
	};
};

var TransitionInfo = function(image, palette, playerX, playerY) {
	this.Image = image;
	this.Palette = palette;
	this.PlayerTilePos = { x: playerX, y: playerY };
	this.PlayerCenter = { x: Math.floor((playerX * tilesize) + (tilesize / 2)), y: Math.floor((playerY * tilesize) + (tilesize / 2)) };
};