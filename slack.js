var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var winston = require('winston');
var env = require('./.env.json');

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(2, 'out'); //use GPIO pin 2, and specify that it is output
var blinkInterval = setInterval(blinkLED, 1000); //run the blinkLED function every 250ms

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

function blinkLED() { //function to start blinking
  if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    LED.writeSync(1); //set pin state to 1 (turn LED on)
  } else {
    LED.writeSync(0); //set pin state to 0 (turn LED off)
  }
}

function endBlink() { //function to stop blinking
  clearInterval(blinkInterval); // Stop blink intervals
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport GPIO to free resources
}

setTimeout(endBlink, 5000); //stop blinking after 5 seconds
