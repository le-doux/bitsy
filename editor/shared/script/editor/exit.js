/*
TODO:
- place exits & entrances
- consider the UI for that? "placement button"? or select the picture??
- also consider that you may be moving an exit into a totally different room
- connect to room tool
- remove exit
- should I have direct exit value manipulation (room + coords) as dropdowns?


available exits:
- two way exits
- exits that start in the current room
- exits that END in the current room
- ** whatever the CURRENT exit was when you switched rooms (this is kind of weird??)
	- this might exist "outside the list" such that if you de-select it won't return to the list
- principle: ANY exit that is VISIBLE in the current room should be part of the list
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

	console.log("EXIT TOOOL!!");
	console.log(exitCtx1);

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

		exitInfoList = GatherExitInfoList();
		if (curExitInfo == null && exitInfoList.length > 0) {
			curExitInfo = exitInfoList[0];
		}

		RenderExits();
	}

	function RenderExits() {
		if (curExitInfo != null) {
			drawRoom( room[curExitInfo.parentRoom], exitCtx1 );
			drawRoom( room[curExitInfo.exit.dest.room], exitCtx2 );
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
		return true; // hack
	}

	this.PlaceExit = function(x,y) {
		// TODO : make this more general
		if (curExitInfo != null) {
			curExitInfo.exit.x = x;
			curExitInfo.exit.y = y;

			refreshGameData();
			RenderExits();
		}
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
} // ExitTool