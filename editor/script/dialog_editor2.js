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
	- add actions
	- delete blocks
	- move blocks
	- save changes
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

		this.GetElement = function() {
			return div;
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
			div.innerHTML = "";

			for (var i = 0; i < childEditors.length; i++) {
				var editor = childEditors[i];

				div.appendChild(editor.GetElement());
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

		CreateChildEditors();
		RefreshChildUI();
	}

	function DialogEditor(dialogNodeList, parentEditor) {
		// this hack is still annoying as heck
		var dialogNode = scriptUtils.CreateDialogBlock(dialogNodeList);

		var div = document.createElement("div");
		div.classList.add("dialogEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var span = document.createElement("span");
		span.innerText = "dialog";
		div.appendChild(span);

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
		// this hack is terrible
		var sequenceNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("sequenceEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var span = document.createElement("span");
		span.innerText = "sequence";
		div.appendChild(span);

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [node];
		}

		function CreateOptionEditors() {
			var optionEditors = []

			for (var i = 0; i < sequenceNode.options.length; i++) {
				var optionBlockNode = sequenceNode.options[i];
				var editor = new BlockEditor(optionBlockNode, null /*TODO*/);
				optionEditors.push(editor);
			}

			//
			for (var i = 0; i < optionEditors.length; i++) {
				var optionDiv = document.createElement("div");
				optionDiv.classList.add("sequenceOption");
				div.appendChild(optionDiv);

				optionDiv.appendChild(optionEditors[i].GetElement());
			}
		}

		CreateOptionEditors();
	}

	function ConditionalEditor(node, parentEditor) {
		var conditionalNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("conditionalEditor");

		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());

		var span = document.createElement("span");
		span.innerText = "conditional";
		div.appendChild(span);

		this.GetElement = function() {
			return div;
		}

		this.GetNodes = function() {
			return [node];
		}

		function CreateOptionEditors() {
			var resultEditors = []

			for (var i = 0; i < conditionalNode.conditions.length; i++) {
				// option
				var optionDiv = document.createElement("div");
				optionDiv.classList.add("conditionOption");
				div.appendChild(optionDiv);

				// condition
				var textArea = document.createElement("textarea");
				textArea.value = conditionalNode.conditions[i].Serialize();
				optionDiv.appendChild(textArea);

				// result
				var resultBlockNode = conditionalNode.results[i];
				var editor = new BlockEditor(resultBlockNode, null /*TODO*/);
				resultEditors.push(editor);
				optionDiv.appendChild(resultEditors[i].GetElement());
			}
		}

		CreateOptionEditors();
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
		moveUpButton.innerText = "up";
		div.appendChild(moveUpButton);

		var moveDownButton = document.createElement("button");
		moveDownButton.innerText = "down";
		div.appendChild(moveDownButton);

		var deleteButton = document.createElement("button");
		deleteButton.innerText = "delete";
		deleteButton.onclick = function() {
			parentEditor.RemoveChild(editor);
		}
		div.appendChild(deleteButton);

		this.GetElement = function() {
			return div;
		}
	}
}