/* 
v4.0
- bug: deleting drawing would delete preview even if you cancelled

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

TODO
- names
	X room 
	X sprite
	X item
	X palette
	- endings
	- other??
X item UI
- advanced dialog UI
- how does new dialog work with: endings? exits? (items?)
- more dialog nodes?
X mouse control plus item
- double click on exits to go to room
- test item drawing model
X need a default item (tea)
- need to fix up defaults to deal with new dialog
- need a good GUI for advanced dialog
- need a better syntax than XML?

DIALOG NODES ideas
<pagebreak>
<pause>
<fast></fast>
<slow></slow>
<speed mult="2"></speed>
<move> -- move character
<mark name="blah"> -- mark spot
<goto mark="blah"> -- jump to a mark
<choice> -- player dialog choice
<changeAvatar>

TODO next
- items
-> UI
-> how do you use them?
--> dialog
----> dialog trees?
--> exits
----> exit dialog?
--> lock blocks?
-> how to do item messages/dialog (special thing? or extend existing dialog system?)
***
- advanced dialog system
--> player choices
--> conditional stuff (item count, etc)
-----> conditionals lead to dialog directly, or to named sections
--> page breaks?
--> styles & effects
--> new font?
--> named sections
--> links to sections
(do this in a text editor? or via a GUI?)
-> three objects: choice, branch, dialog (combinable?) --- also: header, link, ending
-> everything happens in order top to bottom

dialog vs script?

<if item="a">
You found the sock!
<else>
Where oh where is my sock?
</if>

<if hasItem('a')>
<if "hasItem('a'">
<if condition="hasItem('a')">
[if ~ hasItem('a') ~ otherThing('b') ]
[color ~ 0]

how should exits be defined?
- in one line?
- or should they get their own objects?
- if they get their own blocks, are they still exits?
- or something more complex... (triggers)

TRG a
IF ITM_b > 7
EXT c 4,4
ELSEIF ITM_c < 2
DLG a
EXT e 1,2
ELSE
AVA 8
ENDIF

^cool, but how do I dispaly it to users
^could it use the same stuff as dialog?

<if ITM_b>7> <exit room=c pos=1,2> <else> <script run=doScript></if>
^ok, this shit is crazy --- how do I expose to users?

the ULTIMATE version: the dialog editor itself is the script editor?????? what is v0.1 of this?

// how can I help users do this?
<if condition>
dialog
<elseif condition> //or just else? or just another if?
dialog 2
<else>
default <color>dialog</color>
</if>

Ex:
DLG a
Here is some dialog
And another bit of dialog
? Make your choice ##a
? Or this other one ##b
#c
Section c will continue seamlessly
#d
Into section d which is the last section
END
#a
This is section a
if ITM_a > 5
Say this additional thing
Then go to c ##c
#b
This is section b ##c


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
- items
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
- can't rename things
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
- item system ideas / requirements
	- drawing of item in world
	- item can be picked up
	- text to go with pickup?
	- inventory screen?
	- give/receive items
	- game responds ot having / not having an item (dialog, doors??)

v5 candidate features
- triggers
	- first gen goal: extensible, enables "inventory" system
		- or just create an inventory system? and let people re-appropriate it?
	- goals: items, battles, choices
	- variables (increment, decrement, add arbitrary val? multiply?)
		- renamable?
		- limited number?
	- things that can happen
		- move sprites or player (or remove them)
		- change dialog
		- end game?
		- do something with tiles?
	- triggers
		- enter square
		- talk (bump?) to sprite (before?after?)
		- enter / exit room
		- tile-based?
	- ambient triggers
		- based on state of a variable
	- need to be able to name (alias) sprites, tiles, rooms
	- trigger multiple things at once? (one trigger -> multiple effects)
	- special trigger window? trigger in dialog / map / exit window?
- new dialog editor / effects  / options
	- text effects
	- choices?
	- multiple options
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
- text effects
- triggers
- transition animations
- walking animations
- bobbing arrow animations
- dialog open close animations
- new pass on UI
- new dialog editor / preview pane
	- bigger dialog box textbox?

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
- sharing features in the games
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


USER FEEDBACK
- add an inventory system
- add triggers
- add dialog choices?

- room transition animations

first bitsy tweet: https://twitter.com/adamledoux/status/787434344776241153
*/

/*
NOTES
- remember to run chrome like this to test "open /Applications/Google\ Chrome.app --args --allow-file-access-from-files"
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

/* PALETTES */
var paletteIndex = 0;
function selectedColorPal() {
	return sortedPaletteIdList()[ paletteIndex ];
};
// var drawingPal = "0";

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

/* EXPORT HTML */
var exporter = new Exporter();

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

// This is the panel arrangement you get if you are new or your editor settings are out-of-date
var defaultPanelPrefs = {
	workspace : [
		{ id:"aboutPanel", 			visible:true, 	position:0 },
		{ id:"roomPanel", 			visible:true, 	position:1 },
		{ id:"paintPanel", 			visible:true, 	position:2 },
		{ id:"colorsPanel", 		visible:true, 	position:3 },
		{ id:"downloadPanel", 		visible:true, 	position:4 },
		{ id:"gifPanel", 			visible:false, 	position:5 },
		{ id:"dataPanel", 			visible:false, 	position:6 },
		{ id:"exitsPanel", 			visible:false, 	position:7 },
		{ id:"endingsPanel", 		visible:false, 	position:8 },
		{ id:"paintExplorerPanel",	visible:false,	position:9 }
	]
};
function getPanelPrefs() {
	// (TODO: weird that engine version and editor version are the same??)
	var useDefaultPrefs = ( localStorage.engine_version == null ) ||
							( localStorage.panel_prefs == null ) ||
							( JSON.parse(localStorage.engine_version).major < 3 ) ||
							( JSON.parse(localStorage.engine_version).minor < 2 );
	console.log("USE DEFAULT?? " + useDefaultPrefs);
	var prefs = useDefaultPrefs ? defaultPanelPrefs : JSON.parse( localStorage.panel_prefs );
	// add missing panel prefs (if any)
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

	//color testing
	// on_change_color_bg();
	// on_change_color_tile();
	// on_change_color_sprite();

	// save latest version used by editor (for compatibility)
	localStorage.engine_version = JSON.stringify( version );
}

function setDefaultGameState() {
	//clear values
	clearGameData();
	//hack
	curDrawingFrameIndex = 0;
	isCurDrawingAnimated = false;
	//default values
	title = "Write your game's title here";
	paletteIndex = 0;
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
	dialog["ITM_0"] = "You got a cup of tea! Nice.";
	renderImages();
	console.log("D");

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
	refreshGameData();
	updateExitOptionsFromGameData();
}

function on_drawing_name_change() {
	var str = document.getElementById("drawingName").value;
	var obj = getCurPaintObject();
	if(str.length > 0)
		obj.name = str;
	else
		obj.name = null;
	refreshGameData();
}

function on_palette_name_change() {
	var str = document.getElementById("paletteName").value;
	var obj = palette[ selectedColorPal() ];
	if(str.length > 0)
		obj.name = str;
	else
		obj.name = null;
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
		delete room[roomId];
		refreshGameData();
		nextRoom();
		drawEditMap();
		drawPaintCanvas();
		updateRoomPaletteSelect();
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

		drawingId = nextTileId();

		console.log("DUPLICATE TILE");		
		console.log(drawingId);
		console.log(copiedImageData);

		makeTile( drawingId, copiedImageData );

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
	}
	addPaintThumbnail( drawingId );
	changePaintExplorerSelection( drawingId );
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
		else if( paintMode == TileType.Avatar || paintMode == TileType.Sprite ){
			if ( Object.keys( sprite ).length <= 2 ) { alert("You can't delete your last sprite!"); return; }
			delete sprite[ drawingId ];
			refreshGameData();
			renderImages();
			drawEditMap();
			nextSprite();
		}
		else if( paintMode == TileType.Item ){
			if ( Object.keys( item ).length <= 1 ) { alert("You can't delete your last item!"); return; }
			delete item[ drawingId ];
			refreshGameData();
			renderImages();
			drawEditMap();
			nextItem();
		}
		deletePaintThumbnail( drawingId );
		changePaintExplorerSelection( drawingId );
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

	updateDrawingNameUI(false);

	drawPaintCanvas();
}

function updateWallCheckboxOnCurrentTile() {
	if (room[curRoom]) { //todo this per-room wall nonsense is confusing
		if (room[curRoom].walls.indexOf(drawingId) != -1) {
			document.getElementById("wallCheckbox").checked = true;
			document.getElementById("wallCheckboxIcon").innerHTML = "border_outer";
		}
		else {
			document.getElementById("wallCheckbox").checked = false;
			document.getElementById("wallCheckboxIcon").innerHTML = "border_clear";
		}
	}
}

function reloadDialogUI() {
	var dialogId = getCurDialogId();

	if (dialogId in dialog) {
		document.getElementById("dialogText").value = dialog[dialogId];
	}
	else {
		document.getElementById("dialogText").value = "";
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

	updateDrawingNameUI( drawingId != playerId );

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

/* UNIQUE ID METHODS */ // TODO - lots of duplicated code around stuff (ex: all these things with IDs)
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
		for (i in room[curRoom].tilemap) {
			for (j in room[curRoom].tilemap[i]) {
				var id = room[curRoom].tilemap[i][j];
				if ( room[curRoom].walls.indexOf(id) != -1 ) {
					ctx.fillRect(j*tilesize*scale,i*tilesize*scale,tilesize*scale,tilesize*scale);
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

function makeItem(id,imageData) {
	var drwId = "ITM_" + id;
	item[id] = { //todo create default item creation method
		drw : drwId,
		col : 2,
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
		}
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
		document.getElementById("toolsPanel").style.display = "block";
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
}

function on_play_mode() {
	isPlayMode = true;
	unlistenMapEditEvents();
	load_game(document.getElementById("game_data").value);
}

function updatePlayModeButton() {
	document.getElementById("playModeIcon").innerHTML = isPlayMode ? "stop" : "play_arrow";
	document.getElementById("playModeText").innerHTML = isPlayMode ? "stop" : "play";
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

function on_change_title() {
	title = document.getElementById("titleText").value;
	refreshGameData();
}

/* PALETTE STUFF */
function updatePaletteUI() {
	// document.getElementById("paletteId").innerHTML = selectedColorPal();
	document.getElementById("paletteName").placeholder = "palette " + selectedColorPal();
	var name = palette[ selectedColorPal() ].name;
	if( name )
		document.getElementById("paletteName").value = name;
	else
		document.getElementById("paletteName").value = "";

	// if ( Object.keys(palette).length > 1 ) {
	// 	document.getElementById("paletteIdContainer").style.display = "block";
	// 	document.getElementById("paletteNav").style.display = "block";
	// }
	// else {
	// 	document.getElementById("paletteIdContainer").style.display = "none";
	// 	document.getElementById("paletteNav").style.display = "none";
	// }

	updatePaletteOptionsFromGameData();
	updatePaletteControlsFromGameData();
	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
	}
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

function updatePaletteBorders() {
	console.log("UPDATE PALETTE BORDERS");
	//feature to show selected colors in browsers that don't support a color picker
	document.getElementById("backgroundColor").style.border = "solid " + document.getElementById("backgroundColor").value + " 5px";
	document.getElementById("tileColor").style.border = "solid " + document.getElementById("tileColor").value + " 5px";
	document.getElementById("spriteColor").style.border = "solid " + document.getElementById("spriteColor").value + " 5px";
}

function on_change_color_bg() {
	//color testing
	// document.body.style.background = document.getElementById("backgroundColor").value;

	var rgb = hexToRgb( document.getElementById("backgroundColor").value );
	getPal(selectedColorPal())[0][0] = rgb.r;
	getPal(selectedColorPal())[0][1] = rgb.g;
	getPal(selectedColorPal())[0][2] = rgb.b;
	refreshGameData();
	renderImages();
	drawPaintCanvas();
	drawEditMap();
	refreshPaintExplorer( true /*doKeepOldThumbnails*/ );
	if( isCurDrawingAnimated )
		renderAnimationPreview( drawingId );

	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
	}
}

function on_change_color_tile() {
	//color testing
	// var elements = document.getElementsByClassName("bar");
	// for (var i = 0; i < elements.length; i++) {
	// 	var el = elements[i];
	// 	console.log(el);
	// 	el.style.background = document.getElementById("tileColor").value;
	// }

	var rgb = hexToRgb( document.getElementById("tileColor").value );
	getPal(selectedColorPal())[1][0] = rgb.r;
	getPal(selectedColorPal())[1][1] = rgb.g;
	getPal(selectedColorPal())[1][2] = rgb.b;
	refreshGameData();
	renderImages();
	drawPaintCanvas();
	drawEditMap();
	refreshPaintExplorer( true /*doKeepOldThumbnails*/ );
	if( isCurDrawingAnimated )
		renderAnimationPreview( drawingId );

	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
	}
}

function on_change_color_sprite() {
	//color testing
	// document.getElementById("topbar").style.background = document.getElementById("spriteColor").value;

	var rgb = hexToRgb( document.getElementById("spriteColor").value );
	getPal(selectedColorPal())[2][0] = rgb.r;
	getPal(selectedColorPal())[2][1] = rgb.g;
	getPal(selectedColorPal())[2][2] = rgb.b;
	refreshGameData();
	renderImages();
	drawPaintCanvas();
	drawEditMap();
	refreshPaintExplorer( true /*doKeepOldThumbnails*/ );
	if( isCurDrawingAnimated )
		renderAnimationPreview( drawingId );

	if (!browserFeatures.colorPicker) {
		updatePaletteBorders();
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
	document.getElementById("backgroundColor").value = rgbToHex(getPal(selectedColorPal())[0][0], getPal(selectedColorPal())[0][1], getPal(selectedColorPal())[0][2]);
	document.getElementById("tileColor").value = rgbToHex(getPal(selectedColorPal())[1][0], getPal(selectedColorPal())[1][1], getPal(selectedColorPal())[1][2]);
	document.getElementById("spriteColor").value = rgbToHex(getPal(selectedColorPal())[2][0], getPal(selectedColorPal())[2][1], getPal(selectedColorPal())[2][2]);
}

function prevPalette() {
	// update index
	paletteIndex = (paletteIndex - 1);
	if (paletteIndex < 0) paletteIndex = Object.keys(palette).length - 1;

	// change the UI
	updatePaletteUI();
}

function nextPalette() {
	// update index
	paletteIndex = (paletteIndex + 1);
	if (paletteIndex >= Object.keys(palette).length) paletteIndex = 0;

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
	paletteIndex = Object.keys(palette).length - 1;
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
	updateDrawingNameUI(false);
	//document.getElementById("animation").setAttribute("style","display:block;");
	refreshPaintExplorer();
	document.getElementById("paintOptionTile").checked = true;
	document.getElementById("paintExplorerOptionTile").checked = true;
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
}

var drawingThumbnailCanvas, drawingThumbnailCtx;
function refreshPaintExplorer( doKeepOldThumbnails = false ) {
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

	var paintExplorerForm = document.getElementById("paintExplorerForm");
	if( !doKeepOldThumbnails )
		paintExplorerForm.innerHTML = "";
	
	for(var i = 0; i < idList.length; i++) {
		var id = idList[i];
		if(id != "A" || paintMode == TileType.Avatar)
		{
			if( !doKeepOldThumbnails )
				addPaintThumbnail( id ); // create thumbnail element and render thumbnail
			else
				renderPaintThumbnail( id ); // just re-render the thumbnail
		}
	}
}

function addPaintThumbnail(id) {
	var paintExplorerForm = document.getElementById("paintExplorerForm");

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
	var img = document.createElement("img");
	img.id = "paintExplorerThumbnail_" + id;
	if( paintMode === TileType.Tile )
		img.title = tile[id].name ? tile[id].name : "tile " + id;
	else if( paintMode === TileType.Sprite )
		img.title = sprite[id].name ? sprite[id].name : "sprite " + id;
	else if( paintMode === TileType.Avatar )
		img.title = "player avatar";
	else if( paintMode === TileType.Item )
		img.title = item[id].name ? item[id].name : "item " + id;
	label.appendChild(img);
	paintExplorerForm.appendChild(label);

	radio.onclick = selectPaint;
	
	renderPaintThumbnail( id );
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
	drawingId = this.value;
	if( paintMode === TileType.Tile ) {
		tileIndex = sortedTileIdList().indexOf( drawingId );
		reloadTile();
	}
	else {
		spriteIndex = sortedSpriteIdList().indexOf( drawingId );
		reloadSprite();
	}
}

function changePaintExplorerSelection(id) {
	var paintExplorerForm = document.getElementById("paintExplorerForm");
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
	var paintExplorerForm = document.getElementById("paintExplorerForm");
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
	return dialogId;
}

function getCurPaintObject() {
	console.log(drawingId);
	if(paintMode == TileType.Sprite || paintMode == TileType.Avatar) {
		return sprite[drawingId];
	}
	else if(paintMode == TileType.Item) {
		return item[drawingId];
	}
	else if(paintMode == TileType.Tile) {
		return tile[drawingId];
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

function nextAvailableDialogId(prefix = "") {
	var i = 0;
	var id = prefix + i.toString(36);
	while( dialog[id] != null ) {
		i++;
		id = prefix + i.toString(36);
	}
	return id;
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
		dialog[dialogId] = dialogStr;
	}
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


	updatePaletteUI();

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
	if ( e.target.checked ){
		//add to wall list
		room[curRoom].walls.push( drawingId );
		document.getElementById("wallCheckboxIcon").innerHTML = "border_outer";
	}
	else if ( room[curRoom].walls.indexOf(drawingId) != -1 ){
		//remove from wall list
		room[curRoom].walls.splice( room[curRoom].walls.indexOf(drawingId), 1 );
		document.getElementById("wallCheckboxIcon").innerHTML = "border_clear";
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

function exportGame() {
	refreshGameData(); //just in case
	var gameData = document.getElementById("game_data").value; //grab game data
	exporter.exportGame( gameData, title, exportPageColor, "mygame.html" ); //download as html file
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
		gameDataStr = exporter.importGame( fileText );
		
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
		else if ( paintMode === TileType.Item ) {
			addItemAnimation();
		}
		document.getElementById("animation").setAttribute("style","display:block;");
		document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
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
	reloadSprite();
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


var exportPageColor = "#fff";
function on_change_color_page() {
	var hex = document.getElementById("pageColor").value;
	//console.log(hex);
	var rgb = hexToRgb( hex );
	// document.body.style.background = hex;
	document.getElementById("roomPanel").style.background = hex;
	exportPageColor = hex;
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

/**
 * From: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 *
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

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

function onmousemove(e) {
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
document.addEventListener("mousemove",onmousemove);

function onmouseup(e) {
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
document.addEventListener("mouseup",onmouseup);

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