/* 
	CORE 
*/

/* MODES */
var TileType = {
	Tile : 0,
	Sprite : 1,
	Avatar : 2,
	Item : 3
};

var EditMode = {
	Edit : 0,
	Play : 1
};

// TODO : use this to specialize code
var PlatformType = {
	Desktop : 0,
	Mobile : 1
};

/* GLOBAL editor state */
// I'd like to remove as much as possible from this
function EditorState() {
	this.paletteIndex = 0;
	this.platform = PlatformType.Desktop; // default to desktop
}

var defaultEditorState = new EditorState();
function Ed() {
	return defaultEditorState;
};

function defParam(param,value) {
	return (param == undefined || param == null) ? value : param;
};

/* PALETTES */
function selectedColorPal(editor) {
	editor = defParam( editor, Ed() );
	return sortedPaletteIdList()[ editor.paletteIndex ];
};

/* UNIQUE ID METHODS */
// TODO - lots of duplicated code around stuff (ex: all these things with IDs)
function nextTileId() {
	return nextObjectId( sortedTileIdList() );
}

function nextSpriteId() {
	return nextObjectId( sortedSpriteIdList() );
}

function nextItemId() {
	return nextObjectId( sortedItemIdList() );
}

function nextRoomId() {
	return nextObjectId( sortedRoomIdList() );
}

function nextEndingId() {
	return nextObjectId( sortedEndingIdList() );
}

function nextPaletteId() {
	return nextObjectId( sortedPaletteIdList() );
}

function nextObjectId(idList) {
	var lastId = idList[ idList.length - 1 ];
	var idInt = parseInt( lastId, 36 );
	idInt++;
	return idInt.toString(36);
}

function sortedTileIdList() {
	return sortedBase36IdList( tile );
}

function sortedSpriteIdList() {
	return sortedBase36IdList( sprite );
}

function sortedItemIdList() {
	return sortedBase36IdList( item );
}

function sortedRoomIdList() {
	return sortedBase36IdList( room );
}

function sortedEndingIdList() {
	return sortedBase36IdList( ending );
}

function sortedPaletteIdList() {
	return sortedBase36IdList( palette );
}

function sortedBase36IdList( objHolder ) {
	return Object.keys( objHolder ).sort( function(a,b) { return parseInt(a,36) - parseInt(b,36); } );
}

function nextAvailableDialogId(prefix) {
	if(prefix === undefined || prefix === null) prefix = "";
	var i = 0;
	var id = prefix + i.toString(36);
	while( dialog[id] != null ) {
		i++;
		id = prefix + i.toString(36);
	}
	return id;
}

/* UTILS */
function getContrastingColor(palId) {
	if (!palId) palId = curPal();
	var hsl = rgbToHsl( getPal(palId)[0][0], getPal(palId)[0][1], getPal(palId)[0][2] );
	// console.log(hsl);
	var lightness = hsl[2];
	if (lightness > 0.5) {
		return "#000";
	}
	else {
		return "#fff";
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

/* MAKE DRAWING OBJECTS */
function makeTile(id,imageData) {
	var drwId = "TIL_" + id;
	tile[id] = {
		drw : drwId,
		col : 1,
		animation : { //todo
			isAnimated : (!imageData) ? false : (imageData.length>1),
			frameIndex : 0,
			frameCount : (!imageData) ? 2 : imageData.length
		},
		name : null
	};
	makeDrawing(drwId,imageData);
}

function makeSprite(id,imageData) {
	var drwId = "SPR_" + id;
	sprite[id] = { //todo create default sprite creation method
		drw : drwId,
		col : 2,
		room : null,
		x : -1,
		y : -1,
		animation : { //todo
			isAnimated : (!imageData) ? false : (imageData.length>1), // more duplication :(
			frameIndex : 0,
			frameCount : (!imageData) ? 2 : imageData.length
		},
		dlg : null,
		name : null
	};
	makeDrawing(drwId,imageData);
}

function makeItem(id,imageData) { // NOTE : same as tile right now? make more like sprite?
	// console.log(id);
	var drwId = "ITM_" + id;
	// console.log(drwId);
	item[id] = {
		drw : drwId,
		col : 2, // TODO color not column (bad name)
		animation : { //todo
			isAnimated : (!imageData) ? false : (imageData.length>1), // more duplication :(
			frameIndex : 0,
			frameCount : (!imageData) ? 2 : imageData.length
		},
		dlg : null,
		name : null
	};
	makeDrawing(drwId,imageData);
}

function makeDrawing(id,imageData) {
	if (!imageData) {
		imageData = [[
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0]
		]];
	}
	imageStore.source[id] = imageData;
	renderImages(); //todo is this the right place for this?
}

/* EVENTS */
function on_change_title(e) {
	// title = document.getElementById("titleText").value;
	title = e.target.value;
	refreshGameData();
	tryWarnAboutMissingCharacters(title);
}

/* MOBILE */
function mobileOffsetCorrection(off,e,innerSize) {
	var bounds = e.target.getBoundingClientRect();

	// var width = bounds.width * containerRatio;
	// var height = bounds.height * containerRatio;

	// correction for square canvas contained in rect
	if( bounds.width > bounds.height ) {
		off.x -= (bounds.width - bounds.height) / 2;
	}
	else if( bounds.height > bounds.width ) {
		off.y -= (bounds.height - bounds.width) / 2;
	}

	// console.log(off);

	// convert container size to internal canvas size
	var containerRatio = innerSize / Math.min( bounds.width, bounds.height );

	// console.log(containerRatio);

	off.x *= containerRatio;
	off.y *= containerRatio;

	// console.log(off);

	return off;
}

function tileTypeToIdPrefix(type) {
	if( type == TileType.Tile )
		return "TIL_";
	else if( type == TileType.Sprite || type == TileType.Avatar )
		return "SPR_";
	else if( type == TileType.Item )
		return "ITM_";
}

/* DIALOG UI 
- needs a better home
	- into paint object?
	- needs its own controller?
*/
function reloadDialogUI() {
	reloadDialogUICore();

	if( Ed().platform == PlatformType.Desktop )
		reloadAdvDialogUI();
}

// TODO : default paint and room tools tied to editor state object??? (or is that bad?)
function reloadDialogUICore() { // TODO: name is terrible
	var dialogId = getCurDialogId(); // hacky

	if (dialogId in dialog) {
		var dialogLines = dialog[dialogId].split("\n");
		if(dialogLines[0] === '"""') {
			// multi line
			var dialogStr = "";
			var i = 1;
			while (i < dialogLines.length && dialogLines[i] != '"""') {
				dialogStr += dialogLines[i] + (dialogLines[i+1] != '"""' ? '\n' : '');
				i++;
			}
			document.getElementById("dialogText").value = dialogStr;
		}
		else {
			// single line
			document.getElementById("dialogText").value = dialog[dialogId];
		}
	}
	else {
		document.getElementById("dialogText").value = "";
	}	
}

// hacky - assumes global paintTool object
function getCurDialogId() {
	return paintTool.drawing.getDialogId();
}

function on_change_dialog_finished() {
	on_change_dialog();
	tryWarnAboutMissingCharacters( document.getElementById("dialogText").value );
}

// hacky - assumes global paintTool object
function on_change_dialog() {
	var dialogId = getCurDialogId();

	var dialogStr = document.getElementById("dialogText").value;
	if(dialogStr.length <= 0){
		if(dialogId) {
			paintTool.getCurObject().dlg = null;
			delete dialog[dialogId];
		}
	}
	else {
		if(!dialogId) {
			var prefix = (paintTool.drawing.type == TileType.Item) ? "ITM_" : "SPR_";
			dialogId = nextAvailableDialogId( prefix );
			paintTool.getCurObject().dlg = dialogId;
		}
		if( dialogStr.indexOf('\n') > -1 ) dialogStr = '"""\n' + dialogStr + '\n"""';
		dialog[dialogId] = dialogStr;
	}

	if( Ed().platform == PlatformType.Desktop )
		reloadAdvDialogUI();

	refreshGameData();
}

/* PALETTE TOOL STUFF
TODO:
- move into its own file 
- is PaletteTool the best name?
- should it create its own color picker?
*/
function PaletteTool(colorPicker,labelIds) {
	var self = this;

	var colorPickerIndex = 0;

	// public
	this.changeColorPickerIndex = function(index) {
		colorPickerIndex = index;
		var color = getPal(selectedColorPal())[ index ];
		// console.log(color);
		colorPicker.setColor( color[0], color[1], color[2] );
	}

	function updateColorPickerLabel(index, r, g, b) {
		var rgbColor = {r:r, g:g, b:b};

		var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
		var hsvColor = RGBtoHSV( rgbColor );
		document.getElementById( labelIds[ index ] ).style.background = rgbColorStr;
		document.getElementById( labelIds[ index ] ).style.color = hsvColor.v < 0.5 ? "white" : "black";
	}

	this.onPaletteChange = null;
	function onColorPickerChange( rgbColor, isMouseUp ) {
		getPal(selectedColorPal())[ colorPickerIndex ][ 0 ] = rgbColor.r;
		getPal(selectedColorPal())[ colorPickerIndex ][ 1 ] = rgbColor.g;
		getPal(selectedColorPal())[ colorPickerIndex ][ 2 ] = rgbColor.b;

		updateColorPickerLabel(colorPickerIndex, rgbColor.r, rgbColor.g, rgbColor.b );

		if( isMouseUp ) {
			if(self.onPaletteChange != null)
				self.onPaletteChange();
		}
	}

	colorPicker.onColorChange = onColorPickerChange; // order matters?

	// public
	this.updateColorPickerUI = function() {
		var color0 = getPal(selectedColorPal())[ 0 ];
		var color1 = getPal(selectedColorPal())[ 1 ];
		var color2 = getPal(selectedColorPal())[ 2 ];

		updateColorPickerLabel(0, color0[0], color0[1], color0[2] );
		updateColorPickerLabel(1, color1[0], color1[1], color1[2] );
		updateColorPickerLabel(2, color2[0], color2[1], color2[2] );

		changeColorPickerIndex( colorPickerIndex );
	}
}

/* RESOURCE LOADER */
function ResourceLoader() {
	var resources = {};

	var pathRoot = Ed().platform == PlatformType.Desktop ? "shared" : "./../editor/shared";

	this.load = function(folder, filename, onready) {
		var client = new XMLHttpRequest();
		client.open('GET', pathRoot + '/' + folder + '/' + filename);
		client.onreadystatechange = function() {
			resources[filename] = client.responseText;
			if(onready) onready();
		}
		client.send();
	}

	this.get = function(filename) {
		return resources[filename];
	}

	// for manually adding stuff to the resources that doesn't ACTUALLY have to be loaded from an external file
	this.set = function(filename,data) {
		resources[filename] = data;
	}

	this.contains = function(filename) {
		return resources[filename] != null;
	}

	this.getResourceLoadedCount = function() {
		// feels hacky
		var count = 0;
		for (var r in resources) {
			count++;
		}
		return count;
	}
}

function createDefaultGameStateFunction() {
	var resources = new ResourceLoader();
	resources.load("other", "defaultGameData.bitsy");

	return function() {
		document.getElementById("game_data").value = resources.get("defaultGameData.bitsy"); // reset game data
		localStorage.game_data = document.getElementById("game_data").value; // save game
		clearGameData();
		parseWorld(document.getElementById("game_data").value); // load game
	}
}
var setDefaultGameState = createDefaultGameStateFunction();

function newGameDialog() {
	if ( Ed().platform == PlatformType.Mobile ||
			confirm("Starting a new game will erase your old data. Consider exporting your work first! Are you sure you want to start over?") )
	{
		resetGameData();
	}
}

function resetGameData() {
	setDefaultGameState();

	// TODO : localize default_title
	title = localization.GetStringOrFallback("default_title", "Write your game's title here");

	pickDefaultFontForLanguage(localization.GetLanguage());

	// todo wrap these variable resets in a function
	tileIndex = 0;
	spriteIndex = 0;

	refreshGameData();
	renderImages();

	if ( Ed().platform == PlatformType.Desktop ) {
		updatePaletteUI();
		// updatePaletteControlsFromGameData();
		updateExitOptionsFromGameData();
		updateRoomName();
		updateInventoryUI();
		updateFontSelectUI(); // hmm is this really the place for this?

		on_paint_avatar();
		document.getElementById('paintOptionAvatar').checked = true;
	}

	paintTool.updateCanvas(); // hacky - assumes global paintTool and roomTool
	roomTool.drawEditMap();

	document.getElementById("titleText").value = title;
}

function refreshGameData() {
	if( Ed().platform == PlatformType.Desktop )
		if (isPlayMode) return; //never store game data while in playmode (TODO: wouldn't be necessary if the game data was decoupled form editor data)

	flags.ROOM_FORMAT = 1; // always save out comma separated format, even if the old format is read in

	// var gameData = serializeWorld();

	// document.getElementById("game_data").value = gameData; // TODO : this is where the slow down is

	var gameDataNoFonts = serializeWorld(true);
	document.getElementById("game_data").value = showFontDataInGameData ? serializeWorld() : gameDataNoFonts;

	// localStorage.setItem("game_data", gameData); //auto-save

	localStorage.setItem("game_data", gameDataNoFonts);
}