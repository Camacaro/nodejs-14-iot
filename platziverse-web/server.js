'use strict'

const debug = require('debug')('platziverse:web')
const chalk = require('chalk');
const http = require('http')
const express = require('express');
const path = require('path');
const socketIO = require('socket.io')
const { handleError } = require('platziverse-utils');

const port = process.env.PORT || 8181
const app= express()
const server = http.createServer(app)

const io = socketIO(server)

app.use(express.static(path.join(__dirname, 'public')))

// sockect.io / webSockets
io.on('connect', socket => {
    debug(`Connected ${socket.id}`)

    // Escuchando mensando del cliente / web
    socket.on('agent/message', payload => {
        console.log(payload);
    })

    setInterval( () => {
        // Enviar mensaje al cliente
        socket.emit('agent/message', {agent: 'xxx-yyy'})
    }, 2000)
})

server.listen(port, () => {
    console.log(`${chalk.green(['plaziverse-web'])} server listing on port ${port}`);
})

process.on('uncaughtException', handleError.fatal)
process.on('unhandledRejection', handleError.normal)