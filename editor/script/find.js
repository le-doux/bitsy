function FindTool(options) {
	var categoryDefinitions = [
		{
			icon: "avatar",
			getIdList: function() { return ["A"]; },
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Avatar, id));
				on_paint_avatar_ui_update();
				showPanel("paintPanel", "findPanel");
			},
		},
		{
			icon: "tile",
			getIdList: function() { return sortedTileIdList(); },
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Tile, id));
				on_paint_tile_ui_update();
				showPanel("paintPanel", "findPanel");
			},
		},
		{
			icon: "sprite",
			getIdList: function() {
				var idList = sortedSpriteIdList();
				idList.splice(idList.indexOf("A"), 1);
				return idList;
			},
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Sprite, id));
				on_paint_sprite_ui_update();
				showPanel("paintPanel", "findPanel");
			},
		},
		{
			icon: "item",
			getIdList: function() { return sortedItemIdList(); },
			openTool: function(id) {
				paintTool.selectDrawing(new DrawingId(TileType.Item, id));
				on_paint_item_ui_update();
				showPanel("paintPanel", "findPanel");
			},
		},
		{
			icon: "room",
			getIdList: function() { return sortedRoomIdList(); },
			openTool: function(id) {
				selectRoom(id);
				showPanel("roomPanel", "findPanel");
			},
		},
		{
			icon: "colors",
			getIdList: function() { return sortedPaletteIdList(); },
			openTool: function(id) {
				paletteTool.Select(id);
				showPanel("colorsPanel", "findPanel");
			},
		},
		{
			icon: "dialog",
			getIdList: function() { return [titleDialogId].concat(sortedDialogIdList()); },
			openTool: function(id) {
				openDialogTool(id);
				showPanel("dialogPanel", "findPanel");
			},
		},
	];

	var searchGroup = createGroupContainer();

	searchGroup.appendChild(createLabel({
		icon: "search",
	}));

	searchGroup.appendChild(createTextInput({
		placeholder: "find by name or id",
	}));

	options.mainElement.appendChild(searchGroup);

	var filterTabs = createTabs({
		name: "findFilter",
		tabs: [
			{ text: "all", value: "all", icon: "game_data", },
			{ text: "in room", value: "in_room", icon: "set_exit_location", },
			{ text: "avatar", value: "avatar", icon: "avatar", },
			{ text: "tile", value: "tile", icon: "tile", },
			{ text: "sprite", value: "sprite", icon: "sprite", },
			{ text: "item", value: "item", icon: "item", },
			{ text: "room", value: "room", icon: "room", },
			{ text: "colors", value: "colors", icon: "colors", },
			{ text: "dialog", value: "dialog", icon: "dialog", },
		],
	});

	filterTabs.classList.add("bitsy-menu-group");

	options.mainElement.appendChild(filterTabs);

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

			var idList = category.getIdList()

			for (var j = 0; j < idList.length; j++) {
				var id = idList[j];
				var icon = createIconElement(category.icon);
				icon.onclick = createOnClick(category, id);
				icon.title = id;
				scrollcontentDiv.appendChild(icon);
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