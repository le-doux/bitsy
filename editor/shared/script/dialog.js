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
		if (textDirection === TextDirection.RightToLeft) { // RTL hack
			left = 4 * scale;
		}

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
		char.offset = {
			x: char.base_offset.x,
			y: char.base_offset.y
		}; // compute render offset *every* frame

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
	var arabicHandler = new ArabicHandler();

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
			if (textDirection === TextDirection.RightToLeft) {
				leftPos = 24 * 8; // hack -- I think this is correct?
			}

			for(var j = 0; j < charCount; j++) {
				var char = row[j];
				if(char) {
					if (textDirection === TextDirection.RightToLeft) {
						leftPos -= char.spacing;
					}
					// console.log(j + " " + leftPos);

					// handler( char, i /*rowIndex*/, j /*colIndex*/ );
					handler(char, i /*rowIndex*/, j /*colIndex*/, leftPos)

					if (textDirection === TextDirection.LeftToRight) {
						leftPos += char.spacing;
					}
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
		this.base_offset = { // hacky name
 			x: 0,
			y: 0
		};
		this.spacing = 0;
	}

	function DialogFontChar(font, char, effectList) {
		Object.assign(this, new DialogChar(effectList));

		var charData = font.getChar(char);
		this.bitmap = charData.data;
		this.width = charData.width;
		this.height = charData.height;
		this.base_offset.x = charData.offset.x;
		this.base_offset.y = charData.offset.y;
		this.spacing = charData.spacing;
	}

	function DialogDrawingChar(drawingId, effectList) {
		Object.assign(this, new DialogChar(effectList));

		var imageData = renderer.GetImageSource(drawingId)[0];
		var imageDataFlat = [];
		for (var i = 0; i < imageData.length; i++) {
			// console.log(imageData[i]);
			imageDataFlat = imageDataFlat.concat(imageData[i]);
		}

		this.bitmap = imageDataFlat;
		this.width = 8;
		this.height = 8;
		this.spacing = 8;
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
			width += charArray[i].spacing;
		}
		return width;
	}

	function GetStringWidth(str) {
		var width = 0;
		for (var i = 0; i < str.length; i++) {
			var charData = font.getChar(str[i]);
			width += charData.spacing;
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
		if (rowLength + drawingChar.spacing  <= pixelsPerRow || rowLength <= 0)
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
			if (arabicHandler.ContainsArabicCharacters(word)) {
				word = arabicHandler.ShapeArabicCharacters(word);
			}

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

/* ARABIC */
var ArabicHandler = function() {

	var arabicCharStart = 0x0621;
	var arabicCharEnd = 0x064E;

	var CharacterForm = {
		Isolated : 0,
		Final : 1,
		Initial : 2,
		Middle : 3
	};

	// map glyphs to their character forms
	var glyphForms = {
		/*		 Isolated, Final, Initial, Middle Forms	*/
		0x0621: [0xFE80,0xFE80,0xFE80,0xFE80], /*  HAMZA  */ 
		0x0622: [0xFE81,0xFE82,0xFE81,0xFE82], /*  ALEF WITH MADDA ABOVE  */ 
		0x0623: [0xFE83,0xFE84,0xFE83,0xFE84], /*  ALEF WITH HAMZA ABOVE  */ 
		0x0624: [0xFE85,0xFE86,0xFE85,0xFE86], /*  WAW WITH HAMZA ABOVE  */ 
		0x0625: [0xFE87,0xFE88,0xFE87,0xFE88], /*  ALEF WITH HAMZA BELOW  */ 
		0x0626: [0xFE89,0xFE8A,0xFE8B,0xFE8C], /*  YEH WITH HAMZA ABOVE  */ 
		0x0627: [0xFE8D,0xFE8E,0xFE8D,0xFE8E], /*  ALEF  */ 
		0x0628: [0xFE8F,0xFE90,0xFE91,0xFE92], /*  BEH  */ 
		0x0629: [0xFE93,0xFE94,0xFE93,0xFE94], /*  TEH MARBUTA  */ 
		0x062A: [0xFE95,0xFE96,0xFE97,0xFE98], /*  TEH  */ 
		0x062B: [0xFE99,0xFE9A,0xFE9B,0xFE9C], /*  THEH  */ 
		0x062C: [0xFE9D,0xFE9E,0xFE9F,0xFEA0], /*  JEEM  */ 
		0x062D: [0xFEA1,0xFEA2,0xFEA3,0xFEA4], /*  HAH  */ 
		0x062E: [0xFEA5,0xFEA6,0xFEA7,0xFEA8], /*  KHAH  */ 
		0x062F: [0xFEA9,0xFEAA,0xFEA9,0xFEAA], /*  DAL  */ 
		0x0630: [0xFEAB,0xFEAC,0xFEAB,0xFEAC], /*  THAL */ 
		0x0631: [0xFEAD,0xFEAE,0xFEAD,0xFEAE], /*  RAA  */ 
		0x0632: [0xFEAF,0xFEB0,0xFEAF,0xFEB0], /*  ZAIN  */ 
		0x0633: [0xFEB1,0xFEB2,0xFEB3,0xFEB4], /*  SEEN  */ 
		0x0634: [0xFEB5,0xFEB6,0xFEB7,0xFEB8], /*  SHEEN  */ 
		0x0635: [0xFEB9,0xFEBA,0xFEBB,0xFEBC], /*  SAD  */ 
		0x0636: [0xFEBD,0xFEBE,0xFEBF,0xFEC0], /*  DAD  */ 
		0x0637: [0xFEC1,0xFEC2,0xFEC3,0xFEC4], /*  TAH  */ 
		0x0638: [0xFEC5,0xFEC6,0xFEC7,0xFEC8], /*  ZAH  */ 
		0x0639: [0xFEC9,0xFECA,0xFECB,0xFECC], /*  AIN  */ 
		0x063A: [0xFECD,0xFECE,0xFECF,0xFED0], /*  GHAIN  */ 
		0x063B: [0x0000,0x0000,0x0000,0x0000], /*  space */
		0x063C: [0x0000,0x0000,0x0000,0x0000], /*  space */
		0x063D: [0x0000,0x0000,0x0000,0x0000], /*  space */
		0x063E: [0x0000,0x0000,0x0000,0x0000], /*  space */
		0x063F: [0x0000,0x0000,0x0000,0x0000], /*  space */
		0x0640: [0x0640,0x0640,0x0640,0x0640], /*  TATWEEL  */ 
		0x0641: [0xFED1,0xFED2,0xFED3,0xFED4], /*  FAA  */ 
		0x0642: [0xFED5,0xFED6,0xFED7,0xFED8], /*  QAF  */ 
		0x0643: [0xFED9,0xFEDA,0xFEDB,0xFEDC], /*  KAF  */ 
		0x0644: [0xFEDD,0xFEDE,0xFEDF,0xFEE0], /*  LAM  */ 
		0x0645: [0xFEE1,0xFEE2,0xFEE3,0xFEE4], /*  MEEM  */ 
		0x0646: [0xFEE5,0xFEE6,0xFEE7,0xFEE8], /*  NOON  */ 
		0x0647: [0xFEE9,0xFEEA,0xFEEB,0xFEEC], /*  HEH  */ 
		0x0648: [0xFEED,0xFEEE,0xFEED,0xFEEE], /*  WAW  */ 
		0x0649: [0xFEEF,0xFEF0,0xFBE8,0xFBE9], /*  ALEF MAKSURA  */ 
		0x064A: [0xFEF1,0xFEF2,0xFEF3,0xFEF4], /*  YEH  */ 
		0x064B: [0xFEF5,0xFEF6,0xFEF5,0xFEF6], /*  LAM ALEF MADD*/
		0x064C: [0xFEF7,0xFEF8,0xFEF7,0xFEF8], /*  LAM ALEF HAMZA ABOVE*/
		0x064D: [0xFEF9,0xFEFa,0xFEF9,0xFEFa], /*  LAM ALEF HAMZA BELOW*/
		0x064E: [0xFEFb,0xFEFc,0xFEFb,0xFEFc], /*  LAM ALEF */
	};

	var disconnectedCharacters = [0x0621,0x0622,0x0623,0x0624,0x0625,0x0627,0x062f,0x0630,0x0631,0x0632,0x0648,0x0649,0x064b,0x064c,0x064d,0x064e];

	function IsArabicCharacter(char) {
		var code = char.charCodeAt(0);
		return (code >= arabicCharStart && code <= arabicCharEnd);
	}

	function ContainsArabicCharacters(word) {
		for (var i = 0; i < word.length; i++) {
			if (IsArabicCharacter(word[i])) {
				return true;
			}
		}
		return false;
	}

	function IsDisconnectedCharacter(char) {
		var code = char.charCodeAt(0);
		return disconnectedCharacters.indexOf(code) != -1;
	}

	function ShapeArabicCharacters(word) {
		var shapedWord = "";

		for (var i = 0; i < word.length; i++) {
			if (!IsArabicCharacter(word[i])) {
				shapedWord += word[i];
				continue;
			}

			var connectedToPreviousChar = i-1 >= 0 && IsArabicCharacter(word[i-1]) && !IsDisconnectedCharacter(word[i-1]);

			var connectedToNextChar = i+1 < word.length && IsArabicCharacter(word[i+1]) && !IsDisconnectedCharacter(word[i]);

			var form;
			if (!connectedToPreviousChar && !connectedToNextChar) {
				form = CharacterForm.Isolated;
			}
			else if (connectedToPreviousChar && !connectedToNextChar) {
				form = CharacterForm.Final;
			}
			else if (!connectedToPreviousChar && connectedToNextChar) {
				form = CharacterForm.Initial;
			}
			else if (connectedToPreviousChar && connectedToNextChar) {
				form = CharacterForm.Middle;
			}

			var code = word[i].charCodeAt(0);

			// handle lam alef special case
			if (code == 0x0644 && connectedToNextChar) {
				var nextCode = word[i+1].charCodeAt(0);
				var specialCode = null;
				if (nextCode == 0x0622) {
					// alef madd
					specialCode = glyphForms[0x064b][form];
				}
				else if (nextCode == 0x0623) {
					// hamza above
					specialCode = glyphForms[0x064c][form];
				}
				else if (nextCode == 0x0625) {
					// hamza below
					specialCode = glyphForms[0x064d][form];
				}
				else if (nextCode == 0x0627) {
					// alef
					specialCode = glyphForms[0x064e][form];
				}

				if (specialCode != null) {
					shapedWord += String.fromCharCode(specialCode);
					i++; // skip a step
					continue;
				}
			}

			// hacky?
			if (form === CharacterForm.Isolated) {
				shapedWord += word[i];
				continue;
			}

			var shapedCode = glyphForms[code][form];
			shapedWord += String.fromCharCode(shapedCode);
		}

		return shapedWord;
	}

	this.ContainsArabicCharacters = ContainsArabicCharacters;
	this.ShapeArabicCharacters = ShapeArabicCharacters;
}

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