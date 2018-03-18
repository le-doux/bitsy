/* 
	CORE 
*/

/* GLOBAL editor state */
// I'd like to remove as much as possible from this
function makeEditorState() {
	return {
		paletteIndex : 0
	};
};

var defaultEditorState = makeEditorState();
function Ed() {
	return defaultEditorState;
};

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
	console.log(id);
	var drwId = "ITM_" + id;
	console.log(drwId);
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
}