/*
TODO:
X make multiple transitions choose-able
- test fancy transitions (wave, etc)
X make wrapper objects for image data
X only run pixel func on frame step
- in sliding transition.. lerp colors (that would be cool!)
*/

var TransitionManager = function() {
	var startImage = null;
	var endImage = null;
	var effectImage = null;

	var isTransitioning = false;
	var transitionTime = 0; // Ms
	var maxTransitionTime = 500; //Ms // TODO : pick final speed

	var maxStep = 4; // TODO : pick final "chunkiness"
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
		startImage = new PostProcessImage( ctx.getImageData(0,0,canvas.width,canvas.height), startPalette ); // TODO : don't use global ctx?

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
		endImage = new PostProcessImage( ctx.getImageData(0,0,canvas.width,canvas.height), endPalette );

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
					var color = transitionEffects[curEffect].pixelEffectFunc(startImage,endImage,x,y,step,maxStep);
					effectImage.SetPixel(x,y,color);
				}
			}
		}
		prevStep = step;

		ctx.putImageData(effectImage.GetData(), 0, 0);

		if (transitionTime >= maxTransitionTime) {
			isTransitioning = false;
			transitionTime = 0;
			startImage = null;
			endImage = null;
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
	this.RegisterTransitionEffect("fade_white", { // TODO : have it linger on full white briefly?
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(startImage,endImage,pixelX,pixelY,step,maxStep) {
			var pixelDelta = step / maxStep;

			var pixelColorA = pixelDelta < 0.5 ? startImage.GetPixel(pixelX,pixelY) : {r:255,g:255,b:255,a:255};
			var pixelColorB = pixelDelta < 0.5 ? {r:255,g:255,b:255,a:255} : endImage.GetPixel(pixelX,pixelY);

			pixelDelta = pixelDelta < 0.5 ? (pixelDelta / 0.5) : ((pixelDelta - 0.5) / 0.5); // hacky

			return PostProcessUtilities.LerpColor(pixelColorA, pixelColorB, pixelDelta);
		}
	});

	this.RegisterTransitionEffect("fade_black", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(startImage,endImage,pixelX,pixelY,step,maxStep) {
			var pixelDelta = step / maxStep;

			var pixelColorA = pixelDelta < 0.5 ? startImage.GetPixel(pixelX,pixelY) : {r:0,g:0,b:0,a:255};
			var pixelColorB = pixelDelta < 0.5 ? {r:0,g:0,b:0,a:255} : endImage.GetPixel(pixelX,pixelY);

			pixelDelta = pixelDelta < 0.5 ? (pixelDelta / 0.5) : ((pixelDelta - 0.5) / 0.5); // hacky

			return PostProcessUtilities.LerpColor(pixelColorA, pixelColorB, pixelDelta);
		}
	});

	this.RegisterTransitionEffect("cross_fade", {
		showPlayerStart : true,
		showPlayerEnd : true,
		pixelEffectFunc : function(startImage,endImage,pixelX,pixelY,step,maxStep) {
			var pixelDelta = step / maxStep;

			var pixelColorA = startImage.GetPixel(pixelX,pixelY);
			var pixelColorB = endImage.GetPixel(pixelX,pixelY);

			return PostProcessUtilities.LerpColor(pixelColorA, pixelColorB, pixelDelta);
		}
	});

	this.RegisterTransitionEffect("slide_from_right", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(startImage,endImage,pixelX,pixelY,step,maxStep) {
			var pixelOffset = Math.floor(startImage.Width * (step / maxStep));
			var slidePixelX = pixelX + pixelOffset;

			if (slidePixelX < startImage.Width) {
				var colorA = startImage.GetPixel(slidePixelX,pixelY);
				var colorB = PostProcessUtilities.GetCorrespondingColorFromPal(colorA,startImage.Palette,endImage.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
				// return startImage.GetPixel(slidePixelX,pixelY);
			}
			else {
				slidePixelX -= startImage.Width;
				var colorB = endImage.GetPixel(slidePixelX,pixelY);
				var colorA = PostProcessUtilities.GetCorrespondingColorFromPal(colorB,endImage.Palette,startImage.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
				// return endImage.GetPixel(slidePixelX,pixelY);
			}
		}
	});

	this.RegisterTransitionEffect("slide_from_left", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(startImage,endImage,pixelX,pixelY,step,maxStep) {
			var pixelOffset = -1 * Math.floor(startImage.Width * (step / maxStep));
			var slidePixelX = pixelX + pixelOffset;

			if (slidePixelX >= 0) {
				var colorA = startImage.GetPixel(slidePixelX,pixelY);
				var colorB = PostProcessUtilities.GetCorrespondingColorFromPal(colorA,startImage.Palette,endImage.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
				// return startImage.GetPixel(slidePixelX,pixelY);
			}
			else {
				slidePixelX += startImage.Width;
				var colorB = endImage.GetPixel(slidePixelX,pixelY);
				var colorA = PostProcessUtilities.GetCorrespondingColorFromPal(colorB,endImage.Palette,startImage.Palette);
				var colorLerped = PostProcessUtilities.LerpColor(colorA, colorB, step / maxStep);
				return colorLerped;
				// return endImage.GetPixel(slidePixelX,pixelY);
			}
		}
	});

	this.RegisterTransitionEffect("wave", {
		showPlayerStart : false,
		showPlayerEnd : true,
		pixelEffectFunc : function(startImage,endImage,pixelX,pixelY,step,maxStep) {
			var delta = (step / maxStep);
			var waveDelta = delta < 0.5 ? delta / 0.5 : 1 - ((delta - 0.5) / 0.5);

			var offset = (pixelY + (waveDelta * waveDelta * 0.2 * startImage.Height));
			var freq = 4;
			var size = 2 + (14 * waveDelta);
			pixelX += Math.floor(Math.sin(offset / freq) * size);

			if (pixelX < 0) {
				pixelX += startImage.Width;
			}
			else if (pixelX >= startImage.Width) {
				pixelX -= startImage.Width;
			}

			var curImage = delta < 0.5 ? startImage : endImage;
			return curImage.GetPixel(pixelX,pixelY);

			// return transitionEffects["cross_fade"].pixelEffectFunc(startImage,endImage,pixelX,pixelY,step,maxStep);
			
			// return startImage.GetPixel(pixelX,pixelY);
			
			// TODO: try this
			//return PostProcessUtilities.LerpColor( startImage.GetPixel(pixelX,pixelY), {r:255,g:255,b:255,a:255}, d*d*d );
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
	GetCorrespondingColorFromPal : function(colorIn,curPal,otherPal) { // this is kind of hacky!
		var colorIndex = -1;

		for (var i = 0; i < curPal.length; i++) {
			if (colorIn.r == curPal[i][0] && colorIn.g == curPal[i][1] && colorIn.b == curPal[i][2]) {
				colorIndex = i;
			}
		}

		if (colorIndex >= 0 && colorIndex <= otherPal.length) {
			return { r: otherPal[colorIndex][0], g: otherPal[colorIndex][1], b: otherPal[colorIndex][2], a: 255 };
		}
		else {
			return colorIn;
		}
	},
};

var PostProcessImage = function(imageData, palette) {
	this.Width = imageData.width / scale;
	this.Height = imageData.height / scale;

	this.Palette = palette;

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