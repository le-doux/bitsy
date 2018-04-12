/*
	EXPLORER
*/

/*
TODO
- make object
- move code out of editor.js
- what are shared functions? need to share with animation preview thumbnail
- make it support multiple instances
- how to handle selected drawing?? (type + id)
- rename methods to be less verbose
- test in mobile
- use in editor
- method to update thumbnail caption text
*/

function PaintExplorer(idPrefix,selectCallback) {

	var drawingThumbnailCanvas, drawingThumbnailCtx;
	drawingThumbnailCanvas = document.createElement("canvas");
	drawingThumbnailCanvas.width = 8 * scale;
	drawingThumbnailCanvas.height = 8 * scale;
	drawingThumbnailCtx = drawingThumbnailCanvas.getContext("2d");

	/*
	TODO: make variables for all the IDs that use idPrefix that we can store
	*/

	function refreshPaintExplorer( doKeepOldThumbnails, filterString, skipRenderStep ) {
		if( doKeepOldThumbnails == null || doKeepOldThumbnails == undefined )
			doKeepOldThumbnails = false;

		var doFilter = filterString != null && filterString != undefined && filterString.length > 0;

		if( skipRenderStep == null || skipRenderStep == undefined )
			skipRenderStep = false;

		var idList = [];
		if( drawing.type == TileType.Avatar ) {
			idList = ["A"];
		}
		else if( drawing.type == TileType.Sprite ) {
			idList = sortedSpriteIdList();
		}
		else if ( drawing.type == TileType.Tile ) {
			idList = sortedTileIdList();
		}
		else if ( drawing.type == TileType.Item ) {
			idList = sortedItemIdList();
		}

		var hexPalette = [];
		for (id in palette) {
			for (i in getPal(id)){
				var hexStr = rgbToHex( getPal(id)[i][0], getPal(id)[i][1], getPal(id)[i][2] ).slice(1);
				hexPalette.push( hexStr );
			}
		}

		var paintExplorerForm = document.getElementById(idPrefix + "FormInner");
		if( !doKeepOldThumbnails )
			paintExplorerForm.innerHTML = "";
		
		for(var i = 0; i < idList.length; i++) {
			var id = idList[i];
			if(id != "A" || drawing.type == TileType.Avatar)
			{
				if(!skipRenderStep) {
					if( !doKeepOldThumbnails )
						addPaintThumbnail( id ); // create thumbnail element and render thumbnail
					else
						renderPaintThumbnail( id ); // just re-render the thumbnail
				}

				if( doFilter )
					filterPaintThumbnail( id, filterString );
				else
					document.getElementById(idPrefix + "Label_" + id).style.display = "inline-block"; // make it visible otherwise
			}
		}
	}

	function addPaintThumbnail(id) {
		var paintExplorerForm = document.getElementById(idPrefix + "FormInner");

		var radio = document.createElement("input");
		radio.type = "radio";
		radio.name = idPrefix + "Radio";
		radio.id = idPrefix + "Radio_" + id;
		radio.value = id;
		radio.checked = id === drawing.id;

		paintExplorerForm.appendChild(radio);

		var label = document.createElement("label");
		label.htmlFor = idPrefix + "Radio_" + id;
		label.id = idPrefix + "Label_" + id;

		var div = document.createElement("div");
		// div.style.width = "100px";
		// div.style.display = "inline-block";

		var img = document.createElement("img");
		img.id = idPrefix + "Thumbnail_" + id;
		if( drawing.type === TileType.Tile )
			img.title = tile[id].name ? tile[id].name : "tile " + id;
		else if( drawing.type === TileType.Sprite )
			img.title = sprite[id].name ? sprite[id].name : "sprite " + id;
		else if( drawing.type === TileType.Avatar )
			img.title = "avatar";
		else if( drawing.type === TileType.Item )
			img.title = item[id].name ? item[id].name : "item " + id;

		div.appendChild(img);

		var nameCaption = document.createElement("figcaption");
		nameCaption.id = idPrefix + "Caption_" + id;

		nameCaption.innerText = img.title;
		var curPaintMode = paintTool.drawing.type;
		var drawingId = new DrawingId( curPaintMode, id );
		var obj = drawingId.getEngineObject();
		if( obj.name === undefined || obj.name === null ) {
			console.log("default name!!!!");
			nameCaption.classList.add( "thumbnailDefaultName" );
		}

		div.appendChild(nameCaption);

		label.appendChild(div);

		paintExplorerForm.appendChild(label);

		radio.onclick = selectCallback;

		renderPaintThumbnail( id );
	}

	function filterPaintThumbnail(id,filterString) {
		var label = document.getElementById(idPrefix + "Label_" + id);
		var img = document.getElementById(idPrefix + "Thumbnail_" + id);
		var thumbTitle = img.title;

		var foundFilter = thumbTitle.indexOf( filterString ) > -1;

		label.style.display = foundFilter ? "inline-block" : "none";
	}

	// TODO : pull out core of this to make it re-usable
	var thumbnailRenderEncoders = {};
	function renderPaintThumbnail(id) {
		var hexPalette = []; // TODO this is a bit repetitive to do all the time, huh?
		for (pal in palette) {
			for (i in getPal(pal)){
				var hexStr = rgbToHex( getPal(pal)[i][0], getPal(pal)[i][1], getPal(pal)[i][2] ).slice(1);
				hexPalette.push( hexStr );
			}
		}

		// console.log(id);
		var img = document.getElementById(idPrefix + "Thumbnail_" + id);

		var drawingFrameData = [];
		if( drawing.type == TileType.Tile ) {
			// console.log(tile[id]);
			drawTile( getTileImage( tile[id], getRoomPal(curRoom), 0 ), 0, 0, drawingThumbnailCtx );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
			drawTile( getTileImage( tile[id], getRoomPal(curRoom), 1 ), 0, 0, drawingThumbnailCtx );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		}
		else if( drawing.type == TileType.Sprite || drawing.type == TileType.Avatar ){
			// console.log(sprite[id]);
			drawSprite( getSpriteImage( sprite[id], getRoomPal(curRoom), 0 ), 0, 0, drawingThumbnailCtx );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
			drawSprite( getSpriteImage( sprite[id], getRoomPal(curRoom), 1 ), 0, 0, drawingThumbnailCtx );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		}
		else if( drawing.type == TileType.Item ) {
			drawItem( getItemImage( item[id], getRoomPal(curRoom), 0 ), 0, 0, drawingThumbnailCtx );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
			drawItem( getItemImage( item[id], getRoomPal(curRoom), 1 ), 0, 0, drawingThumbnailCtx );
			drawingFrameData.push( drawingThumbnailCtx.getImageData(0,0,8*scale,8*scale).data );
		}

		// create encoder
		var gifData = {
			frames: drawingFrameData,
			width: 8*scale,
			height: 8*scale,
			palette: hexPalette,
			loops: 0,
			delay: animationTime / 10 // TODO why divide by 10???
		};
		var encoder = new gif();

		// cancel old encoder (if in progress already)
		if( thumbnailRenderEncoders[id] != null )
			thumbnailRenderEncoders[id].cancel();
		thumbnailRenderEncoders[id] = encoder;

		// start encoding new GIF
		encoder.encode( gifData, createThumbnailRenderCallback(img) );
	}

	function changePaintExplorerSelection(id) {
		var paintExplorerForm = document.getElementById(idPrefix + "FormInner");
		for( var i = 0; i < paintExplorerForm.childNodes.length; i++ ) {
			var child = paintExplorerForm.childNodes[i];
			if( child.type && child.type === "radio" ) {
				if( child.id === idPrefix + "Radio_" + id )
					child.checked = true;
				else
					child.checked = false;
			}
		}
	}

	function deletePaintThumbnail(id) {
		var paintExplorerForm = document.getElementById(idPrefix + "FormInner");
		paintExplorerForm.removeChild( document.getElementById( idPrefix + "Radio_" + id ) );
		paintExplorerForm.removeChild( document.getElementById( idPrefix + "Label_" + id ) );
	}

}

// TODO : what to do with free floating functions??
function createThumbnailRenderCallback(img) {
	return function(uri) { img.src = uri; img.style.background = "none"; };
}