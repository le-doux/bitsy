/* LOGGING */
var DebugLogCategory = {
	// system
	input: false,
	sound: false,
	graphics: false,
	system: false,

	// engine
	bitsy: false,

	// editor
	editor: false,

	// tools
	room: false,
	tune: false,
	blip: false,
};

var isLoggingVerbose = false;

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

/* GLOBALS */
var tilesize = 8;
var mapsize = 16;
var width = mapsize * tilesize;
var height = mapsize * tilesize;
var scale = 4;
var textScale = 2;

/* SYSTEM */
var updateInterval = null;
var prevTime = 0;
var deltaTime = 0;

function initSystem() {
	prevTime = Date.now();
	updateInterval = setInterval(updateSystem, 16);
}

function updateSystem() {
	var curTime = Date.now();
	deltaTime = curTime - prevTime;

	// update all active processes
	for (var i = 0; i < processes.length; i++) {
		bitsy = processes[i].system;
		if (bitsy._active) {
			bitsyLog(bitsy._name + " img count: " + bitsy._graphics._images.length, "system");
			var shouldContinue = bitsy._update(deltaTime);
			if (!shouldContinue) {
				// todo : do I really care about this _exit thing?
				if (bitsy._name != "bitsy") {
					bitsy._exit();
				}
			}
		}
	}

	bitsy = mainProcess.system;
	prevTime = curTime;
}

function loadGame(canvas, gameData, defaultFontData) {
	bitsyLog("load!", "system");
	// initialize bitsy system
	bitsy._attachCanvas(canvas);
	bitsy._write(bitsy._gameDataBlock, gameData);
	bitsy._write(bitsy._fontDataBlock, defaultFontData);
	bitsy._start();
}

function quitGame() {
	// hack to press the menu button to force game over state
	bitsy._injectPreLoop = function() { bitsy._poke(bitsy._buttonBlock, bitsy.BTN_MENU, 1); };

	// one last update to clean up (a little hacky to do this here?)
	bitsy._update(0);
	bitsy._exit();

	// clean up this gross hack
	bitsy._injectPreLoop = null;
}

/* GRAPHICS */
var canvas; // can I get rid of these?
var ctx;

function attachCanvas(c) {
	// hack : tes tnew system
	bitsy._attachCanvas(c);
	// extra hacky
	canvas = bitsy._getCanvas();
	ctx = bitsy._getContext();
}

/* PROCESSES */
var processes = [];

function addProcess(name) {
	var proc = {};
	proc.system = new BitsySystem(name);

	processes.push(proc);

	return proc;
}

/* == SYSTEM v0.2 === */
function BitsySystem(name) {
	var self = this;

	if (!name) {
		name = "bitsy";
	}

	// memory
	var memory = {
		blocks: [],
		changed: []
	};

	// input
	var input = new InputSystem();

	// sound
	var sound = new SoundSystem();
	var soundDurationIndex = 0;
	var soundFrequencyIndex = 1;
	var soundVolumeIndex = 2;
	var soundPulseIndex = 3;
	var maxVolume = 15;

	// graphics
	var graphics = new GraphicsSystem();
	graphics.setScale(scale);
	graphics.setTextScale(textScale);
	var initialPaletteSize = 64;
	var tilePoolStart = null;
	var tilePoolSize = 512;
	// hack!!! (access for debugging)
	this._graphics = graphics;

	function updateTextScale() {
		// make sure the text scale matches the text mode
		var textMode = self._peek(modeBlock, 1);
		var textModeScale = (textMode === self.TXT_LOREZ) ? scale : textScale;
		if (graphics.getTextScale() != textModeScale) {
			graphics.setTextScale(textModeScale);
			memory.changed[self.TEXTBOX] = true;
		}
	}

	function updateInput() {
		// update input flags
		self._poke(self._buttonBlock, self.BTN_UP,
			(input.isKeyDown(input.Key.UP) || input.isKeyDown(input.Key.W) || input.swipeUp()) ? 1 : 0);

		self._poke(self._buttonBlock, self.BTN_DOWN,
			(input.isKeyDown(input.Key.DOWN) || input.isKeyDown(input.Key.S) || input.swipeDown()) ? 1 : 0);

		self._poke(self._buttonBlock, self.BTN_LEFT,
			(input.isKeyDown(input.Key.LEFT) || input.isKeyDown(input.Key.A) || input.swipeLeft()) ? 1 : 0);

		self._poke(self._buttonBlock, self.BTN_RIGHT,
			(input.isKeyDown(input.Key.RIGHT) || input.isKeyDown(input.Key.D) || input.swipeRight()) ? 1 : 0);

		self._poke(self._buttonBlock, self.BTN_OK,
			(input.anyKeyDown() || input.isTapReleased()) ? 1 : 0);

		self._poke(self._buttonBlock, self.BTN_MENU,
			(input.isRestartComboPressed()) ? 1 : 0);

		input.resetTapReleased();
	}

	function updateSound(dt) {
		var changed0 = memory.changed[self.SOUND1];
		var changed1 = memory.changed[self.SOUND2];

		// update sound channel timers
		var timer0 = self._peek(self.SOUND1, soundDurationIndex);
		timer0 -= dt;
		if (timer0 <= 0) {
			timer0 = 0;
			if (self._peek(self.SOUND1, soundVolumeIndex) > 0) {
				self._poke(self.SOUND1, soundVolumeIndex, 0);
				changed0 = true;
			}
		}
		self._poke(self.SOUND1, soundDurationIndex, timer0);

		var timer1 = self._peek(self.SOUND2, soundDurationIndex);
		timer1 -= dt;
		if (timer1 <= 0) {
			timer1 = 0;
			if (self._peek(self.SOUND2, soundVolumeIndex) > 0) {
				self._poke(self.SOUND2, soundVolumeIndex, 0);
				changed1 = true;
			}
		}
		self._poke(self.SOUND2, soundDurationIndex, timer1);

		// send updated channel attributes to the sound system
		if (changed0) {
			sound.setPulse(0, self._peek(self.SOUND1, soundPulseIndex));

			var freq = self._peek(self.SOUND1, soundFrequencyIndex);
			var freqHz = freq / 100;
			sound.setFrequency(0, freqHz);

			var volume = self._peek(self.SOUND1, soundVolumeIndex);
			volume = Math.max(0, Math.min(volume, maxVolume));
			volumeNorm = (volume / maxVolume);
			sound.setVolume(0, volumeNorm);
		}

		if (changed1) {
			sound.setPulse(1, self._peek(self.SOUND2, soundPulseIndex));

			var freq = self._peek(self.SOUND2, soundFrequencyIndex);
			var freqHz = freq / 100;
			sound.setFrequency(1, freqHz);

			var volume = self._peek(self.SOUND2, soundVolumeIndex);
			volume = Math.max(0, Math.min(volume, maxVolume));
			volumeNorm = (volume / maxVolume);
			sound.setVolume(1, volumeNorm);
		}
	}

	function updateGraphics() {
		if (self._enableGraphics === false) {
			return;
		}

		bitsyLog("update graphics", "system");

		if (memory.changed[paletteBlock]) {
			graphics.setPalette(self._dump()[paletteBlock]);
		}

		if (tilePoolStart != null) {
			for (var i = 0; i < tilePoolSize; i++) {
				var tile = tilePoolStart + i;
				if (memory.blocks[tile] != undefined && memory.changed[tile]) {
					bitsyLog("tile changed? " + tile, "system");
					// update tile image
					graphics.createImage(tile, self.TILE_SIZE, self.TILE_SIZE, self._dump()[tile]);
				}
			}
		}

		var textboxChanged = memory.changed[self.TEXTBOX] || memory.changed[textboxAttributeBlock];
		if (textboxChanged) {
			// todo : should this be optimized in some way?
			// update textbox image
			var w = self._peek(textboxAttributeBlock, 3); // todo : need a variable to store this index?
			var h = self._peek(textboxAttributeBlock, 4);
			if (w > 0 && h > 0) {
				bitsyLog("textbox changed! " + memory.changed[self.TEXTBOX] + " " + memory.changed[textboxAttributeBlock] + " " + w + " " + h, "system");
				var useTextBoxScale = true; // todo : check mode here?
				graphics.createImage(self.TEXTBOX, w, h, self._dump()[self.TEXTBOX], useTextBoxScale);
			}
		}

		var mode = self._peek(modeBlock, 0);
		if (mode === self.GFX_VIDEO) {
			if (memory.changed[self.VIDEO]) {
				graphics.clearCanvas(0);
				// update screen image
				graphics.createImage(self.VIDEO, self.VIDEO_SIZE, self.VIDEO_SIZE, self._dump()[self.VIDEO]);
				// render screen onto canvas
				graphics.drawImage(self.VIDEO, 0, 0);
			}
		}
		else if (mode === self.GFX_MAP) {
			// redraw any changed layers
			var layers = self._getTileMapLayers();
			var anyMapLayerChanged = false;
			for (var i = 0; i < layers.length; i++) {
				var layerId = layers[i];
				if (memory.changed[layerId]) {
					// need to redraw this map layer
					anyMapLayerChanged = true;
					// clear layer canvas
					graphics.setImageFill(layerId, 0); // fill transparent
					graphics.createImage(layerId, self.VIDEO_SIZE, self.VIDEO_SIZE, []);
					// render tiles onto layer canvas
					var layerData = self._dump()[layerId];
					for (var ty = 0; ty < self.MAP_SIZE; ty++) {
						for (var tx = 0; tx < self.MAP_SIZE; tx++) {
							var tileIndex = (ty * self.MAP_SIZE) + tx;
							var tile = layerData[tileIndex];
							if (tile > 0) {
								graphics.drawImage(tile, tx * self.TILE_SIZE, ty * self.TILE_SIZE, layerId);
							}
						}
					}
				}
			}

			// redraw the main canvas
			if (textboxChanged || anyMapLayerChanged) {
				bitsyLog("map changed? " + memory.changed[self.MAP1] + " " + memory.changed[self.MAP2], "system");
				graphics.clearCanvas(0);

				for (var i = 0; i < layers.length; i++) {
					var layerId = layers[i];
					// draw the layer's image canvas onto the main canvas
					graphics.drawImage(layerId, 0, 0);
				}

				// draw textbox onto canvas
				var visible = self._peek(textboxAttributeBlock, 0)
				var x = self._peek(textboxAttributeBlock, 1);
				var y = self._peek(textboxAttributeBlock, 2);
				var w = self._peek(textboxAttributeBlock, 3);
				var h = self._peek(textboxAttributeBlock, 4);
				if (visible > 0 && w > 0 && h > 0) {
					graphics.drawImage(self.TEXTBOX, x, y);
				}
			}
		}
	}

	/* == PRIVATE / DEBUG == */
	this._name = name;

	this._active = false;

	this._attachCanvas = function(c) {
		graphics.attachCanvas(c, self.VIDEO_SIZE);
	};

	this._getCanvas = graphics.getCanvas;
	this._getContext = graphics.getContext;

	this._start = function() {
		input.listen(graphics.getCanvas());
		updateTextScale();
		self._active = true;
	};

	// hacky...
	this._startNoInput = function() {
		updateTextScale();
		self._active = true;
	};

	this._exit = function() {
		// disable graphics
		var canvas = graphics.getCanvas();
		if (canvas) {
			input.unlisten(canvas);	
		}

		// disable sound
		sound.mute();

		self._active = false;
	};

	// hacky....
	this._injectPreLoop = null;
	this._injectPostDraw = null;

	this._update = function(dt) {
		var shouldContinue = false;

		updateInput();

		// too hacky???
		if (self._injectPreLoop) {
			self._injectPreLoop();
		}

		// run main loop
		if (onLoopFunction) {
			shouldContinue = onLoopFunction(dt);
		}

		if (memory.changed[modeBlock]) {
			updateTextScale();
		}

		// update output systems
		updateSound(dt);
		updateGraphics();

		if (self._injectPostDraw) {
			self._injectPostDraw();
		}

		// reset memory block changed flags
		for (var i = 0; i < memory.changed.length; i++) {
			memory.changed[i] = false;
		}

		// todo : should the _exit() call go in here?

		return shouldContinue;
	};

	this._updateGraphics = updateGraphics;

	this._allocate = function(args) {
		// find next available block in range
		var next = (args && args.start) ? args.start : 0;
		var count = (args && args.max) ? args.max : -1;
		while (memory.blocks[next] != undefined && count != 0) {
			next++;
			count--;
		}

		if (count == 0) {
			// couldn't find any available block
			return null;
		}

		if (args && args.str) {
			memory.blocks[next] = args.str;
		}
		else {
			var size = args && args.size ? args.size : 0;
			memory.blocks[next] = [];
			for (var i = 0; i < size; i++) {
				memory.blocks[next].push(0);
			}
		}

		memory.changed[next] = false;

		return next;
	};

	this._free = function(block) {
		delete memory.blocks[block];
		delete memory.changed[block];
	};

	this._peek = function(block, index) {
		var memoryBlock = memory.blocks[block];
		if (typeof(memoryBlock) === "string") {
			return memoryBlock.charCodeAt(index);
		}
		else {
			return memoryBlock[index];
		}
	};

	this._poke = function(block, index, value) {
		var memoryBlock = memory.blocks[block];
		if (typeof(memoryBlock) === "string") {
			memory.blocks[block] = memoryBlock.substring(0, index) + String.fromCharCode(value) + memoryBlock.substring(index + 1);
		}
		else {
			var value = parseInt(value);
			if (!isNaN(value)) {
				memoryBlock[index] = value;
			}
		}
		memory.changed[block] = true;
	};

	this._read = function(block) {
		var memoryBlock = memory.blocks[block];
		if (typeof(memoryBlock) === "string") {
			return memoryBlock;
		}
		else {
			var str = "";
			for (var i = 0; i < memoryBlock.length; i++) {
				str += String.fromCharCode(memoryBlock[i]);
			}
			return str;
		}
	};

	this._write = function(block, str) {
		var memoryBlock = memory.blocks[block];
		if (typeof(memoryBlock) === "string") {
			memory.blocks[block] = str;
		}
		else {
			memory.blocks[block] = [];
			for (var i = 0; i < str.length; i++) {
				memory.blocks[block][i] = str.charCodeAt(i);
			}
		}
		memory.changed[block] = true;
	};

	this._dump = function() {
		return memory.blocks;
	};

	// convenience methods for hacking around with map layers
	var tileMapLayers = [];
	this._getTileMapLayers = function() {
		return tileMapLayers;
	};
	this._addTileMapLayer = function() {
		var layer = self._allocate({
			start: (tilePoolStart + tilePoolSize),
			size: (self.MAP_SIZE * self.MAP_SIZE)
		});

		tileMapLayers.push(layer);

		return layer;
	};

	/* == CONSTANTS == */
	// memory blocks (these will be initialized below)
	this.VIDEO;
	this.TEXTBOX;
	this.MAP1;
	this.MAP2;
	this.SOUND1;
	this.SOUND2;

	// graphics modes
	this.GFX_VIDEO = 0;
	this.GFX_MAP = 1;

	// text modes
	this.TXT_HIREZ = 0; // 2x resolution
	this.TXT_LOREZ = 1; // 1x resolution

	// size
	this.TILE_SIZE = tilesize;
	this.MAP_SIZE = mapsize;
	this.VIDEO_SIZE = width;
	// todo : should text scale have a constant?

	// button codes
	this.BTN_UP = 0;
	this.BTN_DOWN = 1;
	this.BTN_LEFT = 2;
	this.BTN_RIGHT = 3;
	this.BTN_OK = 4;
	this.BTN_MENU = 5;

	// pulse waves
	this.PULSE_1_8 = 0;
	this.PULSE_1_4 = 1;
	this.PULSE_1_2 = 2;

	/* == IO == */
	this.log = function(message) {
		bitsyLog(message, name);
	};

	this.button = function(code) {
		return self._peek(buttonBlock, code) > 0;
	};

	this.getGameData = function() {
		return self._read(gameDataBlock);
	};

	this.getFontData = function() {
		return self._read(fontDataBlock);
	};

	/* == GRAPHICS == */
	this.graphicsMode = function(mode) {
		// todo : store the mode flag indices somewhere?
		if (mode != undefined) {
			self._poke(modeBlock, 0, mode);
		}

		return self._peek(modeBlock, 0);
	};

	this.textMode = function(mode) {
		// todo : test whether the requested mode is supported!
		if (mode != undefined) {
			self._poke(modeBlock, 1, mode);
		}

		return self._peek(modeBlock, 1);
	};

	this.color = function(color, r, g, b) {
		self._poke(paletteBlock, (color * 3) + 0, r);
		self._poke(paletteBlock, (color * 3) + 1, g);
		self._poke(paletteBlock, (color * 3) + 2, b);

		// mark all graphics as changed
		memory.changed[self.VIDEO] = true;
		memory.changed[self.TEXTBOX] = true;
		memory.changed[self.MAP1] = true;
		memory.changed[self.MAP2] = true;

		if (tilePoolStart != null) {
			for (var i = 0; i < tilePoolSize; i++) {
				if (memory.blocks[tilePoolStart + i] != undefined) {
					memory.changed[tilePoolStart + i] = true;
				}
			}
		}
	};

	this.tile = function() {
		return self._allocate({
			start: tilePoolStart,
			max: tilePoolSize,
			size: (self.TILE_SIZE * self.TILE_SIZE)
		});
	};

	this.delete = function(tile) {
		if (graphics.hasImage(tile)) {
			graphics.deleteImage(tile);
		}

		self._free(tile);
	};

	this.fill = function(block, value) {
		var len = memory.blocks[block].length;
		for (var i = 0; i < len; i++) {
			self._poke(block, i, value);
		}

		var isImage = (block === self.VIDEO) ||
			(block === self.TEXTBOX) ||
			(block >= tilePoolStart && block < (tilePoolStart + tilePoolSize));

		// optimize rendering by notifying the graphics system what the fill color is for this image
		if (isImage) {
			graphics.setImageFill(block, value);
		}
	};

	this.set = function(block, index, value) {
		self._poke(block, index, value);
	};

	this.textbox = function(visible, x, y, w, h) {
		if (visible != undefined) {
			self._poke(textboxAttributeBlock, 0, (visible === true) ? 1 : 0);
		}
		
		if (x != undefined) {
			self._poke(textboxAttributeBlock, 1, x);
		}
		
		if (y != undefined) {
			self._poke(textboxAttributeBlock, 2, y);
		}

		var prevWidth = self._peek(textboxAttributeBlock, 3);
		var prevHeight = self._peek(textboxAttributeBlock, 4);

		if (w != undefined) {
			self._poke(textboxAttributeBlock, 3, w);
		}
		
		if (h != undefined) {
			self._poke(textboxAttributeBlock, 4, h);
		}

		if (w != undefined && h != undefined && (prevWidth != w || prevHeight != h)) {
			// re-allocate the textbox block (should I have a helper function for this?)
			memory.blocks[self.TEXTBOX] = [];
			for (var i = 0; i < (w * h); i++) {
				memory.blocks[self.TEXTBOX].push(0);
			}
			memory.changed[self.TEXTBOX] = true;
		}
	};

	/* == SOUND == */
	// duration is in milliseconds (ms)
	this.sound = function(channel, duration, frequency, volume, pulse) {
		self._poke(channel, soundDurationIndex, duration);
		self._poke(channel, soundFrequencyIndex, frequency);
		self._poke(channel, soundVolumeIndex, volume);
		self._poke(channel, soundPulseIndex, pulse);
	};

	// frequency is in decihertz (dHz)
	this.frequency = function(channel, frequency) {
		self._poke(channel, soundFrequencyIndex, frequency);
	};

	// volume: min = 0, max = 15
	this.volume = function(channel, volume) {
		self._poke(channel, soundVolumeIndex, volume);
	};

	/* == EVENTS == */
	this.loop = function(fn) {
		onLoopFunction = fn;
	};

	/* == INTERNAL == */
	// initialize memory blocks
	var gameDataBlock = this._allocate({ str: "" });
	var fontDataBlock = this._allocate({ str: "" });
	this.VIDEO = this._allocate({ size: self.VIDEO_SIZE * self.VIDEO_SIZE });
	this.TEXTBOX = this._allocate();
	this.MAP1 = this._allocate({ size: self.MAP_SIZE * self.MAP_SIZE });
	tileMapLayers.push(this.MAP1);
	this.MAP2 = this._allocate({ size: self.MAP_SIZE * self.MAP_SIZE });
	tileMapLayers.push(this.MAP2);
	var paletteBlock = this._allocate({ size: initialPaletteSize * 3 });
	var buttonBlock = this._allocate({ size: 8 });
	this.SOUND1 = this._allocate({ size: 4 });
	this.SOUND2 = this._allocate({ size: 4 });
	var modeBlock = this._allocate({ size: 8 });
	var textboxAttributeBlock = this._allocate({ size: 8 });

	tilePoolStart = (textboxAttributeBlock + 1);

	// access for debugging
	this._gameDataBlock = gameDataBlock;
	this._fontDataBlock = fontDataBlock;
	this._buttonBlock = buttonBlock;

	// events
	var onLoopFunction = null;
}

var mainProcess = addProcess();
var bitsy = mainProcess.system;