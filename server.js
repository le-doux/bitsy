console.log("~~~ itsy bitsy ~~~");

var bitsyPort = process.env.PORT || 3000;

var request = require('request');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('an itsy bitsy server: ' + bitsyPort);
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket);
  socket.emit('server_ready');
  //io.emit('server_ready');

  socket.on('request_game', function(data) {
	var game = data;

	// Set the headers
	var headers = {
		"Authorization": "Bearer xxxxxxx",
		"Dropbox-API-Arg": "{\"path\":\"/public/bitsy/" + game + ".txt\"}"
	};	

	// Configure the request
	var options = {
	    url: 'https://content.dropboxapi.com/2/files/download',
	    method: 'POST',
	    headers: headers
	}

	// Start the request
	request(options, function (error, response, body) {
		console.log(response);
	    if (!error && response.statusCode == 200) {
	        // Print out the response body
	        console.log("*** GAME FILE START ***");
	        console.log(body);
	        console.log("*** GAME FILE END ***");
	        socket.emit('game',body);
	    }
	    else {
	    	console.log(error);
	    }
	});
  });
});

http.listen(bitsyPort, function(){
  console.log('bitsy is listening on ' + bitsyPort);
});