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

function Script() {
	/* new markup tests */
	this.NewParse = function(dialogStr) {
		console.log("NEW PARSE");
		console.log(dialogStr);

		function ParserState( rootNode, str ) {
			this.rootNode = rootNode;
			this.curNode = this.rootNode;

			var sourceStr = str;
			var i = 0;
			this.Index = function() { return i; };
			this.Count = function() { return sourceStr.length; };
			this.Done = function() { return i >= sourceStr.length; };
			this.Char = function() { return sourceStr[i]; };
			this.Step = function(n=1) { i += n; };
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

		var Sym = {
			DialogOpen : "/\"",
			DialogClose : "\"/",
			CodeOpen : "{",
			CodeClose : "}",
			Linebreak : "\n", // just call it "break" ?
			Separator : ":",
			List : "*"
		};

		function ParseDialog(state) {
			var text = "";
			var lineCount = 0;
			var addTextNode = function() {
				if (text.length > 0) {
					var textNode = {
						type : "text", // names: "say" instead? or this that a "function"
						parent : state.curNode,
						// children : [], // can't have children?
						text : text
					};
					state.curNode.children.push( textNode );

					text = "";
					lineCount++;
				}
			}

			while ( !state.Done() ) {

				if( state.MatchAhead(Sym.DialogOpen) ) {
					addTextNode();
					state = ParseDialogBlock( state ); // These can be nested
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
							var linebreakNode = {
								type : "linebreak",
								parent : state.curNode
							}
							state.curNode.children.push( linebreakNode );	
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

			return state;
		}

		function ParseDialogBlock(state) {
			var dialogStr = state.ConsumeBlock( Sym.DialogOpen, Sym.DialogClose );
			// console.log("DIALOG " + dialogStr);

			var dialogBlockNode = {
				type : "dialog", // names: text vs dialog is bad
				parent : null,
				children : []
			};

			var dialogState = new ParserState( dialogBlockNode, dialogStr );
			dialogState = ParseDialog( dialogState );

			dialogState.rootNode.parent = state.curNode; // TODO : make this a method
			state.curNode.children.push( dialogState.rootNode );

			return state;
		}

		function ParseCode(state) {
			// TODO
			return state;
		}

		function ParseCodeBlock(state) {
			var codeStr = state.ConsumeBlock( Sym.CodeOpen, Sym.CodeClose );
			// console.log("CODE " + codeStr);

			var codeBlockNode = {
				type : "code",
				parent : null,
				children : [],
				content : codeStr
			};

			var codeState = new ParserState( codeBlockNode, codeStr );
			codeState = ParseCode( codeState );

			codeState.rootNode.parent = state.curNode; // TODO : make this a method
			state.curNode.children.push( codeState.rootNode );

			// eat next linebreak
			if( state.MatchAhead( Sym.Linebreak ) )
				state.Step();

			return state;
		}

		function Parse(rootNode, str) {
			var state = new ParserState( rootNode, str );

			while( !state.Done() ) {
				// console.log( state.Char() );
				if( state.MatchAhead(Sym.DialogOpen) ) {
					state = ParseDialogBlock( state );
				}
				else if( state.MatchAhead(Sym.CodeOpen) ) {
					state = ParseCodeBlock( state );
				}
				else {
					state.Step();
				}
			}

			return state.rootNode;
		};

		var rootNode = {
			type : "root", // TODO : should be block?
			children : [],
			parent : null
		};

		var rootNode = Parse( rootNode, dialogStr );

		// console.log( rootNode );

		// console.log("END NEW PARSE");

		return rootNode;
	}
} // Script