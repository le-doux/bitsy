/*
TODO:
- swap exit / entrance
- two-way exits
- how do we handle overlapping exits & entrances????
- BUG: don't duplicate "current exit" in exit info list if the exit already exists in the new room (how???)
- show exit count to help navigation??

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

		exitInfoList = GatherExitInfoList();
		curExitInfo = exitInfoList.find(function(e) { return e.exit == newExit; });

		RenderExits();
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
		if (curExitInfo == null && exitInfoList.length > 0) {
			curExitInfo = exitInfoList[0];
		}

		RenderExits();
	}

	function RenderExits() {
		if (curExitInfo != null) {
			var w = tilesize * scale;

			drawRoom( room[curExitInfo.parentRoom], exitCtx1 );

			exitCtx1.fillStyle = getContrastingColor(room[curExitInfo.parentRoom].pal);
			exitCtx1.strokeStyle = getContrastingColor(room[curExitInfo.parentRoom].pal);
			exitCtx1.lineWidth = 4;
			exitCtx1.fillRect(curExitInfo.exit.x * w, curExitInfo.exit.y * w, w, w);
			exitCtx1.strokeRect((curExitInfo.exit.x * w) - (w/2), (curExitInfo.exit.y * w) - (w/2), w * 2, w * 2);

			drawRoom( room[curExitInfo.exit.dest.room], exitCtx2 );

			exitCtx2.fillStyle = getContrastingColor(room[curExitInfo.exit.dest.room].pal);
			exitCtx2.strokeStyle = getContrastingColor(room[curExitInfo.exit.dest.room].pal);
			exitCtx2.lineWidth = 4;
			exitCtx2.fillRect(curExitInfo.exit.dest.x * w, curExitInfo.exit.dest.y * w, w, w);
			exitCtx2.strokeRect((curExitInfo.exit.dest.x * w) - (w/2), (curExitInfo.exit.dest.y * w) - (w/2), w * 2, w * 2);
		}
		else {
			exitCtx1.clearRect(0, 0, exitCanvas1.width, exitCanvas1.height);
			exitCtx2.clearRect(0, 0, exitCanvas2.width, exitCanvas2.height);
		}
	}

	this.RemoveExit = function() {
		var i = room[curExitInfo.parentRoom].exits.indexOf(curExitInfo.exit);
		room[curExitInfo.parentRoom].exits.splice(i,1);

		exitInfoList = GatherExitInfoList();
		curExitInfo = exitInfoList.length > 0 ? exitInfoList[0] : null;

		RenderExits();
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

	this.TrySelectExitAtLocation = function(x,y) {
		if (placementMode != PlacementMode.None) {
			return false;
		}

		curExitInfo = FindExitAtLocation(x,y);
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
	}

	this.PlaceExit = function(x,y) {
		if (placementMode == PlacementMode.Exit) {
			if (curExitInfo != null) {
				if (curExitInfo.parentRoom != selectedRoom) {
					var oldExitIndex = room[curExitInfo.parentRoom].exits.indexOf(curExitInfo.exit);
					room[curExitInfo.parentRoom].exits.splice(oldExitIndex,1);
					room[selectedRoom].exits.push(curExitInfo.exit);
					curExitInfo.parentRoom = selectedRoom;
				}

				curExitInfo.exit.x = x;
				curExitInfo.exit.y = y;

				refreshGameData();
				RenderExits();
			}
		}
		else if (placementMode == PlacementMode.Destination) {
			if (curExitInfo != null) {
				curExitInfo.exit.dest.room = selectedRoom;

				curExitInfo.exit.dest.x = x;
				curExitInfo.exit.dest.y = y;

				refreshGameData();
				RenderExits();
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

		for (var i in room[selectedRoom].exits) {
			infoList.push({
				parentRoom: selectedRoom,
				exit: room[selectedRoom].exits[i]
			});
		}

		for (var r in room) {
			if (r != selectedRoom) {
				for (var i in room[r].exits) {
					var exit = room[r].exits[i];
					if (exit.dest.room === selectedRoom) {
						infoList.push({
							parentRoom: r,
							exit: exit
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
		}
		else if (dragMode == PlacementMode.Destination) {
			dragExitInfo.exit.dest.x = x;
			dragExitInfo.exit.dest.y = y;
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
} // ExitTool