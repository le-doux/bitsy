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
		// console.log("RUN");
		env.GetScript( scriptName )
			.Eval( env, function() { if(exitHandler!=null) exitHandler(); } );

		// console.log("SERIALIZE!!!!");
		// console.log( env.GetScript( scriptName ).Serialize() );
	}
	this.Interpret = function(scriptStr, exitHandler) { // Compiles and runs code immediately
		// console.log("INTERPRET");
		var script = parser.Parse( scriptStr );
		script.Eval( env, function() { if(exitHandler!=null) exitHandler(); } );
	}
	this.HasScript = function(name) { return env.HasScript(name); };

	this.ResetEnvironment = function() {
		env = new Environment();
		parser = new Parser( env );
	}

	// TODO : move to utils?
	// for reading in dialog from the larger file format
	this.ReadDialogScript = function(lines, i) {
		return parser.ReadDialogScript(lines,i);
	}

	this.Parse = function(scriptStr) { // parses a script but doesn't save it
		return parser.Parse( scriptStr );
	}
	this.Eval = function(scripTree, exitHandler) { // runs a script stored externally
		scripTree.Eval( env, function() { if(exitHandler!=null) exitHandler(); } );
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
}


var Utils = function() {
	// for editor ui
	this.CreateDialogBlock = function(children,doIndentFirstLine) {
		if(doIndentFirstLine === undefined) doIndentFirstLine = true;
		var block = new BlockNode( BlockMode.Dialog, doIndentFirstLine );
		for(var i = 0; i < children.length; i++) {
			block.AddChild( children[i] );
		}
		return block;
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
		var option1 = new BlockNode( BlockMode.Dialog, false /*doIndentFirstLine*/ );
		var option2 = new BlockNode( BlockMode.Dialog, false /*doIndentFirstLine*/ );
		var sequence = new SequenceNode( [ option1, option2 ] );
		var block = new BlockNode( BlockMode.Code );
		block.AddChild( sequence );
		return block;
	}

	this.CreateIfBlock = function() {
		var leftNode = new BlockNode( BlockMode.Code );
		leftNode.AddChild( new FuncNode("item", [new LiteralNode("0")] ) );
		var rightNode = new LiteralNode( 1 );
		var condition1 = new ExpNode("==", leftNode, rightNode );

		var condition2 = new ElseNode();

		var result1 = new BlockNode( BlockMode.Dialog );
		var result2 = new BlockNode( BlockMode.Dialog );

		var ifNode = new IfNode( [ condition1, condition2 ], [ result1, result2 ] );
		var block = new BlockNode( BlockMode.Code );
		block.AddChild( ifNode );
		return block;
	}
}


/* BUILT-IN FUNCTIONS */ // TODO: better way to encapsulate these?
function sayFunc(environment,parameters,onReturn) {
	// console.log("SAY FUNC");
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
	else
		onReturn(null);
}

function linebreakFunc(environment,parameters,onReturn) {
	// console.log("LINEBREAK FUNC");
	environment.GetDialogBuffer().AddLinebreak();
	onReturn(null);
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
	functionMap.set("say", sayFunc);
	functionMap.set("br", linebreakFunc);
	functionMap.set("item", itemFunc);
	functionMap.set("rbw", rainbowFunc);
	functionMap.set("clr1", color1Func);
	functionMap.set("clr2", color2Func);
	functionMap.set("clr3", color3Func);
	functionMap.set("wvy", wavyFunc);
	functionMap.set("shk", shakyFunc);

	this.HasFunction = function(name) { return functionMap.has(name); };
	this.EvalFunction = function(name,parameters,onReturn) {
		// console.log(functionMap);
		// console.log(name);
		functionMap.get( name )( this, parameters, onReturn );
	}

	var variableMap = new Map();

	this.HasVariable = function(name) { return variableMap.has(name); };
	this.GetVariable = function(name) { return variableMap.get(name); };
	this.SetVariable = function(name,value,useHandler) {
		if(useHandler === undefined) useHandler = true;
		variableMap.set(name, value);
		if(onVariableChangeHandler != null && useHandler)
			onVariableChangeHandler(name);
	};
	this.DeleteVariable = function(name,useHandler) {
		if(useHandler === undefined) useHandler = true;
		if(variableMap.has(name)) {
			variableMap.delete(name);
			if(onVariableChangeHandler != null && useHandler)
				onVariableChangeHandler(name);
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
}

var BlockMode = {
	Code : "code",
	Dialog : "dialog"
};

var BlockNode = function(mode, doIndentFirstLine) {
	Object.assign( this, new TreeRelationship() );
	// Object.assign( this, new Runnable() );
	this.type = "block";
	this.mode = mode;

	this.Eval = function(environment,onReturn) {

		if( this.onEnter != null ) this.onEnter();

		var lastVal = null;
		var i = 0;
		function evalChildren(children,done) {
			if(i < children.length) {
				children[i].Eval( environment, function(val) {
					lastVal = val;
					i++;
					evalChildren(children,done);
				} );
			}
			else {
				done();
			}
		};
		var self = this;
		evalChildren( this.children, function() {
			if( self.onExit != null ) self.onExit();
			onReturn(lastVal);
		} );
	}

	if(doIndentFirstLine === undefined) doIndentFirstLine = true; // This is just for serialization

	this.Serialize = function(depth) {
		if(depth === undefined) depth = 0;

		console.log("SERIALIZE BLOCK!!!");
		console.log(depth);
		console.log(doIndentFirstLine);

		var str = "";
		var lastNode = null;
		if (this.mode === BlockMode.Code) str += "{"; // todo: increase scope of Sym?
		for (var i = 0; i < this.children.length; i++) {

			if(this.children[i].type === "block" && lastNode && lastNode.type === "block")
				str += "\n";

			var shouldIndentFirstLine = (i == 0 && doIndentFirstLine);
			var shouldIndentAfterLinebreak = (lastNode && lastNode.type === "function" && lastNode.name === "br");
			if(this.mode === BlockMode.Dialog && (shouldIndentFirstLine || shouldIndentAfterLinebreak))
				str += leadingWhitespace(depth);
			str += this.children[i].Serialize(depth);
			lastNode = this.children[i];
		}
		if (this.mode === BlockMode.Code) str += "}";
		return str;
	}
}

var FuncNode = function(name,arguments) {
	Object.assign( this, new TreeRelationship() );
	// Object.assign( this, new Runnable() );
	this.type = "function";
	this.name = name;
	this.arguments = arguments;

	this.Eval = function(environment,onReturn) {

		if( this.onEnter != null ) this.onEnter();

		// console.log("FUNC");
		// console.log(this.arguments);
		var argumentValues = [];
		var i = 0;
		function evalArgs(arguments,done) {
			if(i < arguments.length) {
				// Evaluate each argument
				arguments[i].Eval( environment, function(val) {
					argumentValues.push( val );
					i++;
					evalArgs(arguments,done);
				} );
			}
			else {
				done();
			}
		};
		var self = this; // hack to deal with scope
		evalArgs( this.arguments, function() {
			// Then evaluate the function
			// console.log("ARGS");
			// console.log(argumentValues);

			if( self.onExit != null ) self.onExit();

			environment.EvalFunction( self.name, argumentValues, onReturn );
		} );
	}

	this.Serialize = function(depth) {
		var isDialogBlock = this.parent.mode && this.parent.mode === BlockMode.Dialog;
		if(isDialogBlock && this.name === "say") {
			// TODO this could cause problems with "real" say functions
			return this.arguments[0].value; // first argument should be the text of the {say} func
		}
		else if(isDialogBlock && this.name === "br") {
			return "\n";
		}
		else {
			var str = "";
			str += this.name;
			for(var i = 0; i < this.arguments.length; i++) {
				str += " ";
				str += this.arguments[i].Serialize(depth);
			}
			return str;
		}
	}
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
		if(typeof this.value === "string") str += '"';
		str += this.value;
		if(typeof this.value === "string") str += '"';
		return str;
	}
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
}

var ExpNode = function(operator, left, right) {
	Object.assign( this, new TreeRelationship() );
	this.type = "operator";
	this.operator = operator;
	this.left = left;
	this.right = right;

	this.Eval = function(environment,onReturn) {
		var self = this; // hack to deal with scope
		environment.EvalOperator( this.operator, this.left, this.right, 
			function(val){
				// console.log("EVAL EXP " + self.operator + " " + val);
				onReturn(val);
			} );
		// NOTE : sadly this pushes a lot of complexity down onto the actual operator methods
	}

	this.Serialize = function(depth) {
		var str = "";
		str += this.left.Serialize(depth);
		str += " " + this.operator + " ";
		str += this.right.Serialize(depth);
		return str;
	}
}

var SequenceBase = function() {
	this.Serialize = function(depth) {
		var str = "";
		str += this.type + "\n";
		for (var i = 0; i < this.options.length; i++) {
			console.log("SERIALIZE SEQUENCE ");
			console.log(depth);
			str += leadingWhitespace(depth + 1) + "- " + this.options[i].Serialize(depth + 2) + "\n";
		}
		str += leadingWhitespace(depth);
		return str;
	}
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
				str += leadingWhitespace(depth + 1) + "- " + this.conditions[i].Serialize(depth) + " ?\n";
				str += this.results[i].Serialize(depth + 2) + "\n";
			}
			str += leadingWhitespace(depth);
		}
		return str;
	}
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
}

var Parser = function(env) {
	var environment = env;

	var Sym = {
		// DialogOpen : "/\"",
		// DialogClose : "\"/",
		DialogOpen : '"""',
		DialogClose : '"""',
		CodeOpen : "{",
		CodeClose : "}",
		Linebreak : "\n", // just call it "break" ?
		Separator : ":",
		List : "*",
		String : '"'
	};

	this.Parse = function(scriptStr) {
		// console.log("NEW PARSE!!!!!!");

		// TODO : make this work for single-line, no dialog block scripts

		var state = new ParserState( new BlockNode(BlockMode.Dialog), scriptStr );

		if( state.MatchAhead(Sym.DialogOpen) ) {
			// multi-line dialog block
			var dialogStr = state.ConsumeBlock( Sym.DialogOpen, Sym.DialogClose );
			state = new ParserState( new BlockNode(BlockMode.Dialog), dialogStr );
			state = ParseDialog( state );
		}
		// else if( state.MatchAhead(Sym.CodeOpen) ) { // NOTE: This causes problems when you lead with a code block
		// 	// code-block: should this ever happen?
		// 	state = ParseCodeBlock( state );
		// }
		else {
			// single-line dialog block
			state = ParseDialog( state );
		}

		// console.log( state.rootNode );
		return state.rootNode;
	};

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
		this.Print = function() {console.log(sourceStr);};
	};

	function ParseDialog(state) {
		// console.log("PARSE DIALOG");
		state.Print();

		// for linebreak logic: add linebreaks after lines with dialog or empty lines (if it's not the very first line)
		var hasBlock = false;
		var hasDialog = false;
		var isFirstLine = true;

		var text = "";
		var addTextNode = function() {
			console.log("TEXT " + text.length);
			if (text.length > 0) {
				// console.log("TEXT " + text);
				// console.log("text!!");
				// console.log([text]);

				state.curNode.AddChild( new FuncNode( "say", [new LiteralNode(text)] ) );
				text = "";

				hasDialog = true;
			}
		}

		while ( !state.Done() ) {

			if( state.MatchAhead(Sym.CodeOpen) ) {
				addTextNode();
				state = ParseCodeBlock( state );

				hasBlock = true;
			}
			// NOTE: nested dialog blocks disabled for now
			// else if( state.MatchAhead(Sym.DialogOpen) ) {
			// 	addTextNode();
			// 	state = ParseDialogBlock( state ); // These can be nested (should they though???)

			// 	hasBlock = true;
			// }
			else {
				if ( state.MatchAhead(Sym.Linebreak) ) {
					addTextNode();

					/*
					NOTES:
					linebreaks SHOULD happen on
					- lines with text (including the first or last line)
					- empty lines (that are NOT the first or last line)
					linebreaks should NOT happen on
					- lines with only CODE blocks
					- empty FIRST or LAST lines

					also, apparently:
					- NEVER line break on the last line
					*/
					var isLastLine = (state.Index() + 1) == state.Count();
					// console.log("block " + hasBlock);
					// console.log("dialog " + hasDialog);
					var isEmptyLine = !hasBlock && !hasDialog;
					// console.log("empty " + isEmptyLine);
					var isValidEmptyLine = isEmptyLine && !(isFirstLine || isLastLine);
					// console.log("valid empty " + isValidEmptyLine);
					var shouldAddLinebreak = (hasDialog || isValidEmptyLine) && !isLastLine; // last clause is a hack (but it works - why?)
					// console.log("LINEBREAK? " + shouldAddLinebreak);
					if( shouldAddLinebreak )
						state.curNode.AddChild( new FuncNode( "br", [] ) ); // use function or character?

					// linebreak logic
					isFirstLine = false;
					hasBlock = false;
					hasDialog = false;

					text = "";
				}
				else {
					text += state.Char();
				}
				state.Step();
			}

		}
		addTextNode();

		// console.log(state);
		return state;
	}

	function ParseDialogBlock(state) {
		var dialogStr = state.ConsumeBlock( Sym.DialogOpen, Sym.DialogClose );

		var dialogState = new ParserState( new BlockNode(BlockMode.Dialog), dialogStr );
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
			var isNewListItem = isNewline && (codeBlockCount <= 0) && (state.Char() === "-");

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
			var dialogBlockState = new ParserState( new BlockNode(BlockMode.Dialog), str );
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
			var isNewListItem = isNewline && (codeBlockCount <= 0) && (state.Char() === "-");

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
			var dialogBlockState = new ParserState( new BlockNode( BlockMode.Dialog, false /* doIndentFirstLine */ ), str );
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
		var args = [];

		var curSymbol = "";
		function OnSymbolEnd() {
			curSymbol = curSymbol.trim();
			console.log("PARAMTER " + curSymbol);
			args.push( StringToValue(curSymbol) );
			console.log(args);
			curSymbol = "";
		}

		while( !( state.Char() === "\n" || state.Done() ) ) {
			if( state.MatchAhead(Sym.CodeOpen) ) {
				var codeBlockState = new ParserState( new BlockNode(BlockMode.Code), state.ConsumeBlock( Sym.CodeOpen, Sym.CodeClose ) );
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
		console.log("VALID variable??? " + isValid);
		return isValid;
	}

	function StringToValue(valStr) {
		if(valStr[0] === Sym.CodeOpen) {
			// CODE BLOCK!!!
			var codeStr = (new ParserState( null, valStr )).ConsumeBlock(Sym.CodeOpen, Sym.CodeClose); //hacky
			var codeBlockState = new ParserState( new BlockNode( BlockMode.Code ), codeStr );
			codeBlockState = ParseCode( codeBlockState );
			return codeBlockState.rootNode;
		}
		else if(valStr[0] === Sym.String) {
			// STRING!!
			console.log("STRING");
			var str = "";
			var i = 1;
			while (i < valStr.length && valStr[i] != Sym.String) {
				str += valStr[i];
				i++;
			}
			console.log(str);
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
	// var operatorSymbols = ["==", ">", "<", ">=", "<=", "*", "/", "+", "-"];
	var operatorSymbols = ["-", "+", "/", "*", "<=", ">=", "<", ">", "=="]; // operators need to be in reverse order
	function CreateExpression(expStr) {
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
				var dialogBlockState = new ParserState( new BlockNode(BlockMode.Dialog), str );
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

	function ParseExpression(state) {
		var line = state.Peak( [Sym.Linebreak] );
		// console.log("EXPRESSION " + line);
		var exp = CreateExpression( line );
		// console.log(exp);
		state.curNode.AddChild( exp );
		state.Step( line.length );
		return state;
	}

	function ParseCode(state) {
		// TODO : how do I do this parsing??? one expression per block? or per line?
		while ( !state.Done() ) {

			if( state.Char() === " " || state.Char() === "\t" || state.Char() === "\n" ) { // TODO: symbols? IsWhitespace func?
				state.Step(); // consume whitespace
			}
			else if( state.MatchAhead(Sym.CodeOpen) ) {
				state = ParseCodeBlock( state );
			}
			// NOTE: nested dialog blocks disabled for now
			// else if( state.MatchAhead(Sym.DialogOpen) ) {
			// 	state = ParseDialogBlock( state ); // These can be nested (should they though???)
			// }
			else if( state.Char() === "-" ) { // TODO : symbols? matchahead?
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
			else {
				state = ParseExpression( state );
			}
		}

		return state;
	}

	function ParseCodeBlock(state) {
		var codeStr = state.ConsumeBlock( Sym.CodeOpen, Sym.CodeClose );

		// console.log("PARSE CODE");
		// console.log(codeStr);

		var codeState = new ParserState( new BlockNode(BlockMode.Code), codeStr );
		codeState = ParseCode( codeState );
		
		state.curNode.AddChild( codeState.rootNode );

		return state;
	}

}

} // Script()