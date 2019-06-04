'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var demoMsg = require(__dirname + '/demo.json');
var i = 0;
var conf = require(__dirname + '/config.json');
var mqConfig = require(__dirname + '/../mqConfig.json');
var mqTopic = mqConfig.mqttTopicPrefix+'+'+mqConfig.mqttTopicSuffix;
/*
{
	"mqttIp":test.mosquitto.org ,
  "mqttPort": 1883,
	"mqttUsername": "",
  "mqttLock": "",
  "mqttTopicPrefix": "",
	"mqttTopicSuffix": ""
}
 */

var browserOpen = require('open');
var mqtt = require('mqtt');
var mqCliOptions = {
  "keepalive": 60,
  "clean": true,
  "reconnectPeriod": 10000,
  "username": '' + mqConfig.mqttUsername,
  "password": '' + mqConfig.mqttLock,
  "clientId": 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  "protocolId": 'MQTT'
}

var client = mqtt.connect('mqtt://' + mqConfig.mqttIp + ':' + mqConfig.mqttPort, mqCliOptions);

client.on('connect', function () {
  console.log('\tMQTT connecting...');
  client.subscribe(mqTopic, function (err) {
    if (err) {
      console.log('\tError:\t', err);
    }
  })
});

client.on('message', function (topic, message) {
  console.log(topic.toString())
  io.emit('mqDevMessage', JSON.stringify(message.toString()));
});

client.on('error', function (err) {
  console.log('\tError:\t', err);
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/chart.js', express.static(__dirname + '/node_modules/chart.js/dist/'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/index', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/about', function (req, res) {
  res.sendFile(__dirname + '/about.html');
});

app.get('/msgnchart', function (req, res) {
  res.sendFile(__dirname + '/msgnchart.html');
});

app.get('/device', function (req, res) {
  res.sendFile(__dirname + '/device.html');
});

app.post('/register', function (req, res) {
  console.log('\t',req.body);
  res.send("done");
});

io.on('connection', function (socket) {
  socket.on('browserMessage', function (msg) {
    console.log('\tmessage:\t' + msg);
  });
  socket.on('mqTopicMessage', function (msg) {
    var re = /[0-9A-Fa-f]{16}/g;
    if (msg.length === 16 && re.test(msg)) {
      client.unsubscribe(mqTopic, function (err) {
        if (err) {
          console.log('\tError:\t',err);
        }
        else {
          console.log('\tMessage unsubscribed');
        }
      });
      console.log('\tmessage:\t' + msg);
      if (typeof msg === 'string') {
        client.subscribe(mqConfig.mqttTopicPrefix + msg + mqConfig.mqttTopicSuffix, function (err) {
          if (err) {
            console.log('\tError:\t', err);
          }
          else {
            console.log('\tMessageCopied.');
            mqTopic = mqConfig.mqttTopicPrefix + msg + mqConfig.mqttTopicSuffix;
          }
        });
      }
    }


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

browserOpen('http://localhost:' + conf.httpPort);
