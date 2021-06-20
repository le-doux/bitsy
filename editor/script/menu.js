/* shared HTML element creation functions */

function createGroupElement() {
	var groupDiv = document.createElement("div");
	groupDiv.classList.add("bitsy-menu-group");
	return groupDiv;
}

function createIconElement(id) {
	return iconUtils.CreateIcon(id);
}

function createLabelElement(options) {
	var label = document.createElement("label");
	label.classList.add("bitsy-menu-label");

	if (options.style) {
		label.classList.add("bitsy-label-style-" + options.style);
	}

	if (options.icon) {
		label.appendChild(createIconElement(options.icon));
	}

	if (options.text) {
		var textSpan = document.createElement("span");
		textSpan.innerText = options.text;
		label.appendChild(textSpan);
	}

	if (options.for) {
		label.setAttribute("for", options.for);
	}

	return label;
}

function createTextInputElement(options) {
	var input = document.createElement("input");
	input.type = "text";

	if (options.style) {
		input.classList.add("bitsy-input-style-" + options.style);
	}

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

function createTabSelectElement(options) {
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

		tabForm.appendChild(createLabelElement({
			icon: tabInfo.icon,
			text: tabInfo.text,
			for: tabInput.id,
		}));
	}

	return tabForm;
}