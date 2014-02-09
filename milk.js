var AWS = require('aws-sdk');
var sleep = require('sleep');
AWS.config.loadFromPath('./config.json');

var PUSH=false;
var CHANGE=500;
var GREENMIN = 2250;
var YELLOWMIN = 2000;
var REDMIN = 800;

var sns = new AWS.SNS(); 
var arn = "arn:aws:sns:us-east-1:843496043718:endpoint/APNS/Hackathon-MilkMinder/3efab044-7c28-3864-a34e-79c850e92402";

function badge(num){
  if(!PUSH) return;
  var msg = {"default":"This is the default Message","APNS":"{ \"aps\" : { \"badge\" : " + num + "}}"};
  console.log("badge: " + num);

  var params = { TargetArn: arn, Message: JSON.stringify(msg), MessageStructure: "json"};
  sns.publish( params, function(err, data) {
    if(err) {
      console.log(err);
    } else {
      console.log("Successfully published to " + params.TargetArn);
    }
  });
}

function alert(msg){
  if(!PUSH) return;
  var msg = {"default":"This is the default Message","APNS":"{ \"aps\" : { \"alert\" : \"" + msg + "\"}}"};
  console.log("alert: " + JSON.stringify(msg));

  var params = { TargetArn: arn, Message: JSON.stringify(msg), MessageStructure: "json"};
  sns.publish( params, function(err, data) {
    if(err) {
      console.log(err);
    } else {
      console.log("Successfully published to " + params.TargetArn);
    }
  });
}

//alert("hello world");
//badge(0);

var SPI = require('pi-spi');
var spi = SPI.initialize("/dev/spidev0.0");
var instruction = Buffer([ 0x01, 0x80, 0x00]);  //0000 0001 1000 0000 0000 0000
var last = 0;

setInterval(function(e){ 

  spi.transfer(instruction, instruction.length, function (e,d) {
    if (e) console.error(e);

    var val = parseInt(((d[1] & 31) << 6) + (d[2] >> 2), 16);
    var change = val - last;
    console.log( "resistance: " + val + ", change: " + change);
    last = val;

    if(Math.abs(change) > CHANGE){
	sleep.sleep(5);
        if(val >= GREENMIN){
  	  console.log("Milk is full");
	  badge(99);
        } else if (val < GREENMIN && val >= YELLOWMIN){
	  console.log("Milk is half Full");
	  badge(50);
        } else if (val < YELLOWMIN && val > REDMIN) {
   	  console.log("You need more Milk!!");
	  alert("You need more Milk!!!");
	  badge(20);
        } else {
	  console.log("Shelf empty");
	  badge(0);
        }
    }

  });

}, 1000, last);

