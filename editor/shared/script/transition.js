/*
TODO:
- make multiple transitions choose-able
- test fancy transitions (wave, etc)
- make wrapper objects for image data
- only run pixel func on frame step
*/

var TransitionManager = function() {
	var startImage = null;
	var endImage = null;
	var effectImage = null;

	var isTransitioning = false;
	var transitionTime = 0; // Ms
	var maxTransitionTime = 500; //Ms // TODO : pick final speed

	var maxStep = 6; // TODO : pick final "chunkiness"

	/* CROSS FADE */
	// var pixelTransitionFunc = function(startImage,endImage,effectImage,pixelX,pixelY,step,maxStep) {
	// 	var pixelDelta = step / maxStep;
	// 	var pixelColorA = TransitionHelper.SamplePixelColor(startImage,pixelX,pixelY);
	// 	var pixelColorB = TransitionHelper.SamplePixelColor(endImage,pixelX,pixelY);

	// 	var pixelColor = {
	// 		r : pixelColorA.r + ((pixelColorB.r - pixelColorA.r) * pixelDelta),
	// 		g : pixelColorA.g + ((pixelColorB.g - pixelColorA.g) * pixelDelta),
	// 		b : pixelColorA.b + ((pixelColorB.b - pixelColorA.b) * pixelDelta),
	// 		a : pixelColorA.a + ((pixelColorB.a - pixelColorA.a) * pixelDelta),
	// 	};

	/* FADE BLACK */
	// 	TransitionHelper.SetPixelColor(effectImage,pixelX,pixelY,pixelColor);
	// };

	// var pixelTransitionFunc = function(startImage,endImage,effectImage,pixelX,pixelY,step,maxStep) {
	// 	var pixelDelta = step / maxStep;

	// 	var pixelColorA = pixelDelta < 0.5 ? TransitionHelper.SamplePixelColor(startImage,pixelX,pixelY) : {r:0,g:0,b:0,a:255};
	// 	var pixelColorB = pixelDelta < 0.5 ? {r:0,g:0,b:0,a:255} : TransitionHelper.SamplePixelColor(endImage,pixelX,pixelY);

	// 	pixelDelta = pixelDelta < 0.5 ? (pixelDelta / 0.5) : ((pixelDelta - 0.5) / 0.5); // hacky

	// 	var pixelColor = {
	// 		r : pixelColorA.r + ((pixelColorB.r - pixelColorA.r) * pixelDelta),
	// 		g : pixelColorA.g + ((pixelColorB.g - pixelColorA.g) * pixelDelta),
	// 		b : pixelColorA.b + ((pixelColorB.b - pixelColorA.b) * pixelDelta),
	// 		a : pixelColorA.a + ((pixelColorB.a - pixelColorA.a) * pixelDelta),
	// 	};

	// 	TransitionHelper.SetPixelColor(effectImage,pixelX,pixelY,pixelColor);
	// };

	/* FADE WHITE */
	var pixelTransitionFunc = function(startImage,endImage,effectImage,pixelX,pixelY,step,maxStep) {
		var pixelDelta = step / maxStep;

		var pixelColorA = pixelDelta < 0.5 ? TransitionHelper.SamplePixelColor(startImage,pixelX,pixelY) : {r:255,g:255,b:255,a:255};
		var pixelColorB = pixelDelta < 0.5 ? {r:255,g:255,b:255,a:255} : TransitionHelper.SamplePixelColor(endImage,pixelX,pixelY);

		pixelDelta = pixelDelta < 0.5 ? (pixelDelta / 0.5) : ((pixelDelta - 0.5) / 0.5); // hacky

		var pixelColor = {
			r : pixelColorA.r + ((pixelColorB.r - pixelColorA.r) * pixelDelta),
			g : pixelColorA.g + ((pixelColorB.g - pixelColorA.g) * pixelDelta),
			b : pixelColorA.b + ((pixelColorB.b - pixelColorA.b) * pixelDelta),
			a : pixelColorA.a + ((pixelColorB.a - pixelColorA.a) * pixelDelta),
		};

		TransitionHelper.SetPixelColor(effectImage,pixelX,pixelY,pixelColor);
	};

	this.BeginTransition = function(startRoom,startX,startY,endRoom,endX,endY,transitionInfo) {
		// var tmpRoom = curRoom;
		var tmpRoom = player().room;
		var tmpX = player().x;
		var tmpY = player().y;

		// curRoom = startRoom; // question: do I need to use curRoom??
		if (transitionInfo.showPlayerStart) {
			player().room = startRoom;
			player().x = startX;
			player().y = startY;
		}
		else {
			player().room = "_transition_none"; // kind of hacky!!
		}

		drawRoom(room[startRoom]);
		startImage = ctx.getImageData(0,0,canvas.width,canvas.height); // TODO : don't use global ctx?

		if (transitionInfo.showPlayerEnd) {
			player().room = endRoom;
			player().x = endX;
			player().y = endY;
		}
		else {
			player().room = "_transition_none";
		}

		drawRoom(room[endRoom]);
		endImage = ctx.getImageData(0,0,canvas.width,canvas.height);

		effectImage = ctx.createImageData(canvas.width,canvas.height);

		isTransitioning = true;
		transitionTime = 0;

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

		// clear screen! (necessary?)
		ctx.fillStyle = "rgb(" + getPal(curPal())[0][0] + "," + getPal(curPal())[0][1] + "," + getPal(curPal())[0][2] + ")";
		ctx.fillRect(0,0,canvas.width,canvas.height);

		var w = effectImage.width / scale;
		var h = effectImage.height / scale;
		var step = Math.floor(transitionDelta * maxStep); // TODO : only update on step change!
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				pixelTransitionFunc(startImage,endImage,effectImage,x,y,step,maxStep);
			}
		}

		ctx.putImageData(effectImage, 0, 0);

		if (transitionTime >= maxTransitionTime) {
			isTransitioning = false;
			transitionTime = 0;
			startImage = null;
			endImage = null;
			effectImage = null;
		}
	}

	this.IsTransitionActive = function() {
		return isTransitioning;
	}
}

var TransitionHelper = {
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
	}
}