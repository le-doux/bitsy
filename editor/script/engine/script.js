function Script() {

this.CreateInterpreter = function() {
	return new Interpreter();
};

this.CreateUtils = function() {
	return new Utils();
};

var Interpreter = function() {
	var env = new Environment();
	var parser = new Parser( env );

	this.SetDialogBuffer = function(buffer) { env.SetDialogBuffer( buffer ); };

	// TODO -- maybe this should return a string instead othe actual script??
	this.Compile = function(scriptName, scriptStr) {
		// console.log("COMPILE");
		var script = parser.Parse( scriptStr );
		env.SetScript( scriptName, script );
	}
	this.Run = function(scriptName, exitHandler) { // Runs pre-compiled script
		var localEnv = new LocalEnvironment(env);

		var script = env.GetScript(scriptName);

		script.Eval( localEnv, function(result) { OnScriptReturn(localEnv, exitHandler); } );
	}
	this.Interpret = function(scriptStr, exitHandler) { // Compiles and runs code immediately
		// console.log("INTERPRET");
		var localEnv = new LocalEnvironment(env);
		var script = parser.Parse( scriptStr );
		script.Eval( localEnv, function(result) { OnScriptReturn(localEnv, exitHandler); } );
	}
	this.HasScript = function(name) { return env.HasScript(name); };

	this.ResetEnvironment = function() {
		env = new Environment();
		parser = new Parser( env );
	}

	this.Parse = function(scriptStr) { // parses a script but doesn't save it
		return parser.Parse( scriptStr );
	}
	this.Eval = function(scriptTree, exitHandler) { // runs a script stored externally
		scriptTree.Eval( env, function(result) { OnScriptReturn(result, exitHandler); } );
	}

	function OnScriptReturn(result, exitHandler) {
		if (exitHandler != null) {
			exitHandler(result);
		}
	}

	this.CreateExpression = function(expStr) {
		return parser.CreateExpression( expStr );
	}

	this.SetVariable = function(name,value,useHandler) {
		env.SetVariable(name,value,useHandler);
	}

	this.DeleteVariable = function(name,useHandler) {
		env.DeleteVariable(name,useHandler);
	}
	this.HasVariable = function(name) {
		return env.HasVariable(name);
	}

	this.SetOnVariableChangeHandler = function(onVariableChange) {
		env.SetOnVariableChangeHandler(onVariableChange);
	}
	this.GetVariableNames = function() {
		return env.GetVariableNames();
	}
	this.GetVariable = function(name) {
		return env.GetVariable(name);
	}

	function DebugVisualizeScriptTree(scriptTree) {
		var printVisitor = {
			Visit : function(node,depth) {
				console.log("-".repeat(depth) + "- " + node.ToString());
			},
		};

		scriptTree.VisitAll( printVisitor );
	}

	this.DebugVisualizeScriptTree = DebugVisualizeScriptTree;

	this.DebugVisualizeScript = function(scriptName) {
		DebugVisualizeScriptTree(env.GetScript(scriptName));
	}
}


var Utils = function() {
	// for editor ui
	this.CreateDialogBlock = function(children,doIndentFirstLine) {
		if(doIndentFirstLine === undefined) doIndentFirstLine = true;
		var block = new DialogBlockNode(doIndentFirstLine);
		for(var i = 0; i < children.length; i++) {
			block.AddChild( children[i] );
		}
		return block;
	}

	this.CreateOptionBlock = function() {
		var block = new DialogBlockNode(false);
		block.AddChild(new FuncNode("print", [new LiteralNode(" ")]));
		return block;
	}

	this.CreateEmptyPrintFunc = function() {
		return new FuncNode("print", [new LiteralNode(" ")]);
	}

	this.CreateFunctionBlock = function(name, initParamValues) {
		var parameters = [];
		for (var i = 0; i < initParamValues.length; i++) {
			parameters.push(new LiteralNode(initParamValues[i]));
		}

		var node = new FuncNode(name, parameters);
		var block = new CodeBlockNode();
		block.AddChild(node);
		return block;
	}

	this.CreateLiteralNode = function(str) {
		if (str === "true") {
			return new LiteralNode(true);
		}
		else if (str === "false") {
			return new LiteralNode(false);
		}
		else if (!isNaN(parseFloat(str))) {
			return new LiteralNode(parseFloat(str));
		}
		else {
			return new LiteralNode(str);
		}
	}

	this.CreateElseNode = function() {
		return new ElseNode();
	}

	this.CreateStringLiteralNode = function(str) {
		return new LiteralNode(str);
	}

	// TODO : need to split up code & dialog blocks :|
	this.CreateCodeBlock = function() {
		return new CodeBlockNode();
	}

	this.ChangeSequenceType = function(oldSequence,type) {
		if(type === "sequence") {
			return new SequenceNode( oldSequence.options );
		}
		else if(type === "cycle") {
			return new CycleNode( oldSequence.options );
		}
		else if(type === "shuffle") {
			return new ShuffleNode( oldSequence.options );
		}
		return oldSequence;
	}

	this.CreateSequenceBlock = function() {
		var option1 = new DialogBlockNode( false /*doIndentFirstLine*/ );
		option1.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var option2 = new DialogBlockNode( false /*doIndentFirstLine*/ );
		option2.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var sequence = new SequenceNode( [ option1, option2 ] );
		var block = new CodeBlockNode();
		block.AddChild( sequence );
		return block;
	}

	this.CreateCycleBlock = function() {
		var option1 = new DialogBlockNode( false /*doIndentFirstLine*/ );
		option1.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var option2 = new DialogBlockNode( false /*doIndentFirstLine*/ );
		option2.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var sequence = new CycleNode( [ option1, option2 ] );
		var block = new CodeBlockNode();
		block.AddChild( sequence );
		return block;
	}

	this.CreateShuffleBlock = function() {
		var option1 = new DialogBlockNode( false /*doIndentFirstLine*/ );
		option1.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var option2 = new DialogBlockNode( false /*doIndentFirstLine*/ );
		option2.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var sequence = new ShuffleNode( [ option1, option2 ] );
		var block = new CodeBlockNode();
		block.AddChild( sequence );
		return block;
	}

	this.CreateIfBlock = function() {
		var leftNode = new CodeBlockNode();
		leftNode.AddChild( new FuncNode("item", [new LiteralNode("0")] ) );
		var rightNode = new LiteralNode( 1 );
		var condition1 = new ExpNode("==", leftNode, rightNode );

		var condition2 = new ElseNode();

		var result1 = new DialogBlockNode();
		result1.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var result2 = new DialogBlockNode();
		result2.AddChild(new FuncNode("print", [new LiteralNode(" ")]));

		var ifNode = new IfNode( [ condition1, condition2 ], [ result1, result2 ] );
		var block = new CodeBlockNode();
		block.AddChild( ifNode );
		return block;
	}

	this.ReadDialogScript = function(lines, i) {
		var scriptStr = "";
		if (lines[i] === Sym.DialogOpen) {
			scriptStr += lines[i] + "\n";
			i++;
			while(lines[i] != Sym.DialogClose) {
				scriptStr += lines[i] + "\n";
				i++;
			}
			scriptStr += lines[i];
			i++;
		}
		else {
			scriptStr += lines[i];
		}
		return { script:scriptStr, index:i };
	}

	// TODO this.ReadCodeScript (reads through code open and close symbols), and this.ReadScript

	this.EnsureDialogBlockFormat = function(dialogStr) {
		// TODO -- what if it's already enclosed in dialog symbols??
		if(dialogStr.indexOf('\n') > -1) {
			dialogStr = Sym.DialogOpen + "\n" + dialogStr + "\n" + Sym.DialogClose;
		}
		return dialogStr;
	}

	this.RemoveDialogBlockFormat = function(source) {
		var sourceLines = source.split("\n");
		var dialogStr = "";
		if(sourceLines[0] === Sym.DialogOpen) {
			// multi line
			var i = 1;
			while (i < sourceLines.length && sourceLines[i] != Sym.DialogClose) {
				dialogStr += sourceLines[i] + (sourceLines[i+1] != Sym.DialogClose ? '\n' : '');
				i++;
			}
		}
		else {
			// single line
			dialogStr = source;
		}
		return dialogStr;
	}
}


/* BUILT-IN FUNCTIONS */ // TODO: better way to encapsulate these?
function deprecatedFunc(environment,parameters,onReturn) {
	console.log("BITSY SCRIPT WARNING: Tried to use deprecated function");
	onReturn(null);
}

function printFunc(environment,parameters,onReturn) {
	// console.log("PRINT FUNC");
	// console.log(parameters);
	if( parameters[0] != undefined && parameters[0] != null ) {
		// console.log(parameters[0]);
		// console.log(parameters[0].toString());
		// var textStr = parameters[0].toString();
		var textStr = "" + parameters[0];
		// console.log(textStr);
		var onFinishHandler = function() {
			// console.log("FINISHED PRINTING ---- SCRIPT");
			onReturn(null);
		}; // called when dialog is finished printing
		environment.GetDialogBuffer().AddText( textStr, onFinishHandler );
	}
	else {
		onReturn(null);
	}
}

function linebreakFunc(environment,parameters,onReturn) {
	// console.log("LINEBREAK FUNC");
	environment.GetDialogBuffer().AddLinebreak();
	onReturn(null);
}

function printDrawingFunc(environment,parameters,onReturn) {
	var drawingId = parameters[0];
	environment.GetDialogBuffer().AddDrawing( drawingId, function() {
		onReturn(null);
	});
}

function printSpriteFunc(environment,parameters,onReturn) {
	var spriteId = parameters[0];
	if(names.sprite.has(spriteId)) spriteId = names.sprite.get(spriteId); // id is actually a name
	var drawingId = sprite[spriteId].drw;
	printDrawingFunc(environment, [drawingId], onReturn);
}

function printTileFunc(environment,parameters,onReturn) {
	var tileId = parameters[0];
	if(names.tile.has(tileId)) tileId = names.tile.get(tileId); // id is actually a name
	var drawingId = tile[tileId].drw;
	printDrawingFunc(environment, [drawingId], onReturn);
}

function printItemFunc(environment,parameters,onReturn) {
	var itemId = parameters[0];
	if(names.item.has(itemId)) itemId = names.item.get(itemId); // id is actually a name
	var drawingId = item[itemId].drw;
	printDrawingFunc(environment, [drawingId], onReturn);
}

function printFontFunc(environment, parameters, onReturn) {
	var allCharacters = "";
	var font = fontManager.Get( fontName );
	var codeList = font.allCharCodes();
	for (var i = 0; i < codeList.length; i++) {
		allCharacters += String.fromCharCode(codeList[i]) + " ";
	}
	printFunc(environment, [allCharacters], onReturn);
}

function itemFunc(environment,parameters,onReturn) {
	var itemId = parameters[0];
	if(names.item.has(itemId)) itemId = names.item.get(itemId); // id is actually a name
	var itemCount = player().inventory[itemId] ? player().inventory[itemId] : 0; // TODO : ultimately the environment should include a reference to the game state
	// console.log("ITEM FUNC " + itemId + " " + itemCount);
	onReturn(itemCount);
}

function addOrRemoveTextEffect(environment,name) {
	if( environment.GetDialogBuffer().HasTextEffect(name) )
		environment.GetDialogBuffer().RemoveTextEffect(name);
	else
		environment.GetDialogBuffer().AddTextEffect(name);
}

function rainbowFunc(environment,parameters,onReturn) {
	addOrRemoveTextEffect(environment,"rbw");
	onReturn(null);
}

// TODO : should the colors use a parameter instead of special names?
function color1Func(environment,parameters,onReturn) {
	addOrRemoveTextEffect(environment,"clr1");
	onReturn(null);
}

function color2Func(environment,parameters,onReturn) {
	addOrRemoveTextEffect(environment,"clr2");
	onReturn(null);
}

function color3Func(environment,parameters,onReturn) {
	addOrRemoveTextEffect(environment,"clr3");
	onReturn(null);
}

function wavyFunc(environment,parameters,onReturn) {
	addOrRemoveTextEffect(environment,"wvy");
	onReturn(null);
}

function shakyFunc(environment,parameters,onReturn) {
	addOrRemoveTextEffect(environment,"shk");
	onReturn(null);
}

function narrateFunc(environment,parameters,onReturn) {
	isNarrating = true;
	dialogRenderer.SetCentered(true);
	onReturn(null);
}

function lockFunc(environment,parameters,onReturn) {
	environment.LockDefaultAction();
	onReturn(null);
}

function endFunc(environment,parameters,onReturn) {
	isEnding = true;
	onReturn(null);
}

function exitFunc(environment,parameters,onReturn) {
	player().room = parameters[0];
	player().x = parseInt(parameters[1]);
	player().y = parseInt(parameters[2]);
	curRoom = parameters[0];
	onReturn(null);
}

function giveItemFunc(environment,parameters,onReturn) {
	var itemId = parameters[0];
	var itemCount = parseInt(parameters[1]);

	if (player().inventory[itemId]) {
		player().inventory[itemId] += itemCount;
	}
	else {
		player().inventory[itemId] = itemCount;
	}

	if (onInventoryChanged != null) {
		onInventoryChanged(itemId);
	}

	onReturn(null);
}

function takeItemFunc(environment,parameters,onReturn) {
	var itemId = parameters[0];
	var itemCount = parseInt(parameters[1]);

	if (player().inventory[itemId]) {
		player().inventory[itemId] -= itemCount;

		if (player().inventory[itemId] < 0) {
			player().inventory[itemId] = 0;
		}
	}

	if (onInventoryChanged != null) {
		onInventoryChanged(itemId);
	}

	onReturn(null);
}

/* BUILT-IN OPERATORS */
function setExp(environment,left,right,onReturn) {
	// console.log("SET " + left.name);

	if(left.type != "variable") {
		// not a variable! return null and hope for the best D:
		onReturn( null );
		return;
	}

	right.Eval(environment,function(rVal) {
		environment.SetVariable( left.name, rVal );
		// console.log("VAL " + environment.GetVariable( left.name ) );
		left.Eval(environment,function(lVal) {
			onReturn( lVal );
		});
	});
}
function equalExp(environment,left,right,onReturn) {
	// console.log("EVAL EQUAL");
	// console.log(left);
	// console.log(right);
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal === rVal );
		});
	});
}
function greaterExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal > rVal );
		});
	});
}
function lessExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal < rVal );
		});
	});
}
function greaterEqExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal >= rVal );
		});
	});
}
function lessEqExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal <= rVal );
		});
	});
}
function multExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal * rVal );
		});
	});
}
function divExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal / rVal );
		});
	});
}
function addExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal + rVal );
		});
	});
}
function subExp(environment,left,right,onReturn) {
	right.Eval(environment,function(rVal){
		left.Eval(environment,function(lVal){
			onReturn( lVal - rVal );
		});
	});
}

/* ENVIRONMENT */
var Environment = function() {
	var dialogBuffer = null;
	this.SetDialogBuffer = function(buffer) { dialogBuffer = buffer; };
	this.GetDialogBuffer = function() { return dialogBuffer; };

	var functionMap = new Map();
	functionMap.set("print", printFunc);
	functionMap.set("say", printFunc);
	functionMap.set("br", linebreakFunc);
	functionMap.set("item", itemFunc);
	functionMap.set("rbw", rainbowFunc);
	functionMap.set("clr1", color1Func);
	functionMap.set("clr2", color2Func);
	functionMap.set("clr3", color3Func);
	functionMap.set("wvy", wavyFunc);
	functionMap.set("shk", shakyFunc);
	functionMap.set("printSprite", printSpriteFunc);
	functionMap.set("printTile", printTileFunc);
	functionMap.set("printItem", printItemFunc);
	functionMap.set("debugOnlyPrintFont", printFontFunc); // DEBUG ONLY
	functionMap.set("narrate", narrateFunc);
	functionMap.set("lock", lockFunc);
	functionMap.set("end", endFunc);
	functionMap.set("exit", exitFunc);
	functionMap.set("giveItem", giveItemFunc);
	functionMap.set("takeItem", takeItemFunc);

	this.HasFunction = function(name) { return functionMap.has(name); };
	this.EvalFunction = function(name,parameters,onReturn,env) {
		if (env == undefined || env == null) {
			env = this;
		}

		functionMap.get(name)(env, parameters, onReturn);
	}

	var variableMap = new Map();

	this.HasVariable = function(name) { return variableMap.has(name); };
	this.GetVariable = function(name) { return variableMap.get(name); };
	this.SetVariable = function(name,value,useHandler) {
		// console.log("SET VARIABLE " + name + " = " + value);
		if(useHandler === undefined) useHandler = true;
		variableMap.set(name, value);
		if(onVariableChangeHandler != null && useHandler){
			onVariableChangeHandler(name);
		}
	};
	this.DeleteVariable = function(name,useHandler) {
		if(useHandler === undefined) useHandler = true;
		if(variableMap.has(name)) {
			variableMap.delete(name);
			if(onVariableChangeHandler != null && useHandler) {
				onVariableChangeHandler(name);
			}
		}
	};

	var operatorMap = new Map();
	operatorMap.set("=", setExp);
	operatorMap.set("==", equalExp);
	operatorMap.set(">", greaterExp);
	operatorMap.set("<", lessExp);
	operatorMap.set(">=", greaterEqExp);
	operatorMap.set("<=", lessEqExp);
	operatorMap.set("*", multExp);
	operatorMap.set("/", divExp);
	operatorMap.set("+", addExp);
	operatorMap.set("-", subExp);

	this.HasOperator = function(sym) { return operatorMap.get(sym); };
	this.EvalOperator = function(sym,left,right,onReturn) {
		operatorMap.get( sym )( this, left, right, onReturn );
	}

	var scriptMap = new Map();
	this.HasScript = function(name) { return scriptMap.has(name); };
	this.GetScript = function(name) { return scriptMap.get(name); };
	this.SetScript = function(name,script) { scriptMap.set(name, script); };

	var onVariableChangeHandler = null;
	this.SetOnVariableChangeHandler = function(onVariableChange) {
		onVariableChangeHandler = onVariableChange;
	}
	this.GetVariableNames = function() {
		return Array.from( variableMap.keys() );
	}
}

// Local environment for a single run of a script: knows local context
var LocalEnvironment = function(parentEnvironment) {
	// this.SetDialogBuffer // not allowed in local environment?
	this.GetDialogBuffer = function() { return parentEnvironment.GetDialogBuffer(); };

	this.HasFunction = function(name) { return parentEnvironment.HasFunction(name); };
	this.EvalFunction = function(name,parameters,onReturn,env) {
		if (env == undefined || env == null) {
			env = this;
		}

		parentEnvironment.EvalFunction(name,parameters,onReturn,env);
	}

	this.HasVariable = function(name) { return parentEnvironment.HasVariable(name); };
	this.GetVariable = function(name) { return parentEnvironment.GetVariable(name); };
	this.SetVariable = function(name,value,useHandler) { parentEnvironment.SetVariable(name,value,useHandler); };
	// this.DeleteVariable // not needed in local environment?

	this.HasOperator = function(sym) { return parentEnvironment.HasOperator(sym); };
	this.EvalOperator = function(sym,left,right,onReturn,env) {
		if (env == undefined || env == null) {
			env = this;
		}

		parentEnvironment.EvalOperator(sym,left,right,onReturn,env);
	};

	// TODO : I don't *think* any of this is required by the local environment
	// this.HasScript
	// this.GetScript
	// this.SetScript

	// TODO : pretty sure these debug methods aren't required by the local environment either
	// this.SetOnVariableChangeHandler
	// this.GetVariableNames

	/* Here's where specific local context data goes:
	 * so far it's just whether we want to stop the default action
	 * that usually comes after this action
	 * but there will be more later (I swear!)
	*/
	var isLocked = false;
	this.LockDefaultAction = function() { isLocked = true; };
	this.IsDefaultActionLocked = function() { return isLocked; };
}

function leadingWhitespace(depth) {
	var str = "";
	for(var i = 0; i < depth; i++) {
		str += "  "; // two spaces per indent
	}
	// console.log("WHITESPACE " + depth + " ::" + str + "::");
	return str;
}

/* NODES */
var TreeRelationship = function() {
	this.parent = null;
	this.children = [];
	this.AddChild = function(node) {
		this.children.push( node );
		node.parent = this;
	};

	this.VisitAll = function(visitor, depth) {
		if (depth == undefined || depth == null) {
			depth = 0;
		}

		visitor.Visit( this, depth );
		for( var i = 0; i < this.children.length; i++ ) {
			this.children[i].VisitAll( visitor, depth + 1 );
		}
	};
}

var DialogBlockNode = function(doIndentFirstLine) {
	Object.assign( this, new TreeRelationship() );
	// Object.assign( this, new Runnable() );
	this.type = "dialog_block";

	this.Eval = function(environment, onReturn) {
		// console.log("EVAL BLOCK " + this.children.length);

		if (this.onEnter != null) {
			this.onEnter();
		}

		var lastVal = null;
		var i = 0;

		function evalChildren(children, done) {
			if (i < children.length) {
				// console.log(">> CHILD " + i);
				children[i].Eval(environment, function(val) {
					// console.log("<< CHILD " + i);
					lastVal = val;
					i++;
					evalChildren(children,done);
				});
			}
			else {
				done();
			}
		};

		var self = this;
		evalChildren(this.children, function() {
			if( self.onExit != null ) {
				self.onExit();
			}
			onReturn(lastVal);
		});
	}

	if (doIndentFirstLine === undefined) {
		doIndentFirstLine = true; // This is just for serialization
	}

	this.Serialize = function(depth) {
		if (depth === undefined) {
			depth = 0;
		}

		var str = "";
		var lastNode = null;

		for (var i = 0; i < this.children.length; i++) {

			var curNode = this.children[i];

			var shouldIndentFirstLine = (i == 0 && doIndentFirstLine);
			var shouldIndentAfterLinebreak = (lastNode && lastNode.type === "function" && lastNode.name === "br");
			var shouldIndentCodeBlock = false;

			if (i > 0 && curNode.type === "code_block" && !isBlockWithNoNewline(curNode)) {
				str += "\n";
				shouldIndentCodeBlock = true;
			}

			if (shouldIndentFirstLine || shouldIndentAfterLinebreak || shouldIndentCodeBlock) {
				str += leadingWhitespace(depth);
			}

			str += curNode.Serialize(depth);
			lastNode = curNode;
		}

		return str;
	}

	this.ToString = function() {
		return this.type;
	};
}

var CodeBlockNode = function() {
	Object.assign( this, new TreeRelationship() );
	this.type = "code_block";

	this.Eval = function(environment, onReturn) {
		// console.log("EVAL BLOCK " + this.children.length);

		if (this.onEnter != null) {
			this.onEnter();
		}

		var lastVal = null;
		var i = 0;

		function evalChildren(children, done) {
			if (i < children.length) {
				// console.log(">> CHILD " + i);
				children[i].Eval(environment, function(val) {
					// console.log("<< CHILD " + i);
					lastVal = val;
					i++;
					evalChildren(children,done);
				});
			}
			else {
				done();
			}
		};

		var self = this;
		evalChildren(this.children, function() {
			if( self.onExit != null ) {
				self.onExit();
			}
			onReturn(lastVal);
		});
	}

	this.Serialize = function(depth) {
		if(depth === undefined) {
			depth = 0;
		}

		// console.log("SERIALIZE BLOCK!!!");
		// console.log(depth);
		// console.log(doIndentFirstLine);

		var str = "{"; // todo: increase scope of Sym?

		// TODO : do code blocks ever have more than one child anymore????
		for (var i = 0; i < this.children.length; i++) {
			var curNode = this.children[i];
			str += curNode.Serialize(depth);
		}

		str += "}";

		return str;
	}

	this.ToString = function() {
		return this.type;
	};
}

function isBlockWithNoNewline(node) {
	return isTextEffectBlock(node); // || isMultilineListBlock(node);
}

var textEffectBlockNames = ["clr1", "clr2", "clr3", "wvy", "shk", "rbw", "printSprite", "printItem", "printTile"];
function isTextEffectBlock(node) {
	if (node.type === "code_block") {
		if (node.children.length > 0 && node.children[0].type === "function") {
			var func = node.children[0];
			return textEffectBlockNames.indexOf(func.name) != -1;
		}
	}
	return false;
}

var listBlockTypes = ["sequence", "cycle", "shuffle", "if"];
function isMultilineListBlock(node) {
	if (node.type === "code_block") {
		if (node.children.length > 0) {
			var child = node.children[0];
			return listBlockTypes.indexOf(child.type) != -1;
		}
	}
	return false;
}

var FuncNode = function(name,args) {
	Object.assign( this, new TreeRelationship() );
	// Object.assign( this, new Runnable() );
	this.type = "function";
	this.name = name;
	this.args = args;

	this.Eval = function(environment,onReturn) {

		if(this.onEnter != null) {
			this.onEnter();
		}

		var argumentValues = [];
		var i = 0;
		function evalArgs(args,done) {
			if(i < args.length) {
				// Evaluate each argument
				args[i].Eval( environment, function(val) {
					argumentValues.push( val );
					i++;
					evalArgs(args,done);
				} );
			}
			else {
				done();
			}
		};
		var self = this; // hack to deal with scope
		evalArgs( this.args, function() {
			if(self.onExit != null) {
				self.onExit();
			}

			environment.EvalFunction(self.name, argumentValues, onReturn);
		} );
	}

	this.Serialize = function(depth) {
		var isDialogBlock = this.parent.type === "dialog_block";
		if(isDialogBlock && this.name === "print") {
			// TODO this could cause problems with "real" print functions
			return this.args[0].value; // first argument should be the text of the {print} func
		}
		else if(isDialogBlock && this.name === "br") {
			return "\n";
		}
		else {
			var str = "";
			str += this.name;
			for(var i = 0; i < this.args.length; i++) {
				str += " ";
				str += this.args[i].Serialize(depth);
			}
			return str;
		}
	}

	this.ToString = function() {
		return this.type + " " + this.name;
	};
}

var LiteralNode = function(value) {
	Object.assign( this, new TreeRelationship() );
	// Object.assign( this, new Runnable() );
	this.type = "literal";
	this.value = value;

	this.Eval = function(environment,onReturn) {
		onReturn(this.value);
	}

	this.Serialize = function(depth) {
		var str = "";

		if(this.value === null)
			return str;

		if(typeof this.value === "string") str += '"';
		str += this.value;
		if(typeof this.value === "string") str += '"';

		return str;
	}

	this.ToString = function() {
		return this.type + " " + this.value;
	};
}

var VarNode = function(name) {
	Object.assign( this, new TreeRelationship() );
	// Object.assign( this, new Runnable() );
	this.type = "variable";
	this.name = name;

	this.Eval = function(environment,onReturn) {
		// console.log("EVAL " + this.name + " " + environment.HasVariable(this.name) + " " + environment.GetVariable(this.name));
		if( environment.HasVariable(this.name) )
			onReturn( environment.GetVariable( this.name ) );
		else
			onReturn(null); // not a valid variable -- return null and hope that's ok
	} // TODO: might want to store nodes in the variableMap instead of values???

	this.Serialize = function(depth) {
		var str = "" + this.name;
		return str;
	}

	this.ToString = function() {
		return this.type + " " + this.name;
	};
}

var ExpNode = function(operator, left, right) {
	Object.assign( this, new TreeRelationship() );
	this.type = "operator";
	this.operator = operator;
	this.left = left;
	this.right = right;

	this.Eval = function(environment,onReturn) {
		// console.log("EVAL " + this.operator);
		var self = this; // hack to deal with scope
		environment.EvalOperator( this.operator, this.left, this.right, 
			function(val){
				// console.log("EVAL EXP " + self.operator + " " + val);
				onReturn(val);
			} );
		// NOTE : sadly this pushes a lot of complexity down onto the actual operator methods
	}

	this.Serialize = function(depth) {
		var isNegativeNumber = this.operator === "-" && this.left.type === "literal" && this.left.value === null;

		if(!isNegativeNumber) {
			var str = "";
			str += this.left.Serialize(depth);
			str += " " + this.operator + " ";
			str += this.right.Serialize(depth);
			return str;
		}
		else {
			return this.operator + this.right.Serialize(depth); // hacky but seems to work
		}
	}

	this.VisitAll = function(visitor, depth) {
		if (depth == undefined || depth == null) {
			depth = 0;
		}

		visitor.Visit( this, depth );
		if(this.left != null)
			this.left.VisitAll( visitor, depth + 1 );
		if(this.right != null)
			this.right.VisitAll( visitor, depth + 1 );
	};

	this.ToString = function() {
		return this.type + " " + this.operator;
	};
}

var SequenceBase = function() {
	this.Serialize = function(depth) {
		var str = "";
		str += this.type + "\n";
		for (var i = 0; i < this.options.length; i++) {
			// console.log("SERIALIZE SEQUENCE ");
			// console.log(depth);
			str += leadingWhitespace(depth + 1) + Sym.List + " " + this.options[i].Serialize(depth + 2) + "\n";
		}
		str += leadingWhitespace(depth);
		return str;
	}

	this.VisitAll = function(visitor, depth) {
		if (depth == undefined || depth == null) {
			depth = 0;
		}

		visitor.Visit( this, depth );
		for( var i = 0; i < this.options.length; i++ ) {
			this.options[i].VisitAll( visitor, depth + 1 );
		}
	};

	this.ToString = function() {
		return this.type;
	};
}

var SequenceNode = function(options) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new SequenceBase() );
	this.type = "sequence";
	this.options = options;

	var index = 0;
	this.Eval = function(environment,onReturn) {
		// console.log("SEQUENCE " + index);
		this.options[index].Eval( environment, onReturn );

		var next = index + 1;
		if(next < this.options.length)
			index = next;
	}
}

var CycleNode = function(options) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new SequenceBase() );
	this.type = "cycle";
	this.options = options;

	var index = 0;
	this.Eval = function(environment,onReturn) {
		// console.log("CYCLE " + index);
		this.options[index].Eval( environment, onReturn );

		var next = index + 1;
		if(next < this.options.length)
			index = next;
		else
			index = 0;
	}
}

var ShuffleNode = function(options) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new SequenceBase() );
	this.type = "shuffle";
	this.options = options;

	var optionsShuffled = [];
	function shuffle(options) {
		optionsShuffled = [];
		var optionsUnshuffled = options.slice();
		while(optionsUnshuffled.length > 0) {
			var i = Math.floor( Math.random() * optionsUnshuffled.length );
			optionsShuffled.push( optionsUnshuffled.splice(i,1)[0] );
		}
	}
	shuffle(this.options);

	var index = 0;
	this.Eval = function(environment,onReturn) {
		// OLD RANDOM VERSION
		// var index = Math.floor(Math.random() * this.options.length);
		// this.options[index].Eval( environment, onReturn );

		optionsShuffled[index].Eval( environment, onReturn );
		
		index++;
		if (index >= this.options.length) {
			shuffle(this.options);
			index = 0;
		}
	}
}

var IfNode = function(conditions, results, isSingleLine) {
	Object.assign( this, new TreeRelationship() );
	this.type = "if";
	this.conditions = conditions;
	this.results = results;

	this.Eval = function(environment,onReturn) {
		// console.log("EVAL IF");
		var i = 0;
		var self = this;
		function TestCondition() {
			// console.log("EVAL " + i);
			self.conditions[i].Eval(environment, function(val) {
				// console.log(val);
				if(val == true) {
					self.results[i].Eval(environment, onReturn);
				}
				else if(i+1 < self.conditions.length) {
					i++;
					TestCondition(); // test next condition
				}
				else {
					onReturn(null); // out of conditions and none were true
				}
			});
		};
		TestCondition();
	}

	if(isSingleLine === undefined) isSingleLine = false; // This is just for serialization

	this.Serialize = function(depth) {
		var str = "";
		if(isSingleLine) {
			str += this.conditions[0].Serialize() + " ? " + this.results[0].Serialize();
			if(this.conditions.length > 1 && this.conditions[1].type === "else")
				str += " : " + this.results[1].Serialize();
		}
		else {
			str += "\n";
			for (var i = 0; i < this.conditions.length; i++) {
				str += leadingWhitespace(depth + 1) + Sym.List + " " + this.conditions[i].Serialize(depth) + " ?\n";
				str += this.results[i].Serialize(depth + 2) + "\n";
			}
			str += leadingWhitespace(depth);
		}
		return str;
	}

	this.IsSingleLine = function() {
		return isSingleLine;
	}

	this.VisitAll = function(visitor, depth) {
		if (depth == undefined || depth == null) {
			depth = 0;
		}

		visitor.Visit( this, depth );
		for( var i = 0; i < this.conditions.length; i++ ) {
			this.conditions[i].VisitAll( visitor, depth + 1 );
		}
		for( var i = 0; i < this.results.length; i++ ) {
			this.results[i].VisitAll( visitor, depth + 1 );
		}
	};

	this.ToString = function() {
		return this.type + " " + this.mode;
	};
}

var ElseNode = function() {
	Object.assign( this, new TreeRelationship() );
	this.type = "else";

	this.Eval = function(environment,onReturn) {
		onReturn(true);
	}

	this.Serialize = function() {
		return "else";
	}

	this.ToString = function() {
		return this.type + " " + this.mode;
	};
}

var Sym = {
	DialogOpen : '"""',
	DialogClose : '"""',
	CodeOpen : "{",
	CodeClose : "}",
	Linebreak : "\n", // just call it "break" ?
	Separator : ":",
	List : "-",
	String : '"'
};

var Parser = function(env) {
	var environment = env;

	this.Parse = function(scriptStr) {
		var state = new ParserState(new DialogBlockNode(), scriptStr);

		if (state.MatchAhead(Sym.DialogOpen)) {
			// multi-line dialog block
			var dialogStr = state.ConsumeBlock(Sym.DialogOpen + Sym.Linebreak, Sym.DialogClose);
			state = new ParserState(new DialogBlockNode(), dialogStr);
			state = ParseDialog(state);
		}
		else {
			// single-line dialog block
			state = ParseDialog(state);
		}

		return state.rootNode;
	};

	var ParserState = function( rootNode, str ) {
		this.rootNode = rootNode;
		this.curNode = this.rootNode;

		var sourceStr = str;
		var i = 0;
		this.Index = function() { return i; };
		this.Count = function() { return sourceStr.length; };
		this.Done = function() { return i >= sourceStr.length; };
		this.Char = function() { return sourceStr[i]; };
		this.Step = function(n) { if(n===undefined) n=1; i += n; };
		this.MatchAhead = function(str) {
			// console.log(str);
			str = "" + str; // hack to turn single chars into strings
			// console.log(str);
			// console.log(str.length);
			for(var j = 0; j < str.length; j++) {
				if( i + j >= sourceStr.length )
					return false;
				else if( str[j] != sourceStr[i+j] )
					return false;
			}
			return true;
		}
		this.Peak = function(end) {
			var str = "";
			var j = i;
			// console.log(j);
			while(j < sourceStr.length && end.indexOf( sourceStr[j] ) == -1 ) {
				str += sourceStr[j];
				j++;
			}
			// console.log("PEAK ::" + str + "::");
			return str;
		}
		this.ConsumeBlock = function( open, close ) {
			var startIndex = i;

			var matchCount = 0;
			if( this.MatchAhead( open ) ) {
				matchCount++;
				this.Step( open.length );
			}

			while( matchCount > 0 && !this.Done() ) {
				if( this.MatchAhead( close ) ) {
					matchCount--;
					this.Step( close.length );
				}
				else if( this.MatchAhead( open ) ) {
					matchCount++;
					this.Step( open.length );
				}
				else {
					this.Step();
				}
			}

			// console.log("!!! " + startIndex + " " + i);

			return sourceStr.slice( startIndex + open.length, i - close.length );
		}
		this.Print = function() { console.log(sourceStr); };
		this.Source = function() { return sourceStr; };
	};

	/*
		ParseDialog():
		This function adds {print} nodes and linebreak {br} nodes to display text,
		interleaved with bracketed code nodes for functions and flow control,
		such as text effects {shk} {wvy} or sequences like {cycle} and {shuffle}.
		The parsing of those code blocks is handled by ParseCodeBlock.

		The trickiest part is figuring out which newline (\n) characters should actually
		be translated into {br} commands that are displayed in the dialog box, and which
		are ignore-able whitespace used to make {code} commands easier to read.

		The rules for newlines are:
		- there should be a linebreak {br} between each pair of *consecutive* dialog lines
		- a dialog line is defined as any line that either:
			- contains dialog text (any text outside of a code block)
			- *or* is entirely empty (no text, no code)
		- lines *only* containing {code} blocks are not dialog lines

		NOTE TO SELF: all the state I'm storing in here feels like
		evidence that the parsing system kind of broke down at this point :(
		Maybe it would feel better if I move into the "state" object
	*/
	function ParseDialog(state) {
		var curLineNodeList = [];
		var curText = "";
		var curLineIsEmpty = true;
		var curLineContainsDialogText = false;
		var prevLineIsDialogLine = false;

		var curLineIsDialogLine = function() {
			return curLineContainsDialogText || curLineIsEmpty;
		}

		var resetLineStateForNewLine = function() {
			prevLineIsDialogLine = curLineIsDialogLine();
			curLineContainsDialogText = false;
			curLineIsEmpty = true;
			curText = "";
			curLineNodeList = [];
		}

		var tryAddTextNodeToList = function() {
			if (curText.length > 0) {
				var printNode = new FuncNode("print", [new LiteralNode(curText)]);
				curLineNodeList.push(printNode);

				curText = "";
				curLineIsEmpty = false;
				curLineContainsDialogText = true;
			}
		}

		var addCodeNodeToList = function() {
			var codeSource = state.ConsumeBlock(Sym.CodeOpen, Sym.CodeClose);
			var codeState = new ParserState(new CodeBlockNode(), codeSource);
			codeState = ParseCode(codeState);
			var codeBlockNode = codeState.rootNode;
			curLineNodeList.push(codeBlockNode);

			curLineIsEmpty = false;
		}

		var tryAddLinebreakNodeToList = function() {
			if (prevLineIsDialogLine && curLineIsDialogLine()) {
				var linebreakNode = new FuncNode("br", []);
				curLineNodeList.unshift(linebreakNode);
			}
		}

		var addLineNodesToParent = function() {
			for (var i = 0; i < curLineNodeList.length; i++) {
				state.curNode.AddChild(curLineNodeList[i]);
			}
		}

		while (!state.Done()) {
			if (state.MatchAhead(Sym.CodeOpen)) { // process code block
				// add any buffered text to a print node, and parse the code
				tryAddTextNodeToList();
				addCodeNodeToList();
			}
			else if (state.MatchAhead(Sym.Linebreak)) { // process new line
				// add any buffered text to a print node, 
				// and add a linebreak if we are between two dialog lines
				tryAddTextNodeToList();
				tryAddLinebreakNodeToList();

				// add stored nodes for this line to the parent node we are building,
				// and reset state for the next line
				addLineNodesToParent();
				resetLineStateForNewLine();

				state.Step();
			}
			else {
				// continue adding text to the current text buffer
				curText += state.Char();
				state.Step();
			}
		}

		// make sure we don't leave anything behind:
		// add buffered text to a print node and add all nodes
		// to the current parent node
		tryAddTextNodeToList();
		addLineNodesToParent();

		return state;
	}

	function ParseDialogBlock(state) {
		var dialogStr = state.ConsumeBlock( Sym.DialogOpen, Sym.DialogClose );

		var dialogState = new ParserState(new DialogBlockNode(), dialogStr);
		dialogState = ParseDialog( dialogState );

		state.curNode.AddChild( dialogState.rootNode );

		return state;
	}

	function ParseIf(state) {
		var conditionStrings = [];
		var resultStrings = [];
		var curIndex = -1;
		var isNewline = true;
		var isConditionDone = false;
		var codeBlockCount = 0;

		while( !state.Done() ) {
			if(state.Char() === Sym.CodeOpen)
				codeBlockCount++;
			else if(state.Char() === Sym.CodeClose)
				codeBlockCount--;

			var isWhitespace = (state.Char() === " " || state.Char() === "\t");
			var isSkippableWhitespace = isNewline && isWhitespace;
			var isNewListItem = isNewline && (codeBlockCount <= 0) && (state.Char() === Sym.List);

			if(isNewListItem) {
				curIndex++;
				isConditionDone = false;
				conditionStrings[curIndex] = "";
				resultStrings[curIndex] = "";
			}
			else if(curIndex > -1) {
				if(!isConditionDone) {
					if(state.Char() === "?" || state.Char() === "\n") { // TODO: use Sym
						// end of condition
						isConditionDone = true;
					}
					else {
						// read in condition
						conditionStrings[curIndex] += state.Char();
					}
				}
				else {
					// read in result
					if(!isSkippableWhitespace)
						resultStrings[curIndex] += state.Char();
				}
			}

			isNewline = (state.Char() === Sym.Linebreak) || isSkippableWhitespace || isNewListItem;

			state.Step();
		}

		// console.log("PARSE IF:");
		// console.log(conditionStrings);
		// console.log(resultStrings);

		var conditions = [];
		for(var i = 0; i < conditionStrings.length; i++) {
			var str = conditionStrings[i].trim();
			if(str === "else") {
				conditions.push( new ElseNode() );
			}
			else {
				var exp = CreateExpression( str );
				conditions.push( exp );
			}
		}

		var results = [];
		for(var i = 0; i < resultStrings.length; i++) {
			var str = resultStrings[i];
			var dialogBlockState = new ParserState(new DialogBlockNode(), str);
			dialogBlockState = ParseDialog( dialogBlockState );
			var dialogBlock = dialogBlockState.rootNode;
			results.push( dialogBlock );
		}

		state.curNode.AddChild( new IfNode( conditions, results ) );

		return state;
	}

	function IsSequence(str) {
		// console.log("IsSequence? " + str);
		return str === "sequence" || str === "cycle" || str === "shuffle";
	}

	// TODO: don't forget about eating whitespace
	function ParseSequence(state, sequenceType) {
		// console.log("SEQUENCE " + sequenceType);
		state.Print();

		var isNewline = false;
		var itemStrings = [];
		var curItemIndex = -1; // -1 indicates not reading an item yet
		var codeBlockCount = 0;

		while( !state.Done() ) {
			if(state.Char() === Sym.CodeOpen)
				codeBlockCount++;
			else if(state.Char() === Sym.CodeClose)
				codeBlockCount--;

			var isWhitespace = (state.Char() === " " || state.Char() === "\t");
			var isSkippableWhitespace = isNewline && isWhitespace;
			var isNewListItem = isNewline && (codeBlockCount <= 0) && (state.Char() === Sym.List);

			if(isNewListItem) {
				// console.log("found next list item");
				curItemIndex++;
				itemStrings[curItemIndex] = "";
			}
			else if(curItemIndex > -1) {
				if(!isSkippableWhitespace)
					itemStrings[curItemIndex] += state.Char();
			}

			isNewline = (state.Char() === Sym.Linebreak) || isSkippableWhitespace || isNewListItem;

			// console.log(state.Char());
			state.Step();
		}
		// console.log(itemStrings);
		// console.log("SEQUENCE DONE");

		var options = [];
		for(var i = 0; i < itemStrings.length; i++) {
			var str = itemStrings[i];
			var dialogBlockState = new ParserState(new DialogBlockNode(false /* doIndentFirstLine */), str);
			dialogBlockState = ParseDialog( dialogBlockState );
			var dialogBlock = dialogBlockState.rootNode;
			options.push( dialogBlock );
		}

		// console.log(options);

		if(sequenceType === "sequence")
			state.curNode.AddChild( new SequenceNode( options ) );
		else if(sequenceType === "cycle")
			state.curNode.AddChild( new CycleNode( options ) );
		else if(sequenceType === "shuffle")
			state.curNode.AddChild( new ShuffleNode( options ) );

		return state;
	}

	function ParseFunction(state, funcName) {
		console.log("~~~ PARSE FUNCTION " + funcName);

		var args = [];

		var curSymbol = "";
		function OnSymbolEnd() {
			curSymbol = curSymbol.trim();
			// console.log("PARAMTER " + curSymbol);
			args.push( StringToValue(curSymbol) );
			// console.log(args);
			curSymbol = "";
		}

		while( !( state.Char() === "\n" || state.Done() ) ) {
			if( state.MatchAhead(Sym.CodeOpen) ) {
				var codeBlockState = new ParserState(new CodeBlockNode(), state.ConsumeBlock(Sym.CodeOpen, Sym.CodeClose));
				codeBlockState = ParseCode( codeBlockState );
				var codeBlock = codeBlockState.rootNode;
				args.push( codeBlock );
				curSymbol = "";
			}
			else if( state.MatchAhead(Sym.String) ) {
				/* STRING LITERAL */
				var str = state.ConsumeBlock(Sym.String, Sym.String);
				// console.log("STRING " + str);
				args.push( new LiteralNode(str) );
				curSymbol = "";
			}
			else if(state.Char() === " " && curSymbol.length > 0) {
				OnSymbolEnd();
			}
			else {
				curSymbol += state.Char();
			}
			state.Step();
		}

		if(curSymbol.length > 0) {
			OnSymbolEnd();
		}

		state.curNode.AddChild( new FuncNode( funcName, args ) );

		return state;
	}

	function IsValidVariableName(str) {
		var reg = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
		var isValid = reg.test(str);
		// console.log("VALID variable??? " + isValid);
		return isValid;
	}

	function StringToValue(valStr) {
		if(valStr[0] === Sym.CodeOpen) {
			// CODE BLOCK!!!
			var codeStr = (new ParserState( null, valStr )).ConsumeBlock(Sym.CodeOpen, Sym.CodeClose); //hacky
			var codeBlockState = new ParserState(new CodeBlockNode(), codeStr);
			codeBlockState = ParseCode( codeBlockState );
			return codeBlockState.rootNode;
		}
		else if(valStr[0] === Sym.String) {
			// STRING!!
			// console.log("STRING");
			var str = "";
			var i = 1;
			while (i < valStr.length && valStr[i] != Sym.String) {
				str += valStr[i];
				i++;
			}
			// console.log(str);
			return new LiteralNode( str );
		}
		else if(valStr === "true") {
			// BOOL
			return new LiteralNode( true );
		}
		else if(valStr === "false") {
			// BOOL
			return new LiteralNode( false );
		}
		else if( !isNaN(parseFloat(valStr)) ) {
			// NUMBER!!
			// console.log("NUMBER!!! " + valStr);
			return new LiteralNode( parseFloat(valStr) );
		}
		else if(IsValidVariableName(valStr)) {
			// VARIABLE!!
			// console.log("VARIABLE");
			return new VarNode(valStr); // TODO : check for valid potential variables
		}
		else {
			// uh oh
			return new LiteralNode(null);
		}
	}

	var setSymbol = "=";
	var ifSymbol = "?";
	var elseSymbol = ":";
	var operatorSymbols = ["==", ">=", "<=", ">", "<", "-", "+", "/", "*"]; // operators need to be in reverse order of precedence
	function CreateExpression(expStr) {
		console.log("CREATE EXPRESSION --- " + expStr);

		expStr = expStr.trim();

		function IsInsideString(index) {
			var inString = false;
			for(var i = 0; i < expStr.length; i++) {
				if(expStr[i] === Sym.String)
					inString = !inString;

				if(index === i)
					return inString;
			}
			return false;
		}

		function IsInsideCode(index) {
			var count = 0;
			for(var i = 0; i < expStr.length; i++) {
				if(expStr[i] === Sym.CodeOpen)
					count++;
				else if(expStr[i] === Sym.CodeClose)
					count--;

				if(index === i)
					return count > 0;
			}
			return false;
		}

		var operator = null;

		// set is special because other operator can look like it, and it has to go first in the order of operations
		var setIndex = expStr.indexOf(setSymbol);
		if( setIndex > -1 && !IsInsideString(setIndex) && !IsInsideCode(setIndex) ) { // it might be a set operator
			if( expStr[setIndex+1] != "=" && expStr[setIndex-1] != ">" && expStr[setIndex-1] != "<" ) {
				// ok it actually IS a set operator and not ==, >=, or <=
				operator = setSymbol;
				var variableName = expStr.substring(0,setIndex).trim(); // TODO : valid variable name testing
				var left = IsValidVariableName(variableName) ? new VarNode( variableName ) : new LiteralNode(null);
				var right = CreateExpression( expStr.substring(setIndex+setSymbol.length) );
				var exp = new ExpNode( operator, left, right );
				return exp;
			}
		}

		// special if "expression" for single-line if statements
		var ifIndex = expStr.indexOf(ifSymbol);
		if( ifIndex > -1 && !IsInsideString(ifIndex) && !IsInsideCode(ifIndex) ) {
			operator = ifSymbol;
			var conditionStr = expStr.substring(0,ifIndex).trim();
			var conditions = [ CreateExpression(conditionStr) ];

			var resultStr = expStr.substring(ifIndex+ifSymbol.length);
			var results = [];
			function AddResult(str) {
				var dialogBlockState = new ParserState(new DialogBlockNode(), str);
				dialogBlockState = ParseDialog( dialogBlockState );
				var dialogBlock = dialogBlockState.rootNode;
				results.push( dialogBlock );
			}

			var elseIndex = resultStr.indexOf(elseSymbol); // does this need to test for strings?
			if(elseIndex > -1) {
				conditions.push( new ElseNode() );

				var elseStr = resultStr.substring(elseIndex+elseSymbol.length);
				var resultStr = resultStr.substring(0,elseIndex);

				AddResult( resultStr.trim() );
				AddResult( elseStr.trim() );
			}
			else {
				AddResult( resultStr.trim() );
			}

			return new IfNode( conditions, results, true /*isSingleLine*/ );
		}

		for( var i = 0; (operator == null) && (i < operatorSymbols.length); i++ ) {
			var opSym = operatorSymbols[i];
			var opIndex = expStr.indexOf( opSym );
			if( opIndex > -1 && !IsInsideString(opIndex) && !IsInsideCode(opIndex) ) {
				operator = opSym;
				var left = CreateExpression( expStr.substring(0,opIndex) );
				var right = CreateExpression( expStr.substring(opIndex+opSym.length) );
				var exp = new ExpNode( operator, left, right );
				return exp;
			}
		}

		if( operator == null ) {
			return StringToValue(expStr);
		}
	}
	this.CreateExpression = CreateExpression;

	function IsWhitespace(str) {
		return ( str === " " || str === "\t" || str === "\n" );
	}

	function IsExpression(str) {
		var tempState = new ParserState(null, str); // hacky
		var nonWhitespaceCount = 0;

		while (!tempState.Done()) {
			if( IsWhitespace(tempState.Char()) ) {
				tempState.Step(); // consume whitespace
			}
			else if( tempState.MatchAhead(Sym.CodeOpen) ) {
				tempState.ConsumeBlock( Sym.CodeOpen, Sym.CodeClose );
			}
			else {
				nonWhitespaceCount++;
				tempState.Step();
			}
		}

		var isExpression = nonWhitespaceCount > 0;
		return isExpression;
	}

	function ParseExpression(state) {
		var line = state.Source(); // state.Peak( [Sym.Linebreak] ); // TODO : remove the linebreak thing
		// console.log("EXPRESSION " + line);
		var exp = CreateExpression( line );
		// console.log(exp);
		state.curNode.AddChild( exp );
		state.Step( line.length );
		return state;
	}

	function ParseCode(state) {
		console.log("PARSE CODE --- " + state.Source());

		// skip leading whitespace
		while (IsWhitespace(state.Char())) {
			state.Step();
		}

		if( state.Char() === Sym.List && (state.Peak([]).indexOf("?") > -1) ) { // TODO : symbols? matchahead?
			// console.log("PEAK IF " + state.Peak( ["?"] ));
			state = ParseIf( state );
		}
		else if( environment.HasFunction( state.Peak( [" "] ) ) ) { // TODO --- what about newlines???
			var funcName = state.Peak( [" "] );
			state.Step( funcName.length );
			state = ParseFunction( state, funcName );
		}
		else if( IsSequence( state.Peak( [" ", Sym.Linebreak] ) ) ) {
			var sequenceType = state.Peak( [" ", Sym.Linebreak] );
			state.Step( sequenceType.length );
			state = ParseSequence( state, sequenceType );
		}
		else if (IsExpression(state.Source())) {
			state = ParseExpression(state);
		}

		// just go to the end now
		while (!state.Done()) {
			state.Step();
		}

		return state;
	}

	function ParseCodeBlock(state) {
		var codeStr = state.ConsumeBlock( Sym.CodeOpen, Sym.CodeClose );
		var codeState = new ParserState(new CodeBlockNode(), codeStr);
		codeState = ParseCode( codeState );
		state.curNode.AddChild( codeState.rootNode );
		return state;
	}

}

} // Script()