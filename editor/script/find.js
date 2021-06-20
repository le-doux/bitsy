function FindTool(options) {
	var spriteThumbnailRenderer = createSpriteThumbnailRenderer();
	var tileThumbnailRenderer = createTileThumbnailRenderer();
	var itemThumbnailRenderer = createItemThumbnailRenderer();
	var paletteThumbnailRenderer = createPaletteThumbnailRenderer();
	var roomThumbnailRenderer = createRoomThumbnailRenderer();

	var categoryDefinitions = [
		{
			id: "avatar",
			icon: "avatar",
			getIdList: function() { return ["A"]; },
			getCategoryName: function() {
				return localization.GetStringOrFallback("avatar_label", "avatar");
			},
			getDisplayName: function(id) {
				return localization.GetStringOrFallback("avatar_label", "avatar");
			},
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Avatar, id));
				on_paint_avatar_ui_update();
				showPanel("paintPanel", "findPanel");
			},
			renderer: spriteThumbnailRenderer,
		},
		{
			id: "tile",
			icon: "tile",
			getIdList: function() { return sortedTileIdList(); },
			getCategoryName: function() {
				return localization.GetStringOrFallback("tile_label", "tile");
			},
			getDisplayName: function(id) {
				if (tile[id].name) {
					return tile[id].name;
				}
				else {
					return localization.GetStringOrFallback("tile_label", "tile") + " " + id;
				}
			},
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Tile, id));
				on_paint_tile_ui_update();
				showPanel("paintPanel", "findPanel");
			},
			renderer: tileThumbnailRenderer,
		},
		{
			id: "sprite",
			icon: "sprite",
			getIdList: function() {
				var idList = sortedSpriteIdList();
				idList.splice(idList.indexOf("A"), 1);
				return idList;
			},
			getCategoryName: function() {
				return localization.GetStringOrFallback("sprite_label", "sprite");
			},
			getDisplayName: function(id) {
				if (sprite[id].name) {
					return sprite[id].name;
				}
				else {
					return localization.GetStringOrFallback("sprite_label", "sprite") + " " + id;
				}
			},
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Sprite, id));
				on_paint_sprite_ui_update();
				showPanel("paintPanel", "findPanel");
			},
			renderer: spriteThumbnailRenderer,
		},
		{
			id: "item",
			icon: "item",
			getIdList: function() { return sortedItemIdList(); },
			getCategoryName: function() {
				return localization.GetStringOrFallback("item_label", "item");
			},
			getDisplayName: function(id) {
				if (item[id].name) {
					return item[id].name;
				}
				else {
					return localization.GetStringOrFallback("item_label", "item") + " " + id;
				}
			},
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Item, id));
				on_paint_item_ui_update();
				showPanel("paintPanel", "findPanel");
			},
			renderer: itemThumbnailRenderer,
		},
		{
			id: "room",
			icon: "room",
			getIdList: function() { return sortedRoomIdList(); },
			getCategoryName: function() {
				return localization.GetStringOrFallback("room_label", "room");
			},
			getDisplayName: function(id) {
				if (room[id].name) {
					return room[id].name;
				}
				else {
					return localization.GetStringOrFallback("room_label", "room") + " " + id;
				}
			},
			openTool: function(id) {
				selectRoom(id);
				showPanel("roomPanel", "findPanel");
			},
			renderer: roomThumbnailRenderer,
		},
		{
			id: "colors",
			icon: "colors",
			getIdList: function() { return sortedPaletteIdList(); },
			getCategoryName: function() {
				return localization.GetStringOrFallback("palette_tool_name", "colors");
			},
			getDisplayName: function(id) {
				if (palette[id].name) {
					return palette[id].name;
				}
				else {
					return localization.GetStringOrFallback("palette_label", "palette") + " " + id;
				}
			},
			openTool: function(id) {
				paletteTool.Select(id);
				showPanel("colorsPanel", "findPanel");
			},
			renderer: paletteThumbnailRenderer,
		},
		{
			id: "dialog",
			icon: "dialog",
			getIdList: function() { return [titleDialogId].concat(sortedDialogIdList()); },
			getCategoryName: function() {
				return localization.GetStringOrFallback("dialog_label", "dialog");
			},
			getDisplayName: function(id) {
				if (id === titleDialogId) {
					return titleDialogId; // todo : localize
				}
				else if (dialog[id].name) {
					return dialog[id].name;
				}
				else {
					return localization.GetStringOrFallback("dialog_label", "dialog") + " " + id;
				}
			},
			openTool: function(id) {
				openDialogTool(id);
				showPanel("dialogPanel", "findPanel");
			},
		},
	];

	var curFilter = "all";
	var curSearchText = "";

	var searchGroup = createGroupElement();

	searchGroup.appendChild(createLabelElement({
		icon: "search",
		style: "badge",
	}));

	searchGroup.appendChild(createTextInputElement({
		placeholder: "find by name or ID", // todo : localize
		style: "with-badge",
		onchange: function(e) {
			curSearchText = e.target.value;
			GenerateItems();
		},
	}));

	options.mainElement.appendChild(searchGroup);

	var filterTabList = [
		{
			text: "all", // todo : localize
			value: "all",
			icon: "game_data",
		},
	];

	for (var i = 0; i < categoryDefinitions.length; i++) {
		var category = categoryDefinitions[i];

		filterTabList.push({
			text: category.getCategoryName(),
			value: category.id,
			icon: category.icon,
		});
	}

	var filterSelect = createTabSelectElement({
		name: "findFilter",
		value: curFilter,
		tabs: filterTabList,
		onclick: function(e) {
			curFilter = e.target.value;
			GenerateItems();
		},
	});

	filterSelect.classList.add("bitsy-menu-group");

	options.mainElement.appendChild(filterSelect);

	var scrollviewDiv = document.createElement("div");
	scrollviewDiv.classList.add("bitsy-menu-scrollview");

	options.mainElement.appendChild(scrollviewDiv);

	var scrollcontentDiv = document.createElement("div");
	scrollcontentDiv.classList.add("bitsy-menu-scrollcontent");
	scrollviewDiv.appendChild(scrollcontentDiv);

	function GenerateItems() {
		function createOnClick(category, id) {
			return function() {
				category.openTool(id);
			}
		}

		scrollcontentDiv.innerHTML = "";

		for (var i = 0; i < categoryDefinitions.length; i++) {
			var category = categoryDefinitions[i];

			if (curFilter === "all" || curFilter === category.id) {
				var idList = category.getIdList()

				for (var j = 0; j < idList.length; j++) {
					var id = idList[j];
					var displayName = category.getDisplayName(id);
					var isSearchTextInName = (curSearchText === undefined || curSearchText === null ||
						curSearchText.length <= 0 || displayName.indexOf(curSearchText) != -1);

					if (isSearchTextInName) {
						var thumbnailControl = new ThumbnailControl({
								id: id,
								renderer: category.renderer,
								icon: category.icon,
								text: displayName,
								onclick: createOnClick(category, id),
								renderOptions: { isAnimated: true },
							});

						scrollcontentDiv.appendChild(thumbnailControl.GetElement());
					}
				}
			}
		}
	}

	GenerateItems();

	events.Listen("game_data_change", function(event) {
		GenerateItems();
	});

	// todo : the naming of these events is confusing
	events.Listen("game_data_refresh", function(event) {
		GenerateItems();
	});
}