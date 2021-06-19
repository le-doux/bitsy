function FindTool(options) {
	var categoryDefinitions = [
		{
			icon: "avatar",
			getIdList: function() { return ["A"]; },
		},
		{
			icon: "tile",
			getIdList: function() { return sortedTileIdList(); },
		},
		{
			icon: "sprite",
			getIdList: function() {
				var idList = sortedSpriteIdList();
				idList.splice(idList.indexOf("A"), 1);
				return idList;
			},
		},
		{
			icon: "item",
			getIdList: function() { return sortedItemIdList(); },
		},
		{
			icon: "room",
			getIdList: function() { return sortedRoomIdList(); },
		},
		{
			icon: "colors",
			getIdList: function() { return sortedPaletteIdList(); },
		},
		{
			icon: "dialog",
			getIdList: function() { return [titleDialogId].concat(sortedDialogIdList()); },
		},
	];

	var searchGroup = createGroupContainer();

	searchGroup.appendChild(createLabel({
		icon: "search",
	}));

	searchGroup.appendChild(createTextInput({
		placeholder: "search by name",
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

	// function createOnClickHandler(id) {
	// 	return function() {
	// 		paintTool.selectDrawing(new DrawingId(TileType.Item, id));
	// 		on_paint_item_ui_update();
	// 	}
	// }

	// for (var id in item) {
	// 	var itemIcon = createIconElement("item");
	// 	itemIcon.onclick = createOnClickHandler(id);
	// 	scrollview.appendChild(itemIcon);
	// }

	for (var i = 0; i < categoryDefinitions.length; i++) {
		var category = categoryDefinitions[i];

		var idList = category.getIdList()

		for (var j in idList) {
			var id = idList[j];
			var icon = createIconElement(category.icon);
			icon.title = id;
			scrollcontentDiv.appendChild(icon);
		}
	}
}