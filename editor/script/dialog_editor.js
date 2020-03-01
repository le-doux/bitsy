/* 
TODO
- refactor widget so there aren't multiple callbacks for creating a new DLG
- back compat for when you could implicitly link dialog to sprites by giving them the same ID
*/

// TODO : name?
function DialogTool() {
	this.CreateEditor = function(dialogId) {
		return new DialogScriptEditor(dialogId);
	}

	this.CreatePlaintextEditor = function(dialogId, style) {
		return new PlaintextDialogScriptEditor(dialogId, style);
	}

	// todo : name?
	this.CreateWidget = function(label, dialogId, allowNone, onChange, creationOptions) {
		return new DialogWidget(label, dialogId, allowNone, onChange, creationOptions);
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
		titleTextInput.placeholder = "Title"; // TODO : localize
		div.appendChild(titleTextInput);

		var openButton = document.createElement("button");
		openButton.classList.add("titleOpenDialog");
		openButton.title = "open title in dialog editor"; // todo : localize
		openButton.innerHTML = '<i class="material-icons">open_in_new</i>';
		openButton.onclick = function() {
			openDialogTool(titleDialogId);
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

	// TODO : label should be label localization id
	function DialogWidget(label, dialogId, allowNone, onChange, creationOptions) {
		var showSettings = false;

		var div = document.createElement("div");
		div.classList.add("controlBox");

		var controlDiv = document.createElement("div");
		controlDiv.style.display = "flex"; // todo : style
		div.appendChild(controlDiv);

		var labelSpan = document.createElement("span");
		labelSpan.style.flexGrow = 1;
		labelSpan.innerHTML = '<i class="material-icons">chat</i> ' + label;
		controlDiv.appendChild(labelSpan);

		var settingsButton = document.createElement("button");
		settingsButton.innerHTML = '<i class="material-icons">settings</i>';
		controlDiv.appendChild(settingsButton);

		var openButton = document.createElement("button");
		openButton.title = "open in dialog editor"; // todo : localize
		openButton.innerHTML = '<i class="material-icons">open_in_new</i>';
		openButton.onclick = function() {
			openDialogTool(dialogId);
		};
		controlDiv.appendChild(openButton);

		var editorDiv = document.createElement("div");
		var scriptEditor;
		function UpdateEditorContent() {
			editorDiv.innerHTML = "";

			if (dialogId != null || (creationOptions && creationOptions.CreateFromEmptyTextBox)) {
				scriptEditor = new PlaintextDialogScriptEditor(dialogId, "miniDialogPlaintextArea");
				editorDiv.appendChild(scriptEditor.GetElement());
			}
			else if (creationOptions.Presets) {
				function CreatePresetHandler(scriptStr) {
					return function() {
						dialogId = nextAvailableDialogId();
						dialog[dialogId] = { src:scriptStr, name:null }; // TODO: I really need a standard way to init dialogs now!
						events.Raise("new_dialog", {id:dialogId});
						// TODO replace OnCreateNewDialog with OnCHange!!!!
						if (creationOptions.OnCreateNewDialog) {
							creationOptions.OnCreateNewDialog(dialogId);
						}
						UpdateEditorContent();
					}
				}

				for (var i = 0; i < creationOptions.Presets.length; i++) {
					var preset = creationOptions.Presets[i];
					var presetButton = document.createElement("button");
					presetButton.style.flexGrow = 1; // TODO : style?
					presetButton.innerHTML = '<i class="material-icons">add</i>' + preset.Name;
					presetButton.onclick = CreatePresetHandler(preset.Script);
					editorDiv.appendChild(presetButton);
				}
			}
		}
		UpdateEditorContent();
		editorDiv.style.display = "flex";
		div.appendChild(editorDiv);

		var dialogIdSelect = document.createElement("select");
		dialogIdSelect.style.display = "none";
		dialogIdSelect.onchange = function(e) {
			dialogId = e.target.value === "none" ? null : e.target.value;		
			UpdateEditorContent();
			if (onChange != null) {
				onChange(dialogId);
			}
			refreshGameData();
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
					dialogIdOption.innerText = "dialog " + dialogIdList[i]; // TODO: localize
				}
				dialogIdOption.value = dialogIdList[i];
				dialogIdOption.selected = dialogId === dialogIdList[i];
				dialogIdSelect.appendChild(dialogIdOption);
			}
		}
		UpdateDialogIdSelectOptions();
		events.Listen("new_dialog", function() { UpdateDialogIdSelectOptions(); });
		events.Listen("dialog_update", function(event) {
			if (scriptEditor != null && event.editorId == scriptEditor.GetEditorId()) {
				if (dialogId != event.dialogId) {
					dialogId = event.dialogId;
					if (creationOptions.OnCreateNewDialog) {
						creationOptions.OnCreateNewDialog(dialogId);
					}
				}
			}
		})

		settingsButton.onclick = function() {
			showSettings = !showSettings;
			settingsButton.innerHTML = '<i class="material-icons">' + (showSettings ? "text_fields" : "settings") + '</i>';
			editorDiv.style.display = showSettings ? "none" : "flex";
			dialogIdSelect.style.display = showSettings ? "flex" : "none";
		}

		this.GetElement = function() {
			return div;
		}
	}

	var dialogScriptEditorUniqueIdCounter = 0;

	function PlaintextDialogScriptEditor(dialogId, style) {
		var editorId = dialogScriptEditorUniqueIdCounter;
		dialogScriptEditorUniqueIdCounter++;

		var scriptRootNode, div;
		div = document.createElement("div");

		var self = this;

		function RefreshEditorUI() {
			var dialogStr = dialogId === null ? "" : dialog[dialogId].src;

			div.innerHTML = "";
			scriptRootNode = scriptInterpreter.Parse(dialogStr, dialogId);

			var codeTextArea = document.createElement("textarea");
			codeTextArea.rows = 2;
			codeTextArea.cols = 32;
			codeTextArea.classList.add(style);
			codeTextArea.value = scriptRootNode.Serialize();
			codeTextArea.onchange = function() {
				var dialogStr = '"""\n' + codeTextArea.value + '\n"""'; // single lines?
				scriptRootNode = scriptInterpreter.Parse(dialogStr, dialogId);
				OnUpdate();
			}
			div.appendChild(codeTextArea);
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
			if (dialogStr.length > 0 && dialogId === null) {
				dialogId = nextAvailableDialogId();
				didMakeNewDialog = true;
			}

			if (dialogId === null) {
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

		events.Listen("dialog_update", function(event) {
			if (dialogId != null && event.dialogId === dialogId && event.editorId != editorId) {
				RefreshEditorUI();
			}
		});

		this.GetEditorId = function() {
			return editorId;
		}
	}

	function DialogScriptEditor(dialogId) {
		var editorId = dialogScriptEditorUniqueIdCounter;
		dialogScriptEditorUniqueIdCounter++;

		var scriptRootNode, div, rootEditor;
		div = document.createElement("div");

		var self = this;
		function RefreshEditorUI() {
			var dialogStr = dialog[dialogId].src;

			div.innerHTML = "";
			scriptRootNode = scriptInterpreter.Parse(dialogStr, dialogId);
			rootEditor = new BlockEditor(scriptRootNode, self);

			var viewportDiv = document.createElement("div");
			viewportDiv.classList.add("dialogContentViewport");
			// always selected so we can add actions to the root
			viewportDiv.classList.add("selectedEditor");

			viewportDiv.appendChild(rootEditor.GetElement());
			div.appendChild(viewportDiv);
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

		events.Listen("dialog_update", function(event) {
			if (event.dialogId === dialogId && event.editorId != editorId) {
				RefreshEditorUI();
			}
		});

		/* root level creation functions for the dialog editor top-bar UI */
		this.AddDialog = function() {
			var printFunc = scriptUtils.CreateEmptyPrintFunc();
			rootEditor.GetNodes()[0].AddChild(printFunc); // hacky -- see note in action builder
			var editor = new DialogEditor([printFunc], rootEditor);
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
				return isCodeBlock(node) && isChildType(node, "operator");
			};

			var dialogNodeList = [];
			function addText() {
				if (dialogNodeList.length > 0) {
					var editor = new DialogEditor(dialogNodeList, self);
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

		CreateChildEditors();
		RefreshChildUI();
	}

	function ActionBuilder(parentEditor) {
		var div = document.createElement("div");
		div.classList.add("actionBuilder");

		var addButton = document.createElement("button");
		addButton.classList.add("actionBuilderAdd");
		addButton.innerHTML = '<i class="material-icons">add</i>' + " add";
		addButton.onclick = function() {
			div.classList.add("actionBuilderActive");
			div.classList.add("actionBuilderRoot");
		}
		div.appendChild(addButton);

		var backButton = document.createElement("button");
		backButton.classList.add("actionBuilderButton");
		backButton.classList.add("actionBuilderButton_back");
		backButton.innerHTML = '<i class="material-icons">arrow_back_ios</i>' + "back";
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
			actionCategoryButton.innerHTML = text + '<i class="material-icons">arrow_forward_ios</i>';
			actionCategoryButton.onclick = function() {
				div.classList.remove("actionBuilderRoot");
				activeCategoryClass = "actionBuilder_" + categoryName;
				div.classList.add(activeCategoryClass);
			}
			return actionCategoryButton;
		}

		div.appendChild(makeActionCategoryButton("dialog", "dialog actions"));
		div.appendChild(makeActionCategoryButton("flow", "flow control actions"));
		div.appendChild(makeActionCategoryButton("exit", "exit and ending actions"));
		div.appendChild(makeActionCategoryButton("item", "item actions"));

		function makeActionBuilderButton(categoryName, text, createEditorFunc) {
			var actionBuilderButton = document.createElement("button");
			actionBuilderButton.classList.add("actionBuilderButton");
			actionBuilderButton.classList.add("actionBuilderButton_" + categoryName);
			actionBuilderButton.innerHTML = '<i class="material-icons">add</i>' + " " + text;
			actionBuilderButton.onclick = function() {
				var editor = createEditorFunc();
				parentEditor.AppendChild(editor);
				div.classList.remove("actionBuilderActive");
				div.classList.remove(activeCategoryClass);
				activeCategoryClass = null;
			}
			return actionBuilderButton;
		}

		div.appendChild(
			makeActionBuilderButton(
				"dialog",
				"dialog",
				function() {
					var printFunc = scriptUtils.CreateEmptyPrintFunc();

					// hacky access of the parent node is required
					// because the print function needs to start with a parent
					// otherwise the dialog editor can't serialize the text D:
					parentEditor.GetNodes()[0].AddChild(printFunc);

					var editor = new DialogEditor([printFunc], parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"dialog",
				"pagebreak", // TODO : name?
				function() {
					var node = scriptUtils.CreateFunctionBlock("pg", []);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"flow",
				"sequence",
				function() {
					var node = scriptUtils.CreateSequenceBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"flow",
				"cycle",
				function() {
					var node = scriptUtils.CreateCycleBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"flow",
				"shuffle",
				function() {
					var node = scriptUtils.CreateShuffleBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"flow",
				"conditional",
				function() {
					var node = scriptUtils.CreateIfBlock();
					var editor = new ConditionalEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"exit",
				"lock",
				function() {
					var node = scriptUtils.CreateFunctionBlock("lock", []);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"exit",
				"end",
				function() {
					var node = scriptUtils.CreateFunctionBlock("end", []);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		// div.appendChild(
		// 	makeActionBuilderButton(
		// 		"narrate",
		// 		function() {
		// 			var node = scriptUtils.CreateFunctionBlock("narrate");
		// 			var editor = new FunctionEditor(node, parentEditor);
		// 			return editor;
		// 		}));

		div.appendChild(
			makeActionBuilderButton(
				"exit",
				"exit",
				function() {
					var node = scriptUtils.CreateFunctionBlock("exit", ["0", 0, 0]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				"give item",
				function() {
					var node = scriptUtils.CreateFunctionBlock("giveItem", ["0", 1]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"item",
				"take item",
				function() {
					var node = scriptUtils.CreateFunctionBlock("takeItem", ["0", 1]);
					var editor = new FunctionEditor(node, parentEditor);
					return editor;
				}));

		var cancelButton = document.createElement("button");
		cancelButton.classList.add("actionBuilderButton");
		cancelButton.classList.add("actionBuilderCancel");
		cancelButton.innerHTML = '<i class="material-icons">cancel</i>' + " cancel";
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

	// TODO : this name is confusing to me
	function DialogEditor(dialogNodeList, parentEditor) {
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

		var textHolderDiv = document.createElement("div");
		var textArea = document.createElement("textarea");
		textArea.value = scriptUtils.SerializeDialogNodeList(dialogNodeList);
		textArea.onchange = OnDialogTextChange;
		textArea.rows = 2;
		textArea.cols = 32;
		// test: style to center text area
		// textArea.style.margin = "auto";
		// textArea.style.display = "block"; // TODO : move to style file
		textArea.addEventListener('click', textSelectionChangeHandler);
		textArea.addEventListener('select', textSelectionChangeHandler);
		textArea.addEventListener('blur', textSelectionChangeHandler);
		textHolderDiv.appendChild(textArea);
		// textHolderDiv.style.background = "black"; // TODO : does this look better?
		div.appendChild(textHolderDiv);

		this.GetElement = function() {
			return div;
		}

		AddSelectionBehavior(this);

		this.GetNodes = function() {
			return dialogNodeList;
		}

		events.Listen("script_node_enter", function(event) {
			if (event.id != undefined) {
				var enterIndex = dialogNodeList.findIndex(function(node) { return node.GetId() === event.id });
				if (enterIndex == 0) {
					div.classList.add("executing");
				}
			}
		});

		events.Listen("script_node_exit", function(event) {
			if (event.id != undefined) {
				var exitIndex = dialogNodeList.findIndex(function(node) { return node.GetId() === event.id });
				if (exitIndex >= dialogNodeList.length-1) {
					div.classList.remove("executing");
					div.classList.remove("executingLeave");
					void div.offsetWidth; // hack to force reflow to allow animation to restart
					div.classList.add("executingLeave");
				}				
			}
		});
	}

	function ExpressionEditor(node, parentEditor) {
		var self = this;

		var expressionRootNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("actionEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var expressionSpan = document.createElement("span");
		div.appendChild(expressionSpan);

		function CreateExpressionControls(isEditable) {
			expressionSpan.innerHTML = "";

			AddExpressionControl(expressionRootNode, isEditable);
		}

		function AddExpressionControl(node, isEditable) {
			if (node.left.type === "operator") {
				AddExpressionControl(node.left, isEditable);
			}
			else {
				var parameterEditor = new ParameterEditor(
					["number", "text", "bool", "variable"],
					function() { 
						return node.left;
					},
					function(argNode) {
						node.left = argNode;
						parentEditor.NotifyUpdate();
					},
					isEditable,
					false);

				expressionSpan.appendChild(parameterEditor.GetElement());
			}

			var operatorEditor = new ExpressionOperatorEditor(node, self, isEditable);
			expressionSpan.appendChild(operatorEditor.GetElement());

			if (node.right.type === "operator") {
				AddExpressionControl(node.right, isEditable);
			}
			else {
				var parameterEditor = new ParameterEditor(
					["number", "text", "bool", "variable"],
					function() {
						return node.right;
					},
					function(argNode) {
						node.right = argNode;
						parentEditor.NotifyUpdate();
					},
					isEditable,
					false);

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
			function() { CreateExpressionControls(false); });

		this.GetNodes = function() {
			return [node];
		}

		this.NotifyUpdate = function() {
			parentEditor.NotifyUpdate();
		}
	}

	function ExpressionOperatorEditor(operatorNode, parentEditor, isEditable) {
		var operatorSpan = document.createElement("span");
		operatorSpan.style.marginLeft = "5px";
		operatorSpan.style.marginRight = "5px";

		function CreateOperatorControl(isEditable) {
			operatorSpan.innerHTML = "";

			if (isEditable) {
				var operatorSelect = document.createElement("select");

				var operatorList = scriptUtils.GetOperatorList();
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
		"sequence" : "do items once in _:",
		"cycle" : "repeat items in a _:",
		"shuffle" : "_ items in a random order:",
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

		var descriptionDiv = document.createElement("div");
		descriptionDiv.classList.add("sequenceDescription");
		div.appendChild(descriptionDiv);

		function CreateSequenceDescription(isEditable) {
			descriptionDiv.innerHTML = "";

			var descriptionText = sequenceTypeDescriptionMap[sequenceNode.type];
			var descriptionTextSplit = descriptionText.split("_");

			var descSpan1 = document.createElement("span");
			descSpan1.innerText = descriptionTextSplit[0];
			descriptionDiv.appendChild(descSpan1);

			if (isEditable) {
				var sequenceTypeSelect = document.createElement("select");
				for (var type in sequenceTypeDescriptionMap) {
					var sequenceTypeOption = document.createElement("option");
					sequenceTypeOption.value = type;
					sequenceTypeOption.innerText = type;
					sequenceTypeOption.selected = (type === sequenceNode.type);
					sequenceTypeSelect.appendChild(sequenceTypeOption);
				}
				sequenceTypeSelect.onchange = function() {
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
				sequenceTypeSpan.innerText = sequenceNode.type;
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
		addOptionButton.innerHTML = '<i class="material-icons">add</i>' + "add option";
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

		events.Listen("script_node_enter", function(event) {
			if (event.id === node.GetId()) {
				div.classList.add("executing");
			}
		});

		events.Listen("script_node_exit", function(event) {
			if (event.id === node.GetId()) {
				div.classList.remove("executing");
				div.classList.remove("executingLeave");
				void div.offsetWidth; // hack to force reflow to allow animation to restart
				div.classList.add("executingLeave");
			}
		});
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

		var span = document.createElement("span");
		span.innerText = "conditional";
		div.appendChild(span);

		var optionRootDiv = document.createElement("div");
		optionRootDiv.classList.add("optionRoot");
		div.appendChild(optionRootDiv);

		var addOptionRootDiv = document.createElement("div");
		addOptionRootDiv.classList.add("addOption");
		div.appendChild(addOptionRootDiv);

		var addOptionButton = document.createElement("button");
		addOptionButton.innerHTML = '<i class="material-icons">add</i>' + "add option";
		addOptionButton.onclick = function() {
			var conditionPairNode = scriptUtils.CreateConditionPair();
			var optionEditor = new ConditionalOptionEditor(conditionPairNode, self, optionEditors.length);
			optionEditors.push(optionEditor);

			RefreshOptionsUI();
			UpdateNodeOptions();
			parentEditor.NotifyUpdate();
		}
		addOptionRootDiv.appendChild(addOptionButton);

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

		events.Listen("script_node_enter", function(event) {
			if (event.id === node.GetId()) {
				div.classList.add("executing");
			}
		});

		events.Listen("script_node_exit", function(event) {
			if (event.id === node.GetId()) {
				div.classList.remove("executing");
				div.classList.remove("executingLeave");
				void div.offsetWidth; // hack to force reflow to allow animation to restart
				div.classList.add("executingLeave");
			}
		});
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

		this.UpdateIndex = function(i) {
			index = i;
			comparisonEditor.UpdateIndex(index);
		}

		AddSelectionBehavior(
			this,
			function() { comparisonEditor.Select(); },
			function() { comparisonEditor.Deselect(); });
	}

	function GetConditionType(condition) {
		if (condition.type === "else") {
			return "else";
		}
		else if (condition.type === "operator") {
			if (condition.right.type === "literal" && !isNaN(condition.right.value)) {
				if (condition.left.type === "code_block") {
					var child = condition.left.children[0];
					if (child.type === "function" && child.name === "item") {
						return "item";
					}
				}
				if (condition.left.type === "variable" && variable[condition.left.name] != null) {
					return "variable";
				}
			}
		}
		return "custom";
	}

	// TODO : use these
	var conditionTypes = ["item","variable","else","custom"];
	// var conditionTypeNames = [
	// 	localization.GetStringOrFallback("item_label", "item"),
	// 	localization.GetStringOrFallback("variable_label", "variable"),
	// 	localization.GetStringOrFallback("condition_type_default", "default"),
	// 	localization.GetStringOrFallback("condition_type_custom", "custom")
	// ];

	// var conditionTypesVerbose = ["the player's inventory of the item", "the value of the variable", "no other condition is met (default)", "a custom condition is met"]
	// var comparisonNames = ["equals","greater than","less than","greater than or equal to","less than or equal to"];
	var comparisonTypes = ["==", ">", "<", ">=", "<="];
	// var comparisonTypesVerbose = ["is equal to", "is greater than", "is less than", "is greater than or equal to", "is less than or equal to"];

	function ConditionalComparisonEditor(conditionNode, parentEditor, index) {
		var conditionType = GetConditionType(conditionNode);

		// init description elements
		var conditionStartSpan;
		var conditionDescriptionSpan;
		var conditionEndSpan;

		// init input elements
		var conditionTypeSelect;
		var itemSelect;
		var variableSelect;
		var comparisonSelect;
		var valueInput;
		var textArea; // for custom input

		function GetItemId() {
			return conditionNode.left.children[0].args[0].value;
		}

		function GetVariableId() {
			return conditionNode.left.name;
		}

		function GetComparisonOperator() {
			return conditionNode.operator;
		}

		function GetRightHandValue() {
			return parseInt(conditionNode.right.value);
		}

		// init value handler - custom is the default
		var valueChangeHandler = null;
		function InitValueChangeHandler() {
			valueChangeHandler = function() {
				conditionNode = scriptInterpreter.CreateExpression(textArea.value);
				parentEditor.NotifyUpdate();
			}
			if (conditionType === "item") {
				valueChangeHandler = function() {
					var expStr = '{item "' + itemSelect.value + '"} ' + comparisonSelect.value + ' ' + valueInput.value;
					conditionNode = scriptInterpreter.CreateExpression(expStr);
					parentEditor.NotifyUpdate();
				}
			}
			else if (conditionType === "variable") {
				valueChangeHandler = function() {
					var expStr = variableSelect.value + ' ' + comparisonSelect.value + ' ' + valueInput.value;
					conditionNode = scriptInterpreter.CreateExpression(expStr);
					parentEditor.NotifyUpdate();
				}
			}
		}
		InitValueChangeHandler();

		var div = document.createElement("div");
		div.classList.add("conditionalComparisonEditor");

		function CreateComparisonControls() {
			div.innerHTML = "";

			conditionStartSpan = document.createElement("span");
			if (conditionType != "else") {
				if (index === 0) {
					conditionStartSpan.innerText = "if ";
				}
				else {
					conditionStartSpan.innerText = "else if ";
				}
			}
			div.appendChild(conditionStartSpan);

			// type select
			conditionTypeSelect = document.createElement("select");
			conditionTypeSelect.title = "choose type of condition to check";
			div.appendChild(conditionTypeSelect);
			for(var i = 0; i < conditionTypes.length; i++) {
				var conditionTypeOption = document.createElement("option");
				conditionTypeOption.value = conditionTypes[i];
				conditionTypeOption.innerText = conditionTypes[i]; // conditionTypeNames[i];
				conditionTypeOption.selected = conditionTypes[i] === conditionType;
				conditionTypeSelect.appendChild(conditionTypeOption);
			}
			conditionTypeSelect.onchange = function() {
				if (conditionTypeSelect.value === "else") {
					conditionNode = scriptUtils.CreateElseNode();
				}
				else if (conditionTypeSelect.value === "item") {
					var expStr = '{item "0"} == 1';
					conditionNode = scriptInterpreter.CreateExpression(expStr);
				}
				else if (conditionTypeSelect.value === "variable") {
					var expStr = 'a == 1';
					conditionNode = scriptInterpreter.CreateExpression(expStr);
				}
				else if (conditionTypeSelect.value === "custom") {
					var expStr = 'a = a + 1';
					conditionNode = scriptInterpreter.CreateExpression(expStr);
				}

				conditionType = GetConditionType(conditionNode);
				InitValueChangeHandler();
				CreateComparisonControls();
				parentEditor.NotifyUpdate();
			}

			if (conditionType === "item") {
				// item select
				itemSelect = document.createElement("select");
				itemSelect.title = "choose item to check";
				div.appendChild(itemSelect);
				for (id in item) {
					var itemOption = document.createElement("option");
					itemOption.value = id;
					itemOption.innerText = GetItemNameFromId(id);
					itemOption.selected = id === GetItemId();
					itemSelect.appendChild(itemOption);
				}
				itemSelect.onchange = valueChangeHandler;
			}
			else if (conditionType === "variable") {
				// variable select
				variableSelect = document.createElement("select");
				variableSelect.title = "choose variable to check";
				div.appendChild(variableSelect);
				for (id in variable) {
					var variableOption = document.createElement("option");
					variableOption.value = id;
					variableOption.innerText = id;
					variableOption.selected = id === GetVariableId();
					variableSelect.appendChild(variableOption);
				}
				variableSelect.onchange = valueChangeHandler;
			}

			if (conditionType === "item" || conditionType === "variable") {
				// comparison select
				comparisonSelect = document.createElement("select");
				comparisonSelect.title = "choose a comparison type";
				div.appendChild(comparisonSelect);
				for (var i = 0; i < comparisonTypes.length; i++) {
					var comparisonOption = document.createElement("option");
					comparisonOption.value = comparisonTypes[i];
					comparisonOption.innerText = comparisonTypes[i];
					comparisonOption.selected = comparisonTypes[i] === GetComparisonOperator();
					comparisonSelect.appendChild(comparisonOption);
				}
				comparisonSelect.onchange = valueChangeHandler;

				// value input
				valueInput = document.createElement("input");
				valueInput.type = "number";
				valueInput.title = "choose number to compare";
				valueInput.value = GetRightHandValue();
				div.appendChild(valueInput);
				valueInput.onchange = valueChangeHandler;
			}

			if (conditionType === "custom") {
				// custom condition input
				textArea = document.createElement("textarea");
				textArea.value = conditionNode.Serialize();
				textArea.onchange = valueChangeHandler;
				div.appendChild(textArea);
			}

			conditionEndSpan = document.createElement("span");
			if (conditionType != "else") {
				conditionEndSpan.innerText = ", then:";
			}
			else {
				conditionEndSpan.innerText = " :";
			}
			div.appendChild(conditionEndSpan);
		}

		function CreateComparisonDescription() {
			div.innerHTML = "";

			conditionStartSpan = document.createElement("span");
			if (conditionType != "else") {
				if (index === 0) {
					conditionStartSpan.innerText = "if ";
				}
				else {
					conditionStartSpan.innerText = "else if ";
				}
			}
			div.appendChild(conditionStartSpan);

			conditionDescriptionSpan = document.createElement("span");
			conditionDescriptionSpan.classList.add("parameterUneditable");
			conditionDescriptionSpan.innerText = "";

			if (conditionType != "custom") {
				conditionDescriptionSpan.innerText += conditionType;
			}

			if (conditionType === "item") {
				conditionDescriptionSpan.innerText += " " + GetItemNameFromId(GetItemId());
			}
			else if (conditionType === "variable") {
				conditionDescriptionSpan.innerText += " " + GetVariableId();
			}

			if (conditionType === "item" || conditionType === "variable") {
				conditionDescriptionSpan.innerText += " " + GetComparisonOperator();
				conditionDescriptionSpan.innerText += " " + GetRightHandValue();
			}
			else if (conditionType === "custom") {
				conditionDescriptionSpan.innerText += conditionNode.Serialize();
			}

			div.appendChild(conditionDescriptionSpan);

			conditionEndSpan = document.createElement("span");
			if (conditionType != "else") {
				conditionEndSpan.innerText = ", then:";
			}
			else {
				conditionEndSpan.innerText = ":";
			}
			div.appendChild(conditionEndSpan);
		}

		CreateComparisonDescription();

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [conditionNode];
		}

		this.UpdateIndex = function(i) {
			index = i;

			// update the initial label based on the order of the option
			if (conditionType != "else") {
				if (index === 0) {
					conditionStartSpan.innerText = "if ";
				}
				else {
					conditionStartSpan.innerText = "else if ";
				}
			}
		}

		this.Select = function() {
			CreateComparisonControls();
		}

		this.Deselect = function() {
			CreateComparisonDescription();
		}
	}

	function CreateRoomMoveDestinationCommand(functionNode, parentEditor, createFunctionDescriptionFunc) {
		var isMoving = false;

		var commandDescription = '<i class="material-icons">location_searching</i> move destination';

		var moveCommand = document.createElement("div");

		var moveMessageSpan = document.createElement("span");
		moveCommand.appendChild(moveMessageSpan);

		var moveButton = document.createElement("button");
		moveButton.innerHTML = commandDescription;
		moveButton.title = "click to select new destination";
		moveButton.onclick = function() {
			isMoving = !isMoving;

			if (isMoving) {
				moveMessageSpan.innerHTML = "<i>click in room</i>";
				moveButton.innerHTML = '<i class="material-icons">cancel</i>';
				events.Raise("disable_room_tool"); // TODO : don't know if I like this design
			}
			else {
				moveMessageSpan.innerHTML = "";
				moveButton.innerHTML = commandDescription;
				events.Raise("enable_room_tool");
			}
		}
		moveCommand.appendChild(moveButton);

		events.Listen("click_room", function(event) {
			if (isMoving) {
				roomId = event.roomId;
				roomPosX = event.x;
				roomPosY = event.y;

				functionNode.args.splice(0, 1, scriptUtils.CreateStringLiteralNode(roomId));
				functionNode.args.splice(1, 1, scriptUtils.CreateLiteralNode(roomPosX));
				functionNode.args.splice(2, 1, scriptUtils.CreateLiteralNode(roomPosY));

				isMoving = false;
				moveMessageSpan.innerHTML = "";
				moveButton.innerHTML = commandDescription;

				createFunctionDescriptionFunc(true);
				parentEditor.NotifyUpdate();
				events.Raise("enable_room_tool");
			}
		});

		return moveCommand;
	}

	var functionDescriptionMap = {
		"lock" : {
			description : "lock",
			parameters : [],
			helpText : "prevents the default action that happens "
				+ "after this event (changing rooms for exits, "
				+ "stopping the game for endings, picking up items, etc.)",
		},
		"end" : {
			description : "end the game",
			parameters : [],
		},
		"exit" : {
			description : "move player to _ at _,_[ with effect _]",
			parameters : [
				{ types: ["room", "text", "variable"], index: 0, name: "room", },
				{ types: ["number", "variable"], index: 1, name: "x", },
				{ types: ["number", "variable"], index: 2, name: "y", },
				{ types: ["transition", "text", "variable"], index: 3, name: "transition effect", },
			],
			commands : [CreateRoomMoveDestinationCommand],
		},
		"narrate" : {
			description : "start narration",
			parameters : [],
		},
		"giveItem" : {
			description : "give player _ of _",
			parameters : [
				{ types: ["number", "variable"], index: 1, name: "amount", },
				{ types: ["item", "text", "variable"], index: 0, name: "item", },
			],
		},
		"takeItem" : {
			description : "take _ of _ from player",
			parameters : [
				{ types: ["number", "variable"], index: 1, name: "amount", },
				{ types: ["item", "text", "variable"], index: 0, name: "item", },
			],
		},
		"pg" : {
			description : "start a new page", // TODO : ok description?
			parameters : [],
		},
	};

	function FunctionEditor(node, parentEditor) {
		var self = this;

		var functionNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("functionEditor");
		div.classList.add("actionEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var descriptionDiv = document.createElement("div");
		div.appendChild(descriptionDiv);

		var customCommandsDiv = document.createElement("div");
		customCommandsDiv.style.marginTop = "5px"; // hack : need to hide these spacers...
		div.appendChild(customCommandsDiv);

		var addParameterDiv = document.createElement("div");
		addParameterDiv.style.marginTop = "5px"; // hack
		div.appendChild(addParameterDiv);

		var helpTextDiv = document.createElement("div");
		div.appendChild(helpTextDiv);

		var customControls = orderControls.GetCustomControlsContainer();

		// TODO : hide if there are no parameters??
		var editParameterTypeCheckbox = document.createElement("input");
		editParameterTypeCheckbox.type = "checkbox";
		editParameterTypeCheckbox.id = "paramTypeCheck_" + node.GetId();
		editParameterTypeCheckbox.checked = false;
		editParameterTypeCheckbox.onclick = function() {
			CreateFunctionDescription(true);
		}
		customControls.appendChild(editParameterTypeCheckbox);

		var editParameterTypeLabel = document.createElement("label");
		editParameterTypeLabel.innerHTML = '<i class="material-icons">settings</i>';
		editParameterTypeLabel.setAttribute("for", "paramTypeCheck_" + node.GetId());
		editParameterTypeLabel.title = "edit parameter types"
		customControls.appendChild(editParameterTypeLabel);

		// TODO : populate default values!!
		var curParameterEditors = [];
		function CreateFunctionDescription(isEditable) {
			curParameterEditors = [];
			descriptionDiv.innerHTML = "";
			customCommandsDiv.innerHTML = "";
			addParameterDiv.innerHTML = "";

			var descriptionText = functionDescriptionMap[functionNode.name].description;
			var descriptionTextSplit = descriptionText.split("_");

			function createGetArgFunc(functionNode, parameterIndex) {
				return function() {
					return functionNode.args[parameterIndex];
				};
			}

			function createSetArgFunc(functionNode, parameterIndex, parentEditor) {
				return function(argNode) {
					functionNode.args.splice(parameterIndex, 1, argNode);
					parentEditor.NotifyUpdate();
				};
			}

			for (var i = 0; i < descriptionTextSplit.length; i++) {
				var descriptionSpan = document.createElement("span");
				descriptionDiv.appendChild(descriptionSpan);

				var text = descriptionTextSplit[i];
				if (text[0] === "[") { // optional parameter text start
					var nextParam = functionDescriptionMap[functionNode.name].parameters[i];
					if (functionNode.args.length > nextParam.index) {
						descriptionSpan.innerText = text.slice(1);
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
							parameterInfo.types,
							createGetArgFunc(functionNode, parameterInfo.index),
							createSetArgFunc(functionNode, parameterInfo.index, self),
							isEditable,
							editParameterTypeCheckbox.checked);

						curParameterEditors.push(parameterEditor);
						descriptionDiv.appendChild(parameterEditor.GetElement());							
					}
					else if (isEditable && functionNode.args.length == parameterInfo.index && parameterInfo.name) {
						function createAddParameterHandler(functionNode, parameterInfo) {
							return function() {
								functionNode.args.push(CreateDefaultArgNode(parameterInfo.types[0]));
								CreateFunctionDescription(true);
								parentEditor.NotifyUpdate();
							}
						}

						var addParameterButton = document.createElement('button');
						addParameterButton.innerHTML = '<i class="material-icons">add</i>' + parameterInfo.name;
						addParameterButton.onclick = createAddParameterHandler(functionNode, parameterInfo);
						addParameterDiv.appendChild(addParameterButton);
					}
				}
			}

			// add custom edit commands
			var commands = functionDescriptionMap[functionNode.name].commands;
			if (isEditable && commands) {
				for (var i = 0; i < commands.length; i++) {
					customCommandsDiv.appendChild(commands[i](functionNode, parentEditor, CreateFunctionDescription));
				}
			}

			helpTextDiv.innerText = "";
			helpTextDiv.classList.remove("helpText");
			if (isEditable) {
				var helpText = functionDescriptionMap[functionNode.name].helpText;
				if (helpText != undefined && helpText != null) {
					helpTextDiv.innerText = helpText;
					helpTextDiv.classList.add("helpText");
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
			});

		events.Listen("script_node_enter", function(event) {
			if (event.id === node.GetId()) {
				div.classList.add("executing");
			}
		});

		events.Listen("script_node_exit", function(event) {
			if (event.id === node.GetId()) {
				div.classList.remove("executing");
				div.classList.remove("executingLeave");
				void div.offsetWidth; // hack to force reflow to allow animation to restart
				div.classList.add("executingLeave");
			}
		});
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
		else if (type === "room") {
			argNode = scriptUtils.CreateStringLiteralNode("0"); // TODO : find first room instead?
		}
		else if (type === "item") {
			argNode = scriptUtils.CreateStringLiteralNode("0"); // TODO : find first item instead?
		}
		else if (type === "transition") {
			argNode = scriptUtils.CreateStringLiteralNode("fade_w");
		}
		return argNode;
	}

	// TODO : put in shared location?
	var transitionTypes = [
		{ name:"fade (white)",	id:"fade_w" },
		{ name:"fade (black)",	id:"fade_b" },
		{ name:"wave",			id:"wave" },
		{ name:"tunnel",		id:"tunnel" },
		{ name:"slide up",		id:"slide_u" },
		{ name:"slide down",	id:"slide_d" },
		{ name:"slide left",	id:"slide_l" },
		{ name:"slide right",	id:"slide_r" },
	];

	function ParameterEditor(parameterTypes, getArgFunc, setArgFunc, isEditable, isTypeEditable) {
		var curType;

		var span = document.createElement("span");

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
				span.appendChild(parameterValue);

				if (type === "room") {
					parameterValue.innerText = GetRoomNameFromId(curValue);
				}
				else if (type === "item") {
					parameterValue.innerText = GetItemNameFromId(curValue);
				}
				else if (type === "transition") {
					// TODO : kind of using the loop in a weird way
					for (var i = 0; i < transitionTypes.length; i++) {
						var id = transitionTypes[i].id;
						if (id === curValue) {
							parameterValue.innerText = transitionTypes[i].name;
						}
					}
				}
				else {
					parameterValue.innerText = curValue;
				}
			}
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
					transitionOption.innerText = transitionTypes[i].name;
					transitionOption.selected = id === value;
					parameterInput.appendChild(transitionOption);
				}

				parameterInput.onchange = function(event) {
					var val = event.target.value;
					var argNode = scriptUtils.CreateStringLiteralNode(val);
					onChange(argNode);
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
			return null;
		}

		function DoesEditorTypeMatchNode(type, node) {
			if (type === "number" && node.type === "literal" && (typeof node.value) === "number") {
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
			else if (type === "room" && node.type === "literal" && (typeof node.value) === "string") {
				return true;
			}
			else if (type === "item" && node.type === "literal" && (typeof node.value) === "string") {
				return true;
			}
			else if (type === "transition" && node.type === "literal" && (typeof node.value) === "string") {
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

	function OrderControls(editor, parentEditor) {
		var div = document.createElement("div");
		div.classList.add("orderControls");
		div.style.display = "none";

		var moveUpButton = document.createElement("button");
		// moveUpButton.innerText = "up";
		moveUpButton.innerHTML = '<i class="material-icons">expand_less</i>';
		moveUpButton.onclick = function() {
			var insertIndex = parentEditor.IndexOfChild(editor);
			parentEditor.RemoveChild(editor);
			insertIndex -= 1;
			parentEditor.InsertChild(editor,insertIndex);
		}
		div.appendChild(moveUpButton);

		var moveDownButton = document.createElement("button");
		// moveDownButton.innerText = "down";
		moveDownButton.innerHTML = '<i class="material-icons">expand_more</i>';
		moveDownButton.onclick = function() {
			var insertIndex = parentEditor.IndexOfChild(editor);
			parentEditor.RemoveChild(editor);
			insertIndex += 1;
			parentEditor.InsertChild(editor,insertIndex);
		}
		div.appendChild(moveDownButton);

		var rightHandButtons = document.createElement("div");
		rightHandButtons.style.display = "inline-block";
		rightHandButtons.style.float = "right";
		div.appendChild(rightHandButtons);

		var customRightHandButtons = document.createElement("div");
		customRightHandButtons.style.display = "inline-block";
		customRightHandButtons.style.marginTop = "4px"; // WHY?????
		rightHandButtons.appendChild(customRightHandButtons);

		var deleteButton = document.createElement("button");
		// deleteButton.innerText = "delete";
		deleteButton.innerHTML = '<i class="material-icons">clear</i>';
		deleteButton.style.float = "right";
		deleteButton.onclick = function() {
			parentEditor.RemoveChild(editor);
		}
		rightHandButtons.appendChild(deleteButton);

		this.GetElement = function() {
			return div;
		}

		this.GetCustomControlsContainer = function() {
			return customRightHandButtons;
		}

		editor.ShowOrderControls = function() {
			if (parentEditor.ChildCount && parentEditor.ChildCount() > 1) {
				// TODO : replace w/ added class name?
				div.style.display = "block";
			}
		}

		editor.HideOrderControls = function() {
			div.style.display = "none";
		}
	}

	var curSelectedEditor = null;
	function AddSelectionBehavior(editor, onSelect, onDeselect) {
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

// TODO : what is this used for?
function createIconElement(iconName) {
	var icon = document.createElement("i");
	icon.classList.add('material-icons');
	icon.innerText = iconName;
	return icon;
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

function wrapTextSelection(effect) {
	if( dialogSel.target != null ) {
		var curText = dialogSel.target.value;
		var selText = curText.slice(dialogSel.start, dialogSel.end);

		var isEffectAlreadyApplied = selText.indexOf( effect ) > -1;
		if(isEffectAlreadyApplied) {
			//remove all instances of effect
			var effectlessText = selText.split( effect ).join( "" );
			var newText = curText.slice(0, dialogSel.start) + effectlessText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;
			dialogSel.target.setSelectionRange(dialogSel.start,dialogSel.start + effectlessText.length);
			if(dialogSel.onchange != null)
				dialogSel.onchange( dialogSel ); // dialogSel needs to mimic the event the onchange would usually receive
		}
		else {
			// add effect
			var effectText = effect + selText + effect;
			var newText = curText.slice(0, dialogSel.start) + effectText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;
			dialogSel.target.setSelectionRange(dialogSel.start,dialogSel.start + effectText.length);
			if(dialogSel.onchange != null)
				dialogSel.onchange( dialogSel ); // dialogSel needs to mimic the event the onchange would usually receive
		}
	}
}