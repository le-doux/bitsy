/* QUESTIONS
shallow dialog blocks? ''' dialog block '''
or nestable dialog blocks?
	/"
		dialog block 
		{
			code block
			/"dialog"/
			code
		}
		dialog
	"/

significant whitespace?

{code} is a single expression? or a block?
{exp}
{exp}
vs
{
	exp
	exp
}

separate syntax for code block vs expression? e.g. double braces

return value from expression/code block?

{case
	* condition
		result
	* condition
		result
}
vs
{
if condition
	result
elseif condition
	result
}

{choice
	* choice1
		result
	* choice2
		result
}
vs
{
* choice1
	result
* choice2
	result
}
*/

/* NEW PARSE TODO
- attach dialog commands to dialog renderer
- parse code
- parse functions
- parse special functions: case, choice?
- formatting / text effects
- replace old parsing code
- expressions parsing
- function library
- variable library
- nail down syntax of case statements, multline code, whitespace, etc.
- replace root node with block (of either type)
	- should blocks be "type:block" "kind:dialog"??
	- or do they even need to be identified???

- scriptEnvironment -> fills -> dialogBuffer
- dialogRenderer -> draws -> dialogBuffer

- is code called immediately? or after dialog finishes rendering?
- IDEA: use special "script characters" injected into dialog buffer to launch scripts and effects during dialog
	- what about scripts with no dialog? should they depend on the buffer?

- ScriptParser -> outputs -> ScriptTree
- ScriptEnvironment -> runs -> ScriptTree
- environment needs a way to wait on dialog buffer (handler)
*/

/*
function
	name
	parameters
variable
	type (needed?)
block
	type
*/

/* MORE SYNTAX QUESTIONS

	dialog: /" text text "/ vs << text text >> vs (more limited) ''' text text '''

	should there even BE a dialog block? or is that just default behavior for top level?

	in IF STATEMENT, default code or default dialog?

	IF vs CASE

	{single expression per bracket} <- more LISP-like
	vs
	{
		multiple expressions
		on each
		new line
	} <- more like inserting a JS block
*/

function Script() {

this.CreateInterpreter = function() {
	return new Interpreter();
};

var Interpreter = function() {
	var env = new Environment();
	var parser = new Parser( env );

	this.SetDialogBuffer = function(buffer) { env.SetDialogBuffer( buffer ); };

	this.Run = function(scriptStr) {
		var tree = parser.Parse( scriptStr );
		tree.Run( env );
	}
}


/* BUILT-IN FUNCTIONS */ // TODO: better way to encapsulate these?


/*
possitble names
	- print
	- say
	- speak
	- text
	- talk
	- dialog
*/
function say(environment,parameters) {
	console.log("SAY FUNC");
	environment.GetDialogBuffer().AddText( parameters[0] /*textStr*/, [] /*nodeTrail*/ );
}

function linebreak(environment,parameters) {
	console.log("LINEBREAK FUNC");
	environment.GetDialogBuffer().AddLinebreak();
}

/* ENVIRONMENT */
var Environment = function() {
	var dialogBuffer = null;
	this.SetDialogBuffer = function(buffer) { dialogBuffer = buffer; };
	this.GetDialogBuffer = function() { return dialogBuffer; };

	var functionMap = new Map();
	functionMap["say"] = say;
	functionMap["linebreak"] = linebreak;

	this.HasFunction = function(name) { return functionMap[name] != null; };
	this.RunFunction = function(name,parameters) {
		functionMap[name](this,parameters);
	}
}

/* node ideas
	- TreeRelationship -> HasChildren
	- NodeCore / NodeBase : type
	- do I really need modes for blocks?
	- do I really need a special command for linebreaks? or just use it as a character?
*/
/* NODES */
var TreeRelationship = function() {
	this.parent = null;
	this.children = [];
	this.AddChild = function(node) {
		this.children.push( node );
		node.parent = this;
	};
	this.Traverse = function() {
		if( this.Visit )
			this.Visit();

		var i = 0;
		while (i < this.children.length) {
			this.children[i].Traverse();
			i++;
		}

		// TODO need a way to pause while text is rendering?
	}
}

var Runnable = function() {
	this.Run = function(environment) {
		if( this.Eval )
			this.Eval(environment);

		var i = 0;
		while (i < this.children.length) {
			this.children[i].Run(environment);
			i++;
		}
	}
}

// TEMP: trying without mode
// var BlockMode = {
// 	Dialog : "dialog",
// 	Code : "code"
// };

var BlockNode = function(/*mode*/) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new Runnable() );
	this.type = "block";
	// this.mode = mode;
}

// ???: Make FuncNode subclasses with functionality? or separate the nodes from the functions?
var FuncNode = function(name,arguments) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new Runnable() );
	this.type = "function";
	this.name = name;
	this.arguments = arguments;

	this.Eval = function(environment) {
		var argumentValues = [];
		for(var i = 0; i < this.arguments.length; i++) {
			argumentValues.push( this.arguments[i].Eval() );
		}
		environment.RunFunction( this.name, argumentValues );
	}
}

// TODO : do literals and variables need to be nodes?
// IF SO: should they be children of functions???
var LiteralNode = function(value) {
	Object.assign( this, new TreeRelationship() );
	Object.assign( this, new Runnable() );
	this.type = "literal";
	this.value = value;

	this.Eval = function(environment) {
		return this.value; // TODO all Eval should return something, not just literals
	}
}

var VarNode = function() {
	// TODO
}

var Parser = function(env) {
	var environment = env;

	var Sym = {
		DialogOpen : "/\"",
		DialogClose : "\"/",
		CodeOpen : "{",
		CodeClose : "}",
		Linebreak : "\n", // just call it "break" ?
		Separator : ":",
		List : "*"
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

		// var saveIndex = 0;
		// this.Save = function() { saveIndex = i; };
		// this.Restore = function() { i = saveIndex; };
	};

	this.Parse = function(scriptStr) {
		console.log("NEW PARSE!!!!!!");

		var state = new ParserState( new BlockNode(), scriptStr );

		if( state.MatchAhead(Sym.DialogOpen) ) {
			state = ParseDialogBlock( state );
		}
		else if( state.MatchAhead(Sym.CodeOpen) ) {
			state = ParseCodeBlock( state );
		}

		console.log( state.rootNode );
		return state.rootNode;
	};

	function ParseDialog(state) {
		var shouldAddLinebreak = false;

		var text = "";
		var addTextNode = function() {
			if (text.length > 0) {
				state.curNode.AddChild( new FuncNode( "say", [new LiteralNode(text)] ) );
				text = "";

				shouldAddLinebreak = true; // can add linebreaks after text
			}
		}

		while ( !state.Done() ) {

			if( state.MatchAhead(Sym.DialogOpen) ) {
				addTextNode();
				state = ParseDialogBlock( state ); // These can be nested (should they though???)
			}
			else if( state.MatchAhead(Sym.CodeOpen) ) {
				addTextNode();
				state = ParseCodeBlock( state );
			}
			else {
				if ( state.MatchAhead(Sym.Linebreak) ) {
					addTextNode();

					if( shouldAddLinebreak )
						state.curNode.AddChild( new FuncNode( "linebreak", [] ) ); // use function or character?
					else
						shouldAddLinebreak = true; // can add linebreaks after the first non-linebreak

					text = "";
				}
				else {
					text += state.Char();
				}
				state.Step();
			}

		}
		addTextNode();

		console.log("PARSE DIALOG");
		console.log(state);
		return state;
	}

	function ParseDialogBlock(state) {
		var dialogStr = state.ConsumeBlock( Sym.DialogOpen, Sym.DialogClose );

		var dialogState = new ParserState( new BlockNode(), dialogStr );
		dialogState = ParseDialog( dialogState );

		state.curNode.AddChild( dialogState.rootNode );

		return state;
	}


	/*
	THINGS TO PARSE:
		- functions: func param1 param2
		- expressions: x = 5, x = y + z, etc.
		- nested blocks: { code }, /" text "/
			- the nested code blocks are especially tricky... do they return something?
		- special blocks:
			{case
				* condition
					result
				* condition
					result
			}

		if we assume block contains only one expression
			look at first symbol
				is it a function name?
					parse function
				else
					look for expressions, etc.
	*/

	/*
	PARAMETER possibilities
	- string
	- float
	- bool?
	- variable
	*/
	function ParseFunction(state, funcName) {
		var args = [];

		var curSymbol = "";
		function OnSymbolEnd() {
			console.log("SYMBOL " + curSymbol);
			var num = parseFloat(curSymbol);
			console.log(num);
			if(num) {
				/* NUMBER LITERAL */
				console.log("ADD NUM");
				args.push( new LiteralNode(num) );
			}
			else {
				// TODO : variable???
			}
			curSymbol = "";
		}

		while( !( state.Char() === "\n" || state.Done() ) ) {
			if(state.Char() === '"') {
				/* STRING LITERAL */
				var str = state.ConsumeBlock('"', '"');
				console.log("STRING " + str);
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

	function ParseCode(state) {
		// TODO : how do I do this parsing??? one expression per block? or per line?

		var curSymbol = "";
		function OnSymbolEnd() {
			console.log("SYMBOL");
			console.log(curSymbol);
			if(environment.HasFunction(curSymbol))
			{
				state = ParseFunction( state, curSymbol );
			}
			else {
				return state; // TODO
			}

			curSymbol = "";
		}

		while ( !state.Done() ) {

			if( state.MatchAhead(Sym.DialogOpen) ) {
				state = ParseDialogBlock( state ); // These can be nested (should they though???)
			}
			else if( state.MatchAhead(Sym.CodeOpen) ) {
				state = ParseCodeBlock( state );
			}
			else {
				console.log(state.Char());
				if(state.Char() === " ") {
					OnSymbolEnd();
				}
				else {
					curSymbol += state.Char();
					// console.log(curSymbol);
				}
				state.Step();
			}
		}

		if(curSymbol.length > 0) {
			OnSymbolEnd();
		}

		return state;
	}

	function ParseCodeBlock(state) {
		var codeStr = state.ConsumeBlock( Sym.CodeOpen, Sym.CodeClose );

		console.log("PARSE CODE");
		console.log(codeStr);

		var codeState = new ParserState( new BlockNode(), codeStr );
		codeState = ParseCode( codeState );
		
		state.curNode.AddChild( codeState.rootNode );

		// eat next linebreak
		if( state.MatchAhead( Sym.Linebreak ) )
			state.Step();

		return state;
	}

}

// hack
// this.NewParse = function(dialogStr) {
// 	var p = new Parser();
// 	return p.Parse( dialogStr );
// }

} // Script()