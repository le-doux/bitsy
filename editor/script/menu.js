/*
	Shared functions for creating controls for tool menus
*/

function createGroupContainer() {
	var groupDiv = document.createElement("div");
	groupDiv.classList.add("bitsy-menu-group");
	return groupDiv;
}

function createIconElement(id) {
	// todo : supply this externally?
	return iconUtils.CreateIcon(id);
}

function createLabel(options) {
	var label = document.createElement("span");

	if (options.icon) {
		label.appendChild(createIconElement(options.icon));
	}

	if (options.text) {
		var textSpan = document.createElement("span");
		textSpan.innerText = options.text;
		label.appendChild(textSpan);
	}

	return label;
}

function createTextInput(options) {
	var input = document.createElement("input");
	input.type = "text";

	if (options.value) {
		input.value = options.value;
	}

	if (options.placeholder) {
		input.placeholder = options.placeholder;
	}

	if (options.onchange) {
		input.onchange = options.onchange;
	}

	return input;
}

function createTabs(options) {
	var tabForm = document.createElement("form");

	for (var i = 0; i < options.tabs.length; i++) {
		var tabInfo = options.tabs[i];

		var value = (tabInfo.value != undefined ? tabInfo.value : null);

		var tabInput = document.createElement("input");
		tabInput.type = "radio";
		tabInput.name = options.name;
		tabInput.id = options.name + "-" + value;
		tabInput.value = value;
		tabForm.appendChild(tabInput);

		if (value === options.value) {
			tabInput.checked = true;
		}

		tabInput.onclick = function(e) {
			if (options.onclick) {
				options.onclick(e);
			}
		};

		var tabLabel = document.createElement("label");
		tabLabel.setAttribute("for", tabInput.id);
		tabForm.appendChild(tabLabel);

		if (tabInfo.icon) {
			tabLabel.appendChild(createIconElement(tabInfo.icon));
		}

		if (tabInfo.text) {
			var tabName = document.createElement("span");
			tabName.innerText = tabInfo.text;
			tabLabel.appendChild(tabName);
		}
	}

	return tabForm;
}

function createThumbnail(options) {
	var div = document.createElement("div");
	div.classList.add("bitsy-thumbnail");
	div.onclick = options.onclick;
	div.title = options.text;

	var thumbnailContainer = document.createElement("div");
	thumbnailContainer.classList.add("bitsy-thumbnail-image-container");
	div.appendChild(thumbnailContainer);

	var icon = createIconElement(options.icon);
	thumbnailContainer.appendChild(icon);

	div.appendChild(createLabel({
		icon: options.icon,
		text: options.text,
	}));

	return div;
}