/*
	- DLG contains dialog contents
	- dialog contents are parsed into a tree of nodes
	- nodes are displayed using editors
*/

function DialogTool() {
	this.CreateEditor = function(dialogId) {
		var dialogStr = dialog[dialogId];
		var scriptRootNode = scriptInterpreter.Parse(dialogStr);
		var rootEditor = new BlockEditor(scriptRootNode);

		return rootEditor;
	}

	function BlockEditor(blockNode) {
		var div = document.createElement("div");

		var span = document.createElement("span");
		span.innerText = "block";
		div.appendChild(span);

		this.GetElement() {
			return div;
		}
	}

	function DialogEditor(dialogNodeList) {
		var div = document.createElement("div");

		var span = document.createElement("span");
		span.innerText = "dialog";
		div.appendChild(span);

		this.GetElement() {
			return div;
		}
	}

	function SequenceEditor(sequenceNode) {
		var div = document.createElement("div");

		var span = document.createElement("span");
		span.innerText = "sequence";
		div.appendChild(span);

		this.GetElement() {
			return div;
		}
	}

	function FunctionEditor(functionNode) {
		var div = document.createElement("div");

		var span = document.createElement("span");
		span.innerText = "function";
		div.appendChild(span);

		this.GetElement() {
			return div;
		}
	}
}