/*
	- DLG contains dialog contents
	- dialog contents are parsed into a tree of nodes
	- nodes are displayed using editors

	how much of the old editor code can I re-use?

	do I need to make *any* changes to the parser?
		- remove code blocks (probably)
		- make functions, sequences, etc direct instead of wrapped (possibly)
		- pre-group dialog blocks (less likely)

	todo
	- use new editor in multiple places!
	- better formatting
		- button clutter
		- nesting (colors?)
	X add actions
	X delete blocks
	X move blocks
	X save changes
	- see where I can re-use more code
*/

function DialogTool() {
	this.CreateEditor = function(dialogId) {
		return new DialogScriptEditor(dialogId);
	}

	function DialogScriptEditor(dialogId) {
		var dialogStr = dialog[dialogId];
		var scriptRootNode = scriptInterpreter.Parse(dialogStr);

		scriptInterpreter.DebugVisualizeScriptTree(scriptRootNode);

		var rootEditor = new BlockEditor(scriptRootNode, this);

		this.GetElement = function() {
			return rootEditor.GetElement();
		}

		this.NotifyUpdate = function() {
			var dialogStr = rootEditor.Serialize();

			if (dialogStr.indexOf("\n") > -1) {
				// hacky - expose the triple-quotes symbol somewhere?
				dialogStr = '"""\n' + dialogStr + '\n"""';
			}

			dialog[dialogId] = dialogStr;

			refreshGameData();
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

		this.NotifyUpdate = function() {
			parentEditor.NotifyUpdate();
		}

		var childEditors = [];
		function CreateChildEditors() {
			// build the editors
			childEditors = [];

			function isBlock(node) { return node.type === "block"; };
			function isChildType(node,type) { return node.children[0].type === type; };
			function isIf(node) { return isBlock(node) && isChildType(node,"if") && !node.children[0].IsSingleLine(); };
			function isSeq(node) { return isBlock(node) && (isChildType(node,"sequence") || isChildType(node,"cycle") || isChildType(node,"shuffle")); };

			var dialogNodeList = [];
			function addText() {
				if (dialogNodeList.length > 0) {
					console.log("TEXT BLOCK!!");
					var editor = new DialogEditor(dialogNodeList, self);
					childEditors.push(editor);

					dialogNodeList = [];
				}
			}

			for (var i = 0; i < blockNode.children.length; i++) {
				var node = blockNode.children[i];
				if (isIf(node)) {
					addText();

					console.log("IF NODE!!");
					var editor = new ConditionalEditor(node, self);
					childEditors.push(editor);
				}
				else if (isSeq(node)) {
					addText();

					console.log("SEQ NODE!!");
					var editor = new SequenceEditor(node, self);
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
			}
		}

		function UpdateNodeChildren() {
			var updatedChildren = [];

			for (var i = 0; i < childEditors.length; i++) {
				var editor = childEditors[i];
				updatedChildren = updatedChildren.concat(editor.GetNodes());
			}

			blockNode.children = updatedChildren;
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
			// index = Math.max(index, 0);

			childEditors.splice(index, 0, childEditor);
			RefreshChildUI();

			UpdateNodeChildren();

			parentEditor.NotifyUpdate();
		}

		this.AppendChild = function(childEditor) {
			self.InsertChild(childEditor, childEditors.length);
		}

		CreateChildEditors();
		RefreshChildUI();
	}

	function ActionBuilder(parentEditor) {
		var div = document.createElement("div");
		div.classList.add("actionBuilder");

		var addButton = document.createElement("button");
		addButton.classList.add("actionBuilderAdd");
		addButton.innerText = "add action";
		addButton.onclick = function() {
			div.classList.add("actionBuilderActive");
		}
		div.appendChild(addButton);

		function makeActionBuilderButton(text, createEditorFunc) {
			var actionBuilderButton = document.createElement("button");
			actionBuilderButton.classList.add("actionBuilderButton");
			actionBuilderButton.innerText = text;
			actionBuilderButton.onclick = function() {
				var editor = createEditorFunc();
				parentEditor.AppendChild(editor);
				div.classList.remove("actionBuilderActive");
			}
			return actionBuilderButton;
		}

		div.appendChild(
			makeActionBuilderButton(
				"dialog",
				function() {
					var printFunc = scriptUtils.CreateEmptyPrintFunc();
					var editor = new DialogEditor([printFunc], parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"sequence",
				function() {
					var node = scriptUtils.CreateSequenceBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"cycle",
				function() {
					var node = scriptUtils.CreateCycleBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"shuffle",
				function() {
					var node = scriptUtils.CreateShuffleBlock();
					var editor = new SequenceEditor(node, parentEditor);
					return editor;
				}));

		div.appendChild(
			makeActionBuilderButton(
				"conditional",
				function() {
					var node = scriptUtils.CreateIfBlock();
					var editor = new ConditionalEditor(node, parentEditor);
					return editor;
				}));

		var cancelButton = document.createElement("button");
		cancelButton.classList.add("actionBuilderButton");
		cancelButton.innerText = "cancel";
		cancelButton.onclick = function() {
			div.classList.remove("actionBuilderActive");
		}
		div.appendChild(cancelButton);

		this.GetElement = function() {
			return div;
		}
	}

	function DialogEditor(dialogNodeList, parentEditor) {
		// this hack is still annoying as heck
		var dialogNode = scriptUtils.CreateDialogBlock(dialogNodeList);

		var div = document.createElement("div");
		div.classList.add("dialogEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		// var span = document.createElement("div");
		// span.innerText = "dialog";
		// div.appendChild(span);

		var textArea = document.createElement("textarea");
		textArea.value = dialogNode.Serialize();
		div.appendChild(textArea);

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return dialogNode.children;
		}
	}

	function SequenceEditor(node, parentEditor) {
		var self = this;

		// this hack is terrible
		var sequenceNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("sequenceEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var span = document.createElement("span");
		span.innerText = sequenceNode.type; // "sequence";
		div.appendChild(span);

		var optionRootDiv = document.createElement("div");
		div.appendChild(optionRootDiv);

		var addOptionButton = document.createElement("button");
		addOptionButton.innerText = "add option";
		addOptionButton.onclick = function() {
			var optionNode = scriptUtils.CreateOptionBlock();
			var optionEditor = new SequenceOptionEditor(optionNode, self);
			optionRootDiv.appendChild(optionEditor.GetElement());
			optionEditors.push(optionEditor);

			parentEditor.NotifyUpdate();
		}
		div.appendChild(addOptionButton);

		this.GetElement = function() {
			return div;
		}

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

		var optionEditors = [];
		function CreateOptionEditors() {
			optionEditors = [];

			for (var i = 0; i < sequenceNode.options.length; i++) {
				var optionNode = sequenceNode.options[i];
				var optionEditor = new SequenceOptionEditor(optionNode, self);
				optionRootDiv.appendChild(optionEditor.GetElement());
				optionEditors.push(optionEditor);
			}
		}

		function RefreshOptionsUI() {
			optionRootDiv.innerHTML = "";
			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				optionRootDiv.appendChild(editor.GetElement());
			}
		}

		function UpdateNodeOptions() {
			var updatedOptions = [];

			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				updatedOptions = updatedOptions.concat(editor.GetNodes());
			}

			sequenceNode.options = updatedOptions;
		}

		CreateOptionEditors();
	}

	function SequenceOptionEditor(optionNode, parentEditor) {
		var div = document.createElement("div");
		div.classList.add("optionEditor");

		var topControlsDiv = document.createElement("div");
		topControlsDiv.classList.add("optionControls");
		div.appendChild(topControlsDiv);

		var orderControls = new OrderControls(this, parentEditor);
		topControlsDiv.appendChild(orderControls.GetElement());

		var blockEditor = new BlockEditor(optionNode, parentEditor);
		div.appendChild(blockEditor.GetElement());

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [optionNode];
		}
	}

	function ConditionalEditor(node, parentEditor) {
		var self = this;

		var conditionalNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("conditionalEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var span = document.createElement("span");
		span.innerText = "conditional";
		div.appendChild(span);

		var optionRootDiv = document.createElement("div");
		div.appendChild(optionRootDiv);

		var addOptionButton = document.createElement("button");
		addOptionButton.innerText = "add option";
		addOptionButton.onclick = function() {
			var conditionNode = scriptUtils.CreateCodeBlock();
			var resultNode = scriptUtils.CreateOptionBlock();
			var optionEditor = new ConditionalOptionEditor(conditionNode, resultNode, self);
			optionRootDiv.appendChild(optionEditor.GetElement());
			optionEditors.push(optionEditor);

			parentEditor.NotifyUpdate();
		}
		div.appendChild(addOptionButton);

		this.GetElement = function() {
			return div;
		}

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

		var optionEditors = [];
		function CreateOptionEditors() {
			optionEditors = [];

			for (var i = 0; i < conditionalNode.conditions.length; i++) {
				var conditionNode = conditionalNode.conditions[i];
				var resultNode = conditionalNode.results[i];
				var optionEditor = new ConditionalOptionEditor(conditionNode, resultNode, self);
				optionRootDiv.appendChild(optionEditor.GetElement());
				optionEditors.push(optionEditor);
			}
		}

		function RefreshOptionsUI() {
			optionRootDiv.innerHTML = "";
			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				optionRootDiv.appendChild(editor.GetElement());
			}
		}

		function UpdateNodeOptions() {
			var updatedConditions = [];
			var updatedResults = [];

			for (var i = 0; i < optionEditors.length; i++) {
				var editor = optionEditors[i];
				var nodes = editor.GetNodes();
				updatedConditions = updatedConditions.concat(nodes[0]);
				updatedResults = updatedResults.concat(nodes[1]);
			}

			conditionalNode.conditions = updatedConditions;
			conditionalNode.results = updatedResults;
		}

		CreateOptionEditors();
	}

	function ConditionalOptionEditor(conditionNode, resultNode, parentEditor) {
		var div = document.createElement("div");
		div.classList.add("optionEditor");

		var topControlsDiv = document.createElement("div");
		topControlsDiv.classList.add("optionControls");
		div.appendChild(topControlsDiv);

		var orderControls = new OrderControls(this, parentEditor);
		topControlsDiv.appendChild(orderControls.GetElement());

		// condition - WIP
		var textArea = document.createElement("textarea");
		textArea.classList.add("conditionEditor");
		textArea.value = conditionNode.Serialize();
		div.appendChild(textArea);

		// result
		var resultBlockEditor = new BlockEditor(resultNode, parentEditor);
		div.appendChild(resultBlockEditor.GetElement());

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			// this is kind of hacky...
			return [conditionNode, resultNode];
		}
	}

	// TODO
	function FunctionEditor(node) {
		var div = document.createElement("div");

		var span = document.createElement("span");
		span.innerText = "function";
		div.appendChild(span);

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [node];
		}
	}

	function OrderControls(editor, parentEditor) {
		var div = document.createElement("div");

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

		var deleteButton = document.createElement("button");
		// deleteButton.innerText = "delete";
		deleteButton.innerHTML = '<i class="material-icons">clear</i>';
		deleteButton.style.float = "right";
		deleteButton.onclick = function() {
			parentEditor.RemoveChild(editor);
		}
		div.appendChild(deleteButton);

		this.GetElement = function() {
			return div;
		}
	}
}