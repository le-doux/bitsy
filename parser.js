function BitsyGameData() {
	// TODO:
	// X room
	// how to do getter / setters properly? (don't do it for now)
	// X flags
	// resetFlags() (might not be needed with this set up since they're "reset" on game data creation)
	// placeSprites()
	// spriteStartLocations ?? (should be in parser temp variable)
	// player() (save for engine)
	// curRoom (save for engine)
	// X palette
	// X tile
	// X sprite
	// X imageStore.source (rename this??? drawing)
	// X dialog
	// X ending
	// getEngineVersion() (part of game data... or parser? or??)
	//		- this concept could be clarified: there's an engine verison, an editor version, and a file format version (in theory)
	// how do I pass the game data around in the parser/serializer? (do I give it to it at creation? or attach it? or pass it down?)
	// isExitValid()

	this.title = "";
	this.room = {};
	this.tile = {};
	this.sprite = {};
	this.drawing = {}; // replacement for imageStore.source
	this.dialog = {};
	this.palette = {
		"0" : [[0,0,0],[255,0,0],[255,255,255]] //start off with a default palette (can be overriden)
	};
	this.ending = {};
	// idea: could flags just be specified for the parser instead of the game data?
	this.flags = {
		ROOM_FORMAT : 0 // 0 = non-comma separated, 1 = comma separated
	};
} // BitsyGameData()


function Parser() {


/* parsing */
var curGameData; // the parser only has one internal game data object at a time (a bit hacky)
var spriteStartLocations;

this.parse = function(gameDataString) {
	curGameData = new BitsyGameData();
	spriteStartLocations = {};
	parseWorld( gameDataString );
	return curGameData;
}

function parseWorld(file) {
	// resetFlags(); // not necessary anymore

	var lines = file.split("\n");
	var i = 0;
	while (i < lines.length) {
		var curLine = lines[i];

		// console.log(lines[i]);

		if (i == 0) {
			i = parseTitle(lines, i);
		}
		else if (curLine.length <= 0 || curLine.charAt(0) === "#") {
			//skip blank lines & comments
			i++;
		}
		else if (getType(curLine) == "PAL") {
			i = parsePalette(lines, i);
		}
		else if (getType(curLine) === "ROOM" || getType(curLine) === "SET") { //SET for back compat
			i = parseRoom(lines, i);
		}
		else if (getType(curLine) === "TIL") {
			i = parseTile(lines, i);
		}
		else if (getType(curLine) === "SPR") {
			i = parseSprite(lines, i);
		}
		else if (getType(curLine) === "DRW") {
			i = parseDrawing(lines, i);
		}
		else if (getType(curLine) === "DLG") {
			i = parseDialog(lines, i);
		}
		else if (getType(curLine) === "END") {
			i = parseEnding(lines, i);
		}
		else if (getType(curLine) === "!") {
			i = parseFlag(lines, i);
		}
		else {
			i++;
		}
	}
	placeSprites();

	// save this for the engine
	// if (player().room != null) {
	// 	curRoom = player().room;
	// }
}

/* ARGUMENT GETTERS */
function getType(line) {
	return getArg(line,0);
}

function getId(line) {
	return getArg(line,1);
}

function getArg(line,arg) {
	return line.split(" ")[arg];
}

function getCoord(line,arg) {
	return getArg(line,arg).split(",");
}

function parseTitle(lines, i) {
	title = lines[i];
	i++;
	return i;
}

function parseRoom(lines, i) {
	var id = getId(lines[i]);
	curGameData.room[id] = {
		id : id,
		tilemap : [],
		walls : [],
		exits : [],
		endings : [],
		pal : null
	};
	i++;

	// create tile map
	if ( curGameData.flags.ROOM_FORMAT == 0 ) {
		// old way: no commas, single char tile ids
		var end = i + mapsize;
		var y = 0;
		for (; i<end; i++) {
			curGameData.room[id].tilemap.push( [] );
			for (x = 0; x<mapsize; x++) {
				curGameData.room[id].tilemap[y].push( lines[i].charAt(x) );
			}
			y++;
		}
	}
	else if ( curGameData.flags.ROOM_FORMAT == 1 ) {
		// new way: comma separated, multiple char tile ids
		var end = i + mapsize;
		var y = 0;
		for (; i<end; i++) {
			curGameData.room[id].tilemap.push( [] );
			var lineSep = lines[i].split(",");
			for (x = 0; x<mapsize; x++) {
				curGameData.room[id].tilemap[y].push( lineSep[x] );
			}
			y++;
		}
	}

	while (i < lines.length && lines[i].length > 0) { //look for empty line
		// console.log(getType(lines[i]));
		if (getType(lines[i]) === "SPR") {
			/* NOTE SPRITE START LOCATIONS */
			var sprId = getId(lines[i]);
			if (sprId.indexOf(",") == -1 && lines[i].split(" ").length >= 3) { //second conditional checks for coords
				/* PLACE A SINGLE SPRITE */
				var sprCoord = lines[i].split(" ")[2].split(",");
				spriteStartLocations[sprId] = {
					room : id,
					x : parseInt(sprCoord[0]),
					y : parseInt(sprCoord[1])
				};
			}
			else if ( curGameData.flags.ROOM_FORMAT == 0 ) { // TODO: right now this shortcut only works w/ the old comma separate format
				/* PLACE MULTIPLE SPRITES*/ 
				//Does find and replace in the tilemap (may be hacky, but its convenient)
				var sprList = sprId.split(",");
				for (row in room[id].tilemap) {
					for (s in sprList) {
						var col = room[id].tilemap[row].indexOf( sprList[s] );
						//if the sprite is in this row, replace it with the "null tile" and set its starting position
						if (col != -1) {
							curGameData.room[id].tilemap[row][col] = "0";
							spriteStartLocations[ sprList[s] ] = {
								room : id,
								x : parseInt(col),
								y : parseInt(row)
							};
						}
					}
				}
			}
		}
		else if (getType(lines[i]) === "WAL") {
			/* DEFINE COLLISIONS (WALLS) */
			curGameData.room[id].walls = getId(lines[i]).split(",");
		}
		else if (getType(lines[i]) === "EXT") {
			/* ADD EXIT */
			var exitArgs = lines[i].split(" ");
			//arg format: EXT 10,5 M 3,2
			var exitCoords = exitArgs[1].split(",");
			var destName = exitArgs[2];
			var destCoords = exitArgs[3].split(",");
			var ext = {
				x : parseInt(exitCoords[0]),
				y : parseInt(exitCoords[1]),
				dest : {
					room : destName,
					x : parseInt(destCoords[0]),
					y : parseInt(destCoords[1])
				}
			};
			curGameData.room[id].exits.push(ext);
		}
		else if (getType(lines[i]) === "END") {
			/* ADD ENDING */
			var endId = getId( lines[i] );
			var endCoords = getCoord( lines[i], 2 );
			var end = {
				id : endId,
				x : parseInt( endCoords[0] ),
				y : parseInt( endCoords[1] )
			};
			curGameData.room[id].endings.push(end);
		}
		else if (getType(lines[i]) === "PAL") {
			/* CHOOSE PALETTE (that's not default) */
			curGameData.room[id].pal = getId(lines[i]);
		}
		i++;
	}
	return i;
}

function parsePalette(lines,i) { //todo this has to go first right now :(
	var id = getId(lines[i]);
	i++;
	var pal = [];
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		var col = [];
		lines[i].split(",").forEach(function(i) {
			col.push(parseInt(i));
		});
		pal.push(col);
		i++;
	}
	curGameData.palette[id] = pal;
	return i;
}

function parseTile(lines, i) {
	var id = getId(lines[i]);
	var drwId = null;

	i++;

	if (getType(lines[i]) === "DRW") { //load existing drawing
		drwId = getId(lines[i]);
		i++;
	}
	else {
		// store tile source
		drwId = "TIL_" + id;
		i = parseDrawingCore( lines, i, drwId );
	}

	//other properties
	var colorIndex = 1; //default palette color index is 1
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		if (getType(lines[i]) === "COL") {
			colorIndex = parseInt( getId(lines[i]) );
		}
		i++;
	}

	//tile data
	curGameData.tile[id] = {
		drw : drwId, //drawing id
		col : colorIndex,
		animation : {
			isAnimated : (imageStore.source[drwId].length > 1),
			frameIndex : 0,
			frameCount : imageStore.source[drwId].length
		}
	};
	return i;
}

function parseSprite(lines, i) {
	var id = getId(lines[i]);
	var drwId = null;

	i++;

	if (getType(lines[i]) === "DRW") { //load existing drawing
		drwId = getId(lines[i]);
		i++;
	}
	else {
		// store sprite source
		drwId = "SPR_" + id;
		i = parseDrawingCore( lines, i, drwId );
	}

	//other properties
	var colorIndex = 2; //default palette color index is 2
	while (i < lines.length && lines[i].length > 0) { //look for empty line
		if (getType(lines[i]) === "COL") {
			/* COLOR OFFSET INDEX */
			colorIndex = parseInt( getId(lines[i]) );
		}
		else if (getType(lines[i]) === "POS") {
			/* STARTING POSITION */
			var posArgs = lines[i].split(" ");
			var roomId = posArgs[1];
			var coordArgs = posArgs[2].split(",");
			spriteStartLocations[id] = {
				room : roomId,
				x : parseInt(coordArgs[0]),
				y : parseInt(coordArgs[1])
			};
		}
		i++;
	}

	//sprite data
	curGameData.sprite[id] = {
		drw : drwId, //drawing id
		col : colorIndex,
		room : null, //default location is "offstage"
		x : -1,
		y : -1,
		walkingPath : [], //tile by tile movement path (isn't saved)
		animation : {
			isAnimated : (imageStore.source[drwId].length > 1),
			frameIndex : 0,
			frameCount : imageStore.source[drwId].length
		}
	};
	return i;
}

function parseDrawing(lines, i) {
	// store drawing source
	var drwId = getId( lines[i] );
	return parseDrawingCore( lines, i, drwId );
}

function parseDrawingCore(lines, i, drwId) {
	curGameData.drawing[drwId] = []; //init list of frames
	curGameData.drawing[drwId].push( [] ); //init first frame
	var frameIndex = 0;
	var y = 0;
	while ( y < tilesize ) {
		var l = lines[i+y];
		var row = [];
		for (x = 0; x < tilesize; x++) {
			row.push( parseInt( l.charAt(x) ) );
		}
		curGameData.drawing[drwId][frameIndex].push( row );
		y++;

		if (y === tilesize) {
			i = i + y;
			if ( lines[i] != undefined && lines[i].charAt(0) === ">" ) {
				// start next frame!
				curGameData.drawing[drwId].push( [] );
				frameIndex++;
				//start the count over again for the next frame
				i++;
				y = 0;
			}
		}
	}

	//console.log(imageStore.source[drwId]);
	return i;
}

function parseDialog(lines, i) {
	var id = getId(lines[i]);
	i++;
	var text = lines[i];
	i++;
	curGameData.dialog[id] = text;
	return i;
}

function parseEnding(lines, i) {
	var id = getId(lines[i]);
	i++;
	var text = lines[i];
	i++;
	curGameData.ending[id] = text;
	return i;
}

function parseFlag(lines, i) {
	var id = getId(lines[i]);
	var valStr = lines[i].split(" ")[2];
	curGameData.flags[id] = parseInt( valStr );
	i++;
	return i;
}

function placeSprites() {
	for (id in spriteStartLocations) {
		//console.log(id);
		//console.log( spriteStartLocations[id] );
		//console.log(sprite[id]);
		curGameData.sprite[id].room = spriteStartLocations[id].room;
		curGameData.sprite[id].x = spriteStartLocations[id].x;
		curGameData.sprite[id].y = spriteStartLocations[id].y;
		//console.log(sprite[id]);
	}
}


/* serialization */
this.serialize = function(gameData) {
	curGameData = gameData;
	return serializeWorld(); //should I pass the game data as a parameter
}

//TODO this is in progress and doesn't support all features
function serializeWorld() {
	var worldStr = "";
	/* TITLE */
	worldStr += title + "\n";
	worldStr += "\n";
	/* VERSION */
	worldStr += "# BITSY VERSION " + getEngineVersion() + "\n"; // add version as a comment for debugging purposes
	worldStr += "\n";
	/* FLAGS */
	for (f in flags) {
		worldStr += "! " + f + " " + flags[f] + "\n";
	}
	worldStr += "\n"
	/* PALETTE */
	for (id in palette) {
		worldStr += "PAL " + id + "\n";
		for (i in palette[id]) {
			for (j in palette[id][i]) {
				worldStr += palette[id][i][j];
				if (j < 2) worldStr += ",";
			}
			worldStr += "\n";
		}
		worldStr += "\n";
	}
	/* ROOM */
	for (id in room) {
		worldStr += "ROOM " + id + "\n";
		if ( flags.ROOM_FORMAT == 0 ) {
			// old non-comma separated format
			for (i in room[id].tilemap) {
				for (j in room[id].tilemap[i]) {
					worldStr += room[id].tilemap[i][j];	
				}
				worldStr += "\n";
			}
		}
		else if ( flags.ROOM_FORMAT == 1 ) {
			// new comma separated format
			for (i in room[id].tilemap) {
				for (j in room[id].tilemap[i]) {
					worldStr += room[id].tilemap[i][j];
					if (j < room[id].tilemap[i].length-1) worldStr += ","
				}
				worldStr += "\n";
			}
		}
		if (room[id].walls.length > 0) {
			/* WALLS */
			worldStr += "WAL ";
			for (j in room[id].walls) {
				worldStr += room[id].walls[j];
				if (j < room[id].walls.length-1) {
					worldStr += ",";
				}
			}
			worldStr += "\n";
		}
		if (room[id].exits.length > 0) {
			/* EXITS */
			for (j in room[id].exits) {
				var e = room[id].exits[j];
				if ( isExitValid(e) ) {
					worldStr += "EXT " + e.x + "," + e.y + " " + e.dest.room + " " + e.dest.x + "," + e.dest.y;
					worldStr += "\n";
				}
			}
		}
		if (room[id].endings.length > 0) {
			/* ENDINGS */
			for (j in room[id].endings) {
				var e = room[id].endings[j];
				// todo isEndingValid
				worldStr += "END " + e.id + " " + e.x + "," + e.y;
				worldStr += "\n";
			}
		}
		if (room[id].pal != null) {
			/* PALETTE */
			worldStr += "PAL " + room[id].pal + "\n";
		}
		worldStr += "\n";
	}
	/* TILES */
	for (id in tile) {
		worldStr += "TIL " + id + "\n";
		worldStr += serializeDrawing( "TIL_" + id );
		worldStr += "\n";
	}
	/* SPRITES */
	for (id in sprite) {
		worldStr += "SPR " + id + "\n";
		worldStr += serializeDrawing( "SPR_" + id );
		if (sprite[id].room != null) {
			/* SPRITE POSITION */
			worldStr += "POS " + sprite[id].room + " " + sprite[id].x + "," + sprite[id].y + "\n";
		}
		worldStr += "\n";
	}
	/* DIALOG */
	for (id in dialog) {
		worldStr += "DLG " + id + "\n";
		worldStr += dialog[id] + "\n";
		worldStr += "\n";
	}
	/* ENDINGS */
	for (id in ending) {
		worldStr += "END " + id + "\n";
		worldStr += ending[id] + "\n";
		worldStr += "\n";
	}
	return worldStr;
}

function serializeDrawing(drwId) {
	var drwStr = "";
	for (f in imageStore.source[drwId]) {
		for (y in imageStore.source[drwId][f]) {
			var rowStr = "";
			for (x in imageStore.source[drwId][f][y]) {
				rowStr += imageStore.source[drwId][f][y][x];
			}
			drwStr += rowStr + "\n";
		}
		if (f < (imageStore.source[drwId].length-1)) drwStr += ">\n";
	}
	return drwStr;
}


} // Parser()