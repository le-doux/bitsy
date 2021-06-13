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