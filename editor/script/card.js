/* TOOL CARDS */
function makeToolCard(processName, initFunction) {
	var card = addProcess(processName);

	initFunction(card);

	// forward the card's loop function to the system
	card.system.loop(function(dt) {
		return card.loop(dt);
	});

	card.menu = new MenuInterface(card);

	var cardDiv = document.createElement("div");
	cardDiv.id = card.id + "Panel";
	cardDiv.classList.add("bitsy-card");
	cardDiv.classList.add("bitsy-card-" + card.size);
	cardDiv.classList.add("bitsy-workbench-item");

	var titlebarDiv = document.createElement("div");
	titlebarDiv.classList.add("bitsy-card-titlebar");
	cardDiv.appendChild(titlebarDiv);

	var titleIconSpan = document.createElement("span");
	titleIconSpan.appendChild(createIconElement(card.icon));
	titlebarDiv.appendChild(titleIconSpan);

	var titleSpan = document.createElement("span");
	titleSpan.classList.add("bitsy-card-title");
	titleSpan.innerText = card.name();
	titleSpan.onmousedown = function(event) {
		grabCard(event);
	};
	titlebarDiv.appendChild(titleSpan);

	titlebarDiv.appendChild(createButtonElement({
		icon: "help",
		description: "show about page for " + card.name(),
		onclick: function() {
			showAbout(card.aboutPage, cardDiv.id);
		}
	}));

	titlebarDiv.appendChild(createButtonElement({
		icon: "close",
		style: "bitsy-card-close-button",
		onclick: function() {
			hidePanel(cardDiv.id);
		},
	}));

	card.setTitlebar = function(icon, text) {
		titleIconSpan.innerHTML = "";
		titleIconSpan.appendChild(createIconElement(icon));
		titleSpan.innerText = text;
	};

	card.resetTitlebar = function() {
		titleIconSpan.innerHTML = "";
		titleIconSpan.appendChild(createIconElement(card.icon));
		titleSpan.innerText = card.name();
	};

	var mainDiv = document.createElement("div");
	mainDiv.classList.add("bitsy-card-main");
	cardDiv.appendChild(mainDiv);

	var navControls;

	if (card.data != undefined) {
		navControls = createNavControls({
			system: card.system, // todo : should I just pass the whole card?
			parentElement: mainDiv,
			cardDivId: cardDiv.id,
			data: card.data,
			onSelect: function(id) {
				if (card.system) {
					bitsy = card.system; // hack to force correct system
				}

				card.onSelect(id);
				card.menu.update();
			},
			add: card.add,
			duplicate: card.duplicate,
			delete: card.delete,
		});

		mainDiv.appendChild(navControls.element);

		var nothingHereLabel = createLabelElement({
			icon: "sprite",
			style: "bitsy-label-style-button",
			text: "there's nothing here yet!",
			description: "bitsycat says: there's nothing here - try clicking the add button! :)"
		});
		nothingHereLabel.classList.add("bitsy-card-nothing-show");

		mainDiv.appendChild(nothingHereLabel);

		card.nav = navControls;
	}

	var cardCanvas = null;
	if (card.disableCanvas != true) {
		cardCanvas = document.createElement("canvas");
		cardCanvas.classList.add("bitsy-card-nothing-hide");
		cardCanvas.width = 512;
		cardCanvas.height = 512;

		card.system._attachCanvas(cardCanvas);

		mainDiv.appendChild(cardCanvas);
	}

	var menuDiv = document.createElement("div");
	menuDiv.classList.add("bitsy-menu");
	menuDiv.classList.add("bitsy-card-nothing-hide");
	mainDiv.appendChild(menuDiv);

	// for now: automatically create main menu toggle and add card to editor
	document.getElementById("editorContent").appendChild(cardDiv);

	document.getElementById("toolsPanel")
		.insertBefore(
			createToggleElement({
				icon: card.icon,
				text: card.name(),
				id: card.id + "Check",
				value: card.id + "Panel",
				style: "bitsy-tool-toggle",
				checked: true,
				onclick: function(e) {
					togglePanelAnimated(e);
				},
			}),
			document.getElementById(card.insertBefore));

	// todo : feels like kind of a disorganized structure right now..
	card.rootElement = cardDiv;
	card.mainElement = mainDiv;
	card.titlebarElement = titlebarDiv;
	card.canvasElement = cardCanvas;
	card.menuElement = menuDiv;
	card.mouseState = {
		hover: false,
		down: false,
		x: 0,
		y: 0,
		altKey: false
	};
	card.show = function(nextToId) {
		showPanel(cardDiv.id, nextToId);
	};

	if (navControls) {
		card.select = navControls.select;
		card.selectAtIndex = navControls.selectAtIndex;
		card.getSelected = navControls.getSelected;
	}

	if (card.worldData) {
		// is just attaching to the card object ok??
		card.world = parseWorld(Resources[card.worldData]);
		card.renderer = new TileRenderer(card.id);
		card.renderer.SetDrawings(card.world.drawings);
	}

	function onMouseDown(e) {
		enableGlobalAudioContext();
		e.preventDefault();
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		card.mouseState.x = Math.floor( off.x / (scale) );
		card.mouseState.y = Math.floor( off.y / (scale) );
		card.mouseState.altKey = e.altKey;
		card.mouseState.down = true;
		card.mouseState.hover = true;
	}

	function onMouseUp(e) {
		e.preventDefault();
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		card.mouseState.x = Math.floor( off.x / (scale) );
		card.mouseState.y = Math.floor( off.y / (scale) );
		card.mouseState.altKey = e.altKey;
		card.mouseState.down = false;
		card.mouseState.hover = false;
		card.menu.update();
	};

	function onMouseMove(e) {
		e.preventDefault();
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		card.mouseState.x = Math.floor( off.x / (scale) );
		card.mouseState.y = Math.floor( off.y / (scale) );
		card.mouseState.altKey = e.altKey;
	};

	function onTouchStart(e) {
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		onMouseDown(e);
	}

	function onTouchEnd(e) {
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = 0;
		e.clientY = 0;
		onMouseUp(e);
	}

	function onTouchMove(e) {
		e.preventDefault();
		// update event to translate from touch-style to mouse-style structure
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		onMouseMove(e);
	}

	if (card.canvasElement != null) {
		card.canvasElement.onmousedown = onMouseDown;
		card.canvasElement.onmouseup = onMouseUp;
		card.canvasElement.onmousemove = onMouseMove;

		card.canvasElement.onmouseenter = function(e) {
			card.mouseState.hover = true;
		};

		card.canvasElement.onmouseleave = function(e) {
			card.mouseState.hover = false;
			card.canvasElement.onmouseup(e);
		};

		card.canvasElement.addEventListener('touchstart', onTouchStart, { passive: false });
		card.canvasElement.addEventListener('touchmove', onTouchMove, { passive: false });
		card.canvasElement.addEventListener('touchend', onTouchEnd, { passive: false });		
	}

	// hacky way to respond to changes outside the tool??
	events.Listen("paint_edit", function() {
		if (card.onGameDataChange) {
			card.onGameDataChange();
		}
	});

	card.mouse = new MouseInterface(card);

	if (card.selectAtIndex) {
		card.selectAtIndex(0);
	}

	card.system._startNoInput();

	// initialize the menu
	card.menu.update();

	return card;
}

function createNavControls(options) {
	// note : is the split between responsibilities of the tool and the category good?
	var category = findTool.getCategory(options.data);
	var selectedId = category.getIdList()[0];

	var navDiv = document.createElement("div");
	navDiv.classList.add("navControl");

	var nameInput = createTextInputElement({
		placeholder : category.getItemDescription(selectedId),
		value : category.getItemName(selectedId),
		onchange : function(e) {
			if (e.target.value.length > 0) {
				category.setItemName(selectedId, e.target.value);
			}
			else {
				category.setItemName(selectedId, null);
			}

			refreshGameData();
		},
	});
	navDiv.appendChild(nameInput);

	function getCurIndex() {
		var idList = category.getIdList();
		return idList.indexOf(selectedId);
	}

	function selectAtIndex(index) {
		var idList = category.getIdList();
		if (idList.length <= 0) {
			options.parentElement.classList.add("bitsy-card-nothing");
			nameInput.value = "";
			nameInput.placeholder = "";
			nameInput.disabled = true;
			prevButton.disabled = true;
			nextButton.disabled = true;
			copyButton.disabled = true;
			deleteButton.disabled = true;
			findButton.disabled = true;
			return;
		}

		if (options.parentElement.classList.contains("bitsy-card-nothing")) {
			// un-disable everything
			options.parentElement.classList.remove("bitsy-card-nothing");
			nameInput.disabled = false;
			prevButton.disabled = false;
			nextButton.disabled = false;
			copyButton.disabled = false;
			deleteButton.disabled = false;
			findButton.disabled = false;
		}

		if (index >= idList.length) {
			index = 0;
		}
		else if (index < 0) {
			index = idList.length - 1;
		}

		selectedId = idList[index];
		selectById(selectedId);
	}

	function selectById(id) {
		selectedId = id;
		nameInput.value = category.getItemName(selectedId);
		nameInput.placeholder = category.getItemDescription(selectedId);
		options.onSelect(selectedId);

		if (findTool) {
			findTool.updateSelection();
		}
	}

	var prevButton = createButtonElement({
		icon : "previous",
		description : "previous " + category.getCategoryName(),
		onclick : function() {
			selectAtIndex(getCurIndex() - 1);
		},
	});
	navDiv.appendChild(prevButton);

	var nextButton = createButtonElement({
		icon : "next",
		description : "next " + category.getCategoryName(),
		onclick : function() {
			selectAtIndex(getCurIndex() + 1);
		}
	});
	navDiv.appendChild(nextButton);

	var addButton = createButtonElement({
		icon : "add",
		description : "add " + category.getCategoryName(),
		onclick : function() {
			bitsy = options.system; // hack to use correct system
			options.add();
			refreshGameData();
			selectAtIndex(-1);
		},
	});
	navDiv.appendChild(addButton);

	var copyButton = createButtonElement({
		icon : "copy",
		description : "duplicate " + category.getCategoryName(),
		onclick : function() {
			options.duplicate(selectedId);
			refreshGameData();
			selectAtIndex(-1);
		},
	});
	navDiv.appendChild(copyButton);

	var deleteButton = createButtonElement({
		icon : "delete",
		description : "delete " + category.getCategoryName(),
		onclick : function() {
			// todo : warn about deleting last object?
			// todo : localize
			if (confirm("are you sure you want to delete this " + category.getCategoryName() + "?")) {
				var curIndex = getCurIndex();
				options.delete(selectedId);
				refreshGameData();
				selectAtIndex(curIndex);
			}
		},
	});
	navDiv.appendChild(deleteButton);

	var findButton = createButtonElement({
		icon : "search",
		description : "open find tool: " + category.getCategoryName(),
		onclick : function() {
			openFindTool(options.data, options.cardDivId);
		},
	});
	navDiv.appendChild(findButton);

	// selectAtIndex(0);

	return {
		element: navDiv,
		select: selectById,
		selectAtIndex: selectAtIndex,
		getSelected: function() {
			return selectedId;
		}
	};
}