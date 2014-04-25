
$(function() {
  var socket = io.connect('http://localhost:8080');
  socket.on('news', function (data) {
    console.log(data);
    $("<p>Message received from server</p>").appendTo("#scratchPad");
    socket.emit('my other event', { my: 'data' });
  });
})