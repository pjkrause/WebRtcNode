// file: simpleRtcClient.js
// Code adapted a little from:
// Real-Time Communication with WebRTC
// by Salvatore Loreto and Simon Pietro Romano (O’Reilly).
// Copyright 2014 Salvatore Loreto and Prof. Simon Pietro Romano, 978-1-449-37187-6

// This takes us up to p112.

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
// Data channel information
var sendChannel, receiveChannel;
var sendButton = document.getElementById("sendButton");
var sendTextarea = document.getElementById("dataChannelSend");
var receiveTextarea = document.getElementById("dataChannelReceive");

// HTML5 <video> elements
var localVideo = document.querySelector('#localVideoStream'); 
var remoteVideo = document.querySelector('#remoteVideoStream');

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

// PeerConnection
var pc;
// PeerConnection ICE protocol configuration (either Firefox or Chrome)
var pc_config = webrtcDetectedBrowser === 'firefox' ? 
  {'iceServers':[{'url':'stun:23.21.150.121'}]} : // IP address 
  {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = { 
  'optional': [
    {'DtlsSrtpKeyAgreement': true} 
  ]};

var sdpConstraints = {};

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
  checkAndStart();
});

// Server-sent log message...
socket.on('log', function (array) { 
  console.log.apply(console, array);
});

// Handle 'join' message coming back from server: 
// another peer is joining the channel 
socket.on('join', function (room) {
  console.log('Another peer made a request to join room ' + room); 
  console.log('This peer is the initiator of room ' + room + '!'); 
  isChannelReady = true;
});

// Handle 'joined' message coming back from server: 
// this is the second peer joining the channel 
socket.on('joined', function (room) {
  console.log('This peer has joined room ' + room); 
  isChannelReady = true;
  // Call getUserMedia()
  navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
  console.log('Getting user media with constraints', constraints);
});



// 2. Client-->Server  
// Send message to the other peer via the signaling server
function sendMessage(message) { 
  console.log('Sending message: ', message); 
  socket.emit('message', message);
}

// Channel negotiation trigger function
function checkAndStart() {
  // if channel not ready, do nothing!
  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) { 
    createPeerConnection();
    isStarted = true;
  if (isInitiator) {
    doCall(); }
  } 
}

