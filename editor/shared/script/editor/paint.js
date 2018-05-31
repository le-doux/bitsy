/*
	PAINT
*/

function DrawingId(type,id) { // TODO: is this the right name?
	var self = this;

	this.type = type;
	this.id = id;

	this.getFrameData = function(frameIndex) {
		return imageStore.source[ self.toString() ][ frameIndex ];
	}

	this.toString = function() {
		return tileTypeToIdPrefix(self.type) + self.id;
	}

	this.getDialogId = function() {
		var dialogId = null;
		if(self.type == TileType.Sprite) {
			dialogId = sprite[self.id].dlg;
			if(dialogId == null && dialog[self.id] != null) {
				dialogId = self.id;
			}
		}
		else if(self.type == TileType.Item) {
			dialogId = item[self.id].dlg;
		}
		return dialogId;
	}

	this.getEngineObject = function() {
		if(self.type == TileType.Sprite || self.type == TileType.Avatar) {
			return sprite[self.id];
		}
		else if(self.type == TileType.Item) {
			return item[self.id];
		}
		else if(self.type == TileType.Tile) {
			return tile[self.id];
		}
		return null;
	}

	// TODO : these methods should really be moved DOWN an abstraction level into a core DRAWING object in bitsy.js
	this.getImage = function(palId,frameIndex) {
		if(self.type == TileType.Sprite || self.type == TileType.Avatar) {
			return getSpriteImage(sprite[self.id],palId,frameIndex);
		}
		else if(self.type == TileType.Item) {
			return getItemImage(item[self.id],palId,frameIndex);
		}
		else if(self.type == TileType.Tile) {
			return getTileImage(tile[self.id],palId,frameIndex);
		}
		return null;
	}

	this.draw = function(context,x,y,palId,frameIndex) {
		if(self.type == TileType.Sprite || self.type == TileType.Avatar) {
			return drawSprite(self.getImage(palId,frameIndex),x,y,context);
		}
		else if(self.type == TileType.Item) {
			return drawItem(self.getImage(palId,frameIndex),x,y,context);
		}
		else if(self.type == TileType.Tile) {
			return drawTile(self.getImage(palId,frameIndex),x,y,context);
		}
	}

	this.isWallTile = function() {
		if(self.type != TileType.Tile)
			return false;

		// TODO
	}
}

// TODO
function PaintTool(canvas, roomTool) {
	// TODO : variables
	var self = this; // feels a bit hacky

	var paint_scale = 32;
	var curPaintBrush = 0;
	var isPainting = false;
	this.isCurDrawingAnimated = false; // TODO eventually this can be internal
	this.curDrawingFrameIndex = 0; // TODO eventually this can be internal
	this.drawPaintGrid = true;

	this.drawing = new DrawingId( TileType.Avatar, "A" );

	this.explorer = null; // TODO: hacky way to tie this to a paint explorer -- should use events instead

	//paint canvas & context
	canvas.width = tilesize * paint_scale;
	canvas.height = tilesize * paint_scale;
	var ctx = canvas.getContext("2d");
	//paint events
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

	// TODO : 
	function onMouseDown(e) {
		// if( Ed().platform == PlatformType.Desktop ) // hack
			if (isPlayMode) return; //can't paint during play mode

		console.log("PAINT TOOL!!!");
		console.log(e);

		var off = getOffset(e);

		off = mobileOffsetCorrection(off,e,(tilesize));

		var x = Math.floor(off.x);
		var y = Math.floor(off.y);

		// non-responsive version
		// var x = Math.floor(off.x / paint_scale);
		// var y = Math.floor(off.y / paint_scale);

		if (curDrawingData()[y][x] == 0) {
			curPaintBrush = 1;
		}
		else {
			curPaintBrush = 0;
		}
		curDrawingData()[y][x] = curPaintBrush;
		self.updateCanvas();
		isPainting = true;
	}

	function onMouseMove(e) {
		if (isPainting) {
			var off = getOffset(e);

			off = mobileOffsetCorrection(off,e,(tilesize));

			var x = Math.floor(off.x);// / paint_scale);
			var y = Math.floor(off.y);// / paint_scale);
			curDrawingData()[y][x] = curPaintBrush;
			self.updateCanvas();
		}
	}

	function onMouseUp(e) {
		console.log("?????");
		if (isPainting) {
			isPainting = false;
			renderImages();
			refreshGameData();
			roomTool.drawEditMap(); // TODO : events instead of direct coupling

			// if( Ed().platform == PlatformType.Desktop ) {
				if(self.explorer != null) {
					self.explorer.RenderThumbnail( self.drawing.id )
				}
				if( self.isCurDrawingAnimated )
					renderAnimationPreview( roomTool.drawing.id );
			// }
		}
	}

	function onTouchStart(e) {
		// e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseDown(fakeEvent);
	}

	function onTouchMove(e) {
		// e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseMove(fakeEvent);
	}

	function onTouchEnd(e) {
		// e.preventDefault();
		onMouseUp();
	}

	this.updateCanvas = function() {
		//background
		ctx.fillStyle = "rgb("+getPal(curPal())[0][0]+","+getPal(curPal())[0][1]+","+getPal(curPal())[0][2]+")";
		ctx.fillRect(0,0,canvas.width,canvas.height);

		//pixel color
		if (self.drawing.type == TileType.Tile) {
			ctx.fillStyle = "rgb("+getPal(curPal())[1][0]+","+getPal(curPal())[1][1]+","+getPal(curPal())[1][2]+")";
		}
		else if (self.drawing.type == TileType.Sprite || self.drawing.type == TileType.Avatar || self.drawing.type == TileType.Item) {
			ctx.fillStyle = "rgb("+getPal(curPal())[2][0]+","+getPal(curPal())[2][1]+","+getPal(curPal())[2][2]+")";
		}

		//draw pixels
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {
				// draw alternate frame
				if (self.isCurDrawingAnimated && curDrawingAltFrameData()[y][x] === 1) {
					ctx.globalAlpha = 0.3;
					ctx.fillRect(x*paint_scale,y*paint_scale,1*paint_scale,1*paint_scale);
					ctx.globalAlpha = 1;
				}
				// draw current frame
				if (curDrawingData()[y][x] === 1) {
					ctx.fillRect(x*paint_scale,y*paint_scale,1*paint_scale,1*paint_scale);
				}
			}
		}

		//draw grid
		if (self.drawPaintGrid) {
			ctx.fillStyle = getContrastingColor();

			for (var x = 1; x < tilesize; x++) {
				ctx.fillRect(x*paint_scale,0*paint_scale,1,tilesize*paint_scale);
			}
			for (var y = 1; y < tilesize; y++) {
				ctx.fillRect(0*paint_scale,y*paint_scale,tilesize*paint_scale,1);
			}
		}
	}

	function curDrawingData() {
		var frameIndex = (self.isCurDrawingAnimated ? self.curDrawingFrameIndex : 0);
		return self.drawing.getFrameData(frameIndex);
	}

	// todo: assumes 2 frames
	function curDrawingAltFrameData() {
		var frameIndex = (self.curDrawingFrameIndex === 0 ? 1 : 0);
		return self.drawing.getFrameData(frameIndex);
	}

	// methods for updating the UI
	this.onReloadTile = null;
	this.onReloadSprite = null;
	this.onReloadItem = null;
	this.reloadDrawing = function() {
		if ( self.drawing.type === TileType.Tile) {
			if(self.onReloadTile)
				self.onReloadTile();
		}
		else if( self.drawing.type === TileType.Avatar || self.drawing.type === TileType.Sprite ) {
			if(self.onReloadSprite)
				self.onReloadSprite();
		}
		else if( self.drawing.type === TileType.Item ) {
			if(self.onReloadItem)
				self.onReloadItem();
		}
	}

	this.selectDrawing = function(drawingId) {
		self.drawing.id = drawingId.id; // have to do this hack because I'm relying on aliasing (not good!)
		self.drawing.type = drawingId.type;
		self.reloadDrawing();
		self.updateCanvas();
	}

	this.toggleWall = function(checked) {
		if( self.drawing.type != TileType.Tile )
			return;

		if( tile[ self.drawing.id ].isWall == undefined || tile[ self.drawing.id ].isWall == null ) {
			// clear out any existing wall settings for this tile in any rooms
			// (this is back compat for old-style wall settings)
			for( roomId in room ) {
				var i = room[ roomId ].walls.indexOf( self.drawing.id );
				if( i > -1 )
					room[ roomId ].walls.splice( i , 1 );
			}
		}

		tile[ self.drawing.id ].isWall = checked;

		refreshGameData();

		if(toggleWallUI != null && toggleWallUI != undefined) // a bit hacky
			toggleWallUI(checked);
	}

	this.getCurObject = function() {
		return self.drawing.getEngineObject();
	}

	this.newDrawing = function() {
		if ( self.drawing.type == TileType.Tile ) {
			newTile();
		}
		else if( self.drawing.type == TileType.Avatar || self.drawing.type == TileType.Sprite ) {
			newSprite();
		}
		else if( self.drawing.type == TileType.Item ) {
			newItem();
		}

		// update paint explorer - only on desktop (TODO: should be separate object with events)
		// if( Ed().platform == PlatformType.Desktop && self.explorer != null ) {
			self.explorer.AddThumbnail( self.drawing.id );
			self.explorer.ChangeSelection( self.drawing.id );
			document.getElementById("paintExplorerFilterInput").value = ""; // super hacky
			self.explorer.Refresh( self.drawing.type, true /*doKeepOldThumbnails*/, document.getElementById("paintExplorerFilterInput").value /*filterString*/, true /*skipRenderStep*/ ); // this is a bit hacky feeling
		// }
	}

	// TODO -- sould these newDrawing methods be internal to PaintTool?
	function newTile(id) {
		if (id)
			self.drawing.id = id; //this optional parameter lets me override the default next id
		else
			self.drawing.id = nextTileId();

		makeTile(self.drawing.id);
		self.reloadDrawing(); //hack for ui consistency (hack x 2: order matters for animated tiles)

		self.updateCanvas();
		refreshGameData();

		tileIndex = Object.keys(tile).length - 1;
	}

	function newSprite(id) {
		if (id)
			self.drawing.id = id; //this optional parameter lets me override the default next id
		else
			self.drawing.id = nextSpriteId();

		makeSprite(self.drawing.id);
		self.reloadDrawing(); //hack (order matters for animated tiles)

		self.updateCanvas();
		refreshGameData();

		spriteIndex = Object.keys(sprite).length - 1;
	}

	function newItem(id) {
		if (id)
			self.drawing.id = id; //this optional parameter lets me override the default next id
		else
			self.drawing.id = nextItemId();

		makeItem(self.drawing.id);
		self.reloadDrawing(); //hack (order matters for animated tiles)

		self.updateCanvas();
		updateInventoryItemUI();
		refreshGameData();

		itemIndex = Object.keys(item).length - 1;
	}

	// TODO - may need to extract this for different tools beyond the paint tool (put it in core.js?)
	this.deleteDrawing = function() {
		var shouldDelete = true;
		if ( Ed().platform == PlatformType.Desktop )
			shouldDelete = confirm("Are you sure you want to delete this drawing?");

		if ( shouldDelete ) {
			console.log("PAINT TOOLLLL");
			// if ( Ed().platform == PlatformType.Desktop && self.explorer != null ) {
				console.log("PAINT TOOL DELETE THUMB");
				self.explorer.DeleteThumbnail( self.drawing.id );
			// }

			if (self.drawing.type == TileType.Tile) {
				if ( Object.keys( tile ).length <= 1 ) { alert("You can't delete your last tile!"); return; }
				delete tile[ self.drawing.id ];
				findAndReplaceTileInAllRooms( self.drawing.id, "0" );
				refreshGameData();
				renderImages();
				roomTool.drawEditMap();
				nextTile();
			}
			else if( self.drawing.type == TileType.Avatar || self.drawing.type == TileType.Sprite ){
				if ( Object.keys( sprite ).length <= 2 ) { alert("You can't delete your last sprite!"); return; }

				// todo: share with items
				var dlgId = sprite[ self.drawing.id ].dlg == null ? self.drawing.id : sprite[ self.drawing.id ].dlg;
				if( dlgId && dialog[ dlgId ] )
					delete dialog[ dlgId ];

				delete sprite[ self.drawing.id ];

				refreshGameData();
				renderImages();
				roomTool.drawEditMap();
				nextSprite();
			}
			else if( self.drawing.type == TileType.Item ){
				if ( Object.keys( item ).length <= 1 ) { alert("You can't delete your last item!"); return; }

				var dlgId = item[ self.drawing.id ].dlg;
				if( dlgId && dialog[ dlgId ] )
					delete dialog[ dlgId ];

				delete item[ self.drawing.id ];

				removeAllItems( self.drawing.id );
				refreshGameData();
				renderImages();
				roomTool.drawEditMap();
				nextItem();
				updateInventoryItemUI();
			}
			// if(Ed().platform == PlatformType.Desktop && self.explorer != null) {
				self.explorer.ChangeSelection( self.drawing.id );
			// }
		}
	}
}

