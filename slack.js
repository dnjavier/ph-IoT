const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const winston = require('winston');
const env = require('./.env.json');
const rpi = require('./raspberry');

let bot_token = env.slack.token || '';
let channel = env.slack.channelId;
let connected;
let rtm;

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
      if(message.text.toLowerCase().indexOf('lights on') >= 0){
        rtm.sendMessage("Lights will be on", channel);
        rpi.toggleLED(1);
      }

      if(message.text.toLowerCase().indexOf('lights off') >= 0){
        rtm.sendMessage("Lights will be off", channel);
        rpi.toggleLED(0);
      }

      if(message.text.toLowerCase().indexOf('start blinking') >= 0){
        rtm.sendMessage("Lights will be blinking", channel);
        rpi.blinkLED();
      }

      if(message.text.toLowerCase().indexOf('stop blinking') >= 0){
        rtm.sendMessage("Lights will stop blinking", channel);
        rpi.endBlink();
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
