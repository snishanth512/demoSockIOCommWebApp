'use strict';
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var demoMsg = require('./demo.json');
var i = 0;
var conf = require('./config.json');
var browserOpen = require('open');

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/chart.js', express.static(__dirname + '/node_modules/chart.js/dist/'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('browserMessage', function (msg) {
    console.log('\tmessage:\t' + msg);
  });
});

http.listen(conf.httpPort, function () {
  console.log('\tserver started:\t', conf.httpPort);
});

function periodicMessageSend() {
  var message;
  i++;
  message = demoMsg;
  message["messageId"] = i;
  io.emit('browserMessage', JSON.stringify(message));
}

setInterval(periodicMessageSend, 3000);

browserOpen('http://localhost:'+conf.httpPort);