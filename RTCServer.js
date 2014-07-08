// file chatServer.js
//
// Serving static pages using node-static
// Based with thanks on an example from
// Real-Time Communication with WebRTC
// by Salvatore Loreto and Simon Pietro Romano (O’Reilly).
// Copyright 2014 Salvatore Loreto and Prof. Simon Pietro Romano,
// 978-1-449-37187-6.


// fetch the node-static and http modules
var static = require('node-static');
var http = require('http');

var port = 8080;


var file = new static.Server('./public');

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
}).listen(process.env.PORT || port);

console.log('node-static running at http://localhost:%d', port)

// use socket.io for real-time communication
var io = require('socket.io').listen(app);

// Now manage the connections
// Let's start managing connections...
io.sockets.on('connection', function (socket) {
    // Handle 'message' messages
  socket.on('message', function (message) { 
    log('S --> got message: ', message); 
    // channel-only broadcast...
    socket.broadcast.to(message.channel).emit('message', message);
  });
        
  // Handle 'create or join' messages
  socket.on('create or join', function (room) {
    var numClients = io.sockets.clients(room).length;
    log('S --> Room ' + room + ' has ' + numClients + ' client(s)');
    log('S --> Request to create or join room', room);

    // First client joining...
    if (numClients == 0) { 
      socket.join(room); 
      socket.emit('created', room);
    } else if (numClients == 1) { 
    // Second client joining...
      io.sockets.in(room).emit('join', room); 
      socket.join(room); 
      socket.emit('joined', room);
    } else { 
    // max two clients 
      socket.emit('full', room);
    } 
  });

  function log() {
    var array = [">>> "];
    for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
          }
    socket.emit('log', array);
  } 
});