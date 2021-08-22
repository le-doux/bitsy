var xhr; // TODO : remove
var canvas;
var context; // TODO : remove if safe?
var ctx;

var room = {};
var tile = {};
var sprite = {};
var item = {};
var dialog = {};
var palette = { //start off with a default palette
		"default" : {
			name : "default",
			colors : [[0,0,0],[255,255,255],[255,255,255]]
		}
	};
var variable = {}; // these are starting variable values -- they don't update (or I don't think they will)
var playerId = "A";

var titleDialogId = "title";
function getTitle() {
	return dialog[titleDialogId].src;
}
function setTitle(titleSrc) {
	dialog[titleDialogId] = { src:titleSrc, name:null };
}

var defaultFontName = "ascii_small";
var fontName = defaultFontName;
var TextDirection = {
	LeftToRight : "LTR",
	RightToLeft : "RTL"
};
var textDirection = TextDirection.LeftToRight;

var names = {
	room : new Map(),
	tile : new Map(), // Note: Not currently enabled in the UI
	sprite : new Map(),
	item : new Map(),
	dialog : new Map(),
};
function updateNamesFromCurData() {

	function createNameMap(objectStore) {
		var map = new Map();
		for (id in objectStore) {
			if (objectStore[id].name != undefined && objectStore[id].name != null) {
				map.set(objectStore[id].name, id);
			}
		}
		return map;
	}

	names.room = createNameMap(room);
	names.tile = createNameMap(tile);
	names.sprite = createNameMap(sprite);
	names.item = createNameMap(item);
	names.dialog = createNameMap(dialog);
}

var spriteStartLocations = {};

/* VERSION */
var version = {
	major: 7, // major changes
	minor: 8, // smaller changes
	devBuildPhase: "RELEASE",
};
function getEngineVersion() {
	return version.major + "." + version.minor;
}

/* FLAGS */
var flags;
function resetFlags() {
	flags = {
		ROOM_FORMAT : 0 // 0 = non-comma separated, 1 = comma separated
	};
}
resetFlags(); //init flags on load script

// SUPER hacky location... :/
var editorDevFlags = {
	// NONE right now!
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

	// TODO RENDERER : clear data?

	spriteStartLocations = {};

	// hacky to have this multiple times...
	names = {
		room : new Map(),
		tile : new Map(),
		sprite : new Map(),
		item : new Map(),
		dialog : new Map(),
	};

	fontName = defaultFontName; // TODO : reset font manager too?
	textDirection = TextDirection.LeftToRight;
}

var width = 128;
var height = 128;
var scale = 4; //this is stupid but necessary
var tilesize = 8;
var mapsize = 16;

var curRoom = "0";

var prevTime = 0;
var deltaTime = 0;

// engine event hooks for the editor
var onInventoryChanged = null;
var onVariableChanged = null;
var onGameReset = null;
var onInitRoom = null;

var isPlayerEmbeddedInEditor = false;

var renderer = new Renderer(tilesize, scale);

function getGameNameFromURL() {
	var game = window.location.hash.substring(1);
	// bitsyLog("game name --- " + game);
	return game;
}

function attachCanvas(c) {
	canvas = c;
	canvas.width = width * scale;
	canvas.height = width * scale;
	ctx = canvas.getContext("2d");
	dialogRenderer.AttachContext(ctx);
	renderer.AttachContext(ctx);
}

var curGameData = null;
function load_game(game_data, startWithTitle) {
	curGameData = game_data; //remember the current game (used to reset the game)

	dialogBuffer.Reset();
	scriptInterpreter.ResetEnvironment(); // ensures variables are reset -- is this the best way?

	parseWorld(game_data);

	if (!isPlayerEmbeddedInEditor) {
		// hack to ensure default font is available
		fontManager.AddResource(defaultFontName + fontManager.GetExtension(), document.getElementById(defaultFontName).text.slice(1));
	}

	var font = fontManager.Get( fontName );
	dialogBuffer.SetFont(font);
	dialogRenderer.SetFont(font);

	setInitialVariables();

	onready(startWithTitle);
}

function reset_cur_game() {
	if (curGameData == null) {
		return; //can't reset if we don't have the game data
	}

	stopGame();
	clearGameData();
	load_game(curGameData);

	if (isPlayerEmbeddedInEditor && onGameReset != null) {
		onGameReset();
	}
}

function onready(startWithTitle) {
	if (startWithTitle === undefined || startWithTitle === null) {
		startWithTitle = true;
	}

	if (startWithTitle) { // used by editor 
		startNarrating(getTitle());
	}
}

function setInitialVariables() {
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
	bitsyLog("stop GAME!");
}

/* loading animation */
var loading_anim_data = [
	[
		0,1,1,1,1,1,1,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,0,0,1,1,0,0,0,
		0,0,0,1,1,0,0,0,
		0,0,1,0,0,1,0,0,
		0,0,1,0,0,1,0,0,
		0,1,1,1,1,1,1,0,
	],
	[
		0,1,1,1,1,1,1,0,
		0,0,1,0,0,1,0,0,
		0,0,1,1,1,1,0,0,
		0,0,0,1,1,0,0,0,
		0,0,0,1,1,0,0,0,
		0,0,1,0,0,1,0,0,
		0,0,1,1,1,1,0,0,
		0,1,1,1,1,1,1,0,
	],
	[
		0,1,1,1,1,1,1,0,
		0,0,1,0,0,1,0,0,
		0,0,1,0,0,1,0,0,
		0,0,0,1,1,0,0,0,
		0,0,0,1,1,0,0,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,1,1,1,1,1,1,0,
	],
	[
		0,1,1,1,1,1,1,0,
		0,0,1,0,0,1,0,0,
		0,0,1,0,0,1,0,0,
		0,0,0,1,1,0,0,0,
		0,0,0,1,1,0,0,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,1,1,1,1,1,1,0,
	],
	[
		0,0,0,0,0,0,0,0,
		1,0,0,0,0,0,0,1,
		1,1,1,0,0,1,1,1,
		1,1,1,1,1,0,0,1,
		1,1,1,1,1,0,0,1,
		1,1,1,0,0,1,1,1,
		1,0,0,0,0,0,0,1,
		0,0,0,0,0,0,0,0,
	]
];
var loading_anim_frame = 0;
var loading_anim_speed = 500;

function loadingAnimation() {
	//create image
	var loadingAnimImg = ctx.createImageData(8*scale, 8*scale);
	//draw image
	for (var y = 0; y < 8; y++) {
		for (var x = 0; x < 8; x++) {
			var i = (y * 8) + x;
			if (loading_anim_data[loading_anim_frame][i] == 1) {
				//scaling nonsense
				for (var sy = 0; sy < scale; sy++) {
					for (var sx = 0; sx < scale; sx++) {
						var pxl = 4 * ( (((y*scale)+sy) * (8*scale)) + ((x*scale)+sx) );
						loadingAnimImg.data[pxl+0] = 255;
						loadingAnimImg.data[pxl+1] = 255;
						loadingAnimImg.data[pxl+2] = 255;
						loadingAnimImg.data[pxl+3] = 255;
					}
				}
			}
		}
	}
	//put image on canvas
	ctx.putImageData(loadingAnimImg,scale*(width/2 - 4),scale*(height/2 - 4));
	//update frame
	loading_anim_frame++;
	if (loading_anim_frame >= 5) loading_anim_frame = 0;
}

function updateLoadingScreen() {
	// TODO : in progress
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	loadingAnimation();
	drawSprite( getSpriteImage(sprite["a"],"0",0), 8, 8, ctx );
}

function update() {
	var curTime = Date.now();
	deltaTime = curTime - prevTime;

	if (curRoom == null) {
		// in the special case where there is no valid room, end the game
		startNarrating( "", true /*isEnding*/ );
	}

	if (!transition.IsTransitionActive()) {
		updateInput();
	}

	if (transition.IsTransitionActive()) {
		// transition animation takes over everything!
		transition.UpdateTransition(deltaTime);
	}
	else {
		if (!isNarrating && !isEnding) {
			updateAnimation();
			drawRoom( room[curRoom] ); // draw world if game has begun
		}
		else {
			//make sure to still clear screen
			ctx.fillStyle = "rgb(" + getPal(curPal())[0][0] + "," + getPal(curPal())[0][1] + "," + getPal(curPal())[0][2] + ")";
			ctx.fillRect(0,0,canvas.width,canvas.height);
		}

		// if (isDialogMode) { // dialog mode
		if(dialogBuffer.IsActive()) {
			dialogRenderer.Draw( dialogBuffer, deltaTime );
			dialogBuffer.Update( deltaTime );
		}

		// keep moving avatar if player holds down button
		if( !dialogBuffer.IsActive() && !isEnding )
		{
			if( curPlayerDirection != Direction.None ) {
				playerHoldToMoveTimer -= deltaTime;

				if( playerHoldToMoveTimer <= 0 )
				{
					movePlayer( curPlayerDirection );
					playerHoldToMoveTimer = 150;
				}
			}
		}
	}

	prevTime = curTime;
}

var isAnyButtonHeld = false;
var isIgnoringInput = false;

function updateInput() {
	if (dialogBuffer.IsActive()) {
		if (!isAnyButtonHeld && bitsyButton()) {
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
	else if (isEnding) {
		if (!isAnyButtonHeld && bitsyButton()) {
			/* RESTART GAME */
			reset_cur_game();
		}
	}
	else if (!isIgnoringInput) {
		/* WALK */
		var prevPlayerDirection = curPlayerDirection;

		if (bitsyButton(0)) {
			curPlayerDirection = Direction.Up;
		}
		else if (bitsyButton(1)) {
			curPlayerDirection = Direction.Down;
		}
		else if (bitsyButton(2)) {
			curPlayerDirection = Direction.Left;
		}
		else if (bitsyButton(3)) {
			curPlayerDirection = Direction.Right;
		}
		else {
			curPlayerDirection = Direction.None;
		}

		if (curPlayerDirection != Direction.None && curPlayerDirection != prevPlayerDirection) {
			movePlayer(curPlayerDirection);
			playerHoldToMoveTimer = 500;
		}
	}

	if (!bitsyButton()) {
		isIgnoringInput = false;
	}

	isAnyButtonHeld = bitsyButton();
}

var animationCounter = 0;
var animationTime = 400;
function updateAnimation() {
	animationCounter += deltaTime;

	if ( animationCounter >= animationTime ) {

		// animate sprites
		for (id in sprite) {
			var spr = sprite[id];
			if (spr.animation.isAnimated) {
				spr.animation.frameIndex = ( spr.animation.frameIndex + 1 ) % spr.animation.frameCount;
			}
		}

		// animate tiles
		for (id in tile) {
			var til = tile[id];
			if (til.animation.isAnimated) {
				til.animation.frameIndex = ( til.animation.frameIndex + 1 ) % til.animation.frameCount;
			}
		}

		// animate items
		for (id in item) {
			var itm = item[id];
			if (itm.animation.isAnimated) {
				itm.animation.frameIndex = ( itm.animation.frameIndex + 1 ) % itm.animation.frameCount;
			}
		}

		// reset counter
		animationCounter = 0;

	}
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

function getSpriteAt(x,y) {
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === curRoom) {
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

function movePlayer(direction) {
	if (player().room == null || !Object.keys(room).includes(player().room)) {
		return; // player room is missing or invalid.. can't move them!
	}

	var spr = null;

	if ( curPlayerDirection == Direction.Left && !(spr = getSpriteLeft()) && !isWallLeft()) {
		player().x -= 1;
	}
	else if ( curPlayerDirection == Direction.Right && !(spr = getSpriteRight()) && !isWallRight()) {
		player().x += 1;
	}
	else if ( curPlayerDirection == Direction.Up && !(spr = getSpriteUp()) && !isWallUp()) {
		player().y -= 1;
	}
	else if ( curPlayerDirection == Direction.Down && !(spr = getSpriteDown()) && !isWallDown()) {
		player().y += 1;
	}
	
	var ext = getExit( player().room, player().x, player().y );
	var end = getEnding( player().room, player().x, player().y );
	var itmIndex = getItemIndex( player().room, player().x, player().y );

	// do items first, because you can pick up an item AND go through a door
	if (itmIndex > -1) {
		var itm = room[player().room].items[itmIndex];
		var itemRoom = player().room;

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
		startSpriteDialog(spr /*spriteId*/);
	}
}

var transition = new TransitionManager();

function movePlayerThroughExit(ext) {
	var GoToDest = function() {
		if (ext.transition_effect != null) {
			transition.BeginTransition(player().room, player().x, player().y, ext.dest.room, ext.dest.x, ext.dest.y, ext.transition_effect);
			transition.UpdateTransition(0);
		}

		player().room = ext.dest.room;
		player().x = ext.dest.x;
		player().y = ext.dest.y;
		curRoom = ext.dest.room;

		initRoom(curRoom);
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

function updatePalette(palId) {
	var pal = palette[palId];

	for (var i = 0; i < pal.colors.length; i++) {
		var color = pal.colors[i];
		bitsySetColor(i, color[0], color[1], color[2]);
	}
}

function initRoom(roomId) {
	updatePalette(curPal());

	// init exit properties
	for (var i = 0; i < room[roomId].exits.length; i++) {
		room[roomId].exits[i].property = { locked:false };
	}

	// init ending properties
	for (var i = 0; i < room[roomId].endings.length; i++) {
		room[roomId].endings[i].property = { locked:false };
	}

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
	return (player().x + 1 >= 16) || isWall( player().x + 1, player().y );
}

function isWallUp() {
	return (player().y - 1 < 0) || isWall( player().x, player().y - 1 );
}

function isWallDown() {
	return (player().y + 1 >= 16) || isWall( player().x, player().y + 1 );
}

function isWall(x,y,roomId) {
	if(roomId == undefined || roomId == null)
		roomId = curRoom;

	var tileId = getTile( x, y );

	if( tileId === '0' )
		return false; // Blank spaces aren't walls, ya doofus

	if( tile[tileId].isWall === undefined || tile[tileId].isWall === null ) {
		// No wall-state defined: check room-specific walls
		var i = room[roomId].walls.indexOf( getTile(x,y) );
		return i > -1;
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

function getExit(roomId,x,y) {
	for (i in room[roomId].exits) {
		var e = room[roomId].exits[i];
		if (x == e.x && y == e.y) {
			return e;
		}
	}
	return null;
}

function getEnding(roomId,x,y) {
	for (i in room[roomId].endings) {
		var e = room[roomId].endings[i];
		if (x == e.x && y == e.y) {
			return e;
		}
	}
	return null;
}

function getTile(x,y) {
	// bitsyLog(x + " " + y);
	var t = getRoom().tilemap[y][x];
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

function getRoom() {
	return room[curRoom];
}

function isSpriteOffstage(id) {
	return sprite[id].room == null;
}

function parseWorld(file) {
	spriteStartLocations = {};

	resetFlags();

	var versionNumber = 0;

	// flags to keep track of which compatibility conversions
	// need to be applied to this game data
	var compatibilityFlags = {
		convertSayToPrint : false,
		combineEndingsWithDialog : false,
		convertImplicitSpriteDialogIds : false,
	};

	var lines = file.split("\n");
	var i = 0;
	while (i < lines.length) {
		var curLine = lines[i];

		// bitsyLog(lines[i]);

		if (i == 0) {
			i = parseTitle(lines, i);
		}
		else if (curLine.length <= 0 || curLine.charAt(0) === "#") {
			// collect version number (from a comment.. hacky I know)
			if (curLine.indexOf("# BITSY VERSION ") != -1) {
				versionNumber = parseFloat(curLine.replace("# BITSY VERSION ", ""));

				if (versionNumber < 5.0) {
					compatibilityFlags.convertSayToPrint = true;
				}

				if (versionNumber < 7.0) {
					compatibilityFlags.combineEndingsWithDialog = true;
					compatibilityFlags.convertImplicitSpriteDialogIds = true;
				}
			}

			//skip blank lines & comments
			i++;
		}
		else if (getType(curLine) == "PAL") {
			i = parsePalette(lines, i);
		}
		else if (getType(curLine) === "ROOM" || getType(curLine) === "SET") { //SET for back compat
			i = parseRoom(lines, i, compatibilityFlags);
		}
		else if (getType(curLine) === "TIL") {
			i = parseTile(lines, i);
		}
		else if (getType(curLine) === "SPR") {
			i = parseSprite(lines, i);
		}
		else if (getType(curLine) === "ITM") {
			i = parseItem(lines, i);
		}
		else if (getType(curLine) === "DRW") {
			i = parseDrawing(lines, i);
		}
		else if (getType(curLine) === "DLG") {
			i = parseDialog(lines, i, compatibilityFlags);
		}
		else if (getType(curLine) === "END" && compatibilityFlags.combineEndingsWithDialog) {
			// parse endings for back compat
			i = parseEnding(lines, i, compatibilityFlags);
		}
		else if (getType(curLine) === "VAR") {
			i = parseVariable(lines, i);
		}
		else if (getType(curLine) === "DEFAULT_FONT") {
			i = parseFontName(lines, i);
		}
		else if (getType(curLine) === "TEXT_DIRECTION") {
			i = parseTextDirection(lines, i);
		}
		else if (getType(curLine) === "FONT") {
			i = parseFontData(lines, i);
		}
		else if (getType(curLine) === "!") {
			i = parseFlag(lines, i);
		}
		else {
			i++;
		}
	}

	placeSprites();

	var roomIds = Object.keys(room);
	if (player() != undefined && player().room != null && roomIds.includes(player().room)) {
		// player has valid room
		curRoom = player().room;
	}
	else if (roomIds.length > 0) {
		// player not in any room! what the heck
		curRoom = roomIds[0];
	}
	else {
		// uh oh there are no rooms I guess???
		curRoom = null;
	}

	if (curRoom != null) {
		initRoom(curRoom);
	}

	renderer.SetPalettes(palette);

	scriptCompatibility(compatibilityFlags);

	return versionNumber;
}

function scriptCompatibility(compatibilityFlags) {
	if (compatibilityFlags.convertSayToPrint) {
		bitsyLog("CONVERT SAY TO PRINT!");

		var PrintFunctionVisitor = function() {
			var didChange = false;
			this.DidChange = function() { return didChange; };

			this.Visit = function(node) {
				if (node.type != "function") {
					return;
				}

				if (node.name === "say") {
					node.name = "print";
					didChange = true;
				}
			};
		};

		for (dlgId in dialog) {
			var dialogScript = scriptInterpreter.Parse(dialog[dlgId].src);
			var visitor = new PrintFunctionVisitor();
			dialogScript.VisitAll(visitor);
			if (visitor.DidChange()) {
				var newDialog = dialogScript.Serialize();
				if (newDialog.indexOf("\n") > -1) {
					newDialog = '"""\n' + newDialog + '\n"""';
				}
				dialog[dlgId].src = newDialog;
			}
		}
	}
}

//TODO this is in progress and doesn't support all features
function serializeWorld(skipFonts) {
	if (skipFonts === undefined || skipFonts === null)
		skipFonts = false;

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
			if( palette[id].name != null )
				worldStr += "NAME " + palette[id].name + "\n";
			for (i in getPal(id)) {
				for (j in getPal(id)[i]) {
					worldStr += getPal(id)[i][j];
					if (j < 2) worldStr += ",";
				}
				worldStr += "\n";
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
	/* VARIABLES */
	for (id in variable) {
		worldStr += "VAR " + id + "\n";
		worldStr += variable[id] + "\n";
		worldStr += "\n";
	}
	/* FONT */
	// TODO : support multiple fonts
	if (fontName != defaultFontName && !skipFonts) {
		worldStr += fontManager.GetData(fontName);
	}

	return worldStr;
}

function serializeDrawing(drwId) {
	var imageSource = renderer.GetImageSource(drwId);
	var drwStr = "";
	for (f in imageSource) {
		for (y in imageSource[f]) {
			var rowStr = "";
			for (x in imageSource[f][y]) {
				rowStr += imageSource[f][y][x];
			}
			drwStr += rowStr + "\n";
		}
		if (f < (imageSource.length-1)) drwStr += ">\n";
	}
	return drwStr;
}

function isExitValid(e) {
	var hasValidStartPos = e.x >= 0 && e.x < 16 && e.y >= 0 && e.y < 16;
	var hasDest = e.dest != null;
	var hasValidRoomDest = (e.dest.room != null && e.dest.x >= 0 && e.dest.x < 16 && e.dest.y >= 0 && e.dest.y < 16);
	return hasValidStartPos && hasDest && hasValidRoomDest;
}

function placeSprites() {
	for (id in spriteStartLocations) {
		//bitsyLog(id);
		//bitsyLog( spriteStartLocations[id] );
		//bitsyLog(sprite[id]);
		sprite[id].room = spriteStartLocations[id].room;
		sprite[id].x = spriteStartLocations[id].x;
		sprite[id].y = spriteStartLocations[id].y;
		//bitsyLog(sprite[id]);
	}
}

/* ARGUMENT GETTERS */
function getType(line) {
	return getArg(line,0);
}

function getId(line) {
	return getArg(line,1);
}

function getArg(line,arg) {
	return line.split(" ")[arg];
}

function getCoord(line,arg) {
	return getArg(line,arg).split(",");
}

function parseTitle(lines, i) {
	var results = scriptUtils.ReadDialogScript(lines,i);
	setTitle(results.script);
	i = results.index;

	i++;

	return i;
}

function parseRoom(lines, i, compatibilityFlags) {
	var id = getId(lines[i]);
	room[id] = {
		id : id,
		tilemap : [],
		walls : [],
		exits : [],
		endings : [],
		items : [],
		pal : null,
		name : null
	};
	i++;

	// create tile map
	if ( flags.ROOM_FORMAT == 0 ) {
		// old way: no commas, single char tile ids
		var end = i + mapsize;
		var y = 0;
		for (; i<end; i++) {
			room[id].tilemap.push( [] );
			for (x = 0; x<mapsize; x++) {
				room[id].tilemap[y].push( lines[i].charAt(x) );
			}
			y++;
		}
	}
	else if ( flags.ROOM_FORMAT == 1 ) {
		// new way: comma separated, multiple char tile ids
		var end = i + mapsize;
		var y = 0;
		for (; i<end; i++) {
			room[id].tilemap.push( [] );
			var lineSep = lines[i].split(",");
			for (x = 0; x<mapsize; x++) {
				room[id].tilemap[y].push( lineSep[x] );
			}
			y++;
		}
	}

	while (i < lines.length && lines[i].length > 0) { //look for empty line
		// bitsyLog(getType(lines[i]));
		if (getType(lines[i]) === "SPR") {
			/* NOTE SPRITE START LOCATIONS */
			var sprId = getId(lines[i]);
			if (sprId.indexOf(",") == -1 && lines[i].split(" ").length >= 3) { //second conditional checks for coords
				/* PLACE A SINGLE SPRITE */
				var sprCoord = lines[i].split(" ")[2].split(",");
				spriteStartLocations[sprId] = {
					room : id,
					x : parseInt(sprCoord[0]),
					y : parseInt(sprCoord[1])
				};
			}
			else if ( flags.ROOM_FORMAT == 0 ) { // TODO: right now this shortcut only works w/ the old comma separate format
				/* PLACE MULTIPLE SPRITES*/ 
				//Does find and replace in the tilemap (may be hacky, but its convenient)
				var sprList = sprId.split(",");
				for (row in room[id].tilemap) {
					for (s in sprList) {
						var col = room[id].tilemap[row].indexOf( sprList[s] );
						//if the sprite is in this row, replace it with the "null tile" and set its starting position
						if (col != -1) {
							room[id].tilemap[row][col] = "0";
							spriteStartLocations[ sprList[s] ] = {
								room : id,
								x : parseInt(col),
								y : parseInt(row)
							};
						}
					}
				}
			}
		}
		else if (getType(lines[i]) === "ITM") {
			var itmId = getId(lines[i]);
			var itmCoord = lines[i].split(" ")[2].split(",");
			var itm = {
				id: itmId,
				x : parseInt(itmCoord[0]),
				y : parseInt(itmCoord[1])
			};
			room[id].items.push( itm );
		}
		else if (getType(lines[i]) === "WAL") {
			/* DEFINE COLLISIONS (WALLS) */
			room[id].walls = getId(lines[i]).split(",");
		}
		else if (getType(lines[i]) === "EXT") {
			/* ADD EXIT */
			var exitArgs = lines[i].split(" ");
			//arg format: EXT 10,5 M 3,2 [AVA:7 LCK:a,9] [AVA 7 LCK a 9]
			var exitCoords = exitArgs[1].split(",");
			var destName = exitArgs[2];
			var destCoords = exitArgs[3].split(",");
			var ext = {
				x : parseInt(exitCoords[0]),
				y : parseInt(exitCoords[1]),
				dest : {
					room : destName,
					x : parseInt(destCoords[0]),
					y : parseInt(destCoords[1])
				},
				transition_effect : null,
				dlg: null,
			};

			// optional arguments
			var exitArgIndex = 4;
			while (exitArgIndex < exitArgs.length) {
				if (exitArgs[exitArgIndex] == "FX") {
					ext.transition_effect = exitArgs[exitArgIndex+1];
					exitArgIndex += 2;
				}
				else if (exitArgs[exitArgIndex] == "DLG") {
					ext.dlg = exitArgs[exitArgIndex+1];
					exitArgIndex += 2;
				}
				else {
					exitArgIndex += 1;
				}
			}

			room[id].exits.push(ext);
		}
		else if (getType(lines[i]) === "END") {
			/* ADD ENDING */
			var endId = getId(lines[i]);

			// compatibility with when endings were stored separate from other dialog
			if (compatibilityFlags.combineEndingsWithDialog) {
				endId = "end_" + endId;
			}

			var endCoords = getCoord(lines[i], 2);
			var end = {
				id : endId,
				x : parseInt(endCoords[0]),
				y : parseInt(endCoords[1])
			};

			room[id].endings.push(end);
		}
		else if (getType(lines[i]) === "PAL") {
			/* CHOOSE PALETTE (that's not default) */
			room[id].pal = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			var name = lines[i].split(/\s(.+)/)[1];
			room[id].name = name;
			names.room.set(name, id);
		}

		i++;
	}

	return i;
}

function parsePalette(lines,i) { //todo this has to go first right now :(
	var id = getId(lines[i]);
	i++;
	var colors = [];
	var name = null;
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		var args = lines[i].split(" ");
		if (args[0] === "NAME") {
			name = lines[i].split(/\s(.+)/)[1];
		}
		else {
			var col = [];
			lines[i].split(",").forEach(function(i) {
				col.push(parseInt(i));
			});
			colors.push(col);
		}
		i++;
	}
	palette[id] = {
		id : id,
		name : name,
		colors : colors
	};
	return i;
}

function parseTile(lines, i) {
	var id = getId(lines[i]);
	var tileData = createDrawingData("TIL", id);

	i++;

	// read & store tile image source
	i = parseDrawingCore(lines, i, tileData.drw);

	// update animation info
	tileData.animation.frameCount = renderer.GetFrameCount(tileData.drw);
	tileData.animation.isAnimated = tileData.animation.frameCount > 1;

	// read other properties
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "COL") {
			tileData.col = parseInt(getId(lines[i]));
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			tileData.name = lines[i].split(/\s(.+)/)[1];
			names.tile.set(tileData.name, id);
		}
		else if (getType(lines[i]) === "WAL") {
			var wallArg = getArg(lines[i], 1);
			if (wallArg === "true") {
				tileData.isWall = true;
			}
			else if (wallArg === "false") {
				tileData.isWall = false;
			}
		}

		i++;
	}

	// store tile data
	tile[id] = tileData;

	return i;
}

function parseSprite(lines, i) {
	var id = getId(lines[i]);
	var type = (id === "A") ? "AVA" : "SPR";
	var spriteData = createDrawingData(type, id);

	bitsyLog(spriteData);

	i++;

	// read & store sprite image source
	i = parseDrawingCore(lines, i, spriteData.drw);

	// update animation info
	spriteData.animation.frameCount = renderer.GetFrameCount(spriteData.drw);
	spriteData.animation.isAnimated = spriteData.animation.frameCount > 1;

	// read other properties
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			spriteData.col = parseInt(getId(lines[i]));
		}
		else if (getType(lines[i]) === "POS") {
			/* STARTING POSITION */
			var posArgs = lines[i].split(" ");
			var roomId = posArgs[1];
			var coordArgs = posArgs[2].split(",");
			spriteStartLocations[id] = {
				room : roomId,
				x : parseInt(coordArgs[0]),
				y : parseInt(coordArgs[1])
			};
		}
		else if(getType(lines[i]) === "DLG") {
			spriteData.dlg = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			spriteData.name = lines[i].split(/\s(.+)/)[1];
			names.sprite.set(spriteData.name, id);
		}
		else if (getType(lines[i]) === "ITM") {
			/* ITEM STARTING INVENTORY */
			var itemId = getId(lines[i]);
			var itemCount = parseFloat(getArg(lines[i], 2));
			spriteData.inventory[itemId] = itemCount;
		}

		i++;
	}

	// store sprite data
	sprite[id] = spriteData;

	return i;
}

function parseItem(lines, i) {
	var id = getId(lines[i]);
	var itemData = createDrawingData("ITM", id);

	i++;

	// read & store item image source
	i = parseDrawingCore(lines, i, itemData.drw);

	// update animation info
	itemData.animation.frameCount = renderer.GetFrameCount(itemData.drw);
	itemData.animation.isAnimated = itemData.animation.frameCount > 1;

	// read other properties
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			itemData.col = parseInt(getArg(lines[i], 1));
		}
		else if (getType(lines[i]) === "DLG") {
			itemData.dlg = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			itemData.name = lines[i].split(/\s(.+)/)[1];
			names.item.set(itemData.name, id);
		}

		i++;
	}

	// store item data
	item[id] = itemData;

	return i;
}

function parseDrawing(lines, i) {
	// store drawing source
	var drwId = getId( lines[i] );
	return parseDrawingCore( lines, i, drwId );
}

function parseDrawingCore(lines, i, drwId) {
	var frameList = []; //init list of frames
	frameList.push( [] ); //init first frame
	var frameIndex = 0;
	var y = 0;
	while ( y < tilesize ) {
		var l = lines[i+y];
		var row = [];
		for (x = 0; x < tilesize; x++) {
			row.push( parseInt( l.charAt(x) ) );
		}
		frameList[frameIndex].push( row );
		y++;

		if (y === tilesize) {
			i = i + y;
			if ( lines[i] != undefined && lines[i].charAt(0) === ">" ) {
				// start next frame!
				frameList.push( [] );
				frameIndex++;
				//start the count over again for the next frame
				i++;
				y = 0;
			}
		}
	}

	renderer.SetImageSource(drwId, frameList);

	return i;
}

// creates a drawing data structure with default property values for the type
function createDrawingData(type, id) {
	// the avatar's drawing id still uses the sprite prefix (for back compat)
	var drwId = (type === "AVA" ? "SPR" : type) + "_" + id;

	var drawingData = {
		type : type,
		id : id,
		name : null,
		drw : drwId,
		col : (type === "TIL") ? 1 : 2,
		animation : {
			isAnimated : false,
			frameIndex : 0,
			frameCount : 1,
		},
	};

	// add type specific properties
	if (type === "TIL") {
		// default null value indicates it can vary from room to room (original version)
		drawingData.isWall = null;
	}

	if (type === "AVA" || type === "SPR") {
		// default sprite location is "offstage"
		drawingData.room = null;
		drawingData.x = -1;
		drawingData.y = -1;
		drawingData.inventory = {};
	}

	if (type === "AVA" || type === "SPR" || type === "ITM") {
		drawingData.dlg = null;
	}

	return drawingData;
}

function parseScript(lines, i, backCompatPrefix, compatibilityFlags) {
	var id = getId(lines[i]);
	id = backCompatPrefix + id;
	i++;

	var results = scriptUtils.ReadDialogScript(lines,i);

	dialog[id] = { src: results.script, name: null, id: id, };

	if (compatibilityFlags.convertImplicitSpriteDialogIds) {
		// explicitly hook up dialog that used to be implicitly
		// connected by sharing sprite and dialog IDs in old versions
		if (sprite[id]) {
			if (sprite[id].dlg === undefined || sprite[id].dlg === null) {
				sprite[id].dlg = id;
			}
		}
	}

	i = results.index;

	return i;
}

function parseDialog(lines, i, compatibilityFlags) {
	// hacky but I need to store this so I can set the name below
	var id = getId(lines[i]);

	i = parseScript(lines, i, "", compatibilityFlags);

	if (lines[i].length > 0 && getType(lines[i]) === "NAME") {
		dialog[id].name = lines[i].split(/\s(.+)/)[1]; // TODO : hacky to keep copying this regex around...
		names.dialog.set(dialog[id].name, id);
		i++;
	}

	return i;
}

// keeping this around to parse old files where endings were separate from dialogs
function parseEnding(lines, i, compatibilityFlags) {
	return parseScript(lines, i, "end_", compatibilityFlags);
}

function parseVariable(lines, i) {
	var id = getId(lines[i]);
	i++;
	var value = lines[i];
	i++;
	variable[id] = value;
	return i;
}

function parseFontName(lines, i) {
	fontName = getArg(lines[i], 1);
	i++;
	return i;
}

function parseTextDirection(lines, i) {
	textDirection = getArg(lines[i], 1);
	i++;
	return i;
}

function parseFontData(lines, i) {
	// NOTE : we're not doing the actual parsing here --
	// just grabbing the block of text that represents the font
	// and giving it to the font manager to use later

	var localFontName = getId(lines[i]);
	var localFontData = lines[i];
	i++;

	while (i < lines.length && lines[i] != "") {
		localFontData += "\n" + lines[i];
		i++;
	}

	var localFontFilename = localFontName + fontManager.GetExtension();
	fontManager.AddResource( localFontFilename, localFontData );

	return i;
}

function parseFlag(lines, i) {
	var id = getId(lines[i]);
	var valStr = lines[i].split(" ")[2];
	flags[id] = parseInt( valStr );
	i++;
	return i;
}

function drawTile(tileId, x, y) {
	bitsyDrawTile(tileId, x, y);
}

function drawSprite(tileId, x, y) {
	drawTile(tileId, x, y);
}

function drawItem(tileId, x, y) {
	drawTile(tileId, x, y);
}

// var debugLastRoomDrawn = "0";

function drawRoom(room,context,frameIndex) { // context & frameIndex are optional
	if (!context) { //optional pass in context; otherwise, use default (ok this is REAL hacky isn't it)
		context = ctx;
	}

	// if (room.id != debugLastRoomDrawn) {
	// 	debugLastRoomDrawn = room.id;
	// 	bitsyLog("DRAW ROOM " + debugLastRoomDrawn);
	// }

	// clear screen // todo : this doesn't seem right for tile mode... remove?
	bitsySetDrawBuffer(0);
	bitsyClearBuffer(0);

	var paletteId = "default";

	if (room === undefined) {
		// protect against invalid rooms
		return;
	}

	if (room.pal != null && palette[paletteId] != undefined) {
		paletteId = room.pal;
	}

	//draw tiles
	for (i in room.tilemap) {
		for (j in room.tilemap[i]) {
			var id = room.tilemap[i][j];
			if (id != "0") {
				//bitsyLog(id);
				if (tile[id] == null) { // hack-around to avoid corrupting files (not a solution though!)
					id = "0";
					room.tilemap[i][j] = id;
				}
				else {
					// bitsyLog(id);
					drawTile( getTileImage(tile[id],paletteId,frameIndex), j, i, context );
				}
			}
		}
	}

	//draw items
	for (var i = 0; i < room.items.length; i++) {
		var itm = room.items[i];
		drawItem( getItemImage(item[itm.id],paletteId,frameIndex), itm.x, itm.y, context );
	}

	//draw sprites
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === room.id) {
			drawSprite( getSpriteImage(spr,paletteId,frameIndex), spr.x, spr.y, context );
		}
	}
}

// TODO : remove these get*Image methods
function getTileImage(t,palId,frameIndex) {
	return renderer.GetImage(t,palId,frameIndex);
}

function getSpriteImage(s,palId,frameIndex) {
	return renderer.GetImage(s,palId,frameIndex);
}

function getItemImage(itm,palId,frameIndex) {
	return renderer.GetImage(itm,palId,frameIndex);
}

function curPal() {
	return getRoomPal(curRoom);
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
var dialogModule = new Dialog();
var dialogRenderer = dialogModule.CreateRenderer();
var dialogBuffer = dialogModule.CreateBuffer();
var fontManager = new FontManager();

// TODO : is this scriptResult thing being used anywhere???
function onExitDialog(scriptResult, dialogCallback) {
	bitsyLog("EXIT DIALOG!");

	isDialogMode = false;

	if (isNarrating) {
		isNarrating = false;
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
}

/*
TODO
- titles and endings should also take advantage of the script pre-compilation if possible??
- could there be a namespace collision?
- what about dialog NAMEs vs IDs?
- what about a special script block separate from DLG?
*/
function startNarrating(dialogStr,end) {
	bitsyLog("NARRATE " + dialogStr);

	if(end === undefined) {
		end = false;
	}

	isNarrating = true;
	isEnding = end;

	startDialog(dialogStr);
}

function startEndingDialog(ending) {
	isNarrating = true;
	isEnding = true;

	startDialog(
		dialog[ending.id].src,
		ending.id,
		function() {
			var isLocked = ending.property && ending.property.locked === true;
			if (isLocked) {
				isEnding = false;
			}
		},
		ending);
}

function startItemDialog(itemId, dialogCallback) {
	var dialogId = item[itemId].dlg;
	// bitsyLog("START ITEM DIALOG " + dialogId);
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
	// bitsyLog("START SPRITE DIALOG " + dialogId);
	if (dialog[dialogId]){
		var dialogStr = dialog[dialogId].src;
		startDialog(dialogStr,dialogId);
	}
}

function startDialog(dialogStr, scriptId, dialogCallback, objectContext) {
	// bitsyLog("START DIALOG ");
	if (dialogStr.length <= 0) {
		// bitsyLog("ON EXIT DIALOG -- startDialog 1");
		onExitDialog(null, dialogCallback);
		return;
	}

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
var scriptModule = new Script();
var scriptInterpreter = scriptModule.CreateInterpreter();
var scriptUtils = scriptModule.CreateUtils(); // TODO: move to editor.js?
// scriptInterpreter.SetDialogBuffer( dialogBuffer );

/* EVENTS */
bitsyOnUpdate(update);
bitsyOnQuit(stopGame);
bitsyOnLoad(load_game);