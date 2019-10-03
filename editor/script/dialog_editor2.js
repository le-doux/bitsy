/*
	- DLG contains dialog contents
	- dialog contents are parsed into a tree of nodes
	- nodes are displayed using editors

	how much of the old editor code can I re-use?

	do I need to make *any* changes to the parser?
		- remove code blocks (probably)
		- make functions, sequences, etc direct instead of wrapped (possibly)
		- pre-group dialog blocks (less likely)
*/

function DialogTool() {
	this.CreateEditor = function(dialogId) {
		var dialogStr = dialog[dialogId];
		var scriptRootNode = scriptInterpreter.Parse(dialogStr);

		scriptInterpreter.DebugVisualizeScriptTree(scriptRootNode);

		var rootEditor = new BlockEditor(scriptRootNode);

		return rootEditor;
	}

	function BlockEditor(blockNode) {
		var div = document.createElement("div");
		div.classList.add("blockEditor");

		this.GetElement = function() {
			return div;
		}

		function CreateChildEditors() {
			// build the editors
			var childEditors = [];

			function isBlock(node) { return node.type === "block"; };
			function isChildType(node,type) { return node.children[0].type === type; };
			function isIf(node) { return isBlock(node) && isChildType(node,"if") && !node.children[0].IsSingleLine(); };
			function isSeq(node) { return isBlock(node) && (isChildType(node,"sequence") || isChildType(node,"cycle") || isChildType(node,"shuffle")); };

			var dialogNodeList = [];
			function addText() {
				if (dialogNodeList.length > 0) {
					console.log("TEXT BLOCK!!");
					var editor = new DialogEditor(dialogNodeList);
					childEditors.push(editor);

					dialogNodeList = [];
				}
			}

			for (var i = 0; i < blockNode.children.length; i++) {
				var node = blockNode.children[i];
				if (isIf(node)) {
					addText();

					console.log("IF NODE!!");
					var editor = new ConditionalEditor(node);
					childEditors.push(editor);
				}
				else if (isSeq(node)) {
					addText();

					console.log("SEQ NODE!!");
					var editor = new SequenceEditor(node);
					childEditors.push(editor);
				}
				else {
					dialogNodeList.push(node);
				}
			}

			addText();

			// add them to the UI (TODO : separate this out later)
			for (var i = 0; i < childEditors.length; i++) {
				var editor = childEditors[i];

				div.appendChild(editor.GetElement());
			}
		}

		CreateChildEditors();
	}

	function DialogEditor(dialogNodeList) {
		// this hack is still annoying as heck
		var dialogNode = scriptUtils.CreateDialogBlock(dialogNodeList);

		var div = document.createElement("div");
		div.classList.add("dialogEditor");

		var span = document.createElement("span");
		span.innerText = "dialog";
		div.appendChild(span);

		var textArea = document.createElement("textarea");
		textArea.value = dialogNode.Serialize();
		div.appendChild(textArea);

		this.GetElement = function() {
			return div;
		}
	}

	function SequenceEditor(node) {
		// this hack is terrible
		var sequenceNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("sequenceEditor");

		var span = document.createElement("span");
		span.innerText = "sequence";
		div.appendChild(span);

		this.GetElement = function() {
			return div;
		}

		function CreateOptionEditors() {
			var optionEditors = []

			for (var i = 0; i < sequenceNode.options.length; i++) {
				var optionBlockNode = sequenceNode.options[i];
				var editor = new BlockEditor(optionBlockNode);
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

	function ConditionalEditor(node) {
		var conditionalNode = node.children[0];

		var div = document.createElement("div");
		div.classList.add("conditionalEditor");

		var span = document.createElement("span");
		span.innerText = "conditional";
		div.appendChild(span);

		this.GetElement = function() {
			return div;
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
				var editor = new BlockEditor(resultBlockNode);
				resultEditors.push(editor);
				optionDiv.appendChild(resultEditors[i].GetElement());
			}
		}

		CreateOptionEditors();
	}

	function FunctionEditor(functionNode) {
		var div = document.createElement("div");

		var span = document.createElement("span");
		span.innerText = "function";
		div.appendChild(span);

		this.GetElement = function() {
			return div;
		}
	}
}