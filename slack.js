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

let tryToConnect = () => {
  if (bot_token) {
    rtm = new RtmClient(bot_token);

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
      if(!channel) {
        for (let c of rtmStartData.channels)
          if (c.name ===env.slack.channelName) channel = c.id;
      }
    });

    // you need to wait for the client to fully connect before you can send messages
    rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
      connected = true;
      rtm.sendMessage("Rpi conectado!", channel);
    });

    rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
      winston.info(message);
      if(message.text.toLowerCase().indexOf('encender luz') >= 0){
        rtm.sendMessage("La luz se encenderá", channel);
        rpi.toggleLED(1);
      }

      if(message.text.toLowerCase().indexOf('apagar luz') >= 0){
        rtm.sendMessage("La luz se apagará", channel);
        rpi.blinkLED();
      }

      if(message.text.toLowerCase().indexOf('parpadear luz') >= 0){
        rtm.sendMessage("La luz parpadeará", channel);
        rpi.blinkLED();
      }

      if(message.text.toLowerCase().indexOf('detalles') >= 0){
        rtm.sendMessage("La luz ha estado encendida: " + rpi.lightDetails().timeOn + " segundos y ha cambiado el estado: "+rpi.lightDetails().toggleCount + " veces.", channel);
      }
    });

    rtm.start();
  }
}
tryToConnect();

exports.sendMessage = (message) => {
  if (connected) {
    rtm.sendMessage(message, channel);
  } else {
    winston.log('Unable to send message, not connected, trying to connect now.');
    tryToConnect();
  }
}
