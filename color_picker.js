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

	function drawColorPickerWheel() {

		wheelCanvas.width = width;
		wheelCanvas.height = height;

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
		selectContext.lineWidth = 2;
		selectContext.strokeStyle = curColor.v > 0.5 ? 'black' : 'white';
		selectContext.stroke();
	}


	function updateValue(e) {
		// console.log(e.target.value);
		curColor.v = 1 - (e.target.value / 100);
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
		if( rgbColor != null )
			setColor( rgbColor.r, rgbColor.g, rgbColor.b );
		else
			updateHexCode(); // change back to the current color if it's nonsense input
	}

	var isMouseDown = false;
	function pickColor(e) {
		if(isMouseDown) {
			// console.log(e);
			var bounds = wheelCanvas.getBoundingClientRect();
			var x = e.clientX - bounds.left;
			var y = e.clientY - bounds.top;

			var xRel = x - centerX;
			var yRel = y - centerY;

			var dist = Math.sqrt( Math.pow( xRel, 2 ) + Math.pow( yRel, 2 ) );

			if( dist >= radius ) {
				xRel = ( xRel / dist ) * (radius - 1);
				yRel = ( yRel / dist ) * (radius - 1);

				x = centerX + xRel;
				y = centerY + yRel;

				dist = radius - 1; // the minus one is to avoid hitting unfilled pixels
			}

			if( dist < radius ) {
				var pixelData = wheelContext.getImageData( x, y, 1, 1 ).data;
				var rgbColor = { r:pixelData[0], g:pixelData[1], b:pixelData[2] };
				curColor = RGBtoHSV( rgbColor.r, rgbColor.g, rgbColor.b );

				var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
				sliderBg.style.background = "linear-gradient( to right, " + rgbColorStr + ", black )";
			}

			drawColorPickerSelect();
			updateHexCode();
		}
	}

	function setColor(r,g,b) {
		var rgbColor = { r:r, g:g, b:b };
		curColor = RGBtoHSV( rgbColor.r, rgbColor.g, rgbColor.b );

		var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
		sliderBg.style.background = "linear-gradient( to right, " + rgbColorStr + ", black )";
		slider.value = (1 - curColor.v) * 100;

		drawColorPickerWheel();
		drawColorPickerSelect();
	}

	function pickColorStart(e) {
		isMouseDown = true;
		pickColor(e);
	}

	function pickColorEnd(e) {
		pickColor(e);
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
		wheelCanvas = document.getElementById(wheelId);
		wheelContext = wheelCanvas.getContext("2d");

		selectCanvas = document.getElementById(selectId);
		selectContext = selectCanvas.getContext("2d");

		selectCanvas.addEventListener("mousedown", pickColorStart);
		document.addEventListener("mousemove", pickColor);
		document.addEventListener("mouseup", pickColorEnd);

		slider = document.getElementById(sliderId);
		// slider.addEventListener("input", updateValue); // perf in safari isn't good enough for live update during slider
		slider.addEventListener("change", updateValue);

		sliderBg = document.getElementById(sliderBgId);

		hexText = document.getElementById(hexTextId);
		hexText.addEventListener( "change", changeHexCode );

		setColor(255,0,0);
	}

	initColorWheel();
}