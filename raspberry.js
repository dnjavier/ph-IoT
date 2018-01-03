const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
let LED = new Gpio(2, 'out'); //use GPIO pin 2, and specify that it is output

let blinkInterval;
let toggleCount = 0;
let timeOn = 0;
let prevTime;
let L = 0;

module.exports = {
  toggleLED: (value) => {
    if(prevTime){
        timeOn += countTime()/1000;
    }

    if(value === 1 || value === 0){
      LED.writeSync(value);
      if(L===1){
        prevTime = new Date();
      }
    } else if(LED.readSync() === 0) { //check if LED is off      
      LED.writeSync(1); // Turn LED on
      prevTime = new Date();
    } else {      
      LED.writeSync(0); // Turn LED off
    }
    toggleCount++;
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
      // Unexport GPIO to free resources
      //LED.unexport(); 
    }
    module.exports.toggleLED(0);
  },

  lightDetails: () => {
    return {
      toggleCount: toggleCount,
      timeOn: timeOn + countTime()/1000,
    }
  }
};

function countTime(){
  let time = new Date();
  currentTimeOn = 0;
  if(L===1){
    currentTimeOn = time - prevTime;
  }
  return currentTimeOn;
}
