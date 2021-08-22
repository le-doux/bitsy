/*
	ROOM
*/

function RoomTool(canvas) {
	var self = this; // feels a bit hacky

	// edit flags
	var isDragAddingTiles = false;
	var isDragDeletingTiles = false;

	// render flags
	this.drawCollisionMap = false;
	this.areMarkersVisible = false;
	this.drawMapGrid = (getPanelSetting("roomPanel", "grid") != false);
	updateRoomGridCheck(this.drawMapGrid);

	this.markers = null;

	var isDisabledExternally = false;
	events.Listen("disable_room_tool", function() {
		isDisabledExternally = true;
	});
	events.Listen("enable_room_tool", function() {
		isDisabledExternally = false;
	});

	function onMouseDown(e) {
		e.preventDefault();

		var isDisabledTemp = isDisabledExternally; // hack to exit early if disabled at START of mouse down

		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		var x = Math.floor( off.x / (tilesize*scale) );
		var y = Math.floor( off.y / (tilesize*scale) );
		// bitsyLog(x + " " + y, "editor");

		events.Raise("click_room", { roomId : curRoom, x : x, y : y });

		if (isDisabledTemp) {
			return;
		}

		if( self.editDrawingAtCoordinateCallback != null && e.altKey ) {
			self.editDrawingAtCoordinateCallback(x,y); // "eye dropper"
			return;
		}

		var isEditingMarker = false;

		if (self.areMarkersVisible) {
			if (self.markers.IsPlacingMarker()) {
				self.markers.PlaceMarker(x,y);
				self.drawEditMap();
				isEditingMarker = true;
			}
			else if (self.markers.TrySelectMarkerAtLocation(x,y)) {
				self.markers.StartDrag(x,y);
				self.drawEditMap();
				isEditingMarker = true;
			}
		}

		if (!isEditingMarker && drawing.id != null) {
			//add tiles/sprites to map
			if (drawing.type == TileType.Tile) {
				if ( room[curRoom].tilemap[y][x] === "0" ) {
					bitsyLog("ADD", "editor");
					//add
					//row = row.substr(0, x) + drawingId + row.substr(x+1);
					bitsyLog( room[curRoom].tilemap , "editor");
					room[curRoom].tilemap[y][x] = drawing.id;
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
			else if( drawing.type == TileType.Avatar || drawing.type == TileType.Sprite ) {
				var otherSprite = getSpriteAt(x,y);
				var isThisSpriteAlreadyHere = sprite[drawing.id].room === curRoom &&
											sprite[drawing.id].x === x &&
											sprite[drawing.id].y === y;

				if (otherSprite) {
					//remove other sprite from map
					sprite[otherSprite].room = null;
					sprite[otherSprite].x = -1;
					sprite[otherSprite].y = -1;
				}

				if (!isThisSpriteAlreadyHere) {
					//add sprite to map
					sprite[drawing.id].room = curRoom;
					sprite[drawing.id].x = x;
					sprite[drawing.id].y = y;
					//row = row.substr(0, x) + "0" + row.substr(x+1); //is this necessary? no
				}
				else {
					//remove sprite from map
					sprite[drawing.id].room = null;
					sprite[drawing.id].x = -1;
					sprite[drawing.id].y = -1;
				}
			}
			else if(drawing.type == TileType.Item ) {
				// TODO : is this the final behavior I want?

				var otherItem = getItem(curRoom,x,y);
				var isThisItemAlreadyHere = otherItem != null && otherItem.id === drawing.id;

				if(otherItem) {
					getRoom().items.splice( getRoom().items.indexOf(otherItem), 1 );
				}

				if(!isThisItemAlreadyHere) {
					getRoom().items.push( {id:drawing.id, x:x, y:y} );
				}
			}
			refreshGameData();
			self.drawEditMap();
		}
	}

	function onMouseMove(e) {
		if (isDisabledExternally) {
			return;
		}

		if( self.markers.GetSelectedMarker() != null && self.markers.IsDraggingMarker() ) {
			// drag marker around
			var off = getOffset(e);
			off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
			var x = Math.floor(off.x / (tilesize*scale));
			var y = Math.floor(off.y / (tilesize*scale));

			self.markers.ContinueDrag(x,y);
			self.drawEditMap();
		}
		else {
			editTilesOnDrag(e);
		}
	}

	function onMouseUp(e) {
		if (isDisabledExternally) {
			return;
		}

		editTilesOnDrag(e);
		isDragAddingTiles = false;
		isDragDeletingTiles = false;

		self.markers.EndDrag();
	}

	function editTilesOnDrag(e) {
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		var x = clamp(Math.floor(off.x / (tilesize*scale)), 0, mapsize - 1);
		var y = clamp(Math.floor(off.y / (tilesize*scale)), 0, mapsize - 1);
		// var row = room[curRoom].tilemap[y];
		if (isDragAddingTiles) {
			if ( room[curRoom].tilemap[y][x] != drawing.id ) {
				// row = row.substr(0, x) + drawingId + row.substr(x+1);
				// room[curRoom].tilemap[y] = row;
				room[curRoom].tilemap[y][x] = drawing.id;
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
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		onMouseDown( e );
	}

	function onTouchMove(e) {
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		onMouseMove( e );
	}

	function onTouchEnd(e) {
		e.preventDefault();
		// var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		// map_onMouseUp( fakeEvent );
		isDragAddingTiles = false;
		isDragDeletingTiles = false;
	}

	this.editDrawingAtCoordinateCallback = null;

	var mapEditAnimationLoop;

	this.listenEditEvents = function() {
		canvas.addEventListener("mousedown", onMouseDown);
		canvas.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("mouseup", onMouseUp);
		canvas.addEventListener("mouseleave", onMouseUp);
		canvas.addEventListener("touchstart", onTouchStart);
		canvas.addEventListener("touchmove", onTouchMove);
		canvas.addEventListener("touchend", onTouchEnd);

		mapEditAnimationLoop =
			setInterval( function() {
				if (!isPlayMode) {
					animationCounter = animationTime + 1; // hack
					updateAnimation();
					self.drawEditMap();
				}
				else {
					bitsyLog("BLINKY BUG :(", "editor");
					self.unlistenEditEvents(); // hacky attempt to prevent blinky bug (not sure what the real cause is)
				}
			}, animationTime ); // update animation in map mode
	}

	this.unlistenEditEvents = function() {
		canvas.removeEventListener("mousedown", onMouseDown);
		canvas.removeEventListener("mousemove", onMouseMove);
		canvas.removeEventListener("mouseup", onMouseUp);
		canvas.removeEventListener("mouseleave", onMouseUp);
		canvas.removeEventListener("touchstart", onTouchStart);
		canvas.removeEventListener("touchmove", onTouchMove);
		canvas.removeEventListener("touchend", onTouchEnd);

		clearInterval( mapEditAnimationLoop );
	}

	this.drawEditMap = function() {
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

		//draw exits (and entrances) and endings
		if (self.areMarkersVisible) {
			var w = tilesize * scale;
			var markerList = self.markers.GetMarkerList();

			for (var i = 0; i < markerList.length; i++) {
				var marker = markerList[i]; // todo name
				marker.Draw(ctx,curRoom,w,self.markers.GetSelectedMarker() == marker);
			}

			ctx.globalAlpha = 1;
		}
	}

	events.Listen("palette_change", function(event) {
		self.drawEditMap();
	});
} // RoomTool()

/* METHODS */
function togglePlayMode(e) {
	if (e.target.checked) {
		on_play_mode();
	}
	else {
		on_edit_mode();
	}

	updatePlayModeButton();
}
/* TODO 
- make a PlayModeController objec?
- share:
	- on_play_mode
	- on_edit_mode
*/