var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
 
client.on('connect', function () {
  client.subscribe('agent/message', function (err) {
    if (!err) {
      client.publish('agent/message', '{"hello": "platziverse"}')
    }
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})