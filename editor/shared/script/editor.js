/*
TODO for v6:
X rename exit.js
X update panel prefs
X hide / disable in-progress work
	X IDs switch over
	X script tag
	X new functions
	X exit options
	X effects
X add localization for new strings
- make sure exit tool doesn't refresh all the time and lose state (e.g. on enter edit mode)
	- also: double click on exits to show them in tool?
- move marker panel style into css file
- finalize transition time and fps
- TEST EVERYTHING
- merge w/ main repository
- update localization files
- update version number
- update version notes
- TEST EVERYTHING
*/

/*
NOTES
- remember to run chrome like this to test "open /Applications/Google\ Chrome.app --args --allow-file-access-from-files"
*/

var editMode = EditMode.Edit; // TODO : move to core.js?

/* TOOL CONTROLLERS */
var roomTool;
var paintTool;

/* CUR DRAWING */
var drawing = new DrawingId(TileType.Avatar,"A");

var tileIndex = 0;
var spriteIndex = 0;
var itemIndex = 0;

/* ROOM */
var roomIndex = 0;

/* ENDINGS */
var endingIndex = 0;

/* BROWSER COMPATIBILITY */
var browserFeatures = {
	colorPicker : false,
	fileDownload : false,
	blobURL : false
};

/* SCREEN CAPTURE */
var gifencoder = new gif();
var gifFrameData = [];

var isPlayMode = false;

/* EXPORT HTML */
var makeURL = null;
var exporter = new Exporter();

/* FONT MANAGER */
var editorFontManager = new FontManager( true /*useExternalResources*/ );
var areAllFontsLoaded = false;

function detectBrowserFeatures() {
	console.log("BROWSER FEATURES");
	//test feature support
	try {
		var input = document.createElement("input");
		input.type = "color";
		document.body.appendChild(input);

		if (input.type === "color") {
			console.log("color picker supported!");
			browserFeatures.colorPicker = true;
		} else {
			browserFeatures.colorPicker = false;
		}

		if(input.offsetWidth <= 10 && input.offsetHeight <= 10) {
			// console.log(input.clientWidth);
			console.log("WEIRD SAFARI COLOR PICKER IS BAD!");
			browserFeatures.colorPicker = false;
			document.getElementById("pageColor").type = "text";
		}
		
		document.body.removeChild(input);
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

	browserFeatures.blobURL = (!!new Blob) && (URL != undefined || webkitURL != undefined);
	if( browserFeatures.blobURL ) {
		console.log("blob supported!");
		makeURL = URL || webkitURL;
	}
}

function hasUnsupportedFeatures() {
	return /*!browserFeatures.colorPicker ||*/ !browserFeatures.fileDownload;
}
// NOTE: No longer relying on color picker feature

function showUnsupportedFeatureWarning() {
	document.getElementById("unsupportedFeatures").style.display = "block";
}

function hideUnsupportedFeatureWarning() {
	document.getElementById("unsupportedFeatures").style.display = "none";
}

// This is the panel arrangement you get if you are new or your editor settings are out-of-date
var defaultPanelPrefs = {
	workspace : [
		{ id:"aboutPanel", 			visible:true, 	position:0  },
		{ id:"roomPanel", 			visible:true, 	position:1  },
		{ id:"paintPanel", 			visible:true, 	position:2  },
		{ id:"colorsPanel", 		visible:true, 	position:3  },
		{ id:"downloadPanel", 		visible:true, 	position:4  },
		{ id:"gifPanel", 			visible:false, 	position:5  },
		{ id:"dataPanel", 			visible:false, 	position:6  },
		{ id:"exitsPanel", 			visible:false, 	position:7  },
		{ id:"paintExplorerPanel",	visible:false,	position:9  },
		{ id:"dialogPanel",			visible:false,	position:10 },
		{ id:"inventoryPanel",		visible:false,	position:11 },
		{ id:"settingsPanel",		visible:false,	position:12 },
	]
};
// console.log(defaultPanelPrefs);

function getPanelPrefs() {
	// (TODO: weird that engine version and editor version are the same??)
	var useDefaultPrefs = ( localStorage.engine_version == null ) ||
							( localStorage.panel_prefs == null ) ||
							( JSON.parse(localStorage.engine_version).major < 6 ) ||
							( JSON.parse(localStorage.engine_version).minor < 0 );

	var prefs = useDefaultPrefs ? defaultPanelPrefs : JSON.parse( localStorage.panel_prefs );

	// add missing panel prefs (if any)
	// console.log(defaultPanelPrefs);
	for( var i = 0; i < defaultPanelPrefs.workspace.length; i++ ) {
		var isMissing = true;
		var panelPref = defaultPanelPrefs.workspace[i];
		for( var j = 0; j < prefs.workspace.length; j++ )
		{
			if( prefs.workspace[j].id === panelPref.id ) {
				isMissing = false;
			}
		}

		if( isMissing ) {
			prefs.workspace.push( panelPref );
		}
	}

	return prefs;
}

var urlFlags = {};
function readUrlFlags() {
	console.log("@@@@@ FLAGGS")
	var urlSplit = window.location.href.split("?");
	if (urlSplit.length > 1) {
		for(var i = 1; i < urlSplit.length; i++) {
			var flagSplit = urlSplit[i].split("=");
			urlFlags[ flagSplit[0] ] = flagSplit[1];
		}
	}
	console.log(urlFlags);
}

function start() {
	// Ed().platform = PlatformType.Mobile;

	isPlayerEmbeddedInEditor = true; // flag for game player to make changes specific to editor

	// test
	if(Ed().platform === PlatformType.Mobile) {
		var head = document.getElementsByTagName("head")[0];
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = "shared/style/mobileEditorStyle.css";
		head.appendChild(link);
	}

	if(Ed().platform === PlatformType.Desktop) {
		detectBrowserFeatures();
	}

	readUrlFlags();

	// localization
	if (urlFlags["lang"] != null) {
		localStorage.editor_language = urlFlags["lang"]; // need to verify this is real language?
	}
	localization = new Localization( initLanguageOptions );

	//game canvas & context (also the map editor)
	attachCanvas( document.getElementById("game") );

	//init tool controllers
	roomTool = new RoomTool(canvas);
	roomTool.listenEditEvents()
	roomTool.drawing = drawing;
	roomTool.editDrawingAtCoordinateCallback = editDrawingAtCoordinate;

	paintTool = new PaintTool(document.getElementById("paint"),roomTool);
	paintTool.drawing = drawing;
	paintTool.onReloadTile = function(){ reloadTile() };
	paintTool.onReloadSprite = function(){ reloadSprite() };
	paintTool.onReloadItem = function(){ reloadItem() };

	// //exit destination canvas & context
	// exit_canvas = document.getElementById("exitCanvas");
	// exit_canvas.width = width * scale;
	// exit_canvas.height = width * scale;
	// exit_ctx = exit_canvas.getContext("2d");
	// //exit events
	// exit_canvas.addEventListener("mousedown", exit_onMouseDown);
	markerTool = new RoomMarkerTool(document.getElementById("markerCanvas1"), document.getElementById("markerCanvas2") );
	console.log("MARKER TOOL " + markerTool);

	roomTool.markers = markerTool;

	//
	drawingThumbnailCanvas = document.createElement("canvas");
	drawingThumbnailCanvas.width = 8 * scale;
	drawingThumbnailCanvas.height = 8 * scale;
	drawingThumbnailCtx = drawingThumbnailCanvas.getContext("2d");

	//load last auto-save
	if (localStorage.game_data) {
		//console.log("~~~ found old save data! ~~~");
		//console.log(localStorage.game_data);
		document.getElementById("game_data").value = localStorage.game_data;
		on_game_data_change_core();
	}
	else {
		setDefaultGameState();
	}

	markerTool.SetRoom(curRoom);

	// load panel preferences
	var prefs = getPanelPrefs();
	localStorage.panel_prefs = JSON.stringify(prefs); // save loaded prefs
	var sortedWorkspace = prefs.workspace.sort( function(a,b) { return a.position - b.position; } );
	var editorContent = document.getElementById("editorContent");
	for(i in sortedWorkspace) {
		var panelSettings = sortedWorkspace[i];
		var panelElement = document.getElementById(panelSettings.id);
		if (panelElement != undefined && panelElement != null) {
			togglePanelCore( panelSettings.id, panelSettings.visible, false /*doUpdatePrefs*/ );
			editorContent.insertBefore( panelElement, null ); //insert on the left
		}
	}

	// Automatically open tool trays that are needed
	if( sortedRoomIdList().length > 1 )
	{
		toggleRoomToolsCore( true );
	}
	if( sortedPaletteIdList().length > 1 )
	{
		togglePaletteToolsCore( true );
	}

	//draw everything
	on_paint_avatar();
	paintTool.updateCanvas();
	markerTool.Refresh();
	roomTool.drawEditMap();

	updateRoomPaletteSelect(); //dumb to have to specify this here --- wrap up room UI method?
	updateRoomName(); // init the room UI

	updateInventoryUI();

	// init color picker
	colorPicker = new ColorPicker('colorPickerWheel', 'colorPickerSelect', 'colorPickerSlider', 'colorPickerSliderBg', 'colorPickerHexText');
	document.getElementById("colorPaletteOptionBackground").checked = true;
	paletteTool = new PaletteTool(colorPicker,["colorPaletteLabelBackground", "colorPaletteLabelTile", "colorPaletteLabelSprite"]);
	paletteTool.onPaletteChange = onPaletteChange;
	paletteTool.updateColorPickerUI();

	// init paint explorer
	paintExplorer = new PaintExplorer("paintExplorer",selectPaint);
	paintExplorer.Refresh(TileType.Avatar);
	paintExplorer.ChangeSelection("A");
	paintTool.explorer = paintExplorer;
	paintExplorer.SetDisplayCaptions( Ed().platform === PlatformType.Desktop );

	//unsupported feature stuff
	if(Ed().platform === PlatformType.Desktop) {
		if (hasUnsupportedFeatures()) {
			showUnsupportedFeatureWarning();
		}
		if (!browserFeatures.fileDownload) {
			document.getElementById("downloadHelp").style.display = "block";
		}
	}

	// gif recording init (should this go in its own file?)
	gifCaptureCanvas = document.createElement("canvas");
	gifCaptureCanvas.width = width * scale;
	gifCaptureCanvas.height = width * scale;
	gifCaptureCtx = gifCaptureCanvas.getContext("2d");

	onInventoryChanged = function(id) {
		updateInventoryUI();
	
		// animate to draw attention to change
		document.getElementById("inventoryItem_" + id).classList.add("flash");
		setTimeout(
			function() {
				// reset animations
				document.getElementById("inventoryItem_" + id).classList.remove("flash");
			},
			400
		);
	};

	onVariableChanged = function(id) {
		updateInventoryUI();
	
		// animate to draw attention to change
		document.getElementById("inventoryVariable_" + id).classList.add("flash");
		setTimeout(
			function() {
				// reset animations
				document.getElementById("inventoryVariable_" + id).classList.remove("flash");
			},
			400
		);
	};

	// load custom font first, since it is synchronous
	if (localStorage.custom_font != null) {
		var fontStorage = JSON.parse(localStorage.custom_font);
		editorFontManager.AddResource(fontStorage.name + ".bitsyfont", fontStorage.fontdata);
	}

	// load built-in bitmap fonts from servery (async)
	editorFontManager.LoadResources([
		"ascii_small.bitsyfont",
		"unicode_european_small.bitsyfont",
		"unicode_european_large.bitsyfont",
		"arabic_pixel.bitsyfont",
		"unicode_asian.bitsyfont"
	], function() {
		console.log("ALL FONTS LOADED"); // TODO : happens multiple times because of hacky implementation :(
		switchFont(fontName); // hack - make sure the engine font manager is setup too
		resetMissingCharacterWarning();
		areAllFontsLoaded = true; // hack
	});

	//color testing
	// on_change_color_bg();
	// on_change_color_tile();
	// on_change_color_sprite();

	// save latest version used by editor (for compatibility)
	localStorage.engine_version = JSON.stringify( version );

	// load saved export settings
	if( localStorage.export_settings ) {
		export_settings = JSON.parse( localStorage.export_settings );
		document.getElementById("pageColor").value = export_settings.page_color;
	}

	// TODO : interesting idea but needs work!
	// // try to honor state of all checkboxes from previous session
	// var inputElements = document.getElementsByTagName("input");
	// for (var i in inputElements) {
	// 	if (inputElements[i].type === "checkbox") {
	// 		var checkbox = inputElements[i];
	// 		if (checkbox.checked) {
	// 			console.log(checkbox);
	// 			checkbox.dispatchEvent(new Event("click"));
	// 		}
	// 	}
	// }
}

function newDrawing() {
	paintTool.newDrawing();
}

function nextTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex + 1) % ids.length;
	drawing.id = ids[tileIndex];
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function prevTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex - 1) % ids.length;
	if (tileIndex < 0) tileIndex = (ids.length-1);
	drawing.id = ids[tileIndex];
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function updateRoomName() {
	// document.getElementById("roomId").innerHTML = curRoom;
	var roomLabel = localization.GetStringOrFallback("room_label", "room");
	document.getElementById("roomName").placeholder = roomLabel + " " + curRoom;
	if(room[curRoom].name != null) {
		document.getElementById("roomName").value = room[curRoom].name;
	}
	else {
		document.getElementById("roomName").value = "";
	}
}

// TODO : consolidate these function and rename them something nicer
function on_room_name_change() {
	var str = document.getElementById("roomName").value;
	if(str.length > 0) {
		room[curRoom].name = str;
	}
	else {
		room[curRoom].name = null;
	}

	updateNamesFromCurData()

	refreshGameData();
}

function on_drawing_name_change() {
	var str = document.getElementById("drawingName").value;
	var obj = paintTool.getCurObject();
	var oldName = obj.name;
	if(str.length > 0)
		obj.name = str;
	else
		obj.name = null;

	updateNamesFromCurData()

	// update display name for thumbnail
	var displayName = obj.name ? obj.name : getCurPaintModeStr() + " " + drawing.id;
	paintExplorer.ChangeThumbnailCaption(drawing.id, displayName);

	// make sure items referenced in scripts update their names
	if(drawing.type === TileType.Item) {
		// console.log("SWAP ITEM NAMES");

		var ItemNameSwapVisitor = function() {
			var didSwap = false;
			this.DidSwap = function() { return didSwap; };

			this.Visit = function(node) {
				// console.log("VISIT!");
				// console.log(node);

				if( node.type != "function" || node.name != "item" )
					return; // not the right type of node
				
				if( node.arguments.length <= 0 || node.arguments[0].type != "literal" )
					return; // no argument available

				if( node.arguments[0].value === oldName ) { // do swap
					node.arguments[0].value = newName;
					didSwap = true;
				}
			};
		};

		var newName = obj.name;
		if(newName === null || newName === undefined) newName = drawing.id;
		if(oldName === null || oldName === undefined) oldName = drawing.id;

		// console.log(oldName + " <-> " + newName);

		if(newName != oldName) {
			for(dlgId in dialog) {
				// console.log("DLG " + dlgId);
				var dialogScript = scriptInterpreter.Parse( dialog[dlgId] );
				var visitor = new ItemNameSwapVisitor();
				dialogScript.VisitAll( visitor );
				if( visitor.DidSwap() ) {
					var newDialog = dialogScript.Serialize();
					if(newDialog.indexOf("\n") > -1) {
						newDialog = '"""\n' + newDialog + '\n"""';
					}
					dialog[dlgId] = newDialog;
				}
			}
		}

		updateInventoryItemUI();

		// renderPaintThumbnail( drawing.id ); // hacky way to update name
	}

	refreshGameData();
	console.log(names);
}

function on_palette_name_change() {
	var str = document.getElementById("paletteName").value;
	var obj = palette[ selectedColorPal() ];
	if(str.length > 0)
		obj.name = str;
	else
		obj.name = null;

	updateNamesFromCurData()

	refreshGameData();
	updatePaletteOptionsFromGameData();
}

function selectRoom(roomId) {
	console.log("SELECT ROOM " + roomId);

	// ok watch out this is gonna be hacky
	var ids = sortedRoomIdList();

	var nextRoomIndex = -1;
	for (var i = 0; i < ids.length; i++) {
		if (ids[i] === roomId) {
			nextRoomIndex = i;
		}
	}

	if (nextRoomIndex != -1) {
		roomIndex = nextRoomIndex;
		curRoom = ids[roomIndex];
		markerTool.SetRoom(curRoom);
		roomTool.drawEditMap();
		paintTool.updateCanvas();
		updateRoomPaletteSelect();
		paintExplorer.Refresh( paintTool.drawing.type, true /*doKeepOldThumbnails*/ );

		if (drawing.type === TileType.Tile)
			updateWallCheckboxOnCurrentTile();

		updateRoomName();
	}
}

function nextRoom() {
	var ids = sortedRoomIdList();
	roomIndex = (roomIndex + 1) % ids.length;
	curRoom = ids[roomIndex];
	markerTool.SetRoom(curRoom);
	roomTool.drawEditMap();
	paintTool.updateCanvas();
	updateRoomPaletteSelect();
	paintExplorer.Refresh( paintTool.drawing.type, true /*doKeepOldThumbnails*/ );

	if (drawing.type === TileType.Tile)
		updateWallCheckboxOnCurrentTile();

	updateRoomName();
}

function prevRoom() {
	var ids = sortedRoomIdList();
	roomIndex--;
	if (roomIndex < 0) roomIndex = (ids.length-1);
	curRoom = ids[roomIndex];
	markerTool.SetRoom(curRoom);
	roomTool.drawEditMap();
	paintTool.updateCanvas();
	updateRoomPaletteSelect();
	paintExplorer.Refresh( paintTool.drawing.type, true /*doKeepOldThumbnails*/ );

	if (drawing.type === TileType.Tile)
		updateWallCheckboxOnCurrentTile();

	updateRoomName();
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

	var duplicateExits = [];
	for (i in roomToCopy.exits) {
		var exit = roomToCopy.exits[i];
		duplicateExits.push( duplicateExit( exit ) );
	}

	room[newRoomId] = {
		id : newRoomId,
		tilemap : duplicateTilemap,
		walls : roomToCopy.walls.slice(0),
		exits : duplicateExits,
		endings : roomToCopy.endings.slice(0),
		pal : roomToCopy.pal,
		items : []
	};
	refreshGameData();

	curRoom = newRoomId;
	//console.log(curRoom);
	roomTool.drawEditMap();
	paintTool.updateCanvas();
	updateRoomPaletteSelect();

	updateRoomName();

	// add new exit destination option to exits panel
	var select = document.getElementById("exitDestinationSelect");
	var option = document.createElement("option");
	var roomLabel = localization.GetStringOrFallback("room_label", "room");
	option.text = roomLabel + " " + newRoomId;
	option.value = newRoomId;
	select.add(option);
}

function duplicateExit(exit) {
	var newExit = {
		x : exit.x,
		y : exit.y,
		dest : {
			room : exit.dest.room,
			x : exit.dest.x,
			y : exit.dest.y
		}
	}
	return newExit;
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
		endings : [],
		effects : [],
		pal : "0",
		items : []
	};
	refreshGameData();

	curRoom = roomId;
	//console.log(curRoom);
	markerTool.SetRoom(curRoom);
	roomTool.drawEditMap();
	paintTool.updateCanvas();
	updateRoomPaletteSelect();

	updateRoomName();

	// add new exit destination option to exits panel
	// var select = document.getElementById("exitDestinationSelect");
	// var option = document.createElement("option");
	// var roomLabel = localization.GetStringOrFallback("room_label", "room");
	// option.text = roomLabel + " " + roomId;
	// option.value = roomId;
	// select.add(option);
}

function deleteRoom() {
	if ( Object.keys(room).length <= 1 ) {
		alert("You can't delete your only room!");
	}
	else if ( confirm("Are you sure you want to delete this room? You can't get it back.") ) {
		var roomId = sortedRoomIdList()[roomIndex];

		// delete exits in _other_ rooms that go to this room
		for( r in room )
		{
			if( r != roomId) {
				for( i in room[r].exits )
				{
					if( room[r].exits[i].dest.room === roomId )
					{
						room[r].exits.splice( i, 1 );
					}
				}
			}
		}

		delete room[roomId];

		refreshGameData();
		nextRoom();
		roomTool.drawEditMap();
		paintTool.updateCanvas();
		updateRoomPaletteSelect();
		// updateExitOptionsFromGameData();
		//recreate exit options
	}
}

function nextItem() {
	var ids = sortedItemIdList();
	itemIndex = (itemIndex + 1) % ids.length;
	drawing.id = ids[itemIndex];
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function prevItem() {
	var ids = sortedItemIdList();
	itemIndex = (itemIndex - 1) % ids.length;
	if (itemIndex < 0) itemIndex = (ids.length-1); // loop
	drawing.id = ids[itemIndex];
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function nextSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex + 1) % ids.length;
	if (spriteIndex === 0) spriteIndex = 1; //skip avatar
	drawing.id = ids[spriteIndex];
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function prevSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex - 1) % ids.length;
	if (spriteIndex <= 0) spriteIndex = (ids.length-1); //loop and skip avatar
	drawing.id = ids[spriteIndex];
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function next() {
	if (drawing.type == TileType.Tile) {
		nextTile();
	}
	else if( drawing.type == TileType.Avatar || drawing.type == TileType.Sprite ) {
		nextSprite();
	}
	else if( drawing.type == TileType.Item ) {
		nextItem();
	}
	paintExplorer.ChangeSelection( drawing.id );
}

function prev() {
	if (drawing.type == TileType.Tile) {
		prevTile();
	}
	else if( drawing.type == TileType.Avatar || drawing.type == TileType.Sprite ) {
		prevSprite();
	}
	else if( drawing.type == TileType.Item ) {
		prevItem();
	}
	paintExplorer.ChangeSelection( drawing.id );
}

function duplicateDrawing() {
	if (drawing.type == TileType.Tile) {

		//copy drawing data
		var sourceImageData = renderer.GetImageSource( "TIL_" + drawing.id );
		var copiedImageData = [];
		for (f in sourceImageData) {
			copiedImageData.push([]);
			for (y in sourceImageData[f]) {
				copiedImageData[f].push([]);
				for (x in sourceImageData[f][y]) {
					copiedImageData[f][y].push( sourceImageData[f][y][x] );
				}
			}
		}

		var tmpIsWall = tile[ drawing.id ].isWall;

		drawing.id = nextTileId();

		console.log("DUPLICATE TILE");		
		console.log(drawing.id);
		console.log(copiedImageData);

		makeTile( drawing.id, copiedImageData );

		tile[ drawing.id ].isWall = tmpIsWall;

		paintTool.updateCanvas();
		refreshGameData();

		tileIndex = Object.keys(tile).length - 1;

		paintTool.reloadDrawing(); //hack for ui consistency
	}
	else if(drawing.type == TileType.Avatar || drawing.type == TileType.Sprite) {

		//copy drawing data -- hacky duplication as usual between sprite and tile :(
		var sourceImageData = renderer.GetImageSource( "SPR_" + drawing.id );
		var copiedImageData = [];
		for (f in sourceImageData) {
			copiedImageData.push([]);
			for (y in sourceImageData[f]) {
				copiedImageData[f].push([]);
				for (x in sourceImageData[f][y]) {
					copiedImageData[f][y].push( sourceImageData[f][y][x] );
				}
			}
		}

		drawing.id = nextSpriteId();

		console.log("DUPLICATE SPRITE");	
		console.log(drawing.id);
		console.log(copiedImageData);

		makeSprite( drawing.id, copiedImageData );

		paintTool.updateCanvas();
		refreshGameData();

		spriteIndex = Object.keys(sprite).length - 1;

		paintTool.reloadDrawing(); //hack
	}
	else if(drawing.type == TileType.Item) {

		//copy drawing data -- hacky duplication as usual between sprite and tile :(
		var sourceImageData = renderer.GetImageSource( "ITM_" + drawing.id );
		var copiedImageData = [];
		for (f in sourceImageData) {
			copiedImageData.push([]);
			for (y in sourceImageData[f]) {
				copiedImageData[f].push([]);
				for (x in sourceImageData[f][y]) {
					copiedImageData[f][y].push( sourceImageData[f][y][x] );
				}
			}
		}

		drawing.id = nextItemId();

		console.log("DUPLICATE ITEM");	
		console.log(drawing.id);
		console.log(copiedImageData);

		makeItem( drawing.id, copiedImageData );

		paintTool.updateCanvas();
		refreshGameData();

		itemIndex = Object.keys(item).length - 1;

		paintTool.reloadDrawing(); //hack
		updateInventoryItemUI();
	}
	paintExplorer.AddThumbnail( drawing.id );
	paintExplorer.ChangeSelection( drawing.id );
}

function removeAllItems( id ) {
	function getFirstItemIndex(roomId, itemId) {
		for(var i = 0; i < room[roomId].items.length; i++) {
			if(room[roomId].items[i].id === itemId)
				return i;
		}
		return -1;
	}

	for(roomId in room) {
		var i = getFirstItemIndex(roomId, id );
		while(i > -1) {
			room[roomId].items.splice(i,1);
			i = getFirstItemIndex(roomId, id );
		}
	}
}

function updateAnimationUI() {
	//todo
}

function reloadTile() {
	// animation UI
	if ( tile[drawing.id] && tile[drawing.id].animation.isAnimated ) {
		paintTool.isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;

		if( paintTool.curDrawingFrameIndex == 0)
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left selected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right unselected";
		}
		else if( paintTool.curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left unselected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		renderAnimationPreview( drawing.id );
	}
	else {
		paintTool.isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}

	// wall UI
	updateWallCheckboxOnCurrentTile();

	updateDrawingNameUI(true);

	paintTool.updateCanvas();
}

function updateWallCheckboxOnCurrentTile() {
	var isCurTileWall = false;

	if( tile[ drawing.id ].isWall == undefined || tile[ drawing.id ].isWall == null ) {
		if (room[curRoom]) {
			isCurTileWall = (room[curRoom].walls.indexOf(drawing.id) != -1);
		}
	}
	else {
		isCurTileWall = tile[ drawing.id ].isWall;
	}

	if (isCurTileWall) {
		document.getElementById("wallCheckbox").checked = true;
		document.getElementById("wallCheckboxIcon").innerHTML = "border_outer";
	}
	else {
		document.getElementById("wallCheckbox").checked = false;
		document.getElementById("wallCheckboxIcon").innerHTML = "border_clear";
	}
}

// TODO : better name?
function reloadAdvDialogUI() {
	// var dialogId = getCurDialogId(); // necessary?
	if( drawing.type === TileType.Sprite || drawing.type === TileType.Item ) {

		document.getElementById("dialogEditorHasContent").style.display = "block";
		document.getElementById("dialogEditorNoContent").style.display = "none";

		var dialogStr = document.getElementById("dialogText").value;
		document.getElementById("dialogCodeText").value = dialogStr;
		var scriptTree = scriptInterpreter.Parse( dialogStr );
		console.log("~~~~ RELOAD ADV DIALOG UI ~~~~~");
		console.log(scriptTree);
		createAdvDialogEditor(scriptTree);
		previewDialogScriptTree = scriptTree;
	}
	else {
		document.getElementById("dialogEditorHasContent").style.display = "none";
		document.getElementById("dialogEditorNoContent").style.display = "block";
	}
}

function reloadSprite() {
	// animation UI
	if ( sprite[drawing.id] && sprite[drawing.id].animation.isAnimated ) {
		paintTool.isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;

		if( paintTool.curDrawingFrameIndex == 0)
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left selected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right unselected";
		}
		else if( paintTool.curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left unselected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		renderAnimationPreview( drawing.id );
	}
	else {
		paintTool.isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}

	// dialog UI
	reloadDialogUI()

	updateDrawingNameUI( drawing.id != "A" );

	// update paint canvas
	paintTool.updateCanvas();

}

// TODO consolidate these drawing related methods
function reloadItem() {
	// animation UI
	if ( item[drawing.id] && item[drawing.id].animation.isAnimated ) {
		paintTool.isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;

		if( paintTool.curDrawingFrameIndex == 0)
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left selected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right unselected";
		}
		else if( paintTool.curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left unselected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		renderAnimationPreview( drawing.id );
	}
	else {
		paintTool.isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}

	// dialog UI
	reloadDialogUI()

	updateDrawingNameUI(true);

	// update paint canvas
	paintTool.updateCanvas();

}

function deleteDrawing() {
	paintTool.deleteDrawing();
}

function toggleToolBar(e) {
	if( e.target.checked ) {
		document.getElementById("toolsPanel").style.display = "flex";
		document.getElementById("toolsCheckIcon").innerHTML = "expand_more";
	}
	else {
		document.getElementById("toolsPanel").style.display = "none";
		document.getElementById("toolsCheckIcon").innerHTML = "expand_less";
	}
}

function toggleRoomTools(e) {
	toggleRoomToolsCore( e.target.checked );
}

function toggleRoomToolsCore(visible) {
	if( visible ) {
		document.getElementById("roomTools").style.display = "block";
		document.getElementById("roomToolsCheck").checked = true;
		document.getElementById("roomToolsCheckIcon").innerHTML = "expand_more";
	}
	else {
		document.getElementById("roomTools").style.display = "none";
		document.getElementById("roomToolsCheck").checked = false;
		document.getElementById("roomToolsCheckIcon").innerHTML = "expand_less";
	}
}

function togglePaletteTools(e) {
	togglePaletteToolsCore( e.target.checked );
}

function togglePaletteToolsCore(visible) {
	if( visible ) {
		document.getElementById("paletteTools").style.display = "block";
		document.getElementById("paletteToolsCheckIcon").innerHTML = "expand_more";
	}
	else {
		document.getElementById("paletteTools").style.display = "none";
		document.getElementById("paletteToolsCheckIcon").innerHTML = "expand_less";
	}
}

function toggleDownloadOptions(e) {
	if( e.target.checked ) {
		document.getElementById("downloadOptions").style.display = "block";
		document.getElementById("downloadOptionsCheckIcon").innerHTML = "expand_more";
	}
	else {
		document.getElementById("downloadOptions").style.display = "none";
		document.getElementById("downloadOptionsCheckIcon").innerHTML = "expand_less";
	}
}

function on_edit_mode() {
	isPlayMode = false;
	stopGame();
	// TODO I should really do more to separate the editor's game-data from the engine's game-data
	parseWorld(document.getElementById("game_data").value); //reparse world to account for any changes during gameplay
	curRoom = sortedRoomIdList()[roomIndex]; //restore current room to pre-play state
	roomTool.drawEditMap();

	roomTool.listenEditEvents();

	markerTool.Refresh();

	updateInventoryUI();

	if(isPreviewDialogMode) {
		isPreviewDialogMode = false;
		updatePreviewDialogButton();

		for(var i = 0; i < advDialogUIComponents.length; i++) {
			advDialogUIComponents[i].GetEl().classList.remove("highlighted");
		}
	}
	document.getElementById("previewDialogCheck").disabled = false;
}

// hacky - part of hiding font data from the game data
function getFullGameData() {
	// return document.getElementById("game_data").value + fontManager.GetData(fontName);
	return serializeWorld();
}

function on_play_mode() {
	isPlayMode = true;

	roomTool.unlistenEditEvents();

	// load_game(document.getElementById("game_data").value, !isPreviewDialogMode /* startWithTitle */);
	load_game(getFullGameData(), !isPreviewDialogMode /* startWithTitle */);

	console.log("PLAY!! ~~ PREVIEW ? " + isPreviewDialogMode);
	if(!isPreviewDialogMode) {
		console.log("DISALBE PREVIEW!!!");
		document.getElementById("previewDialogCheck").disabled = true;
	}
}

function updatePlayModeButton() {
	document.getElementById("playModeCheck").checked = isPlayMode;
	document.getElementById("playModeIcon").innerHTML = isPlayMode ? "stop" : "play_arrow";

	var stopText = localization.GetStringOrFallback("stop_game", "stop");
	var playText = localization.GetStringOrFallback("play_game", "play");
	document.getElementById("playModeText").innerHTML = isPlayMode ? stopText : playText;
}

function updatePreviewDialogButton() {
	document.getElementById("previewDialogCheck").checked = isPreviewDialogMode;
	document.getElementById("previewDialogIcon").innerHTML = isPreviewDialogMode ? "stop" : "play_arrow";

	var stopText = localization.GetStringOrFallback("stop_game", "stop");
	var previewText = localization.GetStringOrFallback("dialog_start_preview", "preview");
	document.getElementById("previewDialogText").innerHTML = isPreviewDialogMode ? stopText : previewText;
}

function togglePaintGrid(e) {
	paintTool.drawPaintGrid = e.target.checked;
	document.getElementById("paintGridIcon").innerHTML = paintTool.drawPaintGrid ? "visibility" : "visibility_off";
	paintTool.updateCanvas();
}

function toggleMapGrid(e) {
	roomTool.drawMapGrid = e.target.checked;
	document.getElementById("roomGridIcon").innerHTML = roomTool.drawMapGrid ? "visibility" : "visibility_off";
	roomTool.drawEditMap();
}

function toggleCollisionMap(e) {
	roomTool.drawCollisionMap = e.target.checked;
	document.getElementById("roomWallsIcon").innerHTML = roomTool.drawCollisionMap ? "visibility" : "visibility_off";
	roomTool.drawEditMap();
}

var showFontDataInGameData = false;
function toggleFontDataVisibility(e) {
	showFontDataInGameData = e.target.checked;
	document.getElementById("fontDataIcon").innerHTML = e.target.checked ? "visibility" : "visibility_off";
	refreshGameData(); // maybe a bit expensive
}

/* PALETTE STUFF */
function updatePaletteUI() {
	// document.getElementById("paletteId").innerHTML = selectedColorPal();

	// NOTE: TURNING ON THIS BLOCK BREAKS THINGS - CAN I DELETE IT????
	// if ( Object.keys(palette).length > 1 ) {
	// 	document.getElementById("paletteIdContainer").style.display = "block";
	// 	document.getElementById("paletteNav").style.display = "block";
	// }
	// else {
	// 	document.getElementById("paletteIdContainer").style.display = "none";
	// 	document.getElementById("paletteNav").style.display = "none";
	// }

	var palettePlaceholderName = localization.GetStringOrFallback("palette_label", "palette");
	document.getElementById("paletteName").placeholder = palettePlaceholderName + " " + selectedColorPal();
	var name = palette[ selectedColorPal() ].name;
	if( name )
		document.getElementById("paletteName").value = name;
	else
		document.getElementById("paletteName").value = "";


	updatePaletteOptionsFromGameData();
	updatePaletteControlsFromGameData();
}

function updateRoomPaletteSelect() {
	var palOptions = document.getElementById("roomPaletteSelect").options;
	for (i in palOptions) {
		var o = palOptions[i];
		// console.log(o);
		if (o.value === curPal()) {
			o.selected = true;
		}
	}
}

var colorPicker = null; // new color picker
var paletteTool = null;
var paintExplorer = null;

function changeColorPickerIndex(index) {
	paletteTool.changeColorPickerIndex(index);
}

function onPaletteChange() {
	refreshGameData();

	renderer.SetPalettes(palette);

	paintTool.updateCanvas();
	markerTool.SetRoom(curRoom);
	roomTool.drawEditMap();
	paintExplorer.Refresh( paintTool.drawing.type, true /*doKeepOldThumbnails*/ );
	if( paintTool.isCurDrawingAnimated )
		renderAnimationPreview( drawing.id );
}

function updatePaletteOptionsFromGameData() {
	var select = document.getElementById("roomPaletteSelect");

	// first, remove all current options
	var i;
	for(i = select.options.length - 1 ; i >= 0 ; i--) {
		select.remove(i);
	}

	// then, add an option for each room
	var paletteLabel = localization.GetStringOrFallback("palette_label", "palette");
	for (palId in palette) {
		var option = document.createElement("option");
		option.text = palette[palId].name ? palette[palId].name : paletteLabel + " " + palId;
		option.value = palId;
		option.selected = ( palId === room[ curRoom ].pal );
		select.add(option);
	}
}

function updatePaletteControlsFromGameData() {
	// document.getElementById("backgroundColor").value = rgbToHex(getPal(selectedColorPal())[0][0], getPal(selectedColorPal())[0][1], getPal(selectedColorPal())[0][2]);
	// document.getElementById("tileColor").value = rgbToHex(getPal(selectedColorPal())[1][0], getPal(selectedColorPal())[1][1], getPal(selectedColorPal())[1][2]);
	// document.getElementById("spriteColor").value = rgbToHex(getPal(selectedColorPal())[2][0], getPal(selectedColorPal())[2][1], getPal(selectedColorPal())[2][2]);

	if( colorPicker != null )
		paletteTool.updateColorPickerUI();
}

function prevPalette() {
	// update index
	Ed().paletteIndex = (Ed().paletteIndex - 1);
	if (Ed().paletteIndex < 0) Ed().paletteIndex = Object.keys(palette).length - 1;

	// change the UI
	updatePaletteUI();
}

function nextPalette() {
	// update index
	Ed().paletteIndex = (Ed().paletteIndex + 1);
	if (Ed().paletteIndex >= Object.keys(palette).length) Ed().paletteIndex = 0;

	// change the UI
	updatePaletteUI();
}

function newPalette() {
	// create new palette and save the data
	var id = nextPaletteId();
	palette[ id ] = {
		name : null,
		colors : [
		[255,255,255],
		[255,255,255],
		[255,255,255] ]
	};
	refreshGameData();

	// change the UI
	Ed().paletteIndex = Object.keys(palette).length - 1;
	updatePaletteUI();
}

function roomPaletteChange(event) {
	var palId = event.target.value;
	room[curRoom].pal = palId;
	refreshGameData();
	markerTool.SetRoom(curRoom);
	roomTool.drawEditMap();
	paintTool.updateCanvas();
	paintExplorer.Refresh( paintTool.drawing.type, true /*doKeepOldThumbnails*/ );
}

function updateDrawingNameUI(visible) {
	document.getElementById("drawingNameUI").setAttribute("style", visible ? "display:initial;" : "display:none;");
	var obj = paintTool.getCurObject();
	console.log("update drawing name ui");
	console.log(obj);
	if( obj.name != null )
		document.getElementById("drawingName").value = obj.name;
	else
		document.getElementById("drawingName").value = "";
	document.getElementById("drawingName").placeholder = getCurPaintModeStr() + " " + drawing.id;
}

function on_paint_avatar() {
	drawing.type = TileType.Avatar;
	drawing.id = "A";
	paintTool.reloadDrawing();
	if(paintExplorer != null) { 
		paintExplorer.Refresh( paintTool.drawing.type );
		paintExplorer.ChangeSelection( paintTool.drawing.id );
	}

	on_paint_avatar_ui_update();
}

function on_paint_avatar_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:none;");
	document.getElementById("paintCommands").setAttribute("style","display:none;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(false);
	//document.getElementById("animation").setAttribute("style","display:none;");
	document.getElementById("paintOptionAvatar").checked = true;
	document.getElementById("paintExplorerOptionAvatar").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:none;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
}

function on_paint_tile() {
	drawing.type = TileType.Tile;
	tileIndex = 0;
	drawing.id = sortedTileIdList()[tileIndex];
	paintTool.reloadDrawing();
	paintExplorer.Refresh( paintTool.drawing.type );
	paintExplorer.ChangeSelection( paintTool.drawing.id );

	on_paint_tile_ui_update();
}

function on_paint_tile_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:block;");
	document.getElementById("paintNav").setAttribute("style","display:inline-block;");
	document.getElementById("paintCommands").setAttribute("style","display:inline-block;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	document.getElementById("paintOptionTile").checked = true;
	document.getElementById("paintExplorerOptionTile").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
}

function on_paint_sprite() {
	drawing.type = TileType.Sprite;
	if (sortedSpriteIdList().length > 1)
	{
		spriteIndex = 1;
	}
	else {
		spriteIndex = 0; //fall back to avatar if no other sprites exist
	}
	drawing.id = sortedSpriteIdList()[spriteIndex];
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
	paintExplorer.Refresh( paintTool.drawing.type );
	paintExplorer.ChangeSelection( paintTool.drawing.id );

	on_paint_sprite_ui_update();
}

function on_paint_sprite_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:inline-block;");
	document.getElementById("paintCommands").setAttribute("style","display:inline-block;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	document.getElementById("paintOptionSprite").checked = true;
	document.getElementById("paintExplorerOptionSprite").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
}

function on_paint_item() {
	console.log("PAINT ITEM");
	drawing.type = TileType.Item;
	itemIndex = 0;
	drawing.id = sortedItemIdList()[itemIndex];
	console.log(drawing.id);
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
	paintExplorer.Refresh( paintTool.drawing.type );
	paintExplorer.ChangeSelection( paintTool.drawing.id );

	on_paint_item_ui_update();
}

function on_paint_item_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:inline-block;");
	document.getElementById("paintCommands").setAttribute("style","display:inline-block;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	document.getElementById("paintOptionItem").checked = true;
	document.getElementById("paintExplorerOptionItem").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
}

function paintExplorerFilterChange( e ) {
	console.log("paint explorer filter : " + e.target.value);
	paintExplorer.Refresh( paintTool.drawing.type, true, e.target.value );
}

// ok to split up per-app functionality this way?
function editDrawingAtCoordinate(x,y) {
	// if(self.paintTool === null || self.paintExplorer === null)
	// 	return;

	// console.log("!!!");

	console.log("ALT " + x + " " + y);

	var spriteId = getSpriteAt(x,y); // todo: need more consistency with these methods
	console.log(spriteId);
	if(spriteId) {
		if(spriteId === "A")
			on_paint_avatar_ui_update();
		else
			on_paint_sprite_ui_update();

		var drawing = new DrawingId( spriteId === "A" ? TileType.Avatar : TileType.Sprite, spriteId );
		paintTool.selectDrawing( drawing );
		paintExplorer.RefreshAndChangeSelection( drawing );
		return;
	}

	var item = getItem(curRoom,x,y);
	console.log(item);
	if(item) {
		on_paint_item_ui_update();
		var drawing = new DrawingId( TileType.Item, item.id );
		paintTool.selectDrawing( drawing );
		paintExplorer.RefreshAndChangeSelection( drawing );
		return;
	}

	var tileId = getTile(x,y);
	console.log(tileId);
	if(tileId != 0) {
		on_paint_tile_ui_update(); // really wasteful probably
		var drawing = new DrawingId( TileType.Tile, tileId );
		paintTool.selectDrawing( drawing );
		paintExplorer.RefreshAndChangeSelection( drawing );
		return;
	}
}

var animationThumbnailRenderer = new ThumbnailRenderer();
function renderAnimationThumbnail(imgId,id,frameIndex) {
	var drawingId = new DrawingId(drawing.type,id); // HACK!!! - need consistency on how type + id should be coupled
	animationThumbnailRenderer.Render(imgId,drawingId,frameIndex);
}

function renderAnimationPreview(id) {
	// console.log("RENDRE ANIM PREVIW");
	renderAnimationThumbnail( "animationThumbnailPreview", id );
	renderAnimationThumbnail( "animationThumbnailFrame1", id, 0 );
	renderAnimationThumbnail( "animationThumbnailFrame2", id, 1 );
}

function selectPaint() {
	if(drawing.id === this.value && document.getElementById("paintPanel").style.display === "none") {
		togglePanelCore("paintPanel", true /*visible*/); // animate?
	}

	drawing.id = this.value;
	if( drawing.type === TileType.Tile ) {
		tileIndex = sortedTileIdList().indexOf( drawing.id );
		paintTool.reloadDrawing();
	}
	else if( drawing.type === TileType.Item ) {
		itemIndex = sortedItemIdList().indexOf( drawing.id );
		paintTool.reloadDrawing();
	}
	else {
		spriteIndex = sortedSpriteIdList().indexOf( drawing.id );
		paintTool.reloadDrawing();
	}
}

function getCurPaintModeStr() {
	if(drawing.type == TileType.Sprite || drawing.type == TileType.Avatar) {
		return localization.GetStringOrFallback("sprite_label", "sprite");
	}
	else if(drawing.type == TileType.Item) {
		return localization.GetStringOrFallback("item_label", "item");
	}
	else if(drawing.type == TileType.Tile) {
		return localization.GetStringOrFallback("tile_label", "tile");
	}
}

function on_change_adv_dialog() {
	document.getElementById("dialogText").value = document.getElementById("dialogCodeText").value;
	on_change_dialog();
}

function on_game_data_change() {
	on_game_data_change_core();

	refreshGameData();

	// ui stuff
	markerTool.Refresh(); // wow I hope this doesn't cause bugs
	updateRoomName();
	refreshGameData();
}

function convertGameDataToCurVersion(importVersion) {
	if (importVersion < 5.0) {
		console.log("version under 5!!!!");

		var PrintFunctionVisitor = function() {
			var didChange = false;
			this.DidChange = function() { return didChange; };

			this.Visit = function(node) {
				if ( node.type != "function" )
					return;

				// console.log("VISIT " + node.name);

				if ( node.name === "say" ) {
					node.name = "print";
					didChange = true;
				}
			};
		};

		for(dlgId in dialog) {
			var dialogScript = scriptInterpreter.Parse( dialog[dlgId] );
			var visitor = new PrintFunctionVisitor();
			dialogScript.VisitAll( visitor );
			if( visitor.DidChange() ) {
				var newDialog = dialogScript.Serialize();
				if(newDialog.indexOf("\n") > -1) {
					newDialog = '"""\n' + newDialog + '\n"""';
				}
				dialog[dlgId] = newDialog;
			}
		}

		{
			var titleScript = scriptInterpreter.Parse( title );
			var visitor = new PrintFunctionVisitor();
			titleScript.VisitAll( visitor );
			if( visitor.DidChange() ) {
				title = titleScript.Serialize();
			}
		}
	}
}

function on_game_data_change_core() {
	clearGameData();
	var version = parseWorld(document.getElementById("game_data").value); //reparse world if user directly manipulates game data

	convertGameDataToCurVersion(version);

	var curPaintMode = drawing.type; //save current paint mode (hacky)

	//fallback if there are no tiles, sprites, map
	// TODO : switch to using stored default file data (requires separated parser / game data code)
	if (Object.keys(sprite).length == 0) {
		drawing.type = TileType.Avatar;
		drawing.id = "A";
		makeSprite(drawing.id);
		sprite["A"].room = null;
		sprite["A"].x = -1;
		sprite["A"].y = -1;
	}
	if (Object.keys(tile).length == 0) {
		drawing.type = TileType.Tile;
		drawing.id = "a";
		makeTile(drawing.id);
	}
	if (Object.keys(room).length == 0) {
		room["0"] = {
			id : "0",
			tilemap : [
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],
					["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]
				],
			walls : [],
			exits : [],
			pal : "0"
		};
	}
	if (Object.keys(item).length == 0) {
		drawing.type = TileType.Item;
		drawing.id = "0";
		makeItem( drawing.id );
	}

	// TODO RENDERER : refresh images

	roomTool.drawEditMap();

	drawing.type = curPaintMode;
	if ( drawing.type == TileType.Tile ) {
		drawing.id = sortedTileIdList()[0];
		paintTool.reloadDrawing();
	}
	else if( drawing.type === TileType.Item ) {
		drawing.id = sortedItemIdList()[0];
		paintTool.reloadDrawing();
	}
	else {
		drawing.id = sortedSpriteIdList()[0];
		paintTool.reloadDrawing();
	}

	// if user pasted in a custom font into game data - update the stored custom font
	if (areAllFontsLoaded && !editorFontManager.ContainsResource(fontName + editorFontManager.GetExtension())) {
		var fontStorage = {
			name : fontName,
			fontdata : fontManager.GetData(fontName)
		};
		localStorage.custom_font = JSON.stringify(fontStorage);
		editorFontManager.AddResource(fontName + editorFontManager.GetExtension(), fontManager.GetData(fontName));
	}

	updatePaletteUI();

	updateInventoryUI();

	updateFontSelectUI();

	markerTool.SetRoom(curRoom);

	document.getElementById("titleText").value = title;
}

function updateFontSelectUI() {
	var fontStorage = null;
	if (localStorage.custom_font != null) {
		fontStorage = JSON.parse(localStorage.custom_font);
	}

	var fontSelect = document.getElementById("fontSelect");

	for (var i in fontSelect.options) {
		var fontOption = fontSelect.options[i];
		var fontOptionName = (fontOption.value === "custom" && fontStorage != null) ? fontStorage.name : fontOption.value;
		fontOption.selected = fontOptionName === fontName;

		if (fontOption.value === "custom" && fontStorage != null) {
			var textSplit = fontOption.text.split("-");
			fontOption.text = textSplit[0] + "- " + fontStorage.name;
		}
	}

	updateFontDescriptionUI();
	updateTextDirectionSelectUI(); // a bit hacky but probably ok?
	updateEditorTextDirection(textDirection); // EXTREMELY hack :(
}

function updateFontDescriptionUI() {
	for (var i in fontSelect.options) {
		var fontOption = fontSelect.options[i];
		var fontDescriptionId = fontOption.value + "_description";
		// console.log(fontDescriptionId);
		var fontDescription = document.getElementById(fontDescriptionId);
		if (fontDescription != null) {
			fontDescription.style.display = fontOption.selected ? "block" : "none";
		}
	}
}

function updateExitOptionsFromGameData() {
	// TODO ???
}

function on_toggle_wall(e) {
	paintTool.toggleWall( e.target.checked );
}

function toggleWallUI(checked) {
	document.getElementById("wallCheckboxIcon").innerHTML = checked ? "border_outer" : "border_clear";
}

function filenameFromGameTitle() {
	var filename = title.replace(/[^a-zA-Z]/g, "_"); // replace non alphabet characters
	filename = filename.toLowerCase();
	filename = filename.substring(0,32); // keep it from getting too long
	return filename;
}

function exportGame() {
	refreshGameData(); //just in case
	// var gameData = document.getElementById("game_data").value; //grab game data
	var gameData = getFullGameData();
	var size = document.getElementById("exportSizeFixedInput").value;
	exporter.exportGame( gameData, title, export_settings.page_color, filenameFromGameTitle() + ".html", isFixedSize, size ); //download as html file
}

function exportGameData() {
	refreshGameData(); //just in case
	// var gameData = document.getElementById("game_data").value; //grab game data
	var gameData = getFullGameData();
	ExporterUtils.DownloadFile( filenameFromGameTitle() + ".bitsy", gameData );
}

function exportFont() {
	var fontData = editorFontManager.GetData(fontName);
	ExporterUtils.DownloadFile( fontName + ".bitsyfont", fontData );
}

function hideAbout() {
	document.getElementById("aboutPanel").setAttribute("style","display:none;");
}

function toggleInstructions(e) {
	var div = document.getElementById("instructions");
	if (e.target.checked) {
		div.style.display = "block";
	}
	else {
		div.style.display = "none";
	}
	document.getElementById("instructionsCheckIcon").innerHTML = e.target.checked ? "expand_more" : "expand_less";
}

//todo abstract this function into toggleDiv
function toggleVersionNotes(e) {
	var div = document.getElementById("versionNotes");
	if (e.target.checked) {
		div.style.display = "block";
	}
	else {
		div.style.display = "none";
	}
	document.getElementById("versionNotesCheckIcon").innerHTML = e.target.checked ? "expand_more" : "expand_less";
}

/* MARKERS (exits & endings) */
var markerTool;

function newExit() {
	markerTool.AddExit();
	roomTool.drawEditMap();
}

function newEnding() {
	markerTool.AddEnding();
	roomTool.drawEditMap();
}

function newEffect() {
	markerTool.AddEffect();
	roomTool.drawEditMap();
}

function deleteMarker() {
	markerTool.RemoveMarker();
	roomTool.drawEditMap();
}

function prevMarker() {
	markerTool.NextMarker();
	roomTool.drawEditMap();
}

function nextMarker() {
	markerTool.PrevMarker();
	roomTool.drawEditMap();
}

function toggleMoveMarker1(e) {
	markerTool.TogglePlacingFirstMarker(e.target.checked);
}

function cancelMoveMarker1() {
	markerTool.TogglePlacingFirstMarker(false);
}

function selectMarkerRoom1() {
	markerTool.SelectMarkerRoom1();
}

function toggleMoveMarker2(e) {
	markerTool.TogglePlacingSecondMarker(e.target.checked);
}

function cancelMoveMarker2() {
	markerTool.TogglePlacingSecondMarker(false);
}

function selectMarkerRoom2() {
	markerTool.SelectMarkerRoom2();
}

function changeExitDirection() {
	markerTool.ChangeExitLink();
	roomTool.drawEditMap();
}

function onEndingTextChange(event) {
	markerTool.ChangeEndingText(event.target.value);
}

function onEffectTextChange(event) {
	markerTool.ChangeEffectText(event.target.value);
}

function showMarkers() {
	toggleRoomMarkers(true);
}

function hideMarkers() {
	toggleRoomMarkers(false);
}

function toggleRoomMarkers(visible) {
	if (visible) {
		markerTool.Refresh();
	}
	roomTool.areMarkersVisible = visible;
	roomTool.drawEditMap();
	document.getElementById("roomMarkersCheck").checked = visible;
	document.getElementById("roomMarkersIcon").innerHTML = visible ? "visibility" : "visibility_off";
}

function onToggleExitOptions() {
	markerTool.SetExitOptionsVisibility(document.getElementById("showExitOptionsCheck").checked);
}

function onChangeExitOptionsSelect(exitSelectId) {
	markerTool.UpdateExitOptions(exitSelectId);
}

function onChangeExitTransitionEffect(effectId) {
	markerTool.ChangeExitTransitionEffect(effectId);
}

// TODO : put helper method somewhere more.. helpful
function setElementClass(elementId, classId, addClass) {
	var el = document.getElementById(elementId);
	if (addClass) {
		el.classList.add(classId);
	}
	else {
		el.classList.remove(classId);
	}
	console.log(el.classList);
}

function togglePanelAnimated(e) {
	var panel = document.getElementById(e.target.value);
	if (e.target.checked) {
		togglePanel(e);
		panel.classList.add("drop");
		setTimeout( function() { panel.classList.remove("drop"); }, 300 );
	}
	else {
		panel.classList.add("close");
		setTimeout(
			function() {
				togglePanel(e);
				panel.classList.remove("close");
			},
			400
		);
	}
}

function togglePanel(e) {
	togglePanelCore( e.target.value, e.target.checked );
}

function showPanel(id) {
	togglePanelCore( id, true /*visible*/ );
}

function hidePanel(id) {
	// animate panel and tools button
	document.getElementById(id).classList.add("close");
	document.getElementById("toolsCheckLabel").classList.add("flash");

	setTimeout(
		function() {
			// close panel after animations
			togglePanelCore( id, false /*visible*/ );

			// reset animations
			document.getElementById(id).classList.remove("close");
			document.getElementById("toolsCheckLabel").classList.remove("flash");
		},
		400
	);
}

function togglePanelCore(id,visible,doUpdatePrefs=true) {
	//hide/show panel
	togglePanelUI( id, visible );
	//any side effects
	afterTogglePanel( id, visible );
	//save panel preferences
	// savePanelPref( id, visible );
	if(doUpdatePrefs) {
		updatePanelPrefs();
	}
}

function togglePanelUI(id,visible) {
	// move panel to the left of the left-most visible panel
	if( visible ) {
		var editorContent = document.getElementById("editorContent");
		var otherCards = Array.prototype.slice.call( editorContent.getElementsByClassName("panel") );
		console.log(otherCards.length);
		otherCards = otherCards.filter(
						function(card) {
							var pos = getElementPosition( card );
							return card.style.display != "none" && pos.x >= 0;
						});
		otherCards = otherCards.sort(
						function(card1,card2) {
							return getElementPosition( card1 ).x - getElementPosition( card2 ).x;
						});
		editorContent.insertBefore( document.getElementById(id), otherCards[0] );
	}
	// update panel
	document.getElementById(id).style.display = visible ? "inline-block" : "none";
	// update checkbox
	if (id != "toolsPanel")
		document.getElementById(id.replace("Panel","Check")).checked = visible;
}

function afterTogglePanel(id,visible) {
	if (visible) {
		afterShowPanel(id);
	}
	else {
		afterHidePanel(id);
	}
}

function afterShowPanel(id) {
	if (id === "exitsPanel") {
		showMarkers();
	}
}

function afterHidePanel(id) {
	if (id === "exitsPanel") {
		hideMarkers();
	}
}

// DEPRECATED
function savePanelPref(id,visible) {
	var prefs = localStorage.panel_prefs == null ? {} : JSON.parse( localStorage.panel_prefs );
	prefs[id] = visible;
	localStorage.setItem( "panel_prefs", JSON.stringify(prefs) );
}

function updatePanelPrefs() {
	// console.log("UPDATE PREFS");

	var prefs = getPanelPrefs();
	// console.log(prefs);

	var editorContent = document.getElementById("editorContent");
	var cards = editorContent.getElementsByClassName("panel");

	for(var i = 0; i < cards.length; i++) {
		var card = cards[i];
		var id = card.id;
		var visible = card.style.display != "none";

		for (var j = 0; j < prefs.workspace.length; j++ )
		{
			if (prefs.workspace[j].id === id) {
				prefs.workspace[j].position = i;
				prefs.workspace[j].visible = visible;
			}
		}
	}

	// console.log(prefs);
	localStorage.panel_prefs = JSON.stringify( prefs );
	// console.log(localStorage.panel_prefs);
}


var gifRecordingInterval = null;
function startRecordingGif() {
	gifFrameData = [];

	document.getElementById("gifStartButton").style.display="none";
	document.getElementById("gifSnapshotButton").style.display="none";
	document.getElementById("gifStopButton").style.display="inline";
	document.getElementById("gifRecordingText").style.display="inline";
	document.getElementById("gifPreview").style.display="none";
	document.getElementById("gifPlaceholder").style.display="block";

	gifRecordingInterval = setInterval( function() {
		gifFrameData.push( ctx.getImageData(0,0,512,512).data );
	}, 100 );
}

var gifCaptureCanvas; // initialized in start() -- should be in own module?
var gifCaptureCtx;
var gifCaptureWidescreenSize = {
	width : 726, // height * 1.26
	height : 576
};

function takeSnapshotGif(e) {
	var gif = {
		frames: [],
		width: 512,
		height: 512,
		loops: 0,
		delay: animationTime / 10
	};

	gifCaptureCanvas.width = 512; // stop hardcoding 512?
	gifCaptureCanvas.height = 512;

	drawRoom( room[curRoom], gifCaptureCtx, 0 );
	var frame0 = gifCaptureCtx.getImageData(0,0,512,512);

	drawRoom( room[curRoom], gifCaptureCtx, 1 );
	var frame1 = gifCaptureCtx.getImageData(0,0,512,512);

	if(e.altKey) {
		/* widescreen */
		gif.width = gifCaptureWidescreenSize.width;
		gif.height = gifCaptureWidescreenSize.height;
		gifCaptureCanvas.width = gifCaptureWidescreenSize.width;
		gifCaptureCanvas.height = gifCaptureWidescreenSize.height;

		var widescreenX = (gifCaptureWidescreenSize.width / 2) - (512 / 2);
		var widescreenY = (gifCaptureWidescreenSize.height / 2) - (512 / 2);

		gifCaptureCtx.fillStyle = "rgb(" + getPal(curPal())[0][0] + "," + getPal(curPal())[0][1] + "," + getPal(curPal())[0][2] + ")";
		gifCaptureCtx.fillRect(0,0,gifCaptureWidescreenSize.width,gifCaptureWidescreenSize.height);

		gifCaptureCtx.putImageData(frame0,widescreenX,widescreenY);
		frame0 = gifCaptureCtx.getImageData(0,0,gifCaptureWidescreenSize.width,gifCaptureWidescreenSize.height);

		gifCaptureCtx.putImageData(frame1,widescreenX,widescreenY);
		frame1 = gifCaptureCtx.getImageData(0,0,gifCaptureWidescreenSize.width,gifCaptureWidescreenSize.height);
	}

	gif.frames.push( frame0.data );
	gif.frames.push( frame1.data );

	finishRecordingGif(gif);
}

function stopRecordingGif() {
	var gif = {
		frames: gifFrameData,
		width: 512,
		height: 512,
		loops: 0,
		delay: 10
	};

	finishRecordingGif(gif);
}

// TODO - palette for rainbow text
function finishRecordingGif(gif) {
	if(gifRecordingInterval != null) {
		clearInterval( gifRecordingInterval );
		gifRecordingInterval = null;
	}

	document.getElementById("gifStartButton").style.display="none";
	document.getElementById("gifSnapshotButton").style.display="none";
	document.getElementById("gifStopButton").style.display="none";
	document.getElementById("gifRecordingText").style.display="none";
	document.getElementById("gifEncodingText").style.display="inline";
	document.getElementById("gifEncodingProgress").innerText = "0";

	if(gif.frames.length <= 0) {
		document.getElementById("gifEncodingText").style.display="none";
		document.getElementById("gifStartButton").style.display="inline";
		return; // nothing recorded, nothing to encode
	}

	setTimeout( function() {
		var hexPalette = [];
		// add black & white
		hexPalette.push( rgbToHex(0,0,0).slice(1) ); // need to slice off leading # (should that safeguard go in gif.js?)
		hexPalette.push( rgbToHex(255,255,255).slice(1) );
		// add all user defined palette colors
		for (id in palette) {
			for (i in getPal(id)){
				var hexStr = rgbToHex( getPal(id)[i][0], getPal(id)[i][1], getPal(id)[i][2] ).slice(1);
				hexPalette.push( hexStr );
			}
		}
		// add rainbow colors (for rainbow text effect)
		hexPalette.push( hslToHex(0.0,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.1,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.2,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.3,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.4,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.5,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.6,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.7,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.8,1,0.5).slice(1) );
		hexPalette.push( hslToHex(0.9,1,0.5).slice(1) );

		gif.palette = hexPalette; // hacky

		gifencoder.encode( gif, 
			function(uri, blob) {
				document.getElementById("gifEncodingText").style.display="none";
				document.getElementById("gifStartButton").style.display="inline";
				document.getElementById("gifPreview").src = uri;
				document.getElementById("gifPreview").style.display="block";
				document.getElementById("gifPlaceholder").style.display="none";
				document.getElementById("gifSnapshotButton").style.display="inline";

				if( browserFeatures.blobURL ) {
					document.getElementById("gifDownload").href = makeURL.createObjectURL( blob );
				}
				else {
					var downloadData = uri.replace("data:;", "data:attachment/file;"); // for safari
					document.getElementById("gifDownload").href = downloadData;
				}
			},
			function(curFrame, maxFrame) {
				document.getElementById("gifEncodingProgress").innerText = Math.floor( (curFrame / maxFrame) * 100 );
			}
		);
	}, 10);
}

/* LOAD FROM FILE */
function importGameFromFile(e) {
	resetGameData();

	console.log("IMPORT START");

	// load file chosen by user
	var files = e.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.readAsText( file );

	reader.onloadend = function() {
		var fileText = reader.result;
		gameDataStr = exporter.importGame( fileText );

		console.log("import load end");
		// console.log(gameDataStr);
		
		// change game data & reload everything
		document.getElementById("game_data").value = gameDataStr;
		on_game_data_change();

		paintExplorer.Refresh(drawing.type);
	}
}

function importFontFromFile(e) {
	// load file chosen by user
	var files = e.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.readAsText( file );

	reader.onloadend = function() {
		var fileText = reader.result;
		console.log(fileText);

		var customFontName = (editorFontManager.Create(fileText)).getName();

		editorFontManager.AddResource(customFontName + editorFontManager.GetExtension(), fileText);
		switchFont(customFontName); // bitsy engine setting

		var fontStorage = {
			name : customFontName,
			fontdata : fileText
		};
		localStorage.custom_font = JSON.stringify(fontStorage);

		refreshGameData();
		updateFontSelectUI();

		// TODO
		// fontLoadSettings.resources.set("custom.txt", fileText); // hacky!!!
	}
}

/* ANIMATION EDITING*/
function on_toggle_animated() {
	console.log("ON TOGGLE ANIMATED");
	console.log(document.getElementById("animatedCheckbox").checked);
	console.log(drawing.type);
	console.log("~~~~~");
	if ( document.getElementById("animatedCheckbox").checked ) {
		if ( drawing.type === TileType.Sprite || drawing.type === TileType.Avatar ) {
			addSpriteAnimation();
		}
		else if ( drawing.type === TileType.Tile ) {
			addTileAnimation();
		}
		else if ( drawing.type === TileType.Item ) {
			addItemAnimation();
		}
		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		console.log(drawing.id);
		renderAnimationPreview( drawing.id );
	}
	else {
		if ( drawing.type === TileType.Sprite || drawing.type === TileType.Avatar ) {
			removeSpriteAnimation();
		}
		else if ( drawing.type === TileType.Tile ) {
			removeTileAnimation();			
		}
		else if ( drawing.type === TileType.Item ) {
			console.log("REMOVE ITEM ANIMATION");
			removeItemAnimation();
		}
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}
	renderPaintThumbnail( drawing.id );
}

function addSpriteAnimation() {
	//set editor mode
	paintTool.isCurDrawingAnimated = true;
	paintTool.curDrawingFrameIndex = 0;

	//mark sprite as animated
	sprite[drawing.id].animation.isAnimated = true;
	sprite[drawing.id].animation.frameIndex = 0;
	sprite[drawing.id].animation.frameCount = 2;

	//add blank frame to sprite (or restore removed animation)
	var spriteImageId = "SPR_" + drawing.id;
	if (sprite[drawing.id].cachedAnimation != null)
		restoreDrawingAnimation( spriteImageId, sprite[drawing.id].cachedAnimation )
	else
		addNewFrameToDrawing( spriteImageId );

	// TODO RENDERER : refresh images

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();
}

function removeSpriteAnimation() {
	//set editor mode
	paintTool.isCurDrawingAnimated = false;

	//mark sprite as non-animated
	sprite[drawing.id].animation.isAnimated = false;
	sprite[drawing.id].animation.frameIndex = 0;
	sprite[drawing.id].animation.frameCount = 0;

	//remove all but the first frame of the sprite
	var spriteImageId = "SPR_" + drawing.id;
	cacheDrawingAnimation( sprite[drawing.id], spriteImageId );
	removeDrawingAnimation( spriteImageId );

	// TODO RENDERER : refresh images

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();
}

function addTileAnimation() {
	//set editor mode
	paintTool.isCurDrawingAnimated = true;
	paintTool.curDrawingFrameIndex = 0;

	//mark tile as animated
	tile[drawing.id].animation.isAnimated = true;
	tile[drawing.id].animation.frameIndex = 0;
	tile[drawing.id].animation.frameCount = 2;

	//add blank frame to tile (or restore removed animation)
	var tileImageId = "TIL_" + drawing.id;
	if (tile[drawing.id].cachedAnimation != null)
		restoreDrawingAnimation( tileImageId, tile[drawing.id].cachedAnimation )
	else
		addNewFrameToDrawing( tileImageId );

	// TODO RENDERER : refresh images

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();
}

function removeTileAnimation() {
	//set editor mode
	paintTool.isCurDrawingAnimated = false;

	//mark tile as non-animated
	tile[drawing.id].animation.isAnimated = false;
	tile[drawing.id].animation.frameIndex = 0;
	tile[drawing.id].animation.frameCount = 0;

	//remove all but the first frame of the tile
	var tileImageId = "TIL_" + drawing.id;
	cacheDrawingAnimation( tile[drawing.id], tileImageId );
	removeDrawingAnimation( tileImageId );

	// TODO RENDERER : refresh images

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();
}

// TODO : so much duplication it makes me sad :(
function addItemAnimation() {
	//set editor mode
	paintTool.isCurDrawingAnimated = true;
	paintTool.curDrawingFrameIndex = 0;

	//mark item as animated
	item[drawing.id].animation.isAnimated = true;
	item[drawing.id].animation.frameIndex = 0;
	item[drawing.id].animation.frameCount = 2;

	//add blank frame to item (or restore removed animation)
	var itemImageId = "ITM_" + drawing.id;
	if (item[drawing.id].cachedAnimation != null)
		restoreDrawingAnimation( itemImageId, item[drawing.id].cachedAnimation )
	else
		addNewFrameToDrawing( itemImageId );

	// TODO RENDERER : refresh images

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();
}

function removeItemAnimation() {
	//set editor mode
	paintTool.isCurDrawingAnimated = false;

	//mark item as non-animated
	item[drawing.id].animation.isAnimated = false;
	item[drawing.id].animation.frameIndex = 0;
	item[drawing.id].animation.frameCount = 0;

	//remove all but the first frame of the item
	var itemImageId = "ITM_" + drawing.id;
	cacheDrawingAnimation( item[drawing.id], itemImageId );
	removeDrawingAnimation( itemImageId );

	// TODO RENDERER : refresh images

	//refresh data model (TODO : these should really be a shared method)
	refreshGameData();
	paintTool.reloadDrawing();
}

function addNewFrameToDrawing(drwId) {
	// copy first frame data into new frame
	var imageSource = renderer.GetImageSource(drwId);
	var firstFrame = imageSource[0];
	var newFrame = [];
	for (var y = 0; y < tilesize; y++) {
		newFrame.push([]);
		for (var x = 0; x < tilesize; x++) {
			newFrame[y].push( firstFrame[y][x] );
		}
	}
	imageSource.push( newFrame );
	renderer.SetImageSource(drwId, imageSource);
}

function removeDrawingAnimation(drwId) {
	var imageSource = renderer.GetImageSource(drwId);
	var oldImageData = imageSource.slice(0);
	renderer.SetImageSource( drwId, [ oldImageData[0] ] );
}

// let's us restore the animation during the session if the user wants it back
function cacheDrawingAnimation(drawing,sourceId) {
	var imageSource = renderer.GetImageSource(sourceId);
	var oldImageData = imageSource.slice(0);
	drawing.cachedAnimation = [ oldImageData[1] ]; // ah the joys of javascript
}

function restoreDrawingAnimation(sourceId,cachedAnimation) {
	var imageSource = renderer.GetImageSource(sourceId);
	for (f in cachedAnimation) {
		imageSource.push( cachedAnimation[f] );	
	}
	renderer.SetImageSource(sourceId, imageSource);
}

function on_paint_frame1() {
	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function on_paint_frame2() {
	paintTool.curDrawingFrameIndex = 1;
	paintTool.reloadDrawing();
}

var export_settings = {
	page_color : "#ffffff"
};

function on_change_color_page() {
	var hex = document.getElementById("pageColor").value;
	//console.log(hex);
	var rgb = hexToRgb( hex );
	// document.body.style.background = hex;
	document.getElementById("roomPanel").style.background = hex;
	export_settings.page_color = hex;

	localStorage.export_settings = JSON.stringify( export_settings );
}

function getComplimentingColor(palId) {
	if (!palId) palId = curPal();
	var hsl = rgbToHsl( getPal(palId)[0][0], getPal(palId)[0][1], getPal(palId)[0][2] );
	// console.log(hsl);
	var lightness = hsl[2];
	if (lightness > 0.5) {
		return "#fff";
	}
	else {
		return "#000";
	}
}

/* MOVEABLE PANESL */
var grabbedPanel = {
	card: null,
	size: 0,
	cursorOffset: {x:0,y:0},
	shadow: null
};

function grabCard(e) {
	if(Ed().platform === PlatformType.Mobile)
		return; // This doesn't work on mobile

	// e.preventDefault();

	console.log("--- GRAB START");
	console.log(grabbedPanel.card);

	if (grabbedPanel.card != null) return;

	grabbedPanel.card = e.target;
	while(!grabbedPanel.card.classList.contains("panel") && !(grabbedPanel.card == null)) {
		grabbedPanel.card = grabbedPanel.card.parentElement;
	}

	if(grabbedPanel.card == null) return; // couldn't find a panel above the handle - abort!

	console.log(grabbedPanel.card);
	console.log("--")

	grabbedPanel.size = getElementSize( grabbedPanel.card );
	var pos = getElementPosition( grabbedPanel.card );
	
	grabbedPanel.shadow = document.createElement("div");
	grabbedPanel.shadow.className = "panelShadow";
	grabbedPanel.shadow.style.width = grabbedPanel.size.x + "px";
	grabbedPanel.shadow.style.height = grabbedPanel.size.y + "px";

	console.log( document.getElementById("editorContent") );
	console.log( grabbedPanel.shadow );
	console.log( grabbedPanel.card );

	document.getElementById("editorContent").insertBefore( grabbedPanel.shadow, grabbedPanel.card );
	grabbedPanel.cursorOffset.x = e.clientX - pos.x;
	grabbedPanel.cursorOffset.y = e.clientY - pos.y;
	console.log("client " + e.clientX);
	console.log("card " + pos.x);
	console.log("offset " + grabbedPanel.cursorOffset.x);
	// console.log("screen " + e.screenX);
	grabbedPanel.card.style.position = "absolute";
	grabbedPanel.card.style.left = e.clientX - grabbedPanel.cursorOffset.x + "px";
	grabbedPanel.card.style.top = e.clientY - grabbedPanel.cursorOffset.y + "px";
	grabbedPanel.card.style.zIndex = 1000;
}

function panel_onMouseMove(e) {
	if (grabbedPanel.card == null) return;

	console.log("-- PANEL MOVE");
	console.log(grabbedPanel.card);

	grabbedPanel.card.style.left = e.clientX - grabbedPanel.cursorOffset.x + "px";
	grabbedPanel.card.style.top = e.clientY - grabbedPanel.cursorOffset.y + "px";

	var cardPos = getElementPosition( grabbedPanel.card );
	var cardSize = grabbedPanel.size;
	var cardCenter = { x:cardPos.x+cardSize.x/2, y:cardPos.y+cardSize.y/2 };

	console.log(cardCenter);

	var editorContent = document.getElementById("editorContent");
	var editorContentWidth = editorContent.getBoundingClientRect().width;
	var otherCards = editorContent.getElementsByClassName("panel");

	// var cardCollection = editorContent.getElementsByClassName("panel");
	// var otherCards = [];
	// for (var i = 0; i < cardCollection.length; i++) {
	// 	otherCards.push(cardCollection[i]);
	// }
	// // console.log(otherCards);

	// // hacky fix for arabic -- need better solution
	// if (curEditorLanguageCode === "ar") {
	// 	// otherCards.reverse();
	// 	cardCenter.x = editorContentWidth - cardCenter.x;
	// }

	// console.log(cardCenter);
	// console.log("---");

	for(var j = 0; j < otherCards.length; j++) {
		var other = otherCards[j];
		// console.log(other);
		var otherPos = getElementPosition( other );
		var otherSize = getElementSize( other );
		var otherCenter = { x:otherPos.x+otherSize.x/2, y:otherPos.y+otherSize.y/2 };

		// console.log(otherCenter);

		if ( cardCenter.x < otherCenter.x ) {
			console.log("INSERT " + cardCenter.x + " " + otherCenter.x);
			console.log(other);

			editorContent.insertBefore( grabbedPanel.shadow, other );
			break;
		}
	}

	console.log("********")
}
document.addEventListener("mousemove",panel_onMouseMove);

function panel_onMouseUp(e) {
	if (grabbedPanel.card == null) return;

	var editorContent = document.getElementById("editorContent");
	editorContent.insertBefore( grabbedPanel.card, grabbedPanel.shadow );
	editorContent.removeChild( grabbedPanel.shadow );
	grabbedPanel.card.style.position = "relative";
	grabbedPanel.card.style.top = null;
	grabbedPanel.card.style.left = null;
	grabbedPanel.card.style.zIndex = null;

	// drop card anim
	var cardTmp = grabbedPanel.card;
	cardTmp.classList.add("drop");
	setTimeout( function() { cardTmp.classList.remove("drop"); }, 300 );

	grabbedPanel.card = null;

	updatePanelPrefs();
}
document.addEventListener("mouseup",panel_onMouseUp);

// TODO consolidate these into one function?
function getElementPosition(e) { /* gets absolute position on page */
	if (!e.getBoundingClientRect) {
		console.log("NOOO BOUNDING RECT!!!");
		return {x:0,y:0};
	}

	var rect = e.getBoundingClientRect();
	var pos = {x:rect.left,y:rect.top};
	// console.log(pos);
	return pos;
}

function getElementSize(e) { /* gets visible size */
	return {
		x: e.clientWidth,
		y: e.clientHeight
	};
}

// sort of a hack to avoid accidentally activating backpage and nextpage while scrolling through editor panels 
function blockScrollBackpage(e) {
	var el = document.getElementById("editorWindow");
	var maxX = el.scrollWidth - el.offsetWidth;

	// if ( el.scrollLeft + e.deltaX < 0 || el.scrollLeft + e.deltaX > maxX )
	// {
	// 	e.preventDefault();
	// 	el.scrollLeft = Math.max(0, Math.min(maxX, el.scrollLeft + event.deltaX));
	// }
}


/* ADVANCED DIALOG EDITOR */
/*
TODO
- delete blocks
- re-serialize on change
- delete sequence options
- add sequence options
- change if conditions
- delete if conditions
- add if conditions
- add blocks
*/

function createIconElement(iconName) {
	var icon = document.createElement("i");
	icon.classList.add('material-icons');
	icon.innerText = iconName;
	return icon;
}

var dialogSel = {
	target : null,
	start : 0,
	end : 0,
	onchange : null
}

function createOnTextSelectionChange(onchange) {
	return function(event) {
		dialogSel.target = event.target;
		dialogSel.start = event.target.selectionStart;
		dialogSel.end = event.target.selectionEnd;
		dialogSel.onchange = onchange;

		var effectButtons = document.getElementsByClassName("dialogEffectButton");
		for(var i = 0; i < effectButtons.length; i++) {
			effectButtons[i].disabled = false;
		}
	}
}

function onTextSelectionLeave(event) {
	dialogSel.target = null;
	dialogSel.start = 0;
	dialogSel.end = 0;

	var effectButtons = document.getElementsByClassName("dialogEffectButton");
	for(var i = 0; i < effectButtons.length; i++) {
		effectButtons[i].disabled = true;
	}
}

function preventTextDeselect(event) {
	if(dialogSel.target != null) {
		// event.preventDefault();
	}
}

function preventTextDeselectAndClick(event) {
	if(dialogSel.target != null) {
		// event.preventDefault();
		event.target.click();
	}
}

function wrapTextSelection(effect) {
	if( dialogSel.target != null ) {
		var curText = dialogSel.target.value;
		var selText = curText.slice(dialogSel.start, dialogSel.end);

		var isEffectAlreadyApplied = selText.indexOf( effect ) > -1;
		if(isEffectAlreadyApplied) {
			//remove all instances of effect
			var effectlessText = selText.split( effect ).join( "" );
			var newText = curText.slice(0, dialogSel.start) + effectlessText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;
			dialogSel.target.setSelectionRange(dialogSel.start,dialogSel.start + effectlessText.length);
			if(dialogSel.onchange != null)
				dialogSel.onchange( dialogSel ); // dialogSel needs to mimic the event the onchange would usually receive
		}
		else {
			// add effect
			var effectText = effect + selText + effect;
			var newText = curText.slice(0, dialogSel.start) + effectText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;
			dialogSel.target.setSelectionRange(dialogSel.start,dialogSel.start + effectText.length);
			if(dialogSel.onchange != null)
				dialogSel.onchange( dialogSel ); // dialogSel needs to mimic the event the onchange would usually receive
		}
	}
}

function ConvertNumberStringToArabic(numberString) {
	var arabicNumerals = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];

	var arabicNumberString = "";

	for (var i = 0; i < numberString.length; i++)
	{
		arabicNumberString += arabicNumerals[parseInt(numberString[i])];
	}

	return arabicNumberString;
}

var DialogBlockUI = function(nodes, num) {
	var dialogNode = scriptUtils.CreateDialogBlock( nodes );

	var div = document.createElement('div');
	div.classList.add('controlBox');

	if(dialogNode.children.length > 0) {
		dialogNode.children[0].onEnter = function() {
			div.classList.add('highlighted');
		}
		dialogNode.children[dialogNode.children.length-1].onExit = function() {
			div.classList.remove('highlighted');
		}
	}
	// console.log( dialogNode.children[dialogNode.children.length-1] );

	var topDiv = document.createElement('div');
	topDiv.classList.add('advDialogTop');
	div.appendChild(topDiv);

	var leftSpan = document.createElement('span');
	leftSpan.classList.add('advDialogBlockName');
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("subject");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );

	var numSpan = document.createElement("span");
	var numString = "" + num;
	if (localization.GetLanguage() === "ar") { // arabic
		numString = ConvertNumberStringToArabic(numString);
	}
	numSpan.innerText = numString + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = localization.GetStringOrFallback("dialog_block_basic", "dialog");
	typeEl.title = "this dialog is said once on each interaction";
	leftSpan.appendChild( typeEl );

	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.classList.add('light');
	deleteEl.classList.add('advDialogBlockDelete');
	var self = this; // hack
	deleteEl.addEventListener('click', function() {
		var i = advDialogUIComponents.indexOf(self);
		if(i>-1) {
			console.log("DELETE SEQ " + i);
			advDialogUIComponents.splice( i, 1 );
			serializeAdvDialog();
			reloadAdvDialogUI();
		}
	});
	deleteEl.title = "delete this dialog section";
	topDiv.appendChild( deleteEl );

	// div.appendChild( document.createElement("br") );

	var textArea = document.createElement("textarea");
	function onChangeDialogBlock() {
		dialogNode = scriptInterpreter.Parse( '"""\n' +  textArea.value + '\n"""' );
		nodes = dialogNode.children;
		console.log(nodes);

		if(dialogNode.children.length > 0) {
			dialogNode.children[0].onEnter = function() {
				div.classList.add('highlighted');
			}
			dialogNode.children[dialogNode.children.length-1].onExit = function() {
				div.classList.remove('highlighted');
			}
		}

		serializeAdvDialog();
	}
	textArea.classList.add('advDialogTextBlock');
	textArea.classList.add('gameTextDir');
	textArea.value = dialogNode.Serialize();
	textArea.addEventListener('change', onChangeDialogBlock);
	textArea.addEventListener('keyup', onChangeDialogBlock);
	var textChangeHandler = createOnTextSelectionChange( onChangeDialogBlock );
	textArea.addEventListener('click', textChangeHandler);
	textArea.addEventListener('select', textChangeHandler);
	textArea.addEventListener('blur', textChangeHandler);
	textArea.title = "type dialog here";
	div.appendChild( textArea );

	this.GetEl = function() {
		return div;
	}

	this.GetScriptNodes = function() {
		return nodes;
	}
}

// TODO : rename everything something more sensible
var IfBlockUI = function(node, num) {
	var ifNode = node.children[0];

	function createOnChangeResult(index) {
		return function(event) {
			ifNode.results[index] = scriptInterpreter.Parse( '"""\n' + event.target.value + '\n"""' );
			serializeAdvDialog();
		}
	}

	var div = document.createElement('div');
	div.classList.add('controlBox');

	node.onEnter = function() {
		div.classList.add('highlighted');
	}
	node.onExit = function() {
		div.classList.remove('highlighted');
	}

	var topDiv = document.createElement('div');
	topDiv.classList.add('advDialogTop');
	// topDiv.style.marginBottom = "5px";
	div.appendChild(topDiv);

	var leftSpan = document.createElement('span');
	leftSpan.classList.add('advDialogBlockName');
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("call_split");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );
	// topDiv.appendChild( createIconElement("call_split") );
	// div.appendChild( createIconElement("help_outline") );

	var numSpan = document.createElement("span");
	var numString = "" + num;
	if (localization.GetLanguage() === "ar") { // arabic
		numString = ConvertNumberStringToArabic(numString);
	}
	numSpan.innerText = numString + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = localization.GetStringOrFallback("dialog_block_conditional", "conditional");
	typeEl.title = "which dialog option is said is determined by conditions you define"
	leftSpan.appendChild( typeEl );

	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.classList.add('light');
	deleteEl.classList.add('advDialogBlockDelete');
	var self = this; // hack
	deleteEl.addEventListener('click', function() {
		var i = advDialogUIComponents.indexOf(self);
		if(i>-1) {
			console.log("DELETE SEQ " + i);
			advDialogUIComponents.splice( i, 1 );
			serializeAdvDialog();
			reloadAdvDialogUI();
		}
	});
	deleteEl.title = "delete this conditional dialog section"
	topDiv.appendChild( deleteEl );

	// div.appendChild( document.createElement("br") );

	function createOnDelete(index) {
		var onDelete = function() {
			ifNode.conditions.splice(index,1);
			ifNode.results.splice(index,1);
			serializeAdvDialog();
			reloadAdvDialogUI();	
		};
		return onDelete;
	}

	var conditionTypes = ["item","variable","default","custom"];
	var conditionTypeNames = [
		localization.GetStringOrFallback("item_label", "item"),
		localization.GetStringOrFallback("variable_label", "variable"),
		localization.GetStringOrFallback("condition_type_default", "default"),
		localization.GetStringOrFallback("condition_type_custom", "custom")
	];
	// var conditionTypesVerbose = ["the player's inventory of the item", "the value of the variable", "no other condition is met (default)", "a custom condition is met"]
	// var comparisonNames = ["equals","greater than","less than","greater than or equal to","less than or equal to"];
	var comparisonTypes = ["==", ">", "<", ">=", "<="];
	// var comparisonTypesVerbose = ["is equal to", "is greater than", "is less than", "is greater than or equal to", "is less than or equal to"];
	// NOTE: verbose names seemed too hard to understand

	function createOnConditionTypeChange(index, condItemSelect, condVariableSelect, condCompareSelect, condValueInput, condCustomTextInput) {
		return function(event) {
			console.log("CHANGE CONDITIONAL TYPE " + event.target.value);

			var condition = ifNode.conditions[index];

			condItemSelect.style.display = "none";
			condVariableSelect.style.display = "none";
			condCompareSelect.style.display = "none";
			condValueInput.style.display = "none";
			condCustomTextInput.style.display = "none";

			var doesConditionMatchUI = event.target.value === getConditionType( condition );

			if(event.target.value === "item") { // TODO: negative numbers don't work
				condItemSelect.style.display = "inline";
				condCompareSelect.style.display = "inline";
				condValueInput.style.display = "inline";

				if(doesConditionMatchUI) {
					var itemId = condition.left.children[0].arguments[0].value;
					if(names.item.has(itemId)) itemId = names.item.get(itemId);
					condItemSelect.value = itemId;

					var operator = condition.operator;
					condCompareSelect.value = operator;

					var compareVal = condition.right.value;
					condValueInput.value = compareVal;
				}
				else {
					var itemId = condItemSelect.value;
					if(item[itemId].name != null) itemId = item[itemId].name;
					var condStr = '{item "' + itemId + '"} ' + condCompareSelect.value + ' ' + condValueInput.value;
					console.log(condStr);
					ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
					serializeAdvDialog();
				}
			}
			else if(event.target.value === "variable") {
				condVariableSelect.style.display = "inline";
				condCompareSelect.style.display = "inline";
				condValueInput.style.display = "inline";

				if(doesConditionMatchUI) {
					console.log("VAR MATCH");
					var varId = condition.left.name;
					console.log(varId);
					condVariableSelect.value = varId;

					var operator = condition.operator;
					condCompareSelect.value = operator;

					var compareVal = condition.right.value;
					condValueInput.value = compareVal;
				}
				else {
					var varId = condVariableSelect.value;
					var condStr = varId + ' ' + condCompareSelect.value + ' ' + condValueInput.value;
					ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
					serializeAdvDialog();
				}
			}
			else if(event.target.value === "default") {
				if(!doesConditionMatchUI) {
					ifNode.conditions[index] = scriptInterpreter.CreateExpression( "else" );
					serializeAdvDialog();
				}
			}
			else if(event.target.value === "custom") {
				condCustomTextInput.style.display = "inline";

				// custom conditions can contain anything so no need to change the existing condition
				condCustomTextInput.value = condition.Serialize();
			}
		}
	};

	function createOnConditionPartialChange(index, condTypeSelect, condItemSelect, condVariableSelect, condCompareSelect, condValueInput) {
		return function() {
			if(condTypeSelect.value === "item") {
				var itemId = condItemSelect.value;
				if(item[itemId].name != null) itemId = item[itemId].name;
				var condStr = '{item "' + itemId + '"} ' + condCompareSelect.value + ' ' + condValueInput.value;
				ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
				serializeAdvDialog();
			}
			else if(condTypeSelect.value === "variable") {
				var varId = condVariableSelect.value;
				var condStr = varId + ' ' + condCompareSelect.value + ' ' + condValueInput.value;
				ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
				serializeAdvDialog();
			}
		}
	}

	function createOnConditionCustomChange(index, condCustomTextInput) {
		return function() {
			var condStr = condCustomTextInput.value;
			ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
			serializeAdvDialog();
		}
	}

	function getConditionType(condition) {
		if(condition.type === "else") {
			return "default";
		}
		else if(condition.type === "operator") {
			if (condition.right.type === "literal" && !isNaN(condition.right.value)) {
				if(condition.left.type === "block") {
					var child = condition.left.children[0];
					if(child.type === "function" && child.name === "item") {
						return "item";
					}
				}
				if(condition.left.type === "variable" && variable[condition.left.name] != null) {
					return "variable";
				}
			}
		}
		return "custom";
	}

	var addConditionEl = document.createElement("button");
	addConditionEl.title = "add a new dialog option to this conditional dialog section"
	addConditionEl.appendChild( createIconElement("add") );
	var addConditionText = document.createElement("span");
	addConditionText.innerText = localization.GetStringOrFallback("dialog_conditional_add", "add option");
	addConditionEl.appendChild( addConditionText );

	function addCondition(condition, result, index) {
		var conditionDiv = document.createElement('div');
		conditionDiv.style.display = "block";
		conditionDiv.classList.add('advDialogConditionDiv');
		div.insertBefore( conditionDiv, addConditionEl );

		var condInnerDiv = document.createElement("div");
		// condInnerDiv.style.overflow = "none";
		condInnerDiv.style.width = "300px";
		// condInnerDiv.style.background = "red";
		condInnerDiv.style.whiteSpace = "normal";
		conditionDiv.appendChild(condInnerDiv);

		// var subNumSpan = document.createElement("div");
		// subNumSpan.innerText = num + numToLetter(index) + ". ";
		// subNumSpan.style.fontSize = "12px";
		// subNumSpan.style.display = "inline";
		// condInnerDiv.appendChild( subNumSpan );


		// // new experiment
		// var deleteConditionEl = document.createElement("button");
		// deleteConditionEl.appendChild( createIconElement("clear") );
		// deleteConditionEl.addEventListener( 'click', createOnDelete(index) );
		// deleteConditionEl.title = "delete this option from this conditional dialog section"
		// condInnerDiv.appendChild( deleteConditionEl );
		// condInnerDiv.appendChild( document.createElement("br") );


		var condSpan = document.createElement("span");
		condSpan.innerText = localization.GetStringOrFallback("dialog_conditional_when", "when ");
		condSpan.title = "define the condition for which this dialog option is said";
		condInnerDiv.appendChild(condSpan);
		var condTypeSelect = document.createElement("select");
		condTypeSelect.title = "choose type of condition to check";
		condInnerDiv.appendChild(condTypeSelect);
		for(var i = 0; i < conditionTypes.length; i++) {
			var condTypeOption = document.createElement("option");
			condTypeOption.value = conditionTypes[i];
			condTypeOption.innerText = conditionTypeNames[i];
			condTypeSelect.appendChild(condTypeOption);
		}
		// condInnerDiv.appendChild( document.createElement("br") );
		var condItemSelect = document.createElement("select");
		condItemSelect.title = "choose item to check";
		condInnerDiv.appendChild(condItemSelect);
		for(id in item) {
			var condItemOption = document.createElement("option");
			condItemOption.value = id;
			condItemOption.innerText = (item[id].name != null ? item[id].name : localization.GetStringOrFallback("item_label", "item") + " " + id);
			condItemSelect.appendChild(condItemOption);
		}
		var condVariableSelect = document.createElement("select");
		condVariableSelect.title = "choose variable to check";
		condInnerDiv.appendChild(condVariableSelect);
		for(id in variable) {
			var condVariableOption = document.createElement("option");
			condVariableOption.value = id;
			condVariableOption.innerText = id;
			condVariableSelect.appendChild(condVariableOption);
		}
		// var condSpan2 = document.createElement("span");
		// condSpan2.innerText = " is ";
		// condInnerDiv.appendChild(condSpan2);
		var condCompareSelect = document.createElement("select");
		condCompareSelect.title = "choose a comparison type";
		condInnerDiv.appendChild(condCompareSelect);
		for(var i = 0; i < comparisonTypes.length; i++) {
			var condCompareOption = document.createElement("option");
			condCompareOption.value = comparisonTypes[i];
			condCompareOption.innerText = comparisonTypes[i];
			condCompareSelect.appendChild(condCompareOption);
		}
		var condValueInput = document.createElement("input");
		condValueInput.type = "number";
		condValueInput.title = "choose number to compare";
		condValueInput.value = 1;
		condValueInput.style.width = "35px";
		condInnerDiv.appendChild(condValueInput);
		var condCustomTextInput = document.createElement("input");
		condCustomTextInput.type = "text";
		condCustomTextInput.placeholder = 'ex: x+1 < {item "1"}';
		condCustomTextInput.title = "type custom condition here";
		condInnerDiv.appendChild(condCustomTextInput);

		var onConditionTypeChange = createOnConditionTypeChange(index,condItemSelect,condVariableSelect,condCompareSelect,condValueInput,condCustomTextInput);
		condTypeSelect.addEventListener( 'change', onConditionTypeChange );
		var fakeEvent = { target : { value : getConditionType( condition ) } };
		onConditionTypeChange( fakeEvent );
		condTypeSelect.value = getConditionType( condition );

		var onConditionPartialChange = createOnConditionPartialChange(index,condTypeSelect,condItemSelect,condVariableSelect,condCompareSelect,condValueInput);
		condItemSelect.addEventListener( 'change', onConditionPartialChange );
		condVariableSelect.addEventListener( 'change', onConditionPartialChange );
		condCompareSelect.addEventListener( 'change', onConditionPartialChange );
		condValueInput.addEventListener( 'change', onConditionPartialChange );

		var onConditionCustomChange = createOnConditionCustomChange(index,condCustomTextInput);
		condCustomTextInput.addEventListener('change', onConditionCustomChange);
		condCustomTextInput.addEventListener('keyup', onConditionCustomChange);
		condCustomTextInput.addEventListener('keydown', onConditionCustomChange);

		// var hr = document.createElement("hr");
		// hr.classList.add('niceHr');
		// conditionDiv.appendChild(hr);
		// var condSaySpan = document.createElement("span");
		// condSaySpan.innerText = "say: ";
		// conditionDiv.appendChild(condSaySpan);
		// conditionDiv.appendChild( document.createElement("br") );

		var textArea = document.createElement("textarea");
		textArea.classList.add('advDialogTextOption');
		textArea.classList.add('gameTextDir');
		textArea.value = result.Serialize();
		var onChangeResult = createOnChangeResult(index);
		textArea.addEventListener('change', onChangeResult);
		textArea.addEventListener('keyup', onChangeResult);
		textArea.addEventListener('keydown', onChangeResult);
		var textChangeHandler = createOnTextSelectionChange( onChangeResult );
		textArea.addEventListener('click', textChangeHandler);
		textArea.addEventListener('select', textChangeHandler);
		textArea.addEventListener('blur', textChangeHandler);
		textArea.title = "type dialog option to say when this condition is true"
		textArea.style.display = "inline-block";
		conditionDiv.appendChild( textArea );
		// div.appendChild( document.createElement("br") );

		var deleteConditionEl = document.createElement("button");
		deleteConditionEl.appendChild( createIconElement("clear") );
		deleteConditionEl.addEventListener( 'click', createOnDelete(index) );
		deleteConditionEl.title = "delete this option from this conditional dialog section"
		conditionDiv.appendChild( deleteConditionEl );
	}

	addConditionEl.addEventListener('click', function() {
		var newCondition = scriptInterpreter.CreateExpression('{item "0"} == 1');
		var newResult = scriptUtils.CreateDialogBlock([]);
		ifNode.conditions.push( newCondition );
		ifNode.results.push( newResult );
		addCondition(newCondition, newResult, ifNode.conditions.length-1);
		serializeAdvDialog();
	});
	div.appendChild(addConditionEl);

	for(var j = 0; j < ifNode.conditions.length; j++) {
		addCondition( ifNode.conditions[j], ifNode.results[j], j );
	}

	this.GetEl = function() {
		return div;
	}

	this.GetScriptNodes = function() {
		return [node];
	}
}

var seqRadioCount = 0;
var SeqBlockUI = function(node, num) {
	var sequenceNode = node.children[0];

	function createOnChangeOption(index) {
		return function(event) {
			sequenceNode.options[index] = scriptUtils.CreateDialogBlock( scriptInterpreter.Parse( '"""\n' + event.target.value + '\n"""' ).children, false ); // hacky way to avoid indenting first line (think of something better please!)
			serializeAdvDialog();
		}
	}

	var div = document.createElement('div');
	div.classList.add('controlBox');

	node.onEnter = function() {
		div.classList.add('highlighted');
	}
	node.onExit = function() {
		div.classList.remove('highlighted');
	}

	var topDiv = document.createElement('div');
	// topDiv.style.background = "red";
	topDiv.classList.add('advDialogTop');
	topDiv.style.marginBottom = "5px";
	div.appendChild(topDiv);

	var leftSpan = document.createElement('span');
	leftSpan.classList.add('advDialogBlockName');
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("list");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );

	var numSpan = document.createElement("span");
	var numString = "" + num;
	if (localization.GetLanguage() === "ar") { // arabic
		numString = ConvertNumberStringToArabic(numString);
	}
	numSpan.innerText = numString + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = localization.GetStringOrFallback("dialog_block_list", "list");
	typeEl.title = "one line of dialog in the list is said on each interaction, in the order you choose";
	leftSpan.appendChild( typeEl );
	
	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.classList.add('light');
	deleteEl.classList.add('advDialogBlockDelete');
	var self = this; // hack
	deleteEl.addEventListener('click', function() {
		var i = advDialogUIComponents.indexOf(self);
		if(i>-1) {
			console.log("DELETE SEQ " + i);
			advDialogUIComponents.splice( i, 1 );
			serializeAdvDialog();
			reloadAdvDialogUI();
		}
	});
	deleteEl.title = "delete this dialog list section";
	topDiv.appendChild( deleteEl );

	// div.appendChild( document.createElement("br") );

	var orderEl = document.createElement("span");
	orderEl.innerText = localization.GetStringOrFallback("dialog_list_order", "order: ");
	orderEl.title = "select the order in which lines are said";
	div.appendChild( orderEl );

	// var formEl = document.createElement("form");
	// div.appendChild( formEl );
	var selectEl = document.createElement("select");
	selectEl.addEventListener('change', function(event) {
		sequenceNode = scriptUtils.ChangeSequenceType( sequenceNode, event.target.value );
		node.children[0] = sequenceNode;
		serializeAdvDialog();
	});
	div.appendChild(selectEl);
	var sequenceTypes = ["sequence","cycle","shuffle"];
	var sequenceDesc = [
		localization.GetStringOrFallback("list_type_description_sequence", "sequence (say each line once)"),
		localization.GetStringOrFallback("list_type_description_cycle", "cycle (say each line, then repeat)"),
		localization.GetStringOrFallback("list_type_description_shuffle", "shuffle (say lines in random order)")
	];
	for(var i = 0; i < sequenceTypes.length; i++) {
		var optionEl = document.createElement("option");
		optionEl.value = sequenceTypes[i];
		optionEl.innerText = sequenceDesc[i];
		optionEl.selected = (sequenceNode.type === sequenceTypes[i]);
		selectEl.appendChild( optionEl );
	}
	selectEl.title = "select the order in which lines are said";
	seqRadioCount++;

	// div.appendChild( document.createElement("br") );

	var addOptionEl = document.createElement("button");
	// addOptionEl.innerText = "add";
	addOptionEl.appendChild( createIconElement("add") );
	var addOptionText = document.createElement("span");
	addOptionText.innerText = localization.GetStringOrFallback("dialog_list_add", "add line");
	addOptionEl.title = "add a new line of dialog to the list";
	addOptionEl.appendChild( addOptionText );

	function addOption(option,index) {
		var optionDiv = document.createElement('div');
		optionDiv.style.display = "block";
		optionDiv.classList.add('advDialogOptionDiv');
		div.insertBefore( optionDiv, addOptionEl );

		// var subNumSpan = document.createElement("div");
		// subNumSpan.innerText = num + numToLetter(index) + ". ";
		// // subNumSpan.style.background = "black";
		// subNumSpan.style.fontSize = "12px";
		// subNumSpan.style.display = "block";
		// // subNumSpan.style.verticalAlign = "middle";
		// // subNumSpan.style.height = "20px";
		// // subNumSpan.style.float = "left";
		// // subNumSpan.style.position = "relative";
		// // subNumSpan.style.top = "-20px";
		// // subNumSpan.style.lineHeight = "100%";
		// // subNumSpan.style.height = "10px";
		// // subNumSpan.style.marginTop = "-30px";
		// optionDiv.appendChild( subNumSpan );

		var textArea = document.createElement("textarea");
		textArea.classList.add('advDialogTextOption');
		textArea.classList.add('gameTextDir');
		textArea.value = option.Serialize();
		// textArea.style.float = "left";
		var onChangeOption = createOnChangeOption( index );
		textArea.addEventListener('change', onChangeOption);
		textArea.addEventListener('keyup', onChangeOption);
		textArea.addEventListener('keydown', onChangeOption);
		var textChangeHandler = createOnTextSelectionChange( onChangeOption );
		textArea.addEventListener('click', textChangeHandler);
		textArea.addEventListener('select', textChangeHandler);
		textArea.addEventListener('blur', textChangeHandler);
		textArea.title = "type line of dialog here"
		// textArea.style.float = "left";
		// div.insertBefore( textArea, addOptionEl );
		textArea.style.display = "inline-block";
		optionDiv.appendChild( textArea );

		var deleteOptionEl = document.createElement("button");
		// deleteOptionEl.innerText = "delete";
		deleteOptionEl.appendChild( createIconElement("clear") );
		// deleteOptionEl.style.float = "right";
		// deleteOptionEl.classList.add('light');
		deleteOptionEl.addEventListener('click', function() {
			sequenceNode.options.splice(index,1);
			serializeAdvDialog();
			reloadAdvDialogUI();
		});
		deleteOptionEl.title = "delete this line from this list"
		// div.insertBefore( deleteOptionEl, addOptionEl );
		optionDiv.appendChild( deleteOptionEl );

		// div.insertBefore( document.createElement("br"), addOptionEl );
	}
	addOptionEl.addEventListener('click', function() {
		var newOption = scriptUtils.CreateDialogBlock([], false);
		sequenceNode.options.push( newOption );
		addOption(newOption, sequenceNode.options.length-1);
		serializeAdvDialog();
	});
	div.appendChild(addOptionEl);

	for(var j = 0; j < sequenceNode.options.length; j++) {
		addOption( sequenceNode.options[j], j );
	}

	this.GetEl = function() {
		return div;
	}

	this.GetScriptNodes = function() {
		return [node];
	}
}

function numToLetter(num) {
	var str = "";
	var base26 = num.toString(26);
	for(var i = 0; i < base26.length; i++) {
		var base10digit = parseInt( base26[i], 26 );
		var char = String.fromCharCode(97 + base10digit + (i < base26.length-1 ? -1 : 0));
		str += char;
	}
	return str;
}

var advDialogUIComponents = [];

function addDownArrowToDialogFlow() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	if(advDialogUIComponents.length > 0) {
		var iconDiv = document.createElement("div");
		iconDiv.align = "center";
		// iconDiv.style.background = "red";
		// iconDiv.style.margin = "0px";

		var iconEl = createIconElement("arrow_downward");
		iconEl.style.fontSize = "16px";
		iconEl.style.marginBottom = "5px";
		// iconEl.classList.add("downArrowDialog");
		iconDiv.appendChild(iconEl);

		dialogFormDiv.appendChild( iconDiv );
	}
}

function addDialogBlockUI() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	addDownArrowToDialogFlow();

	var block = new DialogBlockUI( [], advDialogUIComponents.length+1 );
	dialogFormDiv.appendChild( block.GetEl() );

	advDialogUIComponents.push( block );

	serializeAdvDialog();
}

function addSeqBlockUI() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	addDownArrowToDialogFlow();

	var block = new SeqBlockUI( scriptUtils.CreateSequenceBlock(), advDialogUIComponents.length+1 );
	dialogFormDiv.appendChild( block.GetEl() );

	advDialogUIComponents.push( block );

	serializeAdvDialog();
}

function addIfBlockUI() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	addDownArrowToDialogFlow();

	var block = new IfBlockUI( scriptUtils.CreateIfBlock(), advDialogUIComponents.length+1 );
	dialogFormDiv.appendChild( block.GetEl() );

	advDialogUIComponents.push( block );

	serializeAdvDialog();
}

function serializeAdvDialog() {
	console.log("SERIALIZE ADVANCED DIALOG");

	var dialogId = getCurDialogId();
	console.log("SERIALIZE DIALOG " + dialogId);

	var allNodes = [];
	for(var i = 0; i < advDialogUIComponents.length; i++) {
		allNodes = allNodes.concat( advDialogUIComponents[i].GetScriptNodes() );
	}
	var scriptRoot = scriptUtils.CreateDialogBlock( allNodes );

	var dialogStr = scriptRoot.Serialize();
	if( dialogStr.length <= 0 )
	{
		paintTool.getCurObject().dlg = null;
		delete dialog[dialogId];
	}
	else
	{
		if( dialogStr.indexOf("\n") > -1 )
			dialogStr = '"""\n' + dialogStr + '\n"""';

		previewDialogScriptTree = scriptRoot; // scriptInterpreter.Parse( dialogStr ); // hacky

		if(!dialogId) {
			var prefix = (drawing.type == TileType.Item) ? "ITM_" : "SPR_";
			dialogId = nextAvailableDialogId( prefix );
			paintTool.getCurObject().dlg = dialogId;
		}

		dialog[dialogId] = dialogStr;
	}

	reloadDialogUICore();
	document.getElementById("dialogCodeText").value = document.getElementById("dialogText").value;
	refreshGameData();
}

function createAdvDialogEditor(scriptTree) {
	console.log("~~~ ADVANCED DIALOG EDITOR ~~~");

	advDialogUIComponents = [];
	seqRadioCount = 0;

	function isBlock(node) { return node.type === "block"; };
	function isChildType(node,type) { return node.children[0].type === type; };
	function isIf(node) { return isBlock(node) && isChildType(node,"if") && !node.children[0].IsSingleLine(); };
	function isSeq(node) { return isBlock(node) && (isChildType(node,"sequence") || isChildType(node,"cycle") || isChildType(node,"shuffle")); };

	var dialogFormDiv = document.getElementById("advDialogViewport");
	dialogFormDiv.innerHTML = "";

	var textBlockNodes = [];
	function addText() {
		if(textBlockNodes.length > 0) {
			console.log("TEXT BLOCK!!");

			addDownArrowToDialogFlow();

			var b = new DialogBlockUI( textBlockNodes, advDialogUIComponents.length+1 );
			dialogFormDiv.appendChild( b.GetEl() );

			advDialogUIComponents.push( b );

			textBlockNodes = [];
		}
	}

	for (var i = 0; i < scriptTree.children.length; i++) {
		var node = scriptTree.children[i];
		if( isIf(node) ) {
			addText();

			// TODO
			console.log("IF NODE!!");
			// console.log(node.Serialize());

			addDownArrowToDialogFlow();

			var b = new IfBlockUI(node, advDialogUIComponents.length+1);
			dialogFormDiv.appendChild( b.GetEl() );

			advDialogUIComponents.push( b );

		}
		else if( isSeq(node) ) {
			addText();

			// TODO
			console.log("SEQ NODE!!");

			addDownArrowToDialogFlow();

			var b = new SeqBlockUI(node, advDialogUIComponents.length+1);
			dialogFormDiv.appendChild( b.GetEl() );

			advDialogUIComponents.push( b );
		}
		else {
			textBlockNodes.push( node );
		}
	}

	addText();
}

function toggleDialogCode(e) {
	console.log("DIALOG CODE");
	console.log(e.target.checked);
	if (e.target.checked) {
		showDialogCode();
	}
	else {
		hideDialogCode();
	}
}

function showDialogCode() {
	document.getElementById("dialogCode").style.display = "block";
	document.getElementById("dialogEditor").style.display = "none";
	// document.getElementById("dialogShowCode").style.display = "none";
	// document.getElementById("dialogHideCode").style.display = "block";
	document.getElementById("dialogTools").style.display = "none";

	document.getElementById("dialogToggleCodeShowText").style.display = "none";
	document.getElementById("dialogToggleCodeHideText").style.display = "inline";
}

function hideDialogCode() {
	document.getElementById("dialogCode").style.display = "none";
	document.getElementById("dialogEditor").style.display = "block";
	// document.getElementById("dialogShowCode").style.display = "block";
	// document.getElementById("dialogHideCode").style.display = "none";
	document.getElementById("dialogTools").style.display = "block";

	document.getElementById("dialogToggleCodeShowText").style.display = "inline";
	document.getElementById("dialogToggleCodeHideText").style.display = "none";
}

function showDialogToolsSection() {
	document.getElementById("dialogToolsSection").style.display = "block";
	document.getElementById("dialogToolsEffects").style.display = "none";
}

function showDialogToolsEffects() {
	document.getElementById("dialogToolsSection").style.display = "none";
	document.getElementById("dialogToolsEffects").style.display = "block";
}

/* INVENTORY UI */
function updateInventoryUI() {
	// console.log("~~~ UPDATE INVENTORY ~~~");
	updateInventoryItemUI();
	updateInventoryVariableUI();
}

function updateInventoryItemUI(){
	var viewport = document.getElementById("inventoryItem");
	viewport.innerHTML = "";

	function createOnItemValueChange(id) {
		return function(event) {
			if(event.target.value <= 0) {
				delete player().inventory[id];
			}
			else {
				player().inventory[id] = parseFloat( event.target.value );
			}
			if(!isPlayMode)
				refreshGameData();
		}
	}

	// console.log("UPDATE!!!!");
	var itemLabel = localization.GetStringOrFallback("item_label", "item");
	for(id in item) {
		var itemName = item[id].name != null ? item[id].name : itemLabel + " " + id;
		// console.log( id );
		// console.log( player() );
		// console.log( player().inventory );
		var itemCount = player().inventory[id] != undefined ? parseFloat( player().inventory[id] ) : 0;

		var itemDiv = document.createElement("div");
		itemDiv.classList.add("controlBox");
		itemDiv.id = "inventoryItem_" + id;
		itemDiv.title = itemName;
		viewport.appendChild(itemDiv);

		var itemNameSpan = document.createElement("span");
		itemNameSpan.innerText = itemName + " : ";
		itemDiv.appendChild( itemNameSpan );

		var itemValueInput = document.createElement("input");
		itemValueInput.type = "number";
		itemValueInput.min = 0;
		itemValueInput.value = itemCount;
		itemValueInput.style.width = "60px";
		itemValueInput.addEventListener('change', createOnItemValueChange(id));
		itemDiv.appendChild( itemValueInput );
	}
}

/*
TODO
- add variables
- delete variables
- make sure variable names are valid
*/
function updateInventoryVariableUI(){
	var viewport = document.getElementById("inventoryVariable");
	viewport.innerHTML = "";

	function createOnVariableValueChange(varInfo) {
		return function(event) {
			console.log("VARIABLE CHANGE " + event.target.value);
			if(isPlayMode) {
				scriptInterpreter.SetVariable( varInfo.id, event.target.value, false /*useHandler*/ );
			}
			else {
				variable[varInfo.id] = event.target.value;
				refreshGameData();
			}
		};
	}

	function createOnVariableNameChange(varInfo,varDiv) {
		return function(event) {
			console.log("VARIABLE NAME CHANGE " + event.target.value);
			if(isPlayMode) {
				var value = ""; // default empty string in case there is no variable yet
				if( scriptInterpreter.HasVariable(varInfo.id) ) {
					value = scriptInterpreter.GetVariable( varInfo.id );
					scriptInterpreter.DeleteVariable( varInfo.id, false /*useHandler*/ );
				}
				scriptInterpreter.SetVariable( event.target.value, value, false /*useHandler*/ );

				varInfo.id = event.target.value;
			}
			else {
				variable[event.target.value] = "" + variable[varInfo.id] + "";
				var oldId = varInfo.id;
				setTimeout(function() {delete variable[oldId]; refreshGameData();}, 0); //hack to avoid some kind of delete race condition? (there has to be a better way)

				varInfo.id = event.target.value;
				varDiv.id = "inventoryVariable_" + varInfo.id;
				varDiv.title = "variable " + varInfo.id;
			}
		}
	}

	function createOnVariableDelete(varInfo) {
		return function () {
			if(isPlayMode) {
				scriptInterpreter.DeleteVariable( varInfo.id );
			}
			else {
				delete variable[varInfo.id];
				refreshGameData();
				updateInventoryVariableUI();
			}
		}
	}

	function addVariableRegister(id) {
		var varName = id;
		var varValue = isPlayMode ? scriptInterpreter.GetVariable(id) : variable[id];

		if(id === null)
		{
			id = "";
			varName = "";
			varValue = "";
		}

		var varInfo = {
			id : id
		};

		var varDiv = document.createElement("div");
		varDiv.classList.add("controlBox");
		varDiv.classList.add("inventoryVariableBox");
		varDiv.id = "inventoryVariable_" + id;
		varDiv.title = "variable " + id;
		viewport.appendChild(varDiv);

		var varNameInput = document.createElement("input");
		varNameInput.type = "text";
		varNameInput.value = varName;
		varNameInput.style.width = "30px";
		varNameInput.addEventListener('change', createOnVariableNameChange(varInfo,varDiv));
		varDiv.appendChild( varNameInput );

		var varSplitSpan = document.createElement("span");
		varSplitSpan.innerText = " : ";
		varDiv.appendChild( varSplitSpan );

		var varValueInput = document.createElement("input");
		varValueInput.type = "text";
		varValueInput.value = varValue;
		varValueInput.style.width = "60px";
		var onVariableValueChange = createOnVariableValueChange(varInfo);
		varValueInput.addEventListener('change', onVariableValueChange);
		varValueInput.addEventListener('keyup', onVariableValueChange);
		varValueInput.addEventListener('keydown', onVariableValueChange);
		varDiv.appendChild( varValueInput );

		var deleteVarEl = document.createElement("button");
		deleteVarEl.appendChild( createIconElement("clear") );
		deleteVarEl.addEventListener('click', createOnVariableDelete(varInfo));
		deleteVarEl.title = "delete this variable";
		varDiv.appendChild(deleteVarEl);	
	}

	if(isPlayMode) {
		var variableNames = scriptInterpreter.GetVariableNames();
		for(var i = 0; i < variableNames.length; i++) {
			var id = variableNames[i];
			addVariableRegister(id);
		}
	}
	else {
		for(id in variable) {
			addVariableRegister(id);
		}
	}

	function createAddButton() {
		var addVarEl = document.createElement("button");
		addVarEl.title = "add new variable";
		addVarEl.appendChild( createIconElement("add") );
		var addVarText = document.createElement("span");
		addVarText.innerText = localization.GetStringOrFallback("variable_add", "add variable");
		console.log("CREATE ADD BUTTON " + addVarText.innerText);
		addVarEl.appendChild( addVarText );
		addVarEl.addEventListener('click', function() {
			viewport.removeChild(addVarEl);
			addVariableRegister(null);
			createAddButton();
		});
		viewport.appendChild(addVarEl);
	};
	createAddButton();
}

function showInventoryItem() {
	document.getElementById("inventoryItem").style.display = "block";
	document.getElementById("inventoryVariable").style.display = "none";
}

function showInventoryVariable() {
	document.getElementById("inventoryItem").style.display = "none";
	document.getElementById("inventoryVariable").style.display = "block";
}

var isPreviewDialogMode = false;
var previewDialogScriptTree = null;
function togglePreviewDialog(event) {
	console.log("TOGGLE PREVIEW " + event.target.checked);
	if(event.target.checked) {
		isPreviewDialogMode = true;
		console.log(isPreviewDialogMode);

		if(previewDialogScriptTree != null) {
			if (document.getElementById("roomPanel").style.display === "none")
				showPanel("roomPanel");

			console.log("PLAY MODE");
			on_play_mode();
		
			startPreviewDialog( previewDialogScriptTree, function() {
				console.log("CALLBACK!!!");
				togglePreviewDialog( { target : { checked : false } } );
			});
		}
	}
	else {
		on_edit_mode();
		isPreviewDialogMode = false;
	}
	updatePlayModeButton();
	updatePreviewDialogButton();
}

var isFixedSize = false;
function chooseExportSizeFull() {
	isFixedSize = false;
	document.getElementById("exportSizeFixedInputSpan").style.display = "none";
}

function chooseExportSizeFixed() {
	isFixedSize = true;
	document.getElementById("exportSizeFixedInputSpan").style.display = "inline-block";
}

// LOCALIZATION
var localization;
function on_change_language(e) {
	on_change_language_inner(e.target.value);
}

function on_change_language_inner(language) {
	changeLnaguageStyle(language); // TODO : misspelled funciton name

	localization.ChangeLanguage(language);
	pickDefaultFontForLanguage(language);
	updateInventoryUI();
	reloadDialogUI();
	hackyUpdatePlaceholderText();

	// update title in new language IF the user hasn't made any changes to the default title
	if (localization.LocalizationContains("default_title", title)) {
		// TODO : localize default_title
		title = localization.GetStringOrFallback("default_title", "Write your game's title here");
		document.getElementById("titleText").value = title;
	}

	// update default sprite
	var defaultSpriteDlgExists = dialog["SPR_0"] != null && localization.LocalizationContains("default_sprite_dlg", dialog["SPR_0"]);
	if (defaultSpriteDlgExists) {
		dialog["SPR_0"] = localization.GetStringOrFallback("default_sprite_dlg", "I'm a cat");
		paintTool.reloadDrawing();
	}

	// update default item
	var defaultItemDlgExists = dialog["ITM_0"] != null && localization.LocalizationContains("default_item_dlg", dialog["ITM_0"]);
	if (defaultItemDlgExists) {
		dialog["ITM_0"] = localization.GetStringOrFallback("default_item_dlg", "You found a nice warm cup of tea");
		paintTool.reloadDrawing(); // hacky to do this twice
	}

	refreshGameData();
}

// TODO : create a system for placeholder text like I have for innerText
function hackyUpdatePlaceholderText() {
	var titlePlaceholder = localization.GetStringOrFallback("title_placeholder", "Title");
	document.getElementById("titleText").placeholder = titlePlaceholder;
	var filterPlaceholder = localization.GetStringOrFallback("filter_placeholder", "filter drawings");
	document.getElementById("paintExplorerFilterInput").placeholder = filterPlaceholder;
}

var curEditorLanguageCode = "en";
function changeLnaguageStyle(newCode) { // TODO : fix function name
	document.body.classList.remove("lang_" + curEditorLanguageCode);
	curEditorLanguageCode = newCode;
	document.body.classList.add("lang_" + curEditorLanguageCode);
}

function pickDefaultFontForLanguage(lang) {
	// TODO : switch to asian characters when we get asian language translations of editor
	if (lang === "en") {
		switchFont("ascii_small", true /*doPickTextDirection*/);
	}
	else if (lang === "ar") {
		switchFont("arabic_pixel", true /*doPickTextDirection*/);
	}
	else if (lang === "zh") {
		switchFont("unicode_asian", true /*doPickTextDirection*/);
	}
	else {
		switchFont("unicode_european_small", true /*doPickTextDirection*/);
	}
	updateFontSelectUI();
	resetMissingCharacterWarning();
}

function on_change_font(e) {
	if (e.target.value != "custom") {
		switchFont(e.target.value, true /*doPickTextDirection*/);
	}
	else {
		if (localStorage.custom_font != null) {
			var fontStorage = JSON.parse(localStorage.custom_font);
			switchFont(fontStorage.name, true /*doPickTextDirection*/);
		}
		else {
			// fallback
			switchFont("ascii_small", true /*doPickTextDirection*/);
		}
	}
	updateFontDescriptionUI();
	// updateEditorTextDirection();
	resetMissingCharacterWarning();
}

function switchFont(newFontName, doPickTextDirection) {
	if (doPickTextDirection === undefined || doPickTextDirection === null) {
		doPickTextDirection = false;
	}

	console.log("SWITCH FONT " + doPickTextDirection);

	fontName = newFontName;

	// hacky - move the font data from the editor to the engine
	fontManager.AddResource(fontName + fontManager.GetExtension(), editorFontManager.GetData(fontName));

	if (doPickTextDirection) {
		console.log("PICK TEXT DIR");
		pickDefaultTextDirectionForFont(newFontName);
	}

	refreshGameData()
}

function initLanguageOptions() {
	localization.Localize();

	var languageSelect = document.getElementById("languageSelect");
	languageSelect.innerHTML = "";

	var languageList = localization.GetLanguageList();
	for (var i = 0; i < languageList.length; i++) {
		var option = document.createElement("option");
		option.innerText = languageList[i].name;
		option.value = languageList[i].id;
		option.selected = languageList[i].id === localization.GetLanguage();
		languageSelect.add(option);
	}

	// is this doing duplicate work??
	on_change_language_inner( localization.GetLanguage() );
}

function on_change_text_direction(e) {
	console.log("CHANGE TEXT DIR " + e.target.value);
	updateEditorTextDirection(e.target.value);
	refreshGameData();
}

function pickDefaultTextDirectionForFont(newFontName) {
	var newTextDirection = TextDirection.LeftToRight;
	if (newFontName === "arabic_pixel") {
		newTextDirection = TextDirection.RightToLeft;
	}
	updateEditorTextDirection(newTextDirection);
	updateTextDirectionSelectUI();
}

function updateEditorTextDirection(newTextDirection) {
	var prevTextDirection = textDirection;
	textDirection = newTextDirection;

	console.log("TEXT BOX TEXT DIR " + textDirection);

	if (prevTextDirection != null) {
		document.body.classList.remove("dir_" + prevTextDirection.toLowerCase());
	}
	document.body.classList.add("dir_" + textDirection.toLowerCase());
}

function updateTextDirectionSelectUI() {
	if (editorDevFlags.arabicFeatures) {
		var textDirSelect = document.getElementById("textDirectionSelect");
		for (var i in textDirSelect.options) {
			var option = textDirSelect.options[i];
			option.selected = (option.value === textDirection);
		}
	}
}

/* DOCS */
function toggleDialogDocs(e) {
	console.log("SHOW DOCS");
	console.log(e.target.checked);
	if (e.target.checked) {
		document.getElementById("dialogDocs").style.display = "block";
		document.getElementById("dialogToggleDocsShowText").style.display = "none";
		document.getElementById("dialogToggleDocsHideText").style.display = "inline";
	}
	else {
		document.getElementById("dialogDocs").style.display = "none";
		document.getElementById("dialogToggleDocsShowText").style.display = "inline";
		document.getElementById("dialogToggleDocsHideText").style.display = "none";
	}
}

/* WARNINGS */
// TODO : turn this into a real system someday instead of hard-coded nonsense
var missingCharacterWarningState = {
	showedWarning : false,
	curFont : null
}

function resetMissingCharacterWarning() {
	// missingCharacterWarningState.showedWarning = false; // should I really do this every time?
	missingCharacterWarningState.curFont = editorFontManager.Get( fontName );
}

function tryWarnAboutMissingCharacters(text) {
	if (missingCharacterWarningState.showedWarning) {
		return;
	}

	var hasMissingCharacter = false;

	console.log(missingCharacterWarningState.curFont.getData());

	for (var i = 0; i < text.length; i++) {
		var character = text[i];
		if (!missingCharacterWarningState.curFont.hasChar(character)) {
			hasMissingCharacter = true;
		}
	}

	if (hasMissingCharacter) {
		showFontMissingCharacterWarning();
	}
}

function showFontMissingCharacterWarning() {
	document.getElementById("fontMissingCharacter").style.display = "block";
	missingCharacterWarningState.showedWarning = true;
}

function hideFontMissingCharacterWarning() {
	document.getElementById("fontMissingCharacter").style.display = "none";
}