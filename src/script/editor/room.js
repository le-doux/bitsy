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

	var isDragAddingTiles = false;
	var isDragDeletingTiles = false;
	var isDragMovingExit = false;
	var isDragMovingEnding = false;

	function onMouseDown(e) {
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		var x = Math.floor( off.x / (tilesize*scale) );
		var y = Math.floor( off.y / (tilesize*scale) );
		// console.log(x + " " + y);

		if( Ed().platform == PlatformType.Desktop ) {
			var didSelectedExitChange = areExitsVisible ? setSelectedExit( getExit(curRoom,x,y) ) : false;
			var didSelectedEndingChange = areEndingsVisible ? setSelectedEnding( getEnding(curRoom,x,y) ) : false;	
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
			drawEditMap();
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
				drawEditMap();	
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
				drawEditMap();	
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

	function onTouchStart(e) {
		e.preventDefault();
		// console.log(e.touches[0]);
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		// console.log(fakeEvent);
		onMouseDown( fakeEvent );
	}

	function onTouchMove(e) {
		e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseMove( fakeEvent );
	}

	function onTouchEnd(e) {
		e.preventDefault();
		// var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		// map_onMouseUp( fakeEvent );
		isDragAddingTiles = false;
		isDragDeletingTiles = false;
	}

	var mapEditAnimationLoop;

	this.listenEditEvents = function() {
		if( Ed().platform == PlatformType.Desktop ) {
			canvas.addEventListener("mousedown", onMouseDown);
			canvas.addEventListener("mousemove", onMouseMove);
			canvas.addEventListener("mouseup", onMouseUp);
			canvas.addEventListener("mouseleave", onMouseUp);

			mapEditAnimationLoop =
				setInterval( function() {
					animationCounter = animationTime + 1; // hack
					updateAnimation();
					drawEditMap();
				}, animationTime ); // update animation in map mode
		}

		if( Ed().platform == PlatformType.Mobile ) {
			canvas.addEventListener("touchstart", onTouchStart);
			canvas.addEventListener("touchmove", onTouchMove);
			canvas.addEventListener("touchend", onTouchEnd);
		}
	}

	this.unlistenEditEvents = function() {
		if( Ed().platform == PlatformType.Desktop ) {
			canvas.removeEventListener("mousedown", onMouseDown);
			canvas.removeEventListener("mousemove", onMouseMove);
			canvas.removeEventListener("mouseup", onMouseUp);
			canvas.removeEventListener("mouseleave", onMouseUp);
			clearInterval( mapEditAnimationLoop );
		}

		if( Ed().platform == PlatformType.Mobile ) {
			canvas.removeEventListener("touchstart", onTouchStart);
			canvas.removeEventListener("touchmove", onTouchMove);
			canvas.removeEventListener("touchend", onTouchEnd);
		}
	}
}
