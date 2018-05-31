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

	this.setColor = function(r,g,b) {
		var rgbColor = { r:r, g:g, b:b };
		curColor = RGBtoHSV( rgbColor.r, rgbColor.g, rgbColor.b );

		var hueHsvColor = { h:curColor.h, s:1.0, v:1.0 };
		var hueRgbColor = HSVtoRGB( hueHsvColor );
		var rgbColorStr = "rgb(" + hueRgbColor.r + "," + hueRgbColor.g + "," + hueRgbColor.b + ")";
		sliderBg.style.background = "linear-gradient( to right, " + rgbColorStr + ", black )";
		slider.value = (1 - curColor.v) * 100;

		drawColorPickerWheel();
		drawColorPickerSelect();
		updateHexCode();
	}

	this.onColorChange = null;

	function drawColorPickerWheel() {

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

		// console.log(curColor.h);
		var hueRadians = curColor.h * ( Math.PI * 2 );
		var saturationDist = curColor.s * radius;
		// console.log(saturationDist);
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
		// console.log(e.target.value);
		curColor.v = 1 - (e.target.value / 100);

		if( self.onColorChange != null )
			self.onColorChange( HSVtoRGB( curColor ), true );

		drawColorPickerWheel();
		drawColorPickerSelect();
		updateHexCode();
	}

	function updateHexCode() {
		var rgbColor = HSVtoRGB( curColor );
		hexText.value = rgbToHex( rgbColor.r, rgbColor.g, rgbColor.b );
	}

	function changeHexCode(e) {
		// console.log(e.target.value);
		var rgbColor = hexToRgb( e.target.value );
		if( rgbColor != null ) {
			self.setColor( rgbColor.r, rgbColor.g, rgbColor.b );

			if( self.onColorChange != null )
				self.onColorChange( rgbColor, true );
		}
		else {
			updateHexCode(); // change back to the current color if it's nonsense input
		}
	}

	var isMouseDown = false;
	function pickColor(e, isMouseUp) {
		if( isMouseUp == null || isMouseUp == undefined )
			isMouseUp = false;

		// console.log(isMouseDown);

		if(isMouseDown) {
			// console.log(e);
			var bounds = selectCanvas.getBoundingClientRect();
			// console.log(bounds);

			// console.log("-- pick color --")

			var containerX = e.clientX - bounds.left;
			var containerY = e.clientY - bounds.top;

			var containerCenterX = bounds.width / 2;
			var containerCenterY = bounds.height / 2;
			var minContainerSize = Math.min( bounds.width, bounds.height );
			var containerSizeRatio = width / minContainerSize; // could be either dimension (if it's a square)
			var radiusRatio = radius / width;
			var containerRadius = minContainerSize * radiusRatio;

			// console.log("center",containerCenterX,containerCenterY);

			var xRel = containerX - containerCenterX;
			var yRel = containerY - containerCenterY;

			// console.log("rel",xRel,yRel);

			var dist = Math.sqrt( Math.pow( xRel, 2 ) + Math.pow( yRel, 2 ) );

			// console.log("dist",dist);
			// console.log("canvasRadius",containerRadius);

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
				// console.log("ADJUSTED X Y",x, y);
			}

			if( dist < containerRadius ) {
				var pixelData = wheelContext.getImageData( canvasX, canvasY, 1, 1 ).data;
				var rgbColor = { r:pixelData[0], g:pixelData[1], b:pixelData[2] };
				curColor = RGBtoHSV( rgbColor.r, rgbColor.g, rgbColor.b );

				var hueHsvColor = { h:curColor.h, s:1.0, v:1.0 };
				var hueRgbColor = HSVtoRGB( hueHsvColor );
				var rgbColorStr = "rgb(" + hueRgbColor.r + "," + hueRgbColor.g + "," + hueRgbColor.b + ")";
				sliderBg.style.background = "linear-gradient( to right, " + rgbColorStr + ", black )";

				if( self.onColorChange != null )
					self.onColorChange( rgbColor, isMouseUp );
			}

			drawColorPickerSelect();
			updateHexCode();
		}
	}

	function pickColorStart(e) {
		isMouseDown = true;
		pickColor(e, false);
	}

	function pickColorEnd(e) {
		// console.log("mouseup");
		pickColor(e, true);
		isMouseDown = false;
	}

	function pickColorTouchMove(e) {
		// console.log(e.touches[0]);
		// e.preventDefault();
		pickColor(e.touches[0], true);
	}

	function pickColorTouchStart(e) {
		// console.log(e.touches[0]);
		// e.preventDefault();
		pickColorStart(e.touches[0]);
	}

	function pickColorTouchEnd(e) {
		// console.log(e.touches[0]);
		// pickColorEnd(e.touches[0]);
		// e.preventDefault();
		isMouseDown = false;
	}

	var wheelCanvas;
	var wheelContext;
	var selectCanvas;
	var selectContext;
	var slider;
	var sliderBg;
	var hexText;

	function initColorWheel() {
		// console.log(wheelId);
		// console.log(document);
		// console.log(document.getElementById(wheelId));
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
		// slider.addEventListener("input", updateValue); // perf in safari isn't good enough for live update during slider
		slider.addEventListener("change", updateValue);

		sliderBg = document.getElementById(sliderBgId);

		hexText = document.getElementById(hexTextId);
		hexText.addEventListener( "change", changeHexCode );

		self.setColor(255,0,0);
	}

	initColorWheel();
}