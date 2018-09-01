/*
TODO
- use callbacks
- remove globals
	- tilesize
	- scale
	- palette data
	- sprite, tile, item data
- pass in loading update room?
- tile picker is BROKEN!!!!
- it's too flashy & slow right now :(
- what if INSTEAD of doing everything at once.. I just rendered on an AS-NEEDED basis
	- one image at a time
	- need cacheing strategy
	- need to keep editor renderer up-to-date when you change something WITHOUT re-rendering everything
	- will this get rid of the need for a loading screen?
	- renderer can CONTAIN an "imageStore" variable (instead of the game state)
	- the longer it goes.. the more expensive rendering seems to get
		- keep a memory limit? up to a certain number of sprites in memory? (IF THEY ARE NOT ON SCREEN DELETE THEM)
*/

function Renderer(tilesize, scale, context) {

// TODO : turn this into something with a callback
// 			should this return someting instead of writing into the gameState?
function renderImages(gameState, onComplete) {
	console.log(" -- RENDER IMAGES -- ");

	//init image store
	for (pal in gameState.Palettes) {
		gameState.ImageStore.render[pal] = {
			"1" : {}, //images with primary color index 1 (usually tiles)
			"2" : {}  //images with primary color index 2 (usually sprites)
		};
	}

	var renderList = [];

	/* BUILD RENDER LIST */

	//render images required by sprites
	for (s in gameState.Sprites) {
		var spr = gameState.Sprites[s];
		renderList.push(spr);
		// renderImageForAllPalettes( spr, gameState.ImageStore, gameState.Palettes );
	}
	//render images required by tiles
	for (t in gameState.Tiles) {
		var til = gameState.Tiles[t];
		renderList.push(til);
		// renderImageForAllPalettes( til, gameState.ImageStore, gameState.Palettes );
	}
	//render images required by tiles
	for (i in gameState.Items) {
		var itm = gameState.Items[i];
		renderList.push(itm);
		// renderImageForAllPalettes( itm, gameState.ImageStore, gameState.Palettes );
	}

	/* RENDER DRAWINGS */

	// for (var i = 0; i < renderList.length; i++) {
	// 	var drawing = renderList[i];
	// 	renderImageForAllPalettes( drawing, gameState.ImageStore, gameState.Palettes );
	// }

	var renderInterval = null;
	var renderIndex = 0;

	var renderTimer = new Timer();

	var renderStepCount = 0;
	var renderStepFunc;

	renderStepFunc = function() {
		var renderStepTimer = new Timer();

		// console.log(">>>>> RENDER STEP " + renderStepCount);
		while (renderIndex < renderList.length && renderStepTimer.Milliseconds() < 5) {
			// console.log(">>>>> RENDER " + (renderIndex+1) + " / " + renderList.length);

			// will one image per frame slow things down? (NEED A TIMER TO TEST)
			var drawing = renderList[renderIndex];
			renderImageForAllPalettes( drawing, gameState.ImageStore, gameState.Palettes );
			renderIndex++;

			if (renderIndex >= renderList.length) {
				// console.log(">>>>>>>>>>>>> RENDER TIME " + renderTimer.Milliseconds());
				// console.log(">>>>>>>>>>>>> RENDER STEPS " + renderStepCount);

				if (renderInterval != null)
					clearInterval(renderInterval);

				onComplete();
			}
		}

		renderStepCount++;

		if (renderInterval == null) {
			renderInterval = setInterval(renderStepFunc, 30);
		}
	}

	renderStepFunc();

	// console.log(imageStore);
}
this.RenderImages = renderImages; // public interface

function renderImageForAllPalettes(drawing, imageStore, palettes) {
	var timer = new Timer();

	// console.log("RENDER IMAGE");
	for (pal in palettes) {
		// console.log(pal);

		var col = drawing.col;
		var colStr = "" + col;

		// slightly hacky initialization of image store for palettes with more than 3 colors ~~~ SECRET FEATURE DO NOT USE :P ~~~
		if(imageStore.render[pal][colStr] === undefined || imageStore.render[pal][colStr] === null) {
			// console.log("UNDEFINED " + colStr);
			imageStore.render[pal][colStr] = {};
		}

		// console.log(drawing);
		// console.log(drawing.drw);
		// console.log(imageStore);

		var imgSrc = imageStore.source[ drawing.drw ];

		if ( imgSrc.length <= 1 ) {
			// non-animated drawing
			var frameSrc = imgSrc[0];
			// console.log(drawing);
			// console.log(imageStore);
			imageStore.render[pal][colStr][drawing.drw] = imageDataFromImageSource( frameSrc, pal, col );
		}
		else {
			// animated drawing
			var frameCount = 0;
			for (f in imgSrc) {
				var frameSrc = imgSrc[f];
				var frameId = drawing.drw + "_" + frameCount;
				imageStore.render[pal][colStr][frameId] = imageDataFromImageSource( frameSrc, pal, col );
				frameCount++;
			}
		}
	}

	console.log("IMAGE RENDER TIME " + timer.Milliseconds());
}

function imageDataFromImageSource(imageSource, pal, col) {
	//console.log(imageSource);

	var img = context.createImageData(tilesize*scale,tilesize*scale);
	for (var y = 0; y < tilesize; y++) {
		for (var x = 0; x < tilesize; x++) {
			var px = imageSource[y][x];
			for (var sy = 0; sy < scale; sy++) {
				for (var sx = 0; sx < scale; sx++) {
					var pxl = (((y * scale) + sy) * tilesize * scale * 4) + (((x*scale) + sx) * 4);
					if ( px === 1 && getPal(pal).length > col ) {
						img.data[pxl + 0] = getPal(pal)[col][0]; //ugly
						img.data[pxl + 1] = getPal(pal)[col][1];
						img.data[pxl + 2] = getPal(pal)[col][2];
						img.data[pxl + 3] = 255;
					}
					else { //ch === 0
						img.data[pxl + 0] = getPal(pal)[0][0];
						img.data[pxl + 1] = getPal(pal)[0][1];
						img.data[pxl + 2] = getPal(pal)[0][2];
						img.data[pxl + 3] = 255;
					}
				}
			}
		}
	}
	return img;
}


} // Renderer()


function Timer() {
	var start = Date.now();

	this.Seconds = function() {
		return Math.floor( (Date.now() - start) / 1000 );
	}

	this.Milliseconds = function() {
		return Date.now() - start;
	}
}