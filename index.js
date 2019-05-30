var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var demoMsg = require('./demo.json')

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('browserMessage', function (msg) {
    console.log('message: ' + msg);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

var i = 0;

function periodicMessageSend() {
  var message;
  i++;
  message = demoMsg;
  message["messageId"] = i;
  io.emit('browserMessage', JSON.stringify(message));
}

setInterval(periodicMessageSend, 3000);