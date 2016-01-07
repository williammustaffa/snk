/**
Author: Alex Bennett
Github: https://github.com/timetocode

Length of a tick in milliseconds. The denominator is your desired framerate.
e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
*/
var tickLengthMs = 10000;

/* gameLoop related variables */
// timestamp of each loop
var previousTick = Date.now()
// number of times gameLoop gets called
var actualTicks = 0

var gameLoop = function(func) {
  var now = Date.now()

  actualTicks++
  if (previousTick + tickLengthMs <= now) {
    var delta = (now - previousTick) / 1000
    previousTick = now

    update(delta)

    //console.log('delta', delta, '(target: ' + tickLengthMs +' ms)', 'node ticks', actualTicks, typeof func);
    if (typeof func == "function") func();
    actualTicks = 0
  }

  if (Date.now() - previousTick < tickLengthMs - 16) {
    setTimeout(function() {
      gameLoop(func);
    });
  } else {
    setImmediate(function() {
      gameLoop(func);
    });
  }
}


/**
Update is normally where all of the logic would go. In this case we simply call
a function that takes 10 milliseconds to complete thus simulating that our game
had a very busy time.
*/
var update = function(delta) {
  aVerySlowFunction(10)
}

/**
A function that wastes time, and occupies 100% CPU while doing so.
Suggested use: simulating that a complex calculation took time to complete.
*/
var aVerySlowFunction = function(milliseconds) {
  // waste time
  var start = Date.now()
  while (Date.now() < start + milliseconds) { }  
}

var initLoop = function( callback, delay ) {
  tickLengthMs = delay;
  gameLoop(callback);
}

module.exports = {
  call: initLoop
};
