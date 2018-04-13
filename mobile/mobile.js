/*
GOALS
- mobile friendly UI
- bitsy v0.1 functionality
- better componentized code

IDEAS
- tools are one page each
- tools are **self contained**
- swipe to navigate tools?
- horizontal vs vertical mode
- zoom?
- how do you handle exporting games?

TODO next
- bigger buttons (especially play)
x better tool select
	- bottom toolbar?
	x side panel?
	- swipe shortcut?
- visual drawing picker
- bitsy style
- better handle of scrolling
? zoom
? text edit pop out windows
?? undo/redo

TODO future
- all tools are iframes
- all tools UI generated in code
- better code refactor

TODO
X game canvas
X game data
X play / pause
X resize to fit phone
X host somewhere
X title
X select tile / avatar / sprite
X edit map
X paint panel
	X dialog
	X wall
	X add
	X delete
X fix layout issues
- zoom
X figure out localhost -> mobile dev cycle
X fix color picker
- fix color slider [maybe I did??]
X font size issue (currently fixed by making it big?)
- try flex panel again
X try making a game!!
- what is the correct way to handle font sizing??

BUGS
X can't drag to delete tiles
X drag also moves player
X sprite / tile select doesn't update on add / delete
X tile add / delete doesn't seem to work right?
X add / delete shouldn't be visible on avatar

Random thoughts
- title on EVERY room?
- how to distinguish between mobile / desktop tool versions?
- can we collapse distinction between different drawing types? avatar / sprite / tile / item
- SFX?
- tools as iframes?
- need a color palette preview of tiles / sprites
- dropdown box sucks as a way to switch between tools

Components:
- room tool
- paint tool
- color picker (done-ish)
- drawing selector
- data panel

Shared code plan:
- sort code in prototype by tool / category
- pull out shared functions
- platform specialization
- componetization? (data-oriented or object-oriented? or?)
- also: componentize parser code

BUG: convert ’ -> ' in dialog

DEV NOTES:
- debug with safari
	- host on localhost with: python -m SimpleHTTPServer
		- run from project root
	- connect on iphone via: ip.address:8000/mobile
*/

/*
	CORE
*/

// shared
function start() {
	Ed().platform = PlatformType.Mobile;

	attachCanvas( document.getElementById("game") );

	roomTool = new RoomTool(canvas);
	paintTool = new PaintTool(document.getElementById("paint"),roomTool);
	paintTool.onReloadTile = function(){ reloadTile() };
	paintTool.onReloadSprite = function(){ reloadSprite() };

	//load last auto-save
	if (localStorage.game_data) {
		document.getElementById("game_data").value = localStorage.game_data;
	}
	else {
		setDefaultGameState();
	}

	initGameState();
	// initGameStateAndRender(); // also parses and loads the data --- needs to be two separate things

	// console.log("title : " + title);

	document.getElementById("titleText").value = title;

	paintTool.updateCanvas();

	// init color picker
	colorPicker = new ColorPicker('colorPickerWheel', 'colorPickerSelect', 'colorPickerSlider', 'colorPickerSliderBg', 'colorPickerHexText');
	document.getElementById("colorPaletteOptionBackground").checked = true;
	paletteTool = new PaletteTool(colorPicker,["colorPaletteLabelBackground", "colorPaletteLabelTile", "colorPaletteLabelSprite"]);
	paletteTool.onPaletteChange = onPaletteChange;
	paletteTool.updateColorPickerUI();

	document.getElementById("playModeCheck").checked = false;
	// document.getElementById("tool_select").options[0].selected = true;

	roomTool.drawEditMap();

	roomTool.listenEditEvents();

	roomExplorer = new PaintExplorer("roomExplorer", onRoomExplorerSelect);
	roomExplorer.displayCaptions = false;
	roomExplorer.Refresh( TileType.Avatar );
	roomExplorer.ChangeSelection("A");

	paintExplorer = new PaintExplorer("paintExplorer", onPaintExplorerSelect);
	paintExplorer.displayCaptions = false;
	paintExplorer.Refresh( TileType.Avatar );
	paintExplorer.ChangeSelection("A");
}

// mobile
function initGameState() {
	// re-import game data into the engine
	clearGameData();
	parseWorld(document.getElementById("game_data").value);
	renderImages();
}

// mobile
function initGameStateAndRender() {
	initGameState();
	roomTool.drawEditMap();
}

// mobile
function changeTool(e) {
	changeToolById(e.target.value);
}

function changeToolById(toolId) {
	Array.from( document.getElementsByClassName("tool") ).map( function(t) { t.style.display = "none"; } );
	document.getElementById(toolId).style.display = "block";
}

/* 
	ROOM
*/
var roomTool;

// shared
function on_play_mode() {
	roomTool.unlistenEditEvents();
	load_game(document.getElementById("game_data").value);
}

// shared
function on_edit_mode() {
	stopGame();
	parseWorld(document.getElementById("game_data").value);
	roomTool.listenEditEvents();
	roomTool.drawEditMap();
	// initGameStateAndRender();
}

// shared
// TODO: these need to be specialized for ROOM and PAINT tools
function on_room_paint_avatar() {
	roomTool.drawing.type = TileType.Avatar;
	roomTool.drawing.id = "A";

	roomExplorer.Refresh(roomTool.drawing.type);
	roomExplorer.ChangeSelection(roomTool.drawing.id);
}

function on_room_paint_tile() {
	roomTool.drawing.type = TileType.Tile;
	tileIndex = 0;
	roomTool.drawing.id = sortedTileIdList()[tileIndex];

	roomExplorer.Refresh(roomTool.drawing.type);
	roomExplorer.ChangeSelection(roomTool.drawing.id);
}

function on_room_paint_sprite() {
	roomTool.drawing.type = TileType.Sprite;
	if (sortedSpriteIdList().length > 1)
	{
		spriteIndex = 1;
	}
	else {
		spriteIndex = 0; //fall back to avatar if no other sprites exist
	}
	roomTool.drawing.id = sortedSpriteIdList()[spriteIndex];

	roomExplorer.Refresh(roomTool.drawing.type);
	roomExplorer.ChangeSelection(roomTool.drawing.id);
}

// mobile
function room_onSelectDrawing(e) {
	roomTool.drawing.id = e.target.value;
}


/* 
	PAINT 
*/
var paintTool;

function on_paint_avatar() {
	paintTool.drawing.type = TileType.Avatar;
	paintTool.drawing.id = "A";

	paintExplorer.Refresh(paintTool.drawing.type);
	paintExplorer.ChangeSelection(paintTool.drawing.id);

	paintTool.updateCanvas();

	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintCommands").setAttribute("style","display:none;");
}

function on_paint_tile() {
	paintTool.drawing.type = TileType.Tile;
	paintTool.drawing.id = sortedTileIdList()[0];

	paintExplorer.Refresh(paintTool.drawing.type);
	paintExplorer.ChangeSelection(paintTool.drawing.id);

	reloadTile();
	paintTool.updateCanvas();

	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:block;");
	document.getElementById("paintCommands").setAttribute("style","display:block;");
}

// hack
function nextTile() {
	on_paint_tile();
}

function on_paint_sprite() {
	paintTool.drawing.type = TileType.Sprite;
	paintTool.drawing.id = sortedSpriteIdList()[sortedSpriteIdList().length > 1 ? 1 : 0];

	paintExplorer.Refresh(paintTool.drawing.type);
	paintExplorer.ChangeSelection(paintTool.drawing.id);

	reloadSprite();

	paintTool.updateCanvas();

	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintCommands").setAttribute("style","display:block;");
}

// hack
function nextSprite() {
	on_paint_sprite();
}

function paint_onSelectDrawing(e) {
	paintTool.drawing.id = e.target.value;
	paintTool.updateCanvas();

	// TODO : make these functions less hacky and terrible
	if(paintTool.drawing.type == TileType.Tile) {
		reloadTile();
	}
	else if(paintTool.drawing.type == TileType.Sprite) {
		reloadSprite();
	}
}

// specialized
function reloadTile() {
	updateWallCheckboxOnCurrentTile();
}

// specialized - sort of
function updateWallCheckboxOnCurrentTile() {
	var isCurTileWall = false;

	if( tile[ paintTool.drawing.id ].isWall == undefined || tile[ paintTool.drawing.id ].isWall == null ) {
		if (room[curRoom]) {
			isCurTileWall = (room[curRoom].walls.indexOf(paintTool.drawing.id) != -1);
		}
	}
	else {
		isCurTileWall = tile[ paintTool.drawing.id ].isWall;
	}

	console.log("IS WALL " + isCurTileWall);

	if (isCurTileWall) {
		document.getElementById("wallCheckbox").checked = true;
		// document.getElementById("wallCheckboxIcon").innerHTML = "border_outer";
	}
	else {
		document.getElementById("wallCheckbox").checked = false;
		// document.getElementById("wallCheckboxIcon").innerHTML = "border_clear";
	}
}

// specialized
function reloadSprite() {
	reloadDialogUI()
}

// specialized - sort of
function on_toggle_wall(e) {
	paintTool.toggleWall( e.target.checked );
}

// specialized - sort of
function newDrawing() {
	paintTool.newDrawing();
}

// shared
function deleteDrawing() {
	paintTool.deleteDrawing();
}


/* 
	COLOR 
*/
var colorPicker = null; // new color picker
var paletteTool = null;

function changeColorPickerIndex(index) {
	paletteTool.changeColorPickerIndex(index);
}

function onPaletteChange() {
	refreshGameData();
	initGameStateAndRender();
}

/* 
	DATA 
*/
// similar to on_game_data_change()
function editGameData() {
	initGameStateAndRender();
	localStorage.game_data = document.getElementById("game_data").value;
}

/*
	NEW
*/
function toggleToolSideBar() {
	var sideBar = document.getElementById("tool_side_bar");
	sideBar.style.display = sideBar.style.display === "none" ? "block" : "none";
}

var roomExplorer;
function onRoomExplorerSelect() {
	console.log(this.value);
	roomTool.drawing.id = this.value;
}

var paintExplorer;
function onPaintExplorerSelect() {
	console.log(this.value);
	paintTool.drawing.id = this.value;

	paintTool.updateCanvas();

	// TODO : make these functions less hacky and terrible
	if(paintTool.drawing.type == TileType.Tile) {
		reloadTile();
	}
	else if(paintTool.drawing.type == TileType.Sprite) {
		reloadSprite();
	}
}