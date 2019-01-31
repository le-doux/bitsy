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
	}
} // ExitTool