function InputSystem() {
	var self = this;

	this.Key = {
		LEFT: 37,
		RIGHT: 39,
		UP: 38,
		DOWN: 40,
		SPACE: 32,
		ENTER: 13,
		W: 87,
		A: 65,
		S: 83,
		D: 68,
		R: 82,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,
		CMD: 224
	};

	var pressed;
	var ignored;
	var touchState;

	var isRestartComboPressed = false;

	var SwipeDir = {
		None : -1,
		Up : 0,
		Down : 1,
		Left : 2,
		Right : 3,
	};

	function resetAll() {
		isRestartComboPressed = false;

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
		if (e.keyCode == self.Key.LEFT || e.keyCode == self.Key.RIGHT || e.keyCode == self.Key.UP || e.keyCode == self.Key.DOWN || !isPlayerEmbeddedInEditor) {
			e.preventDefault();
		}
	}

	function isRestartCombo(e) {
		return (e.keyCode === self.Key.R && (e.getModifierState("Control")|| e.getModifierState("Meta")));
	}

	function eventIsModifier(event) {
		return (event.keyCode == self.Key.SHIFT || event.keyCode == self.Key.CTRL || event.keyCode == self.Key.ALT || event.keyCode == self.Key.CMD);
	}

	function isModifierKeyDown() {
		return (self.isKeyDown(self.Key.SHIFT) || self.isKeyDown(self.Key.CTRL) || self.isKeyDown(self.Key.ALT) || self.isKeyDown(self.Key.CMD));
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
		enableGlobalAudioContext();
		// bitsyLog("KEYDOWN -- " + event.keyCode, "system");

		stopWindowScrolling(event);

		isRestartComboPressed = isRestartCombo(event);

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

		isRestartComboPressed = false;
	}

	this.ontouchstart = function(event) {
		enableGlobalAudioContext();

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
				!(key === self.Key.UP || key === self.Key.DOWN || key === self.Key.LEFT || key === self.Key.RIGHT) &&
				!(key === self.Key.W || key === self.Key.S || key === self.Key.A || key === self.Key.D)) {
				// detected that a key other than the d-pad keys are down!
				anyKey = true;
			}
		}

		return anyKey;
	}

	this.isRestartComboPressed = function() {
		return isRestartComboPressed;
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

	this.resetAll = resetAll;

	this.listen = function(canvas) {
		document.addEventListener('keydown', self.onkeydown);
		document.addEventListener('keyup', self.onkeyup);

		if (isPlayerEmbeddedInEditor) {
			canvas.addEventListener('touchstart', self.ontouchstart, {passive:false});
			canvas.addEventListener('touchmove', self.ontouchmove, {passive:false});
			canvas.addEventListener('touchend', self.ontouchend, {passive:false});
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

				touchTrigger.addEventListener('touchstart', self.ontouchstart);
				touchTrigger.addEventListener('touchmove', self.ontouchmove);
				touchTrigger.addEventListener('touchend', self.ontouchend);
			}
		}

		window.onblur = self.onblur;
	}

	this.unlisten = function(canvas) {
		document.removeEventListener('keydown', self.onkeydown);
		document.removeEventListener('keyup', self.onkeyup);

		if (isPlayerEmbeddedInEditor) {
			canvas.removeEventListener('touchstart', self.ontouchstart);
			canvas.removeEventListener('touchmove', self.ontouchmove);
			canvas.removeEventListener('touchend', self.ontouchend);
		}
		else {
			//check for touchTrigger and removes it

			var existingTouchTrigger = document.querySelector('#touchTrigger');

			if (existingTouchTrigger !== null) {
				existingTouchTrigger.removeEventListener('touchstart', self.ontouchstart);
				existingTouchTrigger.removeEventListener('touchmove', self.ontouchmove);
				existingTouchTrigger.removeEventListener('touchend', self.ontouchend);

				existingTouchTrigger.parentElement.removeChild(existingTouchTrigger);
			}
		}

		window.onblur = null;
	}
}