// TODO : name?
function DialogTool() {
	this.CreateEditor = function(dialogId) {
		return new DialogScriptEditor(dialogId);
	}

	this.CreatePlaintextEditor = function(dialogId, style) {
		return new PlaintextDialogScriptEditor(dialogId, style);
	}

	// todo : name?
	this.CreateWidget = function(label, parentPanelId, dialogId, allowNone, onChange, creationOptions) {
		return new DialogWidget(label, parentPanelId, dialogId, allowNone, onChange, creationOptions);
	}

	this.CreateTitleWidget = function() {
		return new TitleWidget();
	}

	/* TitleWidget TODO
	- gameTextDir class
	- empty title mode
	- get rid of the duplicate preview and text input and just make the input readonly
	*/
	function TitleWidget() {
		var isMultiline = false;

		// is it bad to share the id counter with the other editors?
		var editorId = dialogScriptEditorUniqueIdCounter;
		dialogScriptEditorUniqueIdCounter++;

		var div = document.createElement("div");
		div.classList.add("titleWidget");

		var titleTextInput = document.createElement("input");
		titleTextInput.classList.add("textInputField");
		titleTextInput.type = "text";
		titleTextInput.placeholder = localization.GetStringOrFallback("title_placeholder", "Title");
		div.appendChild(titleTextInput);

		var openButton = document.createElement("button");
		openButton.classList.add("titleOpenDialog");
		openButton.title = "open title in dialog editor"; // todo : localize
		openButton.appendChild(iconUtils.CreateIcon("open_tool"));
		openButton.onclick = function() {
			openDialogTool(titleDialogId);
			alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked = false;
		}
		div.appendChild(openButton);

		function updateWidgetContent() {
			var titleLines = getTitle().split("\n");
			isMultiline = titleLines.length > 1;
			titleTextInput.value = (isMultiline ? titleLines[1] + "..." : titleLines[0]);
			titleTextInput.readOnly = isMultiline;
			openButton.style.display = isMultiline ? "flex" : "none";
		}

		titleTextInput.onchange = function() {
			setTitle(titleTextInput.value);
			refreshGameData();
			events.Raise("dialog_update", { dialogId:titleDialogId, editorId:editorId });
		}

		titleTextInput.onfocus = function() {
			if (!isMultiline) {
				openButton.style.display = "flex";
			}
		}

		titleTextInput.onblur = function() {
			if (!isMultiline) {
				setTimeout(function() {
					openButton.style.display = "none";
				}, 300); // the timeout is a hack to allow clicking the open button
			}
		}

		events.Listen("dialog_update", function(event) {
			if (event.dialogId === titleDialogId && event.editorId != editorId) {
				updateWidgetContent();
			}
		});

		events.Listen("game_data_change", function(event) {
			updateWidgetContent(); // TODO : only do this if the text actually changes?
		});

		updateWidgetContent();

		this.GetElement = function() {
			return div;
		}
	}

	// find (non-inline) non-dialog code in a script
	function FindCodeVisitor() {
		var foundCode = false;
		this.FoundCode = function() {
			return foundCode;
		}

		this.Visit = function(node) {
			if (node.type === "code_block" && !scriptUtils.IsInlineCode(node)) {
				foundCode = true;
			}
		}
	}

	// TODO : label should be label localization id
	function DialogWidget(label, parentPanelId, dialogId, allowNone, onChange, creationOptions) {
		var listener = new EventListener(events);

		// treat deleted dialogs as non-existent ones
		if (!dialog.hasOwnProperty(dialogId)) {
			dialogId = null;
		}

		function DoesDialogExist() {
			return dialogId != undefined && dialogId != null && dialog.hasOwnProperty(dialogId);
		}

		var showSettings = false;

		var div = document.createElement("div");
		div.classList.add("controlBox");

		var controlDiv = document.createElement("div");
		controlDiv.style.display = "flex"; // todo : style
		div.appendChild(controlDiv);

		var labelSpan = document.createElement("span");
		labelSpan.style.flexGrow = 1;
		labelSpan.innerHTML = iconUtils.CreateIcon("dialog").outerHTML + ' ' + label;
		controlDiv.appendChild(labelSpan);

		var settingsButton = document.createElement("button");
		settingsButton.appendChild(iconUtils.CreateIcon("settings"));
		controlDiv.appendChild(settingsButton);

		var openButton = document.createElement("button");
		openButton.title = "open in dialog editor"; // todo : localize
		openButton.appendChild(iconUtils.CreateIcon("open_tool"));
		openButton.onclick = function() {
			// create an empty dialog if none exists to open in the editor
			if (!DoesDialogExist()) {
				// todo : there's a lot of duplicate code in this widget for different dialog creation workflows
				var id = nextAvailableDialogId();
				dialog[id] = {
					src: "",
					name: creationOptions && creationOptions.GetDefaultName ? creationOptions.GetDefaultName() : null,
				};
				ChangeSelectedDialog(id);
				events.Raise("new_dialog", {id:id});
			}

			openDialogTool(dialogId, parentPanelId);

			// hacky global state!
			if (dialog[getCurDialogId()] && dialogId != getCurDialogId()) {
				// disable always on mode when you open up exit or ending dialog!
				alwaysShowDrawingDialog = document.getElementById("dialogAlwaysShowDrawingCheck").checked = false;
			}
		};
		controlDiv.appendChild(openButton);

		var editorDiv = document.createElement("div");
		var scriptEditor;
		function UpdateEditorContent(shouldOpenDialogToolIfComplex) {
			editorDiv.innerHTML = "";

			if (DoesDialogExist() || (creationOptions && creationOptions.CreateFromEmptyTextBox)) {
				if (scriptEditor) {
					scriptEditor.OnDestroy();
					scriptEditor = null;
				}

				var defaultDialogNameFunc = creationOptions && creationOptions.GetDefaultName ? creationOptions.GetDefaultName : null;
				scriptEditor = new PlaintextDialogScriptEditor(dialogId, "miniDialogPlaintextArea", defaultDialogNameFunc);
				editorDiv.appendChild(scriptEditor.GetElement());

				CheckForComplexCodeInDialog(shouldOpenDialogToolIfComplex);
			}
			else if (creationOptions && creationOptions.Presets) {
				function CreatePresetHandler(scriptStr, getDefaultNameFunc) {
					return function() {
						dialogId = nextAvailableDialogId();
						dialog[dialogId] = {
							src: scriptStr,
							name: (getDefaultNameFunc ? getDefaultNameFunc() : null),
						}; // TODO: I really need a standard way to init dialogs now!
						events.Raise("new_dialog", {id:dialogId});
						// TODO replace OnCreateNewDialog with OnCHange!!!!
						if (creationOptions.OnCreateNewDialog) {
							creationOptions.OnCreateNewDialog(dialogId);
						}
						UpdateEditorContent(true);
					}
				}

				for (var i = 0; i < creationOptions.Presets.length; i++) {
					var preset = creationOptions.Presets[i];
					var presetButton = document.createElement("button");
					presetButton.style.flexGrow = 1; // TODO : style?
					presetButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + preset.Name;
					presetButton.onclick = CreatePresetHandler(preset.Script, preset.GetDefaultName);
					editorDiv.appendChild(presetButton);
				}
			}
		}

		editorDiv.style.display = "flex";
		editorDiv.style.marginTop = "5px";
		div.appendChild(editorDiv);

		function ChangeSelectedDialog(id) {
			dialogId = id;
			UpdateEditorContent();
			if (onChange != null) {
				onChange(dialogId);
			}
			refreshGameData();
		}

		var dialogIdSelect = document.createElement("select");
		dialogIdSelect.style.display = "none";
		dialogIdSelect.onchange = function(e) {
			ChangeSelectedDialog(e.target.value === "none" ? null : e.target.value);
		}
		div.appendChild(dialogIdSelect);

		function UpdateDialogIdSelectOptions() {
			dialogIdSelect.innerHTML = "";
			var dialogIdList = sortedDialogIdList();
			if (allowNone) {
				var dialogNoneOption = document.createElement("option");
				dialogNoneOption.innerText = "none";
				dialogNoneOption.value = "none";
				dialogNoneOption.selected = dialogId === null;
				dialogIdSelect.appendChild(dialogNoneOption);
			}
			for (var i = 0; i < dialogIdList.length; i++) {
				var dialogIdOption = document.createElement("option");
				if (dialog[dialogIdList[i]].name != null) {
					dialogIdOption.innerText = dialog[dialogIdList[i]].name;
				}
				else {
					dialogIdOption.innerText = localization.GetStringOrFallback("dialog_block_basic", "dialog") + " " + dialogIdList[i];
				}
				dialogIdOption.value = dialogIdList[i];
				dialogIdOption.selected = dialogId === dialogIdList[i];
				dialogIdSelect.appendChild(dialogIdOption);
			}
		}

		UpdateDialogIdSelectOptions();
		UpdateEditorContent();
		
		listener.Listen("new_dialog", function() { UpdateDialogIdSelectOptions(); });
		listener.Listen("dialog_update", function(event) {
			if (dialogId === event.dialogId && !DoesDialogExist()) {
				ChangeSelectedDialog(null);
				UpdateDialogIdSelectOptions();
			}

			if (scriptEditor != null && event.editorId == scriptEditor.GetEditorId()) {
				if (dialogId != event.dialogId) {
					dialogId = event.dialogId;
					if (creationOptions.OnCreateNewDialog) {
						creationOptions.OnCreateNewDialog(dialogId);
					}
				}
			}
			else if (scriptEditor != null && event.editorId != scriptEditor.GetEditorId()) {
				// if we get an update from a linked editor saying this dialog
				// is now complex, switch to the select view
				if (DoesDialogExist() && dialogId === event.dialogId) {
					CheckForComplexCodeInDialog();
				}
			}
		})

		function ChangeSettingsVisibility(visible) {
			showSettings = visible;
			settingsButton.innerHTML = iconUtils.CreateIcon(showSettings ? "text_edit" : "settings").outerHTML;
			editorDiv.style.display = showSettings ? "none" : "flex";
			dialogIdSelect.style.display = showSettings ? "flex" : "none";
		}

		settingsButton.onclick = function() {
			ChangeSettingsVisibility(!showSettings);
		}

		function CheckForComplexCodeInDialog(shouldOpenIfComplex) {
			var codeVisitor = new FindCodeVisitor();
			scriptEditor.GetNode().VisitAll(codeVisitor);
			if (codeVisitor.FoundCode()) {
				ChangeSettingsVisibility(true);

				// kind of a werid pattern to use
				if (shouldOpenIfComplex != undefined && shouldOpenIfComplex != null && shouldOpenIfComplex == true) {
					openDialogTool(dialogId, parentPanelId)
				}
			}
		}

		this.GetElement = function() {
			return div;
		}

		this.OnDestroy = function() {
			if (scriptEditor) {
				scriptEditor.OnDestroy();
				delete scriptEditor;
			}
			listener.UnlistenAll();
		}
	}

	var dialogScriptEditorUniqueIdCounter = 0;

	function PlaintextDialogScriptEditor(dialogId, style, defaultDialogNameFunc) {
		var listener = new EventListener(events);

		if (defaultDialogNameFunc === undefined) {
			defaultDialogNameFunc = null; // just to be safe
		}

		function DoesDialogExist() {
			return dialogId != undefined && dialogId != null && dialog.hasOwnProperty(dialogId);
		}

		var editorId = dialogScriptEditorUniqueIdCounter;
		dialogScriptEditorUniqueIdCounter++;

		var scriptRootNode, div;
		div = document.createElement("div");
		div.style.width = "100%"; // hack

		var self = this;

		function RefreshEditorUI() {
			var dialogStr = !DoesDialogExist() ? "" : dialog[dialogId].src;

			div.innerHTML = "";
			scriptRootNode = scriptInterpreter.Parse(dialogStr, dialogId);

			var dialogBoxContainer = document.createElement("div");
			dialogBoxContainer.classList.add("dialogBoxContainer");
			div.appendChild(dialogBoxContainer);

			var codeTextArea = document.createElement("textarea");
			codeTextArea.rows = 2;
			codeTextArea.classList.add(style);
			codeTextArea.value = scriptRootNode.Serialize();
			function OnTextChangeHandler() {
				var dialogStr = '"""\n' + codeTextArea.value + '\n"""'; // single lines?
				scriptRootNode = scriptInterpreter.Parse(dialogStr, dialogId);

				// useful debug messages when parsing is broken:
				// scriptInterpreter.DebugVisualizeScriptTree(scriptRootNode);
				// bitsyLog(dialogStr, "editor");
				// bitsyLog(scriptRootNode.Serialize(), "editor");

				OnUpdate();
			}
			codeTextArea.onchange = OnTextChangeHandler;
			codeTextArea.onkeyup = OnTextChangeHandler;
			codeTextArea.onblur = OnTextChangeHandler;
			dialogBoxContainer.appendChild(codeTextArea);
		}

		RefreshEditorUI();

		this.GetElement = function() {
			return div;
		}

		this.GetNode = function() {
			return scriptRootNode;
		}

		function OnUpdate() {
			var dialogStr = scriptRootNode.Serialize();

			var didMakeNewDialog = false;
			if (dialogStr.length > 0 && !DoesDialogExist()) {
				dialogId = nextAvailableDialogId();
				dialog[dialogId] = { src: "", name: defaultDialogNameFunc ? defaultDialogNameFunc() : null }; // init new dialog
				didMakeNewDialog = true;
			}

			if (!DoesDialogExist()) {
				return;
			}

			if (dialogStr.indexOf("\n") > -1) {
				// hacky - expose the triple-quotes symbol somewhere?
				dialogStr = '"""\n' + dialogStr + '\n"""';
			}

			dialog[dialogId].src = dialogStr;

			refreshGameData();

			events.Raise("dialog_update", { dialogId:dialogId, editorId:editorId });
			if (didMakeNewDialog) {
				events.Raise("new_dialog", {id:dialogId});
			}
		}

		listener.Listen("dialog_update", function(event) {
			if (DoesDialogExist() && event.dialogId === dialogId && event.editorId != editorId) {
				RefreshEditorUI();
			}
		});

		this.GetEditorId = function() {
			return editorId;
		}

		this.OnDestroy = function() {
			listener.UnlistenAll();
		}
	}

	function DialogScriptEditor(dialogId) {
		var listener = new EventListener(events);

		var editorId = dialogScriptEditorUniqueIdCounter;
		dialogScriptEditorUniqueIdCounter++;

		var scriptRootNode, div, rootEditor;
		div = document.createElement("div");

		var self = this;

		var viewportDiv;
		var expressionBuilderDiv;

		function RefreshEditorUI() {
			var dialogStr = dialog[dialogId].src;

			div.innerHTML = "";
			scriptRootNode = scriptInterpreter.Parse(dialogStr, dialogId);
			rootEditor = new BlockEditor(scriptRootNode, self);

			viewportDiv = document.createElement("div");
			viewportDiv.classList.add("dialogContentViewport");
			// always selected so we can add actions to the root
			viewportDiv.classList.add("selectedEditor");
			viewportDiv.onclick = function() {
				// a hack to allow you to not have anything selected
				// if you click the background of the script editor
				// global curSelectedEditor is still a bit hacky :/
				if (curSelectedEditor != null) {
					curSelectedEditor.Deselect();
					curSelectedEditor = null;
				}
			}

			viewportDiv.appendChild(rootEditor.GetElement());
			div.appendChild(viewportDiv);

			expressionBuilderDiv = document.createElement("div");
			expressionBuilderDiv.classList.add("dialogExpressionBuilderHolder");
			expressionBuilderDiv.style.display = "none";
			div.appendChild(expressionBuilderDiv);
		}

		RefreshEditorUI();

		this.GetElement = function() {
			return div;
		}

		this.GetNode = function() {
			return scriptRootNode;
		}

		function OnUpdate() {
			// scriptInterpreter.DebugVisualizeScriptTree(scriptRootNode);

			var dialogStr = rootEditor.Serialize();

			if (dialogStr.indexOf("\n") > -1) {
				// hacky - expose the triple-quotes symbol somewhere?
				dialogStr = '"""\n' + dialogStr + '\n"""';
			}

			dialog[dialogId].src = dialogStr;

			refreshGameData();

			events.Raise("dialog_update", { dialogId:dialogId, editorId:editorId });
		}

		this.NotifyUpdate = function() {
			OnUpdate();
		}

		// I have to say having to put this EVERYWHERE will be annoying (oh well)
		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			var expressionBuilder = new ExpressionBuilder(
				expressionString,
				self, // is self the right parentEditor?
				function() { // cancel
					expressionBuilderDiv.style.display = "none";
					viewportDiv.style.display = "block";
				},
				function(expressionNode) { // accept
					bitsyLog(expressionNode.Serialize(), "editor");
					expressionBuilderDiv.style.display = "none";
					viewportDiv.style.display = "block";
					onAcceptHandler(expressionNode);
				});

			expressionBuilderDiv.innerHTML = "";
			expressionBuilderDiv.appendChild(expressionBuilder.GetElement());

			expressionBuilderDiv.style.display = "block";
			viewportDiv.style.display = "none";
		}

		listener.Listen("dialog_update", function(event) {
			if (event.dialogId === dialogId && event.editorId != editorId) {
				RefreshEditorUI();
			}
		});

		/* root level creation functions for the dialog editor top-bar UI */
		this.AddDialog = function() {
			var printFunc = scriptUtils.CreateEmptySayFunc();
			rootEditor.GetNodes()[0].AddChild(printFunc); // hacky -- see note in action builder
			var editor = new DialogTextEditor([printFunc], rootEditor);
			rootEditor.AppendChild(editor);
			OnUpdate();
		}

		this.AddSequence = function() {
			var node = scriptUtils.CreateSequenceBlock();
			var editor = new SequenceEditor(node, rootEditor);
			rootEditor.AppendChild(editor);
			OnUpdate();
		}

		this.AddCycle = function() {
			var node = scriptUtils.CreateCycleBlock();
			var editor = new SequenceEditor(node, rootEditor);
			rootEditor.AppendChild(editor);
			OnUpdate();
		}

		this.AddShuffle = function() {
			var node = scriptUtils.CreateShuffleBlock();
			var editor = new SequenceEditor(node, rootEditor);
			rootEditor.AppendChild(editor);
			OnUpdate();
		}

		this.AddConditional = function() {
			var node = scriptUtils.CreateIfBlock();
			var editor = new ConditionalEditor(node, rootEditor);
			rootEditor.AppendChild(editor);
			OnUpdate();
		}

		// I only listen to these events at the root of the script editor
		// since that makes it easier to clean them up when the editor
		// is destroyed and avoid leaking memory
		listener.Listen("script_node_enter", function(event) {
			if (rootEditor && rootEditor.OnNodeEnter) {
				rootEditor.OnNodeEnter(event);
			}
		});

		listener.Listen("script_node_exit", function(event) {
			if (rootEditor && rootEditor.OnNodeExit) {
				rootEditor.OnNodeExit(event);
			}
		});

		// we need to remove all the animations when we enter edit mode
		// regardless of whether we stopped the script mid-execution
		listener.Listen("on_edit_mode", function(event) {
			if (rootEditor && rootEditor.OnNodeExit) {
				rootEditor.OnNodeExit({id:null, forceClear:true});
			}
		});

		this.OnDestroy = function() {
			listener.UnlistenAll();
		}
	}

	function BlockEditor(blockNode, parentEditor) {
		var self = this;

		var div = document.createElement("div");
		div.classList.add("blockEditor");

		var childEditorRootDiv = document.createElement("div");
		div.appendChild(childEditorRootDiv);

		var actionBuilder = new ActionBuilder(this);
		div.appendChild(actionBuilder.GetElement());

		this.GetElement = function() {
			return div;
		}

		this.NotifyUpdate = function(hasNewChildren) {
			if (hasNewChildren) {
				UpdateNodeChildren();
			}

			parentEditor.NotifyUpdate();
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
		}

		var childEditors = [];
		function CreateChildEditors() {
			// build the editors
			childEditors = [];

			function isCodeBlock(node) { return node.type === "code_block"; };
			function isChildType(node,type) { return node.children[0].type === type; };
			function isIf(node) { return isCodeBlock(node) && isChildType(node,"if") && !node.children[0].IsSingleLine(); };
			function isSeq(node) { return isCodeBlock(node) && (isChildType(node,"sequence") || isChildType(node,"cycle") || isChildType(node,"shuffle")); };

			function isDescribedFunction(node) {
				return isCodeBlock(node) && isChildType(node, "function") && functionDescriptionMap[node.children[0].name] != undefined;
			}

			function isExpression(node) {
				return isCodeBlock(node) && (isChildType(node, "operator") || isChildType(node, "literal") || isChildType(node, "variable"));
			};

			var dialogNodeList = [];
			function addText() {
				if (dialogNodeList.length > 0) {
					var editor = new DialogTextEditor(dialogNodeList, self);
					childEditors.push(editor);

					dialogNodeList = [];
				}
			}

			for (var i = 0; i < blockNode.children.length; i++) {
				var node = blockNode.children[i];
				if (isIf(node)) {
					addText();

					var editor = new ConditionalEditor(node, self);
					childEditors.push(editor);
				}
				else if (isSeq(node)) {
					addText();

					var editor = new SequenceEditor(node, self);
					childEditors.push(editor);
				}
				else if (isDescribedFunction(node)) {
					addText();

					var editor = new FunctionEditor(node, self);
					childEditors.push(editor);
				}
				else if (isExpression(node)) {
					addText();

					var editor = new ExpressionEditor(node, self);
					childEditors.push(editor);
				}
				else {
					dialogNodeList.push(node);
				}
			}

			addText();
		}

		function RefreshChildUI() {
			childEditorRootDiv.innerHTML = "";

			for (var i = 0; i < childEditors.length; i++) {
				var editor = childEditors[i];
				childEditorRootDiv.appendChild(editor.GetElement());

				if (i < childEditors.length - 1) {
					var arrowHolder = document.createElement("div");
					arrowHolder.style.textAlign = "center";
					childEditorRootDiv.appendChild(arrowHolder);

					var svgArrow = document.createElement("img");
					svgArrow.src = "image/down_arrow.svg";
					svgArrow.style.margin = "5px";
					svgArrow.style.width = "20px";
					arrowHolder.appendChild(svgArrow);
				}
			}
		}

		function UpdateNodeChildren() {
			var updatedChildren = [];

			for (var i = 0; i < childEditors.length; i++) {
				var editor = childEditors[i];
				updatedChildren = updatedChildren.concat(editor.GetNodes());
			}

			blockNode.SetChildren(updatedChildren);
		}

		this.GetNodes = function() {
			return [blockNode];
		}

		this.Serialize = function() {
			return blockNode.Serialize();
		}

		this.RemoveChild = function(childEditor) {
			childEditors.splice(childEditors.indexOf(childEditor),1);
			RefreshChildUI();

			UpdateNodeChildren();

			parentEditor.NotifyUpdate();
		}

		this.IndexOfChild = function(childEditor) {
			return childEditors.indexOf(childEditor);
		}

		this.InsertChild = function(childEditor, index) {
			childEditors.splice(index, 0, childEditor);
			RefreshChildUI();

			UpdateNodeChildren();

			parentEditor.NotifyUpdate();
		}

		this.AppendChild = function(childEditor) {
			self.InsertChild(childEditor, childEditors.length);
		}

		this.ChildCount = function() {
			return childEditors.length;
		}

		this.OnNodeEnter = function(event) {
			for (var i = 0; i < childEditors.length; i++) {
				if (childEditors[i].OnNodeEnter) {
					childEditors[i].OnNodeEnter(event);
				}
			}
		}

		this.OnNodeExit = function(event) {
			for (var i = 0; i < childEditors.length; i++) {
				if (childEditors[i].OnNodeExit) {
					childEditors[i].OnNodeExit(event);
				}
			}
		}

		CreateChildEditors();
		RefreshChildUI();
	}

	function ActionBuilder(parentEditor) {
		var div = document.createElement("div");
		div.classList.add("actionBuilder");

		var addButton = document.createElement("button");
		addButton.classList.add("actionBuilderAdd");
		addButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("action_add_new", "add");
		addButton.onclick = function() {
			div.classList.add("actionBuilderActive");
			div.classList.add("actionBuilderRoot");
		}
		div.appendChild(addButton);

		var backButton = document.createElement("button");
		backButton.classList.add("actionBuilderButton");
		backButton.classList.add("actionBuilderButton_back");
		backButton.innerHTML = iconUtils.CreateIcon("previous").outerHTML + " "
			+ localization.GetStringOrFallback("action_back", "back");
		backButton.onclick = function() {
			div.classList.add("actionBuilderRoot");
			div.classList.remove(activeCategoryClass);
			activeCategoryClass = null;
		}
		div.appendChild(backButton);

		var activeCategoryClass = null;
		function makeActionCategoryButton(categoryName, text) {
			var actionCategoryButton = document.createElement("button");
			actionCategoryButton.classList.add("actionBuilderButton");
			actionCategoryButton.classList.add("actionBuilderCategory");
			actionCategoryButton.innerHTML = text + iconUtils.CreateIcon("next").outerHTML;
			actionCategoryButton.onclick = function() {
				div.classList.remove("actionBuilderRoot");
				activeCategoryClass = "actionBuilder_" + categoryName;
				div.classList.add(activeCategoryClass);
			}
			return actionCategoryButton;
		}

		div.appendChild(makeActionCategoryButton(
			"dialog",
			localization.GetStringOrFallback("dialog_action_category_dialog", "dialog")));
		div.appendChild(makeActionCategoryButton(
			"flow",
			localization.GetStringOrFallback("dialog_action_category_list", "lists")));
		div.appendChild(makeActionCategoryButton(
			"exit",
			"room actions")); // todo : re-localize
			//localization.GetStringOrFallback("dialog_action_category_exit", "exit and ending actions")));
		div.appendChild(makeActionCategoryButton("sound", "sound actions")); // todo : localize
		div.appendChild(makeActionCategoryButton(
			"item",
			localization.GetStringOrFallback("dialog_action_category_item", "item and variable actions")));

		function makeActionBuilderButton(categoryName, text, createEditorFunc) {
			var actionBuilderButton = document.createElement("button");
			actionBuilderButton.classList.add("actionBuilderButton");
			actionBuilderButton.classList.add("actionBuilderButton_" + categoryName);
			actionBuilderButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " " + text;
			actionBuilderButton.onclick = function() {
				var editor = createEditorFunc();
				parentEditor.AppendChild(editor);
				div.classList.remove("actionBuilderActive");
				div.classList.remove(activeCategoryClass);
				activeCategoryClass = null;
			}
			return actionBuilderButton;
		}

		// TODO : localize these too! *** START FROM HERE ***
		// dialog
		div.appendChild(
			makeActionBuilderButton(
				"dialog",
				localization.GetStringOrFallback("dialog_block_basic", "dialog"),
				function() {
					var printFunc = scriptUtils.CreateEmptySayFunc();

					// hacky access of the parent node is required
					// because the print function needs to start with a parent
					// otherwise the dialog editor can't serialize the text D:
					parentEditor.GetNodes()[0].AddChild(printFunc);

					var editor = new DialogTextEditor([printFunc], parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"dialog",
				localization.GetStringOrFallback("function_pg_name", "pagebreak"),
				function() {
					var node = scriptUtils.CreateFunctionBlock("pg", []);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		// lists
		div.appendChild(
			makeActionBuilderButton(
				"flow",
				localization.GetStringOrFallback("sequence_list_name", "sequence list"),
				function() {
					var node = scriptUtils.CreateSequenceBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"flow",
				localization.GetStringOrFallback("cycle_list_name", "cycle list"),
				function() {
					var node = scriptUtils.CreateCycleBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"flow",
				localization.GetStringOrFallback("shuffle_list_name", "shuffle list"),
				function() {
					var node = scriptUtils.CreateShuffleBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"flow",
				localization.GetStringOrFallback("branching_list_name", "branching list"),
				function() {
					var node = scriptUtils.CreateIfBlock();
					var editor = new ConditionalEditor(node, parentEditor);
					return editor;
				}));

		// room actions
		div.appendChild(
			makeActionBuilderButton(
				"exit",
				localization.GetStringOrFallback("function_exit_name", "exit"),
				function() {
					var node = scriptUtils.CreateFunctionBlock("exit", ["0", 0, 0]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"exit",
				localization.GetStringOrFallback("function_end_name", "end"),
				function() {
					var node = scriptUtils.CreateFunctionBlock("end", []);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"exit",
				localization.GetStringOrFallback("dialog_action_locked_set", "lock / unlock"),
				function() {
					var node = scriptUtils.CreatePropertyNode("locked", true);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"exit",
				"palette",
				function() {
					var node = scriptUtils.CreateFunctionBlock("pal", ["0"]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"exit",
				"avatar",
				function() {
					var node = scriptUtils.CreateFunctionBlock("ava", ["a"]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		// sound actions
		div.appendChild(
			makeActionBuilderButton(
				"sound",
				"blip",
				function() {
					var node = scriptUtils.CreateFunctionBlock("blip", ["1"]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"sound",
				"tune",
				function() {
					var node = scriptUtils.CreateFunctionBlock("tune", ["1"]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				localization.GetStringOrFallback("dialog_action_item_set", "set item count"),
				function() {
					var node = scriptUtils.CreateFunctionBlock("item", ["0", 10]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				localization.GetStringOrFallback("dialog_action_item_increase", "increase item count"),
				function() {
					var expressionNode = scriptInterpreter.CreateExpression('{item "0"} + 1');
					var codeBlock = scriptUtils.CreateCodeBlock();
					codeBlock.children.push(expressionNode);
					var node = scriptUtils.CreateFunctionBlock("item", ["0"]);
					node.children[0].args.push(codeBlock); // hacky
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				localization.GetStringOrFallback("dialog_action_item_decrease", "decrease item count"),
				function() {
					var expressionNode = scriptInterpreter.CreateExpression('{item "0"} - 1');
					var codeBlock = scriptUtils.CreateCodeBlock();
					codeBlock.children.push(expressionNode);
					var node = scriptUtils.CreateFunctionBlock("item", ["0"]);
					node.children[0].args.push(codeBlock); // hacky
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				"say item count", // todo : localize
				function() {
					var node = scriptUtils.CreateFunctionBlock("say", []);
					node.children[0].args.push(scriptUtils.CreateFunctionBlock("item", ["0"])); // hacky
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				localization.GetStringOrFallback("dialog_action_variable_set", "set variable value"),
				function() {
					var expressionNode = scriptInterpreter.CreateExpression("a = 5");
					var node = scriptUtils.CreateCodeBlock();
					node.children.push(expressionNode);
					var editor = new ExpressionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				localization.GetStringOrFallback("dialog_action_variable_change", "change variable value"),
				function() {
					var expressionNode = scriptInterpreter.CreateExpression("a = a + 1");
					var node = scriptUtils.CreateCodeBlock();
					node.children.push(expressionNode);
					var editor = new ExpressionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				"say variable value", // todo : localize
				function() {
					var node = scriptUtils.CreateFunctionBlock("say", []);
					node.children[0].args.push(scriptInterpreter.CreateExpression("a")); // hacky
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		var cancelButton = document.createElement("button");
		cancelButton.classList.add("actionBuilderButton");
		cancelButton.classList.add("actionBuilderCancel");
		cancelButton.innerHTML = iconUtils.CreateIcon("cancel").outerHTML + " "
			+ localization.GetStringOrFallback("action_cancel", "cancel");
		cancelButton.onclick = function() {
			div.classList.remove("actionBuilderActive");
			div.classList.remove("actionBuilderRoot");
			if (activeCategoryClass != null) {
				div.classList.remove(activeCategoryClass);
				activeCategoryClass = null;
			}
		}
		div.appendChild(cancelButton);

		this.GetElement = function() {
			return div;
		}
	}

	var useExperimentalTextEditor = false;

	// a bit hacky to have it as a global variable but it's nice that it remembers what you did!
	var globalShowTextEffectsControls = true;

	function DialogTextEditor(dialogNodeList, parentEditor) {
		var div = document.createElement("div");
		div.classList.add("dialogEditor");
		div.classList.add("actionEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		// var span = document.createElement("div");
		// span.innerText = "dialog";
		// div.appendChild(span);

		function OnDialogTextChange() {
			// hacky :(
			var scriptStr = '"""\n' +  textArea.value + '\n"""';
			var tempDialogNode = scriptInterpreter.Parse(scriptStr);
			dialogNodeList = tempDialogNode.children;
			parentEditor.NotifyUpdate(true);
		}

		var textSelectionChangeHandler = createOnTextSelectionChange(OnDialogTextChange);

		if (!useExperimentalTextEditor) {
			var dialogText = scriptUtils.SerializeDialogNodeList(dialogNodeList);

			var textHolderDiv = document.createElement("div");
			textHolderDiv.classList.add("dialogBoxContainer");

			var textArea = document.createElement("textarea");
			textArea.value = dialogText;

			textArea.onchange = OnDialogTextChange;
			textArea.onkeyup = OnDialogTextChange;
			textArea.onblur = OnDialogTextChange;

			textArea.rows = Math.max(2, dialogText.split("\n").length + 1);

			textArea.addEventListener('click', textSelectionChangeHandler);
			textArea.addEventListener('select', textSelectionChangeHandler);
			textArea.addEventListener('blur', textSelectionChangeHandler);

			textHolderDiv.appendChild(textArea);

			textHolderDiv.onclick = function() {
				textArea.focus(); // hijack focus into the actual textarea
			}

			div.appendChild(textHolderDiv);
		}
		else {
			var textboxContainerDiv = document.createElement("div");
			textboxContainerDiv.classList.add("dialogTextboxContainer");
			var textboxContentDiv = document.createElement("div");
			textboxContentDiv.classList.add("dialogTextboxContent");
			textboxContainerDiv.appendChild(textboxContentDiv);
			div.appendChild(textboxContainerDiv);

			// create HTML from dialog nodes
			var curLineDiv = document.createElement("div");
			curLineDiv.classList.add("textboxLine");

			var renderableTextEffects = ["clr1", "clr2", "clr3", "wvy", "shk", "rbw"];
			var curTextEffects = [];

			for (var i = 0; i < dialogNodeList.length; i++) {
				var node = dialogNodeList[i];
				if (node.type === "code_block" && node.children[0].type === "function"
					&& renderableTextEffects.indexOf(node.children[0].name) >= 0) {
					if (curTextEffects.indexOf(node.children[0].name) < 0) {
						curTextEffects.push(node.children[0].name);
					}
					else {
						curTextEffects.splice(curTextEffects.indexOf(node.children[0].name), 1);
					}
				}
				else if (node.type === "function" && node.name === "br") {
					textboxContentDiv.appendChild(curLineDiv);
					curLineDiv = document.createElement("div");
				}
				else {
					var curTextSpan = document.createElement("span");
					curTextSpan.classList.add("textboxSpan");
					curLineDiv.appendChild(curTextSpan);

					// store active effects in the span class list
					for (var j = 0; j < curTextEffects.length; j++) {
						curTextSpan.classList.add(curTextEffects[j]);
					}

					if (node.type === "code_block") {
						curTextSpan.classList.add("textboxCodeSpan");
					}

					var nextText = node.Serialize();

					for (var j = 0; j < nextText.length; j++) {
						var characterSpan = document.createElement("span");
						characterSpan.classList.add("textboxCharacterSpan");
						characterSpan.innerText = nextText[j];

						var outerSpan = characterSpan;

						// actually apply effects on a per-character basis
						for (var k = 0; k < curTextEffects.length; k++) {
							var effectWrapperSpan = document.createElement("span");
							effectWrapperSpan.classList.add("textboxCharacterSpan"); // hacky?
							effectWrapperSpan.style.animationDelay = (-0.25 * curLineDiv.innerText.length) + "s";

							if (curTextEffects[k] === "clr1") {
								var color = rgbToHex(getPal(curDefaultPal())[0][0], getPal(curDefaultPal())[0][1], getPal(curDefaultPal())[0][2]);
								effectWrapperSpan.style.color = color;
							}
							else if (curTextEffects[k] === "clr2") {
								var color = rgbToHex(getPal(curDefaultPal())[1][0], getPal(curDefaultPal())[1][1], getPal(curDefaultPal())[1][2]);
								effectWrapperSpan.style.color = color;
							}
							else if (curTextEffects[k] === "clr3") {
								var color = rgbToHex(getPal(curDefaultPal())[2][0], getPal(curDefaultPal())[2][1], getPal(curDefaultPal())[2][2]);
								effectWrapperSpan.style.color = color;
							}
							else if (curTextEffects[k] === "wvy") {
								effectWrapperSpan.classList.add("textEffectWvy");
							}
							else if (curTextEffects[k] === "shk") {
								effectWrapperSpan.classList.add("textEffectShk");
							}
							else if (curTextEffects[k] === "rbw") {
								effectWrapperSpan.classList.add("textEffectRbw");
							}

							effectWrapperSpan.appendChild(outerSpan);

							outerSpan = effectWrapperSpan;
						}

						curTextSpan.appendChild(outerSpan);
					}
				}
			}

			textboxContentDiv.appendChild(curLineDiv);
			// end HTML render

			textboxContentDiv.contentEditable = true;
			textboxContentDiv.spellcheck = false;
			textboxContentDiv.addEventListener("input", function(e) {
				bitsyLog(textboxContentDiv.innerText, "editor");
			});
		}

		// add text effects controls
		var textEffectsDiv = document.createElement("div");
		textEffectsDiv.classList.add("controlBox");
		textEffectsDiv.style.display = "none";
		textEffectsDiv.style.marginTop = "10px"; // hacky
		div.appendChild(textEffectsDiv);

		var toggleTextEffectsButton = document.createElement("button");
		toggleTextEffectsButton.appendChild(iconUtils.CreateIcon("text_effects"));
		toggleTextEffectsButton.title = "show/hide text effects controls";
		toggleTextEffectsButton.onclick = function() {
			globalShowTextEffectsControls = !globalShowTextEffectsControls;
			textEffectsDiv.style.display = globalShowTextEffectsControls ? "block" : "none";
		}
		orderControls.GetCustomControlsContainer().appendChild(toggleTextEffectsButton);

		var textEffectsTitleDiv = document.createElement("div");
		textEffectsTitleDiv.style.marginBottom = "5px";
		textEffectsTitleDiv.innerHTML = iconUtils.CreateIcon("text_effects").outerHTML + " " + localization.GetStringOrFallback("dialog_effect_new", "text effects");
		textEffectsDiv.appendChild(textEffectsTitleDiv);

		var textEffectsControlsDiv = document.createElement("div");
		textEffectsControlsDiv.style.marginBottom = "5px";
		textEffectsDiv.appendChild(textEffectsControlsDiv);

		// basic text effects
		var effectsTags = ["wvy", "shk", "rbw"];
		var effectsIcons = ["wave", "shake", "rainbow"];

		var effectsDescriptions = [
			"{wvy} text in tags waves up and down",
			"{shk} text in tags shakes constantly",
			"{rbw} text in tags is rainbow colored"
		]; // TODO : localize

		function CreateAddEffectHandler(tag) {
			return function() {
				wrapTextSelection("{" + tag + "}", "{/" + tag + "}"); // hacky to still use this?
			}
		}

		for (var i = 0; i < effectsTags.length; i++) {
			var effectButton = document.createElement("button");
			effectButton.onclick = CreateAddEffectHandler(effectsTags[i]);
			effectButton.appendChild(iconUtils.CreateIcon(effectsIcons[i]));
			effectButton.title = effectsDescriptions[i];
			textEffectsControlsDiv.appendChild(effectButton);
		}

		// todo : someday I should refactor these to use more shared menu control code
		// color text effect
		var textEffectsColorSpan = document.createElement("span");
		// hacky: should use a style for these spans
		textEffectsColorSpan.style.marginLeft = "5px";
		textEffectsColorSpan.style.display = "inline-block";
		textEffectsControlsDiv.appendChild(textEffectsColorSpan);

		var textEffectsColorButton = document.createElement("button");
		textEffectsColorButton.appendChild(iconUtils.CreateIcon("colors"));
		textEffectsColorButton.title = "{clr} use a palette color for dialog text";
		textEffectsColorSpan.appendChild(textEffectsColorButton);

		var textEffectsColorSelect = document.createElement("select");
		textEffectsColorSpan.appendChild(textEffectsColorSelect);

		var textEffectsColorBackgroundOption = document.createElement("option");
		textEffectsColorBackgroundOption.value = 0;
		textEffectsColorBackgroundOption.innerText = "ground";
		textEffectsColorBackgroundOption.title = "make text the background color (0)";
		textEffectsColorSelect.appendChild(textEffectsColorBackgroundOption);

		var textEffectsColorTileOption = document.createElement("option");
		textEffectsColorTileOption.value = 1;
		textEffectsColorTileOption.innerText = "tile";
		textEffectsColorTileOption.title = "make text the tile color (1)";
		textEffectsColorSelect.appendChild(textEffectsColorTileOption);

		var textEffectsColorSpriteOption = document.createElement("option");
		textEffectsColorSpriteOption.value = 2;
		textEffectsColorSpriteOption.innerText = "sprite";
		textEffectsColorSpriteOption.title = "make text the sprite color (2)";
		textEffectsColorSelect.appendChild(textEffectsColorSpriteOption);

		textEffectsColorButton.onclick = function(e) {
			wrapTextSelection("{clr " + textEffectsColorSelect.value + "}", "{/clr}");
		};

		// insert drawing text effect
		var textEffectsDrawingSpan = document.createElement("span");
		// hacky: should use a style for these spans
		textEffectsDrawingSpan.style.marginLeft = "5px";
		textEffectsDrawingSpan.style.display = "inline-block";
		textEffectsControlsDiv.appendChild(textEffectsDrawingSpan);

		var textEffectsDrawingButton = document.createElement("button");
		textEffectsDrawingButton.appendChild(iconUtils.CreateIcon("paint"));
		textEffectsDrawingButton.title = "{drwt}/{drws}/{drwi} draw a tile, sprite, or item in your dialog";
		textEffectsDrawingSpan.appendChild(textEffectsDrawingButton);

		var textEffectsDrawingSelect = document.createElement("select");
		textEffectsDrawingSpan.appendChild(textEffectsDrawingSelect);

		// TODO : there needs to be a shared function for these dropdowns...
		for (id in sprite) {
			var option = document.createElement("option");

			var spriteName = (id === "A" ?
				localization.GetStringOrFallback("avatar_label", "avatar") :
				localization.GetStringOrFallback("sprite_label", "sprite"))
					+ " " + id;

			if (sprite[id].name) {
				spriteName = sprite[id].name;
			}

			option.innerText = spriteName;

			option.value = '{drws "' + (sprite[id].name ? sprite[id].name : id) + '"}';

			textEffectsDrawingSelect.appendChild(option);
		}

		for (id in tile) {
			var option = document.createElement("option");

			var tileName = localization.GetStringOrFallback("tile_label", "tile") + " " + id;
			if (tile[id].name) {
				tileName = tile[id].name;
			}

			option.innerText = tileName;

			option.value = '{drwt "' + (tile[id].name ? tile[id].name : id) + '"}';

			textEffectsDrawingSelect.appendChild(option);
		}

		for (id in item) {
			var option = document.createElement("option");

			var itemName = localization.GetStringOrFallback("item_label", "item") + " " + id;
			if (item[id].name) {
				itemName = item[id].name;
			}

			option.innerText = itemName;

			option.value = '{drwi "' + (item[id].name ? item[id].name : id) + '"}';

			textEffectsDrawingSelect.appendChild(option);
		}

		textEffectsDrawingButton.onclick = function() {
			textArea.value += textEffectsDrawingSelect.value;

			OnDialogTextChange();
		}

/*
		// TODO : use in a future update?
		// "yak" (dialog sounds) text effect
		var textEffectsYakSpan = document.createElement("span");
		// hacky: should use a style for these spans
		textEffectsYakSpan.style.marginLeft = "5px";
		textEffectsYakSpan.style.display = "inline-block";
		textEffectsControlsDiv.appendChild(textEffectsYakSpan);

		var textEffectsYakButton = document.createElement("button");
		textEffectsYakButton.appendChild(iconUtils.CreateIcon("blip"));
		textEffectsYakButton.title = "{yak} use a blip as dialog speech sounds";
		textEffectsYakSpan.appendChild(textEffectsYakButton);

		var textEffectsYakSelect = document.createElement("select");
		textEffectsYakSpan.appendChild(textEffectsYakSelect);

		// share with find tool code?
		for (var id in blip) {
			var blipOption = document.createElement("option");
			blipOption.innerText = blip[id].name ? blip[id].name : "blip " + id; // todo : localize
			blipOption.value = blip[id].name ? blip[id].name : id;
			textEffectsYakSelect.appendChild(blipOption);
		}

		textEffectsYakButton.onclick = function(e) {
			wrapTextSelection("{yak \"" + textEffectsYakSelect.value + "\"}", "{/yak}");
		};
*/

		this.GetElement = function() {
			return div;
		}

		AddSelectionBehavior(
			this,
			function() { textEffectsDiv.style.display = globalShowTextEffectsControls ? "block" : "none"; },
			function() { textEffectsDiv.style.display = "none"; });

		this.GetNodes = function() {
			return dialogNodeList;
		}

		this.OnNodeEnter = function(event) {
			if (event.id != undefined) {
				var enterIndex = dialogNodeList.findIndex(function(node) { return node.GetId() === event.id });
				if (enterIndex == 0) {
					div.classList.add("executing");
				}
			}
		};

		this.OnNodeExit = function(event) {
			if (event.id != undefined) {
				var exitIndex = dialogNodeList.findIndex(function(node) { return node.GetId() === event.id });
				if (exitIndex >= dialogNodeList.length-1 || event.forceClear) {
					div.classList.remove("executing");
					div.classList.remove("executingLeave");
					void div.offsetWidth; // hack to force reflow to allow animation to restart
					div.classList.add("executingLeave");
					setTimeout(function() { div.classList.remove("executingLeave") }, 1100);
				}
			}
		};
	}

	function ExpressionEditor(node, parentEditor, isInline) {
		if (isInline === undefined || isInline === null) {
			isInline = false;
		}

		var self = this;

		// kind of hacky -- but some expressions are wrapped in a code block and some aren't!
		var expressionRootNode = null;
		if (node.type === "code_block" &&
			(node.children[0].type === "operator"||
				node.children[0].type === "literal" ||
				node.children[0].type === "variable")) {
			expressionRootNode = node.children[0];
		}
		else {
			expressionRootNode = node;
		}

		var div = document.createElement(isInline ? "span" : "div");
		div.classList.add("actionEditor");
		div.classList.add("expressionEditor");
		if (isInline) {
			div.classList.add("inline");
		}

		var editExpressionButton = document.createElement("button");
		editExpressionButton.title = "edit expression"; // TODO : localize
		editExpressionButton.appendChild(iconUtils.CreateIcon("expression_edit"));
		editExpressionButton.onclick = function() {
			parentEditor.OpenExpressionBuilder(
				expressionRootNode.Serialize(),
				function(expressionNode) {
					expressionRootNode = expressionNode;
					if (node.type === "code_block" &&
						(node.children[0].type === "operator" ||
							node.children[0].type === "literal" ||
							node.children[0].type === "variable")) {
						node.children[0] = expressionRootNode;
					}
					else {
						node = expressionRootNode;
					}
					CreateExpressionControls(true);
					parentEditor.NotifyUpdate();
				});
		};

		var editParameterTypes = false;
		var toggleParameterTypesButton = document.createElement("button");
		toggleParameterTypesButton.title = "toggle editing parameter types";
		toggleParameterTypesButton.appendChild(iconUtils.CreateIcon("settings"));
		toggleParameterTypesButton.onclick = function() {
			editParameterTypes = !editParameterTypes;
			CreateExpressionControls(true);
		}

		if (!isInline) {
			var orderControls = new OrderControls(this, parentEditor);
			div.appendChild(orderControls.GetElement());

			var customControls = orderControls.GetCustomControlsContainer();
			customControls.appendChild(editExpressionButton);
			customControls.appendChild(toggleParameterTypesButton);
		}

		var expressionSpan = document.createElement("span");
		expressionSpan.style.display = "inline-flex";
		div.appendChild(expressionSpan);

		function CreateExpressionControls(isEditable) {
			expressionSpan.innerHTML = "";

			if (expressionRootNode.type === "operator") {
				AddOperatorControlRecursive(expressionRootNode, isEditable);
			}
			else {
				// parameter base case
				var parameterEditor = new ParameterEditor(
					["number", "text", "bool", "variable", "function", "expression"],
					function() { 
						return expressionRootNode;
					},
					function(argNode) {
						expressionRootNode = argNode;
						if (node.type === "code_block") {
							node.children[0] = expressionRootNode;
						}
						else {
							node = expressionRootNode;
						}

						parentEditor.NotifyUpdate();
					},
					isEditable,
					editParameterTypes,
					function(expressionString, onAcceptHandler) {
						parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
					});

				expressionSpan.appendChild(parameterEditor.GetElement());
			}

			if (isInline && isEditable) {
				var editExpressionButtonSpan = document.createElement("span");
				editExpressionButtonSpan.classList.add("inlineEditButtonHolder");
				editExpressionButtonSpan.appendChild(editExpressionButton);
				expressionSpan.appendChild(editExpressionButtonSpan);
			}
		}

		function AddOperatorControlRecursive(node, isEditable) {
			if (node.left.type === "operator") {
				AddOperatorControlRecursive(node.left, isEditable);
			}
			else {
				var parameterEditor = new ParameterEditor(
					["number", "text", "bool", "variable", "function", "expression"],
					function() { 
						return node.left;
					},
					function(argNode) {
						node.left = argNode;
						parentEditor.NotifyUpdate();
					},
					isEditable,
					editParameterTypes,
					function(expressionString, onAcceptHandler) {
						parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
					});

				expressionSpan.appendChild(parameterEditor.GetElement());
			}

			var operatorEditor = new ExpressionOperatorEditor(node, self, isEditable);
			expressionSpan.appendChild(operatorEditor.GetElement());

			if (node.right.type === "operator") {
				AddOperatorControlRecursive(node.right, isEditable);
			}
			else {
				var parameterEditor = new ParameterEditor(
					["number", "text", "bool", "variable", "function", "expression"],
					function() {
						return node.right;
					},
					function(argNode) {
						node.right = argNode;
						parentEditor.NotifyUpdate();
					},
					isEditable,
					editParameterTypes,
					function(expressionString, onAcceptHandler) {
						parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
					});

				expressionSpan.appendChild(parameterEditor.GetElement());
			}
		}

		CreateExpressionControls(false);

		this.GetElement = function() {
			return div;
		}

		AddSelectionBehavior(
			this,
			function() { CreateExpressionControls(true); },
			function() { CreateExpressionControls(false); },
			isInline);

		this.GetNodes = function() {
			return [node];
		}

		this.NotifyUpdate = function() {
			parentEditor.NotifyUpdate();
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
		}
	}

	// hacky to duplicate these here!
	var comparisonOperators = ["==", ">=", "<=", ">", "<"];
	var mathOperators =["-", "+", "/", "*"];

	function ExpressionOperatorEditor(operatorNode, parentEditor, isEditable) {
		var operatorSpan = document.createElement("span");
		operatorSpan.style.marginLeft = "5px";
		operatorSpan.style.marginRight = "5px";

		function CreateOperatorControl(isEditable) {
			operatorSpan.innerHTML = "";

			// the set operator '=' shouldn't be randomly exchanged with comparison operators!
			if (isEditable && !(operatorNode.operator === '=')) {
				var operatorSelect = document.createElement("select");

				// use either the comparison operators or the math operators
				var operatorList = comparisonOperators.indexOf(operatorNode.operator) >= 0 ? comparisonOperators : mathOperators;
				for (var i = 0; i < operatorList.length; i++) {
					var operatorOption = document.createElement("option");
					operatorOption.value = operatorList[i];
					operatorOption.innerText = operatorList[i];
					operatorOption.selected = operatorList[i] === operatorNode.operator;
					operatorSelect.appendChild(operatorOption);
				}

				operatorSelect.onchange = function(event) {
					operatorNode.operator = event.target.value;
					parentEditor.NotifyUpdate();
				}

				operatorSpan.appendChild(operatorSelect);
			}
			else {
				operatorSpan.innerText = operatorNode.operator;
			}
		}

		CreateOperatorControl(isEditable);

		this.GetElement = function() {
			return operatorSpan;
		}
	}

	var sequenceTypeDescriptionMap = {
		"sequence" : {
			GetName : function() {
				return localization.GetStringOrFallback("sequence_list_name", "sequence list");
			},
			GetTypeName : function() {
				return localization.GetStringOrFallback("sequence_name", "sequence");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("sequence_list_description", "go through each item once in _:");
			},
		},
		"cycle" : {
			GetName : function() {
				return localization.GetStringOrFallback("cycle_list_name", "cycle list");
			},
			GetTypeName : function() {
				return localization.GetStringOrFallback("cycle_name", "cycle");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("cycle_list_description", "repeat items in a _:");
			},
		},
		"shuffle" : {
			GetName : function() {
				return localization.GetStringOrFallback("shuffle_list_name", "shuffle list");
			},
			GetTypeName : function() {
				return localization.GetStringOrFallback("shuffle_name", "shuffle");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("shuffle_list_description", "_ items in a random order:");
			},
		},
	};

	function SequenceEditor(node, parentEditor) {
		var self = this;

		// this hack is terrible
		var sequenceNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("sequenceEditor");
		div.classList.add("actionEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var titleDiv = document.createElement("div");
		titleDiv.classList.add("actionTitle");
		div.appendChild(titleDiv);

		var descriptionDiv = document.createElement("div");
		descriptionDiv.classList.add("sequenceDescription");
		div.appendChild(descriptionDiv);

		function CreateSequenceDescription(isEditable) {
			descriptionDiv.innerHTML = "";

			titleDiv.innerText = sequenceTypeDescriptionMap[sequenceNode.type].GetName();

			var descriptionText = sequenceTypeDescriptionMap[sequenceNode.type].GetDescription();
			var descriptionTextSplit = descriptionText.split("_");

			var descSpan1 = document.createElement("span");
			descSpan1.innerText = descriptionTextSplit[0];
			descriptionDiv.appendChild(descSpan1);

			if (isEditable) {
				var sequenceTypeSelect = document.createElement("select");
				for (var type in sequenceTypeDescriptionMap) {
					var typeName = sequenceTypeDescriptionMap[type].GetTypeName();
					var sequenceTypeOption = document.createElement("option");
					sequenceTypeOption.value = type;
					sequenceTypeOption.innerText = typeName;
					sequenceTypeOption.selected = (type === sequenceNode.type);
					sequenceTypeSelect.appendChild(sequenceTypeOption);
				}
				sequenceTypeSelect.onchange = function() {
					bitsyLog(sequenceNode, "editor");
					sequenceNode = scriptUtils.ChangeSequenceType(sequenceNode, sequenceTypeSelect.value);
					node.SetChildren([sequenceNode]);
					CreateSequenceDescription(true);
					parentEditor.NotifyUpdate();
				}
				descriptionDiv.appendChild(sequenceTypeSelect);
			}
			else {
				var sequenceTypeSpan = document.createElement("span");
				sequenceTypeSpan.classList.add("parameterUneditable");
				sequenceTypeSpan.innerText = sequenceTypeDescriptionMap[sequenceNode.type].GetTypeName();
				descriptionDiv.appendChild(sequenceTypeSpan);
			}

			var descSpan2 = document.createElement("span");
			descSpan2.innerText = descriptionTextSplit[1];
			descriptionDiv.appendChild(descSpan2);
		}

		CreateSequenceDescription(false);

		var optionRootDiv = document.createElement("div");
		optionRootDiv.classList.add("optionRoot");
		div.appendChild(optionRootDiv);

		var addOptionRootDiv = document.createElement("div");
		addOptionRootDiv.classList.add("addOption");
		div.appendChild(addOptionRootDiv);

		var addOptionButton = document.createElement("button");
		addOptionButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("dialog_conditional_add", "add option"); // TODO : funny that this is the old conditional text
		addOptionButton.onclick = function() {
			var optionNode = scriptUtils.CreateOptionBlock();
			var optionEditor = new SequenceOptionEditor(optionNode, self);
			optionEditors.push(optionEditor);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();
		}
		addOptionRootDiv.appendChild(addOptionButton);

		this.GetElement = function() {
			return div;
		}

		AddSelectionBehavior(
			this,
			function() { CreateSequenceDescription(true); }, /*onSelect*/
			function() { CreateSequenceDescription(false); } /*onDeselect*/ );

		this.GetNodes = function() {
			return [node];
		}

		this.NotifyUpdate = function() {
			parentEditor.NotifyUpdate();
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
		}

		this.RemoveChild = function(childEditor) {
			optionEditors.splice(optionEditors.indexOf(childEditor),1);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();
		}

		this.IndexOfChild = function(childEditor) {
			return optionEditors.indexOf(childEditor);
		}

		this.InsertChild = function(childEditor, index) {
			optionEditors.splice(index, 0, childEditor);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();
		}

		this.ChildCount = function() {
			return optionEditors.length;
		}

		var optionEditors = [];
		function CreateOptionEditors() {
			optionEditors = [];

			for (var i = 0; i < sequenceNode.children.length; i++) {
				var optionNode = sequenceNode.children[i];
				var optionEditor = new SequenceOptionEditor(optionNode, self);
				optionEditor.SetOrderNumber(i+1);
				optionRootDiv.appendChild(optionEditor.GetElement());
				optionEditors.push(optionEditor);
			}
		}

		function RefreshOptionsUI() {
			optionRootDiv.innerHTML = "";
			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				editor.SetOrderNumber(i+1);
				optionRootDiv.appendChild(editor.GetElement());
			}
		}

		function UpdateNodeOptions() {
			var updatedOptions = [];

			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				updatedOptions = updatedOptions.concat(editor.GetNodes());
			}

			sequenceNode.SetChildren(updatedOptions);
		}

		CreateOptionEditors();

		this.OnNodeEnter = function(event) {
			if (event.id === node.GetId()) {
				div.classList.add("executing");
			}

			for (var i = 0; i < optionEditors.length; i++) {
				if (optionEditors[i].OnNodeEnter) {
					optionEditors[i].OnNodeEnter(event);
				}
			}
		};

		// TODO : some kind of "visit all" functionality like the
		// script node system has would be super helpful...
		// in fact sharing the child - parent relationship code between the two
		// would make sense...
		this.OnNodeExit = function(event) {
			if (event.id === node.GetId() || event.forceClear) {
				div.classList.remove("executing");
				div.classList.remove("executingLeave");
				void div.offsetWidth; // hack to force reflow to allow animation to restart
				div.classList.add("executingLeave");
				setTimeout(function() { div.classList.remove("executingLeave") }, 1100);
			}

			for (var i = 0; i < optionEditors.length; i++) {
				if (optionEditors[i].OnNodeExit) {
					optionEditors[i].OnNodeExit(event);
				}
			}
		};
	}

	function SequenceOptionEditor(optionNode, parentEditor) {
		var div = document.createElement("div");
		div.classList.add("optionEditor");

		var topControlsDiv = document.createElement("div");
		topControlsDiv.classList.add("optionControls");
		div.appendChild(topControlsDiv);

		var orderControls = new OrderControls(this, parentEditor);
		topControlsDiv.appendChild(orderControls.GetElement());

		var orderLabel = document.createElement("span");
		orderLabel.innerText = "#)";
		div.appendChild(orderLabel);

		var blockEditor = new BlockEditor(optionNode, parentEditor);
		div.appendChild(blockEditor.GetElement());

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [optionNode];
		}

		this.SetOrderNumber = function(num) {
			var numString = "" + num;
			if (localization.GetLanguage() === "ar") { // arabic
				numString = ConvertNumberStringToArabic(numString);
			}
			orderLabel.innerText = numString + ")";
		}

		// just pass these on
		this.OnNodeEnter = function(event) {
			blockEditor.OnNodeEnter(event);
		}

		this.OnNodeExit = function(event) {
			blockEditor.OnNodeExit(event);
		}

		AddSelectionBehavior(this);
	}

	function ConditionalEditor(node, parentEditor) {
		var self = this;

		var conditionalNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("conditionalEditor");
		div.classList.add("actionEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var titleDiv = document.createElement("div");
		titleDiv.classList.add("actionTitle");
		titleDiv.innerText = localization.GetStringOrFallback("branching_list_name", "branching list");
		div.appendChild(titleDiv);

		var descriptionDiv = document.createElement("div");
		descriptionDiv.classList.add("sequenceDescription"); // hack
		descriptionDiv.innerText = localization.GetStringOrFallback("branching_list_description", "go to the first branch whose condition is true:");
		div.appendChild(descriptionDiv);

		var optionRootDiv = document.createElement("div");
		optionRootDiv.classList.add("optionRoot");
		div.appendChild(optionRootDiv);

		var addConditionRootDiv = document.createElement("div");
		addConditionRootDiv.classList.add("addOption");
		addConditionRootDiv.style.flexDirection = "column"; //hack
		div.appendChild(addConditionRootDiv);

		var addButton = document.createElement("button");
		addButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("branch_add", "add branch");
		addButton.onclick = function() {
			addButton.style.display = "none";
			addItemCondition.style.display = "block";
			addVariableCondition.style.display = "block";
			addDefaultCondition.style.display = "block";
			cancelButton.style.display = "block";
		}
		addConditionRootDiv.appendChild(addButton);

		var addItemCondition = document.createElement("button");
		addItemCondition.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("branch_type_item", "item branch");
		addItemCondition.style.display = "none";
		addItemCondition.onclick = function() {
			var conditionPairNode = scriptUtils.CreateItemConditionPair();
			var optionEditor = new ConditionalOptionEditor(conditionPairNode, self, optionEditors.length);
			optionEditors.push(optionEditor);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();

			addButton.style.display = "block";
			addItemCondition.style.display = "none";
			addVariableCondition.style.display = "none";
			addDefaultCondition.style.display = "none";
			cancelButton.style.display = "none";
		}
		addConditionRootDiv.appendChild(addItemCondition);

		var addVariableCondition = document.createElement("button");
		addVariableCondition.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("branch_type_variable", "variable branch");
		addVariableCondition.style.display = "none";
		addVariableCondition.onclick = function() {
			var conditionPairNode = scriptUtils.CreateVariableConditionPair();
			var optionEditor = new ConditionalOptionEditor(conditionPairNode, self, optionEditors.length);
			optionEditors.push(optionEditor);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();

			addButton.style.display = "block";
			addItemCondition.style.display = "none";
			addVariableCondition.style.display = "none";
			addDefaultCondition.style.display = "none";
			cancelButton.style.display = "none";
		}
		addConditionRootDiv.appendChild(addVariableCondition);

		var addDefaultCondition = document.createElement("button");
		addDefaultCondition.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("branch_type_default", "default branch");
		addDefaultCondition.style.display = "none";
		addDefaultCondition.onclick = function() {
			var conditionPairNode = scriptUtils.CreateDefaultConditionPair();
			var optionEditor = new ConditionalOptionEditor(conditionPairNode, self, optionEditors.length);
			optionEditors.push(optionEditor);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();

			addButton.style.display = "block";
			addItemCondition.style.display = "none";
			addVariableCondition.style.display = "none";
			addDefaultCondition.style.display = "none";
			cancelButton.style.display = "none";
		}
		addConditionRootDiv.appendChild(addDefaultCondition);

		var cancelButton = document.createElement("button");
		cancelButton.classList.add("actionBuilderButton");
		cancelButton.classList.add("actionBuilderCancel");
		cancelButton.innerHTML = iconUtils.CreateIcon("cancel").outerHTML + " "
			+ localization.GetStringOrFallback("action_cancel", "cancel");;
		cancelButton.style.display = "none";
		cancelButton.onclick = function() {
			addButton.style.display = "block";
			addItemCondition.style.display = "none";
			addVariableCondition.style.display = "none";
			addDefaultCondition.style.display = "none";
			cancelButton.style.display = "none";
		}
		addConditionRootDiv.appendChild(cancelButton);

		this.GetElement = function() {
			return div;
		}

		AddSelectionBehavior(this);

		this.GetNodes = function() {
			return [node];
		}

		this.NotifyUpdate = function() {
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
		}

		this.RemoveChild = function(childEditor) {
			optionEditors.splice(optionEditors.indexOf(childEditor),1);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();
		}

		this.IndexOfChild = function(childEditor) {
			return optionEditors.indexOf(childEditor);
		}

		this.InsertChild = function(childEditor, index) {
			optionEditors.splice(index, 0, childEditor);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();
		}

		this.ChildCount = function() {
			return optionEditors.length;
		}

		var optionEditors = [];
		function CreateOptionEditors() {
			optionEditors = [];

			for (var i = 0; i < conditionalNode.children.length; i++) {
				var optionEditor = new ConditionalOptionEditor(conditionalNode.children[i], self, i);
				optionRootDiv.appendChild(optionEditor.GetElement());
				optionEditors.push(optionEditor);
			}
		}

		function RefreshOptionsUI() {
			optionRootDiv.innerHTML = "";
			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				editor.UpdateIndex(i);
				optionRootDiv.appendChild(editor.GetElement());
			}
		}

		// TODO : share w/ sequence editor?
		function UpdateNodeOptions() {
			var updatedOptions = [];

			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				updatedOptions = updatedOptions.concat(editor.GetNodes());
			}

			conditionalNode.SetChildren(updatedOptions);
		}

		CreateOptionEditors();

		this.OnNodeEnter = function(event) {
			if (event.id === node.GetId()) {
				div.classList.add("executing");
			}

			for (var i = 0; i < optionEditors.length; i++) {
				if (optionEditors[i].OnNodeEnter) {
					optionEditors[i].OnNodeEnter(event);
				}
			}
		};

		this.OnNodeExit = function(event) {
			if (event.id === node.GetId() || event.forceClear) {
				div.classList.remove("executing");
				div.classList.remove("executingLeave");
				void div.offsetWidth; // hack to force reflow to allow animation to restart
				div.classList.add("executingLeave");
				setTimeout(function() { div.classList.remove("executingLeave") }, 1100);
			}

			for (var i = 0; i < optionEditors.length; i++) {
				if (optionEditors[i].OnNodeExit) {
					optionEditors[i].OnNodeExit(event);
				}
			}
		};
	}

	function ConditionalOptionEditor(conditionPairNode, parentEditor, index) {
		var div = document.createElement("div");
		div.classList.add("optionEditor");

		var topControlsDiv = document.createElement("div");
		topControlsDiv.classList.add("optionControls");
		div.appendChild(topControlsDiv);

		var orderControls = new OrderControls(this, parentEditor);
		topControlsDiv.appendChild(orderControls.GetElement());

		// condition
		var comparisonEditor = new ConditionalComparisonEditor(conditionPairNode.children[0], this, index);
		div.appendChild(comparisonEditor.GetElement());

		// result
		var resultBlockEditor = new BlockEditor(conditionPairNode.children[1], this);
		div.appendChild(resultBlockEditor.GetElement());

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [conditionPairNode];
		}

		this.NotifyUpdate = function() {
			var updatedChildren = comparisonEditor.GetNodes().concat(resultBlockEditor.GetNodes());
			conditionPairNode.SetChildren(updatedChildren);

			parentEditor.NotifyUpdate();
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
		}

		this.UpdateIndex = function(i) {
			index = i;
			comparisonEditor.UpdateIndex(index);
		}

		// just pass these on
		this.OnNodeEnter = function(event) {
			resultBlockEditor.OnNodeEnter(event);
		}

		this.OnNodeExit = function(event) {
			resultBlockEditor.OnNodeExit(event);
		}

		AddSelectionBehavior(
			this,
			function() { comparisonEditor.Select(); },
			function() { comparisonEditor.Deselect(); });
	}

	function ConditionalComparisonEditor(conditionNode, parentEditor, index) {
		var self = this;

		var conditionStartSpan;
		var conditionEndSpan;
		var conditionExpressionEditor = null;

		var div = document.createElement("div");
		div.classList.add("conditionalComparisonEditor");

		function CreateComparisonControls() { // TODO : isEditable?
			div.innerHTML = "";

			conditionStartSpan = document.createElement("span");
			if (conditionNode.type === "else") {
				conditionStartSpan.innerText = localization.GetStringOrFallback("condition_else_label", "else");
			}
			else if (index === 0) {
				conditionStartSpan.innerText = localization.GetStringOrFallback("condition_if_label", "if") + " ";
			}
			else {
				conditionStartSpan.innerText = localization.GetStringOrFallback("condition_else_if_label", "else if") + " ";
			}
			div.appendChild(conditionStartSpan);

			if (conditionNode.type != "else") {
				conditionExpressionEditor = new ExpressionEditor(conditionNode, self, true);
				div.appendChild(conditionExpressionEditor.GetElement());
			}

			conditionEndSpan = document.createElement("span");
			if (conditionNode.type != "else") {
				conditionEndSpan.innerText = ", " + localization.GetStringOrFallback("condition_then_label", "then") + ":";
			}
			else {
				conditionEndSpan.innerText = ":";
			}
			div.appendChild(conditionEndSpan);
		}

		CreateComparisonControls();

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			if (conditionNode.type === "else") {
				return [conditionNode];
			}
			else {
				return conditionExpressionEditor.GetNodes();
			}
		}

		this.UpdateIndex = function(i) {
			index = i;

			// update the initial label based on the order of the option
			if (conditionNode.type != "else") {
				if (index === 0) {
					conditionStartSpan.innerText = localization.GetStringOrFallback("condition_if_label", "if") + " ";
				}
				else {
					conditionStartSpan.innerText = localization.GetStringOrFallback("condition_else_if_label", "else if") + " ";
				}
			}
		}

		this.Select = function() {
			if (conditionExpressionEditor != null) {
				conditionExpressionEditor.Select();
			}
		}

		this.Deselect = function() {
			if (conditionExpressionEditor != null) {
				conditionExpressionEditor.Deselect();
			}
		}

		this.NotifyUpdate = function() {
			parentEditor.NotifyUpdate();
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
		}
	}

	function RoomMoveDestinationCommand(functionNode, parentEditor, createFunctionDescriptionFunc) {
		var listener = new EventListener(events);

		var isMoving = false;

		var commandDescription = iconUtils.CreateIcon("set_exit_location").outerHTML + " "
			+ localization.GetStringOrFallback("exit_destination_move", "move destination");

		var moveCommand = document.createElement("div");

		var moveMessageSpan = document.createElement("span");
		moveCommand.appendChild(moveMessageSpan);

		var moveButton = document.createElement("button");
		moveButton.innerHTML = commandDescription;
		moveButton.title = "click to select new destination";
		moveButton.onclick = function() {
			if (!roomTool) {
				return;
			}

			isMoving = !isMoving;

			if (isMoving) {
				moveMessageSpan.innerHTML = "<i>" + localization.GetStringOrFallback("marker_move_click", "click in room") + "</i> ";
				moveButton.innerHTML = iconUtils.CreateIcon("cancel").outerHTML + " "
					+ localization.GetStringOrFallback("action_cancel", "cancel");

				roomTool.onNextClick(function(room, x, y) {
					if (isMoving) {
						roomId = room;
						roomPosX = x;
						roomPosY = y;

						functionNode.args.splice(0, 1, scriptUtils.CreateStringLiteralNode(roomId));
						functionNode.args.splice(1, 1, scriptUtils.CreateLiteralNode(roomPosX));
						functionNode.args.splice(2, 1, scriptUtils.CreateLiteralNode(roomPosY));

						isMoving = false;
						moveMessageSpan.innerHTML = "";
						moveButton.innerHTML = commandDescription;

						createFunctionDescriptionFunc(true);
						parentEditor.NotifyUpdate();
					}
				});
			}
			else {
				moveMessageSpan.innerHTML = "";
				moveButton.innerHTML = commandDescription;
				roomTool.cancelOnNextClick();
			}
		}
		moveCommand.appendChild(moveButton);

		this.GetElement = function() {
			return moveCommand;
		}

		this.OnDestroy = function() {
			listener.UnlistenAll();
		}
	}

	var functionDescriptionMap = {
		"end" : {
			GetName : function() {
				return localization.GetStringOrFallback("function_end_name", "end");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("function_end_description", "stop the game");
			},
			GetHelpText : function() {
				return localization.GetStringOrFallback(
					"function_end_help",
					"the game stops immediately, but if there is dialog after this action, it will still play");
			},
			parameters : [],
		},
		"exit" : {
			GetName : function() {
				return localization.GetStringOrFallback("function_exit_name", "exit");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("function_exit_description", "move player to _ at (_,_)[ with effect _]");
			},
			parameters : [
				{ types: ["room", "text", "variable"], index: 0, name: "room", },
				{ types: ["number", "variable"], index: 1, name: "x", },
				{ types: ["number", "variable"], index: 2, name: "y", },
				{ types: ["transition", "text", "variable"], index: 3, name: "transition effect", },
			],
			commands : [RoomMoveDestinationCommand],
		},
		"pg" : {
			GetName : function() {
				return localization.GetStringOrFallback("function_pg_name", "pagebreak");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("function_pg_description", "start a new page of dialog");
			},
			GetHelpText : function() {
				return localization.GetStringOrFallback(
					"function_pg_help",
					"if there are actions after this one, they will start after the player presses continue");
			},
			parameters : [],
		},
		"item" : {
			GetName : function() {
				return localization.GetStringOrFallback("function_item_name", "item");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("function_item_description", "_ in inventory[ = _]");
			},
			parameters : [
				{ types: ["item", "text", "variable"], index: 0, name: "item", },
				{ types: ["number", "variable"], index: 1, name: "amount", },
			],
		},
		"property" : {
			GetName : function() {
				return localization.GetStringOrFallback("function_property_name", "property");
			},
			GetDescription : function() {
				return localization.GetStringOrFallback("function_property_description", "property _[ = _]");
			},
			GetHelpText : function() { // TODO : when there's more than one property, this will have to change!
				return localization.GetStringOrFallback(
					"function_property_locked_example_help",
					"change the value of a property: "
					+ "for example, set the locked property to true to stop an exit from changing rooms, "
					+ "or to prevent an ending from stopping the game");
			},
			parameters : [
				{ types: ["variable"], index: 0, name: "name", doNotEdit: true }, // NOTE: disable editing of property names for this version
				{ types: ["number", "text", "bool", "variable"], index: 1, name: "value" },
			],
		},
		"print" : {
			GetName : function() {
				return localization.GetStringOrFallback("function_print_name", "print");
			},
			GetDescription : function() {
				// todo : re-localize
				// return localization.GetStringOrFallback("function_print_description", "print _ in the dialog box");
				return "say value of _ in textbox";
			},
			parameters : [
				{ types: ["text", "variable"], index: 0, name: "output", },
			],
		},
		"say" : {
			GetName : function() {
				return localization.GetStringOrFallback("function_say_name", "say");
			},
			GetDescription : function() {
				// todo : re-localize
				// return localization.GetStringOrFallback("function_print_description", "print _ in the dialog box");
				return "say value of _ in textbox";
			},
			parameters : [
				{ types: ["text", "variable"], index: 0, name: "output", },
			],
		},
		"tune": {
			GetName: function() { return "tune"; },
			// todo : localization
			GetDescription: function() { return "change room's current tune to _"; },
			parameters: [
				{ types: ["tune", "text", "variable"], index:0, name:"tune" }
			]
		},
		"blip": {
			GetName: function() { return "blip"; },
			// todo : localization
			GetDescription: function() { return "play _"; },
			parameters: [
				{ types: ["blip", "text", "variable"], index:0, name:"blip" }
			]
		},
		"pal": {
			GetName: function() { return "swap palette"; },
			// todo : localization
			GetDescription: function() { return "change room's current palette to _"; },
			parameters: [
				{ types: ["palette", "text", "variable"], index: 0, name: "palette" }
			]
		},
		"ava": {
			GetName: function() { return "morph avatar"; },
			// todo : localization
			GetDescription: function() { return "make avatar look like _"; },
			parameters: [
				{ types: ["sprite", "text", "variable"], index: 0, name: "sprite" }
			]
		}
	};

	var isHelpTextOn = true;

	function FunctionEditor(node, parentEditor, isInline) {
		if (isInline === undefined || isInline === null) {
			isInline = false;
		}

		var self = this;

		var functionNode = node.children[0];

		var div = document.createElement(isInline ? "span" : "div");
		div.classList.add("functionEditor");
		div.classList.add("actionEditor");
		if (isInline) {
			div.classList.add("inline");
		}

		var orderControls = null;

		if (!isInline) {
			orderControls = new OrderControls(this, parentEditor);
			div.appendChild(orderControls.GetElement());
		}

		if (!isInline) {
			var titleText = functionDescriptionMap[functionNode.name].GetName();
			var titleDiv = document.createElement("div");
			titleDiv.classList.add("actionTitle");
			titleDiv.innerText = titleText;
			div.appendChild(titleDiv);
		}

		var descriptionDiv = document.createElement(isInline ? "span" : "div");
		div.appendChild(descriptionDiv);

		var customCommandsDiv = null;
		var addParameterDiv = null;
		var helpTextDiv = null;
		var helpTextContent = null;
		var hasHelpText = false;

		var editParameterTypes = false;
		var toggleParameterTypesButton = document.createElement("button");
		toggleParameterTypesButton.title = "toggle editing parameter types";
		toggleParameterTypesButton.appendChild(iconUtils.CreateIcon("settings"));
		toggleParameterTypesButton.onclick = function() {
			editParameterTypes = !editParameterTypes;
			CreateFunctionDescription(true);
		}

		if (!isInline) {
			customCommandsDiv = document.createElement("div");
			customCommandsDiv.style.marginTop = "5px"; // hack : need to hide these spacers...
			div.appendChild(customCommandsDiv);

			addParameterDiv = document.createElement("div");
			addParameterDiv.style.marginTop = "5px"; // hack
			div.appendChild(addParameterDiv);

			helpTextDiv = document.createElement("div");
			helpTextDiv.classList.add("helpText");
			helpTextDiv.style.display = "none";
			div.appendChild(helpTextDiv);
			var helpTextImgHolder = document.createElement("div");
			helpTextImgHolder.classList.add("helpTextImg");
			helpTextDiv.appendChild(helpTextImgHolder);
			var catImg = document.createElement("img");
			catImg.src = "image/cat.svg";
			helpTextImgHolder.appendChild(catImg);
			helpTextContent = document.createElement("div");
			helpTextContent.classList.add("helpTextContent");
			helpTextDiv.appendChild(helpTextContent);

			var helpTextFunc = functionDescriptionMap[functionNode.name].GetHelpText;
			hasHelpText = helpTextFunc != undefined && helpTextFunc != null;
			if (hasHelpText) {
				helpTextContent.innerText = helpTextFunc();
			}

			var toggleHelpButton = document.createElement("button");
			toggleHelpButton.title = "turn help text on/off";
			toggleHelpButton.appendChild(iconUtils.CreateIcon("help"));
			toggleHelpButton.onclick = function() {
				isHelpTextOn = !isHelpTextOn;

				// hacky
				if (hasHelpText && isHelpTextOn) {
					helpTextDiv.style.display = "flex";
				}
				else {
					helpTextDiv.style.display = "none";
				}
			}

			var customControls = orderControls.GetCustomControlsContainer();
			customControls.appendChild(toggleParameterTypesButton);

			if (hasHelpText) {
				customControls.appendChild(toggleHelpButton);
			}
		}

		// TODO : populate default values!!
		var curParameterEditors = [];
		var curCommandEditors = []; // store custom commands
		function CreateFunctionDescription(isEditable) {
			curParameterEditors = [];
			descriptionDiv.innerHTML = "";

			if (!isInline) {
				customCommandsDiv.innerHTML = "";
				addParameterDiv.innerHTML = "";
			}

			var descriptionText = functionDescriptionMap[functionNode.name].GetDescription();
			var descriptionTextSplit = descriptionText.split("_");

			function createGetArgFunc(functionNode, parameterIndex) {
				return function() {
					return functionNode.args[parameterIndex];
				};
			}

			function createSetArgFunc(functionNode, parameterIndex, parentEditor) {
				return function(argNode) {
					if (argNode != null) {
						functionNode.args.splice(parameterIndex, 1, argNode);	
					}
					else {
						// null parameter node = delete this argument!
						functionNode.args.splice(parameterIndex, 1);
					}

					parentEditor.NotifyUpdate();
				};
			}

			for (var i = 0; i < descriptionTextSplit.length; i++) {
				var descriptionSpan = document.createElement("span");
				descriptionDiv.appendChild(descriptionSpan);

				var text = descriptionTextSplit[i];
				if (text.indexOf("[") >= 0) { // optional parameter text start
					var optionalTextStartSplit = text.split("[");
					descriptionSpan.innerText = optionalTextStartSplit[0];
					var nextParam = functionDescriptionMap[functionNode.name].parameters[i];
					if (functionNode.args.length > nextParam.index && optionalTextStartSplit.length > 1) {
						descriptionSpan.innerText += optionalTextStartSplit[1];
					}
				}
				else if (text[text.length - 1] === "]") { // optional parameter text end
					var prevParam = functionDescriptionMap[functionNode.name].parameters[i-1];
					if (functionNode.args.length > prevParam.index) {
						descriptionSpan.innerText = text.slice(0, text.length - 1);
					}
				}
				else { // regular description text
					descriptionSpan.innerText = text;
				}

				if (i < descriptionTextSplit.length - 1) {
					var parameterInfo = functionDescriptionMap[functionNode.name].parameters[i];

					if (functionNode.args.length > parameterInfo.index) {
						var parameterEditor = new ParameterEditor(
							parameterInfo.types.concat(["function", "expression"]),
							createGetArgFunc(functionNode, parameterInfo.index),
							createSetArgFunc(functionNode, parameterInfo.index, self),
							isEditable && !(parameterInfo.doNotEdit),
							!isInline && editParameterTypes,
							function(expressionString, onAcceptHandler) {
								parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
							});

						curParameterEditors.push(parameterEditor);
						descriptionDiv.appendChild(parameterEditor.GetElement());
					}
					else if (!isInline && isEditable && functionNode.args.length == parameterInfo.index && parameterInfo.name) {
						function createAddParameterHandler(functionNode, parameterInfo) {
							return function() {
								functionNode.args.push(CreateDefaultArgNode(parameterInfo.types[0]));
								CreateFunctionDescription(true);
								parentEditor.NotifyUpdate();
							}
						}

						var addParameterButton = document.createElement('button');
						addParameterButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + parameterInfo.name;
						addParameterButton.onclick = createAddParameterHandler(functionNode, parameterInfo);
						addParameterDiv.appendChild(addParameterButton);
					}
				}
			}

			if (!isInline) {
				// clean up and reset command editors
				for (var i = 0; i < curCommandEditors.length; i++) {
					curCommandEditors[i].OnDestroy();
				}
				curCommandEditors = [];

				// add custom edit commands
				var commands = functionDescriptionMap[functionNode.name].commands;
				if (isEditable && commands) {
					for (var i = 0; i < commands.length; i++) {
						var commandEditor = new commands[i](functionNode, parentEditor, CreateFunctionDescription);
						curCommandEditors.push(commandEditor);
						customCommandsDiv.appendChild(commandEditor.GetElement());
					}
				}

				if (isEditable && hasHelpText && isHelpTextOn) {
					helpTextDiv.style.display = "flex";
				}
				else {
					helpTextDiv.style.display = "none";
				}
			}
		}

		CreateFunctionDescription(false);

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [node];
		}

		this.NotifyUpdate = function() {
			parentEditor.NotifyUpdate();
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
		}

		AddSelectionBehavior(
			this,
			function() { CreateFunctionDescription(true); }, /*onSelect*/
			function() { /*onDeselect*/
				for (var i = 0; i < curParameterEditors.length; i++) {
					if (curParameterEditors[i].Deselect) {
						curParameterEditors[i].Deselect();
					}
				}

				CreateFunctionDescription(false);
			},
			isInline);

		this.OnNodeEnter = function(event) {
			if (!isInline && event.id === node.GetId()) {
				div.classList.add("executing");
			}
		};

		this.OnNodeExit = function(event) {
			if (!isInline && (event.id === node.GetId() || event.forceClear)) {
				div.classList.remove("executing");
				div.classList.remove("executingLeave");
				void div.offsetWidth; // hack to force reflow to allow animation to restart
				div.classList.add("executingLeave");
				setTimeout(function() { div.classList.remove("executingLeave") }, 1100);
			}
		};
	}

	function CreateDefaultArgNode(type) {
		var argNode;
		if (type === "number") {
			argNode = scriptUtils.CreateLiteralNode("0");
		}
		else if (type === "text") {
			argNode = scriptUtils.CreateLiteralNode("");
		}
		else if (type === "bool") {
			argNode = scriptUtils.CreateLiteralNode("true");
		}
		else if (type === "variable") {
			argNode = scriptUtils.CreateVariableNode("a"); // TODO : find first var instead?
		}
		else if (type === "function") {
			argNode = scriptUtils.CreateFunctionBlock("item", ["0"]);
		}
		else if (type === "expression") {
			var expNode = scriptInterpreter.CreateExpression("a + 1");
			var blockNode = scriptUtils.CreateCodeBlock();
			blockNode.AddChild(expNode);
			argNode = blockNode;
		}
		else if (type === "room") {
			argNode = scriptUtils.CreateStringLiteralNode("0"); // TODO : find first room instead?
		}
		else if (type === "item") {
			argNode = scriptUtils.CreateStringLiteralNode("0"); // TODO : find first item instead?
		}
		else if (type === "transition") {
			argNode = scriptUtils.CreateStringLiteralNode("fade_w");
		}
		else if (type === "tune") {
			argNode = scriptUtils.CreateStringLiteralNode("1");
		}
		else if (type === "blip") {
			argNode = scriptUtils.CreateStringLiteralNode("1");
		}
		else if (type === "palette") {
			argNode = scriptUtils.CreateStringLiteralNode("0");
		}
		else if (type === "sprite") {
			argNode = scriptUtils.CreateStringLiteralNode("a");
		}

		return argNode;
	}

	function GetColorClassForParameterType(type) {
		if (type === "number") {
			return "pinkColor";
		}
		else if (type === "text") {
			return "greenColor";
		}
		else if (type === "bool") {
			return "greenColor";
		}
		else if (type === "variable") {
			return "goldColor";
		}
		else if (type === "room") {
			return "greenColor";
		}
		else if (type === "item") {
			return "greenColor";
		}
		else if (type === "transition") {
			return "greenColor";
		}
		else if (type === "tune") {
			return "greenColor";
		}
		else if (type === "blip") {
			return "greenColor";
		}
		else if (type === "palette") {
			return "greenColor";
		}
		else if (type === "sprite") {
			return "greenColor";
		}
	}

	// for rendering item thumbnails
	var thumbnailRenderer = new ThumbnailRenderer();

	// TODO : put in shared location?
	var transitionTypes = [
		{
			GetName: function() { return localization.GetStringOrFallback("transition_fade_w", "fade (white)"); },
			id: "fade_w",
		},
		{
			GetName: function() { return localization.GetStringOrFallback("transition_fade_b", "fade (black)"); },
			id: "fade_b",
		},
		{
			GetName: function() { return localization.GetStringOrFallback("transition_wave", "wave"); },
			id: "wave",
		},
		{
			GetName: function() { return localization.GetStringOrFallback("transition_tunnel", "tunnel"); },
			id: "tunnel",
		},
		{
			GetName: function() { return localization.GetStringOrFallback("transition_slide_u", "slide up"); },
			id: "slide_u",
		},
		{
			GetName: function() { return localization.GetStringOrFallback("transition_slide_d", "slide down"); },
			id: "slide_d",
		},
		{
			GetName: function() { return localization.GetStringOrFallback("transition_slide_l", "slide left"); },
			id: "slide_l",
		},
		{
			GetName: function() { return localization.GetStringOrFallback("transition_slide_r", "slide right"); },
			id: "slide_r",
		},
		{
			// todo : localize
			GetName: function() { return "none"; },
			// todo : hack! empty string is not actually a valid transition ID - just used to indicate this parameter should be deleted
			id: "",
		}
	];

	function ParameterEditor(parameterTypes, getArgFunc, setArgFunc, isEditable, isTypeEditable, openExpressionBuilderFunc) {
		var self = this;

		var curType;

		var span = document.createElement("span");
		span.classList.add("parameterEditor");

		function UpdateEditor(type) {
			curType = type;
			var curValue = GetValue();

			span.innerHTML = "";

			if (isEditable) {
				var parameterEditable = document.createElement("span");
				parameterEditable.classList.add("parameterEditable");

				if (isTypeEditable) {
					var typeSelect = document.createElement("select");
					parameterEditable.appendChild(typeSelect);
					for (var i = 0; i < parameterTypes.length; i++) {
						var typeOption = document.createElement("option");
						typeOption.value = parameterTypes[i];
						typeOption.innerText = parameterTypes[i]; // TODO : localize
						typeOption.selected = curType === parameterTypes[i];
						typeSelect.appendChild(typeOption);
					}

					typeSelect.onchange = function(event) {
						ChangeEditorType(event.target.value);
					}
				}

				var parameterInput = CreateInput(curType, curValue, setArgFunc);
				parameterEditable.appendChild(parameterInput);

				span.appendChild(parameterEditable);
			}
			else {
				var parameterValue = document.createElement("span");
				parameterValue.classList.add("parameterUneditable");
				parameterValue.classList.add(GetColorClassForParameterType(type));
				span.appendChild(parameterValue);

				if (type === "room") {
					parameterValue.innerText = GetRoomNameFromId(curValue);
				}
				else if (type === "item") {
					parameterValue.innerText = GetItemNameFromId(curValue);

					// only try to render the item if it actually exists!
					if (item.hasOwnProperty(curValue)) {
						var itemThumbnail = document.createElement("img");
						span.appendChild(itemThumbnail);
						itemThumbnail.id = "param_item_" + curValue;
						itemThumbnail.style.width = tilesize * 2 + "px";
						itemThumbnail.style.height = tilesize * 2 + "px";
						itemThumbnail.style.marginLeft = "4px";
						thumbnailRenderer.Render(itemThumbnail.id, item[curValue], 0, itemThumbnail);
					}
				}
				else if (type === "transition") {
					// TODO : kind of using the loop in a weird way
					for (var i = 0; i < transitionTypes.length; i++) {
						var id = transitionTypes[i].id;
						if (id === curValue) {
							parameterValue.innerText = transitionTypes[i].GetName();
						}
					}
				}
				else if (type === "tune") {
					parameterValue.innerText = GetTuneNameFromId(curValue);
				}
				else if (type === "blip") {
					parameterValue.innerText = GetBlipNameFromId(curValue);
				}
				else if (type === "palette") {
					parameterValue.innerText = GetPaletteNameFromId(curValue);
				}
				else if (type === "sprite") {
					parameterValue.innerText = GetSpriteNameFromId(curValue);
				}
				else if (type === "function") {
					var inlineFunctionEditor = TryCreateFunctionEditor();
					if (inlineFunctionEditor != null) {
						parameterValue.appendChild(inlineFunctionEditor.GetElement());
					}
					else {
						// just in case
						parameterValue.innerText = value;
					}
				}
				else if (type === "expression") {
					var inlineExpressionEditor = TryCreateExpressionEditor();
					if (inlineExpressionEditor != null) {
						parameterValue.appendChild(inlineExpressionEditor.GetElement());
					}
					else {
						parameterValue.innerText = value;
					}
				}
				else if (type === "text") {
					parameterValue.innerText = '"' + curValue + '"';
				}
				else {
					parameterValue.innerText = curValue;
				}
			}
		}

		function TryCreateFunctionEditor() {
			var inlineFunctionEditor = null;
			var funcNode = getArgFunc();
			if (funcNode.type === "code_block" && funcNode.children[0].type === "function" &&
				functionDescriptionMap[funcNode.children[0].name] != undefined) { // TODO : copied from block editor
				inlineFunctionEditor = new FunctionEditor(getArgFunc(), self, true);
			}
			return inlineFunctionEditor;
		}

		function TryCreateExpressionEditor() {
			var inlineExpressionEditor = null;
			var expressionNode = getArgFunc();
			if (expressionNode.type === "code_block" && 
				(expressionNode.children[0].type === "operator" || 
					expressionNode.children[0].type === "literal" ||
					expressionNode.children[0].type === "variable")) {
				inlineExpressionEditor = new ExpressionEditor(expressionNode, self, true);
			}
			return inlineExpressionEditor;
		}

		function ChangeEditorType(type) {
			SetArgToDefault(type);
			UpdateEditor(type);
		}

		function SetArgToDefault(type) {
			setArgFunc(CreateDefaultArgNode(type));
		}

		function CreateInput(type, value, onChange) {
			var parameterInput;

			if (type === "number") {
				parameterInput = document.createElement("input");
				parameterInput.type = "number";
				parameterInput.min = 0;
				parameterInput.step = "any";
				parameterInput.value = value;
				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "text") {
				parameterInput = document.createElement("input");
				parameterInput.type = "text";
				parameterInput.value = value;
				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "bool") {
				parameterInput = document.createElement("select");

				var boolTrueOption = document.createElement("option");
				boolTrueOption.value = "true";
				boolTrueOption.innerText = "true"; // TODO : localize
				boolTrueOption.selected = value;
				parameterInput.appendChild(boolTrueOption);

				var boolFalseOption = document.createElement("option");
				boolFalseOption.value = "false";
				boolFalseOption.innerText = "false"; // TODO : localize
				boolFalseOption.selected = !value;
				parameterInput.appendChild(boolFalseOption);

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "variable") {
				parameterInput = document.createElement("span");

				var variableInput = document.createElement("input");
				variableInput.type = "text";
				variableInput.setAttribute("list", "variable_datalist");
				variableInput.value = value;
				parameterInput.appendChild(variableInput);
				
				var variableDatalist = document.createElement("datalist");
				variableDatalist.id = "variable_datalist"; // will duplicates break this?
				for (var name in variable) {
					var variableOption = document.createElement("option");
					variableOption.value = name;
					variableDatalist.appendChild(variableOption);
				}
				parameterInput.appendChild(variableDatalist);

				variableInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateVariableNode(val);
					onChange(argNode);
				}
			}
			else if (type === "room") {
				parameterInput = document.createElement("select");
				parameterInput.title = "choose room";

				for (id in room) {
					var roomOption = document.createElement("option");
					roomOption.value = id;
					roomOption.innerText = GetRoomNameFromId(id);
					roomOption.selected = id === value;
					parameterInput.appendChild(roomOption);
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "item") {
				parameterInput = document.createElement("select");
				parameterInput.title = "choose item";

				for (id in item) {
					var itemOption = document.createElement("option");
					itemOption.value = id;
					itemOption.innerText = GetItemNameFromId(id);
					itemOption.selected = id === value;
					parameterInput.appendChild(itemOption);
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "transition") {
				parameterInput = document.createElement("select");
				parameterInput.title = "select transition effect";

				for (var i = 0; i < transitionTypes.length; i++) {
					var id = transitionTypes[i].id;
					var transitionOption = document.createElement("option");
					transitionOption.value = id;
					transitionOption.innerText = transitionTypes[i].GetName();
					transitionOption.selected = id === value;
					parameterInput.appendChild(transitionOption);
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					if (val.length <= 0) {
						// empty transition ID = delete the parameter!
						onChange(null);
					}
					else {
						var argNode = scriptUtils.CreateStringLiteralNode(val);
						onChange(argNode);
					}
				}
			}
			else if (type === "tune") {
				// todo : use shared controls
				parameterInput = document.createElement("select");
				parameterInput.title = "choose tune";

				var tuneOffId = "0";
				var tuneOffOption = document.createElement("option");
				tuneOffOption.value = tuneOffId;
				tuneOffOption.innerText = GetTuneNameFromId(tuneOffId);
				tuneOffOption.selected = (tuneOffId === value);
				parameterInput.appendChild(tuneOffOption);

				// todo : use IDs or names??
				for (id in tune) {
					// "0" is reserved for the off option
					if (id != "0") {
						var tuneOption = document.createElement("option");
						tuneOption.value = id;
						tuneOption.innerText = GetTuneNameFromId(id);
						tuneOption.selected = (id === value);
						parameterInput.appendChild(tuneOption);
					}
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "blip") {
				// todo : use shared controls
				parameterInput = document.createElement("select");
				parameterInput.title = "choose blip";

				// todo : use IDs or names??
				for (id in blip) {
					var blipOption = document.createElement("option");
					blipOption.value = id;
					blipOption.innerText = GetBlipNameFromId(id);
					blipOption.selected = (id === value);
					parameterInput.appendChild(blipOption);
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "palette") {
				// todo : use shared controls
				parameterInput = document.createElement("select");
				parameterInput.title = "choose palette";

				// todo : use IDs or names??
				for (id in palette) {
					// todo : do I even *use* "default" anymore??
					if (id != "default") {
						var paletteOption = document.createElement("option");
						paletteOption.value = id;
						paletteOption.innerText = GetPaletteNameFromId(id);
						paletteOption.selected = (id === value);
						parameterInput.appendChild(paletteOption);
					}
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "sprite") {
				// todo : use shared controls
				parameterInput = document.createElement("select");
				parameterInput.title = "choose sprite";

				// todo : use IDs or names??
				for (id in sprite) {
					var spriteOption = document.createElement("option");
					spriteOption.value = id;
					spriteOption.innerText = GetSpriteNameFromId(id);
					spriteOption.selected = (id === value);
					parameterInput.appendChild(spriteOption);
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
				}
			}
			else if (type === "function") {
				parameterInput = document.createElement("span");
				var inlineFunctionEditor = TryCreateFunctionEditor();
				if (inlineFunctionEditor != null) {
					inlineFunctionEditor.Select();
					parameterInput.appendChild(inlineFunctionEditor.GetElement());
				}
				else {
					// just in case
					parameterInput.classList.add("parameterUneditable");
					parameterInput.innerText = value;
				}
			}
			else if (type === "expression") {
				parameterInput = document.createElement("span");
				var inlineExpressionEditor = TryCreateExpressionEditor();
				if (inlineExpressionEditor != null) {
					inlineExpressionEditor.Select();
					parameterInput.appendChild(inlineExpressionEditor.GetElement());
				}
				else {
					parameterInput.classList.add("parameterUneditable");
					parameterInput.innerText = value;
				}
			}

			return parameterInput;
		}

		function GetValue() {
			var arg = getArgFunc();
			if (arg.type === "literal") {
				return arg.value;
			}
			else if (arg.type === "variable") {
				return arg.name;
			}
			else if (arg.type === "code_block" && arg.children[0].type === "function") {
				return arg.children[0].name;
			}
			return null;
		}

		function DoesEditorTypeMatchNode(type, node) {
			if (type === "number" && node.type === "literal" && node.value === null) {
				// this is a catch-all for weird-ness
				return true;
			}
			else if (type === "number" && node.type === "literal" && (typeof node.value) === "number") {
				return true;
			}
			else if (type === "text" && node.type === "literal" && (typeof node.value) === "string") {
				return true;
			}
			else if (type === "bool" && node.type === "literal" && (typeof node.value) === "boolean") {
				return true;
			}
			else if (type === "variable" && node.type === "variable") {
				return true;
			}
			else if (type === "room" && node.type === "literal" && (typeof node.value) === "string" && room.hasOwnProperty(node.value)) {
				return true;
			}
			else if (type === "item" && node.type === "literal" && (typeof node.value) === "string" && item.hasOwnProperty(node.value)) {
				return true;
			}
			else if (type === "transition" && node.type === "literal" && (typeof node.value) === "string") {
				return true;
			}
			else if (type === "tune" && node.type === "literal" && (typeof node.value) === "string" && (tune.hasOwnProperty(node.value) || node.value === "0")) {
				return true;
			}
			else if (type === "blip" && node.type === "literal" && (typeof node.value) === "string" && blip.hasOwnProperty(node.value)) {
				return true;
			}
			else if (type === "palette" && node.type === "literal" && (typeof node.value) === "string" && palette.hasOwnProperty(node.value)) {
				return true;
			}
			else if (type === "sprite" && node.type === "literal" && (typeof node.value) === "string" && sprite.hasOwnProperty(node.value)) {
				return true;
			}
			else if (type === "function" && node.type === "code_block" && node.children[0].type === "function") {
				return true;
			}
			else if (type === "expression" && node.type === "code_block" && // TODO : I really need to put this in a helper function
				(node.children[0].type === "operator" || node.children[0].type === "variable" || node.children[0].type === "literal")) {
				return true;
			}

			return false;
		}

		// edit parameter with the first matching type this parameter supports
		var curType = parameterTypes[0];
		for (var i = 0; i < parameterTypes.length; i++) {
			if (DoesEditorTypeMatchNode(parameterTypes[i], getArgFunc())) {
				curType = parameterTypes[i];
				break;
			}
		}

		UpdateEditor(curType);

		this.GetElement = function() {
			return span;
		}

		this.NotifyUpdate = function() {
			// hack to force an update
			setArgFunc(getArgFunc());
		}

		this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
			if (openExpressionBuilderFunc) {
				openExpressionBuilderFunc(expressionString, onAcceptHandler);
			}
		}
	}

	function GetItemNameFromId(id) {
		if (!item[id]) {
			return "";
		}

		return (item[id].name != null ? item[id].name : localization.GetStringOrFallback("item_label", "item") + " " + id);
	}

	function GetRoomNameFromId(id) {
		if (!room[id]) {
			return "";
		}

		return (room[id].name != null ? room[id].name : localization.GetStringOrFallback("room_label", "room") + " " + id);
	}

	function GetTuneNameFromId(id) {
		if (id === "0") {
			return "off"; // todo : localize
		}

		if (!tune[id]) {
			return "";
		}

		// todo : localize
		return (tune[id].name != null ? tune[id].name : "tune" + " " + id);
	}

	function GetBlipNameFromId(id) {
		if (!blip[id]) {
			return "";
		}

		// todo : localize
		return (blip[id].name != null ? blip[id].name : "blip" + " " + id);
	}

	function GetPaletteNameFromId(id) {
		if (!palette[id]) {
			return "";
		}

		// todo : localize
		return (palette[id].name != null ? palette[id].name : "palette" + " " + id);
	}

	function GetSpriteNameFromId(id) {
		if (!sprite[id]) {
			return "";
		}

		if (id === "A") {
			// todo : localize
			return "default avatar";
		}

		// todo : localize
		return (sprite[id].name != null ? sprite[id].name : "sprite" + " " + id);
	}

	function OrderControls(editor, parentEditor) {
		var div = document.createElement("div");
		div.classList.add("orderControls");
		div.style.display = "none";

		var moveUpButton = document.createElement("button");
		// moveUpButton.innerText = "up";
		moveUpButton.appendChild(iconUtils.CreateIcon("arrow_up"));
		moveUpButton.onclick = function() {
			var insertIndex = parentEditor.IndexOfChild(editor);
			parentEditor.RemoveChild(editor);
			insertIndex -= 1;
			parentEditor.InsertChild(editor,insertIndex);
		}
		div.appendChild(moveUpButton);

		var moveDownButton = document.createElement("button");
		// moveDownButton.innerText = "down";
		moveDownButton.appendChild(iconUtils.CreateIcon("arrow_down"));
		moveDownButton.onclick = function() {
			var insertIndex = parentEditor.IndexOfChild(editor);
			parentEditor.RemoveChild(editor);
			insertIndex += 1;
			parentEditor.InsertChild(editor,insertIndex);
		}
		div.appendChild(moveDownButton);

		var customButtonsContainer = document.createElement("div");
		customButtonsContainer.style.display = "inline-block";
		customButtonsContainer.style.marginLeft = "5px";
		div.appendChild(customButtonsContainer);

		var deleteButton = document.createElement("button");
		// deleteButton.innerText = "delete";
		deleteButton.appendChild(iconUtils.CreateIcon("delete"));
		deleteButton.style.float = "right";
		deleteButton.onclick = function() {
			editor.GetElement().classList.add("actionEditorDelete");
			// allow animation to run before deleting the editor for real
			setTimeout(function() {
				parentEditor.RemoveChild(editor);
			}, 250);
		}
		div.appendChild(deleteButton);

		this.GetElement = function() {
			return div;
		}

		this.GetCustomControlsContainer = function() {
			return customButtonsContainer;
		}

		editor.ShowOrderControls = function() {
			if (parentEditor.ChildCount && parentEditor.ChildCount() > 1) {
				// TODO : replace w/ added class name?
				moveUpButton.disabled = false;
				moveDownButton.disabled = false;
			}
			else {
				moveUpButton.disabled = true;
				moveDownButton.disabled = true;
			}

			div.style.display = "block";
		}

		editor.HideOrderControls = function() {
			div.style.display = "none";
		}
	}

	var curSelectedEditor = null;
	function AddSelectionBehavior(editor, onSelect, onDeselect, isInline) {
		if (isInline === undefined || isInline === null) {
			isInline = false;
		}

		editor.Select = function() {
			editor.GetElement().classList.add("selectedEditor");
			if (editor.ShowOrderControls) {
				editor.ShowOrderControls();
			}
			if (onSelect) {
				onSelect();
			}
		}

		editor.Deselect = function() {
			editor.GetElement().classList.remove("selectedEditor");
			if (editor.HideOrderControls) {
				editor.HideOrderControls();
			}
			if (onDeselect) {
				onDeselect();
			}
		}

		if (!isInline) {
			editor.GetElement().onclick = function(event) {
				event.stopPropagation();

				if (curSelectedEditor === editor) {
					return; // already selected!
				}

				if (curSelectedEditor != null) {
					curSelectedEditor.Deselect();
				}

				editor.Select();
				curSelectedEditor = editor;
			}
		}
	}

	/* EXPRESSION BUILDER
		TODO :
		- move into its own file?
		- name vs expression editor? kind of confusing
		- add protections against messing up using the assignment operator "="
		- probably general protections against using the buttons wrong would help
	*/
	function ExpressionBuilder(expressionString, parentEditor, onCancelHandler, onAcceptHandler) {
		var expressionRootNode = scriptInterpreter.CreateExpression(expressionString);

		var div = document.createElement("div");
		div.classList.add("expressionBuilder");

		var expressionDiv = document.createElement("div");
		expressionDiv.classList.add("expressionEditorRoot");
		div.appendChild(expressionDiv);
		var expressionEditor = new ExpressionEditor(expressionRootNode, parentEditor, true);
		expressionDiv.appendChild(expressionEditor.GetElement());
		var curNumberSpan = document.createElement("span");
		curNumberSpan.classList.add(GetColorClassForParameterType("number"));
		curNumberSpan.style.borderRadius = "2px";
		expressionDiv.appendChild(curNumberSpan);

		var numericInputRoot = document.createElement("div");
		numericInputRoot.classList.add("expressionBuilderInputs");
		div.appendChild(numericInputRoot);

		var curNumberBeforeDecimal = "";
		var curNumberAfterDecimal = "";
		var curNumberHasDecimal = false;
		function CreateNumberInputHandler(number) { // TODO : uppercase function name?
			return function() {
				if (number === ".") {
					curNumberHasDecimal = true;
				}
				else if (curNumberHasDecimal) {
					curNumberAfterDecimal += number;
				}
				else {
					curNumberBeforeDecimal += number;
				}

				var curNumberString = "";
				curNumberString += curNumberBeforeDecimal.length > 0 ? curNumberBeforeDecimal : "0";
				curNumberString += curNumberHasDecimal ? "." : "";
				curNumberString += curNumberHasDecimal ? (curNumberAfterDecimal.length > 0 ? curNumberAfterDecimal : "0") : "";

				curNumberSpan.innerText = curNumberString;
			}
		}

		function TryAddCurrentNumberToExpression() {
			if (curNumberSpan.innerText.length > 0) {
				var expressionString = expressionRootNode.Serialize();
				expressionString += " " + curNumberSpan.innerText;
				expressionRootNode = scriptInterpreter.CreateExpression(expressionString);
			}
			// TODO : clear the number?
		}

		var numberRoot = document.createElement("div");
		numberRoot.style.flexGrow = "3";
		numberRoot.style.display = "flex";
		numberRoot.style.flexDirection = "column";
		numberRoot.style.marginRight = "10px";
		numericInputRoot.appendChild(numberRoot);

		var numberInputs = [["7","8","9"],["4","5","6"],["1","2","3"],["0",".","_"]];
		for (var i = 0; i < numberInputs.length; i++) {
			var numberInputRowDiv = document.createElement("div");
			numberInputRowDiv.style.flexGrow = "1";
			numberInputRowDiv.style.display = "flex";
			numberRoot.appendChild(numberInputRowDiv);
			var numberInputRow = numberInputs[i];

			for (var j = 0; j < numberInputRow.length; j++) {
				var button = document.createElement("button");
				button.classList.add(GetColorClassForParameterType("number"));
				button.innerText = numberInputs[i][j];
				button.style.flexGrow = "1";
				button.onclick = CreateNumberInputHandler(numberInputs[i][j]);

				// hack
				if (numberInputs[i][j] === "_") {
					button.disabled = true;
					button.style.background = "white";
					button.style.color = "white";
				}

				numberInputRowDiv.appendChild(button);
			}
		}

		function CreateOperatorInputHandler(operator) {
			return function() {
				TryAddCurrentNumberToExpression();

				var expressionString = expressionRootNode.Serialize();

				if (operator === "=") {
					// you need a variable to use the assignment operator!
					var leftNode = GetLeftmostNode(expressionRootNode);
					if (leftNode.type === "variable") {
						expressionString = leftNode.Serialize() + " " + operator;
					}
				}
				else {
					expressionString += " " + operator;
				}

				expressionRootNode = scriptInterpreter.CreateExpression(expressionString);

				ResetExpressionDiv();
			}
		}

		function ResetExpressionDiv() {
				expressionDiv.innerHTML = "";
				var expressionEditor = new ExpressionEditor(expressionRootNode, parentEditor, true);
				expressionDiv.appendChild(expressionEditor.GetElement());
				curNumberSpan = document.createElement("span");
				curNumberSpan.classList.add(GetColorClassForParameterType("number"));
				curNumberSpan.style.borderRadius = "2px";
				expressionDiv.appendChild(curNumberSpan);

				// reset the number stuff too
				curNumberBeforeDecimal = "";
				curNumberAfterDecimal = "";
				curNumberHasDecimal = false;
		}

		var operatorInputDiv = document.createElement("div");
		operatorInputDiv.style.flexGrow = "1";
		operatorInputDiv.style.display = "flex";
		operatorInputDiv.style.flexDirection = "column";
		numericInputRoot.appendChild(operatorInputDiv);

		var operatorInputs = ["=", "/", "*", "-", "+"];
		for (var i = 0; i < operatorInputs.length; i++) {
			var button = document.createElement("button");
			button.style.flexGrow = "1";
			button.innerText = operatorInputs[i];
			button.onclick = CreateOperatorInputHandler(operatorInputs[i]);

			if (operatorInputs[i] === "=") {
				button.classList.add("goldColor");
			}

			operatorInputDiv.appendChild(button);
		}

		var comparisonInputDiv = document.createElement("div");
		comparisonInputDiv.style.flexGrow = "1";
		comparisonInputDiv.style.display = "flex";
		comparisonInputDiv.style.flexDirection = "column";
		comparisonInputDiv.style.marginRight = "10px";
		numericInputRoot.appendChild(comparisonInputDiv);

		var comparisonInputs = ["==", ">=", "<=", ">", "<"];
		for (var i = 0; i < comparisonInputs.length; i++) {
			var button = document.createElement("button");
			button.style.flexGrow = "1";
			button.innerText = comparisonInputs[i];
			button.onclick = CreateOperatorInputHandler(comparisonInputs[i]);

			comparisonInputDiv.appendChild(button);	
		}

		// back button
		var backInputDiv = document.createElement("div");
		backInputDiv.style.flexGrow = "1";
		backInputDiv.style.display = "flex";
		backInputDiv.style.flexDirection = "column";
		numericInputRoot.appendChild(backInputDiv);

		var backButton = document.createElement("button");
		backButton.appendChild(iconUtils.CreateIcon("backspace"));
		backButton.onclick = function() {
			var expressionString = expressionRootNode.Serialize();
			var rightNode = GetRightmostNode(expressionRootNode);
			var substringToDelete = rightNode.type === "operator" ? " " + rightNode.operator + " " : rightNode.Serialize();
			expressionString = expressionString.slice(0, expressionString.length - substringToDelete.length);
			expressionRootNode = scriptInterpreter.CreateExpression(expressionString);

			ResetExpressionDiv();
		}
		backInputDiv.appendChild(backButton);

		var clearButton = document.createElement("button");
		clearButton.innerText = localization.GetStringOrFallback("expression_builder_all_clear", "AC");
		clearButton.onclick = function() {
			expressionDiv.classList.add("expressionBuilderClearShake");
			setTimeout(function() {
				expressionDiv.classList.remove("expressionBuilderClearShake");
				var expressionString = "";
				expressionRootNode = scriptInterpreter.CreateExpression(expressionString);
				ResetExpressionDiv();
			}, 210);
		}
		backInputDiv.appendChild(clearButton);

		// NON NUMERIC INPUTS!

		var nonNumericInputDiv = document.createElement("div");
		// nonNumericInputDiv.style.flexGrow = "1";
		nonNumericInputDiv.style.marginBottom = "15px";
		nonNumericInputDiv.style.display = "flex";
		nonNumericInputDiv.style.flexDirection = "column";
		div.appendChild(nonNumericInputDiv);

		// add variable:
		var selectedVarNode = CreateDefaultArgNode("variable");

		var addVariableDiv = document.createElement("div");
		addVariableDiv.style.display = "flex";
		addVariableDiv.classList.add("addNonNumericControlBox");
		addVariableDiv.classList.add("goldColorBackground");

		var variableParameterEditor = new ParameterEditor(
			["variable"], 
			function() { return selectedVarNode; },
			function(node) { selectedVarNode = node; },
			true,
			false);

		var addVariableButton = document.createElement("button");
		addVariableButton.classList.add(GetColorClassForParameterType("variable"));
		addVariableButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("variable_label", "variable");;
		addVariableButton.style.flexGrow = "1";
		addVariableButton.style.marginRight = "5px";
		addVariableButton.onclick = function() {
			var expressionString = expressionRootNode.Serialize();
			expressionString += " " + selectedVarNode.Serialize();
			expressionRootNode = scriptInterpreter.CreateExpression(expressionString);

			ResetExpressionDiv();
		}
		addVariableDiv.appendChild(addVariableButton);

		var variableParameterEl = variableParameterEditor.GetElement();
		variableParameterEl.style.flexGrow = "1";
		addVariableDiv.appendChild(variableParameterEl);

		nonNumericInputDiv.appendChild(addVariableDiv);

		// add item:
		var selectedItemNode = CreateDefaultArgNode("item");

		var addItemDiv = document.createElement("div");
		addItemDiv.style.display = "flex";
		addItemDiv.classList.add("addNonNumericControlBox");
		addItemDiv.classList.add("greenColorBackground");

		var itemParameterEditor = new ParameterEditor(
			["item"], 
			function() { return selectedItemNode; },
			function(node) { selectedItemNode = node; },
			true,
			false);

		var addItemButton = document.createElement("button");
		addItemButton.classList.add(GetColorClassForParameterType("item"));
		addItemButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("item_label", "item");
		addItemButton.style.flexGrow = "1";
		addItemButton.style.marginRight = "5px";
		addItemButton.onclick = function() {
			var expressionString = expressionRootNode.Serialize();
			expressionString += " " + "{item " + selectedItemNode.Serialize() + "}";
			expressionRootNode = scriptInterpreter.CreateExpression(expressionString);

			ResetExpressionDiv();
		}
		addItemDiv.appendChild(addItemButton);

		var itemParameterEl = itemParameterEditor.GetElement();
		itemParameterEl.style.flexGrow = "1";
		addItemDiv.appendChild(itemParameterEl);

		nonNumericInputDiv.appendChild(addItemDiv);

		// add text:
		var selectedTextNode = CreateDefaultArgNode("text");

		var addTextDiv = document.createElement("div");
		addTextDiv.style.display = "flex";
		addTextDiv.classList.add("addNonNumericControlBox");
		addTextDiv.classList.add("greenColorBackground");

		var textParameterEditor = new ParameterEditor(
			["text"], 
			function() { return selectedTextNode; },
			function(node) { selectedTextNode = node; },
			true,
			false);

		var addTextButton = document.createElement("button");
		addTextButton.classList.add(GetColorClassForParameterType("text"));
		addTextButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
			+ localization.GetStringOrFallback("value_type_text", "text");
		addTextButton.style.flexGrow = "1";
		addTextButton.style.marginRight = "5px";
		addTextButton.onclick = function() {
			var expressionString = expressionRootNode.Serialize();
			expressionString += " " + selectedTextNode.Serialize();
			expressionRootNode = scriptInterpreter.CreateExpression(expressionString);

			ResetExpressionDiv();
		}
		addTextDiv.appendChild(addTextButton);

		var textParameterEl = textParameterEditor.GetElement();
		textParameterEl.style.flexGrow = "1";
		addTextDiv.appendChild(textParameterEl);

		nonNumericInputDiv.appendChild(addTextDiv);

		// bool buttons
		function CreateBoolInputHandler(bool) {
			return function() {
				var expressionString = expressionRootNode.Serialize();
				expressionString += " " + bool;
				expressionRootNode = scriptInterpreter.CreateExpression(expressionString);

				ResetExpressionDiv();
			}
		}

		var boolInputDiv = document.createElement("div");
		boolInputDiv.style.display = "flex";
		nonNumericInputDiv.appendChild(boolInputDiv);

		var boolInputs = ["true", "false"];
		for (var i = 0; i < boolInputs.length; i++) {
			var button = document.createElement("button");
			button.classList.add(GetColorClassForParameterType("bool"));
			button.style.flexGrow = "1";
			button.innerText = boolInputs[i];
			button.onclick = CreateBoolInputHandler(boolInputs[i]);

			boolInputDiv.appendChild(button);
		}

		// controls for finishing building the expression
		var finishControlsRoot = document.createElement("div");
		finishControlsRoot.style.display = "flex";
		div.appendChild(finishControlsRoot);

		var leftSideSpaceSpan = document.createElement("span");
		leftSideSpaceSpan.style.flexGrow = "3";
		finishControlsRoot.appendChild(leftSideSpaceSpan);

		var cancelButton = document.createElement("button");
		cancelButton.style.flexGrow = "1";
		cancelButton.innerHTML = iconUtils.CreateIcon("cancel").outerHTML + " "
			+ localization.GetStringOrFallback("action_cancel", "cancel");
		cancelButton.onclick = function() {
			div.classList.add("expressionBuilderCancel");
			setTimeout(onCancelHandler, 250);
		};
		finishControlsRoot.appendChild(cancelButton);

		var acceptButton = document.createElement("button");
		acceptButton.style.flexGrow = "2";
		acceptButton.innerHTML = iconUtils.CreateIcon("checkmark").outerHTML + " "
			+ localization.GetStringOrFallback("action_save", "save");
		acceptButton.classList.add("reverseColors");
		acceptButton.onclick = function() {
			acceptButton.classList.add("expressionBuilderSaveFlash");
			div.classList.add("expressionBuilderSave");
			setTimeout(function() {
				TryAddCurrentNumberToExpression();
				onAcceptHandler(expressionRootNode);
			}, 750);
		}
		finishControlsRoot.appendChild(acceptButton);

		this.GetElement = function() {
			return div;
		}

		function GetRightmostNode(node) {
			if (node.type === "operator") {
				if (node.right === undefined || node.right === null ||
					(node.right.type === "literal" && node.right.value === null)) {
					return node;
				}
				else {
					return GetRightmostNode(node.right);
				}
			}
			else {
				return node;
			}
		}

		function GetLeftmostNode(node) {
			if (node.type === "operator") {
				if (node.left === undefined || node.left === null ||
					(node.left.type === "literal" && node.left.value === null)) {
					return node;
				}
				else {
					return GetLeftmostNode(node.left);
				}
			}
			else {
				return node;
			}
		}
	}
}

/* OLD UN-WRAPPED FUNCTIONS */
function addDialogBlockUI() {
	if (curDialogEditor != null) {
		curDialogEditor.AddDialog();
	}
}

function addSeqBlockUI() {
	if (curDialogEditor != null) {
		curDialogEditor.AddSequence();
	}
}

function addCycleBlock() {
	if (curDialogEditor != null) {
		curDialogEditor.AddCycle();
	}
}

function addShuffleBlock() {
	if (curDialogEditor != null) {
		curDialogEditor.AddShuffle();
	}
}

function addIfBlockUI() {
	if (curDialogEditor != null) {
		curDialogEditor.AddConditional();
	}
}

function ConvertNumberStringToArabic(numberString) {
	var arabicNumerals = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];

	var arabicNumberString = "";

	for (var i = 0; i < numberString.length; i++)
	{
		arabicNumberString += arabicNumerals[parseInt(numberString[i])];
	}

	return arabicNumberString;
}

var dialogSel = {
	target : null,
	start : 0,
	end : 0,
	onchange : null
}

function createOnTextSelectionChange(onchange) {
	return function(event) {
		dialogSel.target = event.target;
		dialogSel.start = event.target.selectionStart;
		dialogSel.end = event.target.selectionEnd;
		dialogSel.onchange = onchange;

		var effectButtons = document.getElementsByClassName("dialogEffectButton");
		for(var i = 0; i < effectButtons.length; i++) {
			effectButtons[i].disabled = false;
		}
	}
}

function preventTextDeselect(event) {
	if(dialogSel.target != null) {
		// event.preventDefault();
	}
}

function preventTextDeselectAndClick(event) {
	if(dialogSel.target != null) {
		// event.preventDefault();
		event.target.click();
	}
}

function wrapTextSelection(openTag, closeTag) {
	if (dialogSel.target != null) {
		// get the selected text
		var curText = dialogSel.target.value;
		var selectedText = curText.slice(dialogSel.start, dialogSel.end);

		if (selectedText.indexOf(openTag) > -1) {
			// remove open and closing tags
			var effectlessText = selectedText.replace(openTag, "").replace(closeTag, "");
			var newText = curText.slice(0, dialogSel.start) + effectlessText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;

			// update the selection range
			dialogSel.target.setSelectionRange(dialogSel.start, dialogSel.start + effectlessText.length);
			if (dialogSel.onchange != null) {
				dialogSel.onchange(dialogSel); // dialogSel needs to mimic the event the onchange would usually receive
			}
		}
		else {
			// add open and closing tagss
			var wrappedText = openTag + selectedText + closeTag;
			var newText = curText.slice(0, dialogSel.start) + wrappedText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;

			// update the selection range
			dialogSel.target.setSelectionRange(dialogSel.start, dialogSel.start + wrappedText.length);
			if (dialogSel.onchange != null) {
				dialogSel.onchange(dialogSel); // dialogSel needs to mimic the event the onchange would usually receive
			}
		}
	}
}