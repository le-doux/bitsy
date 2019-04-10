/*
TODO:
- finalize FPS and duration
- make sure fades always hit full black and white
*/

var TransitionManager = function() {
	var transitionStart = null;
	var transitionEnd = null;
	var effectImage = null;

	var isTransitioning = false;
	var transitionTime = 0; // milliseconds
	var maxTransitionTime = 1000; // milliseconds

	var maxStep = 8;
	var prevStep = -1; // used to avoid running post-process effect constantly

	this.BeginTransition = function(startRoom,startX,startY,endRoom,endX,endY,effectName) {
		curEffect = effectName;

		// var tmpRoom = curRoom;
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

		drawRoom(room[startRoom]);
		var startPalette = getPal( room[startRoom].pal );
		var startImage = new PostProcessImage( ctx.getImageData(0,0,canvas.width,canvas.height) ); // TODO : don't use global ctx?
		transitionStart = new TransitionInfo(startImage, startPalette, startX, startY);

		if (transitionEffects[curEffect].showPlayerEnd) {
			player().room = endRoom;
			player().x = endX;
			player().y = endY;
		}
		else {
			player().room = "_transition_none";
		}

		drawRoom(room[endRoom]);
		var endPalette = getPal( room[endRoom].pal );
		var endImage = new PostProcessImage( ctx.getImageData(0,0,canvas.width,canvas.height) );
		transitionEnd = new TransitionInfo(endImage, endPalette, endX, endY);

		effectImage = new PostProcessImage( ctx.createImageData(canvas.width,canvas.height) );

		isTransitioning = true;
		transitionTime = 0;
		prevStep = -1;

		player().room = tmpRoom;
		player().x = tmpX;
		player().y = tmpY;
	}

	this.UpdateTransition = function(dt) {
		if (!isTransitioning) {
			return;
		}

		transitionTime += dt;

		var transitionDelta = transitionTime / maxTransitionTime;

		var step = Math.floor(transitionDelta * maxStep); // TODO : only update on step change!
		if (step != prevStep) {
			// console.log("step! " + step);
			for (var y = 0; y < effectImage.Height; y++) {
				for (var x = 0; x < effectImage.Width; x++) {
					var color = transitionEffects[curEffect].pixelEffectFunc(transitionStart,transitionEnd,x,y,step,maxStep);
					effectImage.SetPixel(x,y,color);
				}
			}
		}
		prevStep = step;

		ctx.putImageData(effectImage.GetData(), 0, 0);

		if (transitionTime >= maxTransitionTime) {
			isTransitioning = false;
			transitionTime = 0;
			// startImage = null;
			// endImage = null;
			transitionStart = null;
			transitionEnd = null;
			effectImage = null;
			prevStep = -1;
		}
	}

	this.IsTransitionActive = function() {
		return isTransitioning;
	}

	var transitionEffects = {};
	var curEffect = "none";
	this.RegisterTransitionEffect = function(name, effect) {
		transitionEffects[name] = effect;
	}

	this.RegisterTransitionEffect("none", {
		showPlayerStart : false,
		showPlayerEnd : false,
		pixelEffectFunc : function() {},
	});

	// TODO -- shorter effect names?
	this.RegisterTransitionEffect("fade_w", { // TODO : have it linger on full white briefly?
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var pixelDelta = step / maxStep;

			var pixelColorA = pixelDelta < 0.5 ? start.Image.GetPixel(pixelX,pixelY) : {r:255,g:255,b:255,a:255};
			var pixelColorB = pixelDelta < 0.5 ? {r:255,g:255,b:255,a:255} : end.Image.GetPixel(pixelX,pixelY);

			pixelDelta = pixelDelta < 0.5 ? (pixelDelta / 0.5) : ((pixelDelta - 0.5) / 0.5); // hacky

			return PostProcessUtilities.LerpColor(pixelColorA, pixelColorB, pixelDelta);
		}
	});

	this.RegisterTransitionEffect("fade_b", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var pixelDelta = step / maxStep;

			var pixelColorA = pixelDelta < 0.5 ? start.Image.GetPixel(pixelX,pixelY) : {r:0,g:0,b:0,a:255};
			var pixelColorB = pixelDelta < 0.5 ? {r:0,g:0,b:0,a:255} : end.Image.GetPixel(pixelX,pixelY);

			pixelDelta = pixelDelta < 0.5 ? (pixelDelta / 0.5) : ((pixelDelta - 0.5) / 0.5); // hacky

			return PostProcessUtilities.LerpColor(pixelColorA, pixelColorB, pixelDelta);
		}
	});

	// this.RegisterTransitionEffect("cross_fade", {
	// 	showPlayerStart : true,
	// 	showPlayerEnd : true,
	// 	pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
	// 		var pixelDelta = step / maxStep;

	// 		var pixelColorA = start.Image.GetPixel(pixelX,pixelY);
	// 		var pixelColorB = end.Image.GetPixel(pixelX,pixelY);

	// 		return PostProcessUtilities.LerpColor(pixelColorA, pixelColorB, pixelDelta);
	// 	}
	// });

	this.RegisterTransitionEffect("slide_u", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var pixelOffset = -1 * Math.floor(start.Image.Height * (step / maxStep));
			var slidePixelY = pixelY + pixelOffset;

			if (slidePixelY >= 0) {
				var colorA = start.Image.GetPixel(pixelX,slidePixelY);
				var colorB = PostProcessUtilities.GetCorrespondingColorFromPal(colorA,start.Palette,end.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
			else {
				slidePixelY += start.Image.Height;
				var colorB = end.Image.GetPixel(pixelX,slidePixelY);
				var colorA = PostProcessUtilities.GetCorrespondingColorFromPal(colorB,end.Palette,start.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
		}
	});

	this.RegisterTransitionEffect("slide_d", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var pixelOffset = Math.floor(start.Image.Height * (step / maxStep));
			var slidePixelY = pixelY + pixelOffset;

			if (slidePixelY < start.Image.Height) {
				var colorA = start.Image.GetPixel(pixelX,slidePixelY);
				var colorB = PostProcessUtilities.GetCorrespondingColorFromPal(colorA,start.Palette,end.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
			else {
				slidePixelY -= start.Image.Height;
				var colorB = end.Image.GetPixel(pixelX,slidePixelY);
				var colorA = PostProcessUtilities.GetCorrespondingColorFromPal(colorB,end.Palette,start.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
		}
	});

	this.RegisterTransitionEffect("slide_l", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var pixelOffset = -1 * Math.floor(start.Image.Width * (step / maxStep));
			var slidePixelX = pixelX + pixelOffset;

			if (slidePixelX >= 0) {
				var colorA = start.Image.GetPixel(slidePixelX,pixelY);
				var colorB = PostProcessUtilities.GetCorrespondingColorFromPal(colorA,start.Palette,end.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
			else {
				slidePixelX += start.Image.Width;
				var colorB = end.Image.GetPixel(slidePixelX,pixelY);
				var colorA = PostProcessUtilities.GetCorrespondingColorFromPal(colorB,end.Palette,start.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
		}
	});

	this.RegisterTransitionEffect("slide_r", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var pixelOffset = Math.floor(start.Image.Width * (step / maxStep));
			var slidePixelX = pixelX + pixelOffset;

			if (slidePixelX < start.Image.Width) {
				var colorA = start.Image.GetPixel(slidePixelX,pixelY);
				var colorB = PostProcessUtilities.GetCorrespondingColorFromPal(colorA,start.Palette,end.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
			else {
				slidePixelX -= start.Image.Width;
				var colorB = end.Image.GetPixel(slidePixelX,pixelY);
				var colorA = PostProcessUtilities.GetCorrespondingColorFromPal(colorB,end.Palette,start.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
			}
		}
	});

	this.RegisterTransitionEffect("wave", { // name? wave? distort? shiver?
		showPlayerStart : true,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var delta = (step / maxStep);
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
			return curImage.GetPixel(pixelX,pixelY);
		}
	});

	// TODO : try dithering?
	this.RegisterTransitionEffect("tunnel", {
		showPlayerStart : true,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var delta = (step / maxStep);

			if (delta <= 0.4) {
				var tunnelDelta = 1 - (delta / 0.4);

				var xDist = start.PlayerCenter.x - pixelX;
				var yDist = start.PlayerCenter.y - pixelY;
				var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (dist > start.Image.Width * tunnelDelta) {
					return {r:0,g:0,b:0,a:255};
				}
				else {
					return start.Image.GetPixel(pixelX,pixelY);
				}
			}
			else if (delta <= 0.6)
			{
				return {r:0,g:0,b:0,a:255};
			}
			else {
				var tunnelDelta = (delta - 0.6) / 0.4;

				var xDist = end.PlayerCenter.x - pixelX;
				var yDist = end.PlayerCenter.y - pixelY;
				var dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (dist > end.Image.Width * tunnelDelta) {
					return {r:0,g:0,b:0,a:255};
				}
				else {
					return end.Image.GetPixel(pixelX,pixelY);
				}
			}
		}
	});

	this.RegisterTransitionEffect("fuzz", {
		showPlayerStart : true,
		showPlayerEnd : true,
		pixelEffectFunc : function(start,end,pixelX,pixelY,step,maxStep) {
			var delta = (step / maxStep);
			var curImage = delta <= 0.5 ? start : end;
			var sampleSize = delta <= 0.5 ? (1 + Math.floor(15 * (delta/0.5))) : (16 - Math.floor(15 * ((delta-0.5)/0.5)));

			if (pixelX == 0 && pixelY == 0) {
				console.log("FUZZ SAMPLE " + sampleSize);
			}

			var paletteCount = {};
			var sampleX = Math.floor(pixelX / sampleSize) * sampleSize;
			var sampleY = Math.floor(pixelY / sampleSize) * sampleSize;
			for (var y = sampleY; y < sampleY + sampleSize; y++) {
				for (var x = sampleX; x < sampleX + sampleSize; x++) {
					var color = curImage.Image.GetPixel(x,y)
					var palIndex = PostProcessUtilities.GetColorPalIndex(color,curImage.Palette);
					if (palIndex != -1) {
						if (paletteCount[palIndex]) {
							paletteCount[palIndex] += (palIndex != 0) ? 1 : 0.4;
						}
						else {
							paletteCount[palIndex] = (palIndex != 0) ? 1 : 0.4;
						}
					}
				}
			}

			var palIndex = 0;
			var maxCount = 0;
			for (var i in paletteCount) {
				if (paletteCount[i] > maxCount) {
					palIndex = i;
					maxCount = paletteCount[i];
				}
			}

			return PostProcessUtilities.GetPalColor(curImage.Palette,palIndex);
		}
	});
}; // TransitionManager()


// TODO : extract the scale variable so it can be changed?
var PostProcessUtilities = {
	SamplePixelColor : function(image,x,y) {
		var pixelIndex = (y * scale * image.width * 4) + (x * scale * 4);
		var r = image.data[pixelIndex + 0];
		var g = image.data[pixelIndex + 1];
		var b = image.data[pixelIndex + 2];
		var a = image.data[pixelIndex + 3];
		return { r:r, g:g, b:b, a:a };
	},
	SetPixelColor : function(image,x,y,colorRgba) {
		for (var yDelta = 0; yDelta <= scale; yDelta++) {
			for (var xDelta = 0; xDelta <= scale; xDelta++) {
				var pixelIndex = (((y * scale) + yDelta) * image.width * 4) + (((x * scale) + xDelta) * 4);
				image.data[pixelIndex + 0] = colorRgba.r;
				image.data[pixelIndex + 1] = colorRgba.g;
				image.data[pixelIndex + 2] = colorRgba.b;
				image.data[pixelIndex + 3] = colorRgba.a;
			}
		}
	},
	LerpColor : function(colorA,colorB,t) {
		// TODO: move to color_util.js?
		return {
			r : colorA.r + ((colorB.r - colorA.r) * t),
			g : colorA.g + ((colorB.g - colorA.g) * t),
			b : colorA.b + ((colorB.b - colorA.b) * t),
			a : colorA.a + ((colorB.a - colorA.a) * t),
		};
	},
	GetColorPalIndex : function(colorIn,curPal) {
		var colorIndex = -1;

		for (var i = 0; i < curPal.length; i++) {
			if (colorIn.r == curPal[i][0] && colorIn.g == curPal[i][1] && colorIn.b == curPal[i][2]) {
				colorIndex = i;
			}
		}

		return colorIndex;
	},
	GetPalColor : function(palette,index) {
		return { r: palette[index][0], g: palette[index][1], b: palette[index][2], a: 255 }
	},
	GetCorrespondingColorFromPal : function(colorIn,curPal,otherPal) { // this is kind of hacky!
		var colorIndex = PostProcessUtilities.GetColorPalIndex(colorIn,curPal);

		if (colorIndex >= 0 && colorIndex <= otherPal.length) {
			return PostProcessUtilities.GetPalColor(otherPal,colorIndex);
		}
		else {
			return colorIn;
		}
	},
};

var PostProcessImage = function(imageData) {
	this.Width = imageData.width / scale;
	this.Height = imageData.height / scale;

	this.GetPixel = function(x,y) {
		return PostProcessUtilities.SamplePixelColor(imageData,x,y);
	};

	this.SetPixel = function(x,y,colorRgba) {
		PostProcessUtilities.SetPixelColor(imageData,x,y,colorRgba);
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