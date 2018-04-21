function gif() {

// sources:
// http://www.matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp
// http://www.matthewflickinger.com/lab/whatsinagif/lzw_image_data.asp
// http://commandlinefanatic.com/cgi-bin/showarticle.cgi?article=art011

/*
	TODO
	X perf
	X modularize
	- comment
	- publish
*/

/*
GIF DATA FORMAT:

{
	// required
	frames: [[255,0,0,255, 0,255,0,255, 0,0,255,255], [0,0,255,255, 255,0,0,255, 0,255,0,255], [0,255,0,255, 0,0,255,255, 255,0,0,255]],
	width: 3,
	height: 1,
	palette: ["ff0000","00ff00","0000ff"],

	// optional
	loops: 0,
	delay: 100
}
*/

this.encode = function(gifData, callback, progressCallback) {
	//color init stuff
	var colorTableSize = colorTableSizeThatFitsPalette( gifData.palette );
	var colorTable = padPalette( gifData.palette, colorTableSize );

	//start gif
	var gifArr = header( [] );
	gifArr = logicalScreenDescription( gifArr, gifData.width, gifData.height, colorTableSize );
	gifArr = globalColorTable( gifArr, colorTable );

	//image data
	if (gifData.frames.length == 1) {
		//static gif
		gifArr = imageDescriptor( gifArr, 0, 0, gifData.width, gifData.height );
		gifArr = imageData( gifArr, gifData.frames[0], colorTable );

		//end gif
		gifArr = trailer( gifArr );

		//regular js
		returnAsDataUri( gifArr, callback );
	}
	else if (gifData.frames.length > 1) {
		//animated gif
		gifArr = animationApplicationExtension(gifArr, gifData.loops);
		//render one frame per update loop
		isCancelled = false;
		var i = 0;
		var loop = setInterval( function() {
			if (isCancelled) {
				//stop loop
				clearInterval( loop );
			}
			else if (i < gifData.frames.length) {
				// console.log("ENCODE GIF!!!!");
				// console.log(i + " / " + gifData.frames.length);

				if(progressCallback != undefined && progressCallback != null) {
					progressCallback(i, gifData.frames.length);
				}

				//record one frame
				gifArr = animationGraphicsControlExtension( gifArr, gifData.delay );
				gifArr = imageDescriptor( gifArr, 0, 0, gifData.width, gifData.height );
				gifArr = imageData( gifArr, gifData.frames[i], colorTable );
				i++;
			}
			else {
				//end gif
				gifArr = trailer( gifArr );

				//regular js
				returnAsDataUri( gifArr, callback );

				//stop loop
				clearInterval( loop );
			}
		}, 100);
	}
}

this.setAsync = function(isAsync, operationCount) {
	//todo
}

var isCancelled = false;
this.cancel = function() {
	isCancelled = true;
}

//deprecated
/*
function save(gifArr, fileName) {
	var buf = arrayToBuffer(gifArr);
	fs.writeFile(fileName, buf, function() {
		console.log("gif saved!");
	});
}
*/

function returnAsDataUri(gifArr, callback) {
	/*
		TODO
		- to uint8array
		- to blob
		- to base64
	*/
	var arr = new Uint8Array(gifArr);
	var blob = new Blob([arr.buffer]);
	var reader = new window.FileReader();
	reader.readAsDataURL(blob); 
	reader.onloadend = function() {
		base64data = reader.result;
		// base64data = base64data.replace("data:;", "data:image/gif;");
		// base64data = base64data.replace("data:;", "data:attachment/file;"); // for safari
		// console.log("!!!!");
		// console.log(base64data);
		callback( base64data, blob ); // TODO: just return blob?
	}

	/*
	var byteString = "";
	for (var i = 0; i < gifArr.length; i++) {
		byteString += String.fromCharCode( gifArr[i] );
	}
	var uri = "data:image/gif;base64," + window.btoa( byteString );
	return uri;
	*/
}

function arrayToBuffer(gifArr) {
	var arr = new Uint8Array(gifArr);
	var buf = new Buffer(arr.buffer);
	return buf;
}

function pushString(gifArr, str) {
	for (i in str) {
		gifArr.push( str.charCodeAt(i) );
	}
	return gifArr;
}

var signature = "GIF";
var version = "89a";
function header(gifArr) {
	gifArr = pushString(gifArr, signature);
	gifArr = pushString(gifArr, version);
	return gifArr;
}

function pushLittleEndianU16(gifArr, num) {
	gifArr.push( (num >> 0) & 0x00ff );
	gifArr.push( (num >> 8) & 0x00ff );
	return gifArr;
}

var globalColorTableFlag = 1;
var colorResolution = 1;
var sortFlag = 0;
var backgroundColorIndex = 0;
var pixelAspectRatio = 0;
function logicalScreenDescription(gifArr, width, height, colorTableSize) {
	gifArr = pushLittleEndianU16(gifArr, width);
	gifArr = pushLittleEndianU16(gifArr, height);

	var packedByte = 
			(globalColorTableFlag 	<< 7) | 
			(colorResolution 		<< 4) | 
			(sortFlag 				<< 3) |
			(colorTableSize 		<< 0);
	gifArr.push(packedByte);

	gifArr.push(backgroundColorIndex);
	gifArr.push(pixelAspectRatio);

	return gifArr;
}

function pushColorString(gifArr, colorStr) {
	var r = parseInt( "0x" + colorStr.substring(0,2) );
	var g = parseInt( "0x" + colorStr.substring(2,4) );
	var b = parseInt( "0x" + colorStr.substring(4,6) );
	return gifArr.concat( [r,g,b] );
}

function globalColorTable(gifArr, colors) {
	// Add list of palette colors
	for (i in colors) {
		gifArr = pushColorString(gifArr, colors[i]);
	}

	return gifArr;
}

var imageSeparator = 0x2c;
function imageDescriptor(gifArr, left, top, width, height) {
	// Demarcate start of new image
	gifArr.push( imageSeparator );

	// Set section of canvas we're using
	gifArr = pushLittleEndianU16(gifArr, left);
	gifArr = pushLittleEndianU16(gifArr, top);
	gifArr = pushLittleEndianU16(gifArr, width);
	gifArr = pushLittleEndianU16(gifArr, height);

	// Packed byte we're not using.
	// Contains: local color table flag, interlace flag, sort flag, future use, size of local color table
	gifArr.push( 0 );

	return gifArr;
}

//this likely very innefficient
function pixelsToIndices(pixels, colors) {
	var indices = [];

	// hex map for exact matching
	var colorMap = {};
	for (var i in colors) {
		var hex = parseInt("0x"+colors[i]);
		colorMap[ hex ] = parseInt(i);
	}

	// hsl colors for fuzzy matching
	var hslColors = [];
	for (var i in colors) {
		hslColors.push(hexToHsl(colors[i]));
	}

	for (var i = 0; i < pixels.length; i += 4) {
		// first try exact match
		var hex = (pixels[i+0] << 16) | (pixels[i+1] << 8) | (pixels[i+2] << 0);
		var index = colorMap[ hex ];

		// if (index == undefined) index = indices[indices.length-1]; //old hack for unsupported colors

		// if there's no exact match, use fuzzy matching (this might be slow?)
		if (index == undefined) {
			var color = rgbToHsl(pixels[i+0],pixels[i+1],pixels[i+2]);
			index = 0;
			for(var j in hslColors) {
				var color1 = hslColors[index];
				var color2 = hslColors[j];

				var dist1 = colorDistance(color[0],color[1],color[2], color1[0],color1[1],color1[2]);
				var dist2 = colorDistance(color[0],color[1],color[2], color2[0],color2[1],color2[2]);
				if(dist2 < dist1) {
					index = parseInt(j);
				}
			}
		}

		indices.push(index);
	}

	return indices;
}

function initCodeStream() {
	return {
		bytes : [0],
		bitIndex : 0
	};
}

function flipBit(byte, bitIndex) {
	return byte ^ (1 << bitIndex);
}

function getBit(byte, bitIndex) {
	return (byte >> bitIndex) & 1;
}

//packs codes bit by bit into a byte stream
function packCode(codeStream, code, codeSize) {
	var curByte = codeStream.bytes.pop(); //grab last byte in the stream

	for (var i = 0; i < codeSize; i++) {
		var bit = getBit(code,i);
		if (bit == 1) {
			curByte = flipBit(curByte, codeStream.bitIndex);
		}

		codeStream.bitIndex++;
		if (codeStream.bitIndex >= 8) {
			codeStream.bytes.push(curByte); //return filled byte
			curByte = 0; //start new empty byte
			codeStream.bitIndex = 0;
		}
	}

	codeStream.bytes.push(curByte); //return byte to stream
	return codeStream;
}


//TODO async LZW compression
// LZW compression
// The GIF format is always compressed.
// This algorithm is the most processing intensive part of the code, so we'll make it run asynchronously

// Store current state of the lzw algorithm, so it can be run asynchronously (is this the best design?)
/*
var lzwState = {

}

function lzwSetup(indexStream, colors, lzwMinimumCodeSize) {
	//the code table stores patterns of color indices and pairs them with codes
	var codeMap = new Map();
	for (i in colors) { //assumes the colors array has a power of 2 length
		codeMap.set(i + ",", codeMap.size);
	}
	codeMap.set(CLEAR_CODE, codeMap.size);
	codeMap.set(EOI_CODE, codeMap.size);

	//the index buffer stores the indices we're trying to match with a code
	var indexStreamIndex = 0;
	var indexBuffer = "";
	// PERF NOTES: 
	// - We don't do indexStream.shift because it's super slow in JS.
	// - We use Map() instead of an object because indexing is faster.
	// - We use a string for the buffer instead of an array because map can't use arrays as keys.
	indexBuffer += indexStream[indexStreamIndex] + ",";
	indexStreamIndex++;

	//smallest code size is lzwMin + 1, to accomodate the clear code and EOI code
	var codeSize = lzwMinimumCodeSize + 1;

	//need to do all the image blocks in here right now --- refactor?
	var imageBlocks = [];

	// LZW algorithm
	var codeStream = initCodeStream();
	codeStream = packCode(codeStream, codeMap.get(CLEAR_CODE), codeSize);
}

function lzwAlgorithm() {

}

function lzwEnd() {

}
*/

/*
	variables used inside the loop
	- indexStream
	- colors
	- lzwMinimumCodeSize
	- codeMap
	- indexStreamIndex
	- indexBuffer
	- codeSize
	- imageBlocks
	- codeStream

	variables used after the loop
	- codeStream
	- codeMap
	- indexBuffer
	- codeSize
	- imageBlocks
*/

//TODO
// - clean up this function (split into sub-functions)
// LZW compression turns an index stream into a compressed code stream
var CLEAR_CODE = "clear";
var EOI_CODE = "EOI"; // End of information
function lzw(indexStream, colors, lzwMinimumCodeSize) {

	//the code table stores patterns of color indices and pairs them with codes
	var codeMap = new Map();
	for (i in colors) { //assumes the colors array has a power of 2 length
		codeMap.set(i + ",", codeMap.size);
	}
	codeMap.set(CLEAR_CODE, codeMap.size);
	codeMap.set(EOI_CODE, codeMap.size);

	//the index buffer stores the indices we're trying to match with a code
	var indexStreamIndex = 0;
	var indexBuffer = "";
	// PERF NOTES: 
	// - We don't do indexStream.shift because it's super slow in JS.
	// - We use Map() instead of an object because indexing is faster.
	// - We use a string for the buffer instead of an array because map can't use arrays as keys.
	indexBuffer += indexStream[indexStreamIndex] + ",";
	indexStreamIndex++;



	//smallest code size is lzwMin + 1, to accomodate the clear code and EOI code
	var codeSize = lzwMinimumCodeSize + 1;

	//need to do all the image blocks in here right now --- refactor?
	var imageBlocks = [];

	// LZW algorithm
	var codeStream = initCodeStream();
	codeStream = packCode(codeStream, codeMap.get(CLEAR_CODE), codeSize);
	while (indexStreamIndex < indexStream.length) {
		var K = indexStream[indexStreamIndex];
		var indexBufferPlusK = indexBuffer + K + ",";
		var indexBufferPlusKAlreadyExists = codeMap.has(indexBufferPlusK);

		if (indexBufferPlusKAlreadyExists) {
			//since code already exists, keep looking for longer pattern
			indexBuffer = indexBufferPlusK;
			indexStreamIndex++;
		}
		else {
			//add new code
			var nextCode = codeMap.size;
			codeMap.set(indexBufferPlusK, nextCode);

			if (!codeMap.has(indexBuffer)) {
				// failure: there is no matching code for the current indexBuffer
				return [];
			}

			//write current code & restart index buffer
			codeStream = packCode(codeStream, codeMap.get(indexBuffer), codeSize);
			indexBuffer = indexStream[indexStreamIndex] + ",";

			indexStreamIndex++;

			//need to increase code size?
			if (nextCode == Math.pow(2,codeSize)) {
				codeSize++;
				if (codeSize > 12) {
					//write clear code
					codeStream = packCode(codeStream, codeMap.get(CLEAR_CODE), 12);
					//reset code size
					codeSize = lzwMinimumCodeSize + 1;
					//reset code table
					codeMap.clear();
					for (i in colors) { //assumes the colors array has a power of 2 length
						codeMap.set(i + ",", codeMap.size);
					}
					codeMap.set(CLEAR_CODE, codeMap.size);
					codeMap.set(EOI_CODE, codeMap.size);
				}
			}
		}
		if (codeStream.bytes.length > 255) {
			//reached the end of an image block
			var completedBytes = codeStream.bytes;
			
			var nextBytes = [];
			while (completedBytes.length > 255) nextBytes.unshift( completedBytes.pop() );
			codeStream.bytes = nextBytes;

			imageBlocks.push(completedBytes.length);
			imageBlocks = imageBlocks.concat(completedBytes);
		}
	}
	codeStream = packCode(codeStream, codeMap.get(indexBuffer), codeSize);
	codeStream = packCode(codeStream, codeMap.get(EOI_CODE), codeSize);

	//todo might need to account for going past 255 here
	//if (codeStream.bytes.length > 255) console.log("uh oh BIGGER THAN 255 at end");
	imageBlocks.push(codeStream.bytes.length);
	imageBlocks = imageBlocks.concat(codeStream.bytes);

	return imageBlocks;
}

//uses LZW compression to create image data
function imageData(gifArr, pixels, colors) {
	//find lzw min code size (this is a dumb algo probs)
	var lzwMinimumCodeSize = 1;
	while ( Math.pow(2,lzwMinimumCodeSize) < colors.length ) {
		lzwMinimumCodeSize++;
	}
	gifArr.push(lzwMinimumCodeSize);

	var indexStream = pixelsToIndices(pixels, colors);
	
	var imageBlocks = lzw(indexStream, colors, lzwMinimumCodeSize);
	gifArr = gifArr.concat(imageBlocks);

	gifArr.push(0);

	return gifArr;
}

function trailer(gifArr) {
	gifArr.push( 0x3b );
	return gifArr;
}

//refactor and rename?
function colorTableSizeThatFitsPalette(colors) {
	var size = 0;
	while (colors.length > Math.pow(2,size+1)) {
		size++;
	}
	return size;
}

function padPalette(colors, size) {
	var realSize = Math.pow(2,size+1);
	var paletteSize = colors.length;
	for (var i = 0; i < (realSize - paletteSize); i++) {
		colors.push("000000");
	}
	return colors;
}

var extensionIntroducer = 0x21;
function extensionLabel(gifArr, extensionLabel) {
	gifArr.push(extensionIntroducer);
	gifArr.push(extensionLabel);
	return gifArr;
}

var applicationExtensionLabel = 0xff;
function applicationExtensionId(gifArr, identifier, authenticationCode) {
	gifArr = extensionLabel(gifArr, applicationExtensionLabel);
	var blockSize = identifier.length + authenticationCode.length;
	gifArr.push(blockSize);
	gifArr = pushString(gifArr, identifier);
	gifArr = pushString(gifArr, authenticationCode);
	return gifArr;
}

var animationIdentifier = "NETSCAPE";
var animationAuthenticationCode = "2.0";
var animationBlockSize = 3;
function animationApplicationExtension(gifArr, loops) {
	gifArr = applicationExtensionId(gifArr, animationIdentifier, animationAuthenticationCode);
	gifArr.push(animationBlockSize);
	gifArr.push(1); //always start with 1 for some reason
	gifArr = pushLittleEndianU16(gifArr, loops); // The number of times the animation loops. 0 == loop forever.
	gifArr.push(0); //block terminator
	return gifArr;
}

var graphicsControlLabel = 0xf9;
var graphicsControlBlockSize = 4;
var graphicsDisposalMethods = { //todo rename?
	none : 0, //only used for non-animated GIFs
	keep : 1, //leave image as is, and draw on top of it
	clear : 2, //fill image with background color
	revert : 3 //go back to state before this image was drawn
	//methods 4-7 are not yet defined by the GIF standard
};
function graphicsControlExtension(gifArr, disposalMethod, userInputFlag, transparencyFlag, delayTime, transparentColorIndex) {
	gifArr = extensionLabel(gifArr, graphicsControlLabel);
	gifArr.push(graphicsControlBlockSize);

	var packedByte = 
			(0 					<< 5) | //the 3 highest bits are reserved for future use by the GIF standard
			(disposalMethod 	<< 2) | //how do we want to dispose of the current frame before drawing the next one?
			(userInputFlag 		<< 1) | //0 == default, set to 1 to wait for user input before advancing frame
			(transparencyFlag 	<< 0);  //set to 1 to use transparency
	gifArr.push(packedByte);

	gifArr = pushLittleEndianU16(gifArr, delayTime); //delay time between frames in hundredths of a second

	gifArr.push(transparentColorIndex) //which color is transparent?

	gifArr.push(0) //block terminator
	return gifArr;
}

//fills the graphics control extension with defaults for a basic animation
function animationGraphicsControlExtension(gifArr, delayTime) {
	gifArr = graphicsControlExtension(gifArr, graphicsDisposalMethods.keep, 0, 0, delayTime, 0);
	return gifArr;
};







/* PERF */
// perf code needs to be re-created for vanilla js
/*
var perfData = {};

function perf(name) {
	if (!(name in perfData)) {
		//create and start tracking
		perfData[name] = {
			time : 0,
			start : process.hrtime(),
			isTracking : true,
			count : 1
		};
	}
	else {
		if (!perfData[name].isTracking) {
			//start tracking
			perfData[name].start = process.hrtime();
			perfData[name].isTracking = true;
			perfData[name].count++;
		}
		else {
			//stop tracking
			var diff = process.hrtime(perfData[name].start);
			var elapsedTime = (diff[0] * 1e9) + diff[1]; //time in nanoseconds
			perfData[name].time += elapsedTime;
			perfData[name].isTracking = false;
		}
	}
}

function perfPrint() {
	console.log("***** PERF ****");
	for (block in perfData) {
		var t = (perfData[block].time)/1e6;
		var n = perfData[block].count;
		console.log( block + " " + t + " / " + n + " = " + (t/n) );
	}
	console.log("***************");
}
*/
/* END PERF */





/* TEST */
this.test = function() {
	console.log("START");

	var gif = {
		frames: [[255,0,0,255, 0,255,0,255, 0,0,255,255], [0,0,255,255, 255,0,0,255, 0,255,0,255], [0,255,0,255, 0,0,255,255, 255,0,0,255]],
		width: 3,
		height: 1,
		palette: ["ff0000","00ff00","0000ff"],
		loops: 0,
		delay: 100
	};

	//perf("total");
	this.encode(gif, function(buffer) {
		//perf("total");
		//perfPrint();
		console.log("gif encoded!");
		console.log(buffer);
		//fs only works in node.js
		/*
		fs.writeFile("proof.gif", buffer, function() {
			console.log("gif saved!");
		});
		*/
	});

	console.log("END");
}
//test();

console.log("gif encoder initialized!");

} // gif()