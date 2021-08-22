/* logging */
var DebugLogCategory = {
	bitsy : false,
	editor : false,
};

/* input */
var key = {
	left : 37,
	right : 39,
	up : 38,
	down : 40,
	space : 32,
	enter : 13,
	w : 87,
	a : 65,
	s : 83,
	d : 68,
	r : 82,
	shift : 16,
	ctrl : 17,
	alt : 18,
	cmd : 224
};

var InputManager = function() {
	var self = this;

	var pressed;
	var ignored;
	var touchState;

	var SwipeDir = {
		None : -1,
		Up : 0,
		Down : 1,
		Left : 2,
		Right : 3,
	};

	function resetAll() {
		pressed = {};
		ignored = {};

		touchState = {
			isDown : false,
			startX : 0,
			startY : 0,
			curX : 0,
			curY : 0,
			swipeDistance : 30,
			swipeDirection : SwipeDir.None,
			tapReleased : false
		};
	}
	resetAll();

	function stopWindowScrolling(e) {
		if(e.keyCode == key.left || e.keyCode == key.right || e.keyCode == key.up || e.keyCode == key.down || !isPlayerEmbeddedInEditor)
			e.preventDefault();
	}

	function tryRestartGame(e) {
		/* RESTART GAME */
		if ( e.keyCode === key.r && ( e.getModifierState("Control") || e.getModifierState("Meta") ) ) {
			if ( confirm("Restart the game?") ) {
				reset_cur_game();
			}
		}
	}

	function eventIsModifier(event) {
		return (event.keyCode == key.shift || event.keyCode == key.ctrl || event.keyCode == key.alt || event.keyCode == key.cmd);
	}

	function isModifierKeyDown() {
		return ( self.isKeyDown(key.shift) || self.isKeyDown(key.ctrl) || self.isKeyDown(key.alt) || self.isKeyDown(key.cmd) );
	}

	this.ignoreHeldKeys = function() {
		for (var key in pressed) {
			if (pressed[key]) { // only ignore keys that are actually held
				ignored[key] = true;
				// bitsyLog("IGNORE -- " + key);
			}
		}
	}

	this.onkeydown = function(event) {
		// bitsyLog("KEYDOWN -- " + event.keyCode);

		stopWindowScrolling(event);

		tryRestartGame(event);

		// Special keys being held down can interfere with keyup events and lock movement
		// so just don't collect input when they're held
		{
			if (isModifierKeyDown()) {
				return;
			}

			if (eventIsModifier(event)) {
				resetAll();
			}
		}

		if (ignored[event.keyCode]) {
			return;
		}

		pressed[event.keyCode] = true;
		ignored[event.keyCode] = false;
	}

	this.onkeyup = function(event) {
		// bitsyLog("KEYUP -- " + event.keyCode);
		pressed[event.keyCode] = false;
		ignored[event.keyCode] = false;
	}

	this.ontouchstart = function(event) {
		event.preventDefault();

		if( event.changedTouches.length > 0 ) {
			touchState.isDown = true;

			touchState.startX = touchState.curX = event.changedTouches[0].clientX;
			touchState.startY = touchState.curY = event.changedTouches[0].clientY;

			touchState.swipeDirection = SwipeDir.None;
		}
	}

	this.ontouchmove = function(event) {
		event.preventDefault();

		if( touchState.isDown && event.changedTouches.length > 0 ) {
			touchState.curX = event.changedTouches[0].clientX;
			touchState.curY = event.changedTouches[0].clientY;

			var prevDirection = touchState.swipeDirection;

			if( touchState.curX - touchState.startX <= -touchState.swipeDistance ) {
				touchState.swipeDirection = SwipeDir.Left;
			}
			else if( touchState.curX - touchState.startX >= touchState.swipeDistance ) {
				touchState.swipeDirection = SwipeDir.Right;
			}
			else if( touchState.curY - touchState.startY <= -touchState.swipeDistance ) {
				touchState.swipeDirection = SwipeDir.Up;
			}
			else if( touchState.curY - touchState.startY >= touchState.swipeDistance ) {
				touchState.swipeDirection = SwipeDir.Down;
			}

			if( touchState.swipeDirection != prevDirection ) {
				// reset center so changing directions is easier
				touchState.startX = touchState.curX;
				touchState.startY = touchState.curY;
			}
		}
	}

	this.ontouchend = function(event) {
		event.preventDefault();

		touchState.isDown = false;

		if( touchState.swipeDirection == SwipeDir.None ) {
			// tap!
			touchState.tapReleased = true;
		}

		touchState.swipeDirection = SwipeDir.None;
	}

	this.isKeyDown = function(keyCode) {
		return pressed[keyCode] != null && pressed[keyCode] == true && (ignored[keyCode] == null || ignored[keyCode] == false);
	}

	this.anyKeyDown = function() {
		var anyKey = false;

		for (var key in pressed) {
			if (pressed[key] && (ignored[key] == null || ignored[key] == false) &&
				!(key === key.up || key === key.down || key === key.left || key === key.right) &&
				!(key === key.w || key === key.s || key === key.a || key === key.d)) {
				// detected that a key other than the d-pad keys are down!
				anyKey = true;
			}
		}

		return anyKey;
	}

	this.swipeLeft = function() {
		return touchState.swipeDirection == SwipeDir.Left;
	}

	this.swipeRight = function() {
		return touchState.swipeDirection == SwipeDir.Right;
	}

	this.swipeUp = function() {
		return touchState.swipeDirection == SwipeDir.Up;
	}

	this.swipeDown = function() {
		return touchState.swipeDirection == SwipeDir.Down;
	}

	this.isTapReleased = function() {
		return touchState.tapReleased;
	}

	this.resetTapReleased = function() {
		touchState.tapReleased = false;
	}

	this.onblur = function() {
		// bitsyLog("~~~ BLUR ~~");
		resetAll();
	}
}

var input = new InputManager();

/* events */
var onLoadFunction = null;
var onQuitFunction = null;
var onUpdateFunction = null;
var updateInterval = null;

function loadGame(gameData) {
	document.addEventListener('keydown', input.onkeydown);
	document.addEventListener('keyup', input.onkeyup);

	if (isPlayerEmbeddedInEditor) {
		canvas.addEventListener('touchstart', input.ontouchstart, {passive:false});
		canvas.addEventListener('touchmove', input.ontouchmove, {passive:false});
		canvas.addEventListener('touchend', input.ontouchend, {passive:false});
	}
	else {
		// creates a 'touchTrigger' element that covers the entire screen and can universally have touch event listeners added w/o issue.

		// we're checking for existing touchTriggers both at game start and end, so it's slightly redundant.
		var existingTouchTrigger = document.querySelector('#touchTrigger');

		if (existingTouchTrigger === null) {
			var touchTrigger = document.createElement("div");
			touchTrigger.setAttribute("id","touchTrigger");

			// afaik css in js is necessary here to force a fullscreen element
			touchTrigger.setAttribute(
				"style","position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden;"
			);

			document.body.appendChild(touchTrigger);

			touchTrigger.addEventListener('touchstart', input.ontouchstart);
			touchTrigger.addEventListener('touchmove', input.ontouchmove);
			touchTrigger.addEventListener('touchend', input.ontouchend);
		}
	}

	window.onblur = input.onblur;

	if (onLoadFunction) {
		onLoadFunction(gameData);
	}

	updateInterval = setInterval(
		function() {
			if (onUpdateFunction) {
				onUpdateFunction();
			}

			if (curGraphicsMode === 0) {
				// show screen buffer
				ctx.putImageData(drawingBuffers[screenBufferId].img, 0, 0);
			}

			input.resetTapReleased();
		},
		16);
}

function quitGame() {
	document.removeEventListener('keydown', input.onkeydown);
	document.removeEventListener('keyup', input.onkeyup);

	if (isPlayerEmbeddedInEditor) {
		canvas.removeEventListener('touchstart', input.ontouchstart);
		canvas.removeEventListener('touchmove', input.ontouchmove);
		canvas.removeEventListener('touchend', input.ontouchend);
	}
	else {
		//check for touchTrigger and removes it

		var existingTouchTrigger = document.querySelector('#touchTrigger');

		if (existingTouchTrigger !== null) {
			existingTouchTrigger.removeEventListener('touchstart', input.ontouchstart);
			existingTouchTrigger.removeEventListener('touchmove', input.ontouchmove);
			existingTouchTrigger.removeEventListener('touchend', input.ontouchend);

			existingTouchTrigger.parentElement.removeChild(existingTouchTrigger);
		}
	}

	window.onblur = null;

	if (onQuitFunction) {
		onQuitFunction();
	}

	clearInterval(updateInterval);
}

/* graphics */
var textScale = 2; // todo : move tile scale into here too?

var curGraphicsMode = 0;
var curBufferId = -1; // note: -1 is invalid
var systemPalette = [];
var drawingBuffers = [];

var screenBufferId = 0;
var textboxBufferId = 1;
var tileStartBufferId = 2;
var nextBufferId = tileStartBufferId;

var textboxWidth = 0;
var textboxHeight = 0;

function hackForEditor_GetImageFromTileId(tileId) {
	return drawingBuffers[tileId].canvas;
}

/* ==== */
function bitsyLog(message, category) {
	if (!category) {
		category = "bitsy";
	}

	if (DebugLogCategory[category] === true) {
		console.log(category + "::" + message);
	}
}

function bitsyButton(buttonCode) {
	switch (buttonCode) {
		case 0: // UP
			return (input.isKeyDown(key.up) || input.isKeyDown(key.w) || input.swipeUp());
		case 1: // DOWN
			return (input.isKeyDown(key.down) || input.isKeyDown(key.s) || input.swipeDown());
		case 2: // LEFT
			return (input.isKeyDown(key.left) || input.isKeyDown(key.a) || input.swipeLeft());
		case 3: // RIGHT
			return ((input.isKeyDown(key.right) || input.isKeyDown(key.d) || input.swipeRight()));
		case 4: // OK (equivalent to "any key" on the keyboard or "tap" on touch screen)
			return (input.anyKeyDown() || input.isTapReleased());
	}

	return false;
}

// two modes (0 == pixel mode, 1 == tile mode)
function bitsySetGraphicsMode(mode) {
	curGraphicsMode = mode;

	if (curGraphicsMode === 0) {
		// init a new screen buffer
		drawingBuffers[screenBufferId] = {
			img : ctx.createImageData(128 * scale, 128 * scale),
			canvas : null,
		};
	}
}

function bitsySetColor(paletteIndex, r, g, b) {
	systemPalette[paletteIndex] = [r, g, b];
}

function bitsyDrawBegin(bufferId) {
	curBufferId = bufferId;
}

function bitsyDrawEnd() {
	if (curBufferId >= tileStartBufferId) {
		var tileBuffer = drawingBuffers[curBufferId];

		// todo : move this step into a bitsyDrawEnd function?
		if (tileBuffer.canvas === null) {
			var img = tileBuffer.img;

			// convert to canvas: chrome has poor performance when working directly with image data
			var imageCanvas = document.createElement("canvas");
			imageCanvas.width = img.width;
			imageCanvas.height = img.height;
			var imageContext = imageCanvas.getContext("2d");
			imageContext.putImageData(img, 0, 0);

			tileBuffer.canvas = imageCanvas;
		}
	}

	curBufferId = -1;
}

function bitsyDrawFill(paletteIndex) {
	var clearColor = systemPalette[paletteIndex];

	if (curBufferId === screenBufferId) {
		// clear screen (todo : should this be disabled in tile mode?)
		// ctx.fillStyle = "rgb(" + clearColor[0] + "," + clearColor[1] + "," + clearColor[2] + ")";
		// ctx.fillRect(0, 0, canvas.width, canvas.height);
		var screenBuffer = drawingBuffers[screenBufferId];
		for (var i = 0; i < screenBuffer.img.data.length; i += 4) {
			screenBuffer.img.data[i + 0] = clearColor[0];
			screenBuffer.img.data[i + 1] = clearColor[1];
			screenBuffer.img.data[i + 2] = clearColor[2];
			screenBuffer.img.data[i + 3] = 255;
		}
	}
	else if (curBufferId === textboxBufferId) {
		if (!drawingBuffers[textboxBufferId]) {
			// todo : is this useful to keep around?
			// force init the buffer
			bitsySetTextboxSize(textboxWidth, textboxHeight);
		}

		var textboxBuffer = drawingBuffers[textboxBufferId];

		// todo : clean up this code
		// fill text box
		for (var i = 0; i < textboxBuffer.img.data.length; i += 4) {
			textboxBuffer.img.data[i + 0] = clearColor[0];
			textboxBuffer.img.data[i + 1] = clearColor[1];
			textboxBuffer.img.data[i + 2] = clearColor[2];
			textboxBuffer.img.data[i + 3] = 255;
		}
	}
}

function bitsyDrawPixel(paletteIndex, x, y) {
	if (curBufferId == screenBufferId) { /* screen */
		var screenBuffer = drawingBuffers[screenBufferId];
		var img = screenBuffer.img;
		var color = systemPalette[paletteIndex];

		for (var sy = 0; sy < scale; sy++) {
			for (var sx = 0; sx < scale; sx++) {
				// note: 128 == screen width (should I store that somewhere?)
				var pixelIndex = (((y * scale) + sy) * 128 * scale * 4) + (((x * scale) + sx) * 4);

				img.data[pixelIndex + 0] = color[0];
				img.data[pixelIndex + 1] = color[1];
				img.data[pixelIndex + 2] = color[2];
				img.data[pixelIndex + 3] = 255;
			}
		}
	}
	else if (curBufferId == textboxBufferId) { /* textbox */
		var textboxBuffer = drawingBuffers[textboxBufferId];
		var img = textboxBuffer.img;
		var color = systemPalette[paletteIndex];

		//scaling nonsense
		for (var sy = 0; sy < textScale; sy++) {
			for (var sx = 0; sx < textScale; sx++) {
				var pixelIndex = (((y * textScale) + sy) * textboxWidth * textScale * 4) + (((x * textScale) + sx) * 4);

				img.data[pixelIndex + 0] = color[0];
				img.data[pixelIndex + 1] = color[1];
				img.data[pixelIndex + 2] = color[2];
				img.data[pixelIndex + 3] = 255;
			}
		}
	}
	else if (curBufferId >= tileStartBufferId) { /* tiles */
		var tileBuffer = drawingBuffers[curBufferId];
		var img = tileBuffer.img;
		var color = systemPalette[paletteIndex];

		for (var sy = 0; sy < scale; sy++) {
			for (var sx = 0; sx < scale; sx++) {
				var pixelIndex = (((y * scale) + sy) * tilesize * scale * 4) + (((x * scale) + sx) * 4);

				img.data[pixelIndex + 0] = color[0];
				img.data[pixelIndex + 1] = color[1];
				img.data[pixelIndex + 2] = color[2];
				img.data[pixelIndex + 3] = 255;
			}
		}
	}
}

// todo : name??? AddTile? AllocateTile?
function bitsyCreateTile() {
	var tileBufferId = nextBufferId;
	nextBufferId++;

	drawingBuffers[tileBufferId] = {
		img : ctx.createImageData(tilesize * scale, tilesize * scale),
		canvas : null,
	};

	return tileBufferId;
}

// todo : name? bitsySetTile?
function bitsyDrawTile(tileIndex, tx, ty) {
	var tileBuffer = drawingBuffers[tileIndex];

	// NOTE: tiles are now canvases, instead of raw image data (for chrome performance reasons)
	ctx.drawImage(
		tileBuffer.canvas,
		tx * tilesize * scale,
		ty * tilesize * scale,
		tilesize * scale,
		tilesize * scale);
}

// note: width and height are in text scale pixels
function bitsySetTextboxSize(w, h) {
	textboxWidth = w;
	textboxHeight = h;

	drawingBuffers[textboxBufferId] = {
		img : ctx.createImageData(textboxWidth * textScale, textboxHeight * textScale),
		canvas : null, // currently unused since it's not a performance bottleneck
	};
}

// note: x and y are in tile scale pixels
// todo : move to a hide/show model? what should the name of this be?
function bitsyDrawTextbox(x, y) {
	ctx.putImageData(drawingBuffers[textboxBufferId].img, x * scale, y * scale);
}

function bitsyOnLoad(fn) {
	onLoadFunction = fn;
}

function bitsyOnQuit(fn) {
	onQuitFunction = fn;
}

function bitsyOnUpdate(fn) {
	onUpdateFunction = fn;
}