function Dialog() {

this.CreateRenderer = function() {
	return new DialogRenderer();
};

this.CreateBuffer = function() {
	return new DialogBuffer();
};

var DialogRenderer = function() {
	var textboxInfo = {
		img : null,
		width : 104,
		height : 8+4+2+5, //8 for text, 4 for top-bottom padding, 2 for line padding, 5 for arrow
		top : 12,
		left : 12,
		bottom : 12, //for drawing it from the bottom
	};
	
	var font = new Font();

	var context = null;
	this.AttachContext = function(c) {
		context = c;
	};

	this.ClearTextbox = function() {
		if(context == null) return;
		textboxInfo.img = context.createImageData(textboxInfo.width*scale, textboxInfo.height*scale);
	};

	var isCentered = false;
	this.SetCentered = function(centered) {
		isCentered = centered;
	};

	this.DrawTextbox = function() {
		if(context == null) return;
		if (isCentered) {
			context.putImageData(textboxInfo.img, textboxInfo.left*scale, ((height/2)-(textboxInfo.height/2))*scale);
		}
		else if (player().y < mapsize/2) {
			//bottom
			context.putImageData(textboxInfo.img, textboxInfo.left*scale, (height-textboxInfo.bottom-textboxInfo.height)*scale);
		}
		else {
			//top
			context.putImageData(textboxInfo.img, textboxInfo.left*scale, textboxInfo.top*scale);
		}
	};

	var arrowdata = [
		1,1,1,1,1,
		0,1,1,1,0,
		0,0,1,0,0
	];
	this.DrawNextArrow = function() {
		// console.log("draw arrow!");
		var top = (textboxInfo.height-5) * scale;
		var left = (textboxInfo.width-(5+4)) * scale;
		for (var y = 0; y < 3; y++) {
			for (var x = 0; x < 5; x++) {
				var i = (y * 5) + x;
				if (arrowdata[i] == 1) {
					//scaling nonsense
					for (var sy = 0; sy < scale; sy++) {
						for (var sx = 0; sx < scale; sx++) {
							var pxl = 4 * ( ((top+(y*scale)+sy) * (textboxInfo.width*scale)) + (left+(x*scale)+sx) );
							textboxInfo.img.data[pxl+0] = 255;
							textboxInfo.img.data[pxl+1] = 255;
							textboxInfo.img.data[pxl+2] = 255;
							textboxInfo.img.data[pxl+3] = 255;
						}
					}
				}
			}
		}
	};

	var text_scale = 2; //using a different scaling factor for text feels like cheating... but it looks better
	this.DrawChar = function(char, row, col) {
		char.offset = {x:0, y:0};
		char.SetPosition(row,col);
		char.ApplyEffects(effectTime);
		var charData = font.getChar( char.char );
		var top = (4 * scale) + (row * 2 * scale) + (row * 8 * text_scale) + Math.floor( char.offset.y );
		var left = (4 * scale) + (col * 6 * text_scale) + Math.floor( char.offset.x );
		for (var y = 0; y < 8; y++) {
			for (var x = 0; x < 6; x++) {
				var i = (y * 6) + x;
				if ( charData[i] == 1 ) {

					//scaling nonsense
					for (var sy = 0; sy < text_scale; sy++) {
						for (var sx = 0; sx < text_scale; sx++) {
							var pxl = 4 * ( ((top+(y*text_scale)+sy) * (textboxInfo.width*scale)) + (left+(x*text_scale)+sx) );
							textboxInfo.img.data[pxl+0] = char.color.r;
							textboxInfo.img.data[pxl+1] = char.color.g;
							textboxInfo.img.data[pxl+2] = char.color.b;
							textboxInfo.img.data[pxl+3] = char.color.a;
						}
					}

					
				}
			}
		}
	};

	var effectTime = 0; // TODO this variable should live somewhere better
	this.Draw = function(buffer,dt) { // TODO move out of the buffer?? (into say a dialog box renderer)
		effectTime += dt;

		this.ClearTextbox();

		buffer.ForEachActiveChar( this.DrawChar );

		if( buffer.CanContinue() )
			this.DrawNextArrow();

		this.DrawTextbox();

		if( buffer.DidPageFinishThisFrame() && onPageFinish != null )
			onPageFinish();
	};

	/* this is a hook for GIF rendering */
	var onPageFinish = null;
	this.SetPageFinishHandler = function(handler) {
		onPageFinish = handler;
	};

	this.Reset = function() {
		effectTime = 0;
		// TODO - anything else?
	}
}


var DialogBuffer = function() {
	var buffer = [[[]]]; // holds dialog in an array buffer
	var pageIndex = 0;
	var rowIndex = 0;
	var charIndex = 0;
	var nextCharTimer = 0;
	var nextCharMaxTime = 50; // in milliseconds
	var isDialogReadyToContinue = false;
	var tree = null; // holds dialog and command nodes in a tree structure

	/* NEW SCRIPT STUFF */
	var scriptTree = null;
	
	this.CurPage = function() { return buffer[ pageIndex ]; };
	this.CurRow = function() { return this.CurPage()[ rowIndex ]; };
	this.CurChar = function() { return this.CurRow()[ charIndex ]; };
	this.CurPageCount = function() { return buffer.length; };
	this.CurRowCount = function() { return this.CurPage().length; };
	this.CurCharCount = function() { return this.CurRow().length; };

	this.ForEachActiveChar = function(handler) { // Iterates over visible characters on the active page
		var rowCount = rowIndex + 1;
		for (var i = 0; i < rowCount; i++) {
			var row = this.CurPage()[i];
			var charCount = (i == rowIndex) ? charIndex+1 : row.length;
			// console.log(charCount);
			for(var j = 0; j < charCount; j++) {
				var char = row[j];
				if(char)
					handler( char, i /*rowIndex*/, j /*colIndex*/ );
			}
		}
	}

	this.Reset = function() {
		buffer = [[[]]];
		pageIndex = 0;
		rowIndex = 0;
		charIndex = 0;
		isDialogReadyToContinue = false;
	};
	
	var onExit = null;
	this.Start = function(dialogSourceStr,exitHandler) {
		this.Reset();

		onExit = exitHandler;

		if( featureNewScript ) {
			// scriptTree = script.NewParse( dialogSourceStr );
			var interp = script.CreateInterpreter();
			interp.SetDialogBuffer(this); // hacky
			interp.Run( dialogSourceStr ); // hacky
			// console.log( scriptTree );
		}
		else {
			var dml = new DialogMarkup();
			tree = dml.Parse( dialogSourceStr );
			tree.SetBuffer( this );
			tree.Traverse();
		}
	};

	this.TryFillBuffer = function() {
		// after drawing the last character in the current dialog buffer, do the next dialog tree traversal
		if( pageIndex === this.CurPageCount()-1 
			&& rowIndex === this.CurRowCount()-1 
			&& charIndex === this.CurCharCount()-1 )
		{
			if( featureNewScript ) {
				// TODO
			}
			else {
				tree.Traverse();	
			}
		}
	};

	this.DoNextChar = function() {
		nextCharTimer = 0; //reset timer

		//time to update characters
		if (charIndex + 1 < this.CurCharCount()) {
			//add char to current row
			charIndex++;
		}
		else if (rowIndex + 1 < this.CurRowCount()) {
			//start next row
			rowIndex++;
			charIndex = 0;
		}
		else {
			//the page is full!
			isDialogReadyToContinue = true;
			didPageFinishThisFrame = true;
		}

		this.TryFillBuffer();
	};

	this.Update = function(dt) {
		didPageFinishThisFrame = false;
		didFlipPageThisFrame = false;
		// this.Draw(dt); // TODO move into a renderer object
		if (isDialogReadyToContinue) {
			return; //waiting for dialog to be advanced by player
		}

		nextCharTimer += dt; //tick timer

		if (nextCharTimer > nextCharMaxTime) {
			this.DoNextChar();
		}
	};

	this.Skip = function() {
		didPageFinishThisFrame = false;
		didFlipPageThisFrame = false;
		// add new characters until you get to the end of the current line of dialog
		while (rowIndex < this.CurRowCount()) {
			this.DoNextChar();

			if(isDialogReadyToContinue) {
				//make sure to push the rowIndex past the end to break out of the loop
				rowIndex++;
				charIndex = 0;
			}
		}
		rowIndex = this.CurRowCount()-1;
		charIndex = this.CurCharCount()-1;
	};

	this.FlipPage = function() {
		didFlipPageThisFrame = true;
		isDialogReadyToContinue = false;
		pageIndex++;
		rowIndex = 0;
		charIndex = 0;
	}

	this.EndDialog = function() {
		if(onExit != null)
			onExit();
	}

	this.Continue = function() {
		console.log("CONTINUE");
		this.TryFillBuffer();
		if (pageIndex + 1 < this.CurPageCount()) {
			//start next page
			this.FlipPage();
		}
		else {
			//end dialog mode
			this.EndDialog();
		}
	};

	this.CanContinue = function() { return isDialogReadyToContinue; };

	function DialogChar(char,nodeTrail) {
		this.char = char;
		this.nodeTrail = nodeTrail;

		this.color = { r:255, g:255, b:255, a:255 };
		this.offset = { x:0, y:0 }; // in pixels (screen pixels?)
		this.row = 0;
		this.col = 0;
		this.SetPosition = function(row,col) {
			this.row = row;
			this.col = col;
		};

		this.ApplyEffects = function(time) {
			for(var i = 0; i < this.nodeTrail.length; i++) {
				var node = this.nodeTrail[i];
				node.DoEffect(this,time);
			}
		}
	};

	function AddWordToCharArray(charArray,word,nodeTrail) {
		for(var i = 0; i < word.length; i++) {
			charArray.push( new DialogChar( word[i], nodeTrail ) );
		}
		return charArray;
	}

	var charsPerRow = 32;
	this.AddText = function(textStr,nodeTrail) { // TODO : change "nodeTrail" to "effectList"
		//process dialog so it's easier to display
		var words = textStr.split(" ");

		// var curPageIndex = this.CurPageCount() - 1;
		// var curRowIndex = this.CurRowCount() - 1;
		// var curRowArr = this.CurRow();

		var curPageIndex = buffer.length - 1;
		var curRowIndex = buffer[curPageIndex].length - 1;
		var curRowArr = buffer[curPageIndex][curRowIndex];

		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			var wordLength = word.length + ((i == 0) ? 0 : 1);
			if (curRowArr.length + wordLength <= charsPerRow || curRowArr.length <= 0) {
				//stay on same row
				var wordWithPrecedingSpace = ((i == 0) ? "" : " ") + word;
				curRowArr = AddWordToCharArray( curRowArr, wordWithPrecedingSpace, nodeTrail );
			}
			else if (curRowIndex == 0) {
				//start next row
				buffer[ curPageIndex ][ curRowIndex ] = curRowArr;
				buffer[ curPageIndex ].push( [] );
				curRowIndex++;
				curRowArr = buffer[ curPageIndex ][ curRowIndex ];
				curRowArr = AddWordToCharArray( curRowArr, word, nodeTrail );
			}
			else {
				//start next page
				buffer[ curPageIndex ][ curRowIndex ] = curRowArr;
				buffer.push( [] );
				curPageIndex++;
				buffer[ curPageIndex ].push( [] );
				curRowIndex = 0;
				curRowArr = buffer[ curPageIndex ][ curRowIndex ];
				curRowArr = AddWordToCharArray( curRowArr, word, nodeTrail );
			}
		}

		//finish up 
		if( curRowArr.length > 0 ) {
			buffer[ curPageIndex ][ curRowIndex ] = curRowArr;
		}

		//destroy any empty stuff
		var lastPage = buffer[ buffer.length-1 ];
		var lastRow = lastPage[ lastPage.length-1 ];
		if( lastRow.length == 0 )
			lastPage.splice( lastPage.length-1, 1 );
		if( lastPage.length == 0 )
			buffer.splice( buffer.length-1, 1 );

		console.log(buffer);
	};

	this.AddLinebreak = function() {
		var lastPage = buffer[ buffer.length-1 ];
		if( lastPage.length <= 1 ) {
			console.log("LINEBREAK - NEW ROW ");
			// add new row
			lastPage.push( [] );
		}
		else {
			// add new page
			buffer.push( [[]] );
		}
		console.log(buffer);
	}

	/* this is a hook for GIF rendering */
	var didPageFinishThisFrame = false;
	this.DidPageFinishThisFrame = function(){ return didPageFinishThisFrame; };

	var didFlipPageThisFrame = false;
	this.DidFlipPageThisFrame = function(){ return didFlipPageThisFrame; };
};

var DialogNode = function() {
	this.type = "";
	this.children = [];
	this.attributes = {};
	this.parent = null;
	this.buffer = null; // DialogBuffer reference
	this.AddChild = function(node) {
		this.children.push( node );
		node.parent = this;
	};
	this.AddAttribute = function(name,value) {
		// console.log("ADD ATTR " + name);
		this.attributes[name] = { name:name, value:value };
	};
	this.canHaveChildren = false;

	this.OnCloseTag = function() {};

	var traverseIndex = -1;
	this.Visit = function() {
		console.log("node!! " + this.type);
		return true;
	};
	this.Traverse = function() {
		// console.log("TRAVERSE!!");
		var doContinue = true;
		if (traverseIndex < 0) { // traverseIndex == -1 means visit self
			doContinue = this.Visit();
			traverseIndex++;
		}
		while( doContinue && traverseIndex < this.children.length ) {
			// console.log(traverseIndex);
			doContinue = this.children[ traverseIndex ].Traverse();
			if(doContinue)
				traverseIndex++;
		}
		return doContinue;
	};
	this.Trail = function() {
		var trail = [this];
		if(this.parent != null)
			trail = this.parent.Trail().concat( trail );
		return trail;
	};
	this.SetBuffer = function(buffer) {
		this.buffer = buffer;
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].SetBuffer( buffer );
		}
	};
	this.DoEffect = function(char) {
		// console.log("DO EFFECT " + this.type + " " + char.char);
	};
};

var DialogNodeFactory = {
	baseConstructor : DialogNode,
	typeConstructors : {},
	AddType : function(constructor) {
		var node = new constructor();
		this.typeConstructors[ node.type ] = constructor;
	},
	Create : function(type) {
		var node = Object.assign( new this.baseConstructor(), new this.typeConstructors[type]() );
		return node;
	}
};

var RootNode = function() {
	this.type = "root";
	this.canHaveChildren = true;
};
DialogNodeFactory.AddType( RootNode );

var TextNode = function() {
	this.type = "text";
	this.text = "";
	this.Visit = function() {
		console.log(this.text);
		if(this.buffer != null)
			this.buffer.AddText( this.text, this.Trail() );
		return false;
	};
};
DialogNodeFactory.AddType( TextNode );

var IfNode = function() {
	this.type = "if";
	this.canHaveChildren = true;

	this.branches = [];
	this.OnCloseTag = function() {
		console.log("CLOSE IF");
		var curBranch = {
			node : this,
			children : []
		};

		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if (child.type === "elseif" || child.type === "else") {
				// save current branch
				this.branches.push( curBranch );
				// start new branch
				curBranch = {
					node : child,
					children : []
				};
			}
			else {
				// add child to branch
				curBranch.children.push( child );
			}
		}

		// save current branch
		this.branches.push( curBranch );
	};

	this.CheckCondition = function() {
		if( this.attributes["item"] ) {
			var itemId = this.attributes["item"].value;
			return player().inventory[itemId] && player().inventory[itemId] > 0;
		}
		return false;
	};

	this.Visit = function() {
		this.children = [];
		for (var i = 0; i < this.branches.length; i++) {
			var b = this.branches[i];
			if( b.node.CheckCondition() == true ) {
				this.children = b.children;
				break;
			}
		}
		return true;
	}
};
DialogNodeFactory.AddType( IfNode );

var ElseIfNode = function() {
	this.type = "elseif";
	this.CheckCondition = function() {
		if( this.attributes["item"] ) {
			var itemId = this.attributes["item"].value;
			return player().inventory[itemId] && player().inventory[itemId] > 0;
		}
		return false;
	};
};
DialogNodeFactory.AddType( ElseIfNode );

var ElseNode = function() {
	this.type = "else";
	this.CheckCondition = function() {
		return true;
	};
};
DialogNodeFactory.AddType( ElseNode );

var ColorNode = function() {
	this.type = "color";
	this.canHaveChildren = true;
	this.DoEffect = function(char) {
		// console.log("DO EFFECT COLOR");
		// console.log(this.attributes);
		if (this.attributes["index"] != null) {
			var pal = palette[ curPal() ];
			var color = pal[ parseInt( this.attributes["index"].value ) ];
			// console.log(color);
			char.color.r = color[0];
			char.color.g = color[1];
			char.color.b = color[2];
			char.color.a = 255;
		}
	}
};
DialogNodeFactory.AddType( ColorNode );

var RainbowNode = function() {
	this.type = "rainbow";
	this.canHaveChildren = true;
	this.DoEffect = function(char,time) {
		var h = Math.abs( Math.sin( (time / 600) - (char.col / 8) ) );
		var rgb = hslToRgb( h, 1, 0.5 );
		char.color.r = rgb[0];
		char.color.g = rgb[1];
		char.color.b = rgb[2];
		char.color.a = 255;
	}
};
DialogNodeFactory.AddType( RainbowNode );

var WavyNode = function() {
	this.type = "wavy";
	this.canHaveChildren = true;
	this.DoEffect = function(char,time) {
		char.offset.y += Math.sin( (time / 250) - (char.col / 2) ) * 4;
	}
};
DialogNodeFactory.AddType( WavyNode );

var ShakyNode = function() {
	this.type = "shaky";
	this.canHaveChildren = true;

	function disturb(func,time,offset,mult1,mult2) {
		return func( (time * mult1) - (offset * mult2) );
	}

	this.DoEffect = function(char,time) {
		char.offset.y += 3
						* disturb(Math.sin,time,char.col,0.1,0.5)
						* disturb(Math.cos,time,char.col,0.3,0.2)
						* disturb(Math.sin,time,char.row,2.0,1.0);
		char.offset.x += 3
						* disturb(Math.cos,time,char.row,0.1,1.0)
						* disturb(Math.sin,time,char.col,3.0,0.7)
						* disturb(Math.cos,time,char.col,0.2,0.3);
	}
};
DialogNodeFactory.AddType( ShakyNode );


// source : https://gist.github.com/mjackson/5311256
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

function DialogMarkup() {
	this.Parse = function(dialogStr) {
		var parsingState = {
			rootNode : DialogNodeFactory.Create("root"),
			curParentNode : null,
			src: dialogStr,
			i: 0,
			Done : function() {
				return parsingState.i >= parsingState.src.length;
			},
			Char : function() {
				return parsingState.src[ parsingState.i ];
			},
			Increment : function() {
				parsingState.i++;
			}
		};
		parsingState.curParentNode = parsingState.rootNode;
		// console.log(parsingState);
		while(!parsingState.Done()) {
			var char = parsingState.Char();
			// console.log(char);
			if( featureNewDialog ) {
				if(char === "<"){
					parsingState = parseTag(parsingState)
				}
				else {
					parsingState = parseText(parsingState);
				}
			}
			else {
				// only parse text
				parsingState = parseText(parsingState);
			}
			// parsingState.Increment();
		}
		console.log( parsingState.rootNode );
		return parsingState.rootNode;
	}
	function parseTag(parsingState) {
		// console.log("TAG");
		var tagStr = "";
		while(!parsingState.Done() && parsingState.Char() != ">") {
			tagStr += parsingState.Char();
			parsingState.Increment();
		}

		if(parsingState.Done())
			return parsingState; // exit if done
		
		//add final angle bracket
		tagStr += parsingState.Char();
		parsingState.Increment();
		// console.log(tagStr);

		//cut off angle brackets
		tagStr = tagStr.slice(1,tagStr.length-1);

		// console.log(tagStr);

		//get node type
		var i = 0;
		var type = "";
		while(tagStr[i] != " " && i < tagStr.length) {
			type += tagStr[i];
			i++;
		}
		tagStr = tagStr.slice(i);
		// console.log(type);
		// console.log(tagStr);

		console.log(type);
		if(type[0] === "/") {
			// this is the end of a tag
			type = type.slice(1);
			console.log("tag end!!!");
			console.log(type);

			if( parsingState.curParentNode.type === type && parsingState.curParentNode.parent != null )
			{
				parsingState.curParentNode.OnCloseTag();
				parsingState.curParentNode = parsingState.curParentNode.parent;
			}

			return parsingState;
		}

		var tagNode = DialogNodeFactory.Create(type);

		// console.log(tagStr);
		var attributeRegex = /([a-zA-Z]+)=\"([a-zA-Z0-9\s]+)\"/g;
		var attributeMatch = attributeRegex.exec( tagStr );
		// console.log(attributeMatch);
		while( attributeMatch != null ) {
			tagNode.AddAttribute( attributeMatch[1] /*name*/, attributeMatch[2] /*value*/ );
			attributeMatch = attributeRegex.exec( tagStr );
		}

		// console.log( tagNode );

		parsingState.curParentNode.AddChild( tagNode );

		if( tagNode.canHaveChildren )
			parsingState.curParentNode = tagNode;

		return parsingState;
	}
	function parseText(parsingState) {
		//TODO
		// console.log("TEXT");
		var textStr = "";
		if( featureNewDialog ) {
			while(!parsingState.Done() && parsingState.Char() != "<") {
				textStr += parsingState.Char();
				parsingState.Increment();
			}
		}
		else {
			while(!parsingState.Done()) {
				textStr += parsingState.Char();
				parsingState.Increment();
			}
		}
		// console.log(textStr);
		var textNode = DialogNodeFactory.Create("text");
		textNode.text = textStr;
		parsingState.curParentNode.AddChild( textNode );
		return parsingState;
	}
}

} // Dialog()