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

  socket.on('created', function (channel) {
    console.log('channel ' + channel + ' has been created');
    console.log('This peer is the initiator');
    $("<p>Channel has been created</p>").appendTo(scratchPad);
  })
})