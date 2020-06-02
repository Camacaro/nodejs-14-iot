var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
 
client.on('connect', function () {
  client.subscribe('agent/message', function (err) {
    if (!err) {
      const payload = {
        agent: {
          uuid: 'yyx',
          name: 'test',
          username: "platzi",
          pid: 10,
          hostname: 'platzichile'
        }, 
        metrics: [
          {
            type: "memory",
            value: "1001"
          },
          {
            type: "temp",
            value: "33"
          }
        ]
      } 
      const stringifyPayload = JSON.stringify(payload)
      client.publish('agent/message', stringifyPayload)
    }
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})