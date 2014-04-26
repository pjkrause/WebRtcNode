// file: simpleNodeClient.js
// Code adapted a little from:
// Real-Time Communication with WebRTC
// by Salvatore Loreto and Simon Pietro Romano (O’Reilly).
// Copyright 2014 Salvatore Loreto and Prof. Simon Pietro Romano, 978-1-449-37187-6

$(function() {
  // Get scratchPad element from DOM
  scratchPad = $('#scratchPad');
  console.log("starting chat");

  // Connect to server
  var socket = io.connect('http://localhost:8080');

  // Ask for Channel name from user
  channel = prompt("Enter signal channeling name:");

  if (channel !== "") {
    console.log('Trying to create or join channel: ', channel);
    // Send 'create or join' to server
    socket.emit('create or join', channel);
  }

  // Handle 'created' message
  socket.on('created', function (channel) {
    console.log('channel ' + channel + ' has been created');
    console.log('This peer is the initiator');
    $("<p>Time: " + (Date.now() / 1000).toFixed(3) + 
      " Channel " + channel + " has been created</p>").appendTo(scratchPad);
    $("<p>Time: " + (Date.now() / 1000).toFixed(3) + 
      " This peer is the initiator</p>").appendTo(scratchPad);
  });

  // Handle 'remote peer joining' message
  socket.on('remotePeerJoining', function (channel) {
    console.log('request to join ' + channel);
    console.log('you are the initiator!');
    $("<p id='alert'>Time: " + (Date.now() / 1000).toFixed(3) + 
      " Message from server: request to join channel " 
      + channel + "</p>").appendTo(scratchPad);
  });

  socket.on('broadcast: joined', function (msg) {
    $("<p id='alert'>Time: " + (Date.now() / 1000).toFixed(3) + 
      " Broadcast message from server: </p>").appendTo(scratchPad);
    $("<p id='alert'>" + msg + "</p>").appendTo(scratchPad);

    console.log('Broadcast message from server: ' + msg);

    // Start chatting with remote peer
    // 1. Get user's message
    var myMessage = prompt('Message to be sent', "");
    // 2. Send to remote peer (through server)
    socket.emit('message', {
      channel: channel,
      message: myMessage
    });
  });

  socket.on('message', function (message) {
    console.log('Got message from other peer: ' + message);
    $("<p id='alert'>Time: " + (Date.now() / 1000).toFixed(3) + 
      " Got message from other peer: </p>").appendTo(scratchPad);
    $("<p id='message'>" + message + "</p>").appendTo(scratchPad);
  });

});
