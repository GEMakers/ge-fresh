ge-fresh
========

Measure the Freshness of your milk!

milk.js talks to the SPI bus on the Raspbery Pi and Gertboard extension board to read analog to digital signals measuring the weight of a gallon of milk. If the weight exceeds certain thresholds it will send either IOS Alert or Badge push notifications via AWS SNS.

### config.json
To use AWS SNS pass your API credentials in config.json
```
{ 
  "accessKeyId": "<access key>", 
  "secretAccessKey": "<access key secret>", 
  "region": "<region>" 
}
```
