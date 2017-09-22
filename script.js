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
	var parser = new Parser();

	this.SetDialogBuffer = function(buffer) { env.SetDialogBuffer(buffer); };

	this.Run = function(scriptStr) {
		var tree = parser.Parse( scriptStr );
		tree.Run( env );
	}
}

/* BUILT-IN FUNCTIONS */ // TODO: better way to encapsulate these?
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
		environment.RunFunction( this.name, this.arguments );
	}
}

var Parser = function() {
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
		var text = "";
		var lineCount = 0;
		var addTextNode = function() {
			if (text.length > 0) {
				state.curNode.AddChild( new FuncNode( "say", [text] ) );

				text = "";
				lineCount++;
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

					// NOTE: don't add linebreaks at the very beginning or end of the block
					// TODO: also skip ones right after a code block??
					var shouldAddLineBreak = (lineCount > 0) && ((state.Count() - state.Index()) > 1);
					if( shouldAddLineBreak ) {
						state.curNode.AddChild( new FuncNode( "linebreak", [] ) ); // use function or character?
					}

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

	function ParseCode(state) {
		// TODO
		return state;
	}

	function ParseCodeBlock(state) {
		var codeStr = state.ConsumeBlock( Sym.CodeOpen, Sym.CodeClose );

		var codeState = new ParserState( new BlockMode(), codeStr );
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