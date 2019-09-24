/*
**** NEW TODO ****
- refactor nodes to use templates of some kind
X add a function node
X move dialog block logic into parser
- auto populate the script builder menus (category, function name, later: function parameters)

- TODO
	- add nodes
		X dialog
		- sequence
		- cycle
		- shuffle
	X remove nodes
	X move nodes
	- drag nodes
	X make nesting clear
	- use real dialog renderer
	- minimize / maximize blocks
	- share more code between node editors
	- make order of nodes clearer (some kind of arrow?)
	X update game when nodes change
		X insert sequence nodes and so on if you try to type supported code into a dialog node text editor
			- this could be improved probably
	- figure out the bug w/ extra whitespace inside of sequences
	- can I create HTML templates for the blocks? so I don't have to specify everything in code?
	- swap order of items in sequence (and delete them)
	- inter-block movement of nodes
	- copy / cut / paste nodes
	- "workbench" area? for non-attached, non-deleted nodes

	change methods
		X UpdateChild
		X RemoveChild
		X InsertChild

NOTES
I could create a dialog block by doing post-processing of the nodes in each block
	- this would simplify some of the UI code
how do I treat the merging of dialog blocks? automatic? (sort of how it is now?) something you have to do on purpose?
blocks and nodes and editors oh my! need to sort out my terminology!!!
- having to assign parent node and is even at construction is a bit of a pain!! especially since those things need to change if the node moves...
- need to fix fucked up spacing with re-serialization of sequences
- need to be able to up / down / delete options in a sequence
- need to be able to insert actions, not just add them at the end
- need to be able to "pop out" nodes to a higher level (is dragging the best way to do this? cut and paste?)

IDEA: hidden iframe containing templates for all the nodes types, etc.!
*/

// TODO : rename? factory?
function ScriptEditor() {
	this.CreateEditor = function(actionId) {
		// var scriptRootNode = scriptInterpreter.Parse( scriptStr );
		// return new BlockNodeEditor(scriptRootNode, null);
		return new ActionEditor(actionId); // TODO ... do I even need this creator function anymore???
	}
} // ScriptEditor

function ActionEditor(actionId) {
	var scriptStr = action[actionId].source;
	var scriptRootNode = scriptInterpreter.Parse( scriptStr );
	var scriptEditor = new BlockNodeEditor(scriptRootNode, null);

	this.div = document.createElement("div");

	var triggerDiv = document.createElement("div");
	triggerDiv.classList.add("actionTriggerContainer");
	// triggerDiv.innerText = "trigger test";
	this.div.appendChild(triggerDiv);

	var triggerLabelSpan = document.createElement("span");
	triggerLabelSpan.innerText = "trigger: ";
	triggerDiv.appendChild(triggerLabelSpan);

	// TODO ... better UI?
	var triggerSelect = document.createElement("select");
	triggerDiv.appendChild(triggerSelect);
	var triggerOptions = ["dialog", "collide", "start", "step"];
	for (var i = 0; i < triggerOptions.length; i++) {
		var option = document.createElement("option");
		option.value = triggerOptions[i];
		option.text = triggerOptions[i];
		option.selected = action[actionId].trigger.type === triggerOptions[i];
		triggerSelect.appendChild(option);
	}
	triggerSelect.onchange = function() {
		// TODO : more complex triggers?
		action[actionId].trigger.type = triggerSelect.value;
		refreshGameData();
	}

	this.div.appendChild(scriptEditor.GetElement());

	this.GetElement = function() {
		return this.div;
	}

	scriptEditor.OnChangeHandler = function() {
		// TODO... respond to changes (needs to handle all cases, such as deletion!)
		// console.log("CHANGE!!!!");
		// console.log(scriptEditor.Serialize());
		// console.log(scriptEditor.VisualizeTree());
		action[actionId].source = scriptEditor.Serialize();
		refreshGameData();
		// TODO ... event for other UI elements? (also subscribe this)
	};
}

// TODO : name? editor or viewer? or something else?
function BlockNodeEditor(blockNode, parentNode) {
	Object.assign( this, new NodeEditorBase() );

	this.div.classList.add("blockNode");

	// var minimizeButton = document.createElement("button");
	// minimizeButton.innerText = "minimize";
	// this.div.appendChild(minimizeButton);

	var childEditors = [];

	function InitChildEditors(div) {
		childNodeEditors = [];

		for (var i = 0; i < blockNode.children.length; i++) {
			var childNode = blockNode.children[i];
			if (childNode.type === "sequence" || childNode.type === "cycle" || childNode.type === "shuffle") {
				var sequenceNodeEditor = new SequenceNodeEditor(childNode, self);
				div.appendChild(sequenceNodeEditor.GetElement());

				childEditors.push(sequenceNodeEditor);
			}
			else if (childNode.type === "function") {
				var functionNodeEditor = new FunctionNodeEditor(childNode, self);
				div.appendChild(functionNodeEditor.GetElement());

				childEditors.push(functionNodeEditor);
			}
			else if (childNode.type === "dialog") {
				var dialogNodeEditor = new DialogNodeEditor(childNode, self);
				div.appendChild(dialogNodeEditor.GetElement());

				childEditors.push(dialogNodeEditor);
			}
		}

		var actionBuilder = new ActionBuilder(self);
	}

	this.Serialize = function() {
		// TODO: I **need** to get rid of the triple quotes thing it sucks
		// return '"""\n' + blockNode.Serialize() + '\n"""';
		return blockNode.Serialize();
	}

	this.VisualizeTree = function() {
		var printVisitor = {
			Visit : function(node,depth) {
				console.log("-".repeat(depth) + "- " + node.ToString());
			},
		};

		blockNode.VisitAll(printVisitor);
	}

	this.SetNotifyChangeHandler = function(handler) {
		notifyChangeHandler = handler;
	}

	var self = this; // hacky!!!
	this.UpdateChild = function(childEditor) {
		UpdateNodeChildren();

		if (childEditor.RequiresFullRefresh()) { // TODO -- I wonder if it would be simpler to always do this?
			self.div.innerHTML = ""; // inefficient?
			InitChildEditors(self.div);
		}

		SendUpdateNotification();
	}

	this.RemoveChild = function(childEditor) {
		self.div.removeChild(childEditor.GetElement());
		childEditors.splice(childEditors.indexOf(childEditor),1);
		console.log(childEditors);

		// it's a little weird to me the way I've broken up these...
		UpdateNodeChildren();

		SendUpdateNotification();
	}

	this.IndexOfChild = function(childEditor) {
		return childEditors.indexOf(childEditor);
	}

	this.InsertChild = function(childEditor, index) {
		index = Math.max(index, 0);

		var beforeInsert = childEditors.slice(0,index);
		var afterInsert = childEditors.slice(index);

		// console.log(index);
		// console.log(beforeInsert);
		// console.log(afterInsert);

		childEditors = beforeInsert.concat([childEditor]).concat(afterInsert);

		// console.log(childEditors);

		UpdateNodeChildren();

		console.log(blockNode.children);

		self.div.innerHTML = ""; // inefficient?
		// InitChildEditors(self.div);
		for (var i = 0; i < childEditors.length; i++) {
			self.div.appendChild(childEditors[i].GetElement());
		}

		SendUpdateNotification();

		var actionBuilder = new ActionBuilder(self);
	}

	this.AppendChild = function(childEditor) {
		self.InsertChild(childEditor, childEditors.length);
	}

	function UpdateNodeChildren() {
		blockNode.children = [];
		for (var i = 0; i < childEditors.length; i++) {
			blockNode.AddChild(childEditors[i].GetNode());
		}
	}

	function SendUpdateNotification() {
		if (parentNode != null) {
			parentNode.UpdateChild(self);
		}

		if (self.OnChangeHandler != null) {
			self.OnChangeHandler();
		}
	}

	this.RequiresFullRefresh = function() {
		return false;
	}

	this.OnChangeHandler = null;

	InitChildEditors(this.div);
}

function DialogNodeEditor(dialogNode, parentNode) {
	Object.assign( this, new NodeEditorBase() );

	this.div.classList.add("dialogNode");

	var topDiv = document.createElement("div");
	topDiv.style.marginBottom = "4px";
	this.div.appendChild(topDiv);

	var span = document.createElement("span");
	span.innerText = "show dialog";
	// span.style.display = "block";
	topDiv.appendChild(span);

	var controlDiv = document.createElement("div");
	controlDiv.style.float = "right";
	topDiv.appendChild(controlDiv);

	var moveUpButton = document.createElement("button");
	moveUpButton.innerText = "up";
	moveUpButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex -= 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveUpButton);

	var moveDownButton = document.createElement("button");
	moveDownButton.innerText = "down";
	// deleteButton.style.float = "right";
	moveDownButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex += 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveDownButton);

	var deleteButton = document.createElement("button");
	deleteButton.innerText = "delete";
	// deleteButton.style.float = "right";
	deleteButton.onclick = function() {
		parentNode.RemoveChild(self);
	}
	controlDiv.appendChild(deleteButton);

	var textArea = document.createElement("textarea");
	textArea.value = dialogNode.Serialize();
	this.div.appendChild(textArea);

	var self = this;
	var OnChangeText = function() {
		// also hacky... make sure there is dialog content to parse!!
		if (textArea.value.length <= 0) {
			textArea.value = " ";
		}

		// HACKY AF way to pull the dialog node out of a root node
		dialogNode = scriptInterpreter.Parse(textArea.value).children[0];

		if (parentNode != null) {
			parentNode.UpdateChild(self);
		}
	}
	textArea.addEventListener("change", OnChangeText);
	textArea.addEventListener("keyup", OnChangeText);

	this.GetNode = function() {
		return dialogNode;
	}

	this.UpdateChild = function(childEditor) {
		// TODO ??
	}

	this.RequiresFullRefresh = function() {
		// TODO -- will this even work anymore? what about non-dialog functions???
		return dialogNode.children.some(function(node) {
			return node.type === "sequence" || node.type === "cycle" || node.type === "shuffle";
		});
	}
}

function SequenceNodeEditor(sequenceNode, parentNode) {
	Object.assign( this, new NodeEditorBase() );

	this.div.classList.add("sequenceNode");

	var topDiv = document.createElement("div");
	this.div.appendChild(topDiv);

	var span = document.createElement("span");
	span.innerText = sequenceNode.type;
	topDiv.appendChild(span);

	// TODO : THIS WHOLE THING IS A DUPLICATE
	var controlDiv = document.createElement("div");
	controlDiv.style.float = "right";
	topDiv.appendChild(controlDiv);

	var moveUpButton = document.createElement("button");
	moveUpButton.innerText = "up";
	moveUpButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex -= 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveUpButton);

	var moveDownButton = document.createElement("button");
	moveDownButton.innerText = "down";
	// deleteButton.style.float = "right";
	moveDownButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex += 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveDownButton);

	var deleteButton = document.createElement("button");
	deleteButton.innerText = "delete";
	// deleteButton.style.float = "right";
	deleteButton.onclick = function() {
		parentNode.RemoveChild(self);
	}
	controlDiv.appendChild(deleteButton);

	var optionRootDiv = document.createElement("div");
	for (var i = 0; i < sequenceNode.options.length; i++) {
		var optionBlockNode = sequenceNode.options[i];
		var optionBlockNodeEditor = new BlockNodeEditor(optionBlockNode, this);
		optionRootDiv.appendChild(optionBlockNodeEditor.GetElement());
	}
	this.div.appendChild(optionRootDiv);

	var addOptionButton = document.createElement("button");
	addOptionButton.innerText = "add option"; // TODO : what should the text here be? option? item? something else?
	addOptionButton.onclick = function() {
		var newOption = scriptUtils.CreateBlockNode();
		sequenceNode.options.push(newOption);

		var newOptionEditor = new BlockNodeEditor(newOption, self);
		optionRootDiv.appendChild(newOptionEditor.GetElement());

		parentNode.UpdateChild(self);
	}
	this.div.appendChild(addOptionButton);

	function Refresh() {
		this.div.innerHTML = "";
	}

	this.GetNode = function() {
		return sequenceNode;
	}

	var self = this;
	this.UpdateChild = function(childEditor) {
		if (parentNode != null) {
			parentNode.UpdateChild(self);
		}
	}

	this.RequiresFullRefresh = function() {
		return false; // TODO : move into base?
	}
}

// TODO : is this the right place to store these descriptions?
var FunctionDescriptions = {
	"moveLeft" : {
		text : "move this object one space left",
	},
	"moveRight" : {
		text : "move this object one space right",
	},
	"moveAway" : {
		text : "move this object one step away from the player",
	},
	"createObject" : {
		text : "create _",
		parameters : [ {name:"object"} ],
	},
	"destroyObject" : {
		text : "destroy this object",
	},
	"giveItem" : {
		text : "give the player one _",
		parameters : [ {name:"item"} ],
	},
	"takeItem" : {
		text : "take one _ from the player",
		parameters : [ {name:"item"} ],
	},
};

// TODO : too much copy / paste between these node editors :( -- I need templates!
function FunctionNodeEditor(functionNode, parentNode) {
	Object.assign( this, new NodeEditorBase() );

	var self = this; // I don't like this pattern :(

	this.div.classList.add("functionNode");

	var topDiv = document.createElement("div");
	topDiv.style.height = "30px"; // HACK!!!
	this.div.appendChild(topDiv);

	var funcDiv = document.createElement("div");
	this.div.appendChild(funcDiv);

	var createParameterInputChangeHandler = function(input, argumentIndex) {
		return function() {
			functionNode.arguments[argumentIndex] = scriptUtils.CreateLiteralNode(input.value);
			parentNode.UpdateChild(self);
		}
	}

	var description = FunctionDescriptions[functionNode.name];
	if (description != undefined && description != null) {
		// turn description into function UI
		var curDescriptionText = "";
		var curParameterIndex = 0;
		for (var i = 0; i < description.text.length; i++) {
			var char = description.text[i];

			if (char === "_") {
				var span = document.createElement("span");
				span.innerText = curDescriptionText;
				funcDiv.appendChild(span);

				// TODO -- fancier input based on parameter type!!
				var input = document.createElement("input");
				input.type = "text";
				input.size = 6;
				if (description.parameters &&
						description.parameters.length > curParameterIndex) {
					var param = description.parameters[curParameterIndex];
					input.placeholder = param.name;
				}
				if (functionNode.arguments.length > curParameterIndex) { // TODO -- what do I do if this is false??
					console.log(functionNode.arguments[curParameterIndex]);

					// TODO currently assumes it's a literal node! (but it might not be!!!)
					input.value = functionNode.arguments[curParameterIndex].value;
				}
				input.onchange = createParameterInputChangeHandler(input, curParameterIndex);
				funcDiv.appendChild(input);

				curParameterIndex++;
				curDescriptionText = "";
			}
			else {
				curDescriptionText += char;
			}
		}
		// leftover text from function description
		var span = document.createElement("span");
		span.innerText = curDescriptionText;
		funcDiv.appendChild(span);
	}
	else {
		// TODO : fallback UI
		var span = document.createElement("span");
		span.innerText = functionNode.name;
		funcDiv.appendChild(span);
	}

	// TODO : THIS WHOLE THING IS A DUPLICATE
	var controlDiv = document.createElement("div");
	controlDiv.style.float = "right";
	topDiv.appendChild(controlDiv);

	var moveUpButton = document.createElement("button");
	moveUpButton.innerText = "up";
	moveUpButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex -= 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveUpButton);

	var moveDownButton = document.createElement("button");
	moveDownButton.innerText = "down";
	// deleteButton.style.float = "right";
	moveDownButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex += 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveDownButton);

	var deleteButton = document.createElement("button");
	deleteButton.innerText = "delete";
	// deleteButton.style.float = "right";
	deleteButton.onclick = function() {
		parentNode.RemoveChild(self);
	}
	controlDiv.appendChild(deleteButton);

	this.GetNode = function() {
		return functionNode;
	}

	this.UpdateChild = function(childEditor) {
		// TODO ??
	}

	this.RequiresFullRefresh = function() {
		return false; // TODO : move into base?
	}
}

// TODO -- I think this was premature abstraction... probably need to refactor everything again!
function NodeEditorBase() {
	this.div = document.createElement("div");
	// this.div.classList.add(isEven ? "scriptNodeEven" : "scriptNodeOdd");

	this.GetElement = function() {
		return this.div;
	}
}

function ActionBuilder(parentBlock) {
	var actionBuilderRoot = document.createElement("div");
	actionBuilderRoot.classList.add("actionBuilder");
	parentBlock.div.appendChild(actionBuilderRoot);

	var addButton = document.createElement("button");
	addButton.innerText = "add action";
	addButton.classList.add("actionBuilderAdd");
	addButton.onclick = function() {
		actionBuilderRoot.classList.add("actionBuilderActive");
	};
	actionBuilderRoot.appendChild(addButton);

	var actionBuilderOptions = document.createElement("div");
	actionBuilderOptions.classList.add("actionBuilderOptions");
	actionBuilderRoot.appendChild(actionBuilderOptions);

	var addDialogButton = document.createElement("button");
	addDialogButton.innerText = "dialog";
	addDialogButton.onclick = function() {
		var dialogNode = scriptUtils.CreateEmptyDialogBlock();
		var dialogNodeEditor = new DialogNodeEditor(dialogNode, parentBlock);
		parentBlock.AppendChild(dialogNodeEditor);
	}
	actionBuilderOptions.appendChild(addDialogButton);

	var addSequenceButton = document.createElement("button");
	addSequenceButton.innerText = "sequence";
	addSequenceButton.onclick = function() {
		var sequenceNode = scriptUtils.CreateSequenceNode();
		var sequenceNodeEditor = new SequenceNodeEditor(sequenceNode, parentBlock);
		parentBlock.AppendChild(sequenceNodeEditor);
	}
	actionBuilderOptions.appendChild(addSequenceButton);

	var addCycleButton = document.createElement("button");
	addCycleButton.innerText = "cycle";
	addCycleButton.onclick = function() {
		var sequenceNode = scriptUtils.CreateCycleNode();
		var sequenceNodeEditor = new SequenceNodeEditor(sequenceNode, parentBlock);
		parentBlock.AppendChild(sequenceNodeEditor);
	}
	actionBuilderOptions.appendChild(addCycleButton);

	var addShuffleButton = document.createElement("button");
	addShuffleButton.innerText = "shuffle";
	addShuffleButton.onclick = function() {
		var sequenceNode = scriptUtils.CreateShuffleNode();
		var sequenceNodeEditor = new SequenceNodeEditor(sequenceNode, parentBlock);
		parentBlock.AppendChild(sequenceNodeEditor);
	}
	actionBuilderOptions.appendChild(addShuffleButton);

	function makeFunctionButton(name, friendlyName) {
		var addFunctionButton = document.createElement("button");
		addFunctionButton.innerText = friendlyName;
		addFunctionButton.onclick = function() {
			var functionNode = scriptUtils.CreateFunctionNode(name);
			var functionNodeEditor = new FunctionNodeEditor(functionNode, parentBlock);
			parentBlock.AppendChild(functionNodeEditor);
		}
		actionBuilderOptions.appendChild(addFunctionButton);
	}

	makeFunctionButton("moveLeft", "move left");
	makeFunctionButton("moveRight", "move right");
	makeFunctionButton("moveAway", "move away");
	makeFunctionButton("createObject", "create object");
	makeFunctionButton("destroyObject", "destroy object");
	makeFunctionButton("giveItem", "give item");
	makeFunctionButton("takeItem", "take item");

	var cancelButton = document.createElement("button");
	cancelButton.innerText = "cancel";
	cancelButton.classList.add("actionBuilderCancel");
	cancelButton.onclick = function() {
		actionBuilderRoot.classList.remove("actionBuilderActive");
	};
	actionBuilderOptions.appendChild(cancelButton);

	// console.log(addButton);
}