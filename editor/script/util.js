/* UTILS
miscellaneous utility functions for the editor
TODO: encapsulate in an object maybe? or is that overkill?
*/

function clamp(val, min, max) {
	return Math.max(Math.min(val, max), min);
}

function dialogReferenceCount(dlgId) {
	var count = 0;

	for (var sprId in sprite) {
		if (sprite[sprId].dlg === dlgId) {
			count++;
		}
	}

	for (var itmId in item) {
		if (item[itmId].dlg === dlgId) {
			count++;
		}
	}

	for (var rmId in room) {
		for (var i = 0; i < room[rmId].exits.length; i++) {
			var exit = room[rmId].exits[i];
			if (exit.dlg === dlgId) {
				count++;
			}
		}

		for (var i = 0; i < room[rmId].endings.length; i++) {
			var ending = room[rmId].endings[i];
			if (ending.id === dlgId) {
				count++;
			}
		}
	}

	return count;
}

function deleteUnreferencedDialog(dlgId) {
	if (dialogReferenceCount(dlgId) <= 0) {
		delete dialog[dlgId];
	}

	// todo : refresh game data?
}

// DRAWING UTILS
var TileType = {
	Tile : "TIL",
	Sprite : "SPR",
	Avatar : "AVA",
	Item : "ITM",
};

function getDrawingImageSource(drawing) {
	return renderer.GetImageSource(drawing.drw);
}

function getDrawingFrameData(drawing, frameIndex) {
	var imageSource = getDrawingImageSource(drawing);
	return imageSource[frameIndex];
}

// todo : localize
function tileTypeToString(type) {
	if (type == TileType.Tile) {
		return "tile";
	}
	else if (type == TileType.Sprite) {
		return "sprite";
	}
	else if (type == TileType.Avatar) {
		return "avatar";
	}
	else if (type == TileType.Item) {
		return "item";
	}
}

function tileTypeToIdPrefix(type) {
	if (type == TileType.Tile) {
		return "TIL_";
	}
	else if (type == TileType.Sprite || type == TileType.Avatar) {
		return "SPR_";
	}
	else if (type == TileType.Item) {
		return "ITM_";
	}
}

function getDrawingDescription(d) {
	return tileTypeToString(d.type) + " " + d.id;
}

function getDrawingNameOrDescription(d) {
	return d.name ? d.name : getDrawingDescription(d);
}

// this seems not that helpful anymore..
function getDrawingDialogId(d) {
	var dialogId = null;

	if (d.type === TileType.Sprite || d.type === TileType.Item) {
		dialogId = d.dlg;
	}

	return dialogId;
}