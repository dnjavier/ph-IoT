const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
let LED = new Gpio(2, 'out'); //use GPIO pin 2, and specify that it is output

let blinkInterval;
let toggleCount = 0;

//Timer
let start, end, ledState, timeOn = 0;

module.exports = {
  toggleLED: (value) => {
    if(value === 1 || value === 0){
      LED.writeSync(value);

    } else if(LED.readSync() === 0) { //check if LED is off    
      LED.writeSync(1); // Turn LED on
    } else {      
      LED.writeSync(0); // Turn LED off
    }
    toggleCount++;
    timer(LED.readSync());
  },

  blinkLED: (time) => {
    if(!time){
      time = 1000;
    }
    blinkInterval = setInterval(module.exports.toggleLED, time);
  },

  endBlink: () => {
    if(blinkInterval){
      clearInterval(blinkInterval);
      blinkInterval = null;
      // Unexport GPIO to free resources
      //LED.unexport(); 
    }
    module.exports.toggleLED(0);
  },

  lightDetails: () => {
    return {
      toggleCount: toggleCount,
      timeOn: Math.round(timeOn),
    }
  }
};

function timer(timeLed) {
  //state has not changed
  if(ledState == timeLed){
    return;
  }
  ledState = timeLed;

  if(timeLed == 1){
    start = new Date().getTime();
  } else {
    end = new Date().getTime();
    timeOn += (end - start)/1000;
  }
}
