/*
	ROOM
*/

/*
TODO:
drawingId -> drawingId.id
paintMode -> drawingId.type

what other methods do I need to move into this class? exit stuff??
- exits
- endings
- items
- etc.
*/
function RoomTool(canvas) {
	var self = this; // feels a bit hacky

	this.drawing = new DrawingId( TileType.Avatar, "A" );

	// edit flags
	var isDragAddingTiles = false;
	var isDragDeletingTiles = false;
	var isDragMovingExit = false;
	var isDragMovingEnding = false;

	// render flags
	this.drawMapGrid = true;
	this.drawCollisionMap = false;
	this.areExitsVisible = false;
	this.areEndingsVisible = false;

	function onMouseDown(e) {
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		var x = Math.floor( off.x / (tilesize*scale) );
		var y = Math.floor( off.y / (tilesize*scale) );
		// console.log(x + " " + y);

		console.log(e);
		if( self.editDrawingAtCoordinateCallback != null && e.altKey ) {
			self.editDrawingAtCoordinateCallback(x,y); // "eye dropper"
			return;
		}

		if( Ed().platform == PlatformType.Desktop ) {
			var didSelectedExitChange = self.areExitsVisible ? setSelectedExit( getExit(curRoom,x,y) ) : false;
			var didSelectedEndingChange = self.areEndingsVisible ? setSelectedEnding( getEnding(curRoom,x,y) ) : false;	
		}

		if ( Ed().platform == PlatformType.Desktop && (didSelectedExitChange || didSelectedEndingChange) ) {
			//don't do anything else
			if( selectedExit != null ) isDragMovingExit = true;
			if( selectedEndingTile != null ) isDragMovingEnding = true;
		}
		else if ( Ed().platform == PlatformType.Desktop && isAddingExit) { //todo - mutually exclusive with adding an ending?
			//add exit
			if ( getEnding(curRoom,x,y) == null && getExit(curRoom,x,y) == null ) {
				addExitToCurRoom(x,y);
			}
		}
		else if ( Ed().platform == PlatformType.Desktop && isAddingEnding ) {
			//add ending
			if ( getEnding(curRoom,x,y) == null && getExit(curRoom,x,y) == null ) {
				addEndingToCurRoom(x,y);
			}
		}
		else if (self.drawing.id != null) {
			//add tiles/sprites to map
			console.log("DRAWING");
			if (self.drawing.type == TileType.Tile) {
				if ( room[curRoom].tilemap[y][x] === "0" ) {
					console.log("ADD");
					//add
					//row = row.substr(0, x) + drawingId + row.substr(x+1);
					console.log( room[curRoom].tilemap );
					room[curRoom].tilemap[y][x] = self.drawing.id;
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
			else if( self.drawing.type == TileType.Avatar || self.drawing.type == TileType.Sprite ) {
				var otherSprite = getSpriteAt(x,y);
				var isThisSpriteAlreadyHere = sprite[self.drawing.id].room === curRoom &&
											sprite[self.drawing.id].x === x &&
											sprite[self.drawing.id].y === y;

				if (otherSprite) {
					//remove other sprite from map
					sprite[otherSprite].room = null;
					sprite[otherSprite].x = -1;
					sprite[otherSprite].y = -1;
				}

				if (!isThisSpriteAlreadyHere) {
					//add sprite to map
					sprite[self.drawing.id].room = curRoom;
					sprite[self.drawing.id].x = x;
					sprite[self.drawing.id].y = y;
					//row = row.substr(0, x) + "0" + row.substr(x+1); //is this necessary? no
				}
				else {
					//remove sprite from map
					sprite[self.drawing.id].room = null;
					sprite[self.drawing.id].x = -1;
					sprite[self.drawing.id].y = -1;
				}
			}
			else if( Ed().platform == PlatformType.Desktop && self.drawing.type == TileType.Item ) {
				// TODO : is this the final behavior I want?

				var otherItem = getItem(curRoom,x,y);
				var isThisItemAlreadyHere = otherItem != null && otherItem.id === self.drawing.id;

				if(otherItem) {
					getRoom().items.splice( getRoom().items.indexOf(otherItem), 1 );
				}

				if(!isThisItemAlreadyHere) {
					getRoom().items.push( {id:self.drawing.id, x:x, y:y} );
				}
			}
			refreshGameData();
			self.drawEditMap();
		}
	}

	function onMouseMove(e) {
		if( Ed().platform == PlatformType.Desktop && selectedExit != null && isDragMovingExit )
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
				self.drawEditMap();
			}
		}
		else if( Ed().platform == PlatformType.Desktop && selectedEndingTile != null && isDragMovingEnding )
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
				self.drawEditMap();
			}
		}
		else
			editTilesOnDrag(e);
	}

	function onMouseUp(e) {
		editTilesOnDrag(e);
		isDragAddingTiles = false;
		isDragDeletingTiles = false;
		isDragMovingExit = false;
		isDragMovingEnding = false;
	}

	function editTilesOnDrag(e) {
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		var x = Math.floor(off.x / (tilesize*scale));
		var y = Math.floor(off.y / (tilesize*scale));
		// var row = room[curRoom].tilemap[y];
		if (isDragAddingTiles) {
			if ( room[curRoom].tilemap[y][x] != self.drawing.id ) {
				// row = row.substr(0, x) + drawingId + row.substr(x+1);
				// room[curRoom].tilemap[y] = row;
				room[curRoom].tilemap[y][x] = self.drawing.id;
				refreshGameData();
				self.drawEditMap();
			}
		}
		else if (isDragDeletingTiles) {
			if ( room[curRoom].tilemap[y][x] != "0" ) {
				// row = row.substr(0, x) + "0" + row.substr(x+1);
				// room[curRoom].tilemap[y] = row;
				room[curRoom].tilemap[y][x] = "0";
				refreshGameData();
				self.drawEditMap();
			}
		}
	}

	function onTouchStart(e) {
		// e.preventDefault();
		// console.log(e.touches[0]);
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		// console.log(fakeEvent);
		onMouseDown( fakeEvent );
	}

	function onTouchMove(e) {
		// e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseMove( fakeEvent );
	}

	function onTouchEnd(e) {
		// e.preventDefault();
		// var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		// map_onMouseUp( fakeEvent );
		isDragAddingTiles = false;
		isDragDeletingTiles = false;
	}

	this.editDrawingAtCoordinateCallback = null;

	var mapEditAnimationLoop;

	this.listenEditEvents = function() {
		if( Ed().platform == PlatformType.Desktop ) {
			canvas.addEventListener("mousedown", onMouseDown);
			canvas.addEventListener("mousemove", onMouseMove);
			canvas.addEventListener("mouseup", onMouseUp);
			canvas.addEventListener("mouseleave", onMouseUp);
		}

		if( Ed().platform == PlatformType.Mobile ) {
			canvas.addEventListener("touchstart", onTouchStart);
			canvas.addEventListener("touchmove", onTouchMove);
			canvas.addEventListener("touchend", onTouchEnd);
		}

		mapEditAnimationLoop =
			setInterval( function() {
				if (!isPlayMode) {
					animationCounter = animationTime + 1; // hack
					updateAnimation();
					self.drawEditMap();
				}
				else {
					console.log("BLINKY BUG :(");
					self.unlistenEditEvents(); // hacky attempt to prevent blinky bug (not sure what the real cause is)
				}
			}, animationTime ); // update animation in map mode
	}

	this.unlistenEditEvents = function() {
		if( Ed().platform == PlatformType.Desktop ) {
			canvas.removeEventListener("mousedown", onMouseDown);
			canvas.removeEventListener("mousemove", onMouseMove);
			canvas.removeEventListener("mouseup", onMouseUp);
			canvas.removeEventListener("mouseleave", onMouseUp);
		}

		if( Ed().platform == PlatformType.Mobile ) {
			canvas.removeEventListener("touchstart", onTouchStart);
			canvas.removeEventListener("touchmove", onTouchMove);
			canvas.removeEventListener("touchend", onTouchEnd);
		}

		clearInterval( mapEditAnimationLoop );
	}

	this.drawEditMap = function() {
		//clear screen
		ctx.fillStyle = "rgb("+getPal(curPal())[0][0]+","+getPal(curPal())[0][1]+","+getPal(curPal())[0][2]+")";
		ctx.fillRect(0,0,canvas.width,canvas.height);

		//draw map
		drawRoom( room[curRoom] );

		//draw grid
		if (self.drawMapGrid) {
			ctx.fillStyle = getContrastingColor();
			for (var x = 1; x < mapsize; x++) {
				ctx.fillRect(x*tilesize*scale,0*tilesize*scale,1,mapsize*tilesize*scale);
			}
			for (var y = 1; y < mapsize; y++) {
				ctx.fillRect(0*tilesize*scale,y*tilesize*scale,mapsize*tilesize*scale,1);
			}
		}

		//draw walls
		if (self.drawCollisionMap) {
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
		if (self.areExitsVisible) {
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
		if (self.areEndingsVisible) {
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
}

/* METHODS */
function togglePlayMode(e) {
	if (e.target.checked) {
		on_play_mode();
	}
	else {
		on_edit_mode();
	}
	if( Ed().platform == PlatformType.Desktop ) // hack for mobile
		updatePlayModeButton();
}
/* TODO 
- make a PlayModeController objec?
- share:
	- on_play_mode
	- on_edit_mode
*/