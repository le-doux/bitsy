function Dialog() {

this.CreateRenderer = function() {
	return new DialogRenderer();
};

this.CreateBuffer = function() {
	return new DialogBuffer();
};

var DialogRenderer = function() {

	// TODO : refactor this eventually? remove everything from struct.. avoid the defaults?
	var textboxInfo = {
		img : null,
		width : 104,
		height : 8+4+2+5, //8 for text, 4 for top-bottom padding, 2 for line padding, 5 for arrow
		top : 12,
		left : 12,
		bottom : 12, //for drawing it from the bottom
		font_scale : 0.5, // we draw font at half-size compared to everything else
		padding_vert : 2,
		padding_horz : 4,
		arrow_height : 5,
	};

	var font = null;
	this.SetFont = function(f) {
		font = f;
		textboxInfo.height = (textboxInfo.padding_vert * 3) + (relativeFontHeight() * 2) + textboxInfo.arrow_height;
		textboxInfo.img = context.createImageData(textboxInfo.width*scale, textboxInfo.height*scale);
	}

	function textScale() {
		return scale * textboxInfo.font_scale;
	}

	function relativeFontWidth() {
		return Math.ceil( font.getWidth() * textboxInfo.font_scale );
	}

	function relativeFontHeight() {
		return Math.ceil( font.getHeight() * textboxInfo.font_scale );
	}

	var context = null;
	this.AttachContext = function(c) {
		context = c;
	};

	this.ClearTextbox = function() {
		if(context == null) return;

		//create new image none exists
		if(textboxInfo.img == null)
			textboxInfo.img = context.createImageData(textboxInfo.width*scale, textboxInfo.height*scale);

		// fill text box with black
		for (var i=0;i<textboxInfo.img.data.length;i+=4)
		{
			textboxInfo.img.data[i+0]=0;
			textboxInfo.img.data[i+1]=0;
			textboxInfo.img.data[i+2]=0;
			textboxInfo.img.data[i+3]=255;
		}
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
	this.DrawChar = function(char, row, col, leftPos) {
		char.offset = {x:0, y:0};

		char.SetPosition(row,col);
		char.ApplyEffects(effectTime);

		var charData = char.bitmap;

		var top = (4 * scale) + (row * 2 * scale) + (row * font.getHeight() * text_scale) + Math.floor( char.offset.y );
		var left = (4 * scale) + (leftPos * text_scale) + Math.floor( char.offset.x );

		var debug_r = Math.random() * 255;

		for (var y = 0; y < char.height; y++) {
			for (var x = 0; x < char.width; x++) {

				var i = (y * char.width) + x;
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
				// else {
				// 	// DEBUG

				// 	//scaling nonsense
				// 	for (var sy = 0; sy < text_scale; sy++) {
				// 		for (var sx = 0; sx < text_scale; sx++) {
				// 			var pxl = 4 * ( ((top+(y*text_scale)+sy) * (textboxInfo.width*scale)) + (left+(x*text_scale)+sx) );
				// 			textboxInfo.img.data[pxl+0] = debug_r;
				// 			textboxInfo.img.data[pxl+1] = 0;
				// 			textboxInfo.img.data[pxl+2] = 0;
				// 			textboxInfo.img.data[pxl+3] = 255;
				// 		}
				// 	}
				// }

			}
		}
		
		// call printHandler for character
		char.OnPrint();
	};

	var effectTime = 0; // TODO this variable should live somewhere better
	this.Draw = function(buffer,dt) {
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

	// this.CharsPerRow = function() {
	// 	return textboxInfo.charsPerRow;
	// }
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
	var font = null;

	this.SetFont = function(f) {
		font = f;
	}

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

			var leftPos = 0;

			for(var j = 0; j < charCount; j++) {
				var char = row[j];
				if(char) {
					// handler( char, i /*rowIndex*/, j /*colIndex*/ );
					handler(char, i /*rowIndex*/, j /*colIndex*/, leftPos)

					leftPos += char.width;
				}
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

	function DialogChar(effectList) {
		this.effectList = effectList.slice(); // clone effect list (since it can change between chars)

		this.color = { r:255, g:255, b:255, a:255 };
		this.offset = { x:0, y:0 }; // in pixels (screen pixels?)

		this.col = 0;
		this.row = 0;

		this.SetPosition = function(row,col) {
			// console.log("SET POS");
			// console.log(this);
			this.row = row;
			this.col = col;
		}

		this.ApplyEffects = function(time) {
			// console.log("APPLY EFFECTS! " + time);
			for(var i = 0; i < this.effectList.length; i++) {
				var effectName = this.effectList[i];
				// console.log("FX " + effectName);
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

		this.bitmap = [];
		this.width = 0;
		this.height = 0;
	}

	function DialogFontChar(font, char, effectList) {
		Object.assign(this, new DialogChar(effectList));

		this.bitmap = font.getChar(char);
		this.width = font.getWidth();
		this.height = font.getHeight();
	}

	function DialogDrawingChar(drawingId, effectList) {
		Object.assign(this, new DialogChar(effectList));

		var imageData = imageStore.source[drawingId][0];
		var imageDataFlat = [];
		for (var i = 0; i < imageData.length; i++) {
			// console.log(imageData[i]);
			imageDataFlat = imageDataFlat.concat(imageData[i]);
		}

		this.bitmap = imageDataFlat;
		this.width = 8;
		this.height = 8;
	}

	function AddWordToCharArray(charArray,word,effectList) {
		for(var i = 0; i < word.length; i++) {
			charArray.push( new DialogFontChar( font, word[i], effectList ) );
		}
		return charArray;
	}

	function GetCharArrayWidth(charArray) {
		var width = 0;
		for(var i = 0; i < charArray.length; i++) {
			width += charArray[i].width;
		}
		return width;
	}

	function GetStringWidth(str) {
		var width = 0;
		for (var i = 0; i < str.length; i++) {
			width += font.getWidth();
		}
		return width;
	}

	var pixelsPerRow = 192; // hard-coded fun times!!!

	this.AddDrawing = function(drawingId, onFinishHandler) {
		// console.log("DRAWING ID " + drawingId);

		var curPageIndex = buffer.length - 1;
		var curRowIndex = buffer[curPageIndex].length - 1;
		var curRowArr = buffer[curPageIndex][curRowIndex];

		var drawingChar = new DialogDrawingChar(drawingId, activeTextEffects)
		drawingChar.SetPrintHandler( onFinishHandler );

		var rowLength = GetCharArrayWidth(curRowArr);

		// TODO : clean up copy-pasted code here :/
		if (rowLength + drawingChar.width  <= pixelsPerRow || rowLength <= 0)
		{
			//stay on same row
			curRowArr.push( drawingChar );
		}
		else if (curRowIndex == 0)
		{
			//start next row
			buffer[ curPageIndex ][ curRowIndex ] = curRowArr;
			buffer[ curPageIndex ].push( [] );
			curRowIndex++;
			curRowArr = buffer[ curPageIndex ][ curRowIndex ];
			curRowArr.push( drawingChar );
		}
		else {
			//start next page
			buffer[ curPageIndex ][ curRowIndex ] = curRowArr;
			buffer.push( [] );
			curPageIndex++;
			buffer[ curPageIndex ].push( [] );
			curRowIndex = 0;
			curRowArr = buffer[ curPageIndex ][ curRowIndex ];
			curRowArr.push( drawingChar );
		}

		isActive = true; // this feels like a bad way to do this???
	}

	// TODO : convert this into something that takes DialogChar arrays
	this.AddText = function(textStr,onFinishHandler) {
		// console.log("ADD TEXT " + textStr);

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

			var wordWithPrecedingSpace = ((i == 0) ? "" : " ") + word;
			var wordLength = GetStringWidth( wordWithPrecedingSpace );

			var rowLength = GetCharArrayWidth(curRowArr);

			if (rowLength + wordLength <= pixelsPerRow || rowLength <= 0) {
				//stay on same row
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

	// this.SetCharsPerRow = function(num){ charsPerRow = num; }; // hacky
};

/* NEW TEXT EFFECTS */
var TextEffects = new Map();

var RainbowEffect = function() { // TODO - should it be an object or just a method?
	this.DoEffect = function(char,time) {
		// console.log("RAINBOW!!!");
		// console.log(char);
		// console.log(char.color);
		// console.log(char.col);

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
		// console.log(color);
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

} // Dialog()