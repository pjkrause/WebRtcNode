// file: simpleRtcClient.js
// Code adapted a little from:
// Real-Time Communication with WebRTC
// by Salvatore Loreto and Simon Pietro Romano (O’Reilly).
// Copyright 2014 Salvatore Loreto and Prof. Simon Pietro Romano, 978-1-449-37187-6
'use strict';

// Although we are only implementing for Chrome in the demo, might as well handle
// the different implementations of getUserMedia for generality:
navigator.getUserMedia = navigator.getUserMedia ||      // Opera
                        navigator.webkitGetUserMedia || // Chrome & Safari
                        navigator.mozGetUserMedia;       // Firefox

// Clean-up function:
// collect garbage before unloading browser's window 
window.onbeforeunload = function(e) {
  hangup(); 
}

// HTML5 <video> elements
var localVideo = $('#localVideoStream'); 
var remoteVideo = $('#remoteVideoStream');

// Handler associated with Send button
// sendButton.onclick = sendData;

// Flags...
var isChannelReady = false; 
var isInitiator = false; 
var isStarted = false;

// WebRTC data structures 
// Streams
var localStream;
var remoteStream;


// Let's get started: prompt user for input (room name)
var room = prompt('Enter room name:'); 
// Connect to signaling server
var socket = io.connect("http://localhost:8080");

// Send 'Create or join' message to singnaling server
if (room !== '') {
  console.log('Create or join room', room); 
  socket.emit('create or join', room);
}

// Set getUserMedia constraints
var constraints = {video: true, audio: true};

// From this point on, execution proceeds based on asynchronous events... 
// getUserMedia() handlers...
function handleUserMedia(stream) { 
  localStream = stream;
  attachMediaStream(localVideo, stream);
  console.log('Adding local stream.');
  sendMessage('got user media');
}

function handleUserMediaError(error) {
        console.log('navigator.getUserMedia error: ', error);
}

// Server-mediated message exchanging...

// 1. Server-->Client...

// Handle 'created' message coming back from server: 
// this peer is the initiator
socket.on('created', function (room) {
  console.log('Created room ' + room); 
  isInitiator = true;

  // Call getUserMedia()
  navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
  console.log('Getting user media with constraints', constraints);
  // checkAndStart();
});

// Server-sent log message...
socket.on('log', function (array) { 
  console.log.apply(console, array);
});

// Attach a media stream to an element.
function attachMediaStream(element, stream) {
  if (typeof element.srcObject !== 'undefined') {
    element.srcObject = stream;
  } else if (typeof element.mozSrcObject !== 'undefined') {
    element.mozSrcObject = stream;
  } else if (typeof element.src !== 'undefined') {
    element.src = URL.createObjectURL(stream);
  } else {
    console.log('Error attaching stream to element.');
  }
};


