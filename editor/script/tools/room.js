function makeRoomTool() {
	return makeToolCard("room", function(tool) {
		tool.id = "room";

		// todo : how do I feel about these being functions? should I rename the property?
		tool.name = function() {
			return localization.GetStringOrFallback("room_tool_name", "room");
		};

		tool.icon = "room";
		tool.size = "l";
		tool.data = "ROOM";
		tool.worldData = "room.bitsy";
		tool.insertBefore = "exitsCheck";
		tool.aboutPage = "./tools/room";

		var selectedId = "0";

		/* MENU */
		var RoomMenu = {
			EDIT: 0,
			COLORS: 1,
			AVATAR: 2,
			TUNE: 3
		};
		var curMenu = RoomMenu.EDIT;

		/* EDIT TOOL */
		var RoomEditTool = {
			PAINT: 0,
			PICK: 1,
			EXITS: 2
		};
		var curEditTool = RoomEditTool.PAINT;
		var curPaintTile = "0";
		var pickX = -1;
		var pickY = -1;
		var didChangeRoom = false;
		var onNextClickHandler = null;

		/* RENDERING */
		var forceRedraw = false;
		var didRedrawRoom = false;
		// create an extra tilemap layer for overlay tiles
		var overlay = tool.system._addTileMapLayer();

		/* STATE */
		var prevIsMouseDown = false;
		var prevIsPlayMode = false;
		var prevIsGridVisible = false;
		var prevAreWallsVisible = false;
		var prevAreExitsVisible = false;

		/* VISIBILITY SETTINGS */
		// TODO : ultimately I want to combine all tool settings (panel settings, export settings, language setting) into one settings object
		var isGridVisible = (getPanelSetting("roomPanel", "grid") != false);
		var areWallsVisible = (getPanelSetting("roomPanel", "walls") == true);
		var areExitsVisible = false;

		function animate(tileName) {
			var tileId = tool.world.names.tile[tileName];
			var tile = tool.world.tile[tileId];
			if (tile.animation.isAnimated) {
				tile.animation.frameIndex = (tile.animation.frameIndex + 1) % tile.animation.frameCount;
			}
			// bitsy.log("animate " + tileName + " " + tile.animation.frameIndex)
		}

		function draw(tileName, x, y, map) {
			if (x < 0 || x >= bitsy.MAP_SIZE || y < 0 || y >= bitsy.MAP_SIZE) {
				return;
			}

			map = (map != undefined) ? map : bitsy.MAP1;
			var tileId = tool.world.names.tile[tileName];
			var tile = tool.world.tile[tileId];

			// hack to draw tile in constrasting color
			if (isColorDark(room[selectedId].pal)) {
				// draw tile using text color (white)
				tile.col = (textColorIndex - tileColorStartIndex);
			}
			else {
				// draw tile using text *background* color (black)
				tile.col = (textBackgroundIndex - tileColorStartIndex);
			}

			var frame = tool.renderer.GetDrawingFrame(tile, tile.animation.isAnimated ? tile.animation.frameIndex : 0);
			setTile(map, x, y, frame);
		}

		function drawExitTile(tileName, x, y, map, isSelected) {
			map = (map != undefined) ? map : bitsy.MAP1;
			var tileId = tool.world.names.tile[tileName];
			var tile = tool.world.tile[tileId];

			// if the palette background is dark, the exit tile should be light to contrast
			var isTileLight = isColorDark(room[selectedId].pal);

			// reverse the color to indicate its selected
			if (isSelected) {
				isTileLight = !isTileLight;
			}

			if (isTileLight) {
				tile.col = (textBackgroundIndex - tileColorStartIndex);
				tile.bgc = (textColorIndex - tileColorStartIndex);
			}
			else {
				tile.col = (textColorIndex - tileColorStartIndex);
				tile.bgc = (textBackgroundIndex - tileColorStartIndex);
			}

			var frame = tool.renderer.GetDrawingFrame(tile, tile.animation.isAnimated ? tile.animation.frameIndex : 0);
			setTile(map, x, y, frame);
		}

		function drawExitMarker(marker, isSelected) {
			if (marker.type === MarkerType.Exit) {
				var isTwoWay = (marker.linkState === LinkState.TwoWay);
				var posStart = marker.GetMarkerPos(0);
				if (posStart && posStart.room === selectedId) {
					drawExitTile(isTwoWay ? "exit_two_way" : "exit", posStart.x, posStart.y, overlay, isSelected);
					if (isSelected && !markerTool.IsDraggingMarker()) {
						draw("select_U", posStart.x + 0, posStart.y - 1, overlay);
						draw("select_D", posStart.x + 0, posStart.y + 1, overlay);
						draw("select_L", posStart.x - 1, posStart.y + 0, overlay);
						draw("select_R", posStart.x + 1, posStart.y + 0, overlay);
					}
				}
				var posEnd = marker.GetMarkerPos(1);
				if (posEnd && posEnd.room === selectedId) {
					drawExitTile(isTwoWay ? "exit_two_way" : "exit_dest", posEnd.x, posEnd.y, overlay, isSelected);
					if (isSelected && !markerTool.IsDraggingMarker()) {
						draw("select2_U", posEnd.x + 0, posEnd.y - 1, overlay);
						draw("select2_D", posEnd.x + 0, posEnd.y + 1, overlay);
						draw("select2_L", posEnd.x - 1, posEnd.y + 0, overlay);
						draw("select2_R", posEnd.x + 1, posEnd.y + 0, overlay);
					}
				}
			}
			else if (marker.type === MarkerType.Ending) {
				var pos = marker.GetMarkerPos(0);
				if (pos.room === selectedId) {
					drawExitTile("ending", pos.x, pos.y, overlay, isSelected);
					if (isSelected && !markerTool.IsDraggingMarker()) {
						draw("select_U", pos.x + 0, pos.y - 1, overlay);
						draw("select_D", pos.x + 0, pos.y + 1, overlay);
						draw("select_L", pos.x - 1, pos.y + 0, overlay);
						draw("select_R", pos.x + 1, pos.y + 0, overlay);
					}
				}
			}
		}

		function copyExit(exit) {
			return {
				x: exit.x,
				y: exit.y,
				dest: {
					room: exit.dest.room,
					x: exit.dest.x,
					y: exit.dest.y
				},
				transition_effect: exit.transition_effect,
				dlg: exit.dlg
			};
		}

		function copyItem(item) {
			return {
				id: item.id,
				x: item.x,
				y: item.y
			};
		}

		function getAtCoord(roomId, x, y) {
			var spriteId = getSpriteAt(x, y, roomId);
			if (spriteId) {
				return sprite[spriteId];
			}

			var itemInstance = getItem(roomId, x, y);
			if (itemInstance) {
				return item[itemInstance.id];
			}

			if (room[roomId] && room[roomId].tilemap[y] && room[roomId].tilemap[y][x]) {
				var tileId = room[roomId].tilemap[y][x];
				if (tileId != "0") {
					return tile[tileId];
				}
			}

			return null;
		}

		function pick(drawing) {
			if (drawing.type === TileType.Avatar) {
				on_paint_avatar_ui_update();
			}
			else if (drawing.type === TileType.Sprite) {
				on_paint_sprite_ui_update();
			}
			else if (drawing.type === TileType.Item) {
				on_paint_item_ui_update();
			}
			else if (drawing.type === TileType.Tile) {
				on_paint_tile_ui_update();
			}

			paintTool.selectDrawing(drawing);
			showPanel("paintPanel", "roomPanel");
		}

		function paintAt(drawing, x, y) {
			var didPaint = false;
			var selectedRoom = room[selectedId];

			if (drawing.type === TileType.Tile) {
				if (!prevIsMouseDown) {
					if (selectedRoom.tilemap[y][x] === "0") {
						// paint with selected tile
						curPaintTile = drawing.id;
					}
					else {
						// erase tiles
						curPaintTile = "0";
					}
				}

				selectedRoom.tilemap[y][x] = curPaintTile;
				didPaint = true;
			}
			else if (drawing.type === TileType.Avatar || drawing.type === TileType.Sprite) {
				if (!prevIsMouseDown) {
					var spriteAtCoord = getSpriteAt(x, y, selectedId);
					var isSelectedSpriteAtCoord =
						(sprite[drawing.id].room === selectedId) &&
						(sprite[drawing.id].x === x) &&
						(sprite[drawing.id].y === y);

					// if there's a sprite already here, erase it
					if (spriteAtCoord) {
						sprite[spriteAtCoord].room = null;
						sprite[spriteAtCoord].x = -1;
						sprite[spriteAtCoord].y = -1;
						didPaint = true;
					}

					if (!isSelectedSpriteAtCoord) {
						// put selected sprite in room
						sprite[drawing.id].room = selectedId;
						sprite[drawing.id].x = x;
						sprite[drawing.id].y = y;
						didPaint = true;
					}
					else {
						// *erase* selected sprite from room
						sprite[drawing.id].room = null;
						sprite[drawing.id].x = -1;
						sprite[drawing.id].y = -1;
						didPaint = true;
					}
				}
			}
			else if (drawing.type === TileType.Item) {
				if (!prevIsMouseDown) {
					var itemAtCoord = getItem(selectedId, x, y);
					var isSelectedItemAtCoord = (itemAtCoord != null) && (itemAtCoord.id === drawing.id);

					// if there's an item already here, erase it
					if (itemAtCoord) {
						selectedRoom.items.splice(selectedRoom.items.indexOf(itemAtCoord), 1);
						didPaint = true;
					}

					// if the *selected* item wasn't already here, place it
					if (!isSelectedItemAtCoord) {
						selectedRoom.items.push({ id: drawing.id, x: x, y: y });
						didPaint = true;
					}
				}
			}

			return didPaint;
		}

		tool.onNextClick = function(handler) {
			onNextClickHandler = handler;
		};

		tool.cancelOnNextClick = function() {
			onNextClickHandler = null;
		};

		tool.loop = function(dt) {
			if (isPlayMode) {
				return;
			}

			didRedrawRoom = false;
			var shouldRedraw = forceRedraw;

			var mousePos = tool.mouse.pos();
			var tilePos = {
				x: Math.floor(mousePos.x / bitsy.TILE_SIZE),
				y: Math.floor(mousePos.y / bitsy.TILE_SIZE),
			};
			var drawingAtCoord = getAtCoord(selectedId, tilePos.x, tilePos.y);

			// update tooltip
			var tooltipMessage = "";
			if (drawingAtCoord != null) {
				if (drawingAtCoord.name != null) {
					tooltipMessage += drawingAtCoord.name;
				}
				else if (drawingAtCoord.type === TileType.Avatar) {
					// todo : localize
					tooltipMessage += "avatar";
				}
				else {
					// todo : localize
					tooltipMessage += drawingAtCoord.type + " " + drawingAtCoord.id;
				}
				tooltipMessage +=  " ";
			}
			tooltipMessage += "(" + tilePos.x + ", " + tilePos.y + ")";
			tool.mouse.tooltip(tooltipMessage);

			if (!tool.mouse.down()) {
				// released mouse - save if necessary!
				if (prevIsMouseDown && didChangeRoom) {
					refreshGameData();
				}
				didChangeRoom = false;
			}

			var editTool = curEditTool;
			// swap paint & pick tools when alt is held
			if (tool.mouse.alt()) {
				if (curEditTool === RoomEditTool.PAINT) {
					editTool = RoomEditTool.PICK;
				}
				else if (curEditTool === RoomEditTool.PICK) {
					editTool = RoomEditTool.PAINT;
				}
			}

			if (onNextClickHandler != null) {
				// allows any tool to listen for a room click
				if (tool.mouse.down() && !prevIsMouseDown) {
					onNextClickHandler(selectedId, tilePos.x, tilePos.y);
					onNextClickHandler = null;
				}
			}
			else if (markerTool && markerTool.IsPlacingMarker()) {
				if (tool.mouse.down() && !prevIsMouseDown) {
					markerTool.PlaceMarker(tilePos.x, tilePos.y);
					shouldRedraw = true;
				}
			}
			else if (editTool === RoomEditTool.PAINT) {
				if (paintTool) {
					var selectedDrawing = paintTool.getCurObject();
					if (tool.mouse.down() && selectedDrawing != null) {
						if (paintAt(selectedDrawing, tilePos.x, tilePos.y)) {
							// redraw room
							shouldRedraw = true;
							// remember to save changes on mouse up
							didChangeRoom = true;
						}
					}
				}
			}
			else if (editTool === RoomEditTool.PICK) {
				if (tool.mouse.down() && !prevIsMouseDown) {
					if (pickX != tilePos.x || pickY != tilePos.y) {
						pickX = tilePos.x;
						pickY = tilePos.y;
						// pick drawing under mouse
						if (drawingAtCoord != null) {
							pick(drawingAtCoord);
						}
					}
					else {
						pickX = -1;
						pickY = -1;
					}
					shouldRedraw = true;
				}
			}
			else if (curEditTool === RoomEditTool.EXITS) {
				if (markerTool) {
					if (tool.mouse.down() && !prevIsMouseDown) {
						if (markerTool.TrySelectMarkerAtLocation(tilePos.x, tilePos.y)) {
							markerTool.StartDrag(tilePos.x, tilePos.y);
						}
					}
					else if (tool.mouse.down() && markerTool.IsDraggingMarker()) {
						markerTool.ContinueDrag(tilePos.x, tilePos.y);
					}
					else if (!tool.mouse.down() && markerTool.IsDraggingMarker()) {
						markerTool.EndDrag();
					}

					if (markerTool.IsDraggingMarker()) {
						shouldRedraw = true;
					}
				}
			}

			// animate tiles
			var didAnimate = updateAnimation(dt);
			if (didAnimate) {
				// animate the picker tiles
				animate("pick_UL");
				animate("pick_UR");
				animate("pick_DL");
				animate("pick_DR");
				// and the select tiles
				animate("select_U");
				animate("select_D");
				animate("select_L");
				animate("select_R");
				animate("select2_U");
				animate("select2_D");
				animate("select2_L");
				animate("select2_R");
			}

			// draw room
			shouldRedraw = shouldRedraw ||
				didAnimate ||
				(isGridVisible != prevIsGridVisible) ||
				(areWallsVisible != prevAreWallsVisible) ||
				(areExitsVisible != prevAreExitsVisible);
			bitsy.graphicsMode(bitsy.GFX_MAP);
			drawRoom(room[selectedId], { redrawAll: shouldRedraw });

			// draw room UI overlay
			if (shouldRedraw) {
				bitsy.fill(overlay, 0);

				// global snapshot flag is hacky?
				if (!isSnapshotInProgress) {
					if (pickX != -1 && pickY != -1) {
						draw("pick_UL", pickX - 1, pickY - 1, overlay);
						draw("pick_UR", pickX + 1, pickY - 1, overlay);
						draw("pick_DL", pickX - 1, pickY + 1, overlay);
						draw("pick_DR", pickX + 1, pickY + 1, overlay);
					}

					if (areWallsVisible) {
						for (var y = 0; y < bitsy.MAP_SIZE; y++) {
							for (var x = 0; x < bitsy.MAP_SIZE; x++) {
								if (isWall(x, y, selectedId) ) {
									draw("wall", x, y, overlay);
								}
							}
						}
					}

					if (areExitsVisible && markerTool) {
						var markers = markerTool.GetMarkerList();
						for (var i = 0; i < markers.length; i++) {
							var marker = markers[i];
							drawExitMarker(marker);
						}

						// draw *selected* marker on top
						var selecteMarker = markerTool.GetSelectedMarker();
						if (selecteMarker != null) {
							drawExitMarker(selecteMarker, true /* isSelected */);
						}
					}
				}
			}

			prevIsMouseDown = tool.mouse.down();
			prevAreWallsVisible = areWallsVisible;
			prevAreExitsVisible = areExitsVisible;

			didRedrawRoom = shouldRedraw;
			forceRedraw = false;

			// always continue loop
			return true;
		};

		// HACK O'CLOCK!
		tool.system._injectPostDraw = function() {
			// because grid lines are smaller than bitsy's resolution
			// the grid must be drawn directly onto the canvas for the tool
			// *after* the bitsy system's drawing step
			if (didRedrawRoom && isGridVisible && !isSnapshotInProgress) {
				bitsy.log("draw room grid!");
				drawGrid(tool.canvasElement, bitsy.MAP_SIZE, getContrastingColor(room[selectedId].pal));
			}
			prevIsGridVisible = isGridVisible;
		};

		tool.menuUpdate = function() {
			if (isPlayMode) {
				return;
			}

			tool.menu.push({ control: "group" });

			tool.menu.push({
				control: "select",
				name: "roomMenuSelect",
				value: curMenu,
				options: [
					{
						icon: "edit",
						text: localization.GetStringOrFallback("general_edit", "edit"),
						description: "room editing tools",
						value: RoomMenu.EDIT,
					},
					{
						icon: "colors",
						text: localization.GetStringOrFallback("palette_tool_name", "colors"),
						description: "room palette settings",
						value: RoomMenu.COLORS,
					},
					{
						icon: "tune",
						text: localization.GetStringOrFallback("tune_tool", "tune"),
						description: "room tune settings",
						value: RoomMenu.TUNE,
					},
					{
						icon: "avatar",
						text: localization.GetStringOrFallback("avatar_label", "avatar"),
						description: "room avatar settings",
						value: RoomMenu.AVATAR,
					},
				],
				onchange: function(e) {
					curMenu = parseInt(e.target.value);
				},
			});

			tool.menu.pop({ control: "group" });

			if (curMenu === RoomMenu.EDIT) {
				// tool select
				tool.menu.push({ control: "group" });

				tool.menu.push({ control: "label", icon: "edit", description: "edit tool" });

				tool.menu.push({
					control: "select",
					name: "roomEditToolSelect",
					value: curEditTool,
					options: [
						{
							icon: "paint",
							text: localization.GetStringOrFallback("paint_tool_name", "paint"),
							description: "paint: draw or erase selected tile, sprite, or item (alt: swap with pick)",
							value: RoomEditTool.PAINT
						},
						{
							icon: "eyedropper",
							text: localization.GetStringOrFallback("room_eyedropper_pick", "pick"),
							description: "eyedropper: click to select tile, sprite, or item in paint tool (alt: swap with paint)",
							value: RoomEditTool.PICK
						},
						{
							icon: "exits_endings",
							text: localization.GetStringOrFallback("marker_tool_name", "exits & endings"),
							description: "select or move exits & endings",
							value: RoomEditTool.EXITS
						}
					],
					onchange: function(e) {
						curEditTool = parseInt(e.target.value);
						areExitsVisible = (curEditTool === RoomEditTool.EXITS);
						if (curEditTool != RoomEditTool.PICK) {
							// hide tile picker
							pickX = -1;
							pickY = -1;
						}
					}
				});

				if (curEditTool === RoomEditTool.EXITS) {
					tool.menu.push({
						control: "button",
						icon: "open_tool",
						description: "open exits & endings tool",
						onclick: function() {
							// todo : hacky?
							showPanel("exitsPanel", "roomPanel");
						}
					});
				}

				tool.menu.pop({ control: "group" });

				// visibility settings
				tool.menu.push({ control: "group" });

				tool.menu.push({ control: "label", icon: "visibility", description: "visibility settings" });

				tool.menu.push({
					control: "toggle",
					id: "roomGridToggle", // todo : auto-generate these?
					icon: isGridVisible ? "visibility" : "visibility_off",
					text: localization.GetStringOrFallback("grid_toggle_visible", "grid"),
					description: "show/hide tile grid",
					checked: isGridVisible,
					onclick: function(e) {
						isGridVisible = e.target.checked;
						setPanelSetting("roomPanel", "grid", isGridVisible);
					}
				});

				tool.menu.push({
					control: "toggle",
					id: "roomWallToggle",
					icon: areWallsVisible ? "visibility" : "visibility_off",
					text: localization.GetStringOrFallback("walls_toggle_visible", "walls"),
					description: "show/hide wall tiles",
					checked: areWallsVisible,
					onclick: function(e) {
						areWallsVisible = e.target.checked;
						setPanelSetting("roomPanel", "walls", areWallsVisible);
					}
				});

				tool.menu.pop({ control: "group" });
			}
			else if (curMenu === RoomMenu.COLORS) {
				tool.menu.push({ control: "group" });

				tool.menu.push({ control: "label", icon : "colors", description : "select color palette", });

				tool.menu.push({
					control: "select",
					data : "PAL",
					value : room[selectedId].pal,
					onchange : function(e) {
						room[selectedId].pal = e.target.value;
						initRoom(selectedId);
						refreshGameData();

						if (findTool) {
							findTool.updateThumbnails();
						}

						if (paintTool) {
							paintTool.reloadDrawing();
						}

						forceRedraw = true;
					},
				});

				tool.menu.pop({ control: "group" });
			}
			else if (curMenu === RoomMenu.AVATAR) {
				tool.menu.push({ control: "group" });

				tool.menu.push({ control: "label", icon : "avatar", description : "select avatar appearance", });
				tool.menu.push({
					control: "select",
					data: "SPR",
					noneOption: "default avatar",
					value: room[selectedId].ava,
					onchange: function(e) {
						if (e.target.value === "null") { // always a string :(
							room[selectedId].ava = null;
						}
						else {
							room[selectedId].ava = e.target.value;
						}
						refreshGameData();
					},
				});

				tool.menu.pop({ control: "group" });
			}
			else if (curMenu === RoomMenu.TUNE) {
				tool.menu.push({ control: "group" });

				tool.menu.push({ control: "label", icon : "tune", description : "select tune for background music", });
				tool.menu.push({
					control: "select",
					data: "TUNE",
					noneOption: "off",
					value: (room[selectedId].tune === "0") ? null : room[selectedId].tune,
					onchange: function(e) {
						if (e.target.value === "null") { // always a string :(
							room[selectedId].tune = null;
						}
						else {
							room[selectedId].tune = e.target.value;
						}
						refreshGameData();
					}
				});

				tool.menu.pop({ control: "group" });
			}
		};

		tool.onSelect = function(id) {
			bitsy.log("select room " + id);
			if (selectedId != id) {
				pickX = -1;
				pickY = -1;
			}

			selectedId = id;
			initRoom(selectedId);

			if (markerTool) {
				markerTool.SetRoom(selectedId);
			}

			if (findTool) {
				findTool.updateThumbnails();
			}

			if (paintTool) {
				paintTool.reloadDrawing();
			}

			forceRedraw = true;
		};

		tool.add = function() {
			var nextId = nextObjectId(sortedBase36IdList(room));
			room[nextId] = createRoomData(nextId);

			for (var y = 0; y < bitsy.MAP_SIZE; y++) {
				room[nextId].tilemap.push([]);
				for (var x = 0; x < bitsy.MAP_SIZE; x++) {
					room[nextId].tilemap[y].push("0");
				}
			}

			var palIdList = sortedPaletteIdList();
			if (palIdList.length > 0) {
				room[nextId].pal = palIdList[0];
			}

			selectedId = nextId;
		};

		tool.duplicate = function(id) {
			var nextId = nextObjectId(sortedBase36IdList(room));
			room[nextId] = createRoomData(nextId);

			// copy name (todo: make a helper func?)
			if (room[selectedId].name != null) {
				var nameWithoutCopySuffix = room[selectedId].name;
				if (nameWithoutCopySuffix.indexOf("copy") != -1) {
					nameWithoutCopySuffix = nameWithoutCopySuffix.split("copy")[0].trim();
				}
				room[nextId].name = CreateDefaultName(nameWithoutCopySuffix + " copy", room);
			}

			// copy tilemap
			var tilemap = [];
			for (var y in room[selectedId].tilemap) {
				tilemap.push([]);
				for (var x in room[selectedId].tilemap[y]) {
					tilemap[y].push(room[selectedId].tilemap[y][x]);
				}
			}

			// copy exits
			var exits = [];
			for (var i in room[selectedId].exits) {
				var exit = room[selectedId].exits[i];
				exits.push(copyExit(exit));
			}

			// copy items
			var items = [];
			for (var i in room[selectedId].items) {
				var item = room[selectedId].items[i];
				items.push(copyItem(item));
			}

			room[nextId].tilemap = tilemap;
			room[nextId].walls = room[selectedId].walls.slice();
			room[nextId].exits = exits;
			room[nextId].endings = room[selectedId].endings.slice();
			room[nextId].items = items;
			room[nextId].pal = room[selectedId].pal;
			room[nextId].ava = room[selectedId].ava;
			room[nextId].tune = room[selectedId].tune;

			selectedId = nextId;
		};

		tool.delete = function(id) {
			// todo : should some of these protections go in the card system?
			if (id === "0") {
				alert("bitsycat says: don't delete room 0 or else your game will become haunted!");
				return;
			}

			if (sortedRoomIdList().length <= 1) {
				alert("you can't delete your only room!");
				return;
			}

			delete room[id];
		};

		tool.onGameDataChange = function() {
			// TODO
		};
	});
}
