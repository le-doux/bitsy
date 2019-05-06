var xhr; // TODO : remove
var canvas;
var context; // TODO : remove if safe?
var ctx;

var title = "";
var room = {};
var tile = {};
var sprite = {};
var item = {};
var dialog = {};
var palette = {
	"0" : [[0,0,0],[255,0,0],[255,255,255]] //start off with a default palette (can be overriden)
};
var ending = {};
var variable = {}; // these are starting variable values -- they don't update (or I don't think they will)
var playerId = "A";

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
	/*dialog : new Map()*/ // TODO
	/*ending : new Map()*/ // TODO
};
function updateNamesFromCurData() {
	names.room = new Map();
	for(id in room) {
		if(room[id].name != undefined && room[id].name != null) {
			names.room.set( room[id].name, id );
		}
	}
	names.tile = new Map();
	for(id in tile) {
		if(tile[id].name != undefined && tile[id].name != null) {
			names.tile.set( tile[id].name, id );
		}
	}
	names.sprite = new Map();
	for(id in sprite) {
		if(sprite[id].name != undefined && sprite[id].name != null) {
			names.sprite.set( sprite[id].name, id );
		}
	}
	names.item = new Map();
	for(id in item) {
		if(item[id].name != undefined && item[id].name != null) {
			names.item.set( item[id].name, id );
		}
	}
}

var spriteStartLocations = {};

/* VERSION */
var version = {
	major: 6, // major changes
	minor: 0 // smaller changes
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
	title = "";
	room = {};
	tile = {};
	sprite = {};
	item = {};
	dialog = {};
	palette = { //start off with a default palette (can be overriden)
		"0" : {
			name : null,
			colors : [[0,0,0],[255,0,0],[255,255,255]]
		}
	};
	ending = {};
	isEnding = false; //todo - correct place for this?
	variable = {};

	// TODO RENDERER : clear data?

	spriteStartLocations = {};

	names = {
		room : new Map(),
		tile : new Map(),
		sprite : new Map(),
		item : new Map()
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

var prevTime = 0;
var deltaTime = 0;

//methods used to trigger gif recording
var didPlayerMoveThisFrame = false;
var onPlayerMoved = null;
// var didDialogUpdateThisFrame = false;
var onDialogUpdate = null;

//inventory update UI handles
var onInventoryChanged = null;
var onVariableChanged = null;

var isPlayerEmbeddedInEditor = false;

var renderer = new Renderer(tilesize, scale);

function getGameNameFromURL() {
	var game = window.location.hash.substring(1);
	// console.log("game name --- " + game);
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

	// setInterval(updateLoadingScreen, 300); // hack test

	onready(startWithTitle);
}

function reset_cur_game() {
	if (curGameData == null) return; //can't reset if we don't have the game data
	stopGame();
	clearGameData();
	load_game(curGameData);
}

var update_interval = null;
function onready(startWithTitle) {
	if(startWithTitle === undefined || startWithTitle === null) startWithTitle = true;

	clearInterval(loading_interval);

	input = new InputManager();

	document.addEventListener('keydown', input.onkeydown);
	document.addEventListener('keyup', input.onkeyup);

	if (isPlayerEmbeddedInEditor) {
		canvas.addEventListener('touchstart', input.ontouchstart);
		canvas.addEventListener('touchmove', input.ontouchmove);
		canvas.addEventListener('touchend', input.ontouchend);
	}
	else {
		document.addEventListener('touchstart', input.ontouchstart);
		document.addEventListener('touchmove', input.ontouchmove);
		document.addEventListener('touchend', input.ontouchend);
	}

	window.onblur = input.onblur;

	update_interval = setInterval(update,16);

	if(startWithTitle) { // used by editor 
		startNarrating(title);
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

// TODO: this is likely broken
function breadthFirstSearch(map, from, to) {
	from.trail = [];
	var visited = [];
	var queue = [from];
	visited.push( posToString(from) );

	//console.log( "~ bfs ~");
	//console.log( posToString(from) + " to " + posToString(to) );

	while ( queue.length > 0 ) {

		//grab pos from queue and mark as visited
		var curPos = queue.shift();

		//console.log( posToString(curPos) );
		//console.log( ".. " + pathToString(curPos.trail) );
		//console.log( visited );

		if (curPos.x == to.x && curPos.y == to.y) {
			//found a path!
			var path = curPos.trail.splice(0);
			path.push( curPos );
			return path;
		}

		//look at neighbors
		neighbors(curPos).forEach( function(n) {
			var inBounds = (n.x >= 0 && n.x < 16 && n.y >= 0 && n.y < 16);
			if (inBounds) {
				var noCollision = map[n.y][n.x] <= 0;
				var notVisited = visited.indexOf( posToString(n) ) == -1;
				if (noCollision && notVisited) {
					n.trail = curPos.trail.slice();
					n.trail.push(curPos);
					queue.push( n );
					visited.push( posToString(n) );
				}
			}
		});

	}

	return []; // no path found
}

function posToString(pos) {
	return pos.x + "," + pos.y;
}

function pathToString(path) {
	var s = "";
	for (i in path) {
		s += posToString(path[i]) + " ";
	}
	return s;
}

function neighbors(pos) {
	var neighborList = [];
	neighborList.push( {x:pos.x+1, y:pos.y+0} );
	neighborList.push( {x:pos.x-1, y:pos.y+0} );
	neighborList.push( {x:pos.x+0, y:pos.y+1} );
	neighborList.push( {x:pos.x+0, y:pos.y-1} );
	return neighborList;
}

function collisionMap(roomId) {
	var map = [
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	];

	for (r in room[roomId].tilemap) {
		var row = room[roomId].tilemap[r];
		for (var c = 0; c < row.length; c++) {
			if (room[roomId].walls.indexOf( row[x] ) != -1) {
				map[r][c] = 1;
			}
		}
	}

	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === roomId) {
			map[spr.y][spr.x] = 2;
		}
	}

	return map;
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
	console.log("stop GAME!");

	document.removeEventListener('keydown', input.onkeydown);
	document.removeEventListener('keyup', input.onkeyup);

	if (isPlayerEmbeddedInEditor) {
		canvas.removeEventListener('touchstart', input.ontouchstart);
		canvas.removeEventListener('touchmove', input.ontouchmove);
		canvas.removeEventListener('touchend', input.ontouchend);
	}
	else {
		document.removeEventListener('touchstart', input.ontouchstart);
		document.removeEventListener('touchmove', input.ontouchmove);
		document.removeEventListener('touchend', input.ontouchend);
	}

	window.onblur = null;

	clearInterval(update_interval);
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
var loading_interval = null;

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
		else if (!isEnding) {
			moveSprites(); // TODO : I probably need to remove this..
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

	//for gif recording
	if (didPlayerMoveThisFrame && onPlayerMoved != null) {
		onPlayerMoved();
	}
	didPlayerMoveThisFrame = false;

	/* hacky replacement */
	if (onDialogUpdate != null) {
		dialogRenderer.SetPageFinishHandler( onDialogUpdate );
	}

	input.resetKeyPressed();
	input.resetTapReleased();
}

function updateInput() {
	if( dialogBuffer.IsActive() ) {
		if (input.anyKeyPressed() || input.isTapReleased()) {
			/* CONTINUE DIALOG */
			if (dialogBuffer.CanContinue()) {
				var hasMoreDialog = dialogBuffer.Continue();
				if(!hasMoreDialog) {
					// ignore currently held keys UNTIL they are released (stops player from insta-moving)
					input.ignoreHeldKeys();
				}
			}
			else {
				dialogBuffer.Skip();
			}
		}
	}
	else if ( isEnding ) {
		if (input.anyKeyPressed() || input.isTapReleased()) {
			/* RESTART GAME */
			reset_cur_game();
		}
	}
	else {
		/* WALK */
		var prevPlayerDirection = curPlayerDirection;

		if ( input.isKeyDown( key.left ) || input.isKeyDown( key.a ) || input.swipeLeft() ) {
			curPlayerDirection = Direction.Left;
		}
		else if ( input.isKeyDown( key.right ) || input.isKeyDown( key.d ) || input.swipeRight() ) {
			curPlayerDirection = Direction.Right;
		}
		else if ( input.isKeyDown( key.up ) || input.isKeyDown( key.w ) || input.swipeUp() ) {
			curPlayerDirection = Direction.Up;
		}
		else if ( input.isKeyDown( key.down ) || input.isKeyDown( key.s ) || input.swipeDown() ) {
			curPlayerDirection = Direction.Down;
		}
		else {
			curPlayerDirection = Direction.None;
		}

		if (curPlayerDirection != Direction.None && curPlayerDirection != prevPlayerDirection) {
			movePlayer( curPlayerDirection );
			playerHoldToMoveTimer = 500;
		}
	}
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

var moveCounter = 0;
var moveTime = 200;
function moveSprites() {
	moveCounter += deltaTime;

	if (moveCounter >= moveTime) {

		for (id in sprite) {
			var spr = sprite[id];
			if (spr.walkingPath.length > 0) {
				//move sprite
				var nextPos = spr.walkingPath.shift();
				spr.x = nextPos.x;
				spr.y = nextPos.y;


				var end = getEnding( spr.room, spr.x, spr.y );
				var ext = getExit( spr.room, spr.x, spr.y );
				var itmIndex = getItemIndex( spr.room, spr.x, spr.y );
				if (end) { //if the sprite hits an ending
					if (id === playerId) { // only the player can end the game
						startNarrating( ending[end.id], true /*isEnding*/ );
					}
				}
				else if (ext) { //if the sprite hits an exit
					//move it to another scene
					spr.room = ext.dest.room;
					spr.x = ext.dest.x;
					spr.y = ext.dest.y;
					if (id === playerId) {
						//if the player changes scenes, change the visible scene
						curRoom = ext.dest.room;
					}
				}
				else if(itmIndex > -1) {
					var itm = room[ spr.room ].items[ itmIndex ];
					room[ spr.room ].items.splice( itmIndex, 1 );
					if( spr.inventory[ itm.id ] )
						spr.inventory[ itm.id ] += 1;
					else
						spr.inventory[ itm.id ] = 1;

					if(onInventoryChanged != null)
						onInventoryChanged( itm.id );

					if(id === playerId)
						startItemDialog( itm.id  /*itemId*/ );

					// stop moving : is this a good idea?
					spr.walkingPath = [];
				}

				if (id === playerId) didPlayerMoveThisFrame = true;
			}
		}

		moveCounter = 0;
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

var InputManager = function() {
	var self = this;

	var pressed;
	var ignored;
	var newKeyPress;
	var touchState;

	function resetAll() {
		pressed = {};
		ignored = {};
		newKeyPress = false;

		touchState = {
			isDown : false,
			startX : 0,
			startY : 0,
			curX : 0,
			curY : 0,
			swipeDistance : 30,
			swipeDirection : Direction.None,
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
				// console.log("IGNORE -- " + key);
			}
		}
	}

	this.onkeydown = function(event) {
		// console.log("KEYDOWN -- " + event.keyCode);

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

		if (!self.isKeyDown(event.keyCode)) {
			newKeyPress = true;
		}

		pressed[event.keyCode] = true;
		ignored[event.keyCode] = false;
	}

	this.onkeyup = function(event) {
		// console.log("KEYUP -- " + event.keyCode);
		pressed[event.keyCode] = false;
		ignored[event.keyCode] = false;
	}

	this.ontouchstart = function(event) {
		event.preventDefault();

		if( event.changedTouches.length > 0 ) {
			touchState.isDown = true;

			touchState.startX = touchState.curX = event.changedTouches[0].clientX;
			touchState.startY = touchState.curY = event.changedTouches[0].clientY;

			touchState.swipeDirection = Direction.None;
		}
	}

	this.ontouchmove = function(event) {
		event.preventDefault();

		if( touchState.isDown && event.changedTouches.length > 0 ) {
			touchState.curX = event.changedTouches[0].clientX;
			touchState.curY = event.changedTouches[0].clientY;

			var prevDirection = touchState.swipeDirection;

			if( touchState.curX - touchState.startX <= -touchState.swipeDistance ) {
				touchState.swipeDirection = Direction.Left;
			}
			else if( touchState.curX - touchState.startX >= touchState.swipeDistance ) {
				touchState.swipeDirection = Direction.Right;
			}
			else if( touchState.curY - touchState.startY <= -touchState.swipeDistance ) {
				touchState.swipeDirection = Direction.Up;
			}
			else if( touchState.curY - touchState.startY >= touchState.swipeDistance ) {
				touchState.swipeDirection = Direction.Down;
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

		if( touchState.swipeDirection == Direction.None ) {
			// tap!
			touchState.tapReleased = true;
		}

		touchState.swipeDirection = Direction.None;
	}

	this.isKeyDown = function(keyCode) {
		return pressed[keyCode] != null && pressed[keyCode] == true && (ignored[keyCode] == null || ignored[keyCode] == false);
	}

	this.anyKeyPressed = function() {
		return newKeyPress;
	}

	this.resetKeyPressed = function() {
		newKeyPress = false;
	}

	this.swipeLeft = function() {
		return touchState.swipeDirection == Direction.Left;
	}

	this.swipeRight = function() {
		return touchState.swipeDirection == Direction.Right;
	}

	this.swipeUp = function() {
		return touchState.swipeDirection == Direction.Up;
	}

	this.swipeDown = function() {
		return touchState.swipeDirection == Direction.Down;
	}

	this.isTapReleased = function() {
		return touchState.tapReleased;
	}

	this.resetTapReleased = function() {
		touchState.tapReleased = false;
	}

	this.onblur = function() {
		// console.log("~~~ BLUR ~~");
		resetAll();
	}
}
var input = null;

function movePlayer(direction) {
	if (player().room == null || !Object.keys(room).includes(player().room)) {
		return; // player room is missing or invalid.. can't move them!
	}

	var spr = null;

	if ( curPlayerDirection == Direction.Left && !(spr = getSpriteLeft()) && !isWallLeft()) {
		player().x -= 1;
		didPlayerMoveThisFrame = true;
	}
	else if ( curPlayerDirection == Direction.Right && !(spr = getSpriteRight()) && !isWallRight()) {
		player().x += 1;
		didPlayerMoveThisFrame = true;
	}
	else if ( curPlayerDirection == Direction.Up && !(spr = getSpriteUp()) && !isWallUp()) {
		player().y -= 1;
		didPlayerMoveThisFrame = true;
	}
	else if ( curPlayerDirection == Direction.Down && !(spr = getSpriteDown()) && !isWallDown()) {
		player().y += 1;
		didPlayerMoveThisFrame = true;
	}
	
	var ext = getExit( player().room, player().x, player().y );
	var end = getEnding( player().room, player().x, player().y );
	// TODO : vNext
	// var eff = getEffect( player().room, player().x, player().y );
	var itmIndex = getItemIndex( player().room, player().x, player().y );

	// do items first, because you can pick up an item AND go through a door
	if (itmIndex > -1) {
		// TODO pick up items (what about touch?)
		// console.log("HIT ITM ");
		// console.log( itmIndex );
		var itm = room[ player().room ].items[ itmIndex ];
		// console.log(itm);
		room[ player().room ].items.splice( itmIndex, 1 );
		if( player().inventory[ itm.id ] )
			player().inventory[ itm.id ] += 1;
		else
			player().inventory[ itm.id ] = 1;

		if(onInventoryChanged != null)
			onInventoryChanged( itm.id );

		startItemDialog( itm.id  /*itemId*/ );

		// console.log( player().inventory );
	}

	if (end) {
		startNarrating( ending[end.id], true /*isEnding*/ );
	}
	else if (ext) {
		movePlayerThroughExit(ext);
	}
	// TODO : vNext
	// else if (eff) {
	// 	startDialog( script[eff.id].source, eff.id );
	// }
	else if (spr) {
		startSpriteDialog( spr /*spriteId*/ );
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
	};

	// TODO : vNext
	// if(ext.script_id != null && script[ext.script_id]){
	// 	var scriptSourceStr = script[ext.script_id].source;
	// 	startDialog(scriptSourceStr, ext.script_id, function(isExitUnlocked) {
	// 		if (isExitUnlocked == true) {
	// 			GoToDest();
	// 		}
	// 	});
	// }
	// else {
	// 	GoToDest();
	// }

	GoToDest();
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

// TODO : vNext
// function getEffect(roomId,x,y) {
// 	for (i in room[roomId].effects) {
// 		var e = room[roomId].effects[i];
// 		if (x == e.x && y == e.y) {
// 			return e;
// 		}
// 	}
// 	return null;
// }

function getTile(x,y) {
	// console.log(x + " " + y);
	var t = getRoom().tilemap[y][x];
	return t;
}

function player() {
	return sprite[playerId];
}

// Sort of a hack for legacy palette code (when it was just an array)
function getPal(id) {
	return palette[ id ].colors;
}

function getRoom() {
	return room[curRoom];
}

function isSpriteOffstage(id) {
	return sprite[id].room == null;
}

function parseWorld(file) {
	// console.log("~~~ PARSE WORLD ~~~");
	// console.log(file);

	// var parseTimer = new Timer();

	spriteStartLocations = {};

	resetFlags();

	var versionNumber = 0;

	var lines = file.split("\n");
	var i = 0;
	while (i < lines.length) {
		var curLine = lines[i];

		// console.log(lines[i]);

		if (i == 0) {
			i = parseTitle(lines, i);
		}
		else if (curLine.length <= 0 || curLine.charAt(0) === "#") {
			// collect version number (from a comment.. hacky I know)
			if (curLine.indexOf("# BITSY VERSION ") != -1) {
				versionNumber = parseFloat(curLine.replace("# BITSY VERSION ", ""));
			}

			//skip blank lines & comments
			i++;
		}
		else if (getType(curLine) == "PAL") {
			i = parsePalette(lines, i);
		}
		else if (getType(curLine) === "ROOM" || getType(curLine) === "SET") { //SET for back compat
			i = parseRoom(lines, i);
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
			i = parseDialog(lines, i);
		}
		else if (getType(curLine) === "END") {
			i = parseEnding(lines, i);
		}
		// TODO: vNext
		// else if (getType(curLine) === "PRG") {
		// 	i = parseScript(lines, i);
		// }
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

	console.log("START ROOM " + curRoom);

	renderer.SetPalettes(palette);

	// console.log(names);

	// console.log("~~~~~ PARSE TIME " + parseTimer.Milliseconds());

	return versionNumber;
}

//TODO this is in progress and doesn't support all features
function serializeWorld(skipFonts) {
	if (skipFonts === undefined || skipFonts === null)
		skipFonts = false;

	var worldStr = "";
	/* TITLE */
	worldStr += title + "\n";
	worldStr += "\n";
	/* VERSION */
	worldStr += "# BITSY VERSION " + getEngineVersion() + "\n"; // add version as a comment for debugging purposes
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
					// TODO : vNext
					// if (e.script_id != undefined && e.script_id != null) {
					// 	worldStr += " PRG " + e.script_id;
					// }
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
		// TODO : vNext
		// if (room[id].effects.length > 0) {
		// 	/* EFFECTS */
		// 	for (j in room[id].effects) {
		// 		var e = room[id].effects[j];
		// 		worldStr += "EFF " + e.id + " " + e.x + "," + e.y;
		// 		worldStr += "\n";
		// 	}
		// }
		if (room[id].pal != null) {
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
		worldStr += "DLG " + id + "\n";
		worldStr += dialog[id] + "\n";
		worldStr += "\n";
	}
	/* ENDINGS */
	for (id in ending) {
		worldStr += "END " + id + "\n";
		worldStr += ending[id] + "\n";
		worldStr += "\n";
	}
	// TODO : vNext
	// /* SCRIPTS */
	// for (id in script) {
	// 	if (script[id].type == ScriptType.Dialogue) {
	// 		worldStr += "DLG " + id + "\n";
	// 	}
	// 	else if (script[id].type == ScriptType.Ending) {
	// 		worldStr += "END " + id + "\n";
	// 	}
	// 	else {
	// 		worldStr += "PRG " + id + "\n";
	// 	}
	// 	worldStr += script[id].source + "\n";
	// 	worldStr += "\n";
	// }
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
		//console.log(id);
		//console.log( spriteStartLocations[id] );
		//console.log(sprite[id]);
		sprite[id].room = spriteStartLocations[id].room;
		sprite[id].x = spriteStartLocations[id].x;
		sprite[id].y = spriteStartLocations[id].y;
		//console.log(sprite[id]);
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
	title = lines[i];
	i++;
	return i;
}

function parseRoom(lines, i) {
	var id = getId(lines[i]);
	room[id] = {
		id : id,
		tilemap : [],
		walls : [],
		exits : [],
		endings : [],
		// effects : [], // TODO vNext
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
		// console.log(getType(lines[i]));
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
				// TODO : vNext
				// script_id : null,
			};

			// optional arguments
			var exitArgIndex = 4;
			while (exitArgIndex < exitArgs.length) {
				if (exitArgs[exitArgIndex] == "FX") {
					ext.transition_effect = exitArgs[exitArgIndex+1];
					exitArgIndex += 2;
				}
				// TODO : vNext
				// else if (exitArgs[exitArgIndex] == "PRG") {
				// 	ext.script_id = exitArgs[exitArgIndex+1];
				// 	exitArgIndex += 2;
				// }
				else {
					exitArgIndex += 1;
				}
			}

			room[id].exits.push(ext);
		}
		else if (getType(lines[i]) === "END") {
			/* ADD ENDING */
			var endId = getId( lines[i] );
			var endCoords = getCoord( lines[i], 2 );
			var end = {
				id : endId,
				x : parseInt( endCoords[0] ),
				y : parseInt( endCoords[1] )
			};
			room[id].endings.push(end);
		}
		// TODO : vNext
		// else if (getType(lines[i]) === "EFF") {
		// 	/* ADD EFFECT */
		// 	var effectId = getId( lines[i] );
		// 	var effectCoords = getCoord( lines[i], 2 );
		// 	var effect = {
		// 		id : effectId,
		// 		x : parseInt( effectCoords[0] ),
		// 		y : parseInt( effectCoords[1] ),
		// 	};
		// 	room[id].effects.push(effect);
		// }
		else if (getType(lines[i]) === "PAL") {
			/* CHOOSE PALETTE (that's not default) */
			room[id].pal = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			var name = lines[i].split(/\s(.+)/)[1];
			room[id].name = name;
			names.room.set( name, id);
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
		if(args[0] === "NAME") {
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
	var drwId = null;
	var name = null;

	i++;

	if (getType(lines[i]) === "DRW") { //load existing drawing
		drwId = getId(lines[i]);
		i++;
	}
	else {
		// store tile source
		drwId = "TIL_" + id;
		i = parseDrawingCore( lines, i, drwId );
	}

	//other properties
	var colorIndex = 1; // default palette color index is 1
	var isWall = null; // null indicates it can vary from room to room (original version)
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		if (getType(lines[i]) === "COL") {
			colorIndex = parseInt( getId(lines[i]) );
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			name = lines[i].split(/\s(.+)/)[1];
			names.tile.set( name, id );
		}
		else if (getType(lines[i]) === "WAL") {
			var wallArg = getArg( lines[i], 1 );
			if( wallArg === "true" ) {
				isWall = true;
			}
			else if( wallArg === "false" ) {
				isWall = false;
			}
		}
		i++;
	}

	//tile data
	tile[id] = {
		id : id,
		drw : drwId, //drawing id
		col : colorIndex,
		animation : {
			isAnimated : (renderer.GetFrameCount(drwId) > 1),
			frameIndex : 0,
			frameCount : renderer.GetFrameCount(drwId)
		},
		name : name,
		isWall : isWall
	};

	return i;
}

function parseSprite(lines, i) {
	var id = getId(lines[i]);
	var drwId = null;
	var name = null;

	i++;

	if (getType(lines[i]) === "DRW") { //load existing drawing
		drwId = getId(lines[i]);
		i++;
	}
	else {
		// store sprite source
		drwId = "SPR_" + id;
		i = parseDrawingCore( lines, i, drwId );
	}

	//other properties
	var colorIndex = 2; //default palette color index is 2
	var dialogId = null;
	var startingInventory = {};
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			colorIndex = parseInt( getId(lines[i]) );
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
			dialogId = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			name = lines[i].split(/\s(.+)/)[1];
			names.sprite.set( name, id );
		}
		else if (getType(lines[i]) === "ITM") {
			/* ITEM STARTING INVENTORY */
			var itemId = getId(lines[i]);
			var itemCount = parseFloat( getArg(lines[i], 2) );
			startingInventory[itemId] = itemCount;
		}
		i++;
	}

	//sprite data
	sprite[id] = {
		id : id,
		drw : drwId, //drawing id
		col : colorIndex,
		dlg : dialogId,
		room : null, //default location is "offstage"
		x : -1,
		y : -1,
		walkingPath : [], //tile by tile movement path (isn't saved)
		animation : {
			isAnimated : (renderer.GetFrameCount(drwId) > 1),
			frameIndex : 0,
			frameCount : renderer.GetFrameCount(drwId)
		},
		inventory : startingInventory,
		name : name
	};
	return i;
}

function parseItem(lines, i) {
	var id = getId(lines[i]);
	var drwId = null;
	var name = null;

	i++;

	if (getType(lines[i]) === "DRW") { //load existing drawing
		drwId = getId(lines[i]);
		i++;
	}
	else {
		// store item source
		drwId = "ITM_" + id; // these prefixes are maybe a terrible way to differentiate drawing tyepes :/
		i = parseDrawingCore( lines, i, drwId );
	}

	//other properties
	var colorIndex = 2; //default palette color index is 2
	var dialogId = null;
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			colorIndex = parseInt( getArg( lines[i], 1 ) );
		}
		// else if (getType(lines[i]) === "POS") {
		// 	/* STARTING POSITION */
		// 	var posArgs = lines[i].split(" ");
		// 	var roomId = posArgs[1];
		// 	var coordArgs = posArgs[2].split(",");
		// 	spriteStartLocations[id] = {
		// 		room : roomId,
		// 		x : parseInt(coordArgs[0]),
		// 		y : parseInt(coordArgs[1])
		// 	};
		// }
		else if(getType(lines[i]) === "DLG") {
			dialogId = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			name = lines[i].split(/\s(.+)/)[1];
			names.item.set( name, id );
		}
		i++;
	}

	//item data
	item[id] = {
		id : id,
		drw : drwId, //drawing id
		col : colorIndex,
		dlg : dialogId,
		// room : null, //default location is "offstage"
		// x : -1,
		// y : -1,
		animation : {
			isAnimated : (renderer.GetFrameCount(drwId) > 1),
			frameIndex : 0,
			frameCount : renderer.GetFrameCount(drwId)
		},
		name : name
	};

	// console.log("ITM " + id);
	// console.log(item[id]);

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

// TODO : vNext
// var ScriptType = {
// 	Script : 0,
// 	Dialogue : 1, // TODO : move everything to this spelling?
// 	Ending : 2,
// };

function parseScript(lines, i, objectStore) {
	// TODO : vNext
	// if (scriptType === undefined || scriptType === null) {
	// 	scriptType = ScriptType.Script;
	// }

	var id = getId(lines[i]);
	i++;

	var results = scriptUtils.ReadDialogScript(lines,i);

	// TODO : vNext
	// script[id] = {
	// 	source: results.script,
	// 	type: scriptType,
	// };

	objectStore[id] = results.script;

	i = results.index;

	return i;
}

function parseDialog(lines, i) {
	return parseScript(lines, i, dialog);
}

function parseEnding(lines, i) {
	return parseScript(lines, i, ending);
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

function drawTile(img,x,y,context) {
	if (!context) { //optional pass in context; otherwise, use default
		context = ctx;
	}
	// NOTE: images are now canvases, instead of raw image data (for chrome performance reasons)
	context.drawImage(img,x*tilesize*scale,y*tilesize*scale,tilesize*scale,tilesize*scale);
}

function drawSprite(img,x,y,context) { //this may differ later (or not haha)
	drawTile(img,x,y,context);
}

function drawItem(img,x,y,context) {
	drawTile(img,x,y,context); //TODO these methods are dumb and repetitive
}

// var debugLastRoomDrawn = "0";

function drawRoom(room,context,frameIndex) { // context & frameIndex are optional
	if (!context) { //optional pass in context; otherwise, use default (ok this is REAL hacky isn't it)
		context = ctx;
	}

	// if (room.id != debugLastRoomDrawn) {
	// 	debugLastRoomDrawn = room.id;
	// 	console.log("DRAW ROOM " + debugLastRoomDrawn);
	// }

	if (room === undefined) {
		// protect against invalid rooms -- but it assumes there is a "0" pal
		context.fillStyle = "rgb(" + getPal("0")[0][0] + "," + getPal("0")[0][1] + "," + getPal("0")[0][2] + ")";
		context.fillRect(0,0,canvas.width,canvas.height);
		return;
	}

	//clear screen
	context.fillStyle = "rgb(" + getPal(room.pal)[0][0] + "," + getPal(room.pal)[0][1] + "," + getPal(room.pal)[0][2] + ")";
	context.fillRect(0,0,canvas.width,canvas.height);

	//draw tiles
	for (i in room.tilemap) {
		for (j in room.tilemap[i]) {
			var id = room.tilemap[i][j];
			if (id != "0") {
				//console.log(id);
				if (tile[id] == null) { // hack-around to avoid corrupting files (not a solution though!)
					id = "0";
					room.tilemap[i][j] = id;
				}
				else {
					// console.log(id);
					drawTile( getTileImage(tile[id],getRoomPal(room.id),frameIndex), j, i, context );
				}
			}
		}
	}

	//draw items
	for (var i = 0; i < room.items.length; i++) {
		var itm = room.items[i];
		drawItem( getItemImage(item[itm.id],getRoomPal(room.id),frameIndex), itm.x, itm.y, context );
	}

	//draw sprites
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === room.id) {
			drawSprite( getSpriteImage(spr,getRoomPal(room.id),frameIndex), spr.x, spr.y, context );
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
	if (roomId == null) {
		return "0";
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
			return "0";
		}
	}
	return "0";	
}

var isDialogMode = false;
var isNarrating = false;
var isEnding = false;
var dialogModule = new Dialog();
var dialogRenderer = dialogModule.CreateRenderer();
var dialogBuffer = dialogModule.CreateBuffer();
var fontManager = new FontManager();

function onExitDialog(scriptResult, dialogCallback) {
	isDialogMode = false;
	if (isNarrating) isNarrating = false;
	if (isDialogPreview) {
		isDialogPreview = false;
		if (onDialogPreviewEnd != null)
			onDialogPreviewEnd();
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
	console.log("NARRATE " + dialogStr);

	if(end === undefined) end = false;

	isNarrating = true;
	isEnding = end;
	startDialog(dialogStr);
}

function startItemDialog(itemId) {
	var dialogId = item[itemId].dlg;
	// console.log("START ITEM DIALOG " + dialogId);
	if(dialog[dialogId]){
		var dialogStr = dialog[dialogId];
		startDialog(dialogStr,dialogId);
	}
}

function startSpriteDialog(spriteId) {
	var spr = sprite[spriteId];
	var dialogId = spr.dlg ? spr.dlg : spriteId;
	// console.log("START SPRITE DIALOG " + dialogId);
	if(dialog[dialogId]){
		var dialogStr = dialog[dialogId];
		startDialog(dialogStr,dialogId);
	}
}

function startDialog(dialogStr,scriptId,dialogCallback) {
	// console.log("START DIALOG ");
	if(dialogStr.length <= 0) {
		// console.log("ON EXIT DIALOG -- startDialog 1");
		onExitDialog(dialogCallback);
		return;
	}

	isDialogMode = true;

	dialogRenderer.Reset();
	dialogRenderer.SetCentered( isNarrating /*centered*/ );
	dialogBuffer.Reset();
	scriptInterpreter.SetDialogBuffer( dialogBuffer );

	var onScriptEnd = function(scriptResult) {
		dialogBuffer.OnDialogEnd(function() {
			onExitDialog(scriptResult, dialogCallback);
		});
	};

	if(scriptId === undefined) {
		scriptInterpreter.Interpret( dialogStr, onScriptEnd );
	}
	else {
		if( !scriptInterpreter.HasScript(scriptId) ) {
			scriptInterpreter.Compile( scriptId, dialogStr );
		}
		scriptInterpreter.DebugVisualizeScriptTree(scriptId);
		scriptInterpreter.Run( scriptId, onScriptEnd );
	}

}

var isDialogPreview = false;
function startPreviewDialog(script, onScriptEnd) {
	isNarrating = true;

	isDialogMode = true;

	isDialogPreview = true;

	dialogRenderer.Reset();
	dialogRenderer.SetCentered( true );
	dialogBuffer.Reset();
	scriptInterpreter.SetDialogBuffer( dialogBuffer );

	onDialogPreviewEnd = onScriptEnd;

	scriptInterpreter.Eval( script, null );
}

/* NEW SCRIPT STUFF */
var scriptModule = new Script();
var scriptInterpreter = scriptModule.CreateInterpreter();
var scriptUtils = scriptModule.CreateUtils(); // TODO: move to editor.js?
// scriptInterpreter.SetDialogBuffer( dialogBuffer );