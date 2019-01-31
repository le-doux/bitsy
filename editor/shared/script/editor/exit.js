/*
TODO:
- place exits & entrances
- consider the UI for that? "placement button"? or select the picture??
- also consider that you may be moving an exit into a totally different room
- connect to room tool
- remove exit
*/


function ExitTool(exitCanvas1, exitCanvas2) {
	var selectedRoom = null;
	var exitsList = [];
	var exitIndex = 0;

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

		exitsList = room[selectedRoom].exits; // recreate exits list -- SHOULD be a function
		exitIndex = exitsList.length - 1;
		RenderExits();
	};

	this.SetRoom = function(roomId) {
		selectedRoom = roomId;

		// TODO : get all exits function
		exitsList = room[selectedRoom].exits;
		exitIndex = exitsList.length > 0 ? 0 : -1;

		RenderExits();
	}

	function RenderExits() {
		if (exitIndex > -1) {
			var exit = exitsList[exitIndex];
			drawRoom( room[selectedRoom], exitCtx1 );
			drawRoom( room[exit.dest.room], exitCtx2 );
		}
		else {
			exitCtx1.clearRect(0, 0, exitCanvas1.width, exitCanvas1.height);
			exitCtx2.clearRect(0, 0, exitCanvas2.width, exitCanvas2.height);
		}
	}

	this.RemoveExit = function() {
		var exit = exitsList[exitIndex];
		room[selectedRoom].exits.splice(room[selectedRoom].exits.indexOf(exit),1);
		exitsList = room[selectedRoom].exits;
		exitIndex = room[selectedRoom].exits.length > 0 ? 0 : -1; // TODO : make this logic better so it doesn't jump back all the time
		RenderExits();
	}

	this.IsPlacingExit = function () {
		return true; // hack
	}

	this.PlaceExit = function(x,y) {
		// TODO : make this more general
		exitsList[exitIndex].x = x;
		exitsList[exitIndex].y = y;

		refreshGameData();

		RenderExits();
	}

	this.PrevExit = function() {
		if (exitsList.length > 0) {
			exitIndex--;
			if (exitIndex < 0) {
				exitIndex = exitsList.length - 1;
			}
		}
		else {
			exitIndex = -1;
		}
		RenderExits();
	}

	this.NextExit = function() {
		if (exitsList.length > 0) {
			exitIndex++
			if (exitIndex >= exitsList.length) {
				exitIndex = 0;
			}
		}
		else {
			exitIndex = -1;
		}
		RenderExits();
	}
} // ExitTool