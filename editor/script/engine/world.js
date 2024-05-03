/* BITSY VERSION */
// is this the right place for this to live?
var version = {
	major: 8, // major changes
	minor: 12, // smaller changes
	devBuildPhase: "RELEASE",
};
function getEngineVersion() {
	return version.major + "." + version.minor;
}

/* TEXT CONSTANTS */
var titleDialogId = "title";

// todo : where should this be stored?
var tileColorStartIndex = 16;

var TextDirection = {
	LeftToRight : "LTR",
	RightToLeft : "RTL"
};

var defaultFontName = "ascii_small";

/* TUNE CONSTANTS */
var barLength = 16; // sixteenth notes
var minTuneLength = 1;
var maxTuneLength = 16;

// chromatic notes
var Note = {
	NONE 		: -1,
	C 			: 0,	// C
	C_SHARP 	: 1,	// C sharp / D flat
	D 			: 2,	// D
	D_SHARP 	: 3,	// D sharp / E flat
	E 			: 4,	// E
	F 			: 5,	// F
	F_SHARP 	: 6,	// F sharp / G flat
	G 			: 7,	// G
	G_SHARP 	: 8,	// G sharp / A flat
	A 			: 9,	// A
	A_SHARP 	: 10,	// A sharp / B flat
	B 			: 11,	// B
	COUNT 		: 12
};

// solfa notes
var Solfa = {
	NONE 	: -1,
	D 		: 0,	// Do
	R 		: 1,	// Re
	M 		: 2,	// Mi
	F 		: 3,	// Fa
	S 		: 4,	// Sol
	L 		: 5,	// La
	T 		: 6,	// Ti
	COUNT 	: 7
};

var Octave = {
	NONE: -1,
	2: 0,
	3: 1,
	4: 2, // octave 4: middle C octave
	5: 3,
	COUNT: 4
};

var Tempo = {
	SLW: 0, // slow
	MED: 1, // medium
	FST: 2, // fast
	XFST: 3 // extra fast (aka turbo)
};

var SquareWave = {
	P8: 0, // pulse 1 / 8
	P4: 1, // pulse 1 / 4
	P2: 2, // pulse 1 / 2
	COUNT: 3
};

var ArpeggioPattern = {
	OFF: 0,
	UP: 1, // ascending triad chord
	DWN: 2, // descending triad chord
	INT5: 3, // 5 step interval
	INT8: 4 // 8 setp interval
};

function createWorldData() {
	return {
		room : {},
		tile : {},
		sprite : {},
		item : {},
		dialog : {},
		end : {}, // pre-7.0 ending data for backwards compatibility
		palette : { // start off with a default palette
			"default" : {
				name : "default",
				colors : [[0,0,0],[255,255,255],[255,255,255]]
			}
		},
		variable : {},
		tune : {},
		blip : {},
		versionNumberFromComment : -1, // -1 indicates no version information found
		fontName : defaultFontName,
		textDirection : TextDirection.LeftToRight,
		flags : createDefaultFlags(),
		names : {},
		// source data for all drawings (todo: better name?)
		drawings : {},
	};
}

// creates a drawing data structure with default property values for the type
function createDrawingData(type, id) {
	// the avatar's drawing id still uses the sprite prefix (for back compat)
	var drwId = (type === "AVA" ? "SPR" : type) + "_" + id;

	var drawingData = {
		type : type,
		id : id,
		name : null,
		drw : drwId,
		col : (type === "TIL") ? 1 : 2, // foreground color
		bgc : 0, // background color
		animation : {
			isAnimated : false,
			frameIndex : 0,
			frameCount : 1,
		},
	};

	// add type specific properties
	if (type === "TIL") {
		// default null value indicates it can vary from room to room (original version)
		drawingData.isWall = null;
	}

	if (type === "AVA" || type === "SPR") {
		// default sprite location is "offstage"
		drawingData.room = null;
		drawingData.x = -1;
		drawingData.y = -1;
		drawingData.inventory = {};
	}

	if (type === "AVA" || type === "SPR" || type === "ITM") {
		drawingData.dlg = null;
		drawingData.blip = null;
	}

	return drawingData;
}

function createTuneData(id) {
	var tuneData = {
		id : id,
		name : null,
		melody : [],
		harmony : [],
		key: null, // a null key indicates a chromatic scale (all notes enabled)
		tempo: Tempo.MED,
		instrumentA : SquareWave.P2,
		instrumentB : SquareWave.P2,
		arpeggioPattern : ArpeggioPattern.OFF,
	};
	return tuneData;
}

function createTuneBarData() {
	var bar = [];
	for (var i = 0; i < barLength; i++) {
		bar.push({ beats: 0, note: Note.C, octave: Octave[4] });
	}
	return bar;
}

function createTuneKeyData() {
	var key = {
		notes: [], // mapping of the solfa scale degrees to chromatic notes
		scale: []  // list of solfa notes that are enabled for this key
	};

	// initialize notes
	for (var i = 0; i < Solfa.COUNT; i++) {
		key.notes.push(Note.NONE);
	}

	return key;
}

function createBlipData(id) {
	var blipData = {
		id: id,
		name: null,
		pitchA: { beats: 0, note: Note.C, octave: Octave[4] },
		pitchB: { beats: 0, note: Note.C, octave: Octave[4] },
		pitchC: { beats: 0, note: Note.C, octave: Octave[4] },
		envelope: {
			attack: 0, // attack time in ms
			decay: 0, // decay time in ms
			sustain: 0, // sustain volume
			length: 0, // sustain time in ms
			release: 0 // release time in ms
		},
		beat : {
			time: 0, // time in ms between pitch changes
			delay: 0 // time in ms *before* first pitch change
		},
		instrument: SquareWave.P2,
		doRepeat: false
		// TODO : consider for future update
		// doSlide: false,
	};

	return blipData;
}

function createDefaultFlags() {
	return {
		// version
		VER_MAJ: -1, // major version number (-1 = no version information found)
		VER_MIN: -1, // minor version number (-1 = no version information found)
		// compatibility
		ROOM_FORMAT: 0, // 0 = non-comma separated (original), 1 = comma separated (default)
		DLG_COMPAT: 0, // 0 = default dialog behavior, 1 = pre-7.0 dialog behavior
		// config
		TXT_MODE: 0 // 0 = HIREZ (2x - default), 1 = LOREZ (1x)
	};
}

function createDialogData(id) {
	return {
		src : "",
		name : null,
		id : id,
	};
}

function parseWorld(file) {
	bitsy.log("create world data");

	var world = createWorldData();

	bitsy.log("init parse state");

	var parseState = {
		lines : file.split("\n"),
		index : 0,
		spriteStartLocations : {}
	};

	bitsy.log("start reading lines");

	while (parseState.index < parseState.lines.length) {
		var i = parseState.index;
		var lines = parseState.lines;
		var curLine = lines[i];

		// bitsy.log("LN " + i + " xx " + curLine);

		if (i == 0) {
			i = parseTitle(parseState, world);
		}
		else if (curLine.length <= 0 || curLine.charAt(0) === "#") {
			// collect version number from a comment (hacky but required for pre-8.0 compatibility)
			if (curLine.indexOf("# BITSY VERSION ") != -1) {
				world.versionNumberFromComment = parseFloat(curLine.replace("# BITSY VERSION ", ""));
			}

			//skip blank lines & comments
			i++;
		}
		else if (getType(curLine) === "PAL") {
			i = parsePalette(parseState, world);
		}
		else if (getType(curLine) === "ROOM" || getType(curLine) === "SET") { // SET for back compat
			i = parseRoom(parseState, world);
		}
		else if (getType(curLine) === "TIL") {
			i = parseTile(parseState, world);
		}
		else if (getType(curLine) === "SPR") {
			i = parseSprite(parseState, world);
		}
		else if (getType(curLine) === "ITM") {
			i = parseItem(parseState, world);
		}
		else if (getType(curLine) === "DLG") {
			i = parseDialog(parseState, world);
		}
		else if (getType(curLine) === "END") {
			// parse endings for back compat
			i = parseEnding(parseState, world);
		}
		else if (getType(curLine) === "VAR") {
			i = parseVariable(parseState, world);
		}
		else if (getType(curLine) === "DEFAULT_FONT") {
			i = parseFontName(parseState, world);
		}
		else if (getType(curLine) === "TEXT_DIRECTION") {
			i = parseTextDirection(parseState, world);
		}
		else if (getType(curLine) === "FONT") {
			i = parseFontData(parseState, world);
		}
		else if (getType(curLine) === "TUNE") {
			i = parseTune(parseState, world);
		}
		else if (getType(curLine) === "BLIP") {
			i = parseBlip(parseState, world);
		}
		else if (getType(curLine) === "!") {
			i = parseFlag(parseState, world);
		}
		else {
			i++;
		}

		parseState.index = i;
	}

	world.names = createNameMapsForWorld(world);

	placeSprites(parseState, world);

	if ((world.flags.VER_MAJ <= -1 || world.flags.VER_MIN <= -1) && world.versionNumberFromComment > -1) {
		var versionNumberStr = "" + world.versionNumberFromComment;
		versionNumberStr = versionNumberStr.split(".");
		world.flags.VER_MAJ = parseFloat(versionNumberStr[0]);
		world.flags.VER_MIN = parseFloat(versionNumberStr[1]);
	}

	// starting in version v7.0, there were two major changes to dialog behavior:
	// 1) sprite dialog was no longer implicitly linked by the sprite and dialog IDs matching
	//    (see this commit: 5e1adb29faad4e50603c689d2dac143074117b4e)
	// 2) ending dialogs no longer had their own world data type ("END")
	// for the v7.x versions I tried to automatically convert old dialog to the new format,
	// however, that process can be unreliable and lead to weird bugs.
	// with v8.0 and above I will no longer attempt to convert old files, and instead will use
	// a flag to indicate files that need to use the backwards compatible behavior -
	// this is more reliable & configurable (at the cost of making pre-7.0 games a bit harder to edit)
	if (world.flags.VER_MAJ < 7) {
		world.flags.DLG_COMPAT = 1;
	}

	return world;
}

function parseTitle(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	var results;
	if (scriptUtils) {
		results = scriptUtils.ReadDialogScript(lines,i);
	}
	else {
		results = { script: lines[i], index: (i + 1) };
	}

	world.dialog[titleDialogId] = createDialogData(titleDialogId);
	world.dialog[titleDialogId].src = results.script;

	i = results.index;
	i++;

	return i;
}

function parsePalette(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	var id = getId(lines[i]);
	i++;
	var colors = [];
	var name = null;
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		var args = lines[i].split(" ");
		if (args[0] === "NAME") {
			name = lines[i].split(/\s(.+)/)[1];
		}
		else {
			var col = [];
			lines[i].split(",").forEach(function(i) {
				col.push(parseInt(i));
			});
			colors.push(col);
		}
		i++;
	}
	world.palette[id] = {
		id : id,
		name : name,
		colors : colors
	};
	return i;
}

function createRoomData(id) {
	return {
		id: id,
		name: null,
		tilemap: [],
		walls: [],
		exits: [],
		endings: [],
		items: [],
		pal: null,
		ava: null,
		tune: "0"
	};
}

function createExitData(x, y, destRoom, destX, destY, transition, dlg) {
	return {
		x: x,
		y: y,
		dest: {
			room: destRoom,
			x: destX,
			y: destY
		},
		transition_effect: transition,
		dlg: dlg,
	};
}

function createEndingData(id, x, y) {
	return {
		id: id,
		x: x,
		y: y
	};
}

function parseRoom(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;
	var id = getId(lines[i]);

	var roomData = createRoomData(id);

	i++;

	// create tile map
	if (world.flags.ROOM_FORMAT === 0) {
		// old way: no commas, single char tile ids
		var end = i + bitsy.MAP_SIZE;
		var y = 0;
		for (; i < end; i++) {
			roomData.tilemap.push([]);
			for (x = 0; x < bitsy.MAP_SIZE; x++) {
				roomData.tilemap[y].push(lines[i].charAt(x));
			}
			y++;
		}
	}
	else if (world.flags.ROOM_FORMAT === 1) {
		// new way: comma separated, multiple char tile ids
		var end = i + bitsy.MAP_SIZE;
		var y = 0;
		for (; i < end; i++) {
			roomData.tilemap.push([]);
			var lineSep = lines[i].split(",");
			for (x = 0; x < bitsy.MAP_SIZE; x++) {
				roomData.tilemap[y].push(lineSep[x]);
			}
			y++;
		}
	}

	while (i < lines.length && lines[i].length > 0) { //look for empty line
		// bitsy.log(getType(lines[i]));
		if (getType(lines[i]) === "SPR") {
			/* NOTE SPRITE START LOCATIONS */
			var sprId = getId(lines[i]);
			if (sprId.indexOf(",") == -1 && lines[i].split(" ").length >= 3) { //second conditional checks for coords
				/* PLACE A SINGLE SPRITE */
				var sprCoord = lines[i].split(" ")[2].split(",");
				parseState.spriteStartLocations[sprId] = {
					room : id,
					x : parseInt(sprCoord[0]),
					y : parseInt(sprCoord[1])
				};
			}
			else if ( world.flags.ROOM_FORMAT == 0 ) { // TODO: right now this shortcut only works w/ the old comma separate format
				/* PLACE MULTIPLE SPRITES*/ 
				//Does find and replace in the tilemap (may be hacky, but its convenient)
				var sprList = sprId.split(",");
				for (row in roomData.tilemap) {
					for (s in sprList) {
						var col = roomData.tilemap[row].indexOf( sprList[s] );
						//if the sprite is in this row, replace it with the "null tile" and set its starting position
						if (col != -1) {
							roomData.tilemap[row][col] = "0";
							parseState.spriteStartLocations[ sprList[s] ] = {
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
			roomData.items.push( itm );
		}
		else if (getType(lines[i]) === "WAL") {
			/* DEFINE COLLISIONS (WALLS) */
			roomData.walls = getId(lines[i]).split(",");
		}
		else if (getType(lines[i]) === "EXT") {
			/* ADD EXIT */
			var exitArgs = lines[i].split(" ");
			//arg format: EXT 10,5 M 3,2 [AVA:7 LCK:a,9] [AVA 7 LCK a 9]
			var exitCoords = exitArgs[1].split(",");
			var destName = exitArgs[2];
			var destCoords = exitArgs[3].split(",");
			var ext = createExitData(
				/* x 			*/ parseInt(exitCoords[0]),
				/* y 			*/ parseInt(exitCoords[1]),
				/* destRoom 	*/ destName,
				/* destX 		*/ parseInt(destCoords[0]),
				/* destY 		*/ parseInt(destCoords[1]),
				/* transition 	*/ null,
				/* dlg 			*/ null);

			// optional arguments
			var exitArgIndex = 4;
			while (exitArgIndex < exitArgs.length) {
				if (exitArgs[exitArgIndex] == "FX") {
					ext.transition_effect = exitArgs[exitArgIndex+1];
					exitArgIndex += 2;
				}
				else if (exitArgs[exitArgIndex] == "DLG") {
					ext.dlg = exitArgs[exitArgIndex+1];
					exitArgIndex += 2;
				}
				else {
					exitArgIndex += 1;
				}
			}

			roomData.exits.push(ext);
		}
		else if (getType(lines[i]) === "END") {
			/* ADD ENDING */
			var endId = getId(lines[i]);

			var endCoords = getCoord(lines[i], 2);
			var end = createEndingData(
				/* id */ endId,
				/* x */ parseInt(endCoords[0]),
				/* y */ parseInt(endCoords[1]));

			roomData.endings.push(end);
		}
		else if (getType(lines[i]) === "PAL") {
			/* CHOOSE PALETTE (that's not default) */
			roomData.pal = getId(lines[i]);
		}
		else if (getType(lines[i]) === "AVA") {
			// change avatar appearance per room
			roomData.ava = getId(lines[i]);
		}
		else if (getType(lines[i]) === "TUNE") {
			roomData.tune = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			roomData.name = getNameArg(lines[i]);
		}

		i++;
	}

	world.room[id] = roomData;

	return i;
}

function parseTile(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	var id = getId(lines[i]);
	var tileData = createDrawingData("TIL", id);

	i++;

	// read & store tile image source
	i = parseDrawingCore(lines, i, tileData.drw, world);

	// update animation info
	tileData.animation.frameCount = getDrawingFrameCount(world, tileData.drw);
	tileData.animation.isAnimated = tileData.animation.frameCount > 1;

	// read other properties
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "COL") {
			tileData.col = parseInt(getId(lines[i]));
		}
		else if (getType(lines[i]) === "BGC") {
			var bgcId = getId(lines[i]);
			if (bgcId === "*") {
				// transparent background
				tileData.bgc = (-1 * tileColorStartIndex);
			}
			else {
				tileData.bgc = parseInt(bgcId);
			}
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			tileData.name = getNameArg(lines[i]);
		}
		else if (getType(lines[i]) === "WAL") {
			var wallArg = getArg(lines[i], 1);
			if (wallArg === "true") {
				tileData.isWall = true;
			}
			else if (wallArg === "false") {
				tileData.isWall = false;
			}
		}

		i++;
	}

	// store tile data
	world.tile[id] = tileData;

	return i;
}

function parseSprite(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	var id = getId(lines[i]);
	var type = (id === "A") ? "AVA" : "SPR";
	var spriteData = createDrawingData(type, id);

	// bitsy.log(spriteData);

	i++;

	// read & store sprite image source
	i = parseDrawingCore(lines, i, spriteData.drw, world);

	// update animation info
	spriteData.animation.frameCount = getDrawingFrameCount(world, spriteData.drw);
	spriteData.animation.isAnimated = spriteData.animation.frameCount > 1;

	// read other properties
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			spriteData.col = parseInt(getId(lines[i]));
		}
		else if (getType(lines[i]) === "BGC") {
			/* BACKGROUND COLOR */
			var bgcId = getId(lines[i]);
			if (bgcId === "*") {
				// transparent background
				spriteData.bgc = (-1 * tileColorStartIndex);
			}
			else {
				spriteData.bgc = parseInt(bgcId);
			}
		}
		else if (getType(lines[i]) === "POS") {
			/* STARTING POSITION */
			var posArgs = lines[i].split(" ");
			var roomId = posArgs[1];
			var coordArgs = posArgs[2].split(",");
			parseState.spriteStartLocations[id] = {
				room : roomId,
				x : parseInt(coordArgs[0]),
				y : parseInt(coordArgs[1])
			};
		}
		else if(getType(lines[i]) === "DLG") {
			spriteData.dlg = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			spriteData.name = getNameArg(lines[i]);
		}
		else if (getType(lines[i]) === "ITM") {
			/* ITEM STARTING INVENTORY */
			var itemId = getId(lines[i]);
			var itemCount = parseFloat(getArg(lines[i], 2));
			spriteData.inventory[itemId] = itemCount;
		}
		else if (getType(lines[i]) == "BLIP") {
			var blipId = getId(lines[i]);
			spriteData.blip = blipId;
		}

		i++;
	}

	// store sprite data
	world.sprite[id] = spriteData;

	return i;
}

function parseItem(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	var id = getId(lines[i]);
	var itemData = createDrawingData("ITM", id);

	i++;

	// read & store item image source
	i = parseDrawingCore(lines, i, itemData.drw, world);

	// update animation info
	itemData.animation.frameCount = getDrawingFrameCount(world, itemData.drw);
	itemData.animation.isAnimated = itemData.animation.frameCount > 1;

	// read other properties
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			itemData.col = parseInt(getArg(lines[i], 1));
		}
		else if (getType(lines[i]) === "BGC") {
			/* BACKGROUND COLOR */
			var bgcId = getId(lines[i]);
			if (bgcId === "*") {
				// transparent background
				itemData.bgc = (-1 * tileColorStartIndex);
			}
			else {
				itemData.bgc = parseInt(bgcId);
			}
		}
		else if (getType(lines[i]) === "DLG") {
			itemData.dlg = getId(lines[i]);
		}
		else if (getType(lines[i]) === "NAME") {
			/* NAME */
			itemData.name = getNameArg(lines[i]);
		}
		else if (getType(lines[i]) == "BLIP") {
			var blipId = getId(lines[i]);
			itemData.blip = blipId;
		}

		i++;
	}

	// store item data
	world.item[id] = itemData;

	return i;
}

function parseDrawingCore(lines, i, drwId, world) {
	var frameList = []; //init list of frames
	frameList.push( [] ); //init first frame
	var frameIndex = 0;
	var y = 0;
	while (y < bitsy.TILE_SIZE) {
		var line = lines[i + y];
		var row = [];

		for (x = 0; x < bitsy.TILE_SIZE; x++) {
			row.push(parseInt(line.charAt(x)));
		}

		frameList[frameIndex].push(row);
		y++;

		if (y === bitsy.TILE_SIZE) {
			i = i + y;
			if (lines[i] != undefined && lines[i].charAt(0) === ">") {
				// start next frame!
				frameList.push([]);
				frameIndex++;

				//start the count over again for the next frame
				i++;
				y = 0;
			}
		}
	}

	storeDrawingData(world, drwId, frameList);

	return i;
}

function parseDialog(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	// hacky but I need to store this so I can set the name below
	var id = getId(lines[i]);

	i = parseScript(lines, i, world.dialog);

	if (i < lines.length && lines[i].length > 0 && getType(lines[i]) === "NAME") {
		world.dialog[id].name = getNameArg(lines[i]);
		i++;
	}

	return i;
}

// keeping this around to parse old files where endings were separate from dialogs
function parseEnding(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	return parseScript(lines, i, world.end);
}

function parseScript(lines, i, data) {
	var id = getId(lines[i]);
	i++;

	var results;
	if (scriptUtils) {
		results = scriptUtils.ReadDialogScript(lines,i);
	}
	else {
		results = { script: lines[i], index: (i + 1)};
	}

	data[id] = createDialogData(id);
	data[id].src = results.script;

	i = results.index;

	return i;
}

function parseVariable(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;
	var id = getId(lines[i]);
	i++;
	var value = lines[i];
	i++;
	world.variable[id] = value;
	return i;
}

function parseFontName(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;
	world.fontName = getArg(lines[i], 1);
	i++;
	return i;
}

function parseTextDirection(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;
	world.textDirection = getArg(lines[i], 1);
	i++;
	return i;
}

function parseFontData(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	// NOTE : we're not doing the actual parsing here --
	// just grabbing the block of text that represents the font
	// and giving it to the font manager to use later

	var localFontName = getId(lines[i]);
	var localFontData = lines[i];
	i++;

	while (i < lines.length && lines[i] != "") {
		localFontData += "\n" + lines[i];
		i++;
	}

	var localFontFilename = localFontName + fontManager.GetExtension();
	fontManager.AddResource( localFontFilename, localFontData );

	return i;
}

function parseTune(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	var id = getId(lines[i]);
	i++;

	var tuneData = createTuneData(id);

	var barIndex = 0;
	while (barIndex < maxTuneLength) {
		// MELODY
		var melodyBar = createTuneBarData();
		var melodyNotes = lines[i].split(",");
		for (var j = 0; j < barLength; j++) {
			// default to a rest
			var pitch = { beats: 0, note: Note.C, octave: Octave[4], };

			if (j < melodyNotes.length) {
				var pitchSplit = melodyNotes[j].split("~");
				var pitchStr = pitchSplit[0];
				pitch = parsePitch(melodyNotes[j]);

				// look for effect added to the note
				if (pitchSplit.length > 1) {
					var blipId = pitchSplit[1];
					pitch.blip = blipId;
				}
			}

			melodyBar[j] = pitch;
		}
		tuneData.melody.push(melodyBar);
		i++;

		// HARMONY
		var harmonyBar = createTuneBarData();
		var harmonyNotes = lines[i].split(",");
		for (var j = 0; j < barLength; j++) {
			// default to a rest
			var pitch = { beats: 0, note: Note.C, octave: Octave[4], };

			if (j < harmonyNotes.length) {
				var pitchSplit = harmonyNotes[j].split("~");
				var pitchStr = pitchSplit[0];
				pitch = parsePitch(harmonyNotes[j]);

				// look for effect added to the note
				if (pitchSplit.length > 1) {
					var blipId = pitchSplit[1];
					pitch.blip = blipId;
				}
			}

			harmonyBar[j] = pitch;
		}
		tuneData.harmony.push(harmonyBar);
		i++;

		// check if there's another bar after this one
		if (lines[i] === ">") {
			// there is! increment the index
			barIndex++;
			i++;
		}
		else {
			// we've reached the end of the tune!
			barIndex = maxTuneLength;
		}
	}

	// parse other tune properties
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "KEY") {
			tuneData.key = createTuneKeyData();

			var keyNotes = getArg(lines[i], 1);
			if (keyNotes) {
				keyNotes = keyNotes.split(",");
				for (var j = 0; j < keyNotes.length && j < tuneData.key.notes.length; j++) {
					var pitch = parsePitch(keyNotes[j]);
					tuneData.key.notes[j] = pitch.note;
				}
			}

			var keyScale = getArg(lines[i], 2);
			if (keyScale) {
				keyScale = keyScale.split(",");
				for (var j = 0; j < keyScale.length; j++) {
					var pitch = parsePitch(keyScale[j]);
					if (pitch.note > Solfa.NONE && pitch.note < Solfa.COUNT) {
						tuneData.key.scale.push(pitch.note);
					}
				}
			}
		}
		else if (getType(lines[i]) === "TMP") {
			var tempoId = getId(lines[i]);
			if (Tempo[tempoId] != undefined) {
				tuneData.tempo = Tempo[tempoId];
			}
		}
		else if (getType(lines[i]) === "SQR") {
			// square wave instrument settings
			var squareWaveIdA = getArg(lines[i], 1);
			if (SquareWave[squareWaveIdA] != undefined) {
				tuneData.instrumentA = SquareWave[squareWaveIdA];
			}

			var squareWaveIdB = getArg(lines[i], 2);
			if (SquareWave[squareWaveIdB] != undefined) {
				tuneData.instrumentB = SquareWave[squareWaveIdB];
			}
		}
		else if (getType(lines[i]) === "ARP") {
			var arp = getId(lines[i]);
			if (ArpeggioPattern[arp] != undefined) {
				tuneData.arpeggioPattern = ArpeggioPattern[arp];
			}
		}
		else if (getType(lines[i]) === "NAME") {
			var name = lines[i].split(/\s(.+)/)[1];
			tuneData.name = name;
			// todo : add to map?
		}

		i++;
	}

	world.tune[id] = tuneData;

	return i;
}

function parseBlip(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;

	var id = getId(lines[i]);
	i++;

	var blipData = createBlipData(id);

	// blip pitches
	var notes = lines[i].split(",");
	if (notes.length >= 1) {
		blipData.pitchA = parsePitch(notes[0]);
	}
	if (notes.length >= 2) {
		blipData.pitchB = parsePitch(notes[1]);
	}
	if (notes.length >= 3) {
		blipData.pitchC = parsePitch(notes[2]);
	}
	i++;

	// blip parameters
	while (i < lines.length && lines[i].length > 0) { // look for empty line
		if (getType(lines[i]) === "ENV") {
			// envelope
			blipData.envelope.attack = parseInt(getArg(lines[i], 1));
			blipData.envelope.decay = parseInt(getArg(lines[i], 2));
			blipData.envelope.sustain = parseInt(getArg(lines[i], 3));
			blipData.envelope.length = parseInt(getArg(lines[i], 4));
			blipData.envelope.release = parseInt(getArg(lines[i], 5));
		}
		else if (getType(lines[i]) === "BEAT") {
			// pitch beat length
			blipData.beat.time = parseInt(getArg(lines[i], 1));
			blipData.beat.delay = parseInt(getArg(lines[i], 2));
		}
		else if (getType(lines[i]) === "SQR") {
			// square wave
			var squareWaveId = getArg(lines[i], 1);
			if (SquareWave[squareWaveId] != undefined) {
				blipData.instrument = SquareWave[squareWaveId];
			}
		}
		// TODO : consider for future update
		// else if (getType(lines[i]) === "SLD") {
		// 	// slide mode
		// 	if (parseInt(getArg(lines[i], 1)) === 1) {
		// 		blipData.doSlide = true;
		// 	}
		// }
		else if (getType(lines[i]) === "RPT") {
			// repeat mode
			if (parseInt(getArg(lines[i], 1)) === 1) {
				blipData.doRepeat = true;
			}
		}
		else if (getType(lines[i]) === "NAME") {
			var name = lines[i].split(/\s(.+)/)[1];
			blipData.name = name;
		}

		i++;
	}

	world.blip[id] = blipData;

	return i;
}

function parsePitch(pitchStr) {
	var pitch = { beats: 1, note: Note.C, octave: Octave[4], };
	var i;

	// beats
	var beatsToken = "";
	for (i = 0; i < pitchStr.length && ("0123456789".indexOf(pitchStr[i]) != -1); i++) {
		beatsToken += pitchStr[i];
	}
	if (beatsToken.length > 0) {
		pitch.beats = parseInt(beatsToken);
	}

	// note
	var noteType;
	var noteName = "";
	if (i < pitchStr.length) {
		if (pitchStr[i] === pitchStr[i].toUpperCase()) {
			// uppercase letters represent chromatic notes
			noteType = Note;
			noteName += pitchStr[i];
			i++;

			// check for sharp
			if (i < pitchStr.length && pitchStr[i] === "#") {
				noteName += "_SHARP";
				i++;
			}
		}
		else {
			// lowercase letters represent solfa notes
			noteType = Solfa;
			noteName += pitchStr[i].toUpperCase();
			i++;
		}
	}

	if (noteType != undefined && noteType[noteName] != undefined) {
		pitch.note = noteType[noteName];
	}

	// octave
	var octaveToken = "";
	if (i < pitchStr.length) {
		octaveToken += pitchStr[i];
	}

	if (Octave[octaveToken] != undefined) {
		pitch.octave = Octave[octaveToken];
	}

	return pitch;
}

function parseFlag(parseState, world) {
	var i = parseState.index;
	var lines = parseState.lines;
	var id = getId(lines[i]);
	var valStr = lines[i].split(" ")[2];
	world.flags[id] = parseInt( valStr );
	i++;
	return i;
}

function getDrawingFrameCount(world, drwId) {
	return world.drawings[drwId].length;
}

function storeDrawingData(world, drwId, drawingData) {
	world.drawings[drwId] = drawingData;
}

function placeSprites(parseState, world) {
	for (id in parseState.spriteStartLocations) {
		world.sprite[id].room = parseState.spriteStartLocations[id].room;
		world.sprite[id].x = parseState.spriteStartLocations[id].x;
		world.sprite[id].y = parseState.spriteStartLocations[id].y;
	}
}

function createNameMapsForWorld(world) {
	var nameMaps = {};

	function createNameMap(objectStore) {
		var map = {};

		for (id in objectStore) {
			if (objectStore[id].name != undefined && objectStore[id].name != null) {
				map[objectStore[id].name] = id;
			}
		}

		return map;
	}

	nameMaps.room = createNameMap(world.room);
	nameMaps.tile = createNameMap(world.tile);
	nameMaps.sprite = createNameMap(world.sprite);
	nameMaps.item = createNameMap(world.item);
	nameMaps.dialog = createNameMap(world.dialog);
	nameMaps.palette = createNameMap(world.palette);
	nameMaps.tune = createNameMap(world.tune);
	nameMaps.blip = createNameMap(world.blip);

	return nameMaps;
}

function getType(line) {
	return getArg(line,0);
}

function getId(line) {
	return getArg(line,1);
}

function getCoord(line,arg) {
	return getArg(line,arg).split(",");
}

function getArg(line,arg) {
	return line.split(" ")[arg];
}

function getNameArg(line) {
	var name = line.split(/\s(.+)/)[1];
	return name;
}