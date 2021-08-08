function ColorPicker( wheelId, selectId, sliderId, sliderBgId, hexTextId ) {
	var curColor = {
		h : 0,
		s : 0.5,
		v : 1.0,
	};

	var width = 200;
	var height = 200;
	var centerX = width / 2;
	var centerY = height / 2;
	var radius = 88;

	var selectCircleRadius = 10;
	var selectCircleLineWidth = 2;

	var self = this;

	this.setColor = function(r,g,b) { // TODO : can this be combined with the change color event better somehow??
		var rgbColor = { r:r, g:g, b:b };
		curColor = RGBtoHSV( rgbColor.r, rgbColor.g, rgbColor.b );

		var hueHsvColor = { h:curColor.h, s:1.0, v:1.0 };
		var hueRgbColor = HSVtoRGB( hueHsvColor );
		var rgbColorStr = "rgb(" + hueRgbColor.r + "," + hueRgbColor.g + "," + hueRgbColor.b + ")";
		sliderBg.style.background = "linear-gradient( to right, " + rgbColorStr + ", black )";

		var sliderBounds = sliderBg.getBoundingClientRect();
		var thumbBounds = slider.getBoundingClientRect();
		var sliderPosStart = thumbBounds.width;
		var sliderPosRange = sliderBounds.width - (2 * thumbBounds.width);
		var sliderCenterPos = sliderPosStart + ((1.0 - curColor.v) * sliderPosRange);
		var sliderThumbCenterOffset = (thumbBounds.width / 2) + 4; /* + extra for border */
		var sliderLeftPos = sliderCenterPos - sliderThumbCenterOffset;
		var sliderLeftStyle = sliderLeftPos + "px";
		slider.style.marginLeft = sliderLeftStyle;

		events.Raise("color_picker_change", { rgbColor: HSVtoRGB(curColor), isMouseUp: true });
	}

	function drawColorPickerWheel() {
		// bitsyLog("DRAW COLOR PICKER", "editor");

		wheelCanvas.width = width;
		wheelCanvas.height = height;

		// wheelContext.fillStyle = "green";
		// wheelContext.fillRect(0,0,width,height);

		wheelContext.fillStyle = 'black';

		for( var angle = 0; angle <= 360; angle += 1 ){
			var startAngle = ( angle - 2 ) * ( Math.PI / 180 );
			var endAngle = angle * ( Math.PI / 180 );

			wheelContext.beginPath();
			wheelContext.moveTo( centerX, centerY );
			wheelContext.arc( centerX, centerY, radius, startAngle, endAngle, false /*counter clockwise*/ );
			wheelContext.closePath();

			var color1 = HSVtoRGB( angle / 360, 0, curColor.v );
			var color2 = HSVtoRGB( angle / 360, 1, curColor.v );

			var gradient = wheelContext.createRadialGradient( centerX, centerY, 0, centerX, centerY, radius );
			gradient.addColorStop( 0, "rgb(" + color1.r + "," + color1.g + "," + color1.b + ")" );
			gradient.addColorStop( 1, "rgb(" + color2.r + "," + color2.g + "," + color2.b + ")" );

			wheelContext.fillStyle = gradient;
			wheelContext.fill();
		}

	}

	function drawColorPickerSelect() {
		selectCanvas.width = width;
		selectCanvas.height = height;

		// selectContext.fillStyle = "blue";
		// selectContext.fillRect(0,0,width,height);

		// bitsyLog(curColor.h, "editor");
		var hueRadians = curColor.h * ( Math.PI * 2 );
		var saturationDist = curColor.s * radius;
		// bitsyLog(saturationDist, "editor");
		var selectCircleX = centerX + ( Math.cos( hueRadians ) * saturationDist );
		var selectCircleY = centerY + ( Math.sin( hueRadians ) * saturationDist );

		var rgbColor = HSVtoRGB( curColor.h, curColor.s, curColor.v );
		var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";

		selectContext.beginPath();
		selectContext.arc(selectCircleX, selectCircleY, selectCircleRadius, 0, 2 * Math.PI, false);
		selectContext.fillStyle = rgbColorStr;
		selectContext.fill();
		selectContext.lineWidth = selectCircleLineWidth;
		selectContext.strokeStyle = curColor.v > 0.5 ? 'black' : 'white';
		selectContext.stroke();
	}


	function updateValue(e) {
		// bitsyLog(e.target.value, "editor");
		curColor.v = 1 - (e.target.value / 100);

		events.Raise("color_picker_change", { rgbColor: HSVtoRGB(curColor), isMouseUp: true });
	}

	function updateHexCode() {
		var rgbColor = HSVtoRGB( curColor );
		hexText.value = rgbToHex( rgbColor.r, rgbColor.g, rgbColor.b );
	}

	function changeHexCode(e) {
		// bitsyLog(e.target.value, "editor");
		var rgbColor = hexToRgb( e.target.value );
		if( rgbColor != null ) {
			self.setColor( rgbColor.r, rgbColor.g, rgbColor.b );
		}
		else {
			updateHexCode(); // change back to the current color if it's nonsense input
		}
	}

	var isMouseDown = false;
	function pickColor(e, isMouseUp) {
		if( isMouseUp == null || isMouseUp == undefined ) {
			isMouseUp = false;
		}

		// bitsyLog(isMouseDown, "editor");

		if(isMouseDown) {
			// bitsyLog(e, "editor");
			var bounds = selectCanvas.getBoundingClientRect();
			// bitsyLog(bounds, "editor");

			// bitsyLog("-- pick color --", "editor")

			var containerX = e.clientX - bounds.left;
			var containerY = e.clientY - bounds.top;

			var containerCenterX = bounds.width / 2;
			var containerCenterY = bounds.height / 2;
			var minContainerSize = Math.min( bounds.width, bounds.height );
			var containerSizeRatio = width / minContainerSize; // could be either dimension (if it's a square)
			var radiusRatio = radius / width;
			var containerRadius = minContainerSize * radiusRatio;

			// bitsyLog("center",containerCenterX,containerCenterY, "editor");

			var xRel = containerX - containerCenterX;
			var yRel = containerY - containerCenterY;

			// bitsyLog("rel",xRel,yRel, "editor");

			var dist = Math.sqrt( Math.pow( xRel, 2 ) + Math.pow( yRel, 2 ) );

			// bitsyLog("dist",dist, "editor");
			// bitsyLog("canvasRadius",containerRadius, "editor");

			var canvasX = centerX;
			var canvasY = centerY;

			if( dist >= containerRadius ) {
				var canvasXRel = ( xRel / dist ) * (radius - 1);
				var canvasYRel = ( yRel / dist ) * (radius - 1);

				canvasX = centerX + canvasXRel;
				canvasY = centerY + canvasYRel;

				dist = containerRadius - 1; // the minus one is to avoid hitting unfilled pixels
			}
			else {
				// return;
				// adjust X and Y coordinates to account for the "contain" algorithm used to center the color wheel (mobile)

				if( bounds.width > bounds.height ) {
					containerX -= (bounds.width - bounds.height) / 2;
				}
				else if( bounds.height > bounds.width ) {
					containerY -= (bounds.height - bounds.width) / 2;
				}

				canvasX = containerX * containerSizeRatio;
				canvasY = containerY * containerSizeRatio;
				// bitsyLog("ADJUSTED X Y",x, y, "editor");
			}

			if( dist < containerRadius ) {
				var pixelData = wheelContext.getImageData( canvasX, canvasY, 1, 1 ).data;
				var rgbColor = { r:pixelData[0], g:pixelData[1], b:pixelData[2] };
				curColor = RGBtoHSV( rgbColor.r, rgbColor.g, rgbColor.b );

				var hueHsvColor = { h:curColor.h, s:1.0, v:1.0 };
				var hueRgbColor = HSVtoRGB( hueHsvColor );
				var rgbColorStr = "rgb(" + hueRgbColor.r + "," + hueRgbColor.g + "," + hueRgbColor.b + ")";
				sliderBg.style.background = "linear-gradient( to right, " + rgbColorStr + ", black )";

				events.Raise("color_picker_change", { rgbColor: HSVtoRGB(curColor), isMouseUp: isMouseUp });
			}
		}
	}

	function pickColorStart(e) {
		e.preventDefault();
		isMouseDown = true;
		pickColor(e, false);
	}

	function pickColorEnd(e) {
		bitsyLog("color picker end", "editor");
		pickColor(e, true);
		isMouseDown = false;
	}

	function pickColorTouchMove(e) {
		// bitsyLog(e.touches[0], "editor");

		if (isMouseDown) {
			e.preventDefault();
			// update event to translate from touch-style to mouse-style structure
			e.clientX = e.touches[0].clientX;
			e.clientY = e.touches[0].clientY;
			pickColor(e, false);
		}
	}

	function pickColorTouchStart(e) {
		// bitsyLog(e.touches[0], "editor");
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		pickColorStart(e);
	}

	function pickColorTouchEnd(e) {
		// bitsyLog(e.touches[0], "editor");
		// pickColorEnd(e.touches[0]);

		if (isMouseDown) {
			e.preventDefault();

			events.Raise("color_picker_change", { rgbColor: HSVtoRGB(curColor), isMouseUp: true });

			isMouseDown = false;
		}
	}

	var isSliderMouseDown = false;
	function pickValue(e, isMouseUp) {
		if( isMouseUp == null || isMouseUp == undefined ) {
			isMouseUp = false;
		}

		if (isSliderMouseDown) {
			// bitsyLog("VALUE", "editor");
			var sliderBounds = sliderBg.getBoundingClientRect();
			var thumbBounds = slider.getBoundingClientRect();

			var containerX = e.clientX - sliderBounds.left;
			var xPercent = containerX / (sliderBounds.width);

			// bitsyLog("PERCENT " + xPercent, "editor");

			curColor.v = 1.0 - xPercent;
			if (curColor.v < 0) {
				curColor.v = 0;
			}
			else if (curColor.v > 1.0) {
				curColor.v = 1.0;
			}

			// bitsyLog("PERCENT " + curColor.v, "editor");

			var sliderPosStart = thumbBounds.width;
			var sliderPosRange = sliderBounds.width - (2 * thumbBounds.width);
			var sliderCenterPos = sliderPosStart + ((1.0 - curColor.v) * sliderPosRange);
			var sliderThumbCenterOffset = (thumbBounds.width / 2) * 1.5;
			var sliderLeftPos = sliderCenterPos - sliderThumbCenterOffset;
			var sliderLeftStyle = sliderLeftPos + "px";
			slider.style.marginLeft = sliderLeftStyle;

			events.Raise("color_picker_change", { rgbColor: HSVtoRGB(curColor), isMouseUp: isMouseUp });
		}
	}

	function pickValueStart(e) {
		// bitsyLog("VALUE START", "editor");
		isSliderMouseDown = true;
		pickValue(e,false);
	}

	function pickValueEnd(e) {
		if (isSliderMouseDown) {
			// bitsyLog("VALUE END", "editor");
			pickValue(e,true);
			isSliderMouseDown = false;
		}
	}

	function pickValueTouchMove(e) {
		if (isSliderMouseDown) {
			e.preventDefault();
			// update event to translate from touch-style to mouse-style structure
			e.clientX = e.touches[0].clientX;
			e.clientY = e.touches[0].clientY;
			pickValue(e, false);
		}
	}

	function pickValueTouchStart(e) {
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		pickValueStart(e);
	}

	function pickValueTouchEnd(e) {
		if (isSliderMouseDown) {
			e.preventDefault();

			events.Raise("color_picker_change", { rgbColor: HSVtoRGB(curColor), isMouseUp: true });

			isSliderMouseDown = false;
		}
	}

	var wheelCanvas;
	var wheelContext;
	var selectCanvas;
	var selectContext;
	var slider;
	var sliderBg;
	var hexText;

	function initColorWheel() {
		// bitsyLog(wheelId, "editor");
		// bitsyLog(document, "editor");
		// bitsyLog(document.getElementById(wheelId), "editor");
		wheelCanvas = document.getElementById(wheelId);
		wheelContext = wheelCanvas.getContext("2d");

		selectCanvas = document.getElementById(selectId);
		selectContext = selectCanvas.getContext("2d");

		selectCanvas.addEventListener("mousedown", pickColorStart);
		document.addEventListener("mousemove", pickColor);
		document.addEventListener("mouseup", pickColorEnd);

		selectCanvas.addEventListener('touchstart', pickColorTouchStart);
		document.addEventListener('touchmove', pickColorTouchMove);
		document.addEventListener('touchend', pickColorTouchEnd);

		slider = document.getElementById(sliderId);

		sliderBg = document.getElementById(sliderBgId);
		sliderBg.addEventListener("mousedown", pickValueStart);
		document.addEventListener("mousemove", pickValue);
		document.addEventListener("mouseup", pickValueEnd);
		sliderBg.addEventListener("touchstart", pickValueTouchStart);
		document.addEventListener("touchmove", pickValueTouchMove);
		document.addEventListener("touchend", pickValueTouchEnd);

		hexText = document.getElementById(hexTextId);
		hexText.addEventListener( "change", changeHexCode );

		events.Listen("color_picker_change", function(event) {
			if (event.isMouseUp) {
				// TODO - can I update this live for desktop layouts?
				drawColorPickerWheel();
			}
			drawColorPickerSelect();
			updateHexCode();
		});

		self.setColor(255,0,0);
	}

	initColorWheel();
}