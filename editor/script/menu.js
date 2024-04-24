/* shared HTML element creation functions */
function tryGetMenuString(menuText) {
	var menuString;

	if (menuText && menuText.id && localization) {
		menuString = localization.GetStringOrFallback(menuText.id, menuText.text);
	}
	else if (menuText && menuText.text) {
		// no localization available
		menuString = menuText.text;
	}
	else if (menuText) {
		// fallback to raw string
		menuString = menuText;
	}

	return menuString;
}

function createGroupElement(options) {
	// todo : better setting name?
	var hasHeader = options && (options.text || options.icon);
	var isExpandable = options && (options.expandable === true);

	var groupElement;
	var groupHeaderLabel;

	if (hasHeader) {
		groupHeaderLabel = createLabelElement({
			text: options.text,
			description: options.description,
			icon: options.icon,
			style: "bitsy-menu-header",
			elementType: "span", // override the element type to make it clickable
		});
	}

	if (isExpandable) {
		var groupDetails = document.createElement("details");

		if (options && options.open === true) {
			groupDetails.setAttribute("open", "");
		}

		groupDetails.ontoggle = function(e) {
			if (options.ontoggle) {
				options.ontoggle(e);
			}
		};

		if (hasHeader) {
			var groupSummary = document.createElement("summary");
			groupSummary.appendChild(groupHeaderLabel);
			groupDetails.appendChild(groupSummary);
		}

		groupElement = groupDetails;
	}
	else {
		var groupDiv = document.createElement("div");

		if (hasHeader) {
			groupDiv.appendChild(groupHeaderLabel);
		}

		groupElement = groupDiv;
	}

	groupElement.classList.add("bitsy-menu-group");

	if (options && options.enabled === false) {
		groupElement.classList.add("disabled");
	}

	// todo : set via class instead? (name: row/column or horizontal/vertical?)
	if (options && options.direction) {
		groupElement.setAttribute("flex-direction", options.direction);
	}

	return groupElement;
}

function createIconElement(id) {
	return iconUtils.CreateIcon(id);
}

function createLabelElement(options) {
	var elementType = (options && options.elementType) ? options.elementType : "label";
	var label = document.createElement(elementType);
	label.classList.add("bitsy-menu-label");

	if (options.style) {
		label.classList.add(options.style);
	}

	if (options.icon) {
		label.appendChild(createIconElement(options.icon));
	}

	var labelText = tryGetMenuString(options.text);
	if (labelText) {
		var textSpan = document.createElement("span");
		textSpan.innerText = labelText;

		if (options.id) {
			textSpan.id = options.id + "Text";
		}

		label.appendChild(textSpan);
	}

	var labelTooltip = tryGetMenuString(options.description);
	if (labelTooltip) {
		label.title = labelTooltip;
	}

	if (options.for) {
		label.setAttribute("for", options.for);
	}

	if (options.id) {
		label.id = options.id;
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

function createTextAreaElement(options) {
	var textarea = document.createElement("textarea");
	textarea.setAttribute("spellcheck", false);

	if (options.rows) {
		textarea.setAttribute("rows", options.rows);
	}

	if (options.value) {
		textarea.value = options.value;
	}

	// todo : description

	if (options.onchange) {
		textarea.onchange = options.onchange;
	}

	return textarea;
}

function createNumberInputElement(options) {
	var input = document.createElement("input");
	input.type = "number";

	if (options.style) {
		input.classList.add("bitsy-input-style-" + options.style);
	}

	if (options.value) {
		input.value = options.value;
	}

	if (options.onchange) {
		input.onchange = options.onchange;
	}

	return input;
}

function createColorInputElement(options) {
	var input = document.createElement("input");
	input.type = "color";

	if (options.style) {
		input.classList.add("bitsy-input-style-" + options.style);
	}

	if (options.value) {
		input.value = options.value;
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

		var optionText = tryGetMenuString(option.text);
		optionElement.innerText = optionText;

		var optionTooltip = tryGetMenuString(option.description);
		optionElement.title = optionTooltip;

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

	var buttonText = tryGetMenuString(options.text);
	if (buttonText) {
		var textSpan = document.createElement("span");
		textSpan.innerText = buttonText;
		button.appendChild(textSpan);
	}

	var buttonTooltip = tryGetMenuString(options.description);
	if (buttonTooltip) {
		button.title = buttonTooltip;
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
	toggleSpan.id = options.id + "Span";

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
		id: options.id + "Label",
		text: options.text,
		for: checkboxInput.id,
		// style: "button",
		description: options.description,
		style: options.style
	});
	toggleSpan.appendChild(toggleLabel);

	return toggleSpan;
}

function createFileInputElement(options) {
	var fileInputSpan = document.createElement("span");

	var fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.style = "display:none;"; // hack! should add to default style
	fileInput.accept = options.accept;
	fileInput.id = options.id; // todo : auto-generate IDs?
	fileInput.onchange = function (e) {
		// load file chosen by user
		var files = e.target.files;
		var file = files[0];
		var reader = new FileReader();
		reader.readAsText(file);

		reader.onloadend = function() {
			if (options.onload) {
				options.onload(reader.result);
			}
		}
	}
	fileInputSpan.appendChild(fileInput);

	var fileInputLabel = createLabelElement({
		icon: options.icon,
		id: options.id + "Label",
		text: options.text,
		for: fileInput.id,
		description: options.description,
		style: "filePickerLabel" // hack - add to default style!
	});
	fileInputSpan.appendChild(fileInputLabel);

	return fileInputSpan;
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

	var groupStack = [];

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
				case "text":
					createFunction = createTextInputElement;
					break;
				case "textarea":
					// todo : combine with text element?
					createFunction = createTextAreaElement;
					break;
				case "number":
					createFunction = createNumberInputElement;
					break;
				case "color":
					createFunction = createColorInputElement;
					break;
				// todo : should this be a special element? or wrap in a function?
				case "file":
					createFunction = createFileInputElement;
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

				if (message.onload) {
					message.onload = wrapEventHandler(message.onload);
				}

				var element = createFunction(message);

				if (groupStack.length > 0) {
					groupStack[groupStack.length - 1].appendChild(element);
				}
				else {
					self.tool.menuElement.appendChild(element);
				}

				if (message.control === "group") {
					groupStack.push(element);
				}
			}
		}
	};

	this.pop = function(message) {
		if (message.control === "group") {
			groupStack.pop();
		}
	};
}