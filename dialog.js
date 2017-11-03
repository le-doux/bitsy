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
		
		// call printHandler for character
		char.OnPrint();
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
	var activeTextEffects = [];
	
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

		activeTextEffects = [];

		isActive = false;
	};

	this.DoNextChar = function() {
		// console.log("DO NEXT CHAR");

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

			// console.log("WAITING FOR INPUT");
		}

		// console.log(this.CurChar());
		if(this.CurChar() != null)
			this.CurChar().OnPrint(); // make sure we hit the callback before we run out of text
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
		console.log("SKIPPP");
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
		console.log("END!!!!");
		isActive = false; // no more text to show... this should be a sign to stop rendering dialog
	}

	this.Continue = function() {
		console.log("CONTINUE");
		if (pageIndex + 1 < this.CurPageCount()) {
			//start next page
			this.FlipPage();
			return true; /* hasMoreDialog */
		}
		else {
			//end dialog mode
			this.EndDialog();
			return false; /* hasMoreDialog */
		}
	};

	var isActive = false;
	this.IsActive = function() { return isActive; };

	this.CanContinue = function() { return isDialogReadyToContinue; };

	function DialogChar(char,effectList) {
		this.char = char;
		this.effectList = effectList.slice(); // clone effect list (since it can change between chars)

		this.color = { r:255, g:255, b:255, a:255 };
		this.offset = { x:0, y:0 }; // in pixels (screen pixels?)
		this.row = 0;
		this.col = 0;
		this.SetPosition = function(row,col) {
			this.row = row;
			this.col = col;
		};

		this.ApplyEffects = function(time) {
			for(var i = 0; i < this.effectList.length; i++) {
				var effectName = this.effectList[i];
				TextEffects[ effectName ].DoEffect( this, time );
			}
		}

		var printHandler = null; // optional function to be called once on printing character
		this.SetPrintHandler = function(handler) {
			printHandler = handler;
		}
		this.OnPrint = function() {
			if (printHandler != null) {
				console.log("PRINT HANDLER ---- DIALOG BUFFER");
				printHandler();
				printHandler = null; // only call handler once (hacky)
			}
		}
	};

	function AddWordToCharArray(charArray,word,effectList) {
		for(var i = 0; i < word.length; i++) {
			charArray.push( new DialogChar( word[i], effectList ) );
		}
		return charArray;
	}

	var charsPerRow = 32;
	this.AddText = function(textStr,onFinishHandler) {
		console.log("ADD TEXT " + textStr);

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
				curRowArr = AddWordToCharArray( curRowArr, wordWithPrecedingSpace, activeTextEffects );
			}
			else if (curRowIndex == 0) {
				//start next row
				buffer[ curPageIndex ][ curRowIndex ] = curRowArr;
				buffer[ curPageIndex ].push( [] );
				curRowIndex++;
				curRowArr = buffer[ curPageIndex ][ curRowIndex ];
				curRowArr = AddWordToCharArray( curRowArr, word, activeTextEffects );
			}
			else {
				//start next page
				buffer[ curPageIndex ][ curRowIndex ] = curRowArr;
				buffer.push( [] );
				curPageIndex++;
				buffer[ curPageIndex ].push( [] );
				curRowIndex = 0;
				curRowArr = buffer[ curPageIndex ][ curRowIndex ];
				curRowArr = AddWordToCharArray( curRowArr, word, activeTextEffects );
			}
		}

		//destroy any empty stuff
		var lastPage = buffer[ buffer.length-1 ];
		var lastRow = lastPage[ lastPage.length-1 ];
		if( lastRow.length == 0 )
			lastPage.splice( lastPage.length-1, 1 );
		if( lastPage.length == 0 )
			buffer.splice( buffer.length-1, 1 );

		//finish up 
		lastPage = buffer[ buffer.length-1 ];
		lastRow = lastPage[ lastPage.length-1 ];
		if( lastRow.length > 0 ) {
			var lastChar = lastRow[ lastRow.length-1 ];
			lastChar.SetPrintHandler( onFinishHandler );
		}

		console.log(buffer);

		isActive = true;
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

		isActive = true;
	}

	/* new text effects */
	this.HasTextEffect = function(name) {
		return activeTextEffects.indexOf( name ) > -1;
	}
	this.AddTextEffect = function(name) {
		activeTextEffects.push( name );
	}
	this.RemoveTextEffect = function(name) {
		activeTextEffects.splice( activeTextEffects.indexOf( name ), 1 );
	}

	/* this is a hook for GIF rendering */
	var didPageFinishThisFrame = false;
	this.DidPageFinishThisFrame = function(){ return didPageFinishThisFrame; };

	var didFlipPageThisFrame = false;
	this.DidFlipPageThisFrame = function(){ return didFlipPageThisFrame; };
};

/* NEW TEXT EFFECTS */
var TextEffects = new Map();

var RainbowEffect = function() { // TODO - should it be an object or just a method?
	this.DoEffect = function(char,time) {
		var h = Math.abs( Math.sin( (time / 600) - (char.col / 8) ) );
		var rgb = hslToRgb( h, 1, 0.5 );
		char.color.r = rgb[0];
		char.color.g = rgb[1];
		char.color.b = rgb[2];
		char.color.a = 255;
	}
};
TextEffects["rbw"] = new RainbowEffect();

var ColorEffect = function(index) {
	this.DoEffect = function(char) {
		var pal = getPal( curPal() );
		var color = pal[ parseInt( index ) ];
		console.log(color);
		char.color.r = color[0];
		char.color.g = color[1];
		char.color.b = color[2];
		char.color.a = 255;
	}
};
TextEffects["clr1"] = new ColorEffect(0);
TextEffects["clr2"] = new ColorEffect(1); // TODO : should I use parameters instead of special names?
TextEffects["clr3"] = new ColorEffect(2);

var WavyEffect = function() {
	this.DoEffect = function(char,time) {
		char.offset.y += Math.sin( (time / 250) - (char.col / 2) ) * 4;
	}
};
TextEffects["wvy"] = new WavyEffect();

var ShakyEffect = function() {
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
TextEffects["shk"] = new ShakyEffect();

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

} // Dialog()