/* 
2.2 so far
- serialize palettes
- bug: parse inline sprites
- bug: can't go off screen to the left or right
- apply wall settings to all rooms
- better data structure for drawings
- remove use of drawing_data
- show ghost of alternate frame
- bug: room tilemap aliasing
- bug: exit options dont update on reset game

TODO NEXT

- end editor (list of endings)
- go to ending from exit
- optional: got to ending after talking to sprite

my ideas
- text effects
- end as a new "room"
- triggers
- transition animations
- walking animations
- bobbing arrow animations
- dialog open close animations
- new pass on UI
- new dialog editor / preview pane
	- bigger dialog box textbox?

from laura michet
X animation usability: ghosting other frame
- map for rooms
- want to see all my tiles at once
- character limit on sprite dialog
- end game condition
- key to restart game
- change color of page background (export results)
- bug: ghost rooms when you restart a game (did I fix this?)

- hide "extra" UI better
- bug: click to nav tiles and click on tile strip don't interoperate well

- bug with extra tiles at the end of room rows breaks shit

- BUG: after play mode, avatar ends up in wrong room
- name rooms, sprites, etc (esp rooms tho)
- make it show/hide exits, instead of "add" exits
- BUG: removing sprite from world doesn't work once you go back into playmode
- BUG: exit highlighting is on by default when engine starts up?
- ONGOING: decrease duplicate code between tile / sprites
- selection box? copy paste?
- bug where word wrap doesn't work for words that are longer than a single line length
- would be cool to select sprites and then find out who they are / what they say?
- how do extra characters end up in the room maps?

now what?
- viral marketting features in the games
	- gif recording
	- linkbacks to editor
	- twitter api sharing
	- link to bitsy list
- email patrick about his friend who's done game jam
- talk to game makers (can I feature your game? other questions..)

- add preview canvas for rooms
- the UI is getting cluttered :(
- is the skip dialog too easy? should I fast forward instead? use specific buttons? (maybe this should be playtested)

from twitter
- look at puzzlescript gist hosting of gamedata (from kool.tools)

- Qs for creators
- creator list (spreadsheet?)

- better formatting for itch
- show entrances as well as exits (drag entrances/exits?)
- async gif processings
- undo / redo
- improve color input for browsers that only accept text
	- hash or no-hash hex
	- rgb with commas
- add instruction on publishing the game (itchio shoutout)

- bug: some sort of bad things happen when you delete room 0


TODO BACKLOG
- export straight to itchio (is there a developer api?)
- drag tool windows around
- multiple palettes
- better icon for exits

v2.0???
- triggers
- variables
- dialog editor w/ special effects
- character paths
	ADAM'S TODOs

		#feature ideas
			#don't see you on exit for one frame?
			#shortcut to sets?
			#default tileset
			#clear tilemap
			#clear tileset

		- bitsy player v2
			- dialog effects
				- color
				- speed
				- pauses
			? animate player movement
			? player face left/right
			?? bouncing arrow
			? sprite walking paths
			? set variable command
			?? narrative blocks
			?? STRICT MODE where text can only fit on one page

		- bitsy player v3


USER FEEDBACK
- add an inventory system
- add triggers
- add dialog choices?

- room transition animations
*/

/*
NOTES
- remember to run chrome like this to test "open /Applications/Google\ Chrome.app --args --allow-file-access-from-files"
*/

/* MODES */
var TileType = {
	Tile : 0,
	Sprite : 1,
	Avatar : 2
};
var EditMode = {
	Edit : 0,
	Play : 1
};

var editMode = EditMode.Edit;

/* PAINT */
var paint_canvas;
var paint_ctx;
var paint_scale = 32;

var paint_nav_canvas;
var paint_nav_ctx;

var paintMode = TileType.Avatar;
var drawingId = "A";
var drawingPal = "0";
var drawPaintGrid = true;
var curPaintBrush = 0;
var isPainting = false;
var isCurDrawingAnimated = false;
var curDrawingFrameIndex = 0;

var tileIndex = 0;
var spriteIndex = 0;
function nextTileId() {
	var idList = sortedTileIdList();
	var lastId = idList[ idList.length - 1 ];
	var idInt = parseInt( lastId, 36 );
	idInt++;
	return idInt.toString(36);
}
function nextSpriteId() {
	var idList = sortedSpriteIdList();
	console.log(idList);
	var lastId = idList[ idList.length - 1 ];
	var idInt = parseInt( lastId, 36 );
	idInt++;
	return idInt.toString(36);
}
function nextRoomId() {
	var idList = sortedRoomIdList();
	var lastId = idList[ idList.length - 1 ];
	var idInt = parseInt( lastId, 36 );
	idInt++;
	return idInt.toString(36);
}

/* ROOM */
var drawMapGrid = true;
var roomIndex = 0;


/* BROWSER COMPATIBILITY */
var browserFeatures = {
	colorPicker : false,
	fileDownload : false
};

/* SCREEN CAPTURE */
var gifencoder = new gif();
var isRecordingGif = false;
var gifFrameData = [];
var isPlayMode = false;

function detectBrowserFeatures() {
	//test feature support
	try {
		var input = document.createElement("input");
		input.type = "color";

		if (input.type === "color") {
			console.log("color picker supported!");
			browserFeatures.colorPicker = true;
		} else {
			browserFeatures.colorPicker = false;
		}
	//document.body.removeChild(input);
	} catch(e) {
		browserFeatures.colorPicker = false;
	}

	var a = document.createElement('a');
	if (typeof a.download != "undefined") {
		console.log("downloads supported!");
		browserFeatures.fileDownload = true;
	}
	else {
		browserFeatures.fileDownload = false;
	}
}

function hasUnsupportedFeatures() {
	return !browserFeatures.colorPicker || !browserFeatures.fileDownload;
}

function showUnsupportedFeatureWarning() {
	document.getElementById("unsupportedFeatures").style.display = "block";
}

function hideUnsupportedFeatureWarning() {
	document.getElementById("unsupportedFeatures").style.display = "none";
}

function start() {
	detectBrowserFeatures();

	//game canvas & context (also the map editor)
	canvas = document.getElementById("game");
	canvas.width = width * scale;
	canvas.height = width * scale;
	ctx = canvas.getContext("2d");
	//map edit events
	listenMapEditEvents();

	//paint canvas & context
	paint_canvas = document.getElementById("paint");
	paint_canvas.width = tilesize * paint_scale;
	paint_canvas.height = tilesize * paint_scale;
	paint_ctx = paint_canvas.getContext("2d");
	//paint events
	paint_canvas.addEventListener("mousedown", paint_onMouseDown);
	paint_canvas.addEventListener("mousemove", paint_onMouseMove);
	paint_canvas.addEventListener("mouseup", paint_onMouseUp);
	paint_canvas.addEventListener("mouseleave", paint_onMouseUp);
	//paint nav canvas & context
	paint_nav_canvas = document.getElementById("paintNavThumbnails");
	paint_nav_canvas.width = tilesize * scale * 8;
	paint_nav_canvas.height = tilesize * scale;
	paint_nav_ctx = paint_nav_canvas.getContext("2d");
	paint_nav_canvas.addEventListener("mousedown", paint_nav_onMouseDown);

	//exit destination canvas & context
	exit_canvas = document.getElementById("exitCanvas");
	exit_canvas.width = width * scale;
	exit_canvas.height = width * scale;
	exit_ctx = exit_canvas.getContext("2d");
	//exit events
	exit_canvas.addEventListener("mousedown", exit_onMouseDown);


	//load last auto-save
	if (localStorage.game_data) {
		//console.log("~~~ found old save data! ~~~");
		//console.log(localStorage.game_data);
		document.getElementById("game_data").value = localStorage.game_data;
		on_game_data_change_core();
	}
	else {
		//console.log("~~~~ no old save data! ~~~~");
		setDefaultGameState();
		refreshGameData();
	}

	//load panel preferences
	var prefs = localStorage.panel_prefs == null ? {} : JSON.parse( localStorage.panel_prefs );
	console.log(prefs);
	if (prefs != null) {
		for (id in prefs) {
			console.log(id + " " + prefs[id]);
			togglePanelCore(id, prefs[id]);
			if (id != "toolsPanel")
				document.getElementById(id.replace("Panel","Check")).checked = prefs[id];
		}
	}

	//draw everything
	on_paint_avatar();
	drawPaintCanvas();
	drawEditMap();

	drawPaintNavThumbnailCanvas();
	setInterval( function() {
		paintNavThumbnailAnimationFrameIndex = ( paintNavThumbnailAnimationFrameIndex + 1 ) % 2;
		drawPaintNavThumbnailCanvas();
	}, animationTime ); // animate the thumbnails of sprites / tiles

	//load engine for export
	loadEngineScript();

	//unsupported feature stuff
	if (hasUnsupportedFeatures()) showUnsupportedFeatureWarning();
	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
		document.getElementById("colorPickerHelp").style.display = "block";
	}
	if (!browserFeatures.fileDownload) {
		document.getElementById("downloadHelp").style.display = "block";
	}

	//respond to player movement event by recording gif frames
	onPlayerMoved = function() {
		if (isRecordingGif) 
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
	};
	onDialogUpdate = function() {
		console.log("dialog update!");
		if (isRecordingGif) {
			// copy frame 5x to slow it down (hacky)
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
		}
	};
}

function setDefaultGameState() {
	//clear values
	clearGameData();
	//hack
	curDrawingFrameIndex = 0;
	isCurDrawingAnimated = false;
	//default values
	title = "Write your game's title here";
	palette[drawingPal] = [
		[0,82,204],
		[128,159,255],
		[255,255,255]
	];
	//default avatar
	console.log("A");
	paintMode = TileType.Avatar;
	//on_paint_avatar();
	drawingId = "A";
	var person_data = [
		[0,0,0,1,1,0,0,0],
		[0,0,0,1,1,0,0,0],
		[0,0,0,1,1,0,0,0],
		[0,0,1,1,1,1,0,0],
		[0,1,1,1,1,1,1,0],
		[1,0,1,1,1,1,0,1],
		[0,0,1,0,0,1,0,0],
		[0,0,1,0,0,1,0,0]
	];
	makeSprite( drawingId, person_data );
	sprite["A"].room = "0";
	sprite["A"].x = 4;
	sprite["A"].y = 4;
	console.log("B");
	//defualt sprite
	paintMode = TileType.Sprite;
	drawingId = "a";
	//newSprite( drawingId );
	//on_paint_sprite();
	var cat_data = [
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,1,0,1,0,0,0,1],
		[0,1,1,1,0,0,0,1],
		[0,1,1,1,0,0,1,0],
		[0,1,1,1,1,1,0,0],
		[0,0,1,1,1,1,0,0],
		[0,0,1,0,0,1,0,0]
	];
	makeSprite( drawingId, cat_data );
	sprite["a"].room = "0";
	sprite["a"].x = 8;
	sprite["a"].y = 12;
	dialog["a"] = "I'm a cat";
	//default tile
	console.log("C");
	paintMode = TileType.Tile;
	drawingId = "a";
	//newTile( drawingId );
	//on_paint_tile();
	var square_data = [
		[1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,1,1,0,0,1],
		[1,0,0,1,1,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1]
	];
	makeTile( drawingId, square_data );
	renderImages();
	console.log("D");
	//default room
	room["0"] = {
		id : "0",
		tilemap : [
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","a","a","a","a","a","a","a","a","a","a","a","a","a","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","0","0","0","0","0","0","0","0","0","0","0","0","a","0"],
				["0","a","a","a","a","a","a","a","a","a","a","a","a","a","a","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]
			],
		walls : [],
		exits : [],
		pal : null
	};
	console.log("E");
	refreshGameData();
	document.getElementById("titleText").value = title;
}

function listenMapEditEvents() {
	canvas.addEventListener("mousedown", map_onMouseDown);
	canvas.addEventListener("mousemove", map_onMouseMove);
	canvas.addEventListener("mouseup", map_onMouseUp);
	canvas.addEventListener("mouseleave", map_onMouseUp);
}

function unlistenMapEditEvents() {
	canvas.removeEventListener("mousedown", map_onMouseDown);
	canvas.removeEventListener("mousemove", map_onMouseMove);
	canvas.removeEventListener("mouseup", map_onMouseUp);
	canvas.removeEventListener("mouseleave", map_onMouseUp);
}

var paintNavThumbnailAnimationFrameIndex = 0;
function drawPaintNavThumbnailCanvas() {
	var realTileSize = tilesize * scale;

	//background
	paint_nav_ctx.fillStyle = "rgb("+palette[drawingPal][0][0]+","+palette[drawingPal][0][1]+","+palette[drawingPal][0][2]+")";
	paint_nav_ctx.fillRect(0,0,paint_nav_canvas.width,paint_nav_canvas.height);

	//draw sprites/tiles
	if ( paintMode === TileType.Tile ) {
		var tileIdList = sortedTileIdList();
		var tileIndex = tileIdList.indexOf( drawingId );
		var tileId = tileIdList[ tileIndex ];
		// draw selected tile
		drawTile( getTileImage( tile[ tileId ], paintNavThumbnailAnimationFrameIndex ), 3, 0, paint_nav_ctx );
		// draw previous tiles
		for (i = 2; i >= 0; i-- ) {
			tileIndex--;
			if (tileIndex >= 0) {
				tileId = tileIdList[ tileIndex ];
				drawTile( getTileImage( tile[ tileId ], paintNavThumbnailAnimationFrameIndex ), i, 0, paint_nav_ctx );
			}
		}
		// draw next tiles
		tileIndex = tileIdList.indexOf( drawingId );
		for (i = 4; i < 8; i++) {
			tileIndex++;
			if (tileIndex < tileIdList.length) {
				tileId = tileIdList[ tileIndex ];
				drawTile( getTileImage( tile[ tileId ], paintNavThumbnailAnimationFrameIndex ), i, 0, paint_nav_ctx );
			}
		}
	}
	else if ( paintMode === TileType.Sprite ) {
		var spriteIdList = sortedSpriteIdList();
		var spriteIndex = spriteIdList.indexOf( drawingId );
		var spriteId = spriteIdList[ spriteIndex ];
		// draw selected sprite
		drawSprite( getSpriteImage( sprite[ spriteId ], paintNavThumbnailAnimationFrameIndex ), 3, 0, paint_nav_ctx );
		// draw previous sprites
		for (i = 2; i >= 0; i-- ) {
			spriteIndex--;
			if (spriteIndex >= 1) {
				spriteId = spriteIdList[ spriteIndex ];
				drawSprite( getSpriteImage( sprite[ spriteId ], paintNavThumbnailAnimationFrameIndex ), i, 0, paint_nav_ctx );
			}
		}
		// draw next sprites
		spriteIndex = spriteIdList.indexOf( drawingId );
		for (i = 4; i < 8; i++) {
			spriteIndex++;
			if (spriteIndex < spriteIdList.length) {
				spriteId = spriteIdList[ spriteIndex ];
				drawSprite( getSpriteImage( sprite[ spriteId ], paintNavThumbnailAnimationFrameIndex ), i, 0, paint_nav_ctx );
			}
		}
	}
	else if ( paintMode === TileType.Avatar ) {
		// draw selected sprite
		drawSprite( getSpriteImage( sprite[ drawingId ], paintNavThumbnailAnimationFrameIndex ), 3, 0, paint_nav_ctx );
	}

	//highlight selected drawing
	paint_nav_ctx.fillStyle = "#000";
	paint_nav_ctx.globalAlpha = 0.4;
	paint_nav_ctx.fillRect(0,0,(3*realTileSize),paint_nav_canvas.height);
	paint_nav_ctx.fillRect(4*realTileSize,0,4*realTileSize,paint_nav_canvas.height);
	paint_nav_ctx.globalAlpha = 1.0;

	//draw grid
	paint_nav_ctx.fillStyle = "#fff";
	for (var x = 1; x < (paint_nav_canvas.width/realTileSize); x++) {
		paint_nav_ctx.fillRect(x*realTileSize,0*realTileSize,1,paint_nav_canvas.height);
	}
	for (var y = 1; y < (paint_nav_canvas.height/realTileSize); y++) {
		paint_nav_ctx.fillRect(0*realTileSize,y*realTileSize,paint_nav_canvas.width,1);
	}
}

function newTile(id) {
	if (id)
		drawingId = id; //this optional parameter lets me override the default next id
	else
		drawingId = nextTileId();

	makeTile(drawingId);

	drawPaintCanvas();
	refreshGameData();

	tileIndex = Object.keys(tile).length - 1;

	reloadTile(); //hack for ui consistency
}

function nextTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex + 1) % ids.length;
	drawingId = ids[tileIndex];
	curDrawingFrameIndex = 0;
	reloadTile();
	drawPaintNavThumbnailCanvas();
}

function prevTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex - 1) % ids.length;
	if (tileIndex < 0) tileIndex = (ids.length-1);
	drawingId = ids[tileIndex];
	curDrawingFrameIndex = 0;
	reloadTile();
	drawPaintNavThumbnailCanvas();
}

function newSprite(id) {
	if (id)
		drawingId = id; //this optional parameter lets me override the default next id
	else
		drawingId = nextSpriteId();

	makeSprite(drawingId);

	drawPaintCanvas();
	refreshGameData();

	spriteIndex = Object.keys(sprite).length - 1;

	reloadSprite(); //hack
}

function nextRoom() {
	var ids = sortedRoomIdList();
	roomIndex = (roomIndex + 1) % ids.length;
	curRoom = ids[roomIndex];
	drawEditMap();

	document.getElementById("roomId").innerHTML = curRoom;
}

function prevRoom() {
	var ids = sortedRoomIdList();
	roomIndex--;
	if (roomIndex < 0) roomIndex = (ids.length-1);
	curRoom = ids[roomIndex];
	drawEditMap();

	document.getElementById("roomId").innerHTML = curRoom;
}

function duplicateRoom() {
	var copyRoomId = sortedRoomIdList()[roomIndex];
	var roomToCopy = room[ copyRoomId ];

	roomIndex = Object.keys( room ).length;
	var newRoomId = nextRoomId();

	console.log(newRoomId);
	var duplicateTilemap = [];
	for (y in roomToCopy.tilemap) {
		duplicateTilemap.push([]);
		for (x in roomToCopy.tilemap[y]) {
			duplicateTilemap[y].push( roomToCopy.tilemap[y][x] );
		}
	}

	room[newRoomId] = {
		id : newRoomId,
		tilemap : duplicateTilemap,
		walls : roomToCopy.walls.slice(0),
		exits : roomToCopy.exits.slice(0),
		pal : roomToCopy.pal
	};
	refreshGameData();

	curRoom = newRoomId;
	//console.log(curRoom);
	drawEditMap();

	document.getElementById("roomId").innerHTML = curRoom;

	// add new exit destination option to exits panel
	var select = document.getElementById("exitDestinationSelect");
	var option = document.createElement("option");
	option.text = "room " + newRoomId;
	option.value = newRoomId;
	select.add(option);
}

function newRoom() {
	roomIndex = Object.keys( room ).length;
	var roomId = nextRoomId();

	console.log(roomId);
	room[roomId] = {
		id : roomId,
		tilemap : [
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
				["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]
			],
		walls : [],
		exits : [],
		pal : null
	};
	refreshGameData();

	curRoom = roomId;
	//console.log(curRoom);
	drawEditMap();

	document.getElementById("roomId").innerHTML = curRoom;

	// add new exit destination option to exits panel
	var select = document.getElementById("exitDestinationSelect");
	var option = document.createElement("option");
	option.text = "room " + roomId;
	option.value = roomId;
	select.add(option);
}

function deleteRoom() {
	if ( Object.keys(room).length <= 1 ) {
		alert("You can't delete your only room!");
	}
	else if ( confirm("Are you sure you want to delete this room? You can't get it back.") ) {
		var roomId = sortedRoomIdList()[roomIndex];
		delete room[roomId];
		refreshGameData();
		nextRoom();
		drawEditMap();
		//recreate exit options
	}
}

function nextSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex + 1) % ids.length;
	if (spriteIndex === 0) spriteIndex = 1; //skip avatar
	drawingId = ids[spriteIndex];
	curDrawingFrameIndex = 0;
	reloadSprite();
	drawPaintNavThumbnailCanvas();
}

function prevSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex - 1) % ids.length;
	if (spriteIndex <= 0) spriteIndex = (ids.length-1); //loop and skip avatar
	drawingId = ids[spriteIndex];
	curDrawingFrameIndex = 0;
	reloadSprite();
	drawPaintNavThumbnailCanvas();
}

function next() {
	if (paintMode == TileType.Tile) {
		nextTile();
	}
	else {
		nextSprite();
	}
}

function prev() {
	if (paintMode == TileType.Tile) {
		prevTile();
	}
	else {
		prevSprite();
	}
}

function newDrawing() {
	if (paintMode == TileType.Tile) {
		newTile();
	}
	else {
		newSprite();
	}
}

function duplicateDrawing() {
	if (paintMode == TileType.Tile) {

		//copy drawing data
		var copiedFrameData = [];
		for (y in curDrawingData()) {
			copiedFrameData.push([]);
			for (x in curDrawingData()[y]) {
				copiedFrameData[y].push( curDrawingData()[y][x] );
			}
		}

		drawingId = nextTileId();

		console.log("DUPLICATE TILE");		
		console.log(drawingId);
		console.log(copiedFrameData);

		makeTile( drawingId, copiedFrameData );

		drawPaintCanvas();
		refreshGameData();

		tileIndex = Object.keys(tile).length - 1;

		reloadTile(); //hack for ui consistency
	}
	else {

		//copy drawing data
		var copiedFrameData = [];
		for (y in curDrawingData()) {
			copiedFrameData.push([]);
			for (x in curDrawingData()[y]) {
				copiedFrameData[y].push( curDrawingData()[y][x] );
			}
		}	

		drawingId = nextSpriteId();

		console.log("DUPLICATE SPRITE");	
		console.log(drawingId);
		console.log(copiedFrameData);

		makeSprite( drawingId, copiedFrameData );

		drawPaintCanvas();
		refreshGameData();

		spriteIndex = Object.keys(sprite).length - 1;

		reloadSprite(); //hack
	}
}

function deleteDrawing() {
	if ( confirm("Are you sure you want to delete this drawing?") ) {
		if (paintMode == TileType.Tile) {
			if ( Object.keys( tile ).length <= 1 ) { alert("You can't delete your last tile!"); return; }
			delete tile[ drawingId ];
			findAndReplaceTileInAllRooms( drawingId, "0" );
			refreshGameData();
			renderImages();
			drawEditMap();
			nextTile();
		}
		else {
			if ( Object.keys( sprite ).length <= 2 ) { alert("You can't delete your last sprite!"); return; }
			delete sprite[ drawingId ];
			refreshGameData();
			renderImages();
			drawEditMap();
			nextSprite();
		}
	}
}

function findAndReplaceTileInAllRooms( findTile, replaceTile ) {
	for (roomId in room) {
		for (y in room[roomId].tilemap) {
			for (x in room[roomId].tilemap[y]) {
				if (room[roomId].tilemap[y][x] === findTile) {
					room[roomId].tilemap[y][x] = replaceTile;
				}
			}
		}
	}
}

function updateAnimationUI() {
	//todo
}

function reloadTile() {
	// animation UI
	if ( tile[drawingId] && tile[drawingId].animation.isAnimated ) {
		isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;
		document.getElementById("animationOptionFrame1").checked = (curDrawingFrameIndex == 0);
		document.getElementById("animationOptionFrame2").checked = (curDrawingFrameIndex == 1);
		document.getElementById("animation").setAttribute("style","display:block;");
	}
	else {
		isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
	}

	// wall UI
	if (room[curRoom]) { //todo this per-room wall nonsense is confusing
		if (room[curRoom].walls.indexOf(drawingId) != -1) {
			document.getElementById("wallCheckbox").checked = true;
		}
		else {
			document.getElementById("wallCheckbox").checked = false;
		}
	}

	drawPaintCanvas();
}

function reloadSprite() {
	// animation UI
	if ( sprite[drawingId] && sprite[drawingId].animation.isAnimated ) {
		isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;
		document.getElementById("animationOptionFrame1").checked = (curDrawingFrameIndex == 0);
		document.getElementById("animationOptionFrame2").checked = (curDrawingFrameIndex == 1);
		document.getElementById("animation").setAttribute("style","display:block;");
	}
	else {
		isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
	}

	// dialog UI
	if (drawingId in dialog) {
		document.getElementById("dialogText").value = dialog[drawingId];
	}
	else {
		document.getElementById("dialogText").value = "";
	}

	// update paint canvas
	drawPaintCanvas();

}

function sortedTileIdList() {
	return Object.keys( tile ).sort().sort( function(a,b) { return parseInt(a,36) - parseInt(b,36); } );
}

function sortedSpriteIdList() {
	return Object.keys( sprite ).sort().sort( function(a,b) { return parseInt(a,36) - parseInt(b,36); } );
}

function sortedRoomIdList() {
	return Object.keys( room ).sort( function(a,b) { return parseInt(a,36) - parseInt(b,36); } );
}

var isDragAddingTiles = false;
var isDragDeletingTiles = false;
function map_onMouseDown(e) {
	var off = getOffset(e);
	var x = Math.floor( off.x / (tilesize*scale) );
	var y = Math.floor( off.y / (tilesize*scale) );
	console.log(x + " " + y);
	//var row = room[curRoom].tilemap[y];
	if (selectedExit != null && getExit(curRoom,x,y) == null) {
		//de-select exit
		setSelectedExit(null);
	}
	else if (areExitsVisible && getExit(curRoom,x,y) != null) {
		//select exit
		setSelectedExit( getExit(curRoom,x,y) );
	}
	else if (isAddingExit) {
		//add exit
		if ( getExit(curRoom,x,y) == null ) {
			addExitToCurRoom(x,y);
		}
	}
	else if (drawingId != null) {
		//add tiles/sprites to map
		console.log("DRAWING");
		if (paintMode == TileType.Tile) {
			if ( room[curRoom].tilemap[y][x] === "0" ) {
				console.log("ADD");
				//add
				//row = row.substr(0, x) + drawingId + row.substr(x+1);
				console.log( room[curRoom].tilemap );
				room[curRoom].tilemap[y][x] = drawingId;
				isDragAddingTiles = true;
			}
			else {
				//delete (better way to do this?)
				//row = row.substr(0, x) + "0" + row.substr(x+1);
				room[curRoom].tilemap[y][x] = "0";
				isDragDeletingTiles = true;
			}
			//room[curRoom].tilemap[y] = row;
		}
		else {
			var otherSprite = getSpriteAt(x,y);
			var isThisSpriteAlreadyHere = sprite[drawingId].room === curRoom &&
										sprite[drawingId].x === x &&
										sprite[drawingId].y === y;

			if (otherSprite) {
				//remove other sprite from map
				sprite[otherSprite].room = null;
				sprite[otherSprite].x = -1;
				sprite[otherSprite].y = -1;
			}

			if (!isThisSpriteAlreadyHere) {
				//add sprite to map
				sprite[drawingId].room = curRoom;
				sprite[drawingId].x = x;
				sprite[drawingId].y = y;
				//row = row.substr(0, x) + "0" + row.substr(x+1); //is this necessary? no
			}
			else {
				//remove sprite from map
				sprite[drawingId].room = null;
				sprite[drawingId].x = -1;
				sprite[drawingId].y = -1;
			}
		}
		refreshGameData();
		drawEditMap();
	}
}

function editTilesOnDrag(e) {
	var off = getOffset(e);
	var x = Math.floor(off.x / (tilesize*scale));
	var y = Math.floor(off.y / (tilesize*scale));
	// var row = room[curRoom].tilemap[y];
	if (isDragAddingTiles) {
		if ( room[curRoom].tilemap[y][x] != drawingId ) {
			// row = row.substr(0, x) + drawingId + row.substr(x+1);
			// room[curRoom].tilemap[y] = row;
			room[curRoom].tilemap[y][x] = drawingId;
			refreshGameData();
			drawEditMap();
		}
	}
	else if (isDragDeletingTiles) {
		if ( room[curRoom].tilemap[y][x] != "0" ) {
			// row = row.substr(0, x) + "0" + row.substr(x+1);
			// room[curRoom].tilemap[y] = row;
			room[curRoom].tilemap[y][x] = "0";
			refreshGameData();
			drawEditMap();
		}
	}
}

function map_onMouseMove(e) {
	editTilesOnDrag(e);
}

function map_onMouseUp(e) {
	editTilesOnDrag(e);
	isDragAddingTiles = false;
	isDragDeletingTiles = false;
}

function paint_onMouseDown(e) {
	var off = getOffset(e);
	var x = Math.floor(off.x / paint_scale);
	var y = Math.floor(off.y / paint_scale);
	if (curDrawingData()[y][x] == 0) {
		curPaintBrush = 1;
	}
	else {
		curPaintBrush = 0;
	}
	curDrawingData()[y][x] = curPaintBrush;
	drawPaintCanvas();
	isPainting = true;
}

function paint_onMouseMove(e) {
	if (isPainting) {	
		var off = getOffset(e);
		var x = Math.floor(off.x / paint_scale);
		var y = Math.floor(off.y / paint_scale);
		curDrawingData()[y][x] = curPaintBrush;
		drawPaintCanvas();
	}
}

function paint_onMouseUp(e) {
	isPainting = false;
	renderImages();
	refreshGameData();
	drawEditMap();
}

function drawPaintCanvas() {
	//background
	paint_ctx.fillStyle = "rgb("+palette[drawingPal][0][0]+","+palette[drawingPal][0][1]+","+palette[drawingPal][0][2]+")";
	paint_ctx.fillRect(0,0,canvas.width,canvas.height);

	//pixel color
	if (paintMode == TileType.Tile) {
		paint_ctx.fillStyle = "rgb("+palette[drawingPal][1][0]+","+palette[drawingPal][1][1]+","+palette[drawingPal][1][2]+")";
	}
	else if (paintMode == TileType.Sprite || paintMode == TileType.Avatar) {
		paint_ctx.fillStyle = "rgb("+palette[drawingPal][2][0]+","+palette[drawingPal][2][1]+","+palette[drawingPal][2][2]+")";
	}

	//draw pixels
	for (var x = 0; x < 8; x++) {
		for (var y = 0; y < 8; y++) {
			// draw alternate frame
			if (isCurDrawingAnimated && curDrawingAltFrameData()[y][x] === 1) {
				paint_ctx.globalAlpha = 0.3;
				paint_ctx.fillRect(x*paint_scale,y*paint_scale,1*paint_scale,1*paint_scale);
				paint_ctx.globalAlpha = 1;
			}
			// draw current frame
			if (curDrawingData()[y][x] === 1) {
				paint_ctx.fillRect(x*paint_scale,y*paint_scale,1*paint_scale,1*paint_scale);
			}
		}
	}

	//draw grid
	if (drawPaintGrid) {
		paint_ctx.fillStyle = "#fff";
		for (var x = 1; x < tilesize; x++) {
			paint_ctx.fillRect(x*paint_scale,0*paint_scale,1,tilesize*paint_scale);
		}
		for (var y = 1; y < tilesize; y++) {
			paint_ctx.fillRect(0*paint_scale,y*paint_scale,tilesize*paint_scale,1);
		}
	}
}

function drawEditMap() {	
	//clear screen
	ctx.fillStyle = "rgb("+palette[curPal()][0][0]+","+palette[curPal()][0][1]+","+palette[curPal()][0][2]+")";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	//draw map
	drawRoom( room[curRoom] );

	//draw grid
	if (drawMapGrid) {
		ctx.fillStyle = "#fff";
		for (var x = 1; x < mapsize; x++) {
			ctx.fillRect(x*tilesize*scale,0*tilesize*scale,1,mapsize*tilesize*scale);
		}
		for (var y = 1; y < mapsize; y++) {
			ctx.fillRect(0*tilesize*scale,y*tilesize*scale,mapsize*tilesize*scale,1);
		}
	}

	//draw exits
	if (areExitsVisible) {
		for (i in room[curRoom].exits) {
			var e = room[curRoom].exits[i];
			if (e == selectedExit) {
				ctx.fillStyle = "#ff0";
				ctx.globalAlpha = 0.9;
			}
			else {
				ctx.fillStyle = "#fff";
				ctx.globalAlpha = 0.5;
			}
			ctx.fillRect(e.x * tilesize * scale, e.y * tilesize * scale, tilesize * scale, tilesize * scale);
			ctx.strokeStyle = "#000";
			ctx.globalAlpha = 1.0;
			ctx.strokeRect( (e.x * tilesize * scale) - 1, (e.y * tilesize * scale) - 1, (tilesize * scale) + 2, (tilesize * scale) + 2 );

			ctx.font = '14px sans-serif';
			ctx.fillText( "To room " + e.dest.room, (e.x * tilesize * scale) - 1, (e.y * tilesize * scale) - 5 );

			//todo (tilesize*scale) should be a function
		}
		ctx.globalAlpha = 1;
	}
}

function curDrawingData() {
	var imgId = (paintMode == TileType.Tile ? "TIL_" : "SPR_") + drawingId;
	var frameIndex = (isCurDrawingAnimated ? curDrawingFrameIndex : 0);
	return imageStore.source[ imgId ][ frameIndex ];
}

// todo: assumes 2 frames
function curDrawingAltFrameData() {
	var imgId = (paintMode == TileType.Tile ? "TIL_" : "SPR_") + drawingId;
	var frameIndex = (curDrawingFrameIndex === 0 ? 1 : 0);
	return imageStore.source[ imgId ][ frameIndex ];
}

function makeTile(id,firstFrame) {
	var drwId = "TIL_" + id;
	tile[id] = {
		drw : drwId,
		col : 1,
		animation : { //todo
			isAnimated : false,
			frameIndex : 0,
			frameCount : 2
		}
	};
	makeDrawing(drwId,firstFrame);
}

function makeSprite(id,firstFrame) {
	var drwId = "SPR_" + id;
	sprite[id] = { //todo create default sprite creation method
		drw : drwId,
		col : 2,
		room : null,
		x : -1,
		y : -1,
		animation : { //todo
			isAnimated : false,
			frameIndex : 0,
			frameCount : 2
		}
	};
	makeDrawing(drwId,firstFrame);
}

function makeDrawing(id,firstFrame) {
	imageStore.source[id] = [];
	if (!firstFrame) { //use default blank frame
		firstFrame = [
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0]
		]
	}
	imageStore.source[id].push(firstFrame);
	renderImages(); //todo is this the right place for this?
}

function newGameDialog() {
	if ( confirm("Starting a new game will erase your old data. Consider exporting your work first! Are you sure you want to start over?") ) {
		resetGameData();
	}
}

function resetGameData() {
	setDefaultGameState();

	// todo wrap these variable resets in a function
	tileIndex = 0;
	spriteIndex = 0;

	refreshGameData();
	renderImages();
	drawPaintCanvas();
	drawEditMap();
	updatePaletteControlsFromGameData();

	on_paint_avatar();
	document.getElementById('paintOptionAvatar').checked = true;
}

function refreshGameData() {
	flags.ROOM_FORMAT = 1; // always save out comma separated format, even if the old format is read in
	var gameData = serializeWorld();
	//console.log("refresh!");
	//console.log(gameData);
	document.getElementById("game_data").value = gameData;
	localStorage.setItem("game_data", gameData); //auto-save
}

function on_edit_mode() {
	stopGame();
	parseWorld(document.getElementById("game_data").value); //reparse world to account for any changes during gameplay
	curRoom = sortedRoomIdList()[roomIndex]; //restore current room to pre-play state
	drawEditMap();
	listenMapEditEvents();
	isPlayMode = false;
}

function on_play_mode() {
	unlistenMapEditEvents();
	load_game(document.getElementById("game_data").value);
	isPlayMode = true;
}

function toggleGrid() {
	drawPaintGrid = !drawPaintGrid;
	drawPaintCanvas();
}

function toggleMapGrid() {
	drawMapGrid = !drawMapGrid;
	drawEditMap();
}

function on_change_title() {
	title = document.getElementById("titleText").value;
	refreshGameData();
}

function updatePaletteBorders() {
	console.log("UPDATE PALETTE BORDERS");
	//feature to show selected colors in browsers that don't support a color picker
	document.getElementById("backgroundColor").style.border = "solid " + document.getElementById("backgroundColor").value + " 5px";
	document.getElementById("tileColor").style.border = "solid " + document.getElementById("tileColor").value + " 5px";
	document.getElementById("spriteColor").style.border = "solid " + document.getElementById("spriteColor").value + " 5px";
}

function on_change_color_bg() {
	var rgb = hexToRgb( document.getElementById("backgroundColor").value );
	palette[drawingPal][0][0] = rgb.r;
	palette[drawingPal][0][1] = rgb.g;
	palette[drawingPal][0][2] = rgb.b;
	refreshGameData();
	renderImages();
	drawPaintCanvas();
	drawEditMap();

	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
	}
}

function on_change_color_tile() {
	var rgb = hexToRgb( document.getElementById("tileColor").value );
	palette[drawingPal][1][0] = rgb.r;
	palette[drawingPal][1][1] = rgb.g;
	palette[drawingPal][1][2] = rgb.b;
	refreshGameData();
	renderImages();
	drawPaintCanvas();
	drawEditMap();

	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
	}
}

function on_change_color_sprite() {
	var rgb = hexToRgb( document.getElementById("spriteColor").value );
	palette[drawingPal][2][0] = rgb.r;
	palette[drawingPal][2][1] = rgb.g;
	palette[drawingPal][2][2] = rgb.b;
	refreshGameData();
	renderImages();
	drawPaintCanvas();
	drawEditMap();

	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
	}
}

//hex-to-rgb method borrowed from stack overflow
function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function on_paint_avatar() {
	paintMode = TileType.Avatar;
	drawingId = "A";
	reloadSprite();
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:none;");
	document.getElementById("paintCommands").setAttribute("style","display:none;");
	document.getElementById("isAnimated").setAttribute("style","display:block;");
	//document.getElementById("animation").setAttribute("style","display:none;");
}
function on_paint_tile() {
	paintMode = TileType.Tile;
	tileIndex = 0;
	drawingId = sortedTileIdList()[tileIndex];
	reloadTile();
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:block;");
	document.getElementById("paintNav").setAttribute("style","display:block;");
	document.getElementById("paintCommands").setAttribute("style","display:block;");
	document.getElementById("isAnimated").setAttribute("style","display:block;");
	//document.getElementById("animation").setAttribute("style","display:block;");
}
function on_paint_sprite() {
	paintMode = TileType.Sprite;
	if (sortedSpriteIdList().length > 1)
	{
		spriteIndex = 1;
	}
	else {
		spriteIndex = 0; //fall back to avatar if no other sprites exist
	}
	drawingId = sortedSpriteIdList()[spriteIndex];
	curDrawingFrameIndex = 0;
	reloadSprite();
	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:block;");
	document.getElementById("paintCommands").setAttribute("style","display:block;");
	document.getElementById("isAnimated").setAttribute("style","display:block;");
	//document.getElementById("animation").setAttribute("style","display:block;");
}

function on_change_dialog() {
	dialog[drawingId] = document.getElementById("dialogText").value;
	refreshGameData();
}

function on_game_data_change() {
	on_game_data_change_core();
	refreshGameData();
}

function on_game_data_change_core() {
	clearGameData();
	parseWorld(document.getElementById("game_data").value); //reparse world if user directly manipulates game data

	var curPaintMode = paintMode; //save current paint mode (hacky)

	//fallback if there are no tiles, sprites, map
	if (Object.keys(sprite).length == 0) {
		paintMode = TileType.Avatar;
		drawingId = "A";
		makeSprite(drawingId);
		sprite["A"].room = null;
		sprite["A"].x = -1;
		sprite["A"].y = -1;
	}
	if (Object.keys(tile).length == 0) {
		paintMode = TileType.Tile;
		drawingId = "a";
		makeTile(drawingId);
	}
	if (Object.keys(room).length == 0) {
		room["0"] = {
			id : "0",
			tilemap : [
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000",
					"0000000000000000"
				],
			walls : [],
			exits : [],
			pal : null
		};
	}

	renderImages();

	drawEditMap();

	paintMode = curPaintMode;
	if ( paintMode == TileType.Tile ) {
		drawingId = sortedTileIdList()[0];
		reloadTile();
	}
	else {
		drawingId = sortedSpriteIdList()[0];
		reloadSprite();
	}

	updatePaletteControlsFromGameData();
	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
	}

	updateExitOptionsFromGameData();

	document.getElementById("titleText").value = title;
}

function updateExitOptionsFromGameData() {
	var select = document.getElementById("exitDestinationSelect");

	// first, remove all current options
	var i;
	for(i = select.options.length - 1 ; i >= 0 ; i--) {
		select.remove(i);
	}

	// then, add an option for each room
	for (roomId in room) {
		var option = document.createElement("option");
		option.text = "room " + roomId;
		option.value = roomId;
		select.add(option);
	}

}

function updatePaletteControlsFromGameData() {
	document.getElementById("backgroundColor").value = rgbToHex(palette["0"][0][0], palette["0"][0][1], palette["0"][0][2]);
	document.getElementById("tileColor").value = rgbToHex(palette["0"][1][0], palette["0"][1][1], palette["0"][1][2]);
	document.getElementById("spriteColor").value = rgbToHex(palette["0"][2][0], palette["0"][2][1], palette["0"][2][2]);
}

function on_toggle_wall() {
	if ( document.getElementById("wallCheckbox").checked ){
		//add to wall list
		room[curRoom].walls.push( drawingId );
	}
	else if ( room[curRoom].walls.indexOf(drawingId) != -1 ){
		//remove from wall list
		room[curRoom].walls.splice( room[curRoom].walls.indexOf(drawingId), 1 );
	}
	console.log(room[curRoom]);
	refreshGameData();
}

function apply_wall_setting_all_rooms() {
	if ( document.getElementById("wallCheckbox").checked ){
		//add to wall list
		for (id in room)
			if (room[id].walls.indexOf(drawingId) == -1) room[id].walls.push( drawingId );
	}
	else {
		//remove from wall list
		for (id in room) {
			if (room[id].walls.indexOf(drawingId) != -1) {
				room[id].walls.splice( room[id].walls.indexOf(drawingId), 1 );
			}
		}
	}
	refreshGameData();
}

var engineScript;
function loadEngineScript() {
	var client = new XMLHttpRequest();
	client.open('GET', './bitsy.js');
	client.onreadystatechange = function() {
	  engineScript = client.responseText;
	}
	client.send();
}
var webExportTemplate = "<!DOCTYPE HTML>\n<html>\n<head>\n<title>@@T</title>\n<style>\nhtml {height:592px;}\nbody {width:100%; height:100%; overflow:hidden;}\n#game {background:black;margin: 0 auto;margin-top: 40px;display: block;}\n</style>\n<script>\n@@E\n<\/script>\n</head>\n<body onload='startExportedGame()'>\n<canvas id='game'>\n</canvas>\n</body>\n</html>";
	
function exportGame() {
	refreshGameData(); //just in case
	var gameData = document.getElementById("game_data").value; //grab game data
	gameData = escapeSpecialCharacters( gameData ); //escape quotes and slashes
	gameData = gameData.split("\n").join("\\n"); //replace newlines with escaped newlines
	var html = webExportTemplate.substr(); //copy template
	console.log(html);
	var titleIndex = html.indexOf("@@T");
	html = html.substr(0,titleIndex) + title + html.substr(titleIndex+3);
	console.log(html);
	var engineIndex = html.indexOf("@@E");
	html = html.substr(0,engineIndex) + engineScript + html.substr(engineIndex+3);
	console.log(html);
	var gameDataIndex = html.indexOf("@@D");
	html = html.substr(0,gameDataIndex) + gameData + html.substr(gameDataIndex+3);
	console.log(html);
	downloadFile("mygame.html",html);
}

function escapeSpecialCharacters(str) {
	str = str.replace(/\\/g, '\\\\');
	str = str.replace(/"/g, '\\"');
	return str;
}

function unescapeSpecialCharacters(str) {
	str = str.replace(/\\"/g, '"');
	str = str.replace(/\\\\/g, '\\');
	return str;
}

function downloadFile(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.setAttribute('target', '_blank');

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function hideAbout() {
	document.getElementById("aboutPanel").setAttribute("style","display:none;");
}

function toggleInstructions() {
	var div = document.getElementById("instructions");
	if (div.style.display === "none") {
		div.style.display = "block";
	}
	else {
		div.style.display = "none";
	}
}

//todo abstract this function into toggleDiv
function toggleVersionNotes() {
	var div = document.getElementById("versionNotes");
	if (div.style.display === "none") {
		div.style.display = "block";
	}
	else {
		div.style.display = "none";
	}
}

/* EXITS */
var isAddingExit = false;
var areExitsVisible = true;
var selectedExit = null;
var exit_canvas;
var exit_ctx;
var selectedExitRoom = "0";

function resetExitVars() {
	isAddingExit = false;
	setSelectedExit(null);
}

function showExits() {
	resetExitVars();
	areExitsVisible = true;
	drawEditMap();
	drawExitDestinationRoom();
}

function hideExits() {
	resetExitVars();
	areExitsVisible = false;
	drawEditMap();
	drawExitDestinationRoom();
}

function addExit() { //todo rename something less vague
	isAddingExit = true;
	setSelectedExit(null);
	document.getElementById("addExitButton").style.display = "none";
	document.getElementById("addingExitHelpText").style.display = "block";
}

function addExitToCurRoom(x,y) {
	isAddingExit = false;
	document.getElementById("addExitButton").style.display = "block";
	document.getElementById("addingExitHelpText").style.display = "none";
	var newExit = {
		x : x,
		y : y,
		dest : { //starts with invalid destination
			room : "0",
			x : -1,
			y : -1
		}
	}
	room[curRoom].exits.push( newExit );
	refreshGameData();
	setSelectedExit(newExit);
}

function setSelectedExit(e) {
	selectedExit = e;

	if (selectedExit == null) {
		document.getElementById("noExitSelected").style.display = "block";
		document.getElementById("exitSelected").style.display = "none";
	}
	else {
		document.getElementById("noExitSelected").style.display = "none";
		document.getElementById("exitSelected").style.display = "block";

		selectedExitRoom = selectedExit.dest.room;
		var destOptions = document.getElementById("exitDestinationSelect").options;
		for (i in destOptions) {
			var o = destOptions[i];
			if (o.value === selectedExitRoom) {
				o.selected = true;
			}
		}

		drawExitDestinationRoom();
	}

	drawEditMap();
}

function deleteSelectedExit() {
	room[curRoom].exits.splice( room[curRoom].exits.indexOf( selectedExit ), 1 );
	refreshGameData();
	setSelectedExit(null);
}

function exitDestinationRoomChange(event) {
	var roomId = event.target.value;
	//selectedExit.dest.room = roomId;
	selectedExitRoom = roomId;
	drawExitDestinationRoom();
}

function drawExitDestinationRoom() {
	//clear screen
	exit_ctx.fillStyle = "rgb("+palette[curPal()][0][0]+","+palette[curPal()][0][1]+","+palette[curPal()][0][2]+")";
	exit_ctx.fillRect(0,0,canvas.width,canvas.height);

	//draw map
	drawRoom( room[selectedExitRoom], exit_ctx );

	//draw grid
	exit_ctx.fillStyle = "#fff";
	for (var x = 1; x < mapsize; x++) {
		exit_ctx.fillRect(x*tilesize*scale,0*tilesize*scale,1,mapsize*tilesize*scale);
	}
	for (var y = 1; y < mapsize; y++) {
		exit_ctx.fillRect(0*tilesize*scale,y*tilesize*scale,mapsize*tilesize*scale,1);
	}

	//draw exit destination
	if ( isExitValid(selectedExit) && selectedExit.dest.room === selectedExitRoom ) {
		exit_ctx.fillStyle = "#ff0";
		exit_ctx.globalAlpha = 0.9;
		exit_ctx.fillRect(selectedExit.dest.x * tilesize * scale, selectedExit.dest.y * tilesize * scale, tilesize * scale, tilesize * scale);
		exit_ctx.globalAlpha = 1;
	}
}

function paint_nav_onMouseDown(e) {
	var off = getOffset(e);
	var x = Math.floor(off.x / (tilesize*scale));
	console.log("MOUSE THUMBNAIL");
	console.log(x);
	if ( paintMode === TileType.Tile ) {
		var tileList = sortedTileIdList();
		var tileIndex = tileList.indexOf( drawingId );
		tileIndex += (x-3);
		console.log(tileIndex);
		if (tileIndex >= 0 && tileIndex < tileList.length) {
			drawingId = tileList[tileIndex];
			curDrawingFrameIndex = 0;
			reloadTile();
			drawPaintNavThumbnailCanvas();
		}
	}
	else if ( paintMode === TileType.Sprite ) {
		var spriteList = sortedSpriteIdList();
		var spriteIndex = spriteList.indexOf( drawingId );
		spriteIndex += (x-3);
		if (spriteIndex >= 0 && spriteIndex < spriteList.length) {
			drawingId = spriteList[spriteIndex];
			curDrawingFrameIndex = 0;
			reloadSprite();
			drawPaintNavThumbnailCanvas();
		}
	}
}

var exit_scale = 16;
function exit_onMouseDown(e) {
	var off = getOffset(e);
	var x = Math.floor(off.x / exit_scale);
	var y = Math.floor(off.y / exit_scale);
	selectedExit.dest.room = selectedExitRoom;
	selectedExit.dest.x = x;
	selectedExit.dest.y = y;

	refreshGameData();

	drawExitDestinationRoom();
}

function showExitsPanel() {
	document.getElementById("exitsPanel").style.display = "block";
	document.getElementById("exitsCheck").checked = true;
	showExits();
}

function hidePanel(id) {
	//update panel
	document.getElementById(id).style.display = "none";
	//update checkbox
	if (id != "toolsPanel")
		document.getElementById(id.replace("Panel","Check")).checked = false;
	//hide exits
	if (id === "exitsPanel") hideExits();
	//save panel preferences
	savePanelPref(id,false);
}

function togglePanel(e) {
	//hide/show panel
	togglePanelCore(event.target.value, event.target.checked);
	//save panel preferences
	savePanelPref(event.target.value,event.target.checked);
}

function togglePanelCore(id,checked) {
	if (checked) {
		document.getElementById(id).style.display = "block";
		if (id === "exitsPanel") showExits();
	}
	else {
		document.getElementById(id).style.display = "none";
		if (id === "exitsPanel") hideExits();
	}
}

function savePanelPref(id,visible) {
	console.log(" -- save panel pref -- ");
	var prefs = localStorage.panel_prefs == null ? {} : JSON.parse( localStorage.panel_prefs );
	console.log(prefs);
	prefs[id] = visible;
	console.log(prefs);
	localStorage.setItem( "panel_prefs", JSON.stringify(prefs) );
}

function showToolsPanel() {
	document.getElementById("toolsPanel").style.display = "block";
	savePanelPref("toolsPanel",true);
}

function startRecordingGif() {
	gifFrameData = [];
	if (isPlayMode)
		gifFrameData.push( ctx.getImageData(0,0,512,512).data );
	isRecordingGif = true;
	document.getElementById("gifStartButton").style.display="none";
	document.getElementById("gifStopButton").style.display="inline";
	document.getElementById("gifRecordingText").style.display="inline";
}

function stopRecordingGif() {
	document.getElementById("gifStopButton").style.display="none";
	document.getElementById("gifRecordingText").style.display="none";
	document.getElementById("gifEncodingText").style.display="inline";

	setTimeout( function() {
		var hexPalette = [];
		for (id in palette) {
			for (i in palette[id]){
				var hexStr = rgbToHex( palette[id][i][0], palette[id][i][1], palette[id][i][2] ).slice(1);
				hexPalette.push( hexStr );
			}
		}
		//console.log(hexPalette);
		//console.log(gifFrameData);
		var gif = {
			frames: gifFrameData,
			width: 512,
			height: 512,
			palette: hexPalette,
			loops: 0,
			delay: 30
		};
		gifencoder.encode( gif, function(uri) {
			document.getElementById("gifEncodingText").style.display="none";
			document.getElementById("gifStartButton").style.display="inline";
			//console.log("encoding finished!");
			//console.log(uri);
			document.getElementById("gifPreview").src = uri;
			document.getElementById("gifDownload").href = uri;
		});
		isRecordingGif = false;
	}, 10);
}

/* LOAD FROM FILE */
function importGameFromFile(e) {
	// load file chosen by user
	var files = e.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.readAsText( file );

	reader.onloadend = function() {
		var fileText = reader.result;

		// find start of game data
		var i = fileText.indexOf("var exportedGameData");
		while ( fileText.charAt(i) != '"' ) {
			i++; // move to first quote
		}
		i++; // move past first quote

		// isolate game data
		var gameDataStr = "";
		var isEscapeChar = false;
		while ( fileText.charAt(i) != '"' || isEscapeChar ) {
			gameDataStr += fileText.charAt(i);
			isEscapeChar = fileText.charAt(i) == "\\";
			i++;
		}

		// replace special characters
		gameDataStr = gameDataStr.replace(/\\n/g, "\n"); //todo: move this into the method below
		gameDataStr = unescapeSpecialCharacters( gameDataStr );
		
		// change game data & reload everything
		document.getElementById("game_data").value = gameDataStr;
		on_game_data_change();
	}
}

/* ANIMATION EDITING*/
function on_toggle_animated() {
	if ( document.getElementById("animatedCheckbox").checked ) {
		if ( paintMode === TileType.Sprite || paintMode === TileType.Avatar ) {
			addSpriteAnimation();
		}
		else if ( paintMode === TileType.Tile ) {
			addTileAnimation();
		}
		document.getElementById("animation").setAttribute("style","display:block;");
	}
	else {
		if ( paintMode === TileType.Sprite || paintMode === TileType.Avatar ) {
			removeSpriteAnimation();
		}
		else if ( paintMode === TileType.Tile ) {
			removeTileAnimation();			
		}
		document.getElementById("animation").setAttribute("style","display:none;");
	}
}

function addSpriteAnimation() {
	//set editor mode
	isCurDrawingAnimated = true;
	curDrawingFrameIndex = 0;

	//mark sprite as animated
	sprite[drawingId].animation.isAnimated = true;

	//add blank frame to sprite
	var spriteImageId = "SPR_" + drawingId;
	addNewFrameToDrawing( spriteImageId );

	//refresh data model
	renderImages();
	refreshGameData();
	reloadSprite();
}

function removeSpriteAnimation() {
	//set editor mode
	isCurDrawingAnimated = false;

	//mark sprite as non-animated
	sprite[drawingId].animation.isAnimated = false;

	//remove all but the first frame of the sprite
	var spriteImageId = "SPR_" + drawingId;
	removeDrawingAnimation( spriteImageId );

	//refresh data model
	renderImages();
	refreshGameData();
	reloadSprite();
}

function addTileAnimation() {
	//set editor mode
	isCurDrawingAnimated = true;
	curDrawingFrameIndex = 0;

	//mark tile as animated
	tile[drawingId].animation.isAnimated = true;

	//add blank frame to tile
	var tileImageId = "TIL_" + drawingId;
	addNewFrameToDrawing( tileImageId );

	//refresh data model
	renderImages();
	refreshGameData();
	reloadTile();
}

function removeTileAnimation() {
	//set editor mode
	isCurDrawingAnimated = false;

	//mark tile as non-animated
	tile[drawingId].animation.isAnimated = false;

	//remove all but the first frame of the tile
	var tileImageId = "TIL_" + drawingId;
	removeDrawingAnimation( tileImageId );

	//refresh data model
	renderImages();
	refreshGameData();
	reloadTile();
}

function addNewFrameToDrawing(drwId) {
	var newFrame = [
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0]
	];
	imageStore.source[ drwId ].push( newFrame );
}

function removeDrawingAnimation(drwId) {
	var oldImageData = imageStore.source[ drwId ].slice(0);
	imageStore.source[ drwId ] = [ oldImageData[0] ];
}

function on_paint_frame1() {
	curDrawingFrameIndex = 0;
	if ( paintMode === TileType.Tile) {
		reloadTile();
	}
	else {
		reloadSprite();
	}
}

function on_paint_frame2() {
	curDrawingFrameIndex = 1;
	if ( paintMode === TileType.Tile) {
		reloadTile();
	}
	else {
		reloadSprite();
	}
}