/* logging */
var DebugLogCategory = {
	system: false,
	bitsy : false,
	editor : false,
};

var isLoggingVerbose = false;

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
				// bitsyLog("IGNORE -- " + key, "system");
			}
		}
	}

	this.onkeydown = function(event) {
		// bitsyLog("KEYDOWN -- " + event.keyCode, "system");

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
		// bitsyLog("KEYUP -- " + event.keyCode, "system");
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
		// bitsyLog("~~~ BLUR ~~", "system");
		resetAll();
	}
}

var input = new InputManager();

/* events */
var onLoadFunction = null;
var onQuitFunction = null;
var onUpdateFunction = null;
var updateInterval = null;

function initSystem() {
	// temp hack for the editor? unless??
	drawingBuffers[screenBufferId] = createDrawingBuffer(128, 128, scale);
	drawingBuffers[textboxBufferId] = createDrawingBuffer(0, 0, textScale);
}

function loadGame(gameData, defaultFontData) {
	drawingBuffers[screenBufferId] = createDrawingBuffer(128, 128, scale);
	drawingBuffers[textboxBufferId] = createDrawingBuffer(0, 0, textScale);

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
		// todo : is this the right place to supply default font data?
		onLoadFunction(gameData, defaultFontData);
	}

	updateInterval = setInterval(
		function() {
			if (onUpdateFunction) {
				onUpdateFunction();
			}

			renderGame();

			input.resetTapReleased();
		},
		16);
}

function renderGame() {
	// bitsyLog("render game mode=" + curGraphicsMode, "system");

	var startIndex = curGraphicsMode === 0 ? screenBufferId : (drawingBuffers.length - 1);

	for (var i = startIndex; i >= 0; i--) {
		var buffer = drawingBuffers[i];
		if (buffer && buffer.canvas === null) {
			renderDrawingBuffer(i, buffer);
		}
	}

	// show screen buffer
	var screenBuffer = drawingBuffers[screenBufferId];
	ctx.drawImage(
		screenBuffer.canvas,
		0,
		0,
		screenBuffer.width * screenBuffer.scale,
		screenBuffer.height * screenBuffer.scale);
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
var canvas;
var ctx;

var textScale = 2; // todo : move tile scale into here too?

var curGraphicsMode = 0;
var systemPalette = [];
var curBufferId = -1; // note: -1 is invalid
var drawingBuffers = [];

var screenBufferId = 0;
var textboxBufferId = 1;
var tileStartBufferId = 2;
var nextBufferId = tileStartBufferId;

var DrawingInstruction = {
	Pixel : 0,
	Tile : 1,
	Clear : 2,
	Textbox : 3,
};

function attachCanvas(c) {
	canvas = c;
	canvas.width = width * scale;
	canvas.height = width * scale;
	ctx = canvas.getContext("2d");
}

function createDrawingBuffer(width, height, scale) {
	var buffer = {
		width : width,
		height : height,
		scale : scale, // logical-pixel to display-pixel scale
		instructions : [], // drawing instructions
		canvas : null,
	}

	return buffer;
}

function renderPixelInstruction(bufferId, buffer, paletteIndex, x, y) {
	if (bufferId === screenBufferId && curGraphicsMode != 0) {
		return;
	}

	if (!systemPalette[paletteIndex]) {
		// bitsyLog("invalid index " + paletteIndex + " @ " + x + "," + y, "system");
		return;
	}

	var color = systemPalette[paletteIndex];

	if (buffer.imageData) {
		for (var sy = 0; sy < buffer.scale; sy++) {
			for (var sx = 0; sx < buffer.scale; sx++) {
				var pixelIndex = (((y * buffer.scale) + sy) * buffer.width * buffer.scale * 4) + (((x * buffer.scale) + sx) * 4);

				buffer.imageData.data[pixelIndex + 0] = color[0];
				buffer.imageData.data[pixelIndex + 1] = color[1];
				buffer.imageData.data[pixelIndex + 2] = color[2];
				buffer.imageData.data[pixelIndex + 3] = 255;
			}
		}
	}
	else {
		var bufferContext = buffer.canvas.getContext("2d");
		bufferContext.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
		bufferContext.fillRect(x * buffer.scale, y * buffer.scale, buffer.scale, buffer.scale);
	}
}

function renderTileInstruction(bufferId, buffer, tileId, x, y) {
	if (bufferId != screenBufferId || curGraphicsMode != 1) {
		return;
	}

	if (!drawingBuffers[tileId]) {
		return;
	}

	var tileBuffer = drawingBuffers[tileId];

	var bufferContext = buffer.canvas.getContext("2d");
	bufferContext.drawImage(
		tileBuffer.canvas,
		x * tilesize * buffer.scale,
		y * tilesize * buffer.scale,
		tilesize * buffer.scale,
		tilesize * buffer.scale);
}

function renderClearInstruction(bufferId, buffer, paletteIndex) {
	var color = systemPalette[paletteIndex];
	var bufferContext = buffer.canvas.getContext("2d");
	bufferContext.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
	bufferContext.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);
}

function renderTextboxInstruction(bufferId, buffer, x, y) {
	if (bufferId != screenBufferId || curGraphicsMode != 1) {
		return;
	}

	if (!drawingBuffers[textboxBufferId]) {
		return;
	}

	var textboxBuffer = drawingBuffers[textboxBufferId];

	var bufferContext = buffer.canvas.getContext("2d");
	bufferContext.drawImage(
		textboxBuffer.canvas,
		x * buffer.scale,
		y * buffer.scale,
		textboxBuffer.canvas.width,
		textboxBuffer.canvas.height);
}

function renderDrawingBuffer(bufferId, buffer) {
	// bitsyLog("render buffer " + bufferId, "system");

	// if (bufferId === 0) {
	// 	bitsyLog("instructions " + buffer.instructions.length, "system");
	// }

	buffer.canvas = document.createElement("canvas");
	buffer.canvas.width = buffer.width * buffer.scale;
	buffer.canvas.height = buffer.height * buffer.scale;

	for (var i = 0; i < buffer.instructions.length; i++) {
		var instruction = buffer.instructions[i];
		switch (instruction.type) {
			case DrawingInstruction.Pixel:
				renderPixelInstruction(bufferId, buffer, instruction.id, instruction.x, instruction.y);
				break;
			case DrawingInstruction.Tile:
				renderTileInstruction(bufferId, buffer, instruction.id, instruction.x, instruction.y);
				break;
			case DrawingInstruction.Clear:
				renderClearInstruction(bufferId, buffer, instruction.id);
				break;
			case DrawingInstruction.Textbox:
				renderTextboxInstruction(bufferId, buffer, instruction.x, instruction.y);
				break;
		}
	}

	if (buffer.imageData) {
		var bufferContext = buffer.canvas.getContext("2d");
		bufferContext.putImageData(buffer.imageData, 0, 0);
	}
}

function invalidateDrawingBuffer(buffer) {
	buffer.canvas = null;
}

function hackForEditor_GetImageFromTileId(tileId) {
	if (tileId === undefined || !drawingBuffers[tileId]) {
		bitsyLog("editor hack::invalid tile id!", "system");
		return null;
	}

	// force render the buffer if it hasn't been
	if (drawingBuffers[tileId].canvas === null) {
		renderDrawingBuffer(tileId, drawingBuffers[tileId]);
	}

	return drawingBuffers[tileId].canvas;
}

/* ==== */
function bitsyLog(message, category) {
	if (!category) {
		category = "bitsy";
	}

	var summary = category + "::" + message;

	if (DebugLogCategory[category] === true) {
		if (isLoggingVerbose) {
			console.group(summary);

			console.dir(message);

			console.group("stack")
			console.trace();
			console.groupEnd();

			console.groupEnd();
		}
		else {
			console.log(summary);
		}
	}
}

function bitsyGetButton(buttonCode) {
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

	var screenBuffer = drawingBuffers[screenBufferId];
	if (curGraphicsMode === 0) {
		screenBuffer.imageData = ctx.createImageData(screenBuffer.width * screenBuffer.scale, screenBuffer.height * screenBuffer.scale);
	}
	else {
		screenBuffer.imageData = undefined;
	}
}

function bitsySetColor(paletteIndex, r, g, b) {
	systemPalette[paletteIndex] = [r, g, b];

	// invalidate all drawing buffers
	for (var i = 0; i < drawingBuffers.length; i++) {
		if (drawingBuffers[i]) {
			drawingBuffers[i].canvas = null;
		}
	}
}

function bitsyDrawBegin(bufferId) {
	curBufferId = bufferId;
	var buffer = drawingBuffers[curBufferId];
	invalidateDrawingBuffer(buffer);
}

function bitsyDrawEnd() {
	curBufferId = -1;
}

function bitsyDrawPixel(paletteIndex, x, y) {
	if (curBufferId === screenBufferId && curGraphicsMode != 0) {
		return;
	}

	var buffer = drawingBuffers[curBufferId];
	buffer.instructions.push({ type: DrawingInstruction.Pixel, id: paletteIndex, x: x, y: y, });
}

function bitsyDrawTile(tileId, x, y) {
	if (curBufferId != screenBufferId || curGraphicsMode != 1) {
		return;
	}

	var buffer = drawingBuffers[curBufferId];
	buffer.instructions.push({ type: DrawingInstruction.Tile, id: tileId, x: x, y: y, });
}

function bitsyDrawTextbox(x, y) {
	if (curBufferId != screenBufferId || curGraphicsMode != 1) {
		return;
	}

	var buffer = drawingBuffers[curBufferId];
	buffer.instructions.push({ type: DrawingInstruction.Textbox, x: x, y: y, });
}

function bitsyClear(paletteIndex) {
	drawingBuffers[curBufferId].instructions = []; // reset instructions
	drawingBuffers[curBufferId].instructions.push({ type: DrawingInstruction.Clear, id: paletteIndex, });
}

// allocates a tile buffer and returns the ID
function bitsyAddTile() {
	var tileBufferId = nextBufferId;
	nextBufferId++;

	drawingBuffers[tileBufferId] = createDrawingBuffer(tilesize, tilesize, scale);

	return tileBufferId;
}

// clears all tile buffers
function bitsyResetTiles() {
	bitsyLog("RESET TILES", "system");
	// bitsyLog(drawingBuffers, "system");
	// bitsyLog(tileStartBufferId, "system");
	// bitsyLog(drawingBuffers.slice(tileStartBufferId), "system");
	drawingBuffers = drawingBuffers.slice(0, tileStartBufferId);
}

// note: width and height are in text scale pixels
function bitsySetTextboxSize(w, h) {
	drawingBuffers[textboxBufferId] = createDrawingBuffer(w, h, textScale);
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