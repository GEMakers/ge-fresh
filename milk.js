var AWS = require('aws-sdk');
var sleep = require('sleep');
AWS.config.loadFromPath('./config.json');

var PUSH=true;
var CHANGE=500;
var ONOFFCHANGE=50;
var GREENMIN = 3000;
var YELLOWMIN = 500;
var REDMIN = 0;
var WEIGHTLOOP = null;

//var sns = new AWS.SNS(); 
var sns = new AWS.SNS({endpoint:"http://sns.us-east-1.amazonaws.com"}); 
var arn = "arn:aws:sns:us-east-1:843496043718:endpoint/APNS/Hackathon-MilkMinder/3efab044-7c28-3864-a34e-79c850e92402";

function badge(num){
  if(!PUSH) return;
  var msg = {"default":"This is the default Message","APNS":"{ \"aps\" : { \"badge\" : " + num + "}}"};
  console.log("badge: " + num);

  var params = { TargetArn: arn, Message: JSON.stringify(msg), MessageStructure: "json"};
  setImmediate(function(){
    sns.publish( params, function(err, data) {
      if(err) {
        console.log(err);
      } else {
        console.log("Successfully published to " + params.TargetArn);
      }
    });
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
var last = -5000;
var changed=false;
var onofflast = 0;
var onoffchanged=false;

setInterval(function(e){
  var instruction = Buffer([ 0x01, 0xC0, 0x00]);  //0000 0001 1100 0000 0000 0000

  spi.transfer(instruction, instruction.length, function (e,d) {
    if (e) console.error(e);

    var val = parseInt(((d[1] & 31) << 6) + (d[2] >> 2), 16);
    var onoffchange = val - onofflast;
    console.log( "onoff resistance: " + val + ", change: " + onoffchange);
    onofflast = val;

    if(Math.abs(onoffchange) > ONOFFCHANGE){
        console.log("onoff detected change, using " + val + " ohms");
	if(val > 50){
	  if(WEIGHTLOOP == null){
	    startWeigh();
	  }
	} else {
          badge(0);
	  console.log("-----------stopping weight measurement");
	  clearInterval(WEIGHTLOOP);
 	  WEIGHTLOOP = null;
        }
    }

  });
}, 2000);


function startWeigh(){
  console.log("-----------starting to measure weight");
WEIGHTLOOP = setInterval(function(e){ 
  var instruction = Buffer([ 0x01, 0x80, 0x00]);  //0000 0001 1000 0000 0000 0000
  spi.transfer(instruction, instruction.length, function (e,d) {
    if (e) console.error(e);

    var val = parseInt(((d[1] & 31) << 6) + (d[2] >> 2), 16);
    var change = val - last;
    console.log( "-----------weight resistance: " + val + ", change: " + change);
    last = val;

    if(Math.abs(change) > CHANGE){
      changed=true;
      sleep.sleep(2);
      return;
    }
    
    if(changed){
	changed=false;
        console.log("-----------weight detected change, using " + val + " ohms");
        if(val >= GREENMIN){
  	  console.log("-----------Milk is full");
	  badge(99);
        } else if (val < GREENMIN && val >= YELLOWMIN){
	  console.log("-----------Milk is half Full");
	  badge(48);
        } else if (val < YELLOWMIN && val >= REDMIN) {
   	  console.log("-----------You need more Milk!!");
	  alert("You need more Milk!!!");
	  badge(15);
        }
    }

  });

}, 2000, last);
}
