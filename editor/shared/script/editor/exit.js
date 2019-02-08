/*
TODO:
X exit pairs
X exit direction control
- exit dialog
	- file format
	- new script functions
	- UI control


TODO:
- exit direction switching more or less works BUT with some major bugs
	X when switching back to two-way the exits swap
	X weird rendering stuff
	X weird room switching stuff
X lots of issues when "carrying over" exits from other room
- cancel "carry over" room when closing exit tool??

NEW TODOS:
- stop room tool relying on "curRoom" -- give it an internal state

TODO:
- how do we handle overlapping exits & entrances????
- BUG: don't duplicate "current exit" in exit info list if the exit already exists in the new room (how???)
- show exit count to help navigation??
- BUG: moving exit into a new room doesn't update exit info list
- BUG: on switching rooms, paired exits don't render correctly at first

the big think to think about:
**** new file format for exits ****
features:
- two way exits
- transitions
- swap characters
- ? play dialog
- ? lock based on variables
- future expansion

future:
- start from room / exit / location?
- should I have direct exit value manipulation (room + coords) as dropdowns?
- better logic for initial placement of entrance / exit for door



prototype file formats:
EXT 13,4 0 7,9

EXT 13,4 0 7,9
- RETURN 1
- AVATAR 11
- TRANSITION fade

EXT 13,4 0 7,9 DLG EXT_15

DLG EXT_15
"""
{changeAvatar "11"}
{playTransition "fade"}
"""

how to handle transitions in code?
- {playTransition} {nextTransition} {setTransition}
- thought: easiest is {nextTransition} that resets after transition is done

locks could be:
- if dialog returns false.. you can't go through the door!
	- this suggests all dialog plays BEFORE you enter the door.. is that true?

Major questions:
- should two-way exits be two exits.. or one exit with a return marker?
- should other properties of exits be hard-code? or triggered by an attached dialog?
- out there ideas: multiple exit functions (on touch, on enter, during transition) each with their own dialog


possible new functions
{nextTransition "transitionName"}
{setAvatar "IDorName"}
{getAvatar}



a weird thought.. an exit that always returned false would become a trigger (support that explicitly???)

would I need a way to edit the exit dialog code directly? what happens if the user does something weird??? (default to "custom")
*/


function ExitTool(exitCanvas1, exitCanvas2) {
	var selectedRoom = null;

	var exitInfoList = [];
	var curExitInfo = null;

	exitCanvas1.width = width * scale; // TODO : globals?
	exitCanvas1.height = width * scale;
	var exitCtx1 = exitCanvas1.getContext("2d");

	exitCanvas2.width = width * scale; // TODO : globals?
	exitCanvas2.height = width * scale;
	var exitCtx2 = exitCanvas2.getContext("2d");

	var PlacementMode = { // TODO : awkward name
		None : 0,
		Exit : 1,
		Destination : 2 // TODO : will I have to rename this?
	};
	var placementMode = PlacementMode.None;

	// NOTE: the "link state" is a UI time concept -- it is not stored in the game data
	var LinkState = {
		TwoWay : 0, // two way exit
		OneWayOriginal : 1, // one way exit - in same state as when it was "gathered"
		OneWaySwapped : 2, // one way exit - swapped direction from how it was "gathered"
	};

	UpdatePlacementButtons();

	this.AddExit = function() {
		console.log(room);
		var newExit = {
			x : 0,
			y : 0,
			dest : { // start with valid destination so you can't accidentally uncreate exits
				room : "0",
				x : 15,
				y : 15
			}
		}
		room[selectedRoom].exits.push( newExit );

		var newReturn = {
			x : newExit.dest.x,
			y : newExit.dest.y,
			dest : {
				room : selectedRoom,
				x : newExit.x,
				y : newExit.y
			}
		}
		room[newExit.dest.room].exits.push( newReturn );

		exitInfoList = GatherExitInfoList();
		curExitInfo = exitInfoList.find(function(e) { return e.exit == newExit; });

		RenderExits();
		refreshGameData();
	};

	this.SetRoom = function(roomId) {
		selectedRoom = roomId;
		ResetExitList();
	}

	this.Refresh = function() { // TODO: rename "Reset"???
		curExitInfo = null;
		ResetExitList();
	}

	function ResetExitList() {
		exitInfoList = GatherExitInfoList();

		if (curExitInfo != null) {
			// check for exit info that duplicates the carry over exit info
			var duplicate = exitInfoList.find(function(info) {
				return (curExitInfo.exit == info.exit && curExitInfo.return == info.return) ||
					(curExitInfo.exit == info.return && curExitInfo.return == info.exit);
			});
			if (duplicate != undefined && duplicate != null) {
				// if there is a duplicate.. replace it with the carry over exit
				exitInfoList[exitInfoList.indexOf(duplicate)] = curExitInfo;
			}
		}
		else {
			if (exitInfoList.length > 0) {
				// fallback selected exit
				curExitInfo = exitInfoList[0];
			}
		}

		RenderExits();
	}

	function RenderExits() {
		if (curExitInfo != null) {
			var w = tilesize * scale;

			var exitCtx = exitCtx1;
			var destCtx = exitCtx2;
			if (curExitInfo.linkState == LinkState.OneWaySwapped) {
				exitCtx = exitCtx2;
				destCtx = exitCtx1;
			}

			drawRoom( room[curExitInfo.parentRoom], exitCtx );

			exitCtx.fillStyle = getContrastingColor(room[curExitInfo.parentRoom].pal);
			exitCtx.strokeStyle = getContrastingColor(room[curExitInfo.parentRoom].pal);
			exitCtx.lineWidth = 4;
			exitCtx.fillRect(curExitInfo.exit.x * w, curExitInfo.exit.y * w, w, w);
			exitCtx.strokeRect((curExitInfo.exit.x * w) - (w/2), (curExitInfo.exit.y * w) - (w/2), w * 2, w * 2);

			drawRoom( room[curExitInfo.exit.dest.room], destCtx );

			destCtx.fillStyle = getContrastingColor(room[curExitInfo.exit.dest.room].pal);
			destCtx.strokeStyle = getContrastingColor(room[curExitInfo.exit.dest.room].pal);
			destCtx.lineWidth = 4;
			destCtx.fillRect(curExitInfo.exit.dest.x * w, curExitInfo.exit.dest.y * w, w, w);
			destCtx.strokeRect((curExitInfo.exit.dest.x * w) - (w/2), (curExitInfo.exit.dest.y * w) - (w/2), w * 2, w * 2);
		}
		else {
			exitCtx1.clearRect(0, 0, exitCanvas1.width, exitCanvas1.height);
			exitCtx2.clearRect(0, 0, exitCanvas2.width, exitCanvas2.height);
		}

		// just tacking this on here to make sure it updates
		UpdateExitDirectionUI();
	}

	this.RemoveExit = function() {
		if (curExitInfo.hasReturn) {
			var returnIndex = room[curExitInfo.exit.dest.room].exits.indexOf(curExitInfo.return);
			room[curExitInfo.exit.dest.room].exits.splice(returnIndex,1);
		}
		var exitIndex = room[curExitInfo.parentRoom].exits.indexOf(curExitInfo.exit);
		room[curExitInfo.parentRoom].exits.splice(exitIndex,1);

		exitInfoList = GatherExitInfoList();
		curExitInfo = exitInfoList.length > 0 ? exitInfoList[0] : null;

		RenderExits();
		refreshGameData();
	}

	this.IsPlacingExit = function () {
		return placementMode != PlacementMode.None;
	}

	this.GetSelectedExit = function() {
		if (curExitInfo != null) {
			return curExitInfo.exit;
		}
		else {
			return null;
		}
	}

	this.GetSelectedReturn = function() {
		if (curExitInfo != null && curExitInfo.hasReturn) {
			return curExitInfo.return;
		}
		else {
			return null;
		}
	}

	this.TrySelectExitAtLocation = function(x,y) {
		if (placementMode != PlacementMode.None) {
			return false;
		}

		var foundExit = FindExitAtLocation(x,y);
		if (foundExit != null) {
			curExitInfo = foundExit;
		}
		RenderExits();

		return curExitInfo != null;
	}

	function FindExitAtLocation(x,y) {
		for (var i = 0; i < exitInfoList.length; i++) {
			var exitInfo = exitInfoList[i];
			if (exitInfo.parentRoom === selectedRoom) {
				if (exitInfo.exit.x == x && exitInfo.exit.y == y) {
					return exitInfo;
				}
				else if (exitInfo.exit.dest.x == x && exitInfo.exit.dest.y == y) {
					return exitInfo;
				}
			}
			else if (exitInfo.exit.dest.room === selectedRoom) {
				if (exitInfo.exit.dest.x == x && exitInfo.exit.dest.y == y) {
					return exitInfo;
				}
			}
		}
		return null;
	}

	this.TogglePlacingExit = function(isPlacing) {
		if (isPlacing) {
			placementMode = PlacementMode.Exit;
		}
		else {
			placementMode = PlacementMode.None;
		}
		UpdatePlacementButtons();
	}

	this.TogglePlacingDestination = function(isPlacing) {
		if (isPlacing) {
			placementMode = PlacementMode.Destination;
		}
		else {
			placementMode = PlacementMode.None;
		}
		UpdatePlacementButtons();
	}

	this.SelectExitRoom = function() {
		// hacky global method!!
		if (curExitInfo != null) {
			selectRoom(curExitInfo.parentRoom);
		}
	}

	this.SelectDestinationRoom = function() {
		console.log("SELECT DEST ROOM");
		// hacky global method!!
		if (curExitInfo != null) {
			selectRoom(curExitInfo.exit.dest.room);
		}
	}

	function UpdatePlacementButtons() {
		// hackily relies on global UI names oh well D:
		if (placementMode == PlacementMode.Exit) {
			document.getElementById("toggleMoveExitDoor1").checked = true;
			document.getElementById("textMoveExitDoor1").innerText = "moving"; // TODO localize
			document.getElementById("cancelMoveExitDoor1").style.display = "inline";
		}
		else {
			document.getElementById("toggleMoveExitDoor1").checked = false;
			document.getElementById("textMoveExitDoor1").innerText = "move door"; // TODO localize
			document.getElementById("cancelMoveExitDoor1").style.display = "none";
		}

		if (placementMode == PlacementMode.Destination) {
			document.getElementById("toggleMoveExitDoor2").checked = true;
			document.getElementById("textMoveExitDoor2").innerText = "moving"; // TODO localize
			document.getElementById("cancelMoveExitDoor2").style.display = "inline";
		}
		else {
			document.getElementById("toggleMoveExitDoor2").checked = false;
			document.getElementById("textMoveExitDoor2").innerText = "move door"; // TODO localize
			document.getElementById("cancelMoveExitDoor2").style.display = "none";
		}

		if (placementMode == PlacementMode.None) {
			document.body.style.cursor = "pointer";
		}
		else {
			document.body.style.cursor = "crosshair";
		}
	}

	this.PlaceExit = function(x,y) {
		if (placementMode == PlacementMode.Exit) {
			if (curExitInfo != null) {
				// return (change return destination)
				if (curExitInfo.hasReturn) {
					curExitInfo.return.dest.room = selectedRoom;
					curExitInfo.return.dest.x = x;
					curExitInfo.return.dest.y = y;
				}

				// room
				if (curExitInfo.parentRoom != selectedRoom) {
					var oldExitIndex = room[curExitInfo.parentRoom].exits.indexOf(curExitInfo.exit);
					room[curExitInfo.parentRoom].exits.splice(oldExitIndex,1);
					room[selectedRoom].exits.push(curExitInfo.exit);
					curExitInfo.parentRoom = selectedRoom;
				}

				// exit pos
				curExitInfo.exit.x = x;
				curExitInfo.exit.y = y;

				refreshGameData();
				ResetExitList();
			}
		}
		else if (placementMode == PlacementMode.Destination) {
			if (curExitInfo != null) {
				// return (change return origin)
				if (curExitInfo.hasReturn) {
					if (curExitInfo.exit.dest.room != selectedRoom) {
						var oldReturnIndex = room[curExitInfo.exit.dest.room].exits.indexOf(curExitInfo.return);
						room[curExitInfo.exit.dest.room].exits.splice(oldReturnIndex,1);
						room[selectedRoom].exits.push(curExitInfo.return);
					}

					curExitInfo.return.x = x;
					curExitInfo.return.y = y;
				}

				// room
				curExitInfo.exit.dest.room = selectedRoom;

				// destination pos
				curExitInfo.exit.dest.x = x;
				curExitInfo.exit.dest.y = y;

				refreshGameData();
				ResetExitList();
			}
		}

		placementMode = PlacementMode.None;
		UpdatePlacementButtons();
	}

	this.PrevExit = function() {
		if (exitInfoList.length > 0) {
			if (curExitInfo != null) {
				var index = exitInfoList.indexOf(curExitInfo);
				if (index != -1) {
					index--;
					if (index < 0) {
						index = exitInfoList.length - 1;
					}

					curExitInfo = exitInfoList[index];
				}
				else {
					curExitInfo = exitInfoList[0];
				}
			}
			else {
				curExitInfo = exitInfoList[0];
			}
		}
		else {
			curExitInfo = null;
		}
		RenderExits();
	}

	this.NextExit = function() {
		if (exitInfoList.length > 0) {
			if (curExitInfo != null) {
				var index = exitInfoList.indexOf(curExitInfo);
				if (index != -1) {
					index++;
					if (index >= exitInfoList.length) {
						index = 0;
					}

					curExitInfo = exitInfoList[index];
				}
				else {
					curExitInfo = exitInfoList[0];
				}
			}
			else {
				curExitInfo = exitInfoList[0];
			}
		}
		else {
			curExitInfo = null;
		}
		RenderExits();
	}

	function GatherExitInfoList()
	{
		var infoList = [];

		var findReturnExit = function(parentRoom, startExit) {
			var returnExit = null;
			for (var j in room[startExit.dest.room].exits) {
				var otherExit = room[startExit.dest.room].exits[j];
				if (otherExit.dest.room === parentRoom &&
					otherExit.dest.x == startExit.x && otherExit.dest.y == startExit.y) {
						returnExit = otherExit;
				}
			}
			return returnExit;
		}

		for (var i in room[selectedRoom].exits) {
			var localExit = room[selectedRoom].exits[i];
			var returnExit = findReturnExit(selectedRoom, localExit);

			if (returnExit != null) {
				var alreadyExistingExitInfo = infoList.find(function(e) { return e.exit == returnExit; });
				if (alreadyExistingExitInfo != null && alreadyExistingExitInfo != undefined) {
					continue; // avoid duplicates when both parts of a paired exit are in the same room
				}
			}

			infoList.push({
				parentRoom: selectedRoom,
				exit: room[selectedRoom].exits[i],
				hasReturn: returnExit != null,
				return: returnExit,
				linkState: returnExit ? LinkState.TwoWay : LinkState.OneWayOriginal
			});
		}

		for (var r in room) {
			if (r != selectedRoom) {
				for (var i in room[r].exits) {
					var exit = room[r].exits[i];
					if (exit.dest.room === selectedRoom && findReturnExit(r,exit) == null) {
						infoList.push({
							parentRoom: r,
							exit: exit,
							hasReturn: false,
							return: null,
							linkState: LinkState.OneWayOriginal
						});
					}
				}
			}
		}

		return infoList;
	}

	var dragMode = PlacementMode.None;
	var dragExitInfo = null;
	this.StartDrag = function(x,y) {
		dragMode == PlacementMode.None;
		dragExitInfo = FindExitAtLocation(x,y);

		if (dragExitInfo != null) {
			if (dragExitInfo.parentRoom === selectedRoom &&
					dragExitInfo.exit.x == x && dragExitInfo.exit.y == y) {
				dragMode = PlacementMode.Exit;
			}
			else if (dragExitInfo.exit.dest.room === selectedRoom &&
						dragExitInfo.exit.dest.x == x && dragExitInfo.exit.dest.y == y) {
				dragMode = PlacementMode.Destination;
			}
		}
	}

	this.ContinueDrag = function(x,y) {
		if (dragExitInfo == null) {
			return;
		}

		if (dragMode == PlacementMode.Exit) {
			dragExitInfo.exit.x = x;
			dragExitInfo.exit.y = y;
			if (dragExitInfo.hasReturn) {
				dragExitInfo.return.dest.x = x;
				dragExitInfo.return.dest.y = y;
			}
		}
		else if (dragMode == PlacementMode.Destination) {
			dragExitInfo.exit.dest.x = x;
			dragExitInfo.exit.dest.y = y;
			if (dragExitInfo.hasReturn) {
				dragExitInfo.return.x = x;
				dragExitInfo.return.y = y;
			}
		}
		
		refreshGameData();
		RenderExits();
	}

	this.EndDrag = function() {
		if (dragMode != PlacementMode.None) {
			dragMode = PlacementMode.None;
			dragExitInfo = null;
			refreshGameData();
			RenderExits();
		}
	}

	this.IsDraggingExit = function() {
		return dragMode != PlacementMode.None;
	}

	this.GetExitInfoList = function() {
		console.log("get exit info " + selectedRoom);
		// ResetExitList(); // make sure we are up to date!
		return exitInfoList;
	}

	this.ChangeExitLink = function() {
		function swapExitAndEntrance() {
			var tempDestRoom = curExitInfo.parentRoom;
			var tempDestX = curExitInfo.exit.x;
			var tempDestY = curExitInfo.exit.y;

			// remove exit from current parent room
			var exitIndex = room[curExitInfo.parentRoom].exits.indexOf(curExitInfo.exit);
			room[curExitInfo.parentRoom].exits.splice(exitIndex,1);

			// add to destination room
			room[curExitInfo.exit.dest.room].exits.push(curExitInfo.exit);
			curExitInfo.parentRoom = curExitInfo.exit.dest.room;

			// swap positions
			curExitInfo.exit.x = curExitInfo.exit.dest.x;
			curExitInfo.exit.y = curExitInfo.exit.dest.y;
			curExitInfo.exit.dest.room = tempDestRoom;
			curExitInfo.exit.dest.x = tempDestX;
			curExitInfo.exit.dest.y = tempDestY;
		}

		if (curExitInfo != null) {
			if (curExitInfo.linkState == LinkState.TwoWay) {
				// -- get rid of return exit --
				if (curExitInfo.hasReturn) {
					var returnIndex = room[curExitInfo.exit.dest.room].exits.indexOf(curExitInfo.return);
					room[curExitInfo.exit.dest.room].exits.splice(returnIndex,1);

					curExitInfo.return = null;
					curExitInfo.hasReturn = false;
				}

				curExitInfo.linkState = LinkState.OneWayOriginal;
			}
			else if (curExitInfo.linkState == LinkState.OneWayOriginal) {
				// -- swap the exit & entrance --
				swapExitAndEntrance();

				curExitInfo.linkState = LinkState.OneWaySwapped;
			}
			else if (curExitInfo.linkState == LinkState.OneWaySwapped) {
				// -- create a return exit --
				swapExitAndEntrance(); // swap first

				var newReturn = {
					x : curExitInfo.exit.dest.x,
					y : curExitInfo.exit.dest.y,
					dest : {
						room : curExitInfo.parentRoom,
						x : curExitInfo.exit.x,
						y : curExitInfo.exit.y
					}
				}
				room[curExitInfo.exit.dest.room].exits.push( newReturn );

				curExitInfo.return = newReturn;
				curExitInfo.hasReturn = true;

				curExitInfo.linkState = LinkState.TwoWay;
			}

			refreshGameData();
			RenderExits();
		}
	}

	function UpdateExitDirectionUI() {
		//hacky globals again
		if (curExitInfo != null) {
			if (curExitInfo.linkState == LinkState.TwoWay) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "visible";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "visible";
			}
			else if (curExitInfo.linkState == LinkState.OneWayOriginal) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "hidden";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "visible";
			}
			else if (curExitInfo.linkState == LinkState.OneWaySwapped) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "visible";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "hidden";
			}
		}
	}
} // ExitTool