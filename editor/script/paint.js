/*
	PAINT
*/
function drawGrid(canvas, gridDivisions, lineColor) {
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = lineColor;

	var gridSize = canvas.width; // assumes width === height
	var gridSpacing = (gridSize / gridDivisions);

	// vertical lines
	for (var x = 1; x < gridDivisions; x++) {
		ctx.fillRect(x * gridSpacing, 0 * gridSpacing, 1, gridSize);
	}

	// horizontal lines
	for (var y = 1; y < gridDivisions; y++) {
		ctx.fillRect(0 * gridSpacing, y * gridSpacing, gridSize, 1);
	}
}

function PaintTool(canvas, menuElement) {
	// TODO : variables
	var self = this; // feels a bit hacky

	var paint_scale = 32;
	var curPaintBrush = 0;
	var isPainting = false;
	this.isCurDrawingAnimated = false; // TODO eventually this can be internal
	this.curDrawingFrameIndex = 0; // TODO eventually this can be internal
	this.drawPaintGrid = (getPanelSetting("paintPanel", "grid") != false);
	updatePaintGridCheck(this.drawPaintGrid);

	//paint canvas & context
	canvas.width = tilesize * paint_scale;
	canvas.height = tilesize * paint_scale;
	var ctx = canvas.getContext("2d");

	// paint events
	canvas.addEventListener("mousedown", onMouseDown);
	canvas.addEventListener("mousemove", onMouseMove);
	canvas.addEventListener("mouseup", onMouseUp);
	canvas.addEventListener("mouseleave", onMouseUp);
	canvas.addEventListener("touchstart", onTouchStart);
	canvas.addEventListener("touchmove", onTouchMove);
	canvas.addEventListener("touchend", onTouchEnd);

	function onMouseDown(e) {
		if (isPlayMode) {
			return; //can't paint during play mode
		}

		bitsyLog("PAINT TOOL!!!", "editor");
		bitsyLog(e, "editor");

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
		bitsyLog("?????", "editor");
		if (isPainting) {
			isPainting = false;

			updateDrawingData();
			refreshGameData();

			self.updateCanvas();

			if (self.isCurDrawingAnimated) {
				renderAnimationPreview(drawing);
			}

			events.Raise("paint_edit");
		}
	}

	function onTouchStart(e) {
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		onMouseDown(e);
	}

	function onTouchMove(e) {
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		onMouseMove(e);
	}

	function onTouchEnd(e) {
		e.preventDefault();
		onMouseUp();
	}

	this.updateCanvas = function() {
		// get palette of selected room
		var selectedRoomId = state.room;
		if (roomTool) {
			selectedRoomId = roomTool.getSelected();
		}
		if (room[selectedRoomId] === undefined) {
			selectedRoomId = "0";
		}

		var palId = room[selectedRoomId].pal;
		var palColors = getPal(palId);

		//background
		ctx.fillStyle = "rgb(" + palColors[0][0] + "," + palColors[0][1] + "," + palColors[0][2] + ")";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//pixel color
		if (drawing.type === TileType.Tile) {
			ctx.fillStyle = "rgb(" + palColors[1][0] + "," + palColors[1][1] + "," + palColors[1][2] + ")";
		}
		else if (drawing.type === TileType.Sprite || drawing.type === TileType.Avatar || drawing.type === TileType.Item) {
			ctx.fillStyle = "rgb(" + palColors[2][0] + "," + palColors[2][1] + "," + palColors[2][2] + ")";
		}

		//draw pixels
		for (var x = 0; x < tilesize; x++) {
			for (var y = 0; y < tilesize; y++) {
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

		// draw grid
		if (self.drawPaintGrid) {
			drawGrid(canvas, bitsy.TILE_SIZE, getContrastingColor());
		}
	}

	function curDrawingData() {
		var frameIndex = (self.isCurDrawingAnimated ? self.curDrawingFrameIndex : 0);
		return getDrawingFrameData(drawing, frameIndex);
	}

	// todo: assumes 2 frames
	function curDrawingAltFrameData() {
		var frameIndex = (self.curDrawingFrameIndex === 0 ? 1 : 0);
		return getDrawingFrameData(drawing, frameIndex);
	}

	// TODO : rename?
	function updateDrawingData() {
		// this forces a renderer cache refresh but it's kind of wonky
		renderer.SetDrawingSource(drawing.drw, getDrawingImageSource(drawing));
	}

	// todo: this is a *mess* - I really need to refactor it (someday)
	// methods for updating the UI
	this.onReloadTile = null;
	this.onReloadSprite = null;
	this.onReloadItem = null;
	this.reloadDrawing = function() {
		if (drawing.type === TileType.Tile) {
			if (self.onReloadTile) {
				self.onReloadTile();
			}
		}
		else if (drawing.type === TileType.Avatar || drawing.type === TileType.Sprite) {
			if (self.onReloadSprite) {
				self.onReloadSprite();
			}
		}
		else if (drawing.type === TileType.Item) {
			if (self.onReloadItem) {
				self.onReloadItem();
			}
		}

		// hack to force update of new menu
		self.menu.update();
	}

	this.selectDrawing = function(drawingData) {
		drawing = drawingData; // ok this global variable is weird imo
		self.reloadDrawing();
		self.updateCanvas();
	}

	this.toggleWall = function(checked) {
		if (drawing.type != TileType.Tile) {
			return;
		}

		if (drawing.isWall == undefined || drawing.isWall == null) {
			// clear out any existing wall settings for this tile in any rooms
			// (this is back compat for old-style wall settings)
			for (roomId in room) {
				var i = room[roomId].walls.indexOf(drawing.id);

				if (i > -1) {
					room[roomId].walls.splice(i, 1);
				}
			}
		}

		drawing.isWall = checked;

		refreshGameData();

		if (toggleWallUI != null && toggleWallUI != undefined) { // a bit hacky
			toggleWallUI(checked);
		}
	}

	this.getCurObject = function() {
		return drawing;
	}

	this.newDrawing = function(imageData) {
		if (drawing.type === TileType.Tile) {
			newTile(imageData);
		}
		else if (drawing.type === TileType.Avatar || drawing.type === TileType.Sprite) {
			newSprite(imageData);
		}
		else if (drawing.type === TileType.Item) {
			newItem(imageData);
		}
	}
	
	this.duplicateDrawing = function() {
		var sourceImageData = getDrawingImageSource(drawing);
		var copiedImageData = copyDrawingData(sourceImageData);

		// tiles have extra data to copy
		var tileIsWall = false;
		if (drawing.type === TileType.Tile) {
			tileIsWall = drawing.isWall;
		}

		this.newDrawing(copiedImageData);

		// tiles have extra data to copy
		if (drawing.type === TileType.Tile) {
			drawing.isWall = tileIsWall;
			// make sure the wall toggle gets updated
			self.reloadDrawing();
		}
	}

	// TODO -- sould these newDrawing methods be internal to PaintTool?
	function newTile(imageData) {
		var id = nextTileId();
		makeTile(id, imageData);

		drawing = tile[id];
		self.reloadDrawing(); //hack for ui consistency (hack x 2: order matters for animated tiles)

		self.updateCanvas();
		refreshGameData();

		tileIndex = Object.keys(tile).length - 1;
	}

	function newSprite(imageData) {
		var id = nextSpriteId();
		makeSprite(id, imageData);

		drawing = sprite[id];
		self.reloadDrawing(); //hack (order matters for animated tiles)

		self.updateCanvas();
		refreshGameData();

		spriteIndex = Object.keys(sprite).length - 1;
	}

	function newItem(imageData) {
		var id = nextItemId();
		makeItem(id, imageData);

		drawing = item[id];
		self.reloadDrawing(); //hack (order matters for animated tiles)

		self.updateCanvas();
		updateInventoryItemUI();
		refreshGameData();

		itemIndex = Object.keys(item).length - 1;
	}

	// TODO - may need to extract this for different tools beyond the paint tool (put it in core.js?)
	this.deleteDrawing = function() {
		var shouldDelete = true;
		shouldDelete = confirm("Are you sure you want to delete this drawing?");

		if (shouldDelete) {
			if (drawing.type === TileType.Tile) {
				if (Object.keys( tile ).length <= 1) {
					alert("You can't delete your last tile!"); // todo : localize
					return;
				}

				delete tile[drawing.id];

				findAndReplaceTileInAllRooms(drawing.id, "0");
				refreshGameData();

				nextTile();
			}
			else if (drawing.type === TileType.Avatar || drawing.type === TileType.Sprite) {
				if (Object.keys(sprite).length <= 2) {
					alert("You can't delete your last sprite!"); // todo : localize
					return;
				}

				// todo: share with items
				var dlgId = (drawing.dlg === null) ? drawing.id : drawing.dlg;

				delete sprite[drawing.id];

				deleteUnreferencedDialog(dlgId);
				refreshGameData();

				nextSprite();
			}
			else if (drawing.type === TileType.Item) {
				if (Object.keys(item).length <= 1) {
					alert("You can't delete your last item!"); // todo : localize
					return;
				}

				var dlgId = drawing.dlg;

				delete item[drawing.id];

				deleteUnreferencedDialog(dlgId);
				removeAllItems(drawing.id);
				refreshGameData();

				nextItem();
				updateInventoryItemUI();
			}
		}
	}

	events.Listen("palette_change", function(event) {
		self.updateCanvas();

		if (self.isCurDrawingAnimated) {
			// TODO -- this animation stuff needs to be moved in here I think?
			renderAnimationPreview(drawing);
		}
	});

	/* NEW MENU */
	this.menuElement = menuElement;

	this.menuUpdate = function() {
		if (drawing.type != TileType.Tile && drawing.type != TileType.Avatar) {
			self.menu.push({ control: "group" });
			self.menu.push({ control: "label", icon: "blip", description: "blip (sound effect)" });
			self.menu.push({
				control: "select",
				data: "BLIP",
				noneOption: "none",
				value: drawing.blip,
				onchange: function(e) {
					if (e.target.value === "null") { // always a string :(
						drawing.blip = null;
					}
					else {
						drawing.blip = e.target.value;
					}
					refreshGameData();
				}
			});
			self.menu.pop({ control: "group" });
		}
	};

	this.menu = new MenuInterface(this);
}

