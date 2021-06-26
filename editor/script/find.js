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
			getItemName: function(id) {
				return localization.GetStringOrFallback("avatar_label", "avatar");
			},
			getItemDescription: function(id) {
				return localization.GetStringOrFallback("avatar_label", "avatar");
			},
			isItemSelected: function(id) {
				return (drawing.type === TileType.Avatar) && (drawing.id === id);
			},
			openTool: function(id) {
				paintTool.selectDrawing(sprite[id]);
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
			getItemName: function(id) {
				if (tile[id].name) {
					return tile[id].name;
				}
				else {
					return "#" + id;
				}
			},
			getItemDescription: function(id) {
				if (tile[id].name) {
					return localization.GetStringOrFallback("tile_label", "tile") + " " + tile[id].name;
				}
				else {
					return localization.GetStringOrFallback("tile_label", "tile") + " " + id;
				}
			},
			isItemSelected: function(id) {
				return (drawing.type === TileType.Tile) && (drawing.id === id);
			},
			openTool: function(id) {
				paintTool.selectDrawing(tile[id]);
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
			getItemName: function(id) {
				if (sprite[id].name) {
					return sprite[id].name;
				}
				else {
					return "#" + id;
				}
			},
			getItemDescription: function(id) {
				if (sprite[id].name) {
					return localization.GetStringOrFallback("sprite_label", "sprite") + " " + sprite[id].name;
				}
				else {
					return localization.GetStringOrFallback("sprite_label", "sprite") + " " + id;
				}
			},
			isItemSelected: function(id) {
				return (drawing.type === TileType.Sprite) && (drawing.id === id);
			},
			openTool: function(id) {
				paintTool.selectDrawing(sprite[id]);
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
			getItemName: function(id) {
				if (item[id].name) {
					return item[id].name;
				}
				else {
					return "#" + id;
				}
			},
			getItemDescription: function(id) {
				if (item[id].name) {
					return localization.GetStringOrFallback("item_label", "item") + " " + item[id].name;
				}
				else {
					return localization.GetStringOrFallback("item_label", "item") + " " + id;
				}
			},
			isItemSelected: function(id) {
				return (drawing.type === TileType.Item) && (drawing.id === id);
			},
			openTool: function(id) {
				paintTool.selectDrawing(item[id]);
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
			getItemName: function(id) {
				if (room[id].name) {
					return room[id].name;
				}
				else {
					return "#" + id;
				}
			},
			getItemDescription: function(id) {
				if (room[id].name) {
					return localization.GetStringOrFallback("room_label", "room") + " " + room[id].name;
				}
				else {
					return localization.GetStringOrFallback("room_label", "room") + " " + id;
				}
			},
			isItemSelected: function(id) {
				return curRoom === id;
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
			getItemName: function(id) {
				if (palette[id].name) {
					return palette[id].name;
				}
				else {
					return "#" + id;
				}
			},
			getItemDescription: function(id) {
				if (palette[id].name) {
					return localization.GetStringOrFallback("palette_label", "palette") + " " + palette[id].name;
				}
				else {
					return localization.GetStringOrFallback("palette_label", "palette") + " " + id;
				}
			},
			isItemSelected: function(id) {
				return id === selectedColorPal();
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
			getItemName: function(id) {
				if (id === titleDialogId) {
					return titleDialogId; // todo : localize
				}
				else if (dialog[id].name) {
					return dialog[id].name;
				}
				else {
					return "#" + id;
				}
			},
			getItemDescription: function(id) {
				if (id === titleDialogId) {
					return titleDialogId; // todo : localize
				}
				else if (dialog[id].name) {
					return localization.GetStringOrFallback("dialog_label", "dialog") + " " + dialog[id].name;
				}
				else {
					return localization.GetStringOrFallback("dialog_label", "dialog") + " " + id;
				}
			},
			isItemSelected: function(id) {
				return id === curDialogEditorId;
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

	function selectCategory(categoryId) {
		curFilter = categoryId;
		GenerateItems();
	}

	function selectCategoryAndUpdateUI(categoryId) {
		selectCategory(categoryId);

		// hack! ..I'd prefer not to be directly manipulating the document here
		document.getElementById("findFilter-" + categoryId).checked = true;
	}

	this.SelectCategory = selectCategoryAndUpdateUI;

	var filterSelect = createTabSelectElement({
		name: "findFilter",
		value: curFilter,
		tabs: filterTabList,
		onclick: function(e) {
			selectCategory(e.target.value);
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

	var items = [];

	function GenerateItems() {
		items = [];

		function createOnClick(category, id) {
			return function() {
				category.openTool(id);
				UpdateSelectedItems();
			}
		}

		scrollcontentDiv.innerHTML = "";

		for (var i = 0; i < categoryDefinitions.length; i++) {
			var category = categoryDefinitions[i];

			if (curFilter === "all" || curFilter === category.id) {
				var idList = category.getIdList()

				for (var j = 0; j < idList.length; j++) {
					var id = idList[j];
					var displayName = category.getItemName(id);
					var isSearchTextInName = (curSearchText === undefined || curSearchText === null ||
						curSearchText.length <= 0 || displayName.indexOf(curSearchText) != -1);

					if (isSearchTextInName) {
						var thumbnailControl = new ThumbnailControl({
								id: id,
								renderer: category.renderer,
								icon: category.icon,
								text: displayName,
								tooltip: category.getItemDescription(id),
								isSelectedFunc: category.isItemSelected,
								onclick: createOnClick(category, id),
								renderOptions: { isAnimated: true },
							});

						items.push(thumbnailControl);

						scrollcontentDiv.appendChild(thumbnailControl.GetElement());
					}
				}
			}
		}

		UpdateVisibleItems();
		UpdateSelectedItems();
	}

	function UpdateVisibleItems() {
		var viewportRect = scrollviewDiv.getBoundingClientRect();

		for (var i = 0; i < items.length; i++) {
			var thumbnailControl = items[i];
			var thumbRect = thumbnailControl.GetElement().getBoundingClientRect();
			var isInViewport = !(thumbRect.bottom < viewportRect.top || thumbRect.top > viewportRect.bottom);

			if (isInViewport) {
				thumbnailControl.LoadThumbnailImage();
			}
		}
	}

	function UpdateSelectedItems() {
		for (var i = 0; i < items.length; i++) {
			var thumbnailControl = items[i];
			thumbnailControl.UpdateSelected();
		}
	}

	events.Listen("game_data_change", function(event) {
		spriteThumbnailRenderer.InvalidateCache();
		tileThumbnailRenderer.InvalidateCache();
		itemThumbnailRenderer.InvalidateCache();
		paletteThumbnailRenderer.InvalidateCache();
		roomThumbnailRenderer.InvalidateCache();
		GenerateItems();
	});

	// todo : the naming of these events is confusing
	events.Listen("game_data_refresh", function(event) {
		spriteThumbnailRenderer.InvalidateCache();
		tileThumbnailRenderer.InvalidateCache();
		itemThumbnailRenderer.InvalidateCache();
		paletteThumbnailRenderer.InvalidateCache();
		roomThumbnailRenderer.InvalidateCache();
		GenerateItems();
	});

	events.Listen("select_drawing", function(event) {
		UpdateSelectedItems();
	});

	events.Listen("select_room", function(event) {
		spriteThumbnailRenderer.InvalidateCache();
		tileThumbnailRenderer.InvalidateCache();
		itemThumbnailRenderer.InvalidateCache();
		UpdateVisibleItems();
		UpdateSelectedItems();
	});

	// TODO : somehow palette selection works already??? find out why.. (is it triggering a game data refresh?)
	// events.Listen("select_palette", function(event) {
	// 	UpdateSelectedItems();
	// });

	events.Listen("select_dialog", function(event) {
		UpdateSelectedItems();
	});

	var scrollEndTimer = null;
	scrollviewDiv
		.addEventListener("scroll", function() {
			if (scrollEndTimer != null) {
				clearTimeout(scrollEndTimer);
			}

			scrollEndTimer = setTimeout(function() {
				UpdateVisibleItems();
			}, 100);
		});

	// init
	GenerateItems();
}