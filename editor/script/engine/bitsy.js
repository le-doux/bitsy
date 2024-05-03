/* WORLD DATA */
var room = {};
var tile = {};
var sprite = {};
var item = {};
var dialog = {};
var end = {}; // for backwards compatibility
var palette = { // start off with a default palette
		"default" : {
			name : "default",
			colors : [[0,0,0],[255,255,255],[255,255,255]]
		}
	};
var variable = {}; // these are starting variable values -- they don't update (or I don't think they will)
var tune = {};
var blip = {};
var playerId = "A";
var fontName = defaultFontName;
var textDirection = TextDirection.LeftToRight;

/* NAME-TO-ID MAPS */
var names = {
	room : {},
	tile : {},
	sprite : {},
	item : {},
	dialog : {},
	palette : {},
	tune : {},
	blip : {},
};

// todo : this is basically a copy of the one in world.js - can I remove it?
function updateNamesFromCurData() {

	function createNameMap(objectStore) {
		var map = {};

		for (id in objectStore) {
			if (objectStore[id].name != undefined && objectStore[id].name != null) {
				map[objectStore[id].name] = id;
			}
		}

		return map;
	}

	names.room = createNameMap(room);
	names.tile = createNameMap(tile);
	names.sprite = createNameMap(sprite);
	names.item = createNameMap(item);
	names.dialog = createNameMap(dialog);
	names.palette = createNameMap(palette);
	names.tune = createNameMap(tune);
	names.blip = createNameMap(blip);
}

/* GAME STATE */
var state = {}
function resetGameState() {
	state.room = "0";
	state.ava = playerId; // avatar appearance override
	state.pal = "0"; // current palette id
	state.tune = "0"; // current tune id ("0" === off)
	state.exits = []; // exits in current room
	state.endings = []; // endings in current room
}

// title helper functions
function getTitle() {
	return dialog[titleDialogId].src;
}
function setTitle(titleSrc) {
	dialog[titleDialogId] = { src:titleSrc, name:null };
}

/* FLAGS */
var flags = createDefaultFlags();

// feature flags for testing purposes
var engineFeatureFlags = {
	isSoundEnabled : true,
	isFontEnabled : true,
	isTransitionEnabled : true,
	isScriptEnabled : true,
	isDialogEnabled : true,
	isRendererEnabled : true,
};

function clearGameData() {
	room = {};
	tile = {};
	sprite = {};
	item = {};
	dialog = {};
	palette = { //start off with a default palette
		"default" : {
			name : "default",
			colors : [[0,0,0],[255,255,255],[255,255,255]]
		}
	};
	isEnding = false; //todo - correct place for this?
	variable = {};

	updateNamesFromCurData();

	fontName = defaultFontName; // TODO : reset font manager too?
	textDirection = TextDirection.LeftToRight;

	resetGameState();

	isGameLoaded = false;
	isGameOver = false;
}

// engine event hooks for the editor
var onInventoryChanged = null;
var onVariableChanged = null;
var onGameReset = null;
var onInitRoom = null;

var isPlayerEmbeddedInEditor = false;

var renderer;
if (engineFeatureFlags.isRendererEnabled) {
	renderer = new TileRenderer("bitsy");
}

var curGameData = null;
var curDefaultFontData = null;

var isGameLoaded = false;
var isGameOver = false;

function load_game(gameData, defaultFontData, startWithTitle) {
	// bitsy.log("game data in: \n" + gameData);

	curGameData = gameData; //remember the current game (used to reset the game)

	if (dialogBuffer) {
		dialogBuffer.Reset();
	}

	if (scriptInterpreter) {
		scriptInterpreter.ResetEnvironment(); // ensures variables are reset -- is this the best way?
	}

	loadWorldFromGameData(gameData);

	bitsy.log("world loaded");

	if (fontManager && !isPlayerEmbeddedInEditor && defaultFontData) {
		bitsy.log("load font");

		curDefaultFontData = defaultFontData; // store for resetting game

		// todo : consider replacing this with a more general system for requesting resources from the system?
		// hack to ensure default font is available
		fontManager.AddResource(defaultFontName + fontManager.GetExtension(), defaultFontData);

		bitsy.log("load font end");
	}

	// request text mode
	if (flags.TXT_MODE === 1) {
		bitsy.textMode(bitsy.TXT_LOREZ);
	}
	else {
		// default to 2x scale for text rendering
		bitsy.textMode(bitsy.TXT_HIREZ);
	}

	if (fontManager && dialogBuffer) {
		bitsy.log("get font");

		var font = fontManager.Get( fontName );
		dialogBuffer.SetFont(font);
		dialogRenderer.SetFont(font);

		bitsy.log("get font end");
	}

	if (dialogBuffer) {
		// this feels a little silly to me - oh well??
		dialogBuffer.SetPixelsPerRow(dialogRenderer.GetPixelsPerRow());
	}

	setInitialVariables();

	bitsy.log("ready");

	onready(startWithTitle);

	isGameLoaded = true;
}

function loadWorldFromGameData(gameData) {
	bitsy.log("load world from game data");

	var world = parseWorld(gameData);

	bitsy.log("parse world done");

	// move world data into global scope
	palette = world.palette;
	room = world.room;
	tile = world.tile;
	sprite = world.sprite;
	item = world.item;
	dialog = world.dialog;
	end = world.end; // back compat endings
	variable = world.variable;
	fontName = world.fontName;
	textDirection = world.textDirection;
	tune = world.tune;
	blip = world.blip;
	flags = world.flags;
	names = world.names;

	if (renderer) {
		renderer.SetDrawings(world.drawings);
	}

	// find starting room and initialize it
	var roomIds = Object.keys(room);

	if (player() != undefined && player().room != null && roomIds.indexOf(player().room) != -1) {
		// player has valid room
		state.room = player().room;
	}
	else if (roomIds.length > 0) {
		// player not in any room! what the heck
		state.room = roomIds[0];
	}
	else {
		// uh oh there are no rooms I guess???
		state.room = null;
	}

	if (state.room != null) {
		bitsy.log("INIT ROOM " + state.room);
		initRoom(state.room);
	}
}

function reset_cur_game() {
	if (curGameData == null) {
		return; //can't reset if we don't have the game data
	}

	stopGame();
	clearGameData();

	if (isPlayerEmbeddedInEditor && onGameReset != null) {
		onGameReset();
	}
}

function onready(startWithTitle) {
	bitsy.log("game ready!");

	if (startWithTitle === undefined || startWithTitle === null) {
		startWithTitle = true;
	}

	if (startWithTitle) { // used by editor 
		startNarrating(getTitle());
	}
}

function setInitialVariables() {
	if (!scriptInterpreter) {
		return;
	}

	for(id in variable) {
		var value = variable[id]; // default to string
		if(value === "true") {
			value = true;
		}
		else if(value === "false") {
			value = false;
		}
		else if(!isNaN(parseFloat(value))) {
			value = parseFloat(value);
		}
		scriptInterpreter.SetVariable(id,value);
	}
	scriptInterpreter.SetOnVariableChangeHandler( onVariableChanged );
}

function getOffset(evt) {
	var offset = { x:0, y:0 };

	var el = evt.target;
	var rect = el.getBoundingClientRect();

	offset.x += rect.left + el.scrollLeft;
	offset.y += rect.top + el.scrollTop;

	offset.x = evt.clientX - offset.x;
	offset.y = evt.clientY - offset.y;

	return offset;
}

function stopGame() {
	if (soundPlayer) {
		soundPlayer.stopTune();
	}
	bitsy.log("stop GAME!");
}

function update(dt) {
	if (!isGameLoaded) {
		load_game(bitsy.getGameData(), bitsy.getFontData());
	}

	if (state.room == null) {
		// in the special case where there is no valid room, end the game
		startNarrating( "", true /*isEnding*/ );
	}

	if (!transition || !transition.IsTransitionActive()) {
		updateInput();
	}

	if (transition && transition.IsTransitionActive()) {
		// transition animation takes over everything!
		transition.UpdateTransition(dt);
	}
	else {
		if (bitsy.graphicsMode() != bitsy.GFX_MAP) {
			bitsy.graphicsMode(bitsy.GFX_MAP);
		}

		if (soundPlayer) {
			soundPlayer.update(dt);
		}

		if (!isNarrating && !isEnding) {
			// draw world if game has begun
			var didAnimate = updateAnimation(dt);

			// test whether player moved so we can redraw just the avatar
			playerCurX = player().x;
			playerCurY = player().y;
			var didPlayerMove = (playerPrevX != playerCurX) || (playerPrevY != playerCurY);

			drawRoom(room[state.room], { redrawAnimated: didAnimate, redrawAvatar: didPlayerMove });

			// store player's position for next frame
			playerPrevX = playerCurX;
			playerPrevY = playerCurY;
		}
		else {
			clearRoom();
		}

		if (dialogBuffer && dialogBuffer.IsActive() && !(soundPlayer && soundPlayer.isBlipPlaying())) {
			// bitsy.log("update dialog");
			// bitsy.log("renderer");
			dialogRenderer.Draw(dialogBuffer, dt);
			// bitsy.log("buffer");
			dialogBuffer.Update(dt);
			// bitsy.log("update dialog end");
		}

		// keep moving avatar if player holds down button
		if ((!dialogBuffer || !dialogBuffer.IsActive()) && !isEnding) {
			if (curPlayerDirection != Direction.None) {
				playerHoldToMoveTimer -= dt;

				if (playerHoldToMoveTimer <= 0) {
					movePlayer(curPlayerDirection, false /* isFirstMove */);
					playerHoldToMoveTimer = 150;
					// playerHoldToMoveTimer = 16; // PERF TEST
				}
			}
		}
	}

	// clean up state if the game is ending
	if (isGameOver) {
		bitsy.log("game over");
		reset_cur_game();
	}

	return true;
}

var isAnyButtonHeld = false;
var isMenuButtonHeld = false;
var isIgnoringInput = false;

function isAnyButtonDown() {
	return bitsy.button(bitsy.BTN_UP) ||
		bitsy.button(bitsy.BTN_DOWN) ||
		bitsy.button(bitsy.BTN_LEFT) ||
		bitsy.button(bitsy.BTN_RIGHT) ||
		bitsy.button(bitsy.BTN_OK);
}

function updateInput() {
	if (dialogBuffer && dialogBuffer.IsActive()) {
		if (!(soundPlayer && soundPlayer.isBlipPlaying())) {
			if (!isAnyButtonHeld && isAnyButtonDown()) {
				/* CONTINUE DIALOG */
				if (dialogBuffer.CanContinue()) {
					var hasMoreDialog = dialogBuffer.Continue();
					if (!hasMoreDialog) {
						// ignore currently held keys UNTIL they are released (stops player from insta-moving)
						isIgnoringInput = true;
						curPlayerDirection = Direction.None;
					}
				}
				else {
					dialogBuffer.Skip();
				}
			}
		}
	}
	else if (isEnding) {
		if (!isAnyButtonHeld && isAnyButtonDown()) {
			// tell game to restart
			isGameOver = true;
		}
	}
	else if (!isIgnoringInput) {
		/* WALK */
		var prevPlayerDirection = curPlayerDirection;

		if (bitsy.button(bitsy.BTN_UP)) {
			curPlayerDirection = Direction.Up;
		}
		else if (bitsy.button(bitsy.BTN_DOWN)) {
			curPlayerDirection = Direction.Down;
		}
		else if (bitsy.button(bitsy.BTN_LEFT)) {
			curPlayerDirection = Direction.Left;
		}
		else if (bitsy.button(bitsy.BTN_RIGHT)) {
			curPlayerDirection = Direction.Right;
		}
		else {
			curPlayerDirection = Direction.None;
		}

		if (curPlayerDirection != Direction.None && curPlayerDirection != prevPlayerDirection) {
			movePlayer(curPlayerDirection, true /* isFirstMove */);
			playerHoldToMoveTimer = 500;
			// playerHoldToMoveTimer = 32; // PERF TEST
		}
	}

	if (!isAnyButtonDown()) {
		isIgnoringInput = false;
	}

	// quit when the user releases the restart button
	// todo : should I rename it bitsy.BTN_RESTART or bitsy.BTN_QUIT or bitsy.BTN_OFF?
	if (isMenuButtonHeld && !bitsy.button(bitsy.BTN_MENU)) {
		isGameOver = true;
	}

	isAnyButtonHeld = isAnyButtonDown();
	isMenuButtonHeld = bitsy.button(bitsy.BTN_MENU);
}

var animationCounter = 0;
var animationTime = 400;
function updateAnimation(dt) {
	animationCounter += dt;
	// bitsy.log("anim " + animationCounter);
	if (animationCounter >= animationTime) {
		// animate sprites
		for (id in sprite) {
			var spr = sprite[id];
			if (spr.animation.isAnimated) {
				spr.animation.frameIndex = (spr.animation.frameIndex + 1) % spr.animation.frameCount;
			}
		}

		// animate tiles
		for (id in tile) {
			var til = tile[id];
			if (til.animation.isAnimated) {
				til.animation.frameIndex = (til.animation.frameIndex + 1) % til.animation.frameCount;
			}
		}

		// animate items
		for (id in item) {
			var itm = item[id];
			if (itm.animation.isAnimated) {
				itm.animation.frameIndex = (itm.animation.frameIndex + 1) % itm.animation.frameCount;
			}
		}

		// reset counter
		animationCounter = 0;

		// updated animations this frame
		return true;
	}

	// did *not* update animations this frame
	return false;
}

function resetAllAnimations() {
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.animation.isAnimated) {
			spr.animation.frameIndex = 0;
		}
	}

	for (id in tile) {
		var til = tile[id];
		if (til.animation.isAnimated) {
			til.animation.frameIndex = 0;
		}
	}

	for (id in item) {
		var itm = item[id];
		if (itm.animation.isAnimated) {
			itm.animation.frameIndex = 0;
		}
	}
}

function getSpriteAt(x, y, roomId) {
	if (roomId === undefined) {
		roomId = state.room;
	}

	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === roomId) {
			if (spr.x == x && spr.y == y) {
				return id;
			}
		}
	}

	return null;
}

var Direction = {
	None : -1,
	Up : 0,
	Down : 1,
	Left : 2,
	Right : 3
};

var curPlayerDirection = Direction.None;
var playerHoldToMoveTimer = 0;
var playerPrevX = 0;
var playerPrevY = 0;

function movePlayer(direction, isFirstMove) {
	didPlayerMove = false;
	var roomIds = Object.keys(room);

	if (player().room == null || roomIds.indexOf(player().room) < 0) {
		return; // player room is missing or invalid.. can't move them!
	}

	var spr = null;

	if (direction == Direction.Left && !(spr = getSpriteLeft()) && !isWallLeft()) {
		player().x -= 1;
	}
	else if (direction == Direction.Right && !(spr = getSpriteRight()) && !isWallRight()) {
		player().x += 1;
	}
	else if (direction == Direction.Up && !(spr = getSpriteUp()) && !isWallUp()) {
		player().y -= 1;
	}
	else if (direction == Direction.Down && !(spr = getSpriteDown()) && !isWallDown()) {
		player().y += 1;
	}

	var ext = getExit( player().room, player().x, player().y );
	var end = getEnding( player().room, player().x, player().y );
	var itmIndex = getItemIndex( player().room, player().x, player().y );

	// only play one sound effect per "turn"
	var blipId = null;

	// do items first, because you can pick up an item AND go through a door
	if (itmIndex > -1) {
		var itm = room[player().room].items[itmIndex];
		var itemRoom = player().room;

		// play sound on pitck up item
		if (item[itm.id].blip != null) {
			blipId = item[itm.id].blip;
		}

		startItemDialog(itm.id, function() {
			// remove item from room
			room[itemRoom].items.splice(itmIndex, 1);

			// update player inventory
			if (player().inventory[itm.id]) {
				player().inventory[itm.id] += 1;
			}
			else {
				player().inventory[itm.id] = 1;
			}

			// show inventory change in UI
			if (onInventoryChanged != null) {
				onInventoryChanged(itm.id);
			}
		});
	}

	if (end) {
		startEndingDialog(end);
	}
	else if (ext) {
		movePlayerThroughExit(ext);
	}
	else if (spr) {
		// play sound on greet sprite
		if (sprite[spr].blip != null) {
			blipId = sprite[spr].blip;
		}

		startSpriteDialog(spr /*spriteId*/);
	}

	// TODO : maybe add in a future update?
	/*
	// play sound when player moves (if no other sound selected)
	if (isFirstMove && blipId === null && sprite[state.ava].blip != null) {
		blipId = sprite[state.ava].blip;
		randomizeBlip = true;
		blipChannel = bitsy.SOUND2; // play walking sfx *under* the tune melody
	}
	*/

	if (soundPlayer && blipId != null && blip[blipId]) {
		soundPlayer.playBlip(blip[blipId]);
	}
}

var transition;
if (engineFeatureFlags.isTransitionEnabled) {
	transition = new TransitionManager();
}

function movePlayerThroughExit(ext) {
	var GoToDest = function() {
		if (transition && ext.transition_effect != null) {
			transition.BeginTransition(
				player().room,
				player().x,
				player().y,
				ext.dest.room,
				ext.dest.x,
				ext.dest.y,
				ext.transition_effect);

			transition.UpdateTransition(0);

			transition.OnTransitionComplete(function() {
				player().room = ext.dest.room;
				player().x = ext.dest.x;
				player().y = ext.dest.y;
				state.room = ext.dest.room;
				initRoom(state.room);
			});
		}
		else {
			player().room = ext.dest.room;
			player().x = ext.dest.x;
			player().y = ext.dest.y;
			state.room = ext.dest.room;

			initRoom(state.room);
		}
	};

	if (ext.dlg != undefined && ext.dlg != null) {
		// TODO : I need to simplify dialog code,
		// so I don't have to get the ID and the source str
		// every time!
		startDialog(
			dialog[ext.dlg].src,
			ext.dlg,
			function(result) {
				var isLocked = ext.property && ext.property.locked === true;
				if (!isLocked) {
					GoToDest();
				}
			},
			ext);
	}
	else {
		GoToDest();
	}
}

/* PALETTE INDICES */
var backgroundIndex = 0;
var textBackgroundIndex = 1;
var textArrowIndex = 2;
var textColorIndex = 3;

// precalculated rainbow colors
var rainbowColorStartIndex = 4;
var rainbowColorCount = 10;
var rainbowColors = [
	[255,0,0],
	[255,217,0],
	[78,255,0],
	[0,255,125],
	[0,192,255],
	[0,18,255],
	[136,0,255],
	[255,0,242],
	[255,0,138],
	[255,0,61],
];

function updatePaletteWithTileColors(tileColors) {
	// the screen background color should match the first tile color
	if (tileColors.length > 0) {
		var color = tileColors[0];
		bitsy.color(backgroundIndex, color[0], color[1], color[2]);
	}
	else {
		// as a fallback, use black as the background
		bitsy.log("no tile colors!");
		bitsy.color(backgroundIndex, 0, 0, 0);
	}

	// textbox colors
	bitsy.color(textBackgroundIndex, 0, 0, 0); // black
	bitsy.color(textArrowIndex, 255, 255, 255); // white
	bitsy.color(textColorIndex, 255, 255, 255); // white

	// rainbow colors
	for (var i = 0; i < rainbowColorCount; i++) {
		var color = rainbowColors[i];
		bitsy.color(rainbowColorStartIndex + i, color[0], color[1], color[2]);
	}

	// tile colors
	for (var i = 0; i < tileColors.length; i++) {
		var color = tileColors[i];
		bitsy.color(tileColorStartIndex + i, color[0], color[1], color[2]);
	}
}

function updatePalette(palId) {
	state.pal = palId;
	var pal = palette[state.pal];
	updatePaletteWithTileColors(pal.colors);
}

function initRoom(roomId) {
	bitsy.log("init room " + roomId);

	updatePalette(getRoomPal(roomId));

	// update avatar appearance
	state.ava = (room[roomId].ava != null) ? room[roomId].ava : playerId;

	if (renderer) {
		renderer.ClearCache();
	}

	// init exit properties
	state.exits = [];
	for (var i = 0; i < room[roomId].exits.length; i++) {
		var exit = createExitData(
			/* x 			*/ room[roomId].exits[i].x,
			/* y 			*/ room[roomId].exits[i].y,
			/* destRoom 	*/ room[roomId].exits[i].dest.room,
			/* destX 		*/ room[roomId].exits[i].dest.x,
			/* destY 		*/ room[roomId].exits[i].dest.y,
			/* transition 	*/ room[roomId].exits[i].transition_effect,
			/* dlg 			*/ room[roomId].exits[i].dlg);
		exit.property = { locked: false };

		state.exits.push(exit);
	}

	// init ending properties
	state.endings = [];
	for (var i = 0; i < room[roomId].endings.length; i++) {
		var end = createEndingData(
			/* id */ room[roomId].endings[i].id,
			/* x  */ room[roomId].endings[i].x,
			/* y  */ room[roomId].endings[i].y);
		end.property = { locked: false };

		state.endings.push(end);
	}

	if (soundPlayer) {
		if (!room[roomId].tune || room[roomId].tune === "0" || !tune[room[roomId].tune]) {
			// stop music
			state.tune = "0";
			soundPlayer.stopTune();
		}
		else if (room[roomId].tune != state.tune) {
			// start music
			state.tune = room[roomId].tune;
			soundPlayer.playTune(tune[state.tune]);
		}
	}

	var drawArgs = { redrawAll: true };
	drawRoom(room[roomId], drawArgs);

	if (onInitRoom) {
		onInitRoom(roomId);
	}
}

function getItemIndex( roomId, x, y ) {
	for( var i = 0; i < room[roomId].items.length; i++ ) {
		var itm = room[roomId].items[i];
		if ( itm.x == x && itm.y == y)
			return i;
	}
	return -1;
}

function getSpriteLeft() { //repetitive?
	return getSpriteAt( player().x - 1, player().y );
}

function getSpriteRight() {
	return getSpriteAt( player().x + 1, player().y );
}

function getSpriteUp() {
	return getSpriteAt( player().x, player().y - 1 );
}

function getSpriteDown() {
	return getSpriteAt( player().x, player().y + 1 );
}

function isWallLeft() {
	return (player().x - 1 < 0) || isWall( player().x - 1, player().y );
}

function isWallRight() {
	return (player().x + 1 >= bitsy.MAP_SIZE) || isWall(player().x + 1, player().y);
}

function isWallUp() {
	return (player().y - 1 < 0) || isWall( player().x, player().y - 1 );
}

function isWallDown() {
	return (player().y + 1 >= bitsy.MAP_SIZE) || isWall(player().x, player().y + 1);
}

function isWall(x, y, roomId) {
	if (roomId == undefined || roomId == null) {
		roomId = state.room;
	}

	var tileId = getTile(x, y, roomId);
	if (tileId === '0') {
		return false; // Blank spaces aren't walls, ya doofus
	}

	if (tile[tileId].isWall === undefined || tile[tileId].isWall === null) {
		// No wall-state defined: check room-specific walls
		var i = room[roomId].walls.indexOf(getTile(x, y, roomId));
		return (i > -1);
	}

	// Otherwise, use the tile's own wall-state
	return tile[tileId].isWall;
}

function getItem(roomId,x,y) {
	for (i in room[roomId].items) {
		var item = room[roomId].items[i];
		if (x == item.x && y == item.y) {
			return item;
		}
	}
	return null;
}

// todo : roomId isn't useful in these functions anymore! safe to remove?
function getExit(roomId, x, y) {
	for (i in state.exits) {
		var e = state.exits[i];
		if (x == e.x && y == e.y) {
			return e;
		}
	}
	return null;
}

function getEnding(roomId, x, y) {
	for (i in state.endings) {
		var e = state.endings[i];
		if (x == e.x && y == e.y) {
			return e;
		}
	}
	return null;
}

function getTile(x, y, roomId) {
	// bitsy.log(x + " " + y);
	var t = getRoom(roomId).tilemap[y][x];
	return t;
}

function player() {
	return sprite[playerId];
}

// Sort of a hack for legacy palette code (when it was just an array)
function getPal(id) {
	if (palette[id] === undefined) {
		id = "default";
	}

	return palette[ id ].colors;
}

function getRoom(id) {
	return room[id === undefined ? state.room : id];
}

function isSpriteOffstage(id) {
	return sprite[id].room == null;
}

function serializeNote(note, key, useFriendlyName) {
	var isSolfa = (key != undefined && key != null);
	var noteType = (isSolfa === true) ? Solfa : Note;

	if (isSolfa && key.scale.indexOf(note) === -1) {
		// no matching note in key
		return null;
	}

	if (isSolfa && useFriendlyName != true) {
		for (var name in Solfa) {
			if (Solfa[name] === note) {
				return name.toLowerCase();
			}
		}

		// no solfa note found
		return null;
	}

	// for a solfa note's "friendly name" convert to the chromatic equivalent
	if (isSolfa && useFriendlyName === true) {
		note = key.notes[note];
	}

	// from this point on, we know the note we're looking for is chromatic
	for (var name in Note) {
		if (Note[name] === note) {
			name = name.replace("_SHARP", "#");
			if (useFriendlyName === true && name === "H") {
				name = "C";
			}
			return name;
		}
	}

	// no note found
	return symbol;
}

function serializeOctave(octave) {
	for (var symbol in Octave) {
		if (Octave[symbol] === octave) {
			return symbol;
		}
	}

	// default to middle octave
	return "4";
}

//TODO this is in progress and doesn't support all features
function serializeWorld(skipFonts) {
	if (skipFonts === undefined || skipFonts === null) {
		skipFonts = false;
	}

	// update version flags
	flags.VER_MAJ = version.major;
	flags.VER_MIN = version.minor;

	var worldStr = "";
	/* TITLE */
	worldStr += getTitle() + "\n";
	worldStr += "\n";
	/* VERSION */
	worldStr += "# BITSY VERSION " + getEngineVersion() + "\n"; // add version as a comment for debugging purposes
	if (version.devBuildPhase != "RELEASE") {
		worldStr += "# DEVELOPMENT BUILD -- " + version.devBuildPhase;
	}
	worldStr += "\n";
	/* FLAGS */
	for (f in flags) {
		worldStr += "! " + f + " " + flags[f] + "\n";
	}
	worldStr += "\n"
	/* FONT */
	if (fontName != defaultFontName) {
		worldStr += "DEFAULT_FONT " + fontName + "\n";
		worldStr += "\n"
	}
	if (textDirection != TextDirection.LeftToRight) {
		worldStr += "TEXT_DIRECTION " + textDirection + "\n";
		worldStr += "\n"
	}
	/* PALETTE */
	for (id in palette) {
		if (id != "default") {
			worldStr += "PAL " + id + "\n";
			for (i in getPal(id)) {
				for (j in getPal(id)[i]) {
					worldStr += getPal(id)[i][j];
					if (j < 2) worldStr += ",";
				}
				worldStr += "\n";
			}
			if (palette[id].name != null) {
				worldStr += "NAME " + palette[id].name + "\n";
			}
			worldStr += "\n";
		}
	}
	/* ROOM */
	for (id in room) {
		worldStr += "ROOM " + id + "\n";
		if ( flags.ROOM_FORMAT == 0 ) {
			// old non-comma separated format
			for (i in room[id].tilemap) {
				for (j in room[id].tilemap[i]) {
					worldStr += room[id].tilemap[i][j];	
				}
				worldStr += "\n";
			}
		}
		else if ( flags.ROOM_FORMAT == 1 ) {
			// new comma separated format
			for (i in room[id].tilemap) {
				for (j in room[id].tilemap[i]) {
					worldStr += room[id].tilemap[i][j];
					if (j < room[id].tilemap[i].length-1) worldStr += ","
				}
				worldStr += "\n";
			}
		}
		if (room[id].name != null) {
			/* NAME */
			worldStr += "NAME " + room[id].name + "\n";
		}
		if (room[id].walls.length > 0) {
			/* WALLS */
			worldStr += "WAL ";
			for (j in room[id].walls) {
				worldStr += room[id].walls[j];
				if (j < room[id].walls.length-1) {
					worldStr += ",";
				}
			}
			worldStr += "\n";
		}
		if (room[id].items.length > 0) {
			/* ITEMS */
			for (j in room[id].items) {
				var itm = room[id].items[j];
				worldStr += "ITM " + itm.id + " " + itm.x + "," + itm.y;
				worldStr += "\n";
			}
		}
		if (room[id].exits.length > 0) {
			/* EXITS */
			for (j in room[id].exits) {
				var e = room[id].exits[j];
				if ( isExitValid(e) ) {
					worldStr += "EXT " + e.x + "," + e.y + " " + e.dest.room + " " + e.dest.x + "," + e.dest.y;
					if (e.transition_effect != undefined && e.transition_effect != null) {
						worldStr += " FX " + e.transition_effect;
					}
					if (e.dlg != undefined && e.dlg != null) {
						worldStr += " DLG " + e.dlg;
					}
					worldStr += "\n";
				}
			}
		}
		if (room[id].endings.length > 0) {
			/* ENDINGS */
			for (j in room[id].endings) {
				var e = room[id].endings[j];
				// todo isEndingValid
				worldStr += "END " + e.id + " " + e.x + "," + e.y;
				worldStr += "\n";
			}
		}
		if (room[id].pal != null && room[id].pal != "default") {
			/* PALETTE */
			worldStr += "PAL " + room[id].pal + "\n";
		}
		if (room[id].ava != null) {
			/* AVATAR SPRITE */
			worldStr += "AVA " + room[id].ava + "\n";
		}
		if (room[id].tune != null && room[id].tune != "0") {
			/* TUNE */
			worldStr += "TUNE " + room[id].tune + "\n";
		}
		worldStr += "\n";
	}
	/* TILES */
	for (id in tile) {
		worldStr += "TIL " + id + "\n";
		worldStr += serializeDrawing( "TIL_" + id );
		if (tile[id].name != null && tile[id].name != undefined) {
			/* NAME */
			worldStr += "NAME " + tile[id].name + "\n";
		}
		if (tile[id].isWall != null && tile[id].isWall != undefined) {
			/* WALL */
			worldStr += "WAL " + tile[id].isWall + "\n";
		}
		if (tile[id].col != null && tile[id].col != undefined && tile[id].col != 1) {
			/* COLOR OVERRIDE */
			worldStr += "COL " + tile[id].col + "\n";
		}
		if (tile[id].bgc != null && tile[id].bgc != undefined && tile[id].bgc != 0) {
			/* BACKGROUND COLOR OVERRIDE */
			if (tile[id].bgc < 0) {
				// transparent background
				worldStr += "BGC *\n";
			}
			else {
				worldStr += "BGC " + tile[id].bgc + "\n";
			}
		}
		worldStr += "\n";
	}
	/* SPRITES */
	for (id in sprite) {
		worldStr += "SPR " + id + "\n";
		worldStr += serializeDrawing( "SPR_" + id );
		if (sprite[id].name != null && sprite[id].name != undefined) {
			/* NAME */
			worldStr += "NAME " + sprite[id].name + "\n";
		}
		if (sprite[id].dlg != null) {
			worldStr += "DLG " + sprite[id].dlg + "\n";
		}
		if (sprite[id].room != null) {
			/* SPRITE POSITION */
			worldStr += "POS " + sprite[id].room + " " + sprite[id].x + "," + sprite[id].y + "\n";
		}
		if (sprite[id].inventory != null) {
			for(itemId in sprite[id].inventory) {
				worldStr += "ITM " + itemId + " " + sprite[id].inventory[itemId] + "\n";
			}
		}
		if (sprite[id].col != null && sprite[id].col != undefined && sprite[id].col != 2) {
			/* COLOR OVERRIDE */
			worldStr += "COL " + sprite[id].col + "\n";
		}
		if (sprite[id].bgc != null && sprite[id].bgc != undefined && sprite[id].bgc != 0) {
			/* BACKGROUND COLOR OVERRIDE */
			if (sprite[id].bgc < 0) {
				// transparent background
				worldStr += "BGC *\n";
			}
			else {
				worldStr += "BGC " + sprite[id].bgc + "\n";
			}
		}
		if (sprite[id].blip != null && sprite[id].blip != undefined) {
			/* BLIP */
			worldStr += "BLIP " + sprite[id].blip + "\n";
		}
		worldStr += "\n";
	}
	/* ITEMS */
	for (id in item) {
		worldStr += "ITM " + id + "\n";
		worldStr += serializeDrawing( "ITM_" + id );
		if (item[id].name != null && item[id].name != undefined) {
			/* NAME */
			worldStr += "NAME " + item[id].name + "\n";
		}
		if (item[id].dlg != null) {
			worldStr += "DLG " + item[id].dlg + "\n";
		}
		if (item[id].col != null && item[id].col != undefined && item[id].col != 2) {
			/* COLOR OVERRIDE */
			worldStr += "COL " + item[id].col + "\n";
		}
		if (item[id].bgc != null && item[id].bgc != undefined && item[id].bgc != 0) {
			/* BACKGROUND COLOR OVERRIDE */
			if (item[id].bgc < 0) {
				// transparent background
				worldStr += "BGC *\n";
			}
			else {
				worldStr += "BGC " + item[id].bgc + "\n";
			}
		}
		if (item[id].blip != null && item[id].blip != undefined) {
			/* BLIP */
			worldStr += "BLIP " + item[id].blip + "\n";
		}
		worldStr += "\n";
	}
	/* DIALOG */
	for (id in dialog) {
		if (id != titleDialogId) {
			worldStr += "DLG " + id + "\n";
			worldStr += dialog[id].src + "\n";
			if (dialog[id].name != null) {
				worldStr += "NAME " + dialog[id].name + "\n";
			}
			worldStr += "\n";
		}
	}
	/* ENDINGS (for backwards compability only) */
	for (id in end) {
		worldStr += "END " + id + "\n";
		worldStr += end[id].src + "\n";
		worldStr += "\n";
	}
	/* VARIABLES */
	for (id in variable) {
		worldStr += "VAR " + id + "\n";
		worldStr += variable[id] + "\n";
		worldStr += "\n";
	}
	/* TUNES */
	for (id in tune) {
		if (id === "0") {
			continue;
		}

		worldStr += "TUNE " + id + "\n";
		for (var i = 0; i < maxTuneLength && i < tune[id].melody.length; i++) {
			// MELODY
			for (var j = 0; j < barLength; j++) {
				var noteStr = serializeNote(tune[id].melody[i][j].note, tune[id].key);
				if (noteStr === null) {
					tune[id].melody[i][j].beats = 0;
				}
				if (tune[id].melody[i][j].beats != 1) {
					worldStr += tune[id].melody[i][j].beats;
				}
				if (tune[id].melody[i][j].beats > 0) {
					worldStr += noteStr;
				}
				if (tune[id].melody[i][j].beats > 0 && tune[id].melody[i][j].octave != Octave[4]) {
					worldStr += serializeOctave(tune[id].melody[i][j].octave);
				}
				if (tune[id].melody[i][j].beats > 0 && tune[id].melody[i][j].blip != undefined) {
					// todo : create constant for the blip separator?
					worldStr += "~" + tune[id].melody[i][j].blip;
				}
				if (j < 15) {
					worldStr += ",";
				}
			}
			worldStr += "\n";

			// HARMONY
			// todo : lots of copy-pasting - I could probably make some helper functions to simplify this
			for (var j = 0; j < barLength; j++) {
				var noteStr = serializeNote(tune[id].harmony[i][j].note, tune[id].key);
				if (noteStr === null) {
					tune[id].harmony[i][j].beats = 0;
				}
				if (tune[id].harmony[i][j].beats != 1) {
					worldStr += tune[id].harmony[i][j].beats;
				}
				if (tune[id].harmony[i][j].beats > 0) {
					worldStr += noteStr;
				}
				if (tune[id].harmony[i][j].beats > 0 && tune[id].harmony[i][j].octave != Octave[4]) {
					worldStr += serializeOctave(tune[id].harmony[i][j].octave);
				}
				if (tune[id].harmony[i][j].beats > 0 && tune[id].harmony[i][j].blip != undefined) {
					worldStr += "~" + tune[id].harmony[i][j].blip;
				}
				if (j < 15) {
					worldStr += ",";
				}
			}
			worldStr += "\n";

			if (i < (tune[id].melody.length - 1)) {
				worldStr += ">";
				worldStr += "\n";
			}
		}
		if (tune[id].name != null) {
			/* NAME */
			worldStr += "NAME " + tune[id].name + "\n";
		}
		if (tune[id].key != undefined && tune[id].key != null) {
			worldStr += "KEY ";
			for (var i = 0; i < Solfa.COUNT; i++) {
				worldStr += serializeNote(tune[id].key.notes[i]);
				if (i < Solfa.COUNT - 1) {
					worldStr += ",";
				}
			}
			worldStr += " ";
			for (var i = 0; i < tune[id].key.scale.length; i++) {
				worldStr += serializeNote(tune[id].key.scale[i], tune[id].key);
				if (i < tune[id].key.scale.length - 1) {
					worldStr += ",";
				}
			}
			worldStr += "\n";
		}
		worldStr += "TMP ";
		switch (tune[id].tempo) {
			case Tempo.SLW:
				worldStr += "SLW";
				break;
			case Tempo.MED:
				worldStr += "MED";
				break;
			case Tempo.FST:
				worldStr += "FST";
				break;
			case Tempo.XFST:
				worldStr += "XFST";
				break;
		}
		worldStr += "\n";
		worldStr += "SQR ";
		switch (tune[id].instrumentA) {
			case SquareWave.P8:
				worldStr += "P8";
				break;
			case SquareWave.P4:
				worldStr += "P4";
				break;
			case SquareWave.P2:
				worldStr += "P2";
				break;
		}
		worldStr += " ";
		switch (tune[id].instrumentB) {
			case SquareWave.P8:
				worldStr += "P8";
				break;
			case SquareWave.P4:
				worldStr += "P4";
				break;
			case SquareWave.P2:
				worldStr += "P2";
				break;
		}
		worldStr += "\n";
		if (tune[id].key != undefined && tune[id].key != null && tune[id].arpeggioPattern != ArpeggioPattern.OFF) {
			switch (tune[id].arpeggioPattern) {
				case ArpeggioPattern.UP:
					worldStr += "ARP UP\n";
					break;
				case ArpeggioPattern.DWN:
					worldStr += "ARP DWN\n";
					break;
				case ArpeggioPattern.INT5:
					worldStr += "ARP INT5\n";
					break;
				case ArpeggioPattern.INT8:
					worldStr += "ARP INT8\n";
					break;
			}
		}
		worldStr += "\n";
	}
	/* BLIP */
	for (id in blip) {
		if (id === "0") {
			continue;
		}

		worldStr += "BLIP " + id + "\n";
		// pitches
		if (blip[id].pitchA.beats > 0) {
			worldStr += serializeNote(blip[id].pitchA.note);
			if (blip[id].pitchA.octave != Octave[4]) {
				worldStr += serializeOctave(blip[id].pitchA.octave);
			}
		}
		else {
			worldStr += blip[id].pitchA.beats;
		}
		worldStr += ",";
		if (blip[id].pitchB.beats > 0) {
			worldStr += serializeNote(blip[id].pitchB.note);
			if (blip[id].pitchB.octave != Octave[4]) {
				worldStr += serializeOctave(blip[id].pitchB.octave);
			}
		}
		else {
			worldStr += blip[id].pitchB.beats;
		}
		worldStr += ",";
		if (blip[id].pitchC.beats > 0) {
			worldStr += serializeNote(blip[id].pitchC.note);
			if (blip[id].pitchC.octave != Octave[4]) {
				worldStr += serializeOctave(blip[id].pitchC.octave);
			}
		}
		else {
			worldStr += blip[id].pitchC.beats;
		}
		worldStr += "\n";
		if (blip[id].name != null) {
			/* NAME */
			worldStr += "NAME " + blip[id].name + "\n";
		}
		// envelope
		worldStr += "ENV " + blip[id].envelope.attack
			+ " " + blip[id].envelope.decay
			+ " " + blip[id].envelope.sustain
			+ " " + blip[id].envelope.length
			+ " " + blip[id].envelope.release + "\n";
		// beat
		worldStr += "BEAT " + blip[id].beat.time
			+ " " + blip[id].beat.delay + "\n";
		// instrument (square wave type)
		worldStr += "SQR ";
		switch (blip[id].instrument) {
			case SquareWave.P8:
				worldStr += "P8";
				break;
			case SquareWave.P4:
				worldStr += "P4";
				break;
			case SquareWave.P2:
				worldStr += "P2";
				break;
		}
		worldStr += "\n";
		// other parameters
		if (blip[id].doRepeat === true) {
			worldStr += "RPT 1\n";
		}
		// TODO : consider for future update
		// if (blip[id].doSlide === true) {
		// 	worldStr += "SLD 1\n";
		// }
		worldStr += "\n";
	}
	/* FONT */
	// TODO : support multiple fonts
	if (fontManager && fontName != defaultFontName && !skipFonts) {
		worldStr += fontManager.GetData(fontName);
	}

	return worldStr;
}

function serializeDrawing(drwId) {
	if (!renderer) {
		return "";
	}

	var drawingData = renderer.GetDrawingSource(drwId);
	var drwStr = "";
	for (f in drawingData) {
		for (y in drawingData[f]) {
			var rowStr = "";
			for (x in drawingData[f][y]) {
				rowStr += drawingData[f][y][x];
			}
			drwStr += rowStr + "\n";
		}
		if (f < (drawingData.length-1)) drwStr += ">\n";
	}
	return drwStr;
}

function isExitValid(e) {
	var hasValidStartPos = e.x >= 0 && e.x < bitsy.MAP_SIZE && e.y >= 0 && e.y < bitsy.MAP_SIZE;
	var hasDest = e.dest != null;
	var hasValidRoomDest = (e.dest.room != null && e.dest.x >= 0 && e.dest.x < bitsy.MAP_SIZE && e.dest.y >= 0 && e.dest.y < bitsy.MAP_SIZE);
	return hasValidStartPos && hasDest && hasValidRoomDest;
}

function setTile(mapId, x, y, tileId) {
	bitsy.set(mapId, (y * bitsy.MAP_SIZE) + x, tileId);
}

function drawTile(tileId, x, y) {
	setTile(bitsy.MAP1, x, y, tileId);
}

function drawSprite(tileId, x, y) {
	setTile(bitsy.MAP2, x, y, tileId);
}

function drawItem(tileId, x, y) {
	setTile(bitsy.MAP2, x, y, tileId);
}

// var debugLastRoomDrawn = "0";

function clearRoom() {
	var paletteId = "default";

	if (room === undefined) {
		// protect against invalid rooms
		return;
	}

	if (room.pal != null && palette[paletteId] != undefined) {
		paletteId = room.pal;
	}

	// clear background & foreground
	bitsy.fill(bitsy.MAP1, 0);
	bitsy.fill(bitsy.MAP2, 0);
}

function drawRoomBackground(room, frameIndex, redrawAnimatedOnly) {
	if (!redrawAnimatedOnly) {
		// clear background map
		bitsy.fill(bitsy.MAP1, 0);
	}

	// NOTE: interestingly the slowest part of this is iterating over all the tiles, not actually drawing them
	for (var y = 0; y < bitsy.MAP_SIZE; y++) {
		for (var x = 0; x < bitsy.MAP_SIZE; x++) {
			var id = room.tilemap[y][x];

			if (id != "0" && tile[id] == null) { // hack-around to avoid corrupting files (not a solution though!)
				id = "0";
				room.tilemap[y][x] = id;
			}

			if (id != "0" && (!redrawAnimatedOnly || tile[id].animation.isAnimated)) {
				drawTile(getTileFrame(tile[id], frameIndex), x, y);
			}
		}
	}
}

function drawRoomForeground(room, frameIndex, redrawAnimatedOnly) {
	if (!redrawAnimatedOnly) {
		// clear foreground map
		bitsy.fill(bitsy.MAP2, 0);
	}

	// draw items
	for (var i = 0; i < room.items.length; i++) {
		var itm = room.items[i];
		if (!redrawAnimatedOnly || item[itm.id].animation.isAnimated) {
			drawItem(getItemFrame(item[itm.id], frameIndex), itm.x, itm.y);
		}
	}

	// draw sprites
	for (id in sprite) {
		var spr = sprite[id];
		if (id != playerId && spr.room === room.id && (!redrawAnimatedOnly || spr.animation.isAnimated)) {
			drawSprite(getSpriteFrame(spr, frameIndex), spr.x, spr.y);
		}
	}
}

function drawRoomForegroundTile(room, frameIndex, x, y) {
	// draw items
	for (var i = 0; i < room.items.length; i++) {
		var itm = room.items[i];
		if (itm.x === x && itm.y === y) {
			drawItem(getItemFrame(item[itm.id], frameIndex), itm.x, itm.y);
		}
	}

	// draw sprites
	for (id in sprite) {
		var spr = sprite[id];
		if (id != playerId && spr.room === room.id && spr.x === x && spr.y === y) {
			drawSprite(getSpriteFrame(spr, frameIndex), spr.x, spr.y);
		}
	}
}

function drawRoom(room, args) {
	if (room === undefined || isNarrating) {
		// protect against invalid rooms
		return;
	}

	var redrawAll = args && (args.redrawAll === true);
	var redrawAnimated = args && (args.redrawAnimated === true);
	var redrawAvatar = args && (args.redrawAvatar === true);
	var frameIndex = args ? args.frameIndex : undefined;

	// if *only* redrawing the avatar, first clear its previous position
	if (redrawAvatar) {
		setTile(bitsy.MAP2, playerPrevX, playerPrevY, 0);
		// also redraw any sprite or item that might be "under" the player (todo: possible perf issue?)
		drawRoomForegroundTile(room, frameIndex, playerPrevX, playerPrevY);
	}

	// draw background & foreground tiles
	if (redrawAll || redrawAnimated) {
		// draw tiles
		drawRoomBackground(room, frameIndex, redrawAnimated);
		// draw sprites & items
		drawRoomForeground(room, frameIndex, redrawAnimated);
	}

	// draw the player's avatar at its current position
	if ((redrawAll || redrawAnimated || redrawAvatar) && sprite[playerId] && sprite[playerId].room === room.id) {
		var spr = sprite[playerId];
		var x = spr.x;
		var y = spr.y;

		// get the avatar override sprite (if there is one)
		if (state.ava && state.ava != playerId && sprite[state.ava]) {
			spr = sprite[state.ava];
		}

		drawSprite(getSpriteFrame(spr, frameIndex), x, y);
	}
}

// TODO : remove these get*Image methods
function getTileFrame(t, frameIndex) {
	if (!renderer) {
		return null;
	}
	return renderer.GetDrawingFrame(t, frameIndex);
}

function getSpriteFrame(s, frameIndex) {
	if (!renderer) {
		return null;
	}
	return renderer.GetDrawingFrame(s, frameIndex);
}

function getItemFrame(itm, frameIndex) {
	if (!renderer) {
		return null;
	}
	return renderer.GetDrawingFrame(itm, frameIndex);
}

function curDefaultPal() {
	return getRoomPal(state.room);
}

function getRoomPal(roomId) {
	var defaultId = "default";

	if (roomId == null) {
		return defaultId;
	}
	else if (room[roomId].pal != null) {
		//a specific palette was chosen
		return room[roomId].pal;
	}
	else {
		if (roomId in palette) {
			//there is a palette matching the name of the room
			return roomId;
		}
		else {
			//use the default palette
			return defaultId;
		}
	}
	return defaultId;
}

var isDialogMode = false;
var isNarrating = false;
var isEnding = false;

var dialogModule;
var dialogRenderer;
var dialogBuffer;
if (engineFeatureFlags.isDialogEnabled) {
	dialogModule = new Dialog();
	dialogRenderer = dialogModule.CreateRenderer();
	dialogBuffer = dialogModule.CreateBuffer();
}

var fontManager;
if (engineFeatureFlags.isFontEnabled) {
	fontManager = new FontManager();
}

// TODO : is this scriptResult thing being used anywhere???
function onExitDialog(scriptResult, dialogCallback) {
	isDialogMode = false;
	bitsy.textbox(false);

	if (isNarrating) {
		isNarrating = false;

		// redraw the room
		drawRoom(room[state.room], { redrawAll: true });
	}

	if (isDialogPreview) {
		isDialogPreview = false;

		if (onDialogPreviewEnd != null) {
			onDialogPreviewEnd();
		}
	}

	if (dialogCallback != undefined && dialogCallback != null) {
		dialogCallback(scriptResult);
	}

	if (soundPlayer) {
		soundPlayer.resumeTune();
	}
}

/*
TODO
- titles and endings should also take advantage of the script pre-compilation if possible??
- could there be a namespace collision?
- what about dialog NAMEs vs IDs?
- what about a special script block separate from DLG?
*/
function startNarrating(dialogStr, end) {
	bitsy.log("NARRATE " + dialogStr);

	if(end === undefined) {
		end = false;
	}

	isNarrating = true;
	isEnding = end;

	if (isEnding && soundPlayer) {
		soundPlayer.stopTune();
	}

	// clear the room tiles before narrating
	bitsy.fill(bitsy.MAP1, 0);
	bitsy.fill(bitsy.MAP2, 0);

	startDialog(dialogStr);
}

function startEndingDialog(ending) {
	isNarrating = true;
	isEnding = true;

	var endingScriptId = ending.id;
	var endingDialogStr = dialog[ending.id].src;

	// compatibility with pre-7.0 endings
	if (flags.DLG_COMPAT === 1 && end[ending.id]) {
		endingScriptId = "end_compat_" + ending.id;
		endingDialogStr = end[ending.id].src;
	}

	var tmpTuneId = null;
	if (isEnding && soundPlayer) {
		tmpTuneId = soundPlayer.getCurTuneId();
		soundPlayer.stopTune();
	}

	startDialog(
		endingDialogStr,
		endingScriptId,
		function() {
			var isLocked = ending.property && ending.property.locked === true;
			if (isLocked) {
				isEnding = false;

				// if the ending was cancelled, restart the music
				// todo : should it resume from where it started? (right now it starts over)
				if (tmpTuneId && soundPlayer && !soundPlayer.isTunePlaying()) {
					soundPlayer.playTune(tune[tmpTuneId]);
				}
			}
		},
		ending);
}

function startItemDialog(itemId, dialogCallback) {
	var dialogId = item[itemId].dlg;
	// bitsy.log("START ITEM DIALOG " + dialogId);
	if (dialog[dialogId]) {
		var dialogStr = dialog[dialogId].src;
		startDialog(dialogStr, dialogId, dialogCallback);
	}
	else {
		dialogCallback();
	}
}

function startSpriteDialog(spriteId) {
	var spr = sprite[spriteId];
	var dialogId = spr.dlg;

	// back compat for when dialog IDs were implicitly the same as sprite IDs
	if (flags.DLG_COMPAT === 1 && (dialogId === undefined || dialogId === null)) {
		dialogId = spr.id;
	}

	// bitsy.log("START SPRITE DIALOG " + dialogId);
	if (dialog[dialogId]){
		var dialogStr = dialog[dialogId].src;
		startDialog(dialogStr, dialogId);
	}
}

function startDialog(dialogStr, scriptId, dialogCallback, objectContext) {
	bitsy.log("START DIALOG");

	if (soundPlayer) {
		soundPlayer.pauseTune();
	}

	if (dialogStr.length <= 0) {
		onExitDialog(null, dialogCallback);
		return;
	}

	if (!dialogBuffer) {
		bitsy.log(dialogStr);
		onExitDialog(null, dialogCallback);
		return;
	}

	if (!scriptInterpreter) {
		dialogRenderer.Reset();
		dialogRenderer.SetCentered(isNarrating /*centered*/);
		dialogBuffer.Reset();
		dialogBuffer.AddText(dialogStr);
		dialogBuffer.OnDialogEnd(function() {
			onExitDialog(null, dialogCallback);
		});
		bitsy.log("dialog start end");
		return;
	};

	isDialogMode = true;

	dialogRenderer.Reset();
	dialogRenderer.SetCentered(isNarrating /*centered*/);
	dialogBuffer.Reset();
	scriptInterpreter.SetDialogBuffer(dialogBuffer);

	var onScriptEnd = function(scriptResult) {
		dialogBuffer.OnDialogEnd(function() {
			onExitDialog(scriptResult, dialogCallback);
		});
	};

	if (scriptId === undefined) { // TODO : what's this for again?
		scriptInterpreter.Interpret(dialogStr, onScriptEnd);
	}
	else {
		if (!scriptInterpreter.HasScript(scriptId)) {
			scriptInterpreter.Compile(scriptId, dialogStr);
		}
		// scriptInterpreter.DebugVisualizeScript(scriptId);
		scriptInterpreter.Run(scriptId, onScriptEnd, objectContext);
	}

}

var isDialogPreview = false;
function startPreviewDialog(script, dialogCallback) {
	if (!scriptInterpreter || !dialogBuffer) {
		return;
	}

	isNarrating = true;

	isDialogMode = true;

	isDialogPreview = true;

	dialogRenderer.Reset();
	dialogRenderer.SetCentered(true);
	dialogBuffer.Reset();
	scriptInterpreter.SetDialogBuffer(dialogBuffer);

	// TODO : do I really need a seperate callback for this debug mode??
	onDialogPreviewEnd = dialogCallback;

	var onScriptEndCallback = function(scriptResult) {
		dialogBuffer.OnDialogEnd(function() {
			onExitDialog(scriptResult, null);
		});
	};

	scriptInterpreter.Eval(script, onScriptEndCallback);
}

/* NEW SCRIPT STUFF */
var scriptModule;
var scriptInterpreter;
var scriptUtils;
// scriptInterpreter.SetDialogBuffer( dialogBuffer );
if (engineFeatureFlags.isScriptEnabled) {
	bitsy.log("init script module");
	scriptModule = new Script();
	bitsy.log("init interpreter");
	scriptInterpreter = scriptModule.CreateInterpreter();
	bitsy.log("init utils");
	scriptUtils = scriptModule.CreateUtils(); // TODO: move to editor.js?
	bitsy.log("init script module end");
}

/* SOUND */
var soundPlayer;
if (engineFeatureFlags.isSoundEnabled) {
	soundPlayer = new SoundPlayer();
}

/* EVENTS */
bitsy.loop(update);