/*
TODO:
- add endings and "triggers"
- rename tool?
	- rename everything that is so exit specific
- remove areEndingsVisible
- effects or EFF

TODO:
- advanced exit TODO:
	X play dialog on (before?) exit
	X script return values
	X lock exits on return false
	- {changeAvatar} function
	X room transitions system
	- {nextTransition} function
	- change how sprites work?
		- allow multiple?
		- allow switching of avatar
	- consider changes to scripting format
		X return values
		X {} multi-line blocks (functions??)
		- deprecate """ blocks?
		- replace DLG with SCRIPT (name?) blocks?
		- bigger API? scene objects?? structs??
	- consider "triggers" AKA script-only exits
		EXT 0,0 NULL DLG dlg_id (or something) (what about? TRG 0,0 dlg_id)

=== object and function notation ideas ===
-- anonymous object
{obj var1=a var2=b} // create instance
{obj : var1=a var2=b} // with separator
-- named object
{obj name : var1=a var2} // define prototype (globally?)
{new name var2=c} // create instance
-- access object properties
{obj1.x = 5} // set
{2 == obj1.y} // test value
{obj1.func a b} // call method
-- anonymous function
fx = {func param1 param2 => body} // create
{fx a b} // invoke
{func : param1 param2 => body} // create with separator
-- named function
{func name : param1 param2 => body} // define (globally?)
{name a b} // invoke

transition system notes
- fade: black, white, color?
- slide: left, right, up, down
- other? fuzz, wave, flash, pie circle, circle collapse (cartoon end), other??
- this basically requires a post-processing effect
- TODO
	- make sure it is pixel bound to the correct resolution 128 x 128
	- try a few effects!
	- try limiting the frame rate!
	- make real transition manager object

changeAvatar notes
// TODO : this is kind of hacky
// - needs to work with names too
// - should it work only on the drawing? or other things too??
// - need to think about how the sprite model should work (multiple sprites?)
// 		- will avatars still need to be unique in a multi sprite world?
// - need a way to detect the sprite ID / name in code {avatarName} (or something???)

NOTES
- now would also be a good time to consider adding code commenting
- should exit dialog be regular dialog?? or "narration"?? or should there be a variable/function to control it?
- improve the two-way arrows for exits
- should I allow multiple copies of sprites?
- should I have enums or something for the exit types / transition types: exit.locked, exit.no_transition, exit.fade_white???

- exit dialog
	- file format
	- new script functions
	- UI control

NOTES / ideas:
- stop room tool relying on "curRoom" -- give it an internal state
- show exit count to help navigation??
- should I have direct exit value manipulation (room + coords) as dropdowns?
- better logic for initial placement of entrance / exit for door
- there is some kind of bug with the title disappearing off of games

TODO advanced exits:
- transition animations
- swap characters
X play dialog
X lock based on return value

plan for advanced exits:
- exits can have an associated dialog
	EXT 13,4 0 7,9 DLG EXT_15
- if the dialog script returns true you can enter it.. otherwise it's cancelled
- it can play dialog as normal
- other features are new functions
	- {changeAvatar}
	- {nextTransition}
- detect supported scripts and show UI for that
	- arbitrary scripts can be run through "custom" plaintext

advanced exit notes:
- should there be a "trigger" option where there is no actual exit.. just a script that's run?
*/


function RoomMarkerTool(markerCanvas1, markerCanvas2) {
	var selectedRoom = null;

	var markerList = [];
	var curMarker = null;

	markerCanvas1.width = width * scale; // TODO : globals?
	markerCanvas1.height = width * scale;
	var markerCtx1 = markerCanvas1.getContext("2d");

	markerCanvas2.width = width * scale; // TODO : globals?
	markerCanvas2.height = width * scale;
	var markerCtx2 = markerCanvas2.getContext("2d");

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

		markerList = GatherMarkerList();
		curMarker = markerList.find(function(e) { return e.exit == newExit; });

		RenderExits();
		refreshGameData();
	};

	this.SetRoom = function(roomId) {
		selectedRoom = roomId;
		ResetExitList();
	}

	this.Refresh = function() { // TODO: rename "Reset"???
		curMarker = null;
		ResetExitList();
	}

	function ResetExitList() {
		markerList = GatherMarkerList();

		if (curMarker != null) {
			// check for exit info that duplicates the carry over exit info
			var duplicate = markerList.find(function(info) {
				return (curMarker.exit == info.exit && curMarker.return == info.return) ||
					(curMarker.exit == info.return && curMarker.return == info.exit);
			});
			if (duplicate != undefined && duplicate != null) {
				// if there is a duplicate.. replace it with the carry over exit
				markerList[markerList.indexOf(duplicate)] = curMarker;
			}
		}
		else {
			if (markerList.length > 0) {
				// fallback selected exit
				curMarker = markerList[0];
			}
		}

		RenderExits();
	}

	function RenderExits() {
		var markerControl1 = document.getElementById("markerControl1");
		var markerControl2 = document.getElementById("markerControl2");
		var markerLinkControl = document.getElementById("markerLinkControl");
		markerControl1.style.display = "none";
		markerControl2.style.display = "none";
		markerLinkControl.style.display = "none";

		if (curMarker != null) {
			var w = tilesize * scale;
			if (curMarker.MarkerCount() == 2) {
				markerControl1.style.display = "flex";
				markerControl2.style.display = "flex";

				var startCtx = markerCtx1;
				var endCtx = markerCtx2;
				if (curMarker.type == MarkerType.Exit && curMarker.linkState == LinkState.OneWaySwapped) {
					startCtx = markerCtx2;
					endCtx = markerCtx1;
				}

				var startPos = curMarker.GetMarkerPos(0);
				var endPos = curMarker.GetMarkerPos(1);

				drawRoom( room[startPos.room], startCtx );

				startCtx.fillStyle = getContrastingColor(room[startPos.room].pal);
				startCtx.strokeStyle = getContrastingColor(room[startPos.room].pal);
				startCtx.lineWidth = 4;
				startCtx.fillRect(startPos.x * w, startPos.y * w, w, w);
				startCtx.strokeRect((startPos.x * w) - (w/2), (startPos.y * w) - (w/2), w * 2, w * 2);

				drawRoom( room[endPos.room], endCtx );

				endCtx.fillStyle = getContrastingColor(room[endPos.room].pal);
				endCtx.strokeStyle = getContrastingColor(room[endPos.room].pal);
				endCtx.lineWidth = 4;
				endCtx.fillRect(endPos.x * w, endPos.y * w, w, w);
				endCtx.strokeRect((endPos.x * w) - (w/2), (endPos.y * w) - (w/2), w * 2, w * 2);
			}
			else if (curMarker.MarkerCount() == 1) {
				markerControl1.style.display = "flex";

				var markerPos = curMarker.GetMarkerPos(0);

				drawRoom( room[markerPos.room], markerCtx1 );

				markerCtx1.fillStyle = getContrastingColor(room[markerPos.room].pal);
				markerCtx1.strokeStyle = getContrastingColor(room[markerPos.room].pal);
				markerCtx1.lineWidth = 4;
				markerCtx1.fillRect(markerPos.x * w, markerPos.y * w, w, w);
				markerCtx1.strokeRect((markerPos.x * w) - (w/2), (markerPos.y * w) - (w/2), w * 2, w * 2);
			}

			if (curMarker.type == MarkerType.Exit) {
				markerLinkControl.style.display = "inline-block";
				// just tacking this on here to make sure it updates
				UpdateExitDirectionUI();
			}
		}
		else {
			// TODO!
			// exitCtx1.clearRect(0, 0, exitCanvas1.width, exitCanvas1.height);
			// exitCtx2.clearRect(0, 0, exitCanvas2.width, exitCanvas2.height);
		}
	}

	this.RemoveExit = function() { // TODO make general
		if (curMarker.hasReturn) {
			var returnIndex = room[curMarker.exit.dest.room].exits.indexOf(curMarker.return);
			room[curMarker.exit.dest.room].exits.splice(returnIndex,1);
		}
		var exitIndex = room[curMarker.parentRoom].exits.indexOf(curMarker.exit);
		room[curMarker.parentRoom].exits.splice(exitIndex,1);

		markerList = GatherMarkerList();
		curMarker = markerList.length > 0 ? markerList[0] : null;

		RenderExits();
		refreshGameData();
	}

	this.IsPlacingMarker = function () {
		return placementMode != PlacementMode.None;
	}

	this.GetSelectedMarker = function() {
		return curMarker;
	}

	this.GetSelectedReturn = function() {
		if (curMarker != null && curMarker.hasReturn) {
			return curMarker.return;
		}
		else {
			return null;
		}
	}

	this.TrySelectMarkerAtLocation = function(x,y) {
		if (placementMode != PlacementMode.None) {
			return false;
		}

		var foundMarker = FindMarkerAtLocation(x,y);
		if (foundMarker != null) {
			curMarker = foundMarker;
		}
		RenderExits();

		return curMarker != null;
	}

	this.IsMarkerAtLocation = function(x,y) {
		return FindMarkerAtLocation(x,y) != null;
	}

	function FindMarkerAtLocation(x,y) {
		for (var i = 0; i < markerList.length; i++) {
			var marker = markerList[i];
			if (marker.IsAtLocation(selectedRoom,x,y)) {
				return marker;
			}
		}
		return null;
	}

	this.TogglePlacingFirstMarker = function(isPlacing) {
		if (isPlacing) {
			placementMode = PlacementMode.FirstMarker;
		}
		else {
			placementMode = PlacementMode.None;
		}
		UpdatePlacementButtons();
	}

	this.TogglePlacingSecondMarker = function(isPlacing) {
		if (isPlacing) {
			placementMode = PlacementMode.SecondMarker;
		}
		else {
			placementMode = PlacementMode.None;
		}
		UpdatePlacementButtons();
	}

	this.SelectMarkerRoom1 = function() { // TODO : swap if link direction is swapped!!!
		// hacky global method!!
		if (curMarker != null && curMarker.MarkerCount() >= 1) {
			selectRoom(curMarker.GetMarkerPos(0).room);
		}
	}

	this.SelectMarkerRoom2 = function() {
		// hacky global method!!
		if (curMarker != null && curMarker.MarkerCount() >= 2) {
			selectRoom(curMarker.GetMarkerPos(1).room);
		}
	}

	function UpdatePlacementButtons() {
		// hackily relies on global UI names oh well D:
		if (placementMode == PlacementMode.FirstMarker) {
			document.getElementById("toggleMoveMarker1").checked = true;
			document.getElementById("textMoveMarker1").innerText = "moving"; // TODO localize
			document.getElementById("cancelMoveMarker1").style.display = "inline";
		}
		else {
			document.getElementById("toggleMoveMarker1").checked = false;
			document.getElementById("textMoveMarker1").innerText = "move"; // TODO localize
			document.getElementById("cancelMoveMarker1").style.display = "none";
		}

		if (placementMode == PlacementMode.SecondMarker) {
			document.getElementById("toggleMoveMarker2").checked = true;
			document.getElementById("textMoveMarker2").innerText = "moving"; // TODO localize
			document.getElementById("cancelMoveMarker2").style.display = "inline";
		}
		else {
			document.getElementById("toggleMoveMarker2").checked = false;
			document.getElementById("textMoveMarker2").innerText = "move"; // TODO localize
			document.getElementById("cancelMoveMarker2").style.display = "none";
		}

		// TODO : this behaves oddly... change??
		// if (placementMode == PlacementMode.None) {
		// 	document.body.style.cursor = "pointer";
		// }
		// else {
		// 	document.body.style.cursor = "crosshair";
		// }
	}

	this.PlaceMarker = function(x,y) {
		if (curMarker != null) {
			curMarker.PlaceMarker(placementMode,selectedRoom,x,y);
			refreshGameData();
			ResetExitList();
		}

		placementMode = PlacementMode.None;
		UpdatePlacementButtons();
	}

	this.PrevMarker = function() {
		if (markerList.length > 0) {
			if (curMarker != null) {
				var index = markerList.indexOf(curMarker);
				if (index != -1) {
					index--;
					if (index < 0) {
						index = markerList.length - 1;
					}

					curMarker = markerList[index];
				}
				else {
					curMarker = markerList[0];
				}
			}
			else {
				curMarker = markerList[0];
			}
		}
		else {
			curMarker = null;
		}
		RenderExits();
	}

	this.NextMarker = function() {
		if (markerList.length > 0) {
			if (curMarker != null) {
				var index = markerList.indexOf(curMarker);
				if (index != -1) {
					index++;
					if (index >= markerList.length) {
						index = 0;
					}

					curMarker = markerList[index];
				}
				else {
					curMarker = markerList[0];
				}
			}
			else {
				curMarker = markerList[0];
			}
		}
		else {
			curMarker = null;
		}
		RenderExits();
	}

	function GatherMarkerList()
	{
		console.log("GATHER EXITS!!");

		var markerList = [];

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
				var alreadyExistingExitInfo = markerList.find(function(e) { return e.exit == returnExit; });
				if (alreadyExistingExitInfo != null && alreadyExistingExitInfo != undefined) {
					continue; // avoid duplicates when both parts of a paired exit are in the same room
				}
			}

			markerList.push(
				new ExitMarker(
					selectedRoom,
					room[selectedRoom].exits[i],
					returnExit != null,
					returnExit,
					returnExit ? LinkState.TwoWay : LinkState.OneWayOriginal)
				);
		}

		for (var r in room) {
			if (r != selectedRoom) {
				for (var i in room[r].exits) {
					var exit = room[r].exits[i];
					if (exit.dest.room === selectedRoom && findReturnExit(r,exit) == null) {

						markerList.push(
							new ExitMarker(
								r,
								exit,
								false,
								null,
								LinkState.OneWayOriginal)
							);
					}
				}
			}
		}

		for (var e in room[selectedRoom].endings) {
			var ending = room[selectedRoom].endings[e];

			markerList.push(
				new EndingMarker(
					selectedRoom,
					ending)
				);
		}

		return markerList;
	}

	var dragMarker = null;

	this.StartDrag = function(x,y) {
		dragMarker = FindMarkerAtLocation(x,y);

		if (dragMarker != null) {
			dragMarker.StartDrag(selectedRoom,x,y);
		}
	}

	this.ContinueDrag = function(x,y) {
		if (dragMarker == null) {
			return;
		}

		dragMarker.ContinueDrag(selectedRoom,x,y);

		refreshGameData();
		RenderExits();
	}

	this.EndDrag = function() {
		if (dragMarker != null) {
			dragMarker.EndDrag();
			dragMarker = null;
			refreshGameData();
			RenderExits();
		}
	}

	this.IsDraggingMarker = function() {
		return dragMarker != null;
	}

	this.GetMarkerList = function() {
		// ResetExitList(); // make sure we are up to date!
		return markerList;
	}

	this.ChangeExitLink = function() {
		function swapExitAndEntrance() {
			var tempDestRoom = curMarker.parentRoom;
			var tempDestX = curMarker.exit.x;
			var tempDestY = curMarker.exit.y;

			// remove exit from current parent room
			var exitIndex = room[curMarker.parentRoom].exits.indexOf(curMarker.exit);
			room[curMarker.parentRoom].exits.splice(exitIndex,1);

			// add to destination room
			room[curMarker.exit.dest.room].exits.push(curMarker.exit);
			curMarker.parentRoom = curMarker.exit.dest.room;

			// swap positions
			curMarker.exit.x = curMarker.exit.dest.x;
			curMarker.exit.y = curMarker.exit.dest.y;
			curMarker.exit.dest.room = tempDestRoom;
			curMarker.exit.dest.x = tempDestX;
			curMarker.exit.dest.y = tempDestY;
		}

		if (curMarker != null) {
			if (curMarker.linkState == LinkState.TwoWay) {
				// -- get rid of return exit --
				if (curMarker.hasReturn) {
					var returnIndex = room[curMarker.exit.dest.room].exits.indexOf(curMarker.return);
					room[curMarker.exit.dest.room].exits.splice(returnIndex,1);

					curMarker.return = null;
					curMarker.hasReturn = false;
				}

				curMarker.linkState = LinkState.OneWayOriginal;
			}
			else if (curMarker.linkState == LinkState.OneWayOriginal) {
				// -- swap the exit & entrance --
				swapExitAndEntrance();

				curMarker.linkState = LinkState.OneWaySwapped;
			}
			else if (curMarker.linkState == LinkState.OneWaySwapped) {
				// -- create a return exit --
				swapExitAndEntrance(); // swap first

				var newReturn = {
					x : curMarker.exit.dest.x,
					y : curMarker.exit.dest.y,
					dest : {
						room : curMarker.parentRoom,
						x : curMarker.exit.x,
						y : curMarker.exit.y
					}
				}
				room[curMarker.exit.dest.room].exits.push( newReturn );

				curMarker.return = newReturn;
				curMarker.hasReturn = true;

				curMarker.linkState = LinkState.TwoWay;
			}

			refreshGameData();
			RenderExits();
		}
	}

	function UpdateExitDirectionUI() {
		//hacky globals again
		if (curMarker != null) {
			if (curMarker.linkState == LinkState.TwoWay) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "visible";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "visible";
			}
			else if (curMarker.linkState == LinkState.OneWayOriginal) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "hidden";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "visible";
			}
			else if (curMarker.linkState == LinkState.OneWaySwapped) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "visible";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "hidden";
			}
		}
	}
} // ExitTool

// required if I'm using inheritance?
var MarkerType = {
	Exit : 0,
	Ending : 1,
	Effect: 2, // TODO : implement this
};

var PlacementMode = {
	None : 0,
	FirstMarker : 1,
	SecondMarker : 2
};

// TODO if this proves useful.. move into a shared file
function InitObj(obj, parent) {
	Object.assign(obj, parent);
	obj.self = obj;
	obj.base = parent;
}

function RoomMarkerBase(parentRoom) {
	this.parentRoom = parentRoom;

	this.Draw = function(ctx,x,y,w,selected) {
		ctx.fillStyle = getContrastingColor();
		ctx.globalAlpha = 0.5;
		ctx.fillRect(x * w, y * w, w, w);

		if (selected) {
			ctx.strokeStyle = getContrastingColor();
			ctx.globalAlpha = 1.0;
			ctx.lineWidth = 2.0;
			ctx.strokeRect((x * w) - (w/4), (y * w) - (w/4), w * 1.5, w * 1.5);
		}
	}

	this.IsAtLocation = function(roomId,x,y) {
		return false;
	}

	this.StartDrag = function(roomId,x,y) {}

	this.ContinueDrag = function(roomId,x,y) {}

	this.EndDrag = function() {}

	this.PlaceMarker = function(placementMode,roomId,x,y) {}

	this.MarkerCount = function() {
		return 0;
	}

	this.GetMarkerPos = function(markerIndex) { // TODO : use this to make the base Draw() smarter??
		return null;
	}
}

function ExitMarker(parentRoom, exit, hasReturn, returnExit, linkState) {
	InitObj( this, new RoomMarkerBase(parentRoom) );

	this.type = MarkerType.Exit; // TODO remove

	this.exit = exit;
	this.hasReturn = hasReturn;
	this.return = returnExit; // TODO naming?
	this.linkState = linkState;

	this.Draw = function(ctx,roomId,w,selected) {
		console.log("TEST CHILD");
		// this.base.Draw(ctx, this.exit.x, this.exit.y, w, selected);

		if (this.parentRoom === roomId) {
			this.base.Draw(ctx, this.exit.x, this.exit.y, w, selected);

			if (this.hasReturn) {
				DrawTwoWayExit(ctx, this.exit.x, this.exit.y, w);
			}
			else {
				DrawExit(ctx, this.exit.x, this.exit.y, w);
			}
		}

		if (this.exit.dest.room === roomId) {
			this.base.Draw(ctx, this.exit.dest.x, this.exit.dest.y, w, selected);

			if (this.hasReturn) {
				DrawTwoWayExit(ctx, this.exit.dest.x, this.exit.dest.y, w);
			}
			else {
				DrawEntrance(ctx, this.exit.dest.x, this.exit.dest.y, w);
			}
		}
	}

	function DrawExit(ctx,x,y,w) {
		ctx.fillStyle = getContrastingColor();
		ctx.globalAlpha = 1.0;
		var centerX = (x * w) + (w/2);
		var centerY = (y * w) + (w/2);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - (w/4));
		ctx.lineTo(centerX + (w/4), centerY + (w/4));
		ctx.lineTo(centerX - (w/4), centerY + (w/4));
		ctx.fill();
	}

	function DrawEntrance(ctx,x,y,w) {
		ctx.strokeStyle = getContrastingColor();
		ctx.lineWidth = 2.0;
		ctx.globalAlpha = 1.0;
		var centerX = (x * w) + (w/2);
		var centerY = (y * w) + (w/2);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY + (w/4));
		ctx.lineTo(centerX + (w/4), centerY - (w/4));
		ctx.lineTo(centerX - (w/4), centerY - (w/4));
		ctx.lineTo(centerX, centerY + (w/4));
		ctx.stroke();
	}

	function DrawTwoWayExit(ctx,x,y,w) {
		ctx.fillStyle = getContrastingColor();
		ctx.strokeStyle = getContrastingColor();
		ctx.lineWidth = 3.0;
		ctx.globalAlpha = 1.0;
		var centerX = (x * w) + (w/2);
		var centerY = (y * w) + (w/2);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - (w/4));
		ctx.lineTo(centerX + (w/4), centerY - (w * 0.1));
		ctx.lineTo(centerX - (w/4), centerY - (w * 0.1));
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY + (w/4));
		ctx.lineTo(centerX + (w/4), centerY + (w * 0.1));
		ctx.lineTo(centerX - (w/4), centerY + (w * 0.1));
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - (w * 0.2));
		ctx.lineTo(centerX, centerY + (w * 0.2));
		ctx.stroke();
	}

	this.IsAtLocation = function(roomId,x,y) {
		// TODO : there is a more robust simple implementation of this test
		if (this.parentRoom === roomId) {
			if (this.exit.x == x && this.exit.y == y) {
				return true;
			}
			else if (this.exit.dest.x == x && this.exit.dest.y == y) {
				return true;
			}
		}
		else if (this.exit.dest.room === roomId) {
			if (this.exit.dest.x == x && this.exit.dest.y == y) {
				return true;
			}
		}
		return false;
	}

	var Drag = {
		None : -1,
		Exit : 0,
		Destination : 1,
	};
	var dragMode = Drag.None;

	this.StartDrag = function(roomId,x,y) {
		dragMode = Drag.None;

		if (this.parentRoom === roomId &&
				this.exit.x == x && this.exit.y == y) {
			dragMode = Drag.Exit;
		}
		else if (this.exit.dest.room === roomId &&
					this.exit.dest.x == x && this.exit.dest.y == y) {
			dragMode = Drag.Destination;
		}
	}

	this.ContinueDrag = function(roomId,x,y) {
		if (dragMode == Drag.None) {
			return;
		}

		if (dragMode == Drag.Exit) {
			this.exit.x = x;
			this.exit.y = y;
			if (this.hasReturn) {
				this.return.dest.x = x;
				this.return.dest.y = y;
			}
		}
		else if (dragMode == Drag.Destination) {
			this.exit.dest.x = x;
			this.exit.dest.y = y;
			if (this.hasReturn) {
				this.return.x = x;
				this.return.y = y;
			}
		}
	}

	this.EndDrag = function() {
		dragMode = Drag.None;
	}

	this.PlaceMarker = function(placementMode,roomId,x,y) {
		if (placementMode == PlacementMode.FirstMarker) {
			// return (change return destination)
			if (this.hasReturn) {
				this.return.dest.room = roomId;
				this.return.dest.x = x;
				this.return.dest.y = y;
			}

			// room
			if (this.parentRoom != roomId) {
				var oldExitIndex = room[this.parentRoom].exits.indexOf(this.exit);
				room[this.parentRoom].exits.splice(oldExitIndex,1);
				room[roomId].exits.push(this.exit);
				this.parentRoom = roomId;
			}

			// exit pos
			this.exit.x = x;
			this.exit.y = y;
		}
		else if (placementMode == PlacementMode.SecondMarker) {
			// return (change return origin)
			if (this.hasReturn) {
				if (this.exit.dest.room != roomId) {
					var oldReturnIndex = room[this.exit.dest.room].exits.indexOf(this.return);
					room[this.exit.dest.room].exits.splice(oldReturnIndex,1);
					room[roomId].exits.push(this.return);
				}

				this.return.x = x;
				this.return.y = y;
			}

			// room
			this.exit.dest.room = roomId;

			// destination pos
			this.exit.dest.x = x;
			this.exit.dest.y = y;
		}
	}

	this.MarkerCount = function() {
		return 2;
	}

	this.GetMarkerPos = function(markerIndex) { // TODO : swap if link direction is swapped???
		if (markerIndex == 0) {
			return {
				room : this.parentRoom,
				x : this.exit.x,
				y : this.exit.y,
			};
		}
		else if (markerIndex == 1) {
			return {
				room : this.exit.dest.room,
				x : this.exit.dest.x,
				y : this.exit.dest.y,
			};
		}
		return null;
	}
}

function EndingMarker(parentRoom, ending) {
	InitObj( this, new RoomMarkerBase(parentRoom) );

	this.type = MarkerType.Ending; // TODO remove

	this.ending = ending;

	this.Draw = function(ctx,roomId,w,selected) {
		if (this.parentRoom === roomId) {
			this.base.Draw(ctx, this.ending.x, this.ending.y, w, selected);
			DrawEnding(ctx, this.ending.x, this.ending.y, w);
		}
	}

	function DrawEnding(ctx,x,y,w) {
		ctx.strokeStyle = getContrastingColor();
		ctx.lineWidth = 2.0;
		ctx.globalAlpha = 1.0;

		ctx.beginPath();
		ctx.moveTo((x * w) + (w * 0.2), (y * w) + (w * 0.2));
		ctx.lineTo((x * w) + (w * 0.8), (y * w) + (w * 0.8));
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo((x * w) + (w * 0.2), (y * w) + (w * 0.8));
		ctx.lineTo((x * w) + (w * 0.8), (y * w) + (w * 0.2));
		ctx.stroke();
	}

	this.IsAtLocation = function(roomId,x,y) {
		return this.parentRoom === roomId && this.ending.x == x && this.ending.y == y;
	}

	var isDragging = false;

	this.StartDrag = function(roomId,x,y) {
		isDragging = this.IsAtLocation(roomId,x,y);
	}

	this.ContinueDrag = function(roomId,x,y) {
		if (isDragging) {
			this.ending.x = x;
			this.ending.y = y;
		}
	}

	this.EndDrag = function() {
		isDragging = false;
	}

	this.PlaceMarker = function(placementMode,roomId,x,y) {
		// TODO
	}

	this.MarkerCount = function() {
		return 1;
	}

	this.GetMarkerPos = function(markerIndex) {
		if (markerIndex == 0) {
			return {
				room : this.parentRoom,
				x : this.ending.x,
				y : this.ending.y,
			};
		}
		return null;
	}
}