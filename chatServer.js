// file chatServer.js
// Serving static pages using node-static

// fetch the node-static, http and util modules
var static = require('node-static');
var http = require('http');
var util = require('util');

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
  socket.emit('news', { hello: 'world' });

  socket.on('my other event', function (data) {
    console.log(data);
  });

  // Handle "create or join" message
  socket.on('create or join', function (channel) {
    socket.join(channel);
    socket.emit('created', channel);
  });
});
