var xhr;
var canvas;
var context;
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

//stores all image data for tiles, sprites, drawings
var imageStore = {
	source: {},
	render: {}
};

var spriteStartLocations = {};

/* VERSION */
var version = {
	major: 3, // for file format / engine changes
	minor: 5 // for editor changes and bugfixes
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

function clearGameData() {
	title = "";
	room = {};
	tile = {};
	sprite = {};
	dialog = {};
	palette = {
		"0" : [[0,0,0],[255,0,0],[255,255,255]] //start off with a default palette (can be overriden)
	};
	ending = {};
	isEnding = false; //todo - correct place for this?

	//stores all image data for tiles, sprites, drawings
	imageStore = {
		source: {},
		render: {}
	};

	spriteStartLocations = {};
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
	r : 82
};

var prevTime = 0;
var deltaTime = 0;

//methods used to trigger gif recording
var didPlayerMoveThisFrame = false;
var onPlayerMoved = null;
var didDialogUpdateThisFrame = false;
var onDialogUpdate = null;

function getGameNameFromURL() {
	var game = window.location.hash.substring(1);
	console.log("game name --- " + game);
	return game;
}

function attachCanvas(c) {
	canvas = c;
	canvas.width = width * scale;
	canvas.height = width * scale;
	ctx = canvas.getContext("2d");
}

var curGameData = null;
function load_game(game_data) {
	curGameData = game_data; //remember the current game (used to reset the game)
	parseWorld(game_data);
	renderImages();
	onready();
}

function reset_cur_game() {
	if (curGameData == null) return; //can't reset if we don't have the game data
	stopGame();
	clearGameData();
	load_game(curGameData);
}

var update_interval = null;
function onready() {
	clearInterval(loading_interval);

	document.addEventListener('keydown', onkeydown);
	canvas.addEventListener("mousedown", onTouch);
	console.log("hello");
	update_interval = setInterval(update,-1);

	startNarrating(title);
}

function onTouch(e) {
	//dialog mode
	if (isDialogMode) {

		if (isDialogReadyToContinue) {
			continueDialog();
		}
		else {
			skipDialog();
		}

		return;
	}

	if (isEnding) {
		reset_cur_game();
		return;
	}

	//walking mode
	var off = getOffset(e);
	var x = Math.floor(off.x / (tilesize*scale));
	var y = Math.floor(off.y / (tilesize*scale));
	
	//abort if you touch the square you're already on
	if (player().x == x && player().y == y) {
		return;
	}

	//did we touch a sprite?
	var touchedSprite = null;
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === curRoom) {
			if (spr.x == x && spr.y == y) {
				touchedSprite = id;
			}
		}
	}

	//respond to sprite touch
	if (touchedSprite) {
		var spr = sprite[touchedSprite];
		console.log(Math.abs(player().x - spr.x));
		console.log(Math.abs(player().y - spr.y));
		if ( Math.abs(player().x - spr.x) == 0
				&& Math.abs(player().y - spr.y) == 1 )
		{
			//touched a sprite next to you
		}
		else if ( Math.abs(player().y - spr.y) == 0
				&& Math.abs(player().x - spr.x) == 1 )
		{
			//touched a sprite next to you
		}
		else
		{
			return; //oh no! touched a sprite that's out of range
		}

		if (dialog[touchedSprite]) {
			console.log()
			startDialog( dialog[touchedSprite] );
		}

		return;
	}

	//did we touch an open square?
	var row = room[curRoom].tilemap[y];
	console.log(row);
	var til = row[x];
	console.log(til);
	if ( room[curRoom].walls.indexOf(til) != -1 ) {
		//touched a wall
		return;
	}

	//find path to open square, if there is one
	var map = collisionMap(curRoom);
	var path = breadthFirstSearch( map, {x:player().x, y:player().y}, {x:x,y:y} );
	path = path.slice(1); //remove player's start square

	//console.log( pathToString(path) );

	player().walkingPath = path;
}

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
	console.log("STOP GAME?");
	document.removeEventListener('keydown', onkeydown);
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
	console.log(loading_anim_frame);
}

function update() {
	var curTime = Date.now();
	deltaTime = curTime - prevTime;
	
	//clear screen
	ctx.fillStyle = "rgb("+palette[curPal()][0][0]+","+palette[curPal()][0][1]+","+palette[curPal()][0][2]+")";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	if (!isNarrating && !isEnding) {
		updateAnimation();
		drawRoom( room[curRoom] ); // draw world if game has begun
	}

	if (isDialogMode) { // dialog mode
		updateDialog();
		drawDialogBox();
	}
	else if (!isEnding) {
		moveSprites();

		if (player().walkingPath.length > 0) {
			var dest = player().walkingPath[ player().walkingPath.length - 1 ];
			ctx.fillStyle = "#fff";
			ctx.globalAlpha = 0.5;
			ctx.fillRect( dest.x * tilesize*scale, dest.y * tilesize*scale, tilesize*scale, tilesize*scale );
			ctx.globalAlpha = 1;
		}
	}

	prevTime = curTime;

	//for gif recording
	if (didPlayerMoveThisFrame && onPlayerMoved != null) onPlayerMoved();
	didPlayerMoveThisFrame = false;
	if (didDialogUpdateThisFrame && onDialogUpdate != null) onDialogUpdate();
	didDialogUpdateThisFrame = false;
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
				if (end) { //if the sprite hits an ending
					if (id === "A") { // only the player can end the game
						startNarrating( ending[end.id], true /*isEnding*/ );
					}
				}
				else if (ext) { //if the sprite hits an exit
					//move it to another scene
					spr.room = ext.dest.room;
					spr.x = ext.dest.x;
					spr.y = ext.dest.y;
					if (id === "A") {
						//if the player changes scenes, change the visible scene
						curRoom = ext.dest.room;
					}
				}

				if (id === "A") didPlayerMoveThisFrame = true;
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

function onkeydown(e) {
	console.log(e.keyCode);
	e.preventDefault();

	if (isDialogMode) {

		/* CONTINUE DIALOG */

		if (isDialogReadyToContinue) {
			continueDialog();
		}
		else {
			skipDialog();
		}

	}
	else if (isEnding) {
		/* RESTART GAME */
		reset_cur_game();
	}
	else {

		/* WALK */

		var spr = null;

		if ( (e.keyCode == key.left || e.keyCode == key.a) && !(spr = getSpriteLeft()) && !isWallLeft()) {
			player().x -= 1;
			didPlayerMoveThisFrame = true;
		}
		else if ( (e.keyCode == key.right || e.keyCode == key.d) && !(spr = getSpriteRight()) && !isWallRight()) {
			player().x += 1;
			didPlayerMoveThisFrame = true;
		}
		else if ( (e.keyCode == key.up || e.keyCode == key.w) && !(spr = getSpriteUp()) && !isWallUp()) {
			player().y -= 1;
			didPlayerMoveThisFrame = true;
		}
		else if ( (e.keyCode == key.down || e.keyCode == key.s) && !(spr = getSpriteDown()) && !isWallDown()) {
			player().y += 1;
			didPlayerMoveThisFrame = true;
		}
		
		var ext = getExit( player().room, player().x, player().y );
		var end = getEnding( player().room, player().x, player().y );
		if (end) {
			startNarrating( ending[end.id], true /*isEnding*/ );
		}
		else if (ext) {
			player().room = ext.dest.room;
			player().x = ext.dest.x;
			player().y = ext.dest.y;
			curRoom = ext.dest.room;
		}
		else if (spr) {
			if (dialog[spr]) {
				startDialog(dialog[spr]);
			}
		}

		/* RESTART GAME */
		if ( e.keyCode === key.r && ( e.getModifierState("Control") || e.getModifierState("Meta") ) ) {
			if ( confirm("Restart the game?") ) {
				reset_cur_game();
			}
		}
	}

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


function getSpriteAt(x,y) {
	for (s in sprite) {
		if (sprite[s].room === curRoom) {
			if (sprite[s].x == x && sprite[s].y == y) {
				console.log(s);
				return s;
			}
		}
	}
	return null;
}

function isWallLeft() {
	return isWall( player().x - 1, player().y ) || (player().x - 1 < 0);
}

function isWallRight() {
	return isWall( player().x + 1, player().y ) || (player().x + 1 >= 16);
}

function isWallUp() {
	return isWall( player().x, player().y - 1 ) || (player().y - 1 < 0);
}

function isWallDown() {
	return isWall( player().x, player().y + 1 ) || (player().y + 1 >= 16);
}

function isWall(x,y) {
	console.log(x + " " + y);
	var i = getRoom().walls.indexOf( getTile(x,y) );
	return i > -1;
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
	console.log(x + " " + y);
	var t = getRoom().tilemap[y][x];
	return t;
}

function player() {
	return sprite["A"];
}

function getRoom() {
	return room[curRoom];
}

function isSpriteOffstage(id) {
	return sprite[id].room == null;
}

function parseWorld(file) {
	resetFlags();

	var lines = file.split("\n");
	var i = 0;
	while (i < lines.length) {
		var curLine = lines[i];

		// console.log(lines[i]);

		if (i == 0) {
			i = parseTitle(lines, i);
		}
		else if (curLine.length <= 0 || curLine.charAt(0) === "#") {
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
		else if (getType(curLine) === "!") {
			i = parseFlag(lines, i);
		}
		else {
			i++;
		}
	}
	placeSprites();
	if (player().room != null) {
		curRoom = player().room;
	}
}

//TODO this is in progress and doesn't support all features
function serializeWorld() {
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
	/* PALETTE */
	for (id in palette) {
		worldStr += "PAL " + id + "\n";
		for (i in palette[id]) {
			for (j in palette[id][i]) {
				worldStr += palette[id][i][j];
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
		worldStr += "\n";
	}
	/* SPRITES */
	for (id in sprite) {
		worldStr += "SPR " + id + "\n";
		worldStr += serializeDrawing( "SPR_" + id );
		if (sprite[id].room != null) {
			/* SPRITE POSITION */
			worldStr += "POS " + sprite[id].room + " " + sprite[id].x + "," + sprite[id].y + "\n";
		}
		worldStr += "\n";
	}
	/* ITEMS */
	for (id in item) {
		worldStr += "ITM " + id + "\n";
		worldStr += serializeDrawing( "ITM_" + id );
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
	return worldStr;
}

function serializeDrawing(drwId) {
	var drwStr = "";
	for (f in imageStore.source[drwId]) {
		for (y in imageStore.source[drwId][f]) {
			var rowStr = "";
			for (x in imageStore.source[drwId][f][y]) {
				rowStr += imageStore.source[drwId][f][y][x];
			}
			drwStr += rowStr + "\n";
		}
		if (f < (imageStore.source[drwId].length-1)) drwStr += ">\n";
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
		items : [],
		pal : null
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
			//arg format: EXT 10,5 M 3,2
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
				}
			};
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
		else if (getType(lines[i]) === "PAL") {
			/* CHOOSE PALETTE (that's not default) */
			room[id].pal = getId(lines[i]);
		}
		i++;
	}
	return i;
}

function parsePalette(lines,i) { //todo this has to go first right now :(
	var id = getId(lines[i]);
	i++;
	var pal = [];
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		var col = [];
		lines[i].split(",").forEach(function(i) {
			col.push(parseInt(i));
		});
		pal.push(col);
		i++;
	}
	palette[id] = pal;
	return i;
}

function parseTile(lines, i) {
	var id = getId(lines[i]);
	var drwId = null;

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
	var colorIndex = 1; //default palette color index is 1
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		if (getType(lines[i]) === "COL") {
			colorIndex = parseInt( getId(lines[i]) );
		}
		i++;
	}

	//tile data
	tile[id] = {
		drw : drwId, //drawing id
		col : colorIndex,
		animation : {
			isAnimated : (imageStore.source[drwId].length > 1),
			frameIndex : 0,
			frameCount : imageStore.source[drwId].length
		}
	};
	return i;
}

function parseSprite(lines, i) {
	var id = getId(lines[i]);
	var drwId = null;

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
		i++;
	}

	//sprite data
	sprite[id] = {
		drw : drwId, //drawing id
		col : colorIndex,
		room : null, //default location is "offstage"
		x : -1,
		y : -1,
		walkingPath : [], //tile by tile movement path (isn't saved)
		animation : {
			isAnimated : (imageStore.source[drwId].length > 1),
			frameIndex : 0,
			frameCount : imageStore.source[drwId].length
		}
	};
	return i;
}

function parseItem(lines, i) {
	var id = getId(lines[i]);
	var drwId = null;

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
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			colorIndex = parseInt( getId(lines[i]) );
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
		i++;
	}

	//item data
	item[id] = {
		drw : drwId, //drawing id
		col : colorIndex,
		// room : null, //default location is "offstage"
		// x : -1,
		// y : -1,
		animation : {
			isAnimated : (imageStore.source[drwId].length > 1),
			frameIndex : 0,
			frameCount : imageStore.source[drwId].length
		}
	};

	console.log("ITM " + id);
	console.log(item[id]);

	return i;
}

function parseDrawing(lines, i) {
	// store drawing source
	var drwId = getId( lines[i] );
	return parseDrawingCore( lines, i, drwId );
}

function parseDrawingCore(lines, i, drwId) {
	imageStore.source[drwId] = []; //init list of frames
	imageStore.source[drwId].push( [] ); //init first frame
	var frameIndex = 0;
	var y = 0;
	while ( y < tilesize ) {
		var l = lines[i+y];
		var row = [];
		for (x = 0; x < tilesize; x++) {
			row.push( parseInt( l.charAt(x) ) );
		}
		imageStore.source[drwId][frameIndex].push( row );
		y++;

		if (y === tilesize) {
			i = i + y;
			if ( lines[i] != undefined && lines[i].charAt(0) === ">" ) {
				// start next frame!
				imageStore.source[drwId].push( [] );
				frameIndex++;
				//start the count over again for the next frame
				i++;
				y = 0;
			}
		}
	}

	//console.log(imageStore.source[drwId]);
	return i;
}

function renderImages() {
	console.log(" -- RENDER IMAGES -- ");

	//init image store
	for (pal in palette) {
		imageStore.render[pal] = {
			"1" : {}, //images with primary color index 1 (usually tiles)
			"2" : {}  //images with primary color index 2 (usually sprites)
		};
	}

	//render images required by sprites
	for (s in sprite) {
		var spr = sprite[s];
		renderImageForAllPalettes( spr );
	}
	//render images required by tiles
	for (t in tile) {
		var til = tile[t];
		renderImageForAllPalettes( til );
	}
	//render images required by tiles
	for (i in item) {
		var itm = item[i];
		renderImageForAllPalettes( itm );
	}
}

function renderImageForAllPalettes(drawing) {
	for (pal in palette) {
		var col = drawing.col;
		var colStr = "" + col;
		var imgSrc = imageStore.source[ drawing.drw ];
		if ( imgSrc.length <= 1 ) {
			// non-animated drawing
			var frameSrc = imgSrc[0];
			imageStore.render[pal][colStr][drawing.drw] = imageDataFromImageSource( frameSrc, pal, col );
		}
		else {
			// animated drawing
			var frameCount = 0;
			for (f in imgSrc) {
				var frameSrc = imgSrc[f];
				var frameId = drawing.drw + "_" + frameCount;
				imageStore.render[pal][colStr][frameId] = imageDataFromImageSource( frameSrc, pal, col );
				frameCount++;
			}
		}		
	}
}

function imageDataFromImageSource(imageSource, pal, col) {
	//console.log(imageSource);

	var img = ctx.createImageData(tilesize*scale,tilesize*scale);
	for (var y = 0; y < tilesize; y++) {
		for (var x = 0; x < tilesize; x++) {
			var px = imageSource[y][x];
			for (var sy = 0; sy < scale; sy++) {
				for (var sx = 0; sx < scale; sx++) {
					var pxl = (((y * scale) + sy) * tilesize * scale * 4) + (((x*scale) + sx) * 4);
					if (px === 1) {
						img.data[pxl + 0] = palette[pal][col][0]; //ugly
						img.data[pxl + 1] = palette[pal][col][1];
						img.data[pxl + 2] = palette[pal][col][2];
						img.data[pxl + 3] = 255;
					}
					else { //ch === 0
						img.data[pxl + 0] = palette[pal][0][0];
						img.data[pxl + 1] = palette[pal][0][1];
						img.data[pxl + 2] = palette[pal][0][2];
						img.data[pxl + 3] = 255;
					}
				}
			}
		}
	}
	return img;
}

function parseDialog(lines, i) {
	var id = getId(lines[i]);
	i++;
	var text = lines[i];
	i++;
	dialog[id] = text;
	return i;
}

function parseEnding(lines, i) {
	var id = getId(lines[i]);
	i++;
	var text = lines[i];
	i++;
	ending[id] = text;
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
	context.putImageData(img,x*tilesize*scale,y*tilesize*scale);
}

function drawSprite(img,x,y,context) { //this may differ later (or not haha)
	drawTile(img,x,y,context);
}

function drawItem(img,x,y,context) {
	drawTile(img,x,y,context); //TODO these methods are dumb and repetitive
}

function drawRoom(room,context) {
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
					drawTile( getTileImage(tile[id],getRoomPal(room.id)), j, i, context );
				}
			}
		}
	}
	//draw items
	for (var i = 0; i < room.items.length; i++) {
		var itm = room.items[i];
		drawItem( getItemImage(item[itm.id],getRoomPal(room.id)), itm.x, itm.y, context );
	}
	//draw sprites
	for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === room.id) {
			drawSprite( getSpriteImage(spr,getRoomPal(room.id)), spr.x, spr.y, context );
		}
	}
}

function getTileImage(t,palId,frameIndex=null) {
	var drwId = t.drw;

	if (!palId) palId = curPal();

	if ( t.animation.isAnimated ) {
		if (frameIndex != null) { // use optional provided frame index
			// console.log("GET TILE " + frameIndex);
			drwId += "_" + frameIndex;
		}
		else { // or the one bundled with the tile
			drwId += "_" + t.animation.frameIndex;
		}
	}
	return imageStore.render[ palId ][ t.col ][ drwId ];
}

function getSpriteImage(s,palId,frameIndex=null) {
	var drwId = s.drw;

	if (!palId) palId = curPal();

	if ( s.animation.isAnimated ) {
		if (frameIndex != null) {
			drwId += "_" + frameIndex;
		}
		else {
			drwId += "_" + s.animation.frameIndex;
		}
	}

	return imageStore.render[ palId ][ s.col ][ drwId ];
}

function getItemImage(itm,palId,frameIndex=null) { //aren't these all the same????
	var drwId = itm.drw;
	console.log(drwId);

	if (!palId) palId = curPal();

	if ( itm.animation.isAnimated ) {
		if (frameIndex != null) {
			drwId += "_" + frameIndex;
		}
		else {
			drwId += "_" + itm.animation.frameIndex;
		}
	}

	console.log(imageStore.render[ palId ][ itm.col ]);
	console.log(imageStore.render[ palId ][ itm.col ][ drwId ]);
	return imageStore.render[ palId ][ itm.col ][ drwId ];
}

function curPal() {
	return getRoomPal(curRoom);
}

function getRoomPal(roomId) {
	if (room[roomId].pal != null) {
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

/* DIALOG */
var font = new Font();

var dialogbox = {
	img : null,
	width : 104,
	height : 8+4+2+5, //8 for text, 4 for top-bottom padding, 2 for line padding, 5 for arrow
	top : 12,
	left : 12,
	bottom : 12, //for drawing it from the bottom
	charsPerRow : 32
};

var curDialog = [];
var curLine = 0;
var curRow = 0;
var curChar = 0;
var nextCharTimer = 0;
var nextCharMaxTime = 50; //in milliseconds

var isDialogMode = false;
var isNarrating = false;
var isEnding = false;
var isDialogReadyToContinue = false;

function clearDialogBox() {
	dialogbox.img = ctx.createImageData(dialogbox.width*scale, dialogbox.height*scale);
}

function drawDialogBox() {
	if (isNarrating) {
		ctx.putImageData(dialogbox.img, dialogbox.left*scale, ((height/2)-(dialogbox.height/2))*scale);
	}
	else if (player().y < mapsize/2) {
		//bottom
		ctx.putImageData(dialogbox.img, dialogbox.left*scale, (height-dialogbox.bottom-dialogbox.height)*scale);
	}
	else {
		//top
		ctx.putImageData(dialogbox.img, dialogbox.left*scale, dialogbox.top*scale);
	}
}

function updateDialog() {
	if (isDialogReadyToContinue) {
		return; //waiting for dialog to be advance by player
	}

	nextCharTimer += deltaTime; //tick timer

	if (nextCharTimer > nextCharMaxTime) {
		//time to update characters
		if (curChar + 1 < curDialog[curLine][curRow].length) {
			//add char to current row
			curChar++;
		}
		else if (curRow + 1 < curDialog[curLine].length) {
			//start next row
			curRow++;
			curChar = 0;
		}
		else {
			//the line is full!
			drawNextDialogArrow();
			isDialogReadyToContinue = true;
			didDialogUpdateThisFrame = true;
		}

		drawNextDialogChar();
	}
}

function skipDialog() {
	// add new characters until you get to the end of the current line of dialog
	while ( curRow < curDialog[curLine].length ) {
		if (curChar + 1 < curDialog[curLine][curRow].length) {
			//add char to current row
			curChar++;
		}
		else if (curRow + 1 < curDialog[curLine].length) {
			//start next row
			curRow++;
			curChar = 0;
		}
		else {
			//the line is full!
			drawNextDialogArrow();
			isDialogReadyToContinue = true;
			didDialogUpdateThisFrame = true;
			//make sure to push the curRow past the end to break out of the loop
			curRow++;
			curChar = 0;
		}

		drawNextDialogChar();
	}
}

var arrowdata = [
	1,1,1,1,1,
	0,1,1,1,0,
	0,0,1,0,0
];
function drawNextDialogArrow() {
	console.log("draw arrow!");
	var top = (dialogbox.height-5) * scale;
	var left = (dialogbox.width-(5+4)) * scale;
	for (var y = 0; y < 3; y++) {
		for (var x = 0; x < 5; x++) {
			var i = (y * 5) + x;
			if (arrowdata[i] == 1) {
				//scaling nonsense
				for (var sy = 0; sy < scale; sy++) {
					for (var sx = 0; sx < scale; sx++) {
						var pxl = 4 * ( ((top+(y*scale)+sy) * (dialogbox.width*scale)) + (left+(x*scale)+sx) );
						dialogbox.img.data[pxl+0] = 255;
						dialogbox.img.data[pxl+1] = 255;
						dialogbox.img.data[pxl+2] = 255;
						dialogbox.img.data[pxl+3] = 255;
					}
				}

				
			}
		}
	}
}

function continueDialog() {
	console.log("continue!!!");
	if (curLine + 1 < curDialog.length) {
		//start next line
		isDialogReadyToContinue = false;
		curLine++;
		curRow = 0;
		curChar = 0;
		clearDialogBox();
		drawNextDialogChar();
	}
	else {
		//end dialog mode
		isDialogMode = false;
		onExitDialog();
	}
}

function onExitDialog() {
	if (isNarrating) isNarrating = false;
}

function drawNextDialogChar() {
	//draw the character
	var nextChar = curDialog[curLine][curRow][curChar]; //todo - there's a bug here sometimes on speed text (but it doesn't really break anything)
	drawDialogChar(nextChar, curRow, curChar);

	nextCharTimer = 0; //reset timer
}

var text_scale = 2; //using a different scaling factor for text feels like cheating... but it looks better
function drawDialogChar(char, row, col) {

	var top = (4 * scale) + (row * 2 * scale) + (row * 8 * text_scale);
	var left = (4 * scale) + (col * 6 * text_scale);
	var charData = font.getChar( char );
	for (var y = 0; y < 8; y++) {
		for (var x = 0; x < 6; x++) {
			var i = (y * 6) + x;
			if ( charData[i] == 1 ) {

				//scaling nonsense
				for (var sy = 0; sy < text_scale; sy++) {
					for (var sx = 0; sx < text_scale; sx++) {
						var pxl = 4 * ( ((top+(y*text_scale)+sy) * (dialogbox.width*scale)) + (left+(x*text_scale)+sx) );
						dialogbox.img.data[pxl+0] = 255;
						dialogbox.img.data[pxl+1] = 255;
						dialogbox.img.data[pxl+2] = 255;
						dialogbox.img.data[pxl+3] = 255;
					}
				}

				
			}
		}
	}
}

function startNarrating(dialogStr,end=false) {
	isNarrating = true;
	isEnding = end;
	startDialog(dialogStr);
}

function startDialog(dialogStr) {
	if(dialogStr.length <= 0) {
		//end dialog mode
		isDialogMode = false;
		onExitDialog();
		return;
	}

	//process dialog so it's easier to display
	var words = dialogStr.split(" ");
	curDialog = [];
	var curLineArr = [];
	var curRowStr = words[0];

	for (var i = 1; i < words.length; i++) {
		var word = words[i];
		if (curRowStr.length + word.length + 1 <= dialogbox.charsPerRow) {
			//stay on same row
			curRowStr += " " + word;
		}
		else if (curLineArr.length == 0) {
			//start next row
			curLineArr.push(curRowStr);
			curRowStr = word;
		}
		else {
			//start next line
			curLineArr.push(curRowStr);
			curDialog.push(curLineArr);
			curLineArr = [];
			curRowStr = word;
		}
	}

	//finish up 
	if (curRowStr.length > 0) {
		curLineArr.push(curRowStr);
	}
	if (curLineArr.length > 0) {
		curDialog.push(curLineArr);
	}

	console.log(curDialog);

	curLine = 0;
	curRow = 0;
	curChar = 0;

	isDialogMode = true;
	isDialogReadyToContinue = false;

	clearDialogBox();
	drawNextDialogChar();
}