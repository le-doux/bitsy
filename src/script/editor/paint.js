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
		console.log("DIALOG ID " + dialogId);
		return dialogId;
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
		if( Ed().platform == PlatformType.Desktop ) // hack
			if (isPlayMode) return; //can't paint during play mode

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
		if (isPainting) {
			isPainting = false;
			renderImages();
			refreshGameData();
			roomTool.drawEditMap(); // TODO : events instead of direct coupling

			if( Ed().platform == PlatformType.Desktop ) {
				renderPaintThumbnail( roomTool.drawing.id );
				if( self.isCurDrawingAnimated )
					renderAnimationPreview( roomTool.drawing.id );
			}
		}
	}

	function onTouchStart(e) {
		e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseDown(fakeEvent);
	}

	function onTouchMove(e) {
		e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseMove(fakeEvent);
	}

	function onTouchEnd(e) {
		e.preventDefault();
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
}

