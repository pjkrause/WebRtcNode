// file chatServer.js
// Serving static pages using node-static

// fetch the node-static and http modules
var static = require('node-static');
var http = require('http');

var port = 8080;


var file = new static.Server();

var app = http.createServer(function(request, response) {
  file.serve(request, response, function(error, result) {
    if (error) {
      console.error('Error serving ' + request.url + ' - ' + error.message);
      response.writeHead(error.status, error.headers);
      response.end();
    } else {
      console.log(request.url + ' - ' + result.message);
    }
  });
}).listen(port);

console.log('node-static running at http://localhost:%d', port)

// use socket.io for real-time communication
var io = require('socket.io').listen(app);

// Now manage the connections
io.sockets.on('connection', function (socket) {

  // Handle "message" message :)
  socket.on('message', function (message) {
    console.log('Got message' + message);
    socket.broadcast.to(message.channel).emit('message', message.message);
  });

  // Handle "create or join" message
  socket.on('create or join', function (channel) {
    var numClients = io.sockets.clients(channel).length;
    console.log('numclients = ' + numClients);

    // First client joining
    if (numClients == 0) {
      socket.join(channel);
      socket.emit('created', channel);
    } else if (numClients == 1) {
      // second client joining so inform initiator
      io.sockets.in(channel).emit('remotePeerJoining', channel);
      // and let the new peer join channel
      socket.join(channel);
      socket.broadcast.to(channel).emit('broadcast: joined', 
        'client ' + socket.id + ' joined channel ' + channel);
    } else { // channel is full
      console.log("Channel full!");
      socket.emit('full', channel);
    } 
  });
});
