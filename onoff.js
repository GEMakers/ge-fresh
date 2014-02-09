var sleep = require('sleep');
var SPI = require('pi-spi');
var spi = SPI.initialize("/dev/spidev0.0");
var instruction = Buffer([ 0x01, 0xC0, 0x00]);  //0000 0001 1100 0000 0000 0000
var last = 0;

var CHANGE=500;
var GREENMIN = 2250;
var YELLOWMIN = 2000;
var REDMIN = 800;

setInterval(function(e){ 

  spi.transfer(instruction, instruction.length, function (e,d) {
    if (e) console.error(e);

    var val = parseInt(((d[1] & 31) << 6) + (d[2] >> 2), 16);
    var change = val - last;
    console.log( "resistance: " + val + ", change: " + change);
    last = val;

  });

}, 1000, last);

