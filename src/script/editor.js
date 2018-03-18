/* 
4.6
- filter drawings by name!
- fix importing new-style html

4.5
- bitsy icon
- better top bar behavior
- new color picker
- remember page export color
- bugfix: wall visualization broken

CONFIRMED BUGS
- iOS editor is broken again
- bug with mobile (iOS safari) not loading itch games every time
- animation bugs: https://twitter.com/skodone/status/942019687550017542

TODO: touch controls
X figure out scaling (_test windows / android)
X rename touch event handlers
- need more feedback for swiping controls (partial swipe, bump, select character)
X swipe movements are too large

SPOTTED BUGS
- start a new game, old dialog sticks around (no repro)
- need to improve UI to teach how new dialog works
- bug with room names? (investigate)
- confusing that you can't add new items in the inventory window (rename them too?)
- becklespinax: Not sure what causes it but sometimes when writing dialogue that uses the new text effects I'll go to play the scene and it won't fire the dialogue attached to the sprite when interacted with. (no repro yet)
- weird ghost tiles in exit map
- overlapping entrance & exit things on regular map
- ending undefined bug (how repro?)
- but sometimes when pushing an arrow key just once, the avatar will keep moving in the direction until it runs into a wall/sprite

NEW FEATURE IDEAS
- plugin
- import / export tiles
- editor behaves odd in playtest mode -- disable more stuff (and make it more clear!)
- need newlines in endings

NOTES WHILE GETTING READY TO RELEASE
- need to redo GIF recording (snapshots, animation, text effects)

Notes on controlled walking
- need to respond to direction buttons even if you haven't lifted all the other buttons

Other notes / feature ideas
- string demarcation in programming language
- comments for programming language
- documentation for programming language
- WASD / arrow keys should only control game when the game has focus?
- not always clear when the editor is play-mode vs edit-mode (visuals? turn off editor controls? other?)
- multiple avatars
- multiple exits when you got different items
- arrange windows more freely (vertical)
- mobile version
- better organization tools for tiles (e.g. naming, re-ordering them, grouping them (folders?), searching, etc.)
- dialog when you change rooms
- different color for character sprite vs everything else?
- game ends after dialog from sprite (add to scripting)

BUGS / FEEDBACK:
* Thank you @adamledoux for Bitsy, it is so relaxing to use. Are you aware that in Safari deleted rooms do not disappear from the exit list?
* @videodante: @adamledoux Hey! I was just wondering if it's possible to change the room size in bitsy, or if not, if you'd consider adding that?
--> e.g. changing size of tiles wld change room size to compensate & vice versa. basically a picker of room px, tile px, and num tiles.
* mobile issues (ios)
* hmm I need to add a setting to turn off mouse controls since it breaks more unconventional games
* I also wonder, have you considered a more mobile friendly editor with vertically stacking collapsable tabs? I'd love to use bitsy on the go.
* Thank you, That would be very helpful. On iOS and android you could replace it with a swipe to move like @increpare's puzzlescript.
* finally inventory feature with branching becz it was so hard to do that now. If u can add the same sprite in diff scenes it will be great
* mailing list for game jams?
* Art: Non-english characters
* Yukon: Endings on sprites
* radiosoap: dialog portraits
* Edited: 1) variables 2) map of connected rooms 3) transparent avatar background
* Mimic: While working on the game, there were a few things I think would improve the editor. One would be the ability to copy sections within the map and paste it in other sections, so this would speed up tile placement. The second thing is the naming of the rooms and endings. It would have been nice to edit the names for the sake of organization. This as well as the ability to move the tiles in the find drawing window. Other then that, the editor helps make games quite quickly. :)
* zetef: I really did not thought about that, but it would be cool if in the future update you can change the player's speed in a specific room, or all the rooms. I enjoyed your tool!
* thetoolong: if a first time player of bitsy... and i like the top-down aspect. you should add more colors and some king of simple coding (like scratch) to make more complex games.
* saranomy: Is it possible to add a dialog to the exit itself? So, when player walks into exit (teleport tile), it will force player to read important messages before going to the next room. This feature will add dialog box into "exits" window in the editor.
* anoobus5 I was wondering if you could add a feature where you could link rooms, as creating 5-9 exits for each room gets tedious after a while.

? music (how)

NEW NOTES
- can't put ending on top of sprite (should you be able to? trigger ending by talking to sprite)
- a way to share tilesets would be cool

v3.4 to do
- show/hide animation on edit map

NEW TODO
- update TODOs from project and community
- draggable entrances
- iOS mobile bug
- android freezing bug
- ? default workspaces
- drawing selector
- aliases
- better gif async
- (publish gif library)

new usability ideas
- tiles in grid so you can see more
- Oh and possibly a way to "toggle" the placement of endings or exits, so you can put multiples of the same one in a room without having to scroll up and so down to select it each time

v3.1 bugs
- prev/next and tile preview don't work together (old bug)

editor UI problems to solve
- unusable on mobile
- gif UI is terrible and not findable
- prev / next buttons everywhere are a pain to use if you have a lot of stuff
- can't see all the tiles you want to work on
- dialog UI could be improved
- feedback for exits and ending creation is not good enough

v4 features
- refactor
	- modularize engine
		- engine
		- renderer
		- game-data
		- parser
		X font
	- modularize editor
		X exporter
		- ???
- re-do UI
	- think through ALL existing features and how they work together (or not)
	- make everything MORE VISIBLE


TODO NOW
- email leaf

v5 candidate features
- music / sfx tool
- room map
- fancier animations (transitions, arrow, walk?, etc)
- character pathing (why am I the only one that wants this???)

USABILITY THREAD
- bug: nasty corruption bug still exists
- bug: test things in firefox
- bug: (firefox?) if you write dialog after placing a sprite, the textfield clears itself (no repro)
- editable room names
- line breaks for dialog
- downloadable Bitsy (electron?)
- RPG mechanics: enemies, items???
- walls maintain wall status everywhere once checked (even when you add new rooms)
	- maybe needs a file format change: a universal wall specifier that can be overridden?
- music / sfx tool (bleepy bloopy piano track)
	- http://marcgg.com/blog/2016/11/01/javascript-audio/#
- dialog choices
- dialog "reply" from your character
- dialog changes with repetition
- dialog branching
- better support for side-scrolling games???? (e.g. gravity mode (jump? ramps? ladders?))
from laura michet
- map for rooms
- want to see all my tiles at once
- character limit on sprite dialog (sort of fixed with the dialog box textarea)

my ideas
- transition animations
- walking animations
- bobbing arrow animations
- dialog open close animations
- new pass on UI
- new dialog editor / preview pane
	- bigger dialog box textbox?

- BUG: after play mode, avatar ends up in wrong room
- name rooms, sprites, etc (esp rooms tho)
- make it show/hide exits, instead of "add" exits
- BUG: removing sprite from world doesn't work once you go back into playmode
- BUG: exit highlighting is on by default when engine starts up?
- ONGOING: decrease duplicate code between tile / sprites
- selection box? copy paste?
- would be cool to select sprites and then find out who they are / what they say?
- how do extra characters end up in the room maps?

now what?
- sharing features in the games
	- gif recording
	- linkbacks to editor
	- twitter api sharing
	- link to bitsy list

- add preview canvas for rooms
- the UI is getting cluttered :(
- is the skip dialog too easy? should I fast forward instead? use specific buttons? (maybe this should be playtested)

from twitter
- look at puzzlescript gist hosting of gamedata (from kool.tools)

- async gif processings (IN PROGRESS)
- undo / redo
- improve color input for browsers that only accept text
	- hash or no-hash hex
	- rgb with commas
- add instruction on publishing the game (itchio shoutout)

- bug: some sort of bad things happen when you delete room 0


TODO BACKLOG
- export straight to itchio (is there a developer api?)
- better icon for exits
- character paths

old ideas
	#shortcut to sets?
	#default tileset
	#clear tilemap
	#clear tileset
	? animate player movement
	? player face left/right
	?? bouncing arrow
	? sprite walking paths
	?? narrative blocks
	?? STRICT MODE where text can only fit on one page

- room transition animations

first bitsy tweet: https://twitter.com/adamledoux/status/787434344776241153
*/

/*
NOTES
- remember to run chrome like this to test "open /Applications/Google\ Chrome.app --args --allow-file-access-from-files"
- useful for icon conversions: https://iconverticons.com/online/
*/

var editMode = EditMode.Edit;

/* PAINT */
var paint_canvas;
var paint_ctx;
var paint_scale = 32;

var paintMode = TileType.Avatar;
var drawingId = "A";
var drawPaintGrid = true;
var curPaintBrush = 0;
var isPainting = false;
var isCurDrawingAnimated = false;
var curDrawingFrameIndex = 0;

var tileIndex = 0;
var spriteIndex = 0;
var itemIndex = 0;

/* ROOM */
var drawMapGrid = true;
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
var isRecordingGif = false;
var gifFrameData = [];
var isPlayMode = false;

/* EXPORT HTML */
var makeURL = null;
var exporter = new Exporter();

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
		{ id:"endingsPanel", 		visible:false, 	position:8  },
		{ id:"paintExplorerPanel",	visible:false,	position:9  },
		{ id:"dialogPanel",			visible:false,	position:10 },
		{ id:"inventoryPanel",		visible:false,	position:11 }
	]
};
// console.log(defaultPanelPrefs);

function getPanelPrefs() {
	// (TODO: weird that engine version and editor version are the same??)
	var useDefaultPrefs = ( localStorage.engine_version == null ) ||
							( localStorage.panel_prefs == null ) ||
							( JSON.parse(localStorage.engine_version).major < 4 ) ||
							( JSON.parse(localStorage.engine_version).minor < 0 );
	console.log("USE DEFAULT?? " + useDefaultPrefs);
	var prefs = useDefaultPrefs ? defaultPanelPrefs : JSON.parse( localStorage.panel_prefs );
	// add missing panel prefs (if any)
	// console.log(defaultPanelPrefs);
	for( var i = 0; i < defaultPanelPrefs.workspace.length; i++ ) {
		var isMissing = true;
		var panelPref = defaultPanelPrefs.workspace[i];
		for( var j = 0; j < prefs.workspace.length; j++ )
		{
			if( prefs.workspace[j].id === panelPref.id )
				isMissing = false;
		}
		if( isMissing ) {
			console.log( "MISSING PREF " + panelPref.id );
			prefs.workspace.push( panelPref );
		}
	}
	return prefs;
}

function start() {
	detectBrowserFeatures();

	//game canvas & context (also the map editor)
	attachCanvas( document.getElementById("game") );
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

	//exit destination canvas & context
	exit_canvas = document.getElementById("exitCanvas");
	exit_canvas.width = width * scale;
	exit_canvas.height = width * scale;
	exit_ctx = exit_canvas.getContext("2d");
	//exit events
	exit_canvas.addEventListener("mousedown", exit_onMouseDown);

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
		//console.log("~~~~ no old save data! ~~~~");
		setDefaultGameState();
		refreshGameData();
	}

	// load panel preferences
	var prefs = getPanelPrefs();
	localStorage.panel_prefs = JSON.stringify(prefs); // save loaded prefs
	var sortedWorkspace = prefs.workspace.sort( function(a,b) { return a.position - b.position; } );
	var editorContent = document.getElementById("editorContent");
	for(i in sortedWorkspace) {
		var panelSettings = sortedWorkspace[i];
		togglePanelCore( panelSettings.id, panelSettings.visible, false /*doUpdatePrefs*/ );
		editorContent.insertBefore( document.getElementById(panelSettings.id), null ); //insert on the left
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
	drawPaintCanvas();
	drawEditMap();
	updateRoomPaletteSelect(); //dumb to have to specify this here --- wrap up room UI method?
	updateRoomName(); // init the room UI
	reloadEnding();

	updateInventoryUI();

	// init color picker
	colorPicker = new ColorPicker('colorPickerWheel', 'colorPickerSelect', 'colorPickerSlider', 'colorPickerSliderBg', 'colorPickerHexText');
	colorPicker.onColorChange = onColorPickerChange;
	document.getElementById("colorPaletteOptionBackground").checked = true;
	updateColorPickerUI();

	//unsupported feature stuff
	if (hasUnsupportedFeatures()) showUnsupportedFeatureWarning();
	if (!browserFeatures.fileDownload) {
		document.getElementById("downloadHelp").style.display = "block";
	}

	//respond to player movement event by recording gif frames
	onPlayerMoved = function() {
		if (isRecordingGif) 
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
	};
	onDialogUpdate = function() {
		// console.log("dialog update!");
		if (isRecordingGif) {
			// copy frame 5x to slow it down (hacky)
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
			gifFrameData.push( ctx.getImageData(0,0,512,512).data );
		}
	};

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

	isPlayerEmbeddedInEditor = true; // flag for game player to make changes specific to editor

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
}

function setDefaultGameState() {
	//clear values
	clearGameData();
	//hack
	curDrawingFrameIndex = 0;
	isCurDrawingAnimated = false;
	//default values
	title = "Write your game's title here";
	EditorState.paletteIndex = 0;
	palette[ selectedColorPal() ] = {
		name : null,
		colors : 
			[
				[0,82,204],
				[128,159,255],
				[255,255,255]
			]
	};
	console.log(palette);
	//default avatar
	console.log("A");
	paintMode = TileType.Avatar;
	//on_paint_avatar();
	drawingId = "A";
	var person_data = [[
		[0,0,0,1,1,0,0,0],
		[0,0,0,1,1,0,0,0],
		[0,0,0,1,1,0,0,0],
		[0,0,1,1,1,1,0,0],
		[0,1,1,1,1,1,1,0],
		[1,0,1,1,1,1,0,1],
		[0,0,1,0,0,1,0,0],
		[0,0,1,0,0,1,0,0]
	]];
	makeSprite( drawingId, person_data );
	sprite["A"].room = "0";
	sprite["A"].x = 4;
	sprite["A"].y = 4;
	sprite["A"].inventory = {}; // TODO : need a unified place to instantiate sprites instead of this ad hoc nonsense
	console.log("B");
	//defualt sprite
	paintMode = TileType.Sprite;
	drawingId = "a";
	//newSprite( drawingId );
	//on_paint_sprite();
	var cat_data = [[
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,1,0,1,0,0,0,1],
		[0,1,1,1,0,0,0,1],
		[0,1,1,1,0,0,1,0],
		[0,1,1,1,1,1,0,0],
		[0,0,1,1,1,1,0,0],
		[0,0,1,0,0,1,0,0]
	]];
	makeSprite( drawingId, cat_data );
	sprite["a"].room = "0";
	sprite["a"].x = 8;
	sprite["a"].y = 12;
	sprite["a"].dlg = "SPR_0";
	dialog["SPR_0"] = "I'm a cat";
	//default tile
	console.log("C");
	paintMode = TileType.Tile;
	drawingId = "a";
	//newTile( drawingId );
	//on_paint_tile();
	var square_data = [[
		[1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,1,1,0,0,1],
		[1,0,0,1,1,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1]
	]];
	makeTile( drawingId, square_data );
	// default item
	paintMode = TileType.Item;
	drawingId = "0";
	var tea_data = [[
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,1,1,1,1,0,0],
		[0,1,1,0,0,1,0,0],
		[0,0,1,0,0,1,0,0],
		[0,0,0,1,1,0,0,0],
		[0,0,0,0,0,0,0,0]
	]];
	makeItem( drawingId, tea_data );
	item["0"].dlg = "ITM_0";
	item["0"].name = "tea";
	dialog["ITM_0"] = "You found a nice warm cup of tea";
	renderImages();
	console.log("D");
	// default variable
	variable["a"] = 42;

	//default room // TODO : there is definitely a better way to instantiate common objects
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
		endings : [],
		items : [],
		pal : "0"
	};
	console.log("E");
	refreshGameData();
	document.getElementById("titleText").value = title;
}

var mapEditAnimationLoop;

function listenMapEditEvents() {
	canvas.addEventListener("mousedown", map_onMouseDown);
	canvas.addEventListener("mousemove", map_onMouseMove);
	canvas.addEventListener("mouseup", map_onMouseUp);
	canvas.addEventListener("mouseleave", map_onMouseUp);

	mapEditAnimationLoop =
		setInterval( function() {
			animationCounter = animationTime + 1; // hack
			updateAnimation();
			drawEditMap();
		}, animationTime ); // update animation in map mode
}

function unlistenMapEditEvents() {
	canvas.removeEventListener("mousedown", map_onMouseDown);
	canvas.removeEventListener("mousemove", map_onMouseMove);
	canvas.removeEventListener("mouseup", map_onMouseUp);
	canvas.removeEventListener("mouseleave", map_onMouseUp);
	clearInterval( mapEditAnimationLoop );
}

function newTile(id) {
	if (id)
		drawingId = id; //this optional parameter lets me override the default next id
	else
		drawingId = nextTileId();

	makeTile(drawingId);
	reloadTile(); //hack for ui consistency (hack x 2: order matters for animated tiles)

	drawPaintCanvas();
	refreshGameData();

	tileIndex = Object.keys(tile).length - 1;
}

function nextTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex + 1) % ids.length;
	drawingId = ids[tileIndex];
	curDrawingFrameIndex = 0;
	reloadTile();
}

function prevTile() {
	var ids = sortedTileIdList();
	tileIndex = (tileIndex - 1) % ids.length;
	if (tileIndex < 0) tileIndex = (ids.length-1);
	drawingId = ids[tileIndex];
	curDrawingFrameIndex = 0;
	reloadTile();
}

function newSprite(id) {
	if (id)
		drawingId = id; //this optional parameter lets me override the default next id
	else
		drawingId = nextSpriteId();

	makeSprite(drawingId);
	reloadSprite(); //hack (order matters for animated tiles)

	drawPaintCanvas();
	refreshGameData();

	spriteIndex = Object.keys(sprite).length - 1;
}

function newItem(id) {
	if (id)
		drawingId = id; //this optional parameter lets me override the default next id
	else
		drawingId = nextItemId();

	makeItem(drawingId);
	reloadItem(); //hack (order matters for animated tiles)

	drawPaintCanvas();
	updateInventoryItemUI();
	refreshGameData();

	itemIndex = Object.keys(item).length - 1;
}

function updateRoomName() {
	// document.getElementById("roomId").innerHTML = curRoom;
	document.getElementById("roomName").placeholder = "room " + curRoom;
	if(room[curRoom].name != null)
		document.getElementById("roomName").value = room[curRoom].name;
	else
		document.getElementById("roomName").value = "";
}

// TODO : consolidate these function and rename them something nicer
function on_room_name_change() {
	var str = document.getElementById("roomName").value;
	if(str.length > 0)
		room[curRoom].name = str;
	else
		room[curRoom].name = null;

	updateNamesFromCurData()

	refreshGameData();
	updateExitOptionsFromGameData();
}

function on_drawing_name_change() {
	var str = document.getElementById("drawingName").value;
	var obj = getCurPaintObject();
	var oldName = obj.name;
	if(str.length > 0)
		obj.name = str;
	else
		obj.name = null;

	updateNamesFromCurData()

	// update display name for thumbnail
	var displayName = obj.name ? obj.name : getCurPaintModeStr() + " " + drawingId;
	document.getElementById("paintExplorerThumbnail_" + drawingId).title = displayName;
	var caption = document.getElementById("paintExplorerCaption_" + drawingId);
	caption.innerText = displayName;
	if( obj.name ) {
		if( caption.classList.contains("thumbnailDefaultName") )
			caption.classList.remove("thumbnailDefaultName");
	}
	else {
		if( !caption.classList.contains("thumbnailDefaultName") )
			caption.classList.add("thumbnailDefaultName");
	}


	// make sure items referenced in scripts update their names
	if(paintMode === TileType.Item) {
		console.log("SWAP ITEM NAMES");

		var ItemNameSwapVisitor = function() {
			var didSwap = false;
			this.DidSwap = function() { return didSwap; };

			this.Visit = function(node) {
				console.log("VISIT!");
				console.log(node);

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
		if(newName === null || newName === undefined) newName = drawingId;
		if(oldName === null || oldName === undefined) oldName = drawingId;

		console.log(oldName + " <-> " + newName);

		if(newName != oldName) {
			for(dlgId in dialog) {
				console.log("DLG " + dlgId);
				var dialogScript = scriptInterpreter.Parse( dialog[dlgId] );
				var visitor = new ItemNameSwapVisitor();
				dialogScript.VisitAll( visitor );
				if( visitor.DidSwap() ) {
					console.log("SWAP!");
					console.log(dialog[dlgId]);
					var newDialog = dialogScript.Serialize();
					if(newDialog.indexOf("\n") > -1)
						newDialog = '"""\n' + newDialog + '\n"""';
					dialog[dlgId] = newDialog;
					console.log(dialog[dlgId]);
				}
			}
		}

		updateInventoryItemUI();

		// renderPaintThumbnail( drawingId ); // hacky way to update name
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

function nextRoom() {
	var ids = sortedRoomIdList();
	roomIndex = (roomIndex + 1) % ids.length;
	curRoom = ids[roomIndex];
	drawEditMap();
	drawPaintCanvas();
	updateRoomPaletteSelect();
	refreshPaintExplorer( true /*doKeepOldThumbnails*/ );

	if (paintMode === TileType.Tile)
		updateWallCheckboxOnCurrentTile();

	updateRoomName();
}

function prevRoom() {
	var ids = sortedRoomIdList();
	roomIndex--;
	if (roomIndex < 0) roomIndex = (ids.length-1);
	curRoom = ids[roomIndex];
	drawEditMap();
	drawPaintCanvas();
	updateRoomPaletteSelect();
	refreshPaintExplorer( true /*doKeepOldThumbnails*/ );

	if (paintMode === TileType.Tile)
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
	drawEditMap();
	drawPaintCanvas();
	updateRoomPaletteSelect();

	updateRoomName();

	// add new exit destination option to exits panel
	var select = document.getElementById("exitDestinationSelect");
	var option = document.createElement("option");
	option.text = "room " + newRoomId;
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
		pal : "0",
		items : []
	};
	refreshGameData();

	curRoom = roomId;
	//console.log(curRoom);
	drawEditMap();
	drawPaintCanvas();
	updateRoomPaletteSelect();

	updateRoomName();

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
		drawEditMap();
		drawPaintCanvas();
		updateRoomPaletteSelect();
		updateExitOptionsFromGameData();
		//recreate exit options
	}
}

function nextItem() {
	var ids = sortedItemIdList();
	itemIndex = (itemIndex + 1) % ids.length;
	drawingId = ids[itemIndex];
	curDrawingFrameIndex = 0;
	reloadItem();
}

function prevItem() {
	var ids = sortedItemIdList();
	itemIndex = (itemIndex - 1) % ids.length;
	if (itemIndex < 0) itemIndex = (ids.length-1); // loop
	drawingId = ids[itemIndex];
	curDrawingFrameIndex = 0;
	reloadItem();
}

function nextSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex + 1) % ids.length;
	if (spriteIndex === 0) spriteIndex = 1; //skip avatar
	drawingId = ids[spriteIndex];
	curDrawingFrameIndex = 0;
	reloadSprite();
}

function prevSprite() {
	var ids = sortedSpriteIdList();
	spriteIndex = (spriteIndex - 1) % ids.length;
	if (spriteIndex <= 0) spriteIndex = (ids.length-1); //loop and skip avatar
	drawingId = ids[spriteIndex];
	curDrawingFrameIndex = 0;
	reloadSprite();
}

function next() {
	if (paintMode == TileType.Tile) {
		nextTile();
	}
	else if( paintMode == TileType.Avatar || paintMode == TileType.Sprite ) {
		nextSprite();
	}
	else if( paintMode == TileType.Item ) {
		nextItem();
	}
	changePaintExplorerSelection( drawingId );
}

function prev() {
	if (paintMode == TileType.Tile) {
		prevTile();
	}
	else if( paintMode == TileType.Avatar || paintMode == TileType.Sprite ) {
		prevSprite();
	}
	else if( paintMode == TileType.Item ) {
		prevItem();
	}
	changePaintExplorerSelection( drawingId );
}

function newDrawing() {
	if (paintMode == TileType.Tile) {
		newTile();
	}
	else if( paintMode == TileType.Avatar || paintMode == TileType.Sprite ) {
		newSprite();
	}
	else if( paintMode == TileType.Item ) {
		newItem();
	}
	addPaintThumbnail( drawingId );
	changePaintExplorerSelection( drawingId );
	document.getElementById("paintExplorerFilterInput").value = "";
	refreshPaintExplorer( true /*doKeepOldThumbnails*/, document.getElementById("paintExplorerFilterInput").value /*filterString*/, true /*skipRenderStep*/ ); // this is a bit hacky feeling
}

function duplicateDrawing() {
	if (paintMode == TileType.Tile) {

		//copy drawing data
		var sourceImageData = imageStore.source[ "TIL_" + drawingId ];
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

		var tmpIsWall = tile[ drawingId ].isWall;

		drawingId = nextTileId();

		console.log("DUPLICATE TILE");		
		console.log(drawingId);
		console.log(copiedImageData);

		makeTile( drawingId, copiedImageData );

		tile[ drawingId ].isWall = tmpIsWall;

		drawPaintCanvas();
		refreshGameData();

		tileIndex = Object.keys(tile).length - 1;

		reloadTile(); //hack for ui consistency
	}
	else if(paintMode == TileType.Avatar || paintMode == TileType.Sprite) {

		//copy drawing data -- hacky duplication as usual between sprite and tile :(
		var sourceImageData = imageStore.source[ "SPR_" + drawingId ];
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

		drawingId = nextSpriteId();

		console.log("DUPLICATE SPRITE");	
		console.log(drawingId);
		console.log(copiedImageData);

		makeSprite( drawingId, copiedImageData );

		drawPaintCanvas();
		refreshGameData();

		spriteIndex = Object.keys(sprite).length - 1;

		reloadSprite(); //hack
	}
	else if(paintMode == TileType.Item) {

		//copy drawing data -- hacky duplication as usual between sprite and tile :(
		var sourceImageData = imageStore.source[ "ITM_" + drawingId ];
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

		drawingId = nextItemId();

		console.log("DUPLICATE ITEM");	
		console.log(drawingId);
		console.log(copiedImageData);

		makeItem( drawingId, copiedImageData );

		drawPaintCanvas();
		refreshGameData();

		itemIndex = Object.keys(item).length - 1;

		reloadItem(); //hack
		updateInventoryItemUI();
	}
	addPaintThumbnail( drawingId );
	changePaintExplorerSelection( drawingId );
}

function deleteDrawing() {
	if ( confirm("Are you sure you want to delete this drawing?") ) {
		deletePaintThumbnail( drawingId );
		if (paintMode == TileType.Tile) {
			if ( Object.keys( tile ).length <= 1 ) { alert("You can't delete your last tile!"); return; }
			delete tile[ drawingId ];
			findAndReplaceTileInAllRooms( drawingId, "0" );
			refreshGameData();
			renderImages();
			drawEditMap();
			nextTile();
		}
		else if( paintMode == TileType.Avatar || paintMode == TileType.Sprite ){
			if ( Object.keys( sprite ).length <= 2 ) { alert("You can't delete your last sprite!"); return; }

			// todo: share with items
			var dlgId = sprite[ drawingId ].dlg == null ? drawingId : sprite[ drawingId ].dlg;
			if( dlgId && dialog[ dlgId ] )
				delete dialog[ dlgId ];

			delete sprite[ drawingId ];

			refreshGameData();
			renderImages();
			drawEditMap();
			nextSprite();
		}
		else if( paintMode == TileType.Item ){
			if ( Object.keys( item ).length <= 1 ) { alert("You can't delete your last item!"); return; }

			var dlgId = item[ drawingId ].dlg;
			if( dlgId && dialog[ dlgId ] )
				delete dialog[ dlgId ];

			delete item[ drawingId ];

			removeAllItems( drawingId );
			refreshGameData();
			renderImages();
			drawEditMap();
			nextItem();
			updateInventoryItemUI();
		}
		changePaintExplorerSelection( drawingId );
	}
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
	if ( tile[drawingId] && tile[drawingId].animation.isAnimated ) {
		isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;

		if( curDrawingFrameIndex == 0)
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left selected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right unselected";
		}
		else if( curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left unselected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		renderAnimationPreview( drawingId );
	}
	else {
		isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}

	// wall UI
	updateWallCheckboxOnCurrentTile();

	updateDrawingNameUI(true);

	drawPaintCanvas();
}

function updateWallCheckboxOnCurrentTile() {
	var isCurTileWall = false;

	if( tile[ drawingId ].isWall == undefined || tile[ drawingId ].isWall == null ) {
		if (room[curRoom]) {
			isCurTileWall = (room[curRoom].walls.indexOf(drawingId) != -1);
		}
	}
	else {
		isCurTileWall = tile[ drawingId ].isWall;
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

function reloadDialogUI() {
	reloadDialogUICore();

	reloadAdvDialogUI();
}

function reloadDialogUICore() { // TODO: name is terrible
	var dialogId = getCurDialogId();

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

// TODO : better name?
function reloadAdvDialogUI() {
	// var dialogId = getCurDialogId(); // necessary?
	if( paintMode === TileType.Sprite || paintMode === TileType.Item ) {

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
	if ( sprite[drawingId] && sprite[drawingId].animation.isAnimated ) {
		isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;

		if( curDrawingFrameIndex == 0)
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left selected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right unselected";
		}
		else if( curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left unselected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		renderAnimationPreview( drawingId );
	}
	else {
		isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}

	// dialog UI
	reloadDialogUI()

	updateDrawingNameUI( drawingId != "A" );

	// update paint canvas
	drawPaintCanvas();

}

// TODO consolidate these drawing related methods
function reloadItem() {
	// animation UI
	if ( item[drawingId] && item[drawingId].animation.isAnimated ) {
		isCurDrawingAnimated = true;
		document.getElementById("animatedCheckbox").checked = true;

		if( curDrawingFrameIndex == 0)
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left selected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right unselected";
		}
		else if( curDrawingFrameIndex == 1 )
		{
			document.getElementById("animationKeyframe1").className = "animationThumbnail left unselected";
			document.getElementById("animationKeyframe2").className = "animationThumbnail right selected";
		}

		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		renderAnimationPreview( drawingId );
	}
	else {
		isCurDrawingAnimated = false;
		document.getElementById("animatedCheckbox").checked = false;
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}

	// dialog UI
	reloadDialogUI()

	updateDrawingNameUI(true);

	// update paint canvas
	drawPaintCanvas();

}

var isDragAddingTiles = false;
var isDragDeletingTiles = false;
var isDragMovingExit = false;
var isDragMovingEnding = false;
function map_onMouseDown(e) {
	var off = getOffset(e);
	var x = Math.floor( off.x / (tilesize*scale) );
	var y = Math.floor( off.y / (tilesize*scale) );
	// console.log(x + " " + y);

	var didSelectedExitChange = areExitsVisible ? setSelectedExit( getExit(curRoom,x,y) ) : false;
	var didSelectedEndingChange = areEndingsVisible ? setSelectedEnding( getEnding(curRoom,x,y) ) : false;

	if (didSelectedExitChange || didSelectedEndingChange) {
		//don't do anything else
		if( selectedExit != null ) isDragMovingExit = true;
		if( selectedEndingTile != null ) isDragMovingEnding = true;
	}
	else if (isAddingExit) { //todo - mutually exclusive with adding an ending?
		//add exit
		if ( getEnding(curRoom,x,y) == null && getExit(curRoom,x,y) == null ) {
			addExitToCurRoom(x,y);
		}
	}
	else if (isAddingEnding) {
		//add ending
		if ( getEnding(curRoom,x,y) == null && getExit(curRoom,x,y) == null ) {
			addEndingToCurRoom(x,y);
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
		else if( paintMode == TileType.Avatar || paintMode == TileType.Sprite ) {
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
		else if( paintMode == TileType.Item ) {
			// TODO : is this the final behavior I want?

			var otherItem = getItem(curRoom,x,y);
			var isThisItemAlreadyHere = otherItem != null && otherItem.id === drawingId;

			if(otherItem) {
				getRoom().items.splice( getRoom().items.indexOf(otherItem), 1 );
			}

			if(!isThisItemAlreadyHere) {
				getRoom().items.push( {id:drawingId, x:x, y:y} );
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
	if( selectedExit != null && isDragMovingExit )
	{
		// drag exit around
		var off = getOffset(e);
		var x = Math.floor(off.x / (tilesize*scale));
		var y = Math.floor(off.y / (tilesize*scale));
		if( !getExit(curRoom,x,y) && !getEnding(curRoom,x,y) )
		{
			selectedExit.x = x;
			selectedExit.y = y;
			refreshGameData();
			drawEditMap();	
		}
	}
	else if( selectedEndingTile != null && isDragMovingEnding )
	{
		// drag ending around
		var off = getOffset(e);
		var x = Math.floor(off.x / (tilesize*scale));
		var y = Math.floor(off.y / (tilesize*scale));
		var y = Math.floor(off.y / (tilesize*scale));
		if( !getExit(curRoom,x,y) && !getEnding(curRoom,x,y) )
		{
			selectedEndingTile.x = x;
			selectedEndingTile.y = y;
			refreshGameData();
			drawEditMap();	
		}
	}
	else
		editTilesOnDrag(e);
}

function map_onMouseUp(e) {
	editTilesOnDrag(e);
	isDragAddingTiles = false;
	isDragDeletingTiles = false;
	isDragMovingExit = false;
	isDragMovingEnding = false;
}

function paint_onMouseDown(e) {
	if (isPlayMode) return; //can't paint during play mode

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
	if (isPainting) {
		isPainting = false;
		renderImages();
		refreshGameData();
		drawEditMap();
		renderPaintThumbnail( drawingId );
		if( isCurDrawingAnimated )
			renderAnimationPreview( drawingId );
	}
}

function drawPaintCanvas() {
	//background
	paint_ctx.fillStyle = "rgb("+getPal(curPal())[0][0]+","+getPal(curPal())[0][1]+","+getPal(curPal())[0][2]+")";
	paint_ctx.fillRect(0,0,canvas.width,canvas.height);

	//pixel color
	if (paintMode == TileType.Tile) {
		paint_ctx.fillStyle = "rgb("+getPal(curPal())[1][0]+","+getPal(curPal())[1][1]+","+getPal(curPal())[1][2]+")";
	}
	else if (paintMode == TileType.Sprite || paintMode == TileType.Avatar || paintMode == TileType.Item) {
		paint_ctx.fillStyle = "rgb("+getPal(curPal())[2][0]+","+getPal(curPal())[2][1]+","+getPal(curPal())[2][2]+")";
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
		paint_ctx.fillStyle = getContrastingColor();

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
	ctx.fillStyle = "rgb("+getPal(curPal())[0][0]+","+getPal(curPal())[0][1]+","+getPal(curPal())[0][2]+")";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	//draw map
	drawRoom( room[curRoom] );

	//draw grid
	if (drawMapGrid) {
		ctx.fillStyle = getContrastingColor();
		for (var x = 1; x < mapsize; x++) {
			ctx.fillRect(x*tilesize*scale,0*tilesize*scale,1,mapsize*tilesize*scale);
		}
		for (var y = 1; y < mapsize; y++) {
			ctx.fillRect(0*tilesize*scale,y*tilesize*scale,mapsize*tilesize*scale,1);
		}
	}

	//draw walls
	if (drawCollisionMap) {
		ctx.fillStyle = getContrastingColor();
		for (y in room[curRoom].tilemap) {
			for (x in room[curRoom].tilemap[y]) {
				if( isWall(x,y,curRoom) ) {
					ctx.fillRect(x*tilesize*scale,y*tilesize*scale,tilesize*scale,tilesize*scale);
				}
			}
		}
	}

	//draw exits (and entrances)
	if (areExitsVisible) {
		for( r in room ) {
			if( r === curRoom ) {
				for (i in room[curRoom].exits) {
					var e = room[curRoom].exits[i];
					if( !room[e.dest.room] )
						continue;

					if (e == selectedExit) {
						ctx.fillStyle = "#ff0";
						ctx.globalAlpha = 0.9;
					}
					else {
						ctx.fillStyle = getContrastingColor();
						ctx.globalAlpha = 0.5;
					}
					ctx.fillRect(e.x * tilesize * scale, e.y * tilesize * scale, tilesize * scale, tilesize * scale);
					ctx.strokeStyle = getComplimentingColor();
					ctx.globalAlpha = 1.0;
					ctx.strokeRect( (e.x * tilesize * scale) - 1, (e.y * tilesize * scale) - 1, (tilesize * scale) + 2, (tilesize * scale) + 2 );

					ctx.font = '14px sans-serif';
					var roomStr = "To " + ( (room[e.dest.room].name != null) ? room[e.dest.room].name : ("room " + e.dest.room) );
					ctx.fillText( roomStr, (e.x * tilesize * scale) - 1, (e.y * tilesize * scale) - 5 );

					//todo (tilesize*scale) should be a function
				}
			}
			else {
				for (i in room[r].exits) {
					var e = room[r].exits[i];
					if( !room[e.dest.room] )
						continue;

					if (e.dest.room === curRoom){
						ctx.fillStyle = getContrastingColor();
						ctx.globalAlpha = 0.3;
						ctx.fillRect(e.dest.x * tilesize * scale, e.dest.y * tilesize * scale, tilesize * scale, tilesize * scale);
						ctx.strokeStyle = getComplimentingColor();
						ctx.globalAlpha = 0.6;
						ctx.strokeRect( (e.dest.x * tilesize * scale) - 1, (e.dest.y * tilesize * scale) - 1, (tilesize * scale) + 2, (tilesize * scale) + 2 );
	
						ctx.font = '14px sans-serif';
						var roomStr = "From " + ( (room[r].name != null) ? room[r].name : ("room " + r) );
						ctx.fillText( roomStr, (e.dest.x * tilesize * scale) - 1, (e.dest.y * tilesize * scale) - 5 );
					}
				}
			}
		}
		ctx.globalAlpha = 1;
	}

	//draw endings
	if (areEndingsVisible) {
		for (i in room[curRoom].endings) {
			var e = room[curRoom].endings[i];
			if (e == selectedEndingTile) {
				ctx.fillStyle = "#ff0";
				ctx.globalAlpha = 0.9;
			}
			else {
				ctx.fillStyle = getContrastingColor();
				ctx.globalAlpha = 0.5;
			}
			ctx.fillRect(e.x * tilesize * scale, e.y * tilesize * scale, tilesize * scale, tilesize * scale);
			ctx.strokeStyle = getComplimentingColor();
			ctx.globalAlpha = 1.0;
			ctx.strokeRect( (e.x * tilesize * scale) - 1, (e.y * tilesize * scale) - 1, (tilesize * scale) + 2, (tilesize * scale) + 2 );

			ctx.font = '14px sans-serif';
			ctx.fillText( "To ending " + e.id, (e.x * tilesize * scale) - 1, (e.y * tilesize * scale) - 5 );
		}
		ctx.globalAlpha = 1;
	}
}

function curDrawingImgId() {
	var imgId = "";
	if( paintMode == TileType.Tile )
		imgId += "TIL_";
	else if( paintMode == TileType.Sprite || paintMode == TileType.Avatar )
		imgId += "SPR_";
	else if( paintMode == TileType.Item )
		imgId += "ITM_";
	imgId += drawingId;
	return imgId;
}

function curDrawingData() {
	var imgId = curDrawingImgId();
	// console.log(imgId);
	var frameIndex = (isCurDrawingAnimated ? curDrawingFrameIndex : 0);
	// console.log(imageStore.source[ imgId ]);
	return imageStore.source[ imgId ][ frameIndex ];
}

// todo: assumes 2 frames
function curDrawingAltFrameData() {
	var imgId = curDrawingImgId();
	var frameIndex = (curDrawingFrameIndex === 0 ? 1 : 0);
	return imageStore.source[ imgId ][ frameIndex ];
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
	updatePaletteUI();
	// updatePaletteControlsFromGameData();
	updateExitOptionsFromGameData();
	updateRoomName();
	updateInventoryUI();

	on_paint_avatar();
	document.getElementById('paintOptionAvatar').checked = true;
}

function refreshGameData() {
	if (isPlayMode) return; //never store game data while in playmode (TODO: wouldn't be necessary if the game data was decoupled form editor data)

	flags.ROOM_FORMAT = 1; // always save out comma separated format, even if the old format is read in
	var gameData = serializeWorld();
	//console.log("refresh!");
	//console.log(gameData);
	document.getElementById("game_data").value = gameData;
	localStorage.setItem("game_data", gameData); //auto-save
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

function togglePlayMode(e) {
	if (e.target.checked) {
		on_play_mode();
	}
	else {
		on_edit_mode();
	}
	updatePlayModeButton();
}

function on_edit_mode() {
	isPlayMode = false;
	stopGame();
	// TODO I should really do more to separate the editor's game-data from the engine's game-data
	parseWorld(document.getElementById("game_data").value); //reparse world to account for any changes during gameplay
	curRoom = sortedRoomIdList()[roomIndex]; //restore current room to pre-play state
	drawEditMap();
	listenMapEditEvents();

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

function on_play_mode() {
	isPlayMode = true;
	unlistenMapEditEvents();
	load_game(document.getElementById("game_data").value, !isPreviewDialogMode /* startWithTitle */);

	console.log("PLAY!! ~~ PREVIEW ? " + isPreviewDialogMode);
	if(!isPreviewDialogMode) {
		console.log("DISALBE PREVIEW!!!");
		document.getElementById("previewDialogCheck").disabled = true;
	}
}

function updatePlayModeButton() {
	document.getElementById("playModeCheck").checked = isPlayMode;
	document.getElementById("playModeIcon").innerHTML = isPlayMode ? "stop" : "play_arrow";
	document.getElementById("playModeText").innerHTML = isPlayMode ? "stop" : "play";
}

function updatePreviewDialogButton() {
	document.getElementById("previewDialogCheck").checked = isPreviewDialogMode;
	document.getElementById("previewDialogIcon").innerHTML = isPreviewDialogMode ? "stop" : "play_arrow";
	document.getElementById("previewDialogText").innerHTML = isPreviewDialogMode ? "stop" : "preview";
}

function togglePaintGrid(e) {
	drawPaintGrid = e.target.checked;
	document.getElementById("paintGridIcon").innerHTML = drawPaintGrid ? "visibility" : "visibility_off";
	drawPaintCanvas();
}

function toggleMapGrid(e) {
	drawMapGrid = e.target.checked;
	document.getElementById("roomGridIcon").innerHTML = drawMapGrid ? "visibility" : "visibility_off";
	drawEditMap();
}

var drawCollisionMap = false; //todo - move variable to more centeral spot?
function toggleCollisionMap(e) {
	drawCollisionMap = e.target.checked;
	document.getElementById("roomWallsIcon").innerHTML = drawCollisionMap ? "visibility" : "visibility_off";
	drawEditMap();
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

	document.getElementById("paletteName").placeholder = "palette " + selectedColorPal();
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
		console.log(o);
		if (o.value === curPal()) {
			o.selected = true;
		}
	}
}

var colorPicker = null; // new color picker
var colorPickerIndex = 0;
var colorPaletteLabels = ["colorPaletteLabelBackground", "colorPaletteLabelTile", "colorPaletteLabelSprite"];

function changeColorPickerIndex(index) {
	colorPickerIndex = index;
	var color = getPal(selectedColorPal())[ index ];
	console.log(color);
	colorPicker.setColor( color[0], color[1], color[2] );
}

function updateColorPickerUI() {
	var color0 = getPal(selectedColorPal())[ 0 ];
	var color1 = getPal(selectedColorPal())[ 1 ];
	var color2 = getPal(selectedColorPal())[ 2 ];

	updateColorPickerLabel(0, color0[0], color0[1], color0[2] );
	updateColorPickerLabel(1, color1[0], color1[1], color1[2] );
	updateColorPickerLabel(2, color2[0], color2[1], color2[2] );

	changeColorPickerIndex( colorPickerIndex );
}

function updateColorPickerLabel(index, r, g, b) {
	var rgbColor = {r:r, g:g, b:b};

	var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
	var hsvColor = RGBtoHSV( rgbColor );
	document.getElementById( colorPaletteLabels[ index ] ).style.background = rgbColorStr;
	document.getElementById( colorPaletteLabels[ index ] ).style.color = hsvColor.v < 0.5 ? "white" : "black";
}

function onColorPickerChange( rgbColor, isMouseUp ) {
	getPal(selectedColorPal())[ colorPickerIndex ][ 0 ] = rgbColor.r;
	getPal(selectedColorPal())[ colorPickerIndex ][ 1 ] = rgbColor.g;
	getPal(selectedColorPal())[ colorPickerIndex ][ 2 ] = rgbColor.b;

	updateColorPickerLabel(colorPickerIndex, rgbColor.r, rgbColor.g, rgbColor.b );

	if( isMouseUp ) {
		refreshGameData();
		renderImages();
		drawPaintCanvas();
		drawEditMap();
		refreshPaintExplorer( true /*doKeepOldThumbnails*/ );
		if( isCurDrawingAnimated )
			renderAnimationPreview( drawingId );
	}
}

function updatePaletteOptionsFromGameData() {
	var select = document.getElementById("roomPaletteSelect");

	// first, remove all current options
	var i;
	for(i = select.options.length - 1 ; i >= 0 ; i--) {
		select.remove(i);
	}

	// then, add an option for each room
	for (palId in palette) {
		var option = document.createElement("option");
		option.text = palette[palId].name ? palette[palId].name : "palette " + palId;
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
		updateColorPickerUI();
}

function prevPalette() {
	// update index
	EditorState.paletteIndex = (EditorState.paletteIndex - 1);
	if (EditorState.paletteIndex < 0) EditorState.paletteIndex = Object.keys(palette).length - 1;

	// change the UI
	updatePaletteUI();
}

function nextPalette() {
	// update index
	EditorState.paletteIndex = (EditorState.paletteIndex + 1);
	if (EditorState.paletteIndex >= Object.keys(palette).length) EditorState.paletteIndex = 0;

	// change the UI
	updatePaletteUI();
}

function newPalette() {
	// create new ending and save the data
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
	EditorState.paletteIndex = Object.keys(palette).length - 1;
	updatePaletteUI();
}

function roomPaletteChange(event) {
	var palId = event.target.value;
	room[curRoom].pal = palId;
	refreshGameData();
	drawEditMap();
	drawPaintCanvas();
	refreshPaintExplorer( true /*doKeepOldThumbnails*/ );
}

function updateDrawingNameUI(visible) {
	document.getElementById("drawingNameUI").setAttribute("style", visible ? "display:initial;" : "display:none;");
	var obj = getCurPaintObject();
	console.log("update drawing name ui");
	console.log(obj);
	if( obj.name != null )
		document.getElementById("drawingName").value = obj.name;
	else
		document.getElementById("drawingName").value = "";
	document.getElementById("drawingName").placeholder = getCurPaintModeStr() + " " + drawingId;
}

function on_paint_avatar() {
	paintMode = TileType.Avatar;
	drawingId = "A";
	reloadSprite();
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:none;");
	document.getElementById("paintCommands").setAttribute("style","display:none;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(false);
	//document.getElementById("animation").setAttribute("style","display:none;");
	refreshPaintExplorer();
	document.getElementById("paintOptionAvatar").checked = true;
	document.getElementById("paintExplorerOptionAvatar").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:none;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
}
function on_paint_tile() {
	paintMode = TileType.Tile;
	tileIndex = 0;
	drawingId = sortedTileIdList()[tileIndex];
	reloadTile();
	document.getElementById("dialog").setAttribute("style","display:none;");
	document.getElementById("wall").setAttribute("style","display:block;");
	document.getElementById("paintNav").setAttribute("style","display:inline-block;");
	document.getElementById("paintCommands").setAttribute("style","display:inline-block;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	refreshPaintExplorer();
	document.getElementById("paintOptionTile").checked = true;
	document.getElementById("paintExplorerOptionTile").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
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
	document.getElementById("paintNav").setAttribute("style","display:inline-block;");
	document.getElementById("paintCommands").setAttribute("style","display:inline-block;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	refreshPaintExplorer();
	document.getElementById("paintOptionSprite").checked = true;
	document.getElementById("paintExplorerOptionSprite").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:none;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
}
function on_paint_item() {
	console.log("PAINT ITEM");
	paintMode = TileType.Item;
	itemIndex = 0;
	drawingId = sortedItemIdList()[itemIndex];
	console.log(drawingId);
	curDrawingFrameIndex = 0;
	reloadItem();
	document.getElementById("dialog").setAttribute("style","display:block;");
	document.getElementById("wall").setAttribute("style","display:none;");
	document.getElementById("paintNav").setAttribute("style","display:inline-block;");
	document.getElementById("paintCommands").setAttribute("style","display:inline-block;");
	document.getElementById("animationOuter").setAttribute("style","display:block;");
	updateDrawingNameUI(true);
	//document.getElementById("animation").setAttribute("style","display:block;");
	refreshPaintExplorer();
	document.getElementById("paintOptionItem").checked = true;
	document.getElementById("paintExplorerOptionItem").checked = true;
	document.getElementById("showInventoryButton").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerAdd").setAttribute("style","display:inline-block;");
	document.getElementById("paintExplorerFilterInput").value = "";

	reloadAdvDialogUI();
}

function paintExplorerFilterChange( e ) {
	console.log("paint explorer filter : " + e.target.value);
	refreshPaintExplorer( true, e.target.value );
}

var drawingThumbnailCanvas, drawingThumbnailCtx;
function refreshPaintExplorer( doKeepOldThumbnails, filterString, skipRenderStep ) {
	if( doKeepOldThumbnails == null || doKeepOldThumbnails == undefined )
		doKeepOldThumbnails = false;

	var doFilter = filterString != null && filterString != undefined && filterString.length > 0;

	if( skipRenderStep == null || skipRenderStep == undefined )
		skipRenderStep = false;

	var idList = [];
	if( paintMode == TileType.Avatar ) {
		idList = ["A"];
	}
	else if( paintMode == TileType.Sprite ) {
		idList = sortedSpriteIdList();
	}
	else if ( paintMode == TileType.Tile ) {
		idList = sortedTileIdList();
	}
	else if ( paintMode == TileType.Item ) {
		idList = sortedItemIdList();
	}

	var hexPalette = [];
	for (id in palette) {
		for (i in getPal(id)){
			var hexStr = rgbToHex( getPal(id)[i][0], getPal(id)[i][1], getPal(id)[i][2] ).slice(1);
			hexPalette.push( hexStr );
		}
	}

	var paintExplorerForm = document.getElementById("paintExplorerFormInner");
	if( !doKeepOldThumbnails )
		paintExplorerForm.innerHTML = "";
	
	for(var i = 0; i < idList.length; i++) {
		var id = idList[i];
		if(id != "A" || paintMode == TileType.Avatar)
		{
			if(!skipRenderStep) {
				if( !doKeepOldThumbnails )
					addPaintThumbnail( id ); // create thumbnail element and render thumbnail
				else
					renderPaintThumbnail( id ); // just re-render the thumbnail
			}

			if( doFilter )
				filterPaintThumbnail( id, filterString );
			else
				document.getElementById("paintExplorerLabel_" + id).style.display = "inline-block"; // make it visible otherwise
		}
	}
}

function addPaintThumbnail(id) {
	var paintExplorerForm = document.getElementById("paintExplorerFormInner");

	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "paintExplorerRadio";
	radio.id = "paintExplorerRadio_" + id;
	radio.value = id;
	radio.checked = id === drawingId;

	paintExplorerForm.appendChild(radio);

	var label = document.createElement("label");
	label.htmlFor = "paintExplorerRadio_" + id;
	label.id = "paintExplorerLabel_" + id;

	var div = document.createElement("div");
	// div.style.width = "100px";
	// div.style.display = "inline-block";

	var img = document.createElement("img");
	img.id = "paintExplorerThumbnail_" + id;
	if( paintMode === TileType.Tile )
		img.title = tile[id].name ? tile[id].name : "tile " + id;
	else if( paintMode === TileType.Sprite )
		img.title = sprite[id].name ? sprite[id].name : "sprite " + id;
	else if( paintMode === TileType.Avatar )
		img.title = "avatar";
	else if( paintMode === TileType.Item )
		img.title = item[id].name ? item[id].name : "item " + id;

	div.appendChild(img);

	var nameCaption = document.createElement("figcaption");
	nameCaption.id = "paintExplorerCaption_" + id;

	nameCaption.innerText = img.title;
	var obj = getCurPaintObject( id );
	if( obj.name === undefined || obj.name === null ) {
		console.log("default name!!!!");
		nameCaption.classList.add( "thumbnailDefaultName" );
	}

	div.appendChild(nameCaption);

	label.appendChild(div);

	paintExplorerForm.appendChild(label);

	radio.onclick = selectPaint;

	renderPaintThumbnail( id );
}

function filterPaintThumbnail(id,filterString) {
	var label = document.getElementById("paintExplorerLabel_" + id);
	var img = document.getElementById("paintExplorerThumbnail_" + id);
	var thumbTitle = img.title;

	var foundFilter = thumbTitle.indexOf( filterString ) > -1;

	label.style.display = foundFilter ? "inline-block" : "none";
}

var thumbnailRenderEncoders = {};
function renderPaintThumbnail(id) {
	var hexPalette = []; // TODO this is a bit repetitive to do all the time, huh?
	for (pal in palette) {
		for (i in getPal(pal)){
			var hexStr = rgbToHex( getPal(pal)[i][0], getPal(pal)[i][1], getPal(pal)[i][2] ).slice(1);
			hexPalette.push( hexStr );
		}
	}

	// console.log(id);
	var img = document.getElementById("paintExplorerThumbnail_" + id);

	var drawingFrameData = [];
	if( paintMode == TileType.Tile ) {
		// console.log(tile[id]);
		drawTile( getTileImage( tile[id], getRoomPal(curRoom), 0 ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		drawTile( getTileImage( tile[id], getRoomPal(curRoom), 1 ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
	}
	else if( paintMode == TileType.Sprite || paintMode == TileType.Avatar ){
		// console.log(sprite[id]);
		drawSprite( getSpriteImage( sprite[id], getRoomPal(curRoom), 0 ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		drawSprite( getSpriteImage( sprite[id], getRoomPal(curRoom), 1 ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
	}
	else if( paintMode == TileType.Item ) {
		drawItem( getItemImage( item[id], getRoomPal(curRoom), 0 ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		drawItem( getItemImage( item[id], getRoomPal(curRoom), 1 ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
	}

	// create encoder
	var gifData = {
		frames: drawingFrameData,
		width: 8*scale,
		height: 8*scale,
		palette: hexPalette,
		loops: 0,
		delay: animationTime / 10 // TODO why divide by 10???
	};
	var encoder = new gif();

	// cancel old encoder (if in progress already)
	if( thumbnailRenderEncoders[id] != null )
		thumbnailRenderEncoders[id].cancel();
	thumbnailRenderEncoders[id] = encoder;

	// start encoding new GIF
	encoder.encode( gifData, createThumbnailRenderCallback(img) );
}

var animationPreviewEncoders = {};
function renderAnimationThumbnail(id,frameA,frameB,imgId) {
	var hexPalette = []; // TODO this is a bit repetitive to do all the time, huh?
	for (pal in palette) {
		for (i in getPal(pal)){
			var hexStr = rgbToHex( getPal(pal)[i][0], getPal(pal)[i][1], getPal(pal)[i][2] ).slice(1);
			hexPalette.push( hexStr );
		}
	}

	console.log(imgId);
	var img = document.getElementById(imgId);
	console.log(img);

	var drawingFrameData = [];
	if( paintMode == TileType.Tile ) {
		// console.log(tile[id]);
		// console.log("RENDER ANIM " + frameA + " " + frameB);
		drawTile( getTileImage( tile[id], getRoomPal(curRoom), frameA ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		drawTile( getTileImage( tile[id], getRoomPal(curRoom), frameB ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
	}
	else if( paintMode == TileType.Avatar || paintMode == TileType.Sprite ) {
		// console.log(sprite[id]);
		drawSprite( getSpriteImage( sprite[id], getRoomPal(curRoom), frameA ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		drawSprite( getSpriteImage( sprite[id], getRoomPal(curRoom), frameB ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
	}
	else if( paintMode == TileType.Item ) {
		drawItem( getItemImage( item[id], getRoomPal(curRoom), frameA ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		drawItem( getItemImage( item[id], getRoomPal(curRoom), frameB ), 0, 0, drawingThumbnailCtx );
		drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
	}

	// create encoder
	var gifData = {
		frames: drawingFrameData,
		width: 8*scale,
		height: 8*scale,
		palette: hexPalette,
		loops: 0,
		delay: animationTime / 10 // TODO why divide by 10???
	};
	var encoder = new gif();

	// cancel old encoder (if in progress already)
	if( animationPreviewEncoders[imgId] != null )
		animationPreviewEncoders[imgId].cancel();
	animationPreviewEncoders[imgId] = encoder;

	// start encoding new GIF
	encoder.encode( gifData, createThumbnailRenderCallback(img) );
}

function renderAnimationPreview(id) {
	// console.log("RENDRE ANIM PREVIW");
	renderAnimationThumbnail( id, 0, 1, "animationThumbnailPreview" );
	renderAnimationThumbnail( id, 0, 0, "animationThumbnailFrame1" );
	renderAnimationThumbnail( id, 1, 1, "animationThumbnailFrame2" );
}

function createThumbnailRenderCallback(img) {
	return function(uri) { img.src = uri; img.style.background = "none"; };
}

function selectPaint() {
	if(drawingId === this.value && document.getElementById("paintPanel").style.display === "none") {
		togglePanelCore("paintPanel", true /*visible*/); // animate?
	}

	drawingId = this.value;
	if( paintMode === TileType.Tile ) {
		tileIndex = sortedTileIdList().indexOf( drawingId );
		reloadTile();
	}
	else if( paintMode === TileType.Item ) {
		itemIndex = sortedItemIdList().indexOf( drawingId );
		reloadItem();
	}
	else {
		spriteIndex = sortedSpriteIdList().indexOf( drawingId );
		reloadSprite();
	}
}

function changePaintExplorerSelection(id) {
	var paintExplorerForm = document.getElementById("paintExplorerFormInner");
	for( var i = 0; i < paintExplorerForm.childNodes.length; i++ ) {
		var child = paintExplorerForm.childNodes[i];
		if( child.type && child.type === "radio" ) {
			if( child.id === "paintExplorerRadio_" + id )
				child.checked = true;
			else
				child.checked = false;
		}
	}
}

function deletePaintThumbnail(id) {
	var paintExplorerForm = document.getElementById("paintExplorerFormInner");
	paintExplorerForm.removeChild( document.getElementById( "paintExplorerRadio_" + id ) );
	paintExplorerForm.removeChild( document.getElementById( "paintExplorerLabel_" + id ) );
}

function getCurDialogId() {
	var dialogId = null;
	if(paintMode == TileType.Sprite) {
		dialogId = sprite[drawingId].dlg;
		if(dialogId == null && dialog[drawingId] != null) {
			dialogId = drawingId;
		}
	}
	else if(paintMode == TileType.Item) {
		dialogId = item[drawingId].dlg;
	}
	console.log("DIALOG ID " + dialogId);
	return dialogId;
}

function getCurPaintObject(id) {
	if(id === undefined || id === null) id = drawingId;
	console.log(id);
	if(paintMode == TileType.Sprite || paintMode == TileType.Avatar) {
		return sprite[id];
	}
	else if(paintMode == TileType.Item) {
		return item[id];
	}
	else if(paintMode == TileType.Tile) {
		return tile[id];
	}
}

function getCurPaintModeStr() {
	if(paintMode == TileType.Sprite || paintMode == TileType.Avatar) {
		return "sprite";
	}
	else if(paintMode == TileType.Item) {
		return "item";
	}
	else if(paintMode == TileType.Tile) {
		return "tile";
	}
}

function on_change_dialog() {
	var dialogId = getCurDialogId();

	var dialogStr = document.getElementById("dialogText").value;
	if(dialogStr.length <= 0){
		if(dialogId) {
			getCurPaintObject().dlg = null;
			delete dialog[dialogId];
		}
	}
	else {
		if(!dialogId) {
			var prefix = (paintMode == TileType.Item) ? "ITM_" : "SPR_";
			dialogId = nextAvailableDialogId( prefix );
			getCurPaintObject().dlg = dialogId;
		}
		if( dialogStr.indexOf('\n') > -1 ) dialogStr = '"""\n' + dialogStr + '\n"""';
		dialog[dialogId] = dialogStr;
	}

	reloadAdvDialogUI();

	refreshGameData();
}

function on_change_adv_dialog() {
	document.getElementById("dialogText").value = document.getElementById("dialogCodeText").value;
	on_change_dialog();
}

function on_game_data_change() {
	on_game_data_change_core();
	refreshGameData();

	// ui stuff
	updateRoomName();
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
		paintMode = TileType.Item;
		drawingId = "0";
		makeItem( drawingId );
	}

	renderImages();

	drawEditMap();

	paintMode = curPaintMode;
	if ( paintMode == TileType.Tile ) {
		drawingId = sortedTileIdList()[0];
		reloadTile();
	}
	else if( paintMode === TileType.Item ) {
		drawingId = sortedItemIdList()[0];
		reloadItem();
	}
	else {
		drawingId = sortedSpriteIdList()[0];
		reloadSprite();
	}


	updatePaletteUI();

	updateInventoryUI();

	updateExitOptionsFromGameData();

	document.getElementById("titleText").value = title;
}

function updateExitOptionsFromGameData() {
	console.log("UPDATE EXIT OPTIONS");

	var select = document.getElementById("exitDestinationSelect");

	// first, remove all current options
	var i;
	for(i = select.options.length - 1 ; i >= 0 ; i--) {
		select.remove(i);
	}

	// then, add an option for each room
	for (roomId in room) {
		var option = document.createElement("option");
		if(room[roomId].name != null)
			option.text = room[roomId].name;
		else
			option.text = "room " + roomId;
		option.value = roomId;
		select.add(option);
	}

	updateRoomChoiceForSelectedExit();
}

function on_toggle_wall(e) {
	if( tile[ drawingId ].isWall == undefined || tile[ drawingId ].isWall == null ) {
		// clear out any existing wall settings for this tile in any rooms
		// (this is back compat for old-style wall settings)
		for( roomId in room ) {
			var i = room[ roomId ].walls.indexOf( drawingId );
			if( i > -1 )
				room[ roomId ].walls.splice( i , 1 );
		}
	}

	if ( e.target.checked ){
		tile[ drawingId ].isWall = true;
		document.getElementById("wallCheckboxIcon").innerHTML = "border_outer";
	}
	else {
		tile[ drawingId ].isWall = false;
		document.getElementById("wallCheckboxIcon").innerHTML = "border_clear";
	}

	refreshGameData();
}

function exportGame() {
	refreshGameData(); //just in case
	var gameData = document.getElementById("game_data").value; //grab game data
	var size = document.getElementById("exportSizeFixedInput").value;
	exporter.exportGame( gameData, title, export_settings.page_color, "mygame.html", isFixedSize, size ); //download as html file
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
	console.log("show exits");
	resetExitVars();
	areExitsVisible = true;
	drawEditMap();
	drawExitDestinationRoom();
}

function hideExits() {
	console.log("hide exits");
	resetExitVars();
	areExitsVisible = false;
	drawEditMap();
	drawExitDestinationRoom();
}

function addExit() { //todo rename something less vague
	isAddingExit = true;
	setSelectedExit(null);
	setSelectedEnding(null);
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
		dest : { // start with valid destination so you can't accidentally uncreate exits
			room : "0",
			x : 0,
			y : 0
		}
	}
	room[curRoom].exits.push( newExit );
	refreshGameData();
	setSelectedExit(newExit);
}

function updateRoomChoiceForSelectedExit() {
	var destOptions = document.getElementById("exitDestinationSelect").options;
	for (i in destOptions) {
		var o = destOptions[i];
		if (o.value === selectedExitRoom) {
			o.selected = true;
		}
	}
}

function setSelectedExit(e) {
	// var didChange = selectedExit != e;
	var didChange = (e != null) || (e == null && selectedExit != null);

	selectedExit = e;

	if (selectedExit == null) {
		document.getElementById("noExitSelected").style.display = "block";
		document.getElementById("exitSelected").style.display = "none";
	}
	else {
		document.getElementById("noExitSelected").style.display = "none";
		document.getElementById("exitSelected").style.display = "block";

		selectedExitRoom = selectedExit.dest.room;
		updateRoomChoiceForSelectedExit();

		drawExitDestinationRoom();
	}

	drawEditMap();

	return didChange;
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
	console.log(selectedExitRoom);
	var roomPal = getRoomPal(selectedExitRoom);
	exit_ctx.fillStyle = "rgb("+getPal(roomPal)[0][0]+","+getPal(roomPal)[0][1]+","+getPal(roomPal)[0][2]+")";
	exit_ctx.fillRect(0,0,canvas.width,canvas.height);

	//draw map
	drawRoom( room[selectedExitRoom], exit_ctx );

	//draw grid
	exit_ctx.fillStyle = getContrastingColor( roomPal );
	for (var x = 1; x < mapsize; x++) {
		exit_ctx.fillRect(x*tilesize*scale,0*tilesize*scale,1,mapsize*tilesize*scale);
	}
	for (var y = 1; y < mapsize; y++) {
		exit_ctx.fillRect(0*tilesize*scale,y*tilesize*scale,mapsize*tilesize*scale,1);
	}

	//draw exits and entrances (TODO: turn this into a function)
	for( r in room ) {
		if( r === selectedExitRoom ) {
			for (i in room[selectedExitRoom].exits) {
				var e = room[selectedExitRoom].exits[i];
				exit_ctx.fillStyle = getContrastingColor();
				exit_ctx.globalAlpha = 0.5;
				exit_ctx.fillRect(e.x * tilesize * scale, e.y * tilesize * scale, tilesize * scale, tilesize * scale);
				exit_ctx.strokeStyle = getComplimentingColor();
				exit_ctx.globalAlpha = 1.0;
				exit_ctx.strokeRect( (e.x * tilesize * scale) - 1, (e.y * tilesize * scale) - 1, (tilesize * scale) + 2, (tilesize * scale) + 2 );
			}
		}
		else {
			for (i in room[r].exits) {
				var e = room[r].exits[i];
				if (e.dest.room === selectedExitRoom){
					exit_ctx.fillStyle = getContrastingColor();
					exit_ctx.globalAlpha = 0.3;
					exit_ctx.fillRect(e.dest.x * tilesize * scale, e.dest.y * tilesize * scale, tilesize * scale, tilesize * scale);
					exit_ctx.strokeStyle = getComplimentingColor();
					exit_ctx.globalAlpha = 0.6;
					exit_ctx.strokeRect( (e.dest.x * tilesize * scale) - 1, (e.dest.y * tilesize * scale) - 1, (tilesize * scale) + 2, (tilesize * scale) + 2 );
				}
			}
		}
	}

	//draw exit destination
	if ( selectedExit && isExitValid(selectedExit) && selectedExit.dest.room === selectedExitRoom ) {
		exit_ctx.fillStyle = "#ff0";
		exit_ctx.globalAlpha = 0.9;
		exit_ctx.fillRect(selectedExit.dest.x * tilesize * scale, selectedExit.dest.y * tilesize * scale, tilesize * scale, tilesize * scale);
		exit_ctx.globalAlpha = 1;
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
	if(doUpdatePrefs)
		updatePanelPrefs();
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
	if (id === "exitsPanel") showExits();
	if (id === "endingsPanel") showEndings();
}

function afterHidePanel(id) {
	if (id === "exitsPanel") hideExits();
	if (id === "endingsPanel") hideEndings();
}

// DEPRECATED
function savePanelPref(id,visible) {
	var prefs = localStorage.panel_prefs == null ? {} : JSON.parse( localStorage.panel_prefs );
	prefs[id] = visible;
	localStorage.setItem( "panel_prefs", JSON.stringify(prefs) );
}

function updatePanelPrefs() {
	console.log("UPDATE PREFS");

	var prefs = getPanelPrefs();
	console.log(prefs);

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

	console.log(prefs);
	localStorage.panel_prefs = JSON.stringify( prefs );
	console.log(localStorage.panel_prefs);
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

	if(gifFrameData.length <= 0) {
		document.getElementById("gifEncodingText").style.display="none";
		document.getElementById("gifStartButton").style.display="inline";
		return; // nothing recorded, nothing to encode
	}

	setTimeout( function() {
		var hexPalette = [];
		for (id in palette) {
			for (i in getPal(id)){
				var hexStr = rgbToHex( getPal(id)[i][0], getPal(id)[i][1], getPal(id)[i][2] ).slice(1);
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
		gifencoder.encode( gif, function(uri, blob) {
			document.getElementById("gifEncodingText").style.display="none";
			document.getElementById("gifStartButton").style.display="inline";
			//console.log("encoding finished!");
			//console.log(uri);
			document.getElementById("gifPreview").src = uri;

			if( browserFeatures.blobURL ) {
				document.getElementById("gifDownload").href = makeURL.createObjectURL( blob );
			}
			else {
				var downloadData = uri.replace("data:;", "data:attachment/file;"); // for safari
				document.getElementById("gifDownload").href = downloadData;
			}
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
		gameDataStr = exporter.importGame( fileText );
		
		// change game data & reload everything
		document.getElementById("game_data").value = gameDataStr;
		on_game_data_change();
	}
}

/* ANIMATION EDITING*/
function on_toggle_animated() {
	console.log("ON TOGGLE ANIMATED");
	console.log(document.getElementById("animatedCheckbox").checked);
	console.log(paintMode);
	console.log("~~~~~");
	if ( document.getElementById("animatedCheckbox").checked ) {
		if ( paintMode === TileType.Sprite || paintMode === TileType.Avatar ) {
			addSpriteAnimation();
		}
		else if ( paintMode === TileType.Tile ) {
			addTileAnimation();
		}
		else if ( paintMode === TileType.Item ) {
			addItemAnimation();
		}
		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
		console.log(drawingId);
		renderAnimationPreview( drawingId );
	}
	else {
		if ( paintMode === TileType.Sprite || paintMode === TileType.Avatar ) {
			removeSpriteAnimation();
		}
		else if ( paintMode === TileType.Tile ) {
			removeTileAnimation();			
		}
		else if ( paintMode === TileType.Item ) {
			console.log("REMOVE ITEM ANIMATION");
			removeItemAnimation();
		}
		document.getElementById("animation").setAttribute("style","display:none;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
	}
	renderPaintThumbnail( drawingId );
}

function addSpriteAnimation() {
	//set editor mode
	isCurDrawingAnimated = true;
	curDrawingFrameIndex = 0;

	//mark sprite as animated
	sprite[drawingId].animation.isAnimated = true;
	sprite[drawingId].animation.frameIndex = 0;
	sprite[drawingId].animation.frameCount = 2;

	//add blank frame to sprite (or restore removed animation)
	var spriteImageId = "SPR_" + drawingId;
	if (sprite[drawingId].cachedAnimation != null)
		restoreDrawingAnimation( spriteImageId, sprite[drawingId].cachedAnimation )
	else
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
	sprite[drawingId].animation.frameIndex = 0;
	sprite[drawingId].animation.frameCount = 0;

	//remove all but the first frame of the sprite
	var spriteImageId = "SPR_" + drawingId;
	cacheDrawingAnimation( sprite[drawingId], spriteImageId );
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
	tile[drawingId].animation.frameIndex = 0;
	tile[drawingId].animation.frameCount = 2;

	//add blank frame to tile (or restore removed animation)
	var tileImageId = "TIL_" + drawingId;
	if (tile[drawingId].cachedAnimation != null)
		restoreDrawingAnimation( tileImageId, tile[drawingId].cachedAnimation )
	else
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
	tile[drawingId].animation.frameIndex = 0;
	tile[drawingId].animation.frameCount = 0;

	//remove all but the first frame of the tile
	var tileImageId = "TIL_" + drawingId;
	cacheDrawingAnimation( tile[drawingId], tileImageId );
	removeDrawingAnimation( tileImageId );

	//refresh data model
	renderImages();
	refreshGameData();
	reloadTile();
}

// TODO : so much duplication it makes me sad :(
function addItemAnimation() {
	//set editor mode
	isCurDrawingAnimated = true;
	curDrawingFrameIndex = 0;

	//mark item as animated
	item[drawingId].animation.isAnimated = true;
	item[drawingId].animation.frameIndex = 0;
	item[drawingId].animation.frameCount = 2;

	//add blank frame to item (or restore removed animation)
	var itemImageId = "ITM_" + drawingId;
	if (item[drawingId].cachedAnimation != null)
		restoreDrawingAnimation( itemImageId, item[drawingId].cachedAnimation )
	else
		addNewFrameToDrawing( itemImageId );

	//refresh data model
	renderImages();
	refreshGameData();
	reloadItem();
}

function removeItemAnimation() {
	//set editor mode
	isCurDrawingAnimated = false;

	//mark item as non-animated
	item[drawingId].animation.isAnimated = false;
	item[drawingId].animation.frameIndex = 0;
	item[drawingId].animation.frameCount = 0;

	//remove all but the first frame of the item
	var itemImageId = "ITM_" + drawingId;
	cacheDrawingAnimation( item[drawingId], itemImageId );
	removeDrawingAnimation( itemImageId );

	//refresh data model
	renderImages();
	refreshGameData();
	reloadItem();
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

// let's us restore the animation during the session if the user wants it back
function cacheDrawingAnimation(drawing,imageStoreId) {
	var oldImageData = imageStore.source[ imageStoreId ].slice(0);
	drawing.cachedAnimation = [ oldImageData[1] ]; // ah the joys of javascript
}

function restoreDrawingAnimation(imageStoreId,cachedAnimation) {
	for (f in cachedAnimation) {
		imageStore.source[ imageStoreId ].push( cachedAnimation[f] );	
	}
}

function reloadCurDrawing() {
	if ( paintMode === TileType.Tile) {
		reloadTile();
	}
	else if( paintMode === TileType.Avatar || paintMode === TileType.Sprite ) {
		reloadSprite();
	}
	else if( paintMode === TileType.Item ) {
		reloadItem();
	}
}

function on_paint_frame1() {
	curDrawingFrameIndex = 0;
	reloadCurDrawing();
}

function on_paint_frame2() {
	curDrawingFrameIndex = 1;
	reloadCurDrawing();
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

/* ENDINGS */
var isAddingEnding = false;
var selectedEndingTile = null;
var areEndingsVisible = false;

function hasEndings() {
	return Object.keys(ending).length > 0;
}

function on_change_ending() { //todo get rid of these underscore functions uggh
	var curEndingId = "0"; //default in case no endings have been created yet
	if ( hasEndings() ) curEndingId = sortedEndingIdList()[endingIndex];
	ending[ curEndingId ] = document.getElementById("endingText").value;
	refreshGameData();
}

function newEnding() {
	if ( !hasEndings() ) return; //do nothin

	// create new ending and save the data
	var id = nextEndingId();
	ending[ id ] = "";
	refreshGameData();

	// change the UI
	endingIndex = Object.keys(ending).length - 1;
	reloadEnding();

	setSelectedEnding(null);
}

function prevEnding() {
	// update index
	endingIndex = (endingIndex - 1);
	if (endingIndex < 0) endingIndex = Object.keys(ending).length - 1;

	// change the UI
	reloadEnding();

	setSelectedEnding(null);
}

function nextEnding() {
	// update index
	endingIndex = (endingIndex + 1);
	if (endingIndex >= Object.keys(ending).length) endingIndex = 0;

	// change the UI
	reloadEnding();

	setSelectedEnding(null);
}

function reloadEnding() {
	if ( !hasEndings() ) return; //do nothin
	var id = sortedEndingIdList()[ endingIndex ];
	document.getElementById("endingId").innerHTML = id;
	document.getElementById("endingText").value = ending[ id ];
}

function addEnding() {
	isAddingEnding = true;
	setSelectedExit(null);
	setSelectedEnding(null);
	document.getElementById("addEndingButton").style.display = "none";
	document.getElementById("addingEndingHelpText").style.display = "block";
}

function addEndingToCurRoom(x,y) {
	isAddingEnding = false;
	document.getElementById("addEndingButton").style.display = "block";
	document.getElementById("addingEndingHelpText").style.display = "none";
	var id = sortedEndingIdList()[ endingIndex ];
	var newEnding = {
		x : x,
		y : y,
		id : id
	};
	room[ curRoom ].endings.push( newEnding );
	refreshGameData();
	setSelectedEnding( newEnding );
}

function showEndings() {
	// resetExitVars(); -- what's this for?
	areEndingsVisible = true;
	drawEditMap();
}

function hideEndings() {
	areEndingsVisible = false;
	drawEditMap();
}

function setSelectedEnding(e) { //todo
	// var didChange = selectedEndingTile != e;
	var didChange = (e != null) || (e == null && selectedEndingTile != null);

	selectedEndingTile = e;

	if (selectedEndingTile == null) {
		document.getElementById("removeEndingButton").style.display = "none";
	}
	else {
		endingIndex = sortedEndingIdList().indexOf( e.id );
		reloadEnding();
		document.getElementById("removeEndingButton").style.display = "block";
	}

	drawEditMap();

	return didChange;
}

function removeSelectedEnding() {
	room[curRoom].endings.splice( room[curRoom].endings.indexOf( selectedEndingTile ), 1 );
	refreshGameData();
	setSelectedEnding(null);
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
	e.preventDefault();

	console.log(grabbedPanel.card);

	if (grabbedPanel.card != null) return;

	console.log("grab!");

	grabbedPanel.card = e.target.parentElement.parentElement;
	grabbedPanel.size = getElementSize( grabbedPanel.card );
	var pos = getElementPosition( grabbedPanel.card );
	
	grabbedPanel.shadow = document.createElement("div");
	grabbedPanel.shadow.className = "panelShadow";
	grabbedPanel.shadow.style.width = grabbedPanel.size.x + "px";
	grabbedPanel.shadow.style.height = grabbedPanel.size.y + "px";

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

	grabbedPanel.card.style.left = e.clientX - grabbedPanel.cursorOffset.x + "px";
	grabbedPanel.card.style.top = e.clientY - grabbedPanel.cursorOffset.y + "px";

	var cardPos = getElementPosition( grabbedPanel.card );
	var cardSize = grabbedPanel.size;
	var cardCenter = { x:cardPos.x+cardSize.x/2, y:cardPos.y+cardSize.y/2 };

	var editorContent = document.getElementById("editorContent");
	var otherCards = editorContent.getElementsByClassName("panel");

	for(var j = 0; j < otherCards.length; j++) {
		var other = otherCards[j];
		var otherPos = getElementPosition( other );
		var otherSize = getElementSize( other );
		var otherCenter = { x:otherPos.x+otherSize.x/2, y:otherPos.y+otherSize.y/2 };

		if ( cardCenter.x < otherCenter.x ) {
			editorContent.insertBefore( grabbedPanel.shadow, other );
			break;
		}
	}
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
	var rect = e.getBoundingClientRect();
	var pos = {x:rect.left,y:rect.top};
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

	if ( el.scrollLeft + e.deltaX < 0 || el.scrollLeft + e.deltaX > maxX )
	{
		e.preventDefault();
		el.scrollLeft = Math.max(0, Math.min(maxX, el.scrollLeft + event.deltaX));
	}
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
		event.preventDefault();
	}
}

function preventTextDeselectAndClick(event) {
	if(dialogSel.target != null) {
		event.preventDefault();
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
	leftSpan.style.float = "left";
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("subject");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );

	var numSpan = document.createElement("span");
	numSpan.innerText = num + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = "dialog";
	typeEl.title = "this dialog is said once on each interaction";
	leftSpan.appendChild( typeEl );

	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.style.float = "right";
	deleteEl.classList.add('light');
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
	leftSpan.style.float = "left";
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("call_split");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );
	// topDiv.appendChild( createIconElement("call_split") );
	// div.appendChild( createIconElement("help_outline") );

	var numSpan = document.createElement("span");
	numSpan.innerText = num + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = "conditional";
	typeEl.title = "which dialog option is said is determined by conditions you define"
	leftSpan.appendChild( typeEl );

	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.style.float = "right";
	deleteEl.classList.add('light');
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
	addConditionText.innerText = "add option";
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
		condSpan.innerText = "when ";
		condSpan.title = "define the condition for which this dialog option is said";
		condInnerDiv.appendChild(condSpan);
		var condTypeSelect = document.createElement("select");
		condTypeSelect.title = "choose type of condition to check";
		condInnerDiv.appendChild(condTypeSelect);
		for(var i = 0; i < conditionTypes.length; i++) {
			var condTypeOption = document.createElement("option");
			condTypeOption.value = conditionTypes[i];
			condTypeOption.innerText = conditionTypes[i];
			condTypeSelect.appendChild(condTypeOption);
		}
		// condInnerDiv.appendChild( document.createElement("br") );
		var condItemSelect = document.createElement("select");
		condItemSelect.title = "choose item to check";
		condInnerDiv.appendChild(condItemSelect);
		for(id in item) {
			var condItemOption = document.createElement("option");
			condItemOption.value = id;
			condItemOption.innerText = (item[id].name != null ? item[id].name : "item " + id); //"item " + id;
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
			condCompareOption.innerText = comparisonTypes[i]; //comparisonNames[i];
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
	leftSpan.style.float = "left";
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("list");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );

	var numSpan = document.createElement("span");
	numSpan.innerText = num + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = "list"; //sequenceNode.type;
	typeEl.title = "one line of dialog in the list is said on each interaction, in the order you choose";
	leftSpan.appendChild( typeEl );
	
	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.style.float = "right";
	deleteEl.classList.add('light');
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
	orderEl.innerText = "order: ";
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
	var sequenceDesc = ["sequence (say each line once)", "cycle (say each line, then repeat)", "shuffle (say lines in random order)"];
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
	addOptionText.innerText = "add line";
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
		getCurPaintObject().dlg = null;
		delete dialog[dialogId];
	}
	else
	{
		if( dialogStr.indexOf("\n") > -1 )
			dialogStr = '"""\n' + dialogStr + '\n"""';

		previewDialogScriptTree = scriptRoot; // scriptInterpreter.Parse( dialogStr ); // hacky

		if(!dialogId) {
			var prefix = (paintMode == TileType.Item) ? "ITM_" : "SPR_";
			dialogId = nextAvailableDialogId( prefix );
			getCurPaintObject().dlg = dialogId;
		}

		dialog[dialogId] = dialogStr; //TODO: do I need to do more here?
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

function showDialogCode() {
	document.getElementById("dialogCode").style.display = "block";
	document.getElementById("dialogEditor").style.display = "none";
	document.getElementById("dialogShowCode").style.display = "none";
	document.getElementById("dialogHideCode").style.display = "block";
	document.getElementById("dialogTools").style.display = "none";
}

function hideDialogCode() {
	document.getElementById("dialogCode").style.display = "none";
	document.getElementById("dialogEditor").style.display = "block";
	document.getElementById("dialogShowCode").style.display = "block";
	document.getElementById("dialogHideCode").style.display = "none";
	document.getElementById("dialogTools").style.display = "block";
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
	console.log("~~~ UPDATE INVENTORY ~~~");
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

	console.log("UPDATE!!!!");
	for(id in item) {
		var itemName = item[id].name != null ? item[id].name : "item " + id;
		console.log( id );
		console.log( player() );
		console.log( player().inventory );
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
		addVarText.innerText = "add variable";
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

// function previewDialog() {
// 	console.log("PREVIEW!");
// 	var dialogId = getCurDialogId();
// 	var dialogStr = dialog[dialogId];
// 	on_play_mode();
// 	updatePlayModeButton();
// 	startNarrating( dialogStr );
// 	// load_game(document.getElementById("game_data").value);
// }

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