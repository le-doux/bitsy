/* MODES */
var EditMode = {
	Edit : 0,
	Play : 1
};

var EditorInputMode = {
	Mouse : 0,
	Touch : 1
};
var curEditorInputMode = EditorInputMode.Mouse;

/* EVENTS */
var events = new EventManager();

// TODO: what the heck is this helper function for?
function defParam(param,value) {
	return (param == undefined || param == null) ? value : param;
};

/* PALETTES */
function selectedColorPal() {
	return paletteTool.GetSelectedId();
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

function nextPaletteId() {
	return nextObjectId( sortedPaletteIdList() );
}

function nextObjectId(idList) {
	if (idList.length <= 0) {
		return "0";
	}

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

function sortedDialogIdList() {
	var keyList = Object.keys(dialog);
	keyList.splice(keyList.indexOf("title"), 1);
	var keyObj = {};
	for (var i = 0; i < keyList.length; i++) {
		keyObj[keyList[i]] = {};
	}

	return sortedBase36IdList(keyObj);
}

function sortedPaletteIdList() {
	var keyList = Object.keys(palette);
	keyList.splice(keyList.indexOf("default"), 1);
	var keyObj = {};
	for (var i = 0; i < keyList.length; i++) {
		keyObj[keyList[i]] = {};
	}

	return sortedBase36IdList(keyObj);
}

function sortedBase36IdList( objHolder ) {
	return Object.keys( objHolder ).sort( function(a,b) { return parseInt(a,36) - parseInt(b,36); } );
}

function nextAvailableDialogId(prefix) {
	return nextObjectId(sortedDialogIdList());
}

function nextObjectHexId(idList) {
	if (idList.length <= 0) {
		return "0";
	}

	var lastId = idList[ idList.length - 1 ];
	var idInt = safeParseHex(lastId);
	idInt++;
	return idInt.toString(16);
}

function sortedHexIdList(objHolder) {
	var objectKeys = Object.keys(objHolder);

	var hexSortFunc = function(key1,key2) {
		return safeParseHex(key1,16) - safeParseHex(key2,16);
	};
	var hexSortedIds = objectKeys.sort(hexSortFunc);

	return hexSortedIds;
}

function safeParseHex(str) {
	var hexInt = parseInt(str,16);
	if (hexInt == undefined || hexInt == null || isNaN(hexInt)) {
		return -1;
	}
	else {
		return hexInt;
	}
}

/* UTILS */
function getContrastingColor(palId) {
	if (isColorDark(palId)) {
		return "#fff";
	}
	else {
		return "#000";
	}
}

function isColorDark(palId) {
	if (!palId) {
		palId = curDefaultPal();
	}

	var hsl = rgbToHsl(getPal(palId)[0][0], getPal(palId)[0][1], getPal(palId)[0][2]);
	var lightness = hsl[2];

	return lightness <= 0.5;
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
function makeTile(id, imageData) {
	var tileData = createDrawingData("TIL", id);
	tileData.frameCount = (!imageData) ? 1 : (imageData.length);
	tileData.isAnimated = tileData.frameCount > 1;
	tile[id] = tileData;
	makeDrawing(tileData.drw, imageData);
}

function makeSprite(id, imageData) {
	var spriteData = createDrawingData("SPR", id);
	spriteData.frameCount = (!imageData) ? 1 : (imageData.length);
	spriteData.isAnimated = spriteData.frameCount > 1;
	sprite[id] = spriteData;
	makeDrawing(spriteData.drw, imageData);
}

function makeItem(id, imageData) {
	var itemData = createDrawingData("ITM", id);
	itemData.frameCount = (!imageData) ? 1 : (imageData.length);
	itemData.isAnimated = itemData.frameCount > 1;
	item[id] = itemData;
	makeDrawing(itemData.drw, imageData);
}

function makeDrawing(id, imageData) {
	if (!imageData) {
		// if there's no image data, initialize with one empty frame
		imageData = [
			[
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
			],
		];
	}

	renderer.SetDrawingSource(id, imageData);
}

/* EVENTS */
function on_change_title(e) {
	setTitle(e.target.value);
	refreshGameData();

	// make sure all editors with a title know to update
	events.Raise("dialog_update", { dialogId:titleDialogId, editorId:null });
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

	// bitsyLog(off, "editor");

	// convert container size to internal canvas size
	var containerRatio = innerSize / Math.min( bounds.width, bounds.height );

	// bitsyLog(containerRatio, "editor");

	off.x *= containerRatio;
	off.y *= containerRatio;

	// bitsyLog(off, "editor");

	return off;
}

// todo : seems like this could be used several places...
// todo : localize
function tileTypeToString(type) {
	if (type == TileType.Tile) {
		return "tile";
	}
	else if (type == TileType.Sprite) {
		return "sprite";
	}
	else if (type == TileType.Avatar) {
		return "avatar";
	}
	else if (type == TileType.Item) {
		return "item";
	}
}

function tileTypeToIdPrefix(type) {
	if (type == TileType.Tile) {
		return "TIL_";
	}
	else if (type == TileType.Sprite || type == TileType.Avatar) {
		return "SPR_";
	}
	else if (type == TileType.Item) {
		return "ITM_";
	}
}

/* DIALOG UI 
- hacky to make this all global
- some of this should be folded into paint tool later
*/
var dialogTool = new DialogTool();
var curDialogEditorId = null; // can I wrap this all up somewhere? -- feels a bit hacky to have all these globals
var curDialogEditor = null;
var curPlaintextDialogEditor = null; // the duplication is a bit weird, but better than recreating editors all the time?
function openDialogTool(dialogId, insertNextToId, showIfHidden) { // todo : rename since it doesn't always "open" it?
	if (showIfHidden === undefined || showIfHidden === null) {
		showIfHidden = true;
	}

	document.getElementById("deleteDialogButton").disabled = dialogId === titleDialogId;

	var showCode = document.getElementById("dialogShowCodeCheck").checked;

	// clean up any existing editors -- is there a more "automagical" way to do this???
	if (curDialogEditor) {
		curDialogEditor.OnDestroy();
		delete curDialogEditor;
	}

	if (curPlaintextDialogEditor) {
		curPlaintextDialogEditor.OnDestroy();
		delete curPlaintextDialogEditor;
	}
	

	curDialogEditorId = dialogId;
	curDialogEditor = dialogTool.CreateEditor(dialogId);
	curPlaintextDialogEditor = dialogTool.CreatePlaintextEditor(dialogId, "largeDialogPlaintextArea");

	var dialogEditorViewport = document.getElementById("dialogEditor");
	dialogEditorViewport.innerHTML = "";

	if (showCode) {
		dialogEditorViewport.appendChild(curPlaintextDialogEditor.GetElement());
	}
	else {
		dialogEditorViewport.appendChild(curDialogEditor.GetElement());
	}

	document.getElementById("dialogName").placeholder = "dialog " + dialogId;
	if (dialogId === titleDialogId) {
		document.getElementById("dialogName").readOnly = true;
		document.getElementById("dialogName").value = titleDialogId;
	}
	else {
		document.getElementById("dialogName").readOnly = false;
		if (dialog[dialogId].name != null) {
			document.getElementById("dialogName").value = dialog[dialogId].name;
		}
		else {
			document.getElementById("dialogName").value = "";
		}
	}

	var isHiddenOrShouldMove = (document.getElementById("dialogPanel").style.display === "none") ||
		(insertNextToId != undefined && insertNextToId != null);

	if (isHiddenOrShouldMove && showIfHidden) {
		bitsyLog("insert next to : " + insertNextToId, "editor");
		showPanel("dialogPanel", insertNextToId);
	}

	events.Raise("select_dialog", { id: curDialogEditorId });
}

// TODO : probably this should be incorporated into the dialog editor main code somehow
function onDialogNameChange(event) {
	if (event.target.value != null && event.target.value.length > 0) {
		dialog[curDialogEditorId].name = event.target.value;
	}
	else {
		dialog[curDialogEditorId].name = null;
	}
	refreshGameData();
}

function nextDialog() {
	var id = titleDialogId; // the title is safe as a default choice

	if (curDialogEditorId != null) {
		var dialogIdList = sortedDialogIdList();
		var dialogIndex = dialogIdList.indexOf(curDialogEditorId);

		// pick the index of the next dialog to open
		dialogIndex++;
		if (dialogIndex >= dialogIdList.length) {
			dialogIndex = -1; // hacky: I'm using -1 to denote the title
		}

		// turn the index into an ID
		if (dialogIndex < 0) {
			id = titleDialogId;
		}
		else {
			id = dialogIdList[dialogIndex];
		}
	}

	openDialogTool(id);

	alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked = false;
}

function prevDialog() {
	var id = titleDialogId; // the title is safe as a default choice

	if (curDialogEditorId != null) {
		var dialogIdList = sortedDialogIdList();
		var dialogIndex = dialogIdList.indexOf(curDialogEditorId);

		// pick the index of the next dialog to open
		if (dialogIndex === -1) {
			dialogIndex = dialogIdList.length - 1;
		}
		else {
			dialogIndex--;
		}

		// turn the index into an ID
		if (dialogIndex < 0) {
			id = titleDialogId;
		}
		else {
			id = dialogIdList[dialogIndex];
		}
	}

	bitsyLog("PREV DIALOG " + id, "editor");

	openDialogTool(id);

	alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked = false;
}

function addNewDialog() {
	var id = nextAvailableDialogId();

	dialog[id] = { src:" ", name:null };
	refreshGameData();

	openDialogTool(id);

	events.Raise("new_dialog", { id:id });

	alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked = false;
}

function duplicateDialog() {
	if (curDialogEditorId != null) {
		var id = nextAvailableDialogId();
		dialog[id] = { src: dialog[curDialogEditorId].src.slice(), name: null, id: id, };
		refreshGameData();

		openDialogTool(id);

		alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked = false;
	}
}

function deleteDialog() {
	var shouldDelete = confirm("Are you sure you want to delete this dialog?");

	if (shouldDelete && curDialogEditorId != null && curDialogEditorId != titleDialogId) {
		var tempDialogId = curDialogEditorId;

		nextDialog();

		// delete all references to deleted dialog (TODO : should this go in a wrapper function somewhere?)
		for (id in sprite) {
			if (sprite[id].dlg === tempDialogId) {
				sprite[id].dlg = null;
			}
		}

		for (id in item) {
			if (item[id].dlg === tempDialogId) {
				item[id].dlg = null;
			}
		}

		for (id in room) {
			for (var i = 0; i < room[id].exits.length; i++) {
				var exit = room[id].exits[i];
				if (exit.dlg === tempDialogId) {
					exit.dlg = null;
				}
			}

			for (var i = 0; i < room[id].endings.length; i++) {
				var end = room[id].endings[i];
				if (end.id === tempDialogId) {
					room[id].endings.splice(i, 1);
					i--;
				}
			}
		}

		delete dialog[tempDialogId];
		refreshGameData();

		alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked = false;

		events.Raise("dialog_delete", { dialogId:tempDialogId, editorId:null });
	}
}

// TODO : move into the paint tool
var paintDialogWidget = null;
function reloadDialogUI() {
	var dialogContent = document.getElementById("dialog");
	dialogContent.innerHTML = "";

	var obj = drawing;

	// clean up previous widget
	if (paintDialogWidget) {
		paintDialogWidget.OnDestroy();
		delete paintDialogWidget;
	}

	paintDialogWidget = dialogTool.CreateWidget(
		"dialog",
		"paintPanel",
		obj.dlg,
		true,
		function(id) {
			obj.dlg = id;
		},
		{
			CreateFromEmptyTextBox: true,
			OnCreateNewDialog: function(id) {
				obj.dlg = id;
				refreshGameData();
			},
			GetDefaultName: function() {
				var desc = getDrawingNameOrDescription(drawing);
				return CreateDefaultName(desc + " dialog", dialog, true); // todo : localize
			}, // todo : localize
		});
	dialogContent.appendChild(paintDialogWidget.GetElement());

	if (alwaysShowDrawingDialog && dialog[obj.dlg]) {
		openDialogTool(obj.dlg, null, false);
	}
}

// hacky - assumes global paintTool object
function getCurDialogId() {
	return getDrawingDialogId(drawing);
}

function setDefaultGameState() {
	var defaultData = Resources["defaultGameData.bitsy"];
	// bitsyLog("DEFAULT DATA \n" + defaultData, "editor");
	document.getElementById("game_data").value = defaultData;
	Store.set('game_data', document.getElementById("game_data").value); // save game
	clearGameData();
	loadWorldFromGameData(document.getElementById("game_data").value); // load game

	// refresh images
	renderer.ClearCache();
}

function newGameDialog() {
	var resetMessage = localization.GetStringOrFallback("reset_game_message", "Starting a new game will erase your old data. Consider exporting your work first! Are you sure you want to start over?");
	if (confirm(resetMessage)) {
		resetGameData();
	}
}

function resetGameData() {
	setDefaultGameState();

	// TODO : localize default_title
	setTitle(localization.GetStringOrFallback("default_title", "Write your game's title here"));
	dialog["0"] = {
		src: localization.GetStringOrFallback("default_sprite_dlg", "I'm a cat"), // hacky to do this in two places :(
		name: "cat dialog", // todo : localize
	};
	dialog["1"] = {
		src: localization.GetStringOrFallback("default_item_dlg", "You found a nice warm cup of tea"),
		name: "tea dialog", // todo : localize
	};

	pickDefaultFontForLanguage(localization.GetLanguage());

	// todo wrap these variable resets in a function
	tileIndex = 0;
	spriteIndex = 0;

	refreshGameData();

	// refresh images
	renderer.ClearCache();

	updateExitOptionsFromGameData();
	updateInventoryUI();
	updateFontSelectUI(); // hmm is this really the place for this?

	on_paint_avatar();
	document.getElementById('paintOptionAvatar').checked = true;

	paintTool.updateCanvas();
	markerTool.Clear(); // hacky -- should combine more of this stuff together
	markerTool.Refresh();

	roomTool.selectAtIndex(0);
	tuneTool.selectAtIndex(0);
	blipTool.selectAtIndex(0);

	events.Raise("game_data_change"); // TODO -- does this need to have a specific reset event or flag?

	// reset find tool (a bit heavy handed?)
	findTool = new FindTool({
		mainElement : document.getElementById("findPanelMain"),
	});
}

function refreshGameData() {
	if (isPlayMode) {
		return; //never store game data while in playmode (TODO: wouldn't be necessary if the game data was decoupled form editor data)
	}

	flags.ROOM_FORMAT = 1; // always save out comma separated format, even if the old format is read in

	// var gameData = serializeWorld();

	// document.getElementById("game_data").value = gameData; // TODO : this is where the slow down is

	var gameDataNoFonts = serializeWorld(true);
	document.getElementById("game_data").value = showFontDataInGameData ? serializeWorld() : gameDataNoFonts;

	// Store.set("game_data", gameData); //auto-save

	Store.set("game_data", gameDataNoFonts);
}

/* TIMER */
function Timer() {
	var start = Date.now();

	this.Seconds = function() {
		return Math.floor( (Date.now() - start) / 1000 );
	}

	this.Milliseconds = function() {
		return Date.now() - start;
	}
}

var editMode = EditMode.Edit; // TODO : move to core.js?

/* TOOL CONTROLLERS */
var roomTool;
var paintTool;

/* CUR DRAWING */
var drawing;

var tileIndex = 0;
var spriteIndex = 0;
var itemIndex = 0;

/* ROOM */
var roomIndex = 0;

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
var defaultFonts = [
		"ascii_small.bitsyfont",
		"unicode_european_small.bitsyfont",
		"unicode_european_large.bitsyfont",
		"unicode_asian.bitsyfont",
		"arabic.bitsyfont",
	];
fontManager = new FontManager(defaultFonts); // replaces font manager in the engine with one containing all fonts loaded in the editor

function detectBrowserFeatures() {
	bitsyLog("BROWSER FEATURES", "editor");
	//test feature support
	try {
		var input = document.createElement("input");
		input.type = "color";
		document.body.appendChild(input);

		if (input.type === "color") {
			bitsyLog("color picker supported!", "editor");
			browserFeatures.colorPicker = true;
		} else {
			browserFeatures.colorPicker = false;
		}

		if(input.offsetWidth <= 10 && input.offsetHeight <= 10) {
			// bitsyLog(input.clientWidth, "editor");
			bitsyLog("WEIRD SAFARI COLOR PICKER IS BAD!", "editor");
			browserFeatures.colorPicker = false;
			document.getElementById("pageColor").type = "text";
		}
		
		document.body.removeChild(input);
	} catch(e) {
		browserFeatures.colorPicker = false;
	}

	var a = document.createElement('a');
	if (typeof a.download != "undefined") {
		bitsyLog("downloads supported!", "editor");
		browserFeatures.fileDownload = true;
	}
	else {
		browserFeatures.fileDownload = false;
	}

	browserFeatures.blobURL = (!!new Blob) && (URL != undefined || webkitURL != undefined);
	if( browserFeatures.blobURL ) {
		bitsyLog("blob supported!", "editor");
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
		{ id:"dialogPanel",			visible:false,	position:8 },
		{ id:"findPanel",			visible:false,	position:9  },
		{ id:"inventoryPanel",		visible:false,	position:10 },
		{ id:"settingsPanel",		visible:false,	position:11 },
		{ id:"tunePanel",			visible:false,	position:12 },
		{ id:"blipPanel",			visible:false,	position:13 },
	]
};
// bitsyLog(defaultPanelPrefs, "editor");

function getPanelPrefs() {
	// (TODO: weird that engine version and editor version are the same??)
	var storedEngineVersion = Store.get('engine_version');
	var useDefaultPrefs = (!storedEngineVersion) ||
	                      (storedEngineVersion.major < 8) ||
	                      (storedEngineVersion.minor < 0);
	var prefs = useDefaultPrefs ? defaultPanelPrefs : Store.get('panel_prefs', defaultPanelPrefs);

	// add missing panel prefs (if any)
	// bitsyLog(defaultPanelPrefs, "editor");
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

var urlParameters = {};
function readUrlParameters() {
	bitsyLog(" --- reading url parameters --- ", "editor");

	var urlSplit = window.location.href.split("?");

	if (urlSplit.length >= 2) {
		var queryString = urlSplit[1];
		var queryStringSplit = queryString.split("&");

		for (var i = 0; i < queryStringSplit.length; i++) {
			var parameterSplit = queryStringSplit[i].split("=");

			if (parameterSplit.length >= 2) {
				var parameterName = parameterSplit[0];
				var parameterValue = parameterSplit[1];

				bitsyLog("parameter " + parameterName + " = " + parameterValue, "editor");
				urlParameters[parameterName] = parameterValue;
			}
		}
	}
}

function isPortraitOrientation() {
	var isPortrait = false;

	if (window.screen.orientation != undefined) {
		// most browsers
		isPortrait = window.screen.orientation.type.includes("portrait");
	}
	else if (window.orientation != undefined) {
		// iOS safari
		isPortrait = window.orientation == 0 || window.orientation == 180;
	}

	return isPortrait;
}

function start() {
	initSystem();

	events.Listen("game_data_change", function(event) {
		// TODO -- over time I can move more things in here
		// on the other hand this is still sort of global thing that we don't want TOO much of

		// force re-load the dialog tool
		openDialogTool(titleDialogId);
	});

	isPlayerEmbeddedInEditor = true; // flag for game player to make changes specific to editor

	detectBrowserFeatures();

	readUrlParameters();

	// load icons and replace placeholder elements
	var elements = document.getElementsByClassName("bitsy_icon");
	for(var i = 0; i < elements.length; i++) {
		iconUtils.LoadIcon(elements[i]);
	}

	var elements = document.getElementsByClassName("bitsy_icon_anim");
	for(var i = 0; i < elements.length; i++) {
		iconUtils.LoadIconAnimated(elements[i]);
	}

	// localization
	localization = new Localization(urlParameters["lang"]);
	Store.init(function () {
		// TODO: localize
		window.alert('A storage error occurred: The editor will continue to work, but data may not be saved/loaded. Make sure to export a local copy after making changes, or your gamedata may be lost!');
	});

	paintTool = new PaintTool(document.getElementById("paint"), document.getElementById("newPaintMenu"));
	paintTool.onReloadTile = function(){ reloadTile() };
	paintTool.onReloadSprite = function(){ reloadSprite() };
	paintTool.onReloadItem = function(){ reloadItem() };

	markerTool = new RoomMarkerTool(document.getElementById("markerCanvas1"), document.getElementById("markerCanvas2") );
	bitsyLog("MARKER TOOL " + markerTool, "editor");

	//
	drawingThumbnailCanvas = document.createElement("canvas");
	drawingThumbnailCanvas.width = tilesize * scale;
	drawingThumbnailCanvas.height = tilesize * scale;
	drawingThumbnailCtx = drawingThumbnailCanvas.getContext("2d");

	// load custom font
	var fontStorage = Store.get('custom_font');
	if (fontStorage) {
		fontManager.AddResource(fontStorage.name + ".bitsyfont", fontStorage.fontdata);
	}

	//load last auto-save
	var gamedataStorage = Store.get('game_data');
	if (gamedataStorage) {
		//bitsyLog("~~~ found old save data! ~~~", "editor");
		//bitsyLog(gamedataStorage, "editor");
		document.getElementById("game_data").value = gamedataStorage;
		on_game_data_change_core();
	}
	else {
		setDefaultGameState();
	}

	drawing = sprite["A"]; // will this break?

	roomIndex = sortedRoomIdList().indexOf(state.room);

	//draw everything
	on_paint_avatar();
	paintTool.updateCanvas();
	markerTool.Refresh();

	document.getElementById("inventoryOptionItem").checked = true; // a bit hacky
	updateInventoryUI();

	// init color picker
	colorPicker = new ColorPicker('colorPickerWheel', 'colorPickerSelect', 'colorPickerSliderThumb', 'colorPickerSliderBg', 'colorPickerHexText');
	document.getElementById("colorPaletteOptionBackground").checked = true;
	paletteTool = new PaletteTool(colorPicker,["colorPaletteLabelBackground", "colorPaletteLabelTile", "colorPaletteLabelSprite"],"paletteName");
	events.Listen("palette_change", function(event) {
		refreshGameData();
	});
	events.Listen("palette_list_change", function(event) {
		refreshGameData();
	});

	//unsupported feature stuff
	if (hasUnsupportedFeatures() && !isPortraitOrientation()) {
		showUnsupportedFeatureWarning();
	}
	if (!browserFeatures.fileDownload) {
		document.getElementById("downloadHelp").style.display = "block";
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

	onGameReset = function() {
		updateInventoryUI();
	}

	onInitRoom = function(id) {
		var name = "";

		// basically copied from find tool
		if (room[id].name) {
			name = room[id].name;
		}
		else {
			name = localization.GetStringOrFallback("room_label", "room") + " " + id;
		}

		if (roomTool && isPlayMode) {
			var curRoomLocationDiv = document.getElementById("curRoomLocation");
			curRoomLocationDiv.innerHTML = "";
			curRoomLocationDiv.appendChild(createLabelElement({
				icon: "set_exit_location",
				text: name
			}));
		}
	}

	//color testing
	// on_change_color_bg();
	// on_change_color_tile();
	// on_change_color_sprite();

	// save latest version used by editor (for compatibility)
	Store.set('engine_version', version);

	// load saved export settings
	export_settings = Store.get('export_settings', export_settings);
	if (export_settings) {
		document.getElementById("pageColor").value = export_settings.page_color;
	}

	// TODO : interesting idea but needs work!
	// // try to honor state of all checkboxes from previous session
	// var inputElements = document.getElementsByTagName("input");
	// for (var i in inputElements) {
	// 	if (inputElements[i].type === "checkbox") {
	// 		var checkbox = inputElements[i];
	// 		if (checkbox.checked) {
	// 			bitsyLog(checkbox, "editor");
	// 			checkbox.dispatchEvent(new Event("click"));
	// 		}
	// 	}
	// }

	// create title widgets
	var titleTextWidgets = document.getElementsByClassName("titleWidgetContainer");
	for (var i = 0; i < titleTextWidgets.length; i++) {
		var widget = dialogTool.CreateTitleWidget();
		titleTextWidgets[i].appendChild(widget.GetElement());
	}

	// prepare dialog tool
	openDialogTool(titleDialogId, undefined, false); // start with the title open
	alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked;

	initLanguageOptions();

	// find tool
	findTool = new FindTool({
		mainElement : document.getElementById("findPanelMain"),
	});

	// hack: reload drawing after find tool is created, so the blip dropdown is up-to-date
	paintTool.reloadDrawing();

	// ROOM TOOL
	roomTool = makeRoomTool();
	roomTool.rootElement.classList.add("bitsy-playmode-enable");
	roomTool.titlebarElement.classList.add("bitsy-playmode-reverse-color");
	roomTool.nav.element.classList.add("bitsy-playmode-hide");
	var curRoomLocationDiv = document.createElement("div");
	curRoomLocationDiv.id = "curRoomLocation";
	curRoomLocationDiv.classList.add("bitsy-playmode-show");
	curRoomLocationDiv.classList.add("bitsy-playmode-room-location");
	roomTool.mainElement.insertBefore(curRoomLocationDiv, roomTool.canvasElement);
	// attach engine to room tool canvas for play mode
	attachCanvas(roomTool.canvasElement);

	// sound tools
	tuneTool = makeTuneTool();
	blipTool = makeBlipTool();

	// load panel preferences
	var prefs = getPanelPrefs();
	Store.set('panel_prefs', prefs); // save loaded prefs
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

	// about tool
	initAbout();
}

function newDrawing() {
	paintTool.newDrawing();
}

function nextTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex + 1) % ids.length;

	var tileId = ids[tileIndex];
	drawing = tile[tileId];

	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function prevTile() {
	var ids = sortedTileIdList();

	tileIndex = (tileIndex - 1) % ids.length;
	if (tileIndex < 0) {
		tileIndex = (ids.length - 1);
	}

	var tileId = ids[tileIndex];
	drawing = tile[tileId];

	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function on_drawing_name_change() {
	var str = document.getElementById("drawingName").value;
	var obj = paintTool.getCurObject();
	var oldName = obj.name;
	if(str.length > 0)
		obj.name = str;
	else
		obj.name = null;

	bitsyLog("NEW NAME!", "editor");
	bitsyLog(obj, "editor");

	updateNamesFromCurData()

	// update display name for thumbnail
	var displayName = obj.name ? obj.name : getCurPaintModeStr() + " " + drawing.id;

	// make sure items referenced in scripts update their names
	if(drawing.type === TileType.Item) {
		// bitsyLog("SWAP ITEM NAMES", "editor");

		var ItemNameSwapVisitor = function() {
			var didSwap = false;
			this.DidSwap = function() { return didSwap; };

			this.Visit = function(node) {
				// bitsyLog("VISIT!", "editor");
				// bitsyLog(node, "editor");

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

		// bitsyLog(oldName + " <-> " + newName, "editor");

		if(newName != oldName) {
			for(dlgId in dialog) {
				// bitsyLog("DLG " + dlgId, "editor");
				var dialogScript = scriptInterpreter.Parse(dialog[dlgId].src);
				var visitor = new ItemNameSwapVisitor();
				dialogScript.VisitAll(visitor);
				if (visitor.DidSwap()) {
					var newDialog = dialogScript.Serialize();
					if (newDialog.indexOf("\n") > -1) {
						newDialog = '"""\n' + newDialog + '\n"""';
					}
					dialog[dlgId].src = newDialog;
				}
			}
		}

		updateInventoryItemUI();

		// renderPaintThumbnail( drawing.id ); // hacky way to update name
	}

	refreshGameData();
	bitsyLog(names, "editor");
}

function on_palette_name_change(event) {
	paletteTool.ChangeSelectedPaletteName(event.target.value);
}

function selectRoom(roomId) {
	roomTool.select(roomId);
}

function copyExitData(exit) {
	return createExitData(
		exit.x,
		exit.y,
		exit.dest.room,
		exit.dest.x,
		exit.dest.y,
		exit.transition_effect,
		exit.dlg);
}

function copyEndingData(ending) {
	return createEndingData(ending.id, ending.x, ending.y);
}

function nextItem() {
	var ids = sortedItemIdList();
	itemIndex = (itemIndex + 1) % ids.length;

	var itemId = ids[itemIndex];
	drawing = item[itemId];

	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function prevItem() {
	var ids = sortedItemIdList();

	itemIndex = (itemIndex - 1) % ids.length;
	if (itemIndex < 0) {
		itemIndex = (ids.length - 1); // loop
	}

	var itemId = ids[itemIndex];
	drawing = item[itemId];

	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function nextSprite() {
	var ids = sortedSpriteIdList();

	spriteIndex = (spriteIndex + 1) % ids.length;
	if (spriteIndex === 0) {
		spriteIndex = 1; //skip avatar
	}

	var spriteId = ids[spriteIndex];
	drawing = sprite[spriteId];

	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
}

function prevSprite() {
	var ids = sortedSpriteIdList();

	spriteIndex = (spriteIndex - 1) % ids.length;
	if (spriteIndex <= 0) {
		spriteIndex = (ids.length - 1); //loop and skip avatar
	}

	var spriteId = ids[spriteIndex];
	drawing = sprite[spriteId];

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

	events.Raise("select_drawing", { id: drawing.id, type: drawing.type });
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

	events.Raise("select_drawing", { id: drawing.id, type: drawing.type });
}

function copyDrawingData(sourceDrawingData) {
    var copiedDrawingData = [];

    for (frame in sourceDrawingData) {
        copiedDrawingData.push([]);
        for (y in sourceDrawingData[frame]) {
            copiedDrawingData[frame].push([]);
            for (x in sourceDrawingData[frame][y]) {
                copiedDrawingData[frame][y].push(sourceDrawingData[frame][y][x]);
            }
        }
    }

    return copiedDrawingData;
}

function duplicateDrawing() {
    paintTool.duplicateDrawing();
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
			document.getElementById("animationKeyframe1").className = "bitsy-thumbnail bitsy-thumbnail-selected";
			document.getElementById("animationKeyframe2").className = "bitsy-thumbnail";
		}
		else if( paintTool.curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "bitsy-thumbnail";
			document.getElementById("animationKeyframe2").className = "bitsy-thumbnail bitsy-thumbnail-selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_more");
		renderAnimationPreview(drawing);
	}
	else {
		paintTool.isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_less");
	}

	// wall UI
	updateWallCheckboxOnCurrentTile();

	updateDrawingNameUI(true);

	paintTool.updateCanvas();
}

function updateWallCheckboxOnCurrentTile() {
	var isCurTileWall = false;

	if( tile[ drawing.id ].isWall == undefined || tile[ drawing.id ].isWall == null ) {
		if (room[state.room]) {
			isCurTileWall = (room[state.room].walls.indexOf(drawing.id) != -1);
		}
	}
	else {
		isCurTileWall = tile[ drawing.id ].isWall;
	}

	if (isCurTileWall) {
		document.getElementById("wallCheckbox").checked = true;
		iconUtils.LoadIcon(document.getElementById("wallCheckboxIcon"), "wall_on");
	}
	else {
		document.getElementById("wallCheckbox").checked = false;
		iconUtils.LoadIcon(document.getElementById("wallCheckboxIcon"), "wall_off");
	}
}

function reloadSprite() {
	// animation UI
	if ( sprite[drawing.id] && sprite[drawing.id].animation.isAnimated ) {
		paintTool.isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;

		if( paintTool.curDrawingFrameIndex == 0)
		{
			document.getElementById("animationKeyframe1").className = "bitsy-thumbnail bitsy-thumbnail-selected";
			document.getElementById("animationKeyframe2").className = "bitsy-thumbnail";
		}
		else if( paintTool.curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "bitsy-thumbnail";
			document.getElementById("animationKeyframe2").className = "bitsy-thumbnail bitsy-thumbnail-selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_more");
		renderAnimationPreview(drawing);
	}
	else {
		paintTool.isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_less");
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
			document.getElementById("animationKeyframe1").className = "bitsy-thumbnail bitsy-thumbnail-selected";
			document.getElementById("animationKeyframe2").className = "bitsy-thumbnail";
		}
		else if( paintTool.curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "bitsy-thumbnail";
			document.getElementById("animationKeyframe2").className = "bitsy-thumbnail bitsy-thumbnail-selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_more");
		renderAnimationPreview(drawing);
	}
	else {
		paintTool.isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_less");
	}

	// dialog UI
	reloadDialogUI()

	updateDrawingNameUI(true);

	// update paint canvas
	paintTool.updateCanvas();

}

function deleteDrawing() {
	paintTool.deleteDrawing();
	events.Raise("select_drawing", { id: drawing.id, type: drawing.type });
}

function toggleToolBar(e) {
	if (e.target.checked) {
		document.getElementById("toolsPanel").style.display = "flex";
		document.getElementById("appRoot").classList.add("bitsy-toolbar-open");
	}
	else {
		document.getElementById("toolsPanel").style.display = "none";
		document.getElementById("appRoot").classList.remove("bitsy-toolbar-open");
	}
}

function toggleDownloadOptions(e) {
	if( e.target.checked ) {
		document.getElementById("downloadOptions").style.display = "block";
		iconUtils.LoadIcon(document.getElementById("downloadOptionsCheckIcon"), "expand_more");
	}
	else {
		document.getElementById("downloadOptions").style.display = "none";
		iconUtils.LoadIcon(document.getElementById("downloadOptionsCheckIcon"), "expand_less");
	}
}

// hacky - part of hiding font data from the game data
function getFullGameData() {
	// return document.getElementById("game_data").value + fontManager.GetData(fontName);
	return serializeWorld();
}

function togglePlayMode(e) {
	if (e.target.checked) {
		on_play_mode();
	}
	else {
		on_edit_mode();
	}

	updatePlayModeButton();
}

function on_play_mode() {
	isPlayMode = true;
	if (document.getElementById("roomPanel").style.display === "none") {
		showPanel("roomPanel");
	}
	else {
		document.getElementById("roomPanel").scrollIntoView();
	}
	roomTool.setTitlebar("play", "playing...");
	roomTool.system._active = false;
	roomTool.menu.update();
	document.getElementById("appRoot").classList.add("bitsy-playmode");
	// todo : I feel likef I need to take a look at the font manager and simplify things there
	loadGame(roomTool.canvasElement, getFullGameData(), fontManager.GetData(defaultFontName));
}

function on_edit_mode() {
	isPlayMode = false;

	document.getElementById("appRoot").classList.remove("bitsy-playmode");

	// stopGame();
	quitGame();

	// TODO I should really do more to separate the editor's game-data from the engine's game-data
	loadWorldFromGameData(document.getElementById("game_data").value); //reparse world to account for any changes during gameplay

	state.room = sortedRoomIdList()[roomIndex]; //restore current room to pre-play state

	markerTool.RefreshKeepSelection();

	reloadDialogUI();

	updateInventoryUI();

	if(isPreviewDialogMode) {
		isPreviewDialogMode = false;
		updatePreviewDialogButton();

		// TODO : rework dialog highlighting
		// for(var i = 0; i < advDialogUIComponents.length; i++) {
		// 	advDialogUIComponents[i].GetEl().classList.remove("highlighted");
		// }
	}

	// make sure global drawing object is from the current world data
	if (drawing.type === TileType.Tile) {
		drawing = tile[drawing.id];
	}
	else if (drawing.type === TileType.Avatar || drawing.type === TileType.Sprite) {
		drawing = sprite[drawing.id];
	}
	else if (drawing.type === TileType.Item) {
		drawing = item[drawing.id];
	}
	paintTool.reloadDrawing();

	renderer.ClearCache(true);
	roomTool.resetTitlebar();
	roomTool.system._active = true;
	roomTool.menu.update();

	events.Raise("on_edit_mode");
}

function updatePlayModeButton() {
	document.getElementById("playModeCheck").checked = isPlayMode;
	iconUtils.LoadIcon(document.getElementById("playModeIcon"), isPlayMode ? "stop" : "play");

	var stopText = localization.GetStringOrFallback("stop_game", "stop");
	var playText = localization.GetStringOrFallback("play_game", "play");
	document.getElementById("playModeText").innerHTML = isPlayMode ? stopText : playText;
}

function updatePreviewDialogButton() {
	// todo : remove?
}

function togglePaintGrid(e) {
	paintTool.drawPaintGrid = e.target.checked;
	updatePaintGridCheck(paintTool.drawPaintGrid);
	paintTool.updateCanvas();
	setPanelSetting("paintPanel", "grid", paintTool.drawPaintGrid);
}

function updatePaintGridCheck(checked) {
	document.getElementById("paintGridCheck").checked = checked;
	iconUtils.LoadIcon(document.getElementById("paintGridIcon"), checked ? "visibility" : "visibility_off");
}

var showFontDataInGameData = false;
function toggleFontDataVisibility(e) {
	showFontDataInGameData = e.target.checked;
	iconUtils.LoadIcon(document.getElementById("fontDataIcon"), e.target.checked ? "visibility" : "visibility_off");
	refreshGameData(); // maybe a bit expensive
}

/* PALETTE STUFF */
var colorPicker = null;
var paletteTool = null;

function changeColorPickerIndex(index) {
	paletteTool.changeColorPickerIndex(index);
}

function prevPalette() {
	paletteTool.SelectPrev();
}

function nextPalette() {
	paletteTool.SelectNext();
}

function newPalette() {
	paletteTool.AddNew();
}

function duplicatePalette() {
	paletteTool.AddDuplicate();
}

function deletePalette() {
	paletteTool.DeleteSelected();
}

function roomPaletteChange(event) {
	var palId = event.target.value;
	room[state.room].pal = palId;

	// hacky?
	initRoom(state.room);

	refreshGameData();

	paintTool.updateCanvas();
}

function updateDrawingNameUI() {
	var obj = paintTool.getCurObject();

	if (drawing.type == TileType.Avatar) { // hacky
		document.getElementById("drawingName").value = "avatar"; // TODO: localize
	}
	else if (obj.name != null) {
		document.getElementById("drawingName").value = obj.name;
	}
	else {
		document.getElementById("drawingName").value = "";
	}

	document.getElementById("drawingName").placeholder = getCurPaintModeStr() + " " + drawing.id;

	document.getElementById("drawingName").readOnly = (drawing.type == TileType.Avatar);
}

function on_paint_avatar() {
	spriteIndex = 0;
	drawing = sprite["A"];

	paintTool.reloadDrawing();
	on_paint_avatar_ui_update();

	events.Raise("select_drawing", { id: drawing.id, type: drawing.type });
}

function on_paint_avatar_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:none;");
	// TODO : make navigation commands un-clickable
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(false);
	document.getElementById("paintOptionAvatar").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");

	var disableForAvatarElements = document.getElementsByClassName("disableForAvatar");
	for (var i = 0; i < disableForAvatarElements.length; i++) {
		disableForAvatarElements[i].disabled = true;
	}
}

function on_paint_tile() {
	tileIndex = 0;
	var tileId = sortedTileIdList()[tileIndex];
	drawing = tile[tileId];

	paintTool.reloadDrawing();
	on_paint_tile_ui_update();

	events.Raise("select_drawing", { id: drawing.id, type: drawing.type });
}

function on_paint_tile_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:block;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	document.getElementById("paintOptionTile").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");

	var disableForAvatarElements = document.getElementsByClassName("disableForAvatar");
	for (var i = 0; i < disableForAvatarElements.length; i++) {
		disableForAvatarElements[i].disabled = false;
	}
}

function on_paint_sprite() {
	if (sortedSpriteIdList().length > 1)
	{
		spriteIndex = 1;
	}
	else {
		spriteIndex = 0; //fall back to avatar if no other sprites exist
	}

	var spriteId = sortedSpriteIdList()[spriteIndex];
	drawing = sprite[spriteId];

	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
	on_paint_sprite_ui_update();

	events.Raise("select_drawing", { id: drawing.id, type: drawing.type });
}

function on_paint_sprite_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	document.getElementById("paintOptionSprite").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");

	var disableForAvatarElements = document.getElementsByClassName("disableForAvatar");
	for (var i = 0; i < disableForAvatarElements.length; i++) {
		disableForAvatarElements[i].disabled = false;
	}
}

function on_paint_item() {
	itemIndex = 0;
	var itemId = sortedItemIdList()[itemIndex];
	drawing = item[itemId];

	paintTool.curDrawingFrameIndex = 0;
	paintTool.reloadDrawing();
	on_paint_item_ui_update();

	events.Raise("select_drawing", { id: drawing.id, type: drawing.type });
}

function on_paint_item_ui_update() {
	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	document.getElementById("paintOptionItem").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:inline-block;");

	var disableForAvatarElements = document.getElementsByClassName("disableForAvatar");
	for (var i = 0; i < disableForAvatarElements.length; i++) {
		disableForAvatarElements[i].disabled = false;
	}
}

// todo : delete
function editDrawingAtCoordinate(x, y) {
	var spriteId = getSpriteAt(x,y); // todo: need more consistency with these methods
	// bitsyLog(spriteId, "editor");
	if(spriteId) {
		if(spriteId === "A") {
			on_paint_avatar_ui_update();
		}
		else {
			on_paint_sprite_ui_update();
		}

		paintTool.selectDrawing(sprite[spriteId]);
		return true;
	}

	var itemObj = getItem(state.room,x,y);
	// bitsyLog(item, "editor");
	if(itemObj) {
		on_paint_item_ui_update();
		paintTool.selectDrawing(item[itemObj.id]);
		return true;
	}

	var tileId = getTile(x,y);
	// bitsyLog(tileId, "editor");
	if(tileId != 0) {
		on_paint_tile_ui_update(); // really wasteful probably
		paintTool.selectDrawing(tile[tileId]);
		return true;
	}

	return false;
}

var animationThumbnailRenderer = new ThumbnailRenderer();
function renderAnimationThumbnail(imgId, drawing, frameIndex) {
	animationThumbnailRenderer.Render(imgId, drawing, frameIndex);
}

function renderAnimationPreview(drawing) {
	renderAnimationThumbnail("animationThumbnailPreview", drawing);
	renderAnimationThumbnail("animationThumbnailFrame1", drawing, 0);
	renderAnimationThumbnail("animationThumbnailFrame2", drawing, 1);
}

function renderPaintThumbnail(drawing) {
	renderAnimationThumbnail("animationThumbnailPreview", drawing);
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
	on_change_dialog();
}

function on_game_data_change() {
	on_game_data_change_core();
	refreshGameData();
}

function on_game_data_change_core() {
	bitsyLog(document.getElementById("game_data").value, "editor");

	clearGameData();
	loadWorldFromGameData(document.getElementById("game_data").value); //reparse world if user directly manipulates game data

	if (roomTool) {
		roomTool.selectAtIndex(0);
	}

	if (tuneTool) {
		tuneTool.selectAtIndex(0);
	}

	if (blipTool) {
		blipTool.selectAtIndex(0);
	}

	if (markerTool) {
		markerTool.Refresh();
	}

	var curPaintMode = TileType.Avatar;

	if (drawing) {
		curPaintMode = drawing.type;
	}

	//fallback if there are no tiles, sprites, map
	// TODO : switch to using stored default file data (requires separated parser / game data code)
	if (Object.keys(sprite).length == 0) {
		makeSprite("A");
		sprite["A"].room = null;
		sprite["A"].x = -1;
		sprite["A"].y = -1;
	}
	if (Object.keys(tile).length == 0) {
		makeTile("a");
	}
	if (Object.keys(room).length == 0) {
		// TODO : ?
	}
	if (Object.keys(item).length == 0) {
		makeItem("0");
	}

	// refresh images
	renderer.ClearCache();

	roomIndex = 0;

	if (curPaintMode === TileType.Tile) {
		drawing = tile[sortedTileIdList()[0]];
	}
	else if (curPaintMode === TileType.Item) {
		drawing = item[sortedItemIdList()[0]];
	}
	else if (curPaintMode === TileType.Avatar) {
		drawing = sprite["A"];
	}
	else if (curPaintMode === TileType.Sprite) {
		drawing = sprite[sortedSpriteIdList().filter(function (id) { return id != "A"; })[0]];
	}

	paintTool.reloadDrawing();

	// if user pasted in a custom font into game data - update the stored custom font
	if (defaultFonts.indexOf(fontName + fontManager.GetExtension()) == -1) {
		var fontStorage = {
			name : fontName,
			fontdata : fontManager.GetData(fontName)
		};
		Store.set('custom_font', fontStorage);
	}

	updateInventoryUI();

	updateFontSelectUI();

	// TODO -- start using this for more things
	events.Raise("game_data_change");
}

function updateFontSelectUI() {
	var fontStorage = Store.get('custom_font', null);

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
		// bitsyLog(fontDescriptionId, "editor");
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
	iconUtils.LoadIcon(document.getElementById("wallCheckboxIcon"), checked ? "wall_on" : "wall_off");
}

function filenameFromGameTitle() {
	var filename = getTitle().replace(/[^a-zA-Z]/g, "_"); // replace non alphabet characters
	filename = filename.toLowerCase();
	filename = filename.substring(0,32); // keep it from getting too long
	return filename;
}

function exportGame() {
	if (isPlayMode) {
		alert("You can't download your game while you're playing it! Sorry :(");
		return;
	}

	refreshGameData(); //just in case
	// var gameData = document.getElementById("game_data").value; //grab game data
	var gameData = getFullGameData();
	var size = document.getElementById("exportSizeFixedInput").value;
	//download as html file
	exporter.exportGame(
		gameData,
		getTitle(),
		export_settings.page_color,
		filenameFromGameTitle() + ".html",
		isFixedSize,
		size);
}

function exportGameData() {
	refreshGameData(); //just in case
	// var gameData = document.getElementById("game_data").value; //grab game data
	var gameData = getFullGameData();
	ExporterUtils.DownloadFile(filenameFromGameTitle() + ".bitsy", gameData);
}

function exportFont() {
	var fontData = fontManager.GetData(fontName);
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
	iconUtils.LoadIcon(document.getElementById("instructionsCheckIcon"), e.target.checked ? "expand_more" : "expand_less");
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
	iconUtils.LoadIcon(document.getElementById("versionNotesCheckIcon"), e.target.checked ? "expand_more" : "expand_less");
}

/* MARKERS (exits & endings) */
var markerTool;

function startAddMarker() {
	markerTool.StartAdd();
}

function cancelAddMarker() {
	markerTool.CancelAdd();
}

function newExit() {
	markerTool.AddExit(false);
}

function newExitOneWay() {
	markerTool.AddExit(true);
}

function newEnding() {
	markerTool.AddEnding();
}

function duplicateMarker() {
	markerTool.DuplicateSelected();
}

function deleteMarker() {
	markerTool.RemoveMarker();
}

function prevMarker() {
	markerTool.NextMarker();
}

function nextMarker() {
	markerTool.PrevMarker();
}

function toggleMoveMarker1(e) {
	markerTool.TogglePlacingFirstMarker(e.target.checked);
}

function selectMarkerRoom1() {
	markerTool.SelectMarkerRoom1();
}

function toggleMoveMarker2(e) {
	markerTool.TogglePlacingSecondMarker(e.target.checked);
}

function selectMarkerRoom2() {
	markerTool.SelectMarkerRoom2();
}

function changeExitDirection() {
	markerTool.ChangeExitLink();
}

function onEffectTextChange(event) {
	markerTool.ChangeEffectText(event.target.value);
}

function onChangeExitTransitionEffect(effectId, exitIndex) {
	markerTool.ChangeExitTransitionEffect(effectId, exitIndex);
}

function toggleExitOptions(exitIndex, visibility) {
	if (exitIndex == 0) {
		// hacky way to keep these in syncs!!!
		document.getElementById("exitOptionsToggleCheck1").checked = visibility;
		document.getElementById("exitOptionsToggleCheck1_alt").checked = visibility;
	}
	markerTool.ToggleExitOptions(exitIndex, visibility);
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
	bitsyLog(el.classList, "editor");
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

function showPanel(id, insertNextToId) {
	togglePanelCore(id, true /*visible*/, true /*doUpdatePrefs*/, insertNextToId);
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

function togglePanelCore(id, visible, doUpdatePrefs, insertNextToId) {
	if (doUpdatePrefs === undefined || doUpdatePrefs === null) {
		doUpdatePrefs = true;
	}

	//hide/show panel
	togglePanelUI(id, visible, insertNextToId);

	//save panel preferences
	// savePanelPref( id, visible );
	if (doUpdatePrefs) {
		updatePanelPrefs();
	}
}

function togglePanelUI(id, visible, insertNextToId) {
	if (visible) {
		var editorContent = document.getElementById("editorContent");
		var cardElement = document.getElementById(id);

		if (insertNextToId === undefined || insertNextToId === null) {
			editorContent.appendChild(cardElement);
		}
		else {
			var insertNextToElement = document.getElementById(insertNextToId);
			editorContent.insertBefore(cardElement, insertNextToElement.nextSibling);

			// hack - activate animation if using insert next to?
			cardElement.classList.add("drop");
			setTimeout( function() { cardElement.classList.remove("drop"); }, 300 );
		}
	}

	document.getElementById(id).style.display = visible ? "inline-flex" : "none";

	if (visible) {
		cardElement.scrollIntoView();
	}

	// update checkbox
	if (id != "toolsPanel") {
		document.getElementById(id.replace("Panel","Check")).checked = visible;
	}
}

function updatePanelPrefs() {
	// bitsyLog("UPDATE PREFS", "editor");

	var prefs = getPanelPrefs();
	// bitsyLog(prefs, "editor");

	var editorContent = document.getElementById("editorContent");
	var cards = editorContent.getElementsByClassName("bitsy-workbench-item");

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

	// bitsyLog(prefs, "editor");
	Store.set('panel_prefs', prefs);
	// bitsyLog(Store.get('panel_prefs'), "editor");
}

function getPanelSetting(panelId, settingId) {
	var settingValue = null;

	var prefs = getPanelPrefs();

	for (var i = 0; i < prefs.workspace.length; i++ ) {
		if (prefs.workspace[i].id === panelId) {
			if (prefs.workspace[i].setting != undefined && prefs.workspace[i].setting != null) {
				settingValue = prefs.workspace[i].setting[settingId];
			}
		}
	}

	return settingValue;
}

function setPanelSetting(panelId, settingId, settingValue) {
	var prefs = getPanelPrefs();

	for (var i = 0; i < prefs.workspace.length; i++ ) {
		if (prefs.workspace[i].id === panelId) {
			if (prefs.workspace[i].setting === undefined || prefs.workspace[i].setting === null) {
				prefs.workspace[i].setting = {};
			}

			prefs.workspace[i].setting[settingId] = settingValue;
		}
	}

	Store.set('panel_prefs', prefs);
}

var gifRecordingInterval = null;
function startRecordingGif() {
	gifFrameData = [];

	document.getElementById("gifStartButton").style.display="none";
	document.getElementById("gifSnapshotButton").style.display="none";
	document.getElementById("gifSnapshotModeButton").style.display="none";
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

var isGifSnapshotLandscape = false;
function toggleSnapshotMode() {
	isGifSnapshotLandscape = !isGifSnapshotLandscape;

	var modeDesc = isGifSnapshotLandscape ? "snapshot mode: landscape" : "snapshot mode: square";
	document.getElementById("gifSnapshotModeButton").title = modeDesc;

	var iconName = isGifSnapshotLandscape ? "pagesize_landscape" : "pagesize_full";
	iconUtils.LoadIcon(document.getElementById("gifSnapshotModeIcon"), iconName);
}

var isSnapshotInProgress = false;
function takeSnapshotGif(e) {
	isSnapshotInProgress = true;

	var gif = {
		frames: [],
		width: 512,
		height: 512,
		loops: 0,
		delay: animationTime / 10
	};

	gifCaptureCanvas.width = 512; // stop hardcoding 512?
	gifCaptureCanvas.height = 512;

	var frame0;
	var frame1;

	var snapshotInterval;
	var snapshotCount = 0;

	snapshotInterval = setInterval(function() {
		if (snapshotCount === 0) {
			gifCaptureCtx.drawImage(canvas, 0, 0, 512, 512);
			frame0 = gifCaptureCtx.getImageData(0, 0, 512, 512);
		}
		else if (snapshotCount === 1) {
			gifCaptureCtx.drawImage(canvas, 0, 0, 512, 512);
			frame1 = gifCaptureCtx.getImageData(0, 0, 512, 512);
		}
		else if (snapshotCount === 2) {
			if (isGifSnapshotLandscape) {
				/* widescreen */
				gif.width = gifCaptureWidescreenSize.width;
				gif.height = gifCaptureWidescreenSize.height;
				gifCaptureCanvas.width = gifCaptureWidescreenSize.width;
				gifCaptureCanvas.height = gifCaptureWidescreenSize.height;

				var widescreenX = (gifCaptureWidescreenSize.width / 2) - (512 / 2);
				var widescreenY = (gifCaptureWidescreenSize.height / 2) - (512 / 2);

				var roomPal = getPal(room[roomTool.getSelected()].pal);
				gifCaptureCtx.fillStyle = "rgb(" + roomPal[0][0] + "," + roomPal[0][1] + "," + roomPal[0][2] + ")";
				gifCaptureCtx.fillRect(0, 0, gifCaptureWidescreenSize.width, gifCaptureWidescreenSize.height);

				gifCaptureCtx.putImageData(frame0,widescreenX,widescreenY);
				frame0 = gifCaptureCtx.getImageData(0, 0, gifCaptureWidescreenSize.width, gifCaptureWidescreenSize.height);

				gifCaptureCtx.putImageData(frame1,widescreenX,widescreenY);
				frame1 = gifCaptureCtx.getImageData(0, 0, gifCaptureWidescreenSize.width, gifCaptureWidescreenSize.height);
			}

			gif.frames.push(frame0.data);
			gif.frames.push(frame1.data);

			finishRecordingGif(gif);

			clearInterval(snapshotInterval);
			isSnapshotInProgress = false;
		}

		snapshotCount++;
	}, animationTime);
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
	document.getElementById("gifSnapshotModeButton").style.display="none";
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

		// add all user defined palette colors
		for (id in palette) {
			for (i in getPal(id)){
				var hexStr = rgbToHex( getPal(id)[i][0], getPal(id)[i][1], getPal(id)[i][2] ).slice(1);

				// gif palettes max out at 256 colors
				// this avoids totally breaking the gif if a game has more colors than that
				// TODO : make this smarter by keeping track palettes of visited rooms
				if (hexPalette.length < 256) {
					hexPalette.push( hexStr );
				}
			}
		}

		gif.palette = hexPalette; // hacky

		gifencoder.encode( gif, 
			function(uri, blob) {
				document.getElementById("gifEncodingText").style.display="none";
				document.getElementById("gifStartButton").style.display="inline";
				document.getElementById("gifPreview").src = uri;
				document.getElementById("gifPreview").style.display="block";
				document.getElementById("gifPlaceholder").style.display="none";
				document.getElementById("gifSnapshotButton").style.display="inline";
				document.getElementById("gifSnapshotModeButton").style.display="inline";

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
	if (isPlayMode) {
		alert("You can't upload a game while you're playing one! Sorry :(");
		return;
	}

	resetGameData();

	// load file chosen by user
	var files = e.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.readAsText( file );

	reader.onloadend = function() {
		var fileText = reader.result;
		gameDataStr = exporter.importGame( fileText );

		// change game data & reload everything
		document.getElementById("game_data").value = gameDataStr;
		on_game_data_change();

		// reset find tool (a bit heavy handed?)
		findTool = new FindTool({
			mainElement : document.getElementById("findPanelMain"),
		});
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
		bitsyLog(fileText, "editor");

		var customFontName = (fontManager.Create(fileText)).getName();

		fontManager.AddResource(customFontName + fontManager.GetExtension(), fileText);
		switchFont(customFontName); // bitsy engine setting

		var fontStorage = {
			name : customFontName,
			fontdata : fileText
		};
		Store.set('custom_font', fontStorage);

		refreshGameData();
		updateFontSelectUI();

		// TODO
		// fontLoadSettings.resources.set("custom.txt", fileText); // hacky!!!
	}
}

function importGameDataFromFile(e) {
	if (isPlayMode) {
		alert("You can't upload a game while you're playing one! Sorry :(");
		return;
	}

	resetGameData();

	// load file chosen by user
	var files = e.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.readAsText(file);

	reader.onloadend = function() {
		var gameDataStr = reader.result;

		// change game data & reload everything
		document.getElementById("game_data").value = gameDataStr;
		on_game_data_change();

		// reset find tool (a bit heavy handed?)
		findTool = new FindTool({
			mainElement : document.getElementById("findPanelMain"),
		});
	}
}

/* ANIMATION EDITING*/
function on_toggle_animated() {
	bitsyLog("ON TOGGLE ANIMATED", "editor");
	bitsyLog(document.getElementById("animatedCheckbox").checked, "editor");
	bitsyLog(drawing.type, "editor");
	bitsyLog("~~~~~", "editor");
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
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_more");
		bitsyLog(drawing.id, "editor");
		renderAnimationPreview(drawing);
	}
	else {
		if ( drawing.type === TileType.Sprite || drawing.type === TileType.Avatar ) {
			removeSpriteAnimation();
		}
		else if ( drawing.type === TileType.Tile ) {
			removeTileAnimation();
		}
		else if ( drawing.type === TileType.Item ) {
			bitsyLog("REMOVE ITEM ANIMATION", "editor");
			removeItemAnimation();
		}
		document.getElementById("animation").setAttribute("style","display:none;");
		iconUtils.LoadIcon(document.getElementById("animatedCheckboxIcon"), "expand_less");
	}
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

	if (sprite[drawing.id].cachedAnimation && sprite[drawing.id].cachedAnimation.length >= 1) {
		addDrawingAnimation(spriteImageId, sprite[drawing.id].cachedAnimation[0]);
	}
	else {
		addDrawingAnimation(spriteImageId);
	}

	// refresh images
	renderer.ClearCache();

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();

	// reset animations
	resetAllAnimations();
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

	// refresh images
	renderer.ClearCache();

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();

	// reset animations
	resetAllAnimations();
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
	if (tile[drawing.id].cachedAnimation && tile[drawing.id].cachedAnimation.length >= 1) {
		addDrawingAnimation(tileImageId, tile[drawing.id].cachedAnimation[0]);
	}
	else {
		addDrawingAnimation(tileImageId);
	}

	// refresh images
	renderer.ClearCache();

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();

	// reset animations
	resetAllAnimations();
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

	// refresh images
	renderer.ClearCache();

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();

	// reset animations
	resetAllAnimations();
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
	if (item[drawing.id].cachedAnimation && item[drawing.id].cachedAnimation.length >= 1) {
		addDrawingAnimation(itemImageId, item[drawing.id].cachedAnimation[0]);
	}
	else {
		addDrawingAnimation(itemImageId);
	}

	// refresh images
	renderer.ClearCache();

	//refresh data model
	refreshGameData();
	paintTool.reloadDrawing();

	// reset animations
	resetAllAnimations();
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

	// refresh images
	renderer.ClearCache();

	//refresh data model (TODO : these should really be a shared method)
	refreshGameData();
	paintTool.reloadDrawing();

	// reset animations
	resetAllAnimations();
}

function addDrawingAnimation(drwId, frameData) {
	var drawingSource = renderer.GetDrawingSource(drwId);

	if (!frameData) {
		var firstFrame = drawingSource[0];

		// copy first frame data into second frame
		frameData = [];
		for (var y = 0; y < tilesize; y++) {
			frameData.push([]);
			for (var x = 0; x < tilesize; x++) {
				frameData[y].push(firstFrame[y][x]);
			}
		}
	}

	drawingSource[1] = frameData;

	renderer.SetDrawingSource(drwId, drawingSource);
}

function removeDrawingAnimation(drwId) {
	var drawingData = renderer.GetDrawingSource(drwId);
	var oldDrawingData = drawingData.slice(0);
	renderer.SetDrawingSource(drwId, [oldDrawingData[0]]);
}

// let's us restore the animation during the session if the user wants it back
function cacheDrawingAnimation(drawing, sourceId) {
	var drawingData = renderer.GetDrawingSource(sourceId);
	var oldDrawingData = drawingData.slice(0);
	drawing.cachedAnimation = [oldDrawingData[1]]; // ah the joys of javascript
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
	//bitsyLog(hex, "editor");
	var rgb = hexToRgb( hex );
	// document.body.style.background = hex;
	document.getElementById("roomPanel").style.background = hex;
	export_settings.page_color = hex;

	Store.set('export_settings', export_settings);
}

function getComplimentingColor(palId) {
	if (!palId) palId = curDefaultPal();
	var hsl = rgbToHsl( getPal(palId)[0][0], getPal(palId)[0][1], getPal(palId)[0][2] );
	// bitsyLog(hsl, "editor");
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
	// can't grab cards in vertical mode right now
	if (window.innerHeight > window.innerWidth) { // TODO : change to portrait orientation check??
		return;
	}

	// e.preventDefault();

	bitsyLog("--- GRAB START", "editor");
	bitsyLog(grabbedPanel.card, "editor");

	if (grabbedPanel.card != null) return;

	grabbedPanel.card = e.target;
	while(!grabbedPanel.card.classList.contains("bitsy-workbench-item") && !(grabbedPanel.card == null)) {
		grabbedPanel.card = grabbedPanel.card.parentElement;
	}

	if(grabbedPanel.card == null) return; // couldn't find a panel above the handle - abort!

	bitsyLog(grabbedPanel.card, "editor");
	bitsyLog("--", "editor")

	grabbedPanel.size = getElementSize( grabbedPanel.card );
	var pos = getElementPosition( grabbedPanel.card );
	
	grabbedPanel.shadow = document.createElement("div");
	grabbedPanel.shadow.className = "panelShadow";
	grabbedPanel.shadow.style.width = grabbedPanel.size.x + "px";
	grabbedPanel.shadow.style.height = grabbedPanel.size.y + "px";

	bitsyLog( document.getElementById("editorContent") , "editor");
	bitsyLog( grabbedPanel.shadow , "editor");
	bitsyLog( grabbedPanel.card , "editor");

	document.getElementById("editorContent").insertBefore( grabbedPanel.shadow, grabbedPanel.card );
	grabbedPanel.cursorOffset.x = e.clientX - pos.x;
	grabbedPanel.cursorOffset.y = e.clientY - pos.y;
	bitsyLog("client " + e.clientX, "editor");
	bitsyLog("card " + pos.x, "editor");
	bitsyLog("offset " + grabbedPanel.cursorOffset.x, "editor");
	// bitsyLog("screen " + e.screenX, "editor");
	grabbedPanel.card.style.position = "absolute";
	grabbedPanel.card.style.left = e.clientX - grabbedPanel.cursorOffset.x + "px";
	grabbedPanel.card.style.top = e.clientY - grabbedPanel.cursorOffset.y + "px";
	grabbedPanel.card.style.zIndex = 1000;
}

function panel_onMouseMove(e) {
	if (grabbedPanel.card == null) return;

	bitsyLog("-- PANEL MOVE", "editor");
	bitsyLog(grabbedPanel.card, "editor");

	grabbedPanel.card.style.left = e.clientX - grabbedPanel.cursorOffset.x + "px";
	grabbedPanel.card.style.top = e.clientY - grabbedPanel.cursorOffset.y + "px";

	var cardPos = getElementPosition( grabbedPanel.card );
	var cardSize = grabbedPanel.size;
	var cardCenter = { x:cardPos.x+cardSize.x/2, y:cardPos.y+cardSize.y/2 };

	bitsyLog(cardCenter, "editor");

	var editorContent = document.getElementById("editorContent");
	var editorContentWidth = editorContent.getBoundingClientRect().width;
	var otherCards = editorContent.getElementsByClassName("bitsy-workbench-item");

	for(var j = 0; j < otherCards.length; j++) {
		var other = otherCards[j];
		// bitsyLog(other, "editor");
		var otherPos = getElementPosition( other );
		var otherSize = getElementSize( other );
		var otherCenter = { x:otherPos.x+otherSize.x/2, y:otherPos.y+otherSize.y/2 };

		// bitsyLog(otherCenter, "editor");

		if ( cardCenter.x < otherCenter.x ) {
			bitsyLog("INSERT " + cardCenter.x + " " + otherCenter.x, "editor");
			bitsyLog(other, "editor");

			editorContent.insertBefore( grabbedPanel.shadow, other );
			break;
		}
		else if (j == otherCards.length - 1 && cardCenter.x > otherCenter.x) {
			editorContent.appendChild( grabbedPanel.shadow );
			break;
		}
	}

	bitsyLog("********", "editor")
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
		bitsyLog("NOOO BOUNDING RECT!!!", "editor");
		return {x:0,y:0};
	}

	var rect = e.getBoundingClientRect();
	var pos = {x:rect.left,y:rect.top};
	// bitsyLog(pos, "editor");
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


function toggleDialogCode(e) {
	var showCode = e.target.checked;

	// toggle button text
	document.getElementById("dialogToggleCodeShowText").style.display = showCode ? "none" : "inline";
	document.getElementById("dialogToggleCodeHideText").style.display = showCode ? "inline" : "none";

	// update editor
	var dialogEditorViewport = document.getElementById("dialogEditor");
	dialogEditorViewport.innerHTML = "";
	if (showCode) {
		dialogEditorViewport.appendChild(curPlaintextDialogEditor.GetElement());
	}
	else {
		dialogEditorViewport.appendChild(curDialogEditor.GetElement());
	}
}

var alwaysShowDrawingDialog = true;
function toggleAlwaysShowDrawingDialog(e) {
	alwaysShowDrawingDialog = e.target.checked;

	if (alwaysShowDrawingDialog) {
		var dlg = getCurDialogId();
		if (dialog[dlg]) {
			openDialogTool(dlg);
		}
	}
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
function togglePreviewDialog(event) {
	if (event.target.checked) {
		if (curDialogEditor != null) {
			isPreviewDialogMode = true;

			if (document.getElementById("roomPanel").style.display === "none") {
				showPanel("roomPanel");
			}

			on_play_mode();
		
			startPreviewDialog(
				curDialogEditor.GetNode(), 
				function() {
					togglePreviewDialog({ target : { checked : false } });
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
	var language = e.target.value;
	pickDefaultFontForLanguage(language);
	on_change_language_inner(language);
}

function on_change_language_inner(language) {
	changeLnaguageStyle(language); // TODO : misspelled funciton name

	localization.ChangeLanguage(language);
	updateInventoryUI();
	reloadDialogUI();
	hackyUpdatePlaceholderText();

	// update title in new language IF the user hasn't made any changes to the default title
	if (localization.LocalizationContains("default_title", getTitle())) {
		setTitle(localization.GetStringOrFallback("default_title", "Write your game's title here"));
		// make sure all editors with a title know to update
		events.Raise("dialog_update", { dialogId:titleDialogId, editorId:null });
	}

	// update default sprite
	var defaultSpriteDlgExists = dialog["0"] != null && localization.LocalizationContains("default_sprite_dlg", dialog["0"]);
	if (defaultSpriteDlgExists) {
		dialog["0"] = {
			src: localization.GetStringOrFallback("default_sprite_dlg", "I'm a cat"),
			name: null,
		};
		paintTool.reloadDrawing();
	}

	// update default item
	var defaultItemDlgExists = dialog["1"] != null && localization.LocalizationContains("default_item_dlg", dialog["1"]);
	if (defaultItemDlgExists) {
		dialog["1"] = {
			src: localization.GetStringOrFallback("default_item_dlg", "You found a nice warm cup of tea"),
			name: null,
		};
		paintTool.reloadDrawing(); // hacky to do this twice
	}

	refreshGameData();
}

// TODO : create a system for placeholder text like I have for innerText
function hackyUpdatePlaceholderText() {
	var titlePlaceholder = localization.GetStringOrFallback("title_placeholder", "Title");
	var titleTextBoxes = document.getElementsByClassName("titleTextBox");
	for (var i = 0; i < titleTextBoxes.length; i++) {
		titleTextBoxes[i].placeholder = titlePlaceholder;
	}
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
		switchFont("arabic", true /*doPickTextDirection*/);
	}
	else if (lang === "zh" || lang === "ja") {
		switchFont("unicode_asian", true /*doPickTextDirection*/);
	}
	else {
		switchFont("unicode_european_small", true /*doPickTextDirection*/);
	}
	updateFontSelectUI();
}

function on_change_font(e) {
	if (e.target.value != "custom") {
		switchFont(e.target.value, true /*doPickTextDirection*/);
	}
	else {
		var fontStorage = Store.get('custom_font', { name: 'ascii_small' });
		switchFont(fontStorage.name, true /*doPickTextDirection*/);
	}
	updateFontDescriptionUI();
	// updateEditorTextDirection();
}

function switchFont(newFontName, doPickTextDirection) {
	if (doPickTextDirection === undefined || doPickTextDirection === null) {
		doPickTextDirection = false;
	}

	fontName = newFontName;

	if (doPickTextDirection) {
		bitsyLog("PICK TEXT DIR", "editor");
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
	bitsyLog("CHANGE TEXT DIR " + e.target.value, "editor");
	updateEditorTextDirection(e.target.value);
	refreshGameData();
}

function onChangeTextMode(e) {
	flags.TXT_MODE = bitsy[e.target.value];
	refreshGameData();
}

function pickDefaultTextDirectionForFont(newFontName) {
	var newTextDirection = TextDirection.LeftToRight;
	if (newFontName === "arabic") {
		newTextDirection = TextDirection.RightToLeft;
	}
	updateEditorTextDirection(newTextDirection);
	updateTextDirectionSelectUI();
}

function updateEditorTextDirection(newTextDirection) {
	var prevTextDirection = textDirection;
	textDirection = newTextDirection;

	bitsyLog("TEXT BOX TEXT DIR " + textDirection, "editor");

	if (prevTextDirection != null) {
		document.body.classList.remove("dir_" + prevTextDirection.toLowerCase());
	}
	document.body.classList.add("dir_" + textDirection.toLowerCase());
}

function updateTextDirectionSelectUI() {
	var textDirSelect = document.getElementById("textDirectionSelect");
	for (var i in textDirSelect.options) {
		var option = textDirSelect.options[i];
		option.selected = (option.value === textDirection);
	}

	// hacky to stick this here..
	var textModeSelect = document.getElementById("textModeSelect");
	for (var i in textModeSelect.options) {
		var option = textModeSelect.options[i];
		option.selected = (bitsy[option.value] === flags.TXT_MODE);
	}
}

/* UTILS (todo : move into utils.js after merge) */
function CreateDefaultName(defaultNamePrefix, objectStore, ignoreNumberIfFirstName) {
	if (ignoreNumberIfFirstName === undefined || ignoreNumberIfFirstName === null) {
		ignoreNumberIfFirstName = false;
	}

	var nameCount = ignoreNumberIfFirstName ? -1 : 0; // hacky :(
	for (id in objectStore) {
		if (objectStore[id].name) {
			if (objectStore[id].name.indexOf(defaultNamePrefix) === 0) {
				var nameCountStr = objectStore[id].name.slice(defaultNamePrefix.length);

				var nameCountInt = 0;
				if (nameCountStr.length > 0) {
					nameCountInt = parseInt(nameCountStr);
				}

				if (!isNaN(nameCountInt) && nameCountInt > nameCount) {
					nameCount = nameCountInt;
				}
			}
		}
	}

	if (ignoreNumberIfFirstName && nameCount < 0) {
		return defaultNamePrefix;
	}

	return defaultNamePrefix + " " + (nameCount + 1);
}

/* DOCS */
function toggleDialogDocs(e) {
	bitsyLog("SHOW DOCS", "editor");
	bitsyLog(e.target.checked, "editor");
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

/* ICONS */
var iconUtils = new IconUtils(); // TODO : move?

/* NEW FIND TOOL */
var findTool = null;

function openFindTool(categoryId, insertNextToId) {
	if (findTool) {
		findTool.SelectCategory(categoryId);
	}

	showPanel("findPanel", insertNextToId);
}

function openFindToolWithCurrentPaintCategory() {
	var categoryId = "AVA";

	if (drawing) {
		if (drawing.type === TileType.Tile) {
			categoryId = "TIL";
		}
		else if (drawing.type === TileType.Sprite) {
			categoryId = "SPR";
		}
		else if (drawing.type === TileType.Item) {
			categoryId = "ITM";
		}
	}

	openFindTool(categoryId, "paintPanel");
}

/* SOUND TOOLS */
var tuneTool;
var blipTool;