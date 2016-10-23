/* 
TODO NEXT
X test quote bug on other browsers and OSs
- fix tile/sprite # limit bug
	X for now: don't allow over 26 (past z)
	- later: comma-separated tile names (with more than one char)
	- use hex count to generate names in editor
- debug info (os, browser) in comment in file
- warning message to browsers that don't support all features
X fix safari automcplete bug
- improve color input for browsers that only accept text
	- hash or no-hash hex
	- rgb with commas
	- show color somehow (border of input e.g. style="border:#f00 solid 5px;")
	- link to html color-picker if you don't support color
- add instructions for downloading game text for browser that don't support download
- add instruction on publishing the game (itchio shoutout)
X make game data field work like expected (clear old data)

TODO BACKLOG
- import old html or txt games to re-edit
- export straight to itchio (is there a developer api?)


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

var paintMode = TileType.Avatar;
var drawingId = "A";
var drawingPal = "0";
var drawing_data = [
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0]
];
var drawPaintGrid = true;
var curPaintBrush = 0;
var isPainting = false;

var nextTileCharCode = 97;
var tileIndex = 0;
var nextSpriteCharCode = 97;
var spriteIndex = 0;

/* MAP */
var drawMapGrid = true;

var browserFeatures = {
	colorPicker : false,
	fileDownload : false
};

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


	//default values
	title = "Write title here";
	palette[drawingPal] = [
		[0,82,204],
		[128,159,255],
		[255,255,255]
	];
	//default avatar
	paintMode = TileType.Avatar;
	on_paint_avatar();
	drawing_data = [
		[0,0,0,1,1,0,0,0],
		[0,0,0,1,1,0,0,0],
		[0,0,0,1,1,0,0,0],
		[0,0,1,1,1,1,0,0],
		[0,1,1,1,1,1,1,0],
		[1,0,1,1,1,1,0,1],
		[0,0,1,0,0,1,0,0],
		[0,0,1,0,0,1,0,0]
	];
	saveDrawingData();
	sprite["A"].set = "0";
	sprite["A"].x = 4;
	sprite["A"].y = 4;
	//defualt sprite
	paintMode = TileType.Sprite;
	newSprite();
	on_paint_sprite();
	drawing_data = [
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,1,0,1,0,0,0,1],
		[0,1,1,1,0,0,0,1],
		[0,1,1,1,0,0,1,0],
		[0,1,1,1,1,1,0,0],
		[0,0,1,1,1,1,0,0],
		[0,0,1,0,0,1,0,0]
	];
	saveDrawingData();
	sprite["a"].set = "0";
	sprite["a"].x = 8;
	sprite["a"].y = 12;
	dialog["a"] = "I'm a cat";
	//default tile
	paintMode = TileType.Tile;
	newTile();
	on_paint_tile();
	drawing_data = [
		[1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,1,1,0,0,1],
		[1,0,0,1,1,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1]
	];
	saveDrawingData();
	renderImages();
	//default set
	set["0"] = {
		id : "0",
		tilemap : [
				"0000000000000000",
				"0aaaaaaaaaaaaaa0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0a000000000000a0",
				"0aaaaaaaaaaaaaa0",
				"0000000000000000"
			],
		walls : [],
		exits : [],
		pal : null
	};
	refreshGameData();

	//draw everything
	on_paint_avatar();
	drawPaintCanvas();
	drawEditMap();

	//load engine for export
	loadEngineScript();

	//unsupported feature stuff
	detectBrowserFeatures();
	if (hasUnsupportedFeatures()) showUnsupportedFeatureWarning();
	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
		document.getElementById("colorPickerHelp").style.display = "inline";
	}
	if (!browserFeatures.fileDownload) {
		document.getElementById("downloadHelp").style.display = "block";
	}
}

function listenMapEditEvents() {
	canvas.addEventListener("mousedown", map_onMouseDown);
}

function unlistenMapEditEvents() {
	canvas.removeEventListener("mousedown", map_onMouseDown);
}

function newTile() {
	if (nextTileCharCode > 97+25) {
		alert("Sorry, you've run out of space for tiles! :( \n(I'm working on a way to store more. - Adam)");
		return;
	}

	drawingId = String.fromCharCode( nextTileCharCode );
	nextTileCharCode++;

	drawing_data = [
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0]
	];

	drawPaintCanvas();
	saveDrawingData();
	refreshGameData();

	tileIndex = Object.keys(tile).length - 1;

	reloadTile(); //hack for ui consistency
}

function nextTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex + 1) % ids.length;
	drawingId = ids[tileIndex];
	reloadTile();
}

function prevTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex - 1) % ids.length;
	if (tileIndex < 0) tileIndex = (ids.length-1);
	drawingId = ids[tileIndex];
	reloadTile();
}

function newSprite() {
	if (nextSpriteCharCode > 97+25) {
		alert("Sorry, you've run out of space for sprites! :( \n(I'm working on a way to store more. - Adam)");
		return;
	}

	drawingId = String.fromCharCode( nextSpriteCharCode );
	nextSpriteCharCode++;

	drawing_data = [
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0]
	];

	drawPaintCanvas();
	saveDrawingData();
	refreshGameData();

	spriteIndex = Object.keys(sprite).length - 1;

	reloadSprite(); //hack
}

function nextSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex + 1) % ids.length;
	drawingId = ids[spriteIndex];
	reloadSprite();
}

function prevSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex - 1) % ids.length;
	if (spriteIndex < 0) spriteIndex = (ids.length-1);
	drawingId = ids[spriteIndex];
	reloadSprite();
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

function reloadTile() {
	var drw = "TIL_" + drawingId;
	for (y in imageStore.source[drw]) {
		for (var x = 0; x < 8; x++) {
			var pixel = parseInt( imageStore.source[drw][y].charAt(x) );
			drawing_data[y][x] = pixel;
		}
	}
	drawPaintCanvas();

	if (set[curSet]) {	
		if (set[curSet].walls.indexOf(drawingId) != -1) {
			document.getElementById("wallCheckbox").checked = true;
		}
		else {
			document.getElementById("wallCheckbox").checked = false;
		}
	}
}

function reloadSprite() {
	var drw = "SPR_" + drawingId;
	for (y in imageStore.source[drw]) {
		for (var x = 0; x < 8; x++) {
			var pixel = parseInt( imageStore.source[drw][y].charAt(x) );
			drawing_data[y][x] = pixel;
		}
	}
	drawPaintCanvas();

	if (drawingId in dialog) {
		document.getElementById("dialogText").value = dialog[drawingId];
	}
	else {
		document.getElementById("dialogText").value = "";
	}
}

function sortedTileIdList() {
	return Object.keys( tile ).sort();
}

function sortedSpriteIdList() {
	return Object.keys( sprite ).sort();
}

function map_onMouseDown(e) {
	var off = getOffset(e);
	var x = Math.floor(off.x / (tilesize*scale));
	var y = Math.floor(off.y / (tilesize*scale));
	console.log(x + " " + y);
	var row = set[curSet].tilemap[y];
	if (drawingId != null) {
		if (paintMode == TileType.Tile) {
			if ( row.charAt(x) === "0" ) {
				//add
				row = row.substr(0, x) + drawingId + row.substr(x+1);
			}
			else {
				//delete (better way to do this?)
				row = row.substr(0, x) + "0" + row.substr(x+1);
			}
			set[curSet].tilemap[y] = row;
		}
		else {
			sprite[drawingId].set = curSet;
			sprite[drawingId].x = x;
			sprite[drawingId].y = y;
			row = row.substr(0, x) + "0" + row.substr(x+1);
		}
		refreshGameData();
		drawEditMap();
	}
}

function paint_onMouseDown(e) {
	var off = getOffset(e);
	var x = Math.floor(off.x / paint_scale);
	var y = Math.floor(off.y / paint_scale);
	if (drawing_data[y][x] == 0) {
		curPaintBrush = 1;
	}
	else {
		curPaintBrush = 0;
	}
	drawing_data[y][x] = curPaintBrush;
	drawPaintCanvas();
	isPainting = true;
}

function paint_onMouseMove(e) {
	if (isPainting) {	
		var off = getOffset(e);
		var x = Math.floor(off.x / paint_scale);
		var y = Math.floor(off.y / paint_scale);
		drawing_data[y][x] = curPaintBrush;
		drawPaintCanvas();
	}
}

function paint_onMouseUp(e) {
	isPainting = false;
	saveDrawingData();
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
			if (drawing_data[y][x] == 1) {
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
	drawSet(set[curSet]);

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
}

function saveDrawingData() {
	if (paintMode == TileType.Tile) {
		//create tile if it doesn't exist
		var drw = "TIL_" + drawingId;
		if (!(drawingId in tile)) {
			tile[drawingId] = {
				drw : drw,
				col : 1
			};
		}
		//save tile drawing
		imageStore.source[drw] = [];
		for (var y = 0; y < 8; y++) {
			var ln = "";
			for (var x = 0; x < 8; x++) {
				ln += drawing_data[y][x];
			}
			imageStore.source[drw].push(ln);
		} 
		renderImages(); //rerender all images (inefficient)
	}
	else { //paintMode is Sprite or Avatar
		//new sprite
		var drw = "SPR_" + drawingId;
		if (!(drawingId in sprite)) {
			sprite[drawingId] = { //todo create default sprite creation method
				drw : drw,
				col : 2,
				set : null,
				x : -1,
				y : -1
			};
		}
		//save sprite drawing
		imageStore.source[drw] = [];
		for (var y = 0; y < 8; y++) {
			var ln = "";
			for (var x = 0; x < 8; x++) {
				ln += drawing_data[y][x];
			}
			imageStore.source[drw].push(ln);
		} 
		renderImages();
	}
}

function refreshGameData() {
	var gameData = serializeWorld();
	document.getElementById("game_data").value = gameData;
}

function on_edit_mode() {
	stopGame();
	parseWorld(document.getElementById("game_data").value); //reparse world to account for any changes during gameplay
	drawEditMap();
	listenMapEditEvents();
}

function on_play_mode() {
	unlistenMapEditEvents();
	load_game(document.getElementById("game_data").value);
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
}
function on_paint_tile() {
	paintMode = TileType.Tile;
	tileIndex = 0;
	drawingId = sortedTileIdList()[tileIndex];
	reloadTile();
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:block;");
	document.getElementById("paintNav").setAttribute("style","display:block;");
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
	reloadSprite();
	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:block;");
}

function on_change_dialog() {
	dialog[drawingId] = document.getElementById("dialogText").value;
	refreshGameData();
}

function on_game_data_change() {
	clearGameData();
	parseWorld(document.getElementById("game_data").value); //reparse world if user directly manipulates game data

	var curPaintMode = paintMode; //save current paint mode (hacky)

	//fallback if there are no tiles, sprites, map
	if (Object.keys(sprite).length == 0) {
		paintMode = TileType.Avatar;
		drawingId = "A";
		drawing_data = [
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0]
		];
		saveDrawingData();
		sprite["A"].set = null;
		sprite["A"].x = -1;
		sprite["A"].y = -1;
	}
	if (Object.keys(tile).length == 0) {
		paintMode = TileType.Tile;
		drawingId = "a";
		drawing_data = [
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0]
		];
		saveDrawingData();
	}
	if (Object.keys(set).length == 0) {
		set["0"] = {
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

	document.getElementById("titleText").value = title;

	//this is my best guess of what index the tile character should be at -- but it could be wrong :(
	nextTileCharCode = 97 + Object.keys(tile).length;
	nextSpriteCharCode = 97 + Object.keys(sprite).length;
}

function updatePaletteControlsFromGameData() {
	document.getElementById("backgroundColor").value = rgbToHex(palette["0"][0][0], palette["0"][0][1], palette["0"][0][2]);
	document.getElementById("tileColor").value = rgbToHex(palette["0"][1][0], palette["0"][1][1], palette["0"][1][2]);
	document.getElementById("spriteColor").value = rgbToHex(palette["0"][2][0], palette["0"][2][1], palette["0"][2][2]);
}

function on_toggle_wall() {
	if ( document.getElementById("wallCheckbox").checked ){
		//add to wall list
		set[curSet].walls.push( drawingId );
	}
	else if ( set[curSet].walls.indexOf(drawingId) != -1 ){
		//remove from wall list
		set[curSet].walls.splice( set[curSet].walls.indexOf(drawingId), 1 );
	}
	console.log(set[curSet]);
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
	var titleIndex = html.indexOf("@@T");
	html = html.substr(0,titleIndex) + title + html.substr(titleIndex+3);
	var engineIndex = html.indexOf("@@E");
	html = html.substr(0,engineIndex) + engineScript + html.substr(engineIndex+3);
	var gameDataIndex = html.indexOf("@@D");
	html = html.substr(0,gameDataIndex) + gameData + html.substr(gameDataIndex+3);
	downloadFile("mygame.html",html);
}

function escapeSpecialCharacters(str) {
	str = str.replace(/\\/g, '\\\\');
	str = str.replace(/"/g, '\\"');
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
	document.getElementById("about").setAttribute("style","display:none;");
}

function showInstructions() {
	document.getElementById("instructions").style.display = "block";
}

function hideInstructions() {
	document.getElementById("instructions").style.display = "none";
}

function showVersionNotes() {
	document.getElementById("versionNotes").style.display = "block";
}

function hideVersionNotes() {
	document.getElementById("versionNotes").style.display = "none";
}