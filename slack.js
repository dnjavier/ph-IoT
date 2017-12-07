var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var winston = require('winston');
var env = require('./.env.json');

var bot_token = env.slack.token || '';
var channel = env.slack.channelId;
var connected;
var rtm;

var tryToConnect = function() {
  if (bot_token) {
    rtm = new RtmClient(bot_token);

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
      if(!channel) {
        for (var c of rtmStartData.channels) {
          if (c.name ===env.slack.channelName) { channel = c.id }
        }
      }
    });

    // you need to wait for the client to fully connect before you can send messages
    rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
      connected = true;
      rtm.sendMessage("I'm online!", channel);
    });

    rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
      winston.info(message);
      if(message.text.indexOf('the best') >= 0){
        rtm.sendMessage("I'm the best!", channel);
      }
    });

    rtm.start();
  }
}
tryToConnect();

exports.sendMessage = function (message) {
  if (connected) {
    rtm.sendMessage(message, channel);
  } else {
    winston.log('Unable to send message, not connected, trying to connect now.');
    tryToConnect();
  }
}
