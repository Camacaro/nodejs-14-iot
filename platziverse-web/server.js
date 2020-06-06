'use strict'

const debug = require('debug')('platziverse:web')
const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const chalk = require('chalk')
const PlatziverseAgent = require('platziverse-agent')
const { handleError } = require('platziverse-utils');

const proxy = require('./proxy')
const { pipe } = require('./utils')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

const AgentMessage = 'agent/message';
const AgentConnected = 'agent/connected';
const AgentDisConnected = 'agent/disconnected';


// Socket.io / WebSockets
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  //Este pipe reemplaza a los agent.on
  pipe(agent, socket)

  // *******************************************************

  // agent.on(AgentMessage, payload => {
  //     socket.emit(AgentMessage, payload)
  // })

  // agent.on(AgentConnected, payload => {
  //     socket.emit(AgentConnected, payload)
  // })

  // agent.on(AgentDisConnected, payload => {
  //     socket.emit(AgentDisConnected, payload)
  // })

  // *******************************************************

  // Ejemplo de socket IO
  // // Escuchando mensando del cliente / web
  // socket.on('agent/message', payload => {
  //     console.log(payload);
  // })

  // setInterval( () => {
  //     // Enviar mensaje al cliente
  //     socket.emit('agent/message', {agent: 'xxx-yyy'})
  // }, 2000)
})

// Express Error Handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})


process.on('uncaughtException', handleError.fatal)
process.on('unhandledRejection', handleError.fatal)

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} server listening on port ${port}`)
  agent.connect()
})
