function FindTool(options) {
	// var searchGroup = createGroupContainer();

	// searchGroup.appendChild(createLabel({
	// 	icon: "search",
	// }));

	// searchGroup.appendChild(createTextInput({
	// 	placeholder: "search by name",
	// }));

	// options.mainElement.appendChild(searchGroup);

	// var filterTabs = createTabs({
	// 	name: "findFilter",
	// 	tabs: [
	// 		{ text: "all", value: "all", icon: "game_data", },
	// 		{ text: "in room", value: "in_room", icon: "set_exit_location", },
	// 		{ text: "avatar", value: "avatar", icon: "avatar", },
	// 		{ text: "tile", value: "tile", icon: "tile", },
	// 		{ text: "sprite", value: "sprite", icon: "sprite", },
	// 		{ text: "item", value: "item", icon: "item", },
	// 		{ text: "room", value: "room", icon: "room", },
	// 		{ text: "colors", value: "colors", icon: "colors", },
	// 		{ text: "dialog", value: "dialog", icon: "dialog", },
	// 	],
	// });

	// filterTabs.classList.add("bitsy-menu-group");

	// options.mainElement.appendChild(filterTabs);

	var thumbnailScrollview = createScrollview();

	options.mainElement.appendChild(thumbnailScrollview);

	function createOnClickHandler(id) {
		return function() {
			paintTool.selectDrawing(new DrawingId(TileType.Item, id));
			on_paint_item_ui_update();
		}
	}

	for (var id in item) {
		var itemIcon = createIconElement("item");
		itemIcon.onclick = createOnClickHandler(id);
		thumbnailScrollview.appendChild(itemIcon);
	}
}