/* shared HTML element creation functions */
function createGroupElement(options) {
	var groupDiv = document.createElement("div");
	groupDiv.classList.add("bitsy-menu-group");

	if (options && options.enabled === false) {
		groupDiv.classList.add("disabled");
	}

	return groupDiv;
}

function createIconElement(id) {
	return iconUtils.CreateIcon(id);
}

function createLabelElement(options) {
	var label = document.createElement("label");
	label.classList.add("bitsy-menu-label");

	if (options.style) {
		label.classList.add(options.style);
	}

	if (options.icon) {
		label.appendChild(createIconElement(options.icon));
	}

	if (options.text) {
		var textSpan = document.createElement("span");
		textSpan.innerText = options.text;
		label.appendChild(textSpan);
	}

	if (options.description) {
		label.title = options.description;
	}

	if (options.for) {
		label.setAttribute("for", options.for);
	}

	return label;
}

// todo : name? textbox vs textInput?
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

function createRadioElement(options) {
	var radioForm = document.createElement("form");

	for (var i = 0; i < options.options.length; i++) {
		var option = options.options[i];

		var value = (option.value != undefined ? option.value : null);

		var radioInput = document.createElement("input");
		radioInput.type = "radio";
		radioInput.name = options.name;
		radioInput.id = options.name + "-" + value;
		radioInput.value = value;
		radioForm.appendChild(radioInput);

		if (value === options.value) {
			radioInput.checked = true;
		}

		radioInput.onclick = function(e) {
			if (options.onclick) {
				options.onclick(e);
			}
		};

		var labelStyle = "middle";
		if (i === 0) {
			labelStyle = "left";
		}
		else if (i === options.options.length - 1) {
			labelStyle = "right";
		}

		radioForm.appendChild(createLabelElement({
			icon: option.icon,
			text: option.text,
			description: option.description,
			for: radioInput.id,
			style: labelStyle,
		}));
	}

	return radioForm;
}

function createSelectElement(options) {
	var selectElement = document.createElement("select");
	selectElement.onchange = function (e) {
		if (options.onchange) {
			options.onchange(e);
		}
	}

	// create default empty option
	{
		var optionElement = document.createElement("option");
		optionElement.innerText = "";
		optionElement.title = "no option selected";
		optionElement.value = null;
		optionElement.selected = true;
		optionElement.disabled = true;
		optionElement.hidden = true;
		selectElement.appendChild(optionElement);
	}

	for (var i = 0; i < options.options.length; i++) {
		var option = options.options[i];
		var value = (option.value != undefined ? option.value : null);
		var optionElement = document.createElement("option");
		optionElement.innerText = option.text;
		optionElement.title = option.description;
		optionElement.value = value;
		optionElement.selected = (value === options.value);
		selectElement.appendChild(optionElement);
	}

	return selectElement;
}

function createButtonElement(options) {
	var button = document.createElement("button");

	if (options.icon) {
		button.appendChild(createIconElement(options.icon));
	}

	if (options.text) {
		var textSpan = document.createElement("span");
		textSpan.innerText = options.text;
		button.appendChild(textSpan);
	}

	if (options.description) {
		button.title = options.description;
	}

	if (options.enabled != undefined) {
		button.disabled = !options.enabled;
	}

	button.onclick = function (e) {
		if (options.onclick) {
			options.onclick(e);
		}
	};

	if (options.style) {
		button.classList.add(options.style);
	}

	return button;
}

function createToggleElement(options) {
	var toggleSpan = document.createElement("span");

	var checkboxInput = document.createElement("input");
	checkboxInput.type = "checkbox";
	checkboxInput.value = options.value;
	checkboxInput.id = options.id; // todo : auto-generate IDs?
	checkboxInput.checked = options.checked;
	checkboxInput.onclick = function (e) {
		if (options.onclick) {
			options.onclick(e);
		}
	}
	toggleSpan.appendChild(checkboxInput);

	if (options.enabled != undefined) {
		checkboxInput.disabled = !options.enabled;
	}

	var toggleLabel = createLabelElement({
		icon: options.icon,
		text: options.text,
		for: checkboxInput.id,
		// style: "button",
		description: options.description,
		style: options.style
	});
	toggleSpan.appendChild(toggleLabel);

	return toggleSpan;
}

function createOptionsForFindCategory(categoryId, noneOption) {
	var options = [];

	if (findTool) {
		if (noneOption) {
			options.push({ value: null, text: noneOption, description: noneOption });
		}

		var category = findTool.getCategory(categoryId);
		var idList = category.getIdList();
		for (var i = 0; i < idList.length; i++) {
			var id = idList[i];

			var displayName = category.getItemName(id);
			var tooltip = category.getItemDescription(id);
			if (displayName === null || displayName === undefined) {
				displayName = category.getItemDescription(id, true);
			}
			else {
				tooltip = displayName + " (" + tooltip + ")";
			}

			options.push({
				value : id,
				text : displayName,
				description : tooltip,
			});
		}
	}

	return options;
}

/* MENU INTERFACE */
function MenuInterface(tool) {
	var self = this;

	this.tool = tool;

	this.update = function() {
		self.tool.menuElement.innerHTML = "";
		self.tool.menuUpdate();
	};

	var curGroupElement = null;

	function wrapEventHandler(handler) {
		return function(e) {
			enableGlobalAudioContext();

			if (self.tool.system) {
				bitsy = self.tool.system; // hack to force correct system
			}

			handler(e);
			self.update();
		}
	}

	// todo : still not sure if I like push & pop as the names of these methods..
	this.push = function(message) {
		if (message.control) {
			var createFunction = null;
			switch (message.control) {
				case "label":
					createFunction = createLabelElement;
					break;
				case "button":
					createFunction = createButtonElement;
					break;
				case "toggle":
					createFunction = createToggleElement;
					break;
				case "select":
					if (message.data) {
						message.options = createOptionsForFindCategory(message.data, message.noneOption);
						createFunction = createSelectElement;
					}
					// todo : not sure how I feel about the dropdown override option
					else if ((message.dropdown != undefined && message.dropdown === true) || (message.dropdown === undefined && message.options && message.options.length >= 5)) {
						createFunction = createSelectElement;
					}
					else {
						message.onclick = message.onchange; // kind of hacky
						createFunction = createRadioElement;
					}
					break;
				case "group":
					createFunction = createGroupElement;
					break;
			}

			if (createFunction != null) {
				if (message.onclick) {
					message.onclick = wrapEventHandler(message.onclick);
				}

				if (message.onchange) {
					message.onchange = wrapEventHandler(message.onchange);
				}

				var element = createFunction(message);

				if (curGroupElement === null || message.control === "group") {
					self.tool.menuElement.appendChild(element);
				}
				else {
					curGroupElement.appendChild(element);
				}

				if (message.control === "group") {
					curGroupElement = element;
				}
			}
		}
	};

	this.pop = function(message) {
		if (message.control === "group") {
			curGroupElement = null;
		}
	};
}