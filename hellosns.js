var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');


var sns = new AWS.SNS(); 

//var msg = {"default":"This is the default Message","APNS":"{ \"aps\" : { \"alert\" : \"You need more Milk!!!.\"}}"};
var msg = {"default":"This is the default Message","APNS":"{ \"aps\" : { \"badge\" : 15}}"};
msg = JSON.stringify(msg);

console.log(msg);

var params = { TargetArn: "arn:aws:sns:us-east-1:843496043718:endpoint/APNS/Hackathon-MilkMinder/3efab044-7c28-3864-a34e-79c850e92402", Message: msg, MessageStructure:"json"};

sns.publish( params, function(err, data) {

  if(err) {
    console.log(err);
  } else {
    console.log("Successfully published to " + params.TargetArn);
  }

});
