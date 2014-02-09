var AWS = require('aws-sdk'); 
AWS.config.loadFromPath('./config.json');

var s3 = new AWS.S3(); 
//var s3 = new AWS.S3(options={proxy="http://http-proxy.consind.ge.com:8080"); 

 s3.createBucket({Bucket: 'wesMyBucket'}, function() {

  var params = {Bucket: 'wesMyBucket', Key: 'myKey', Body: 'Hello!'};

  s3.putObject(params, function(err, data) {

      if (err)       

          console.log(err)     

      else       console.log("Successfully uploaded data to myBucket/myKey");   

   });

});
