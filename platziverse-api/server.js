'use strict'

const http = require('http')
const debug = require('debug')('platziverse:api:server')
const chalk = require('chalk')
const express = require('express')

const api = require('./api')

const port = process.env.PORT || 3000
const app = express()

app.use('/api', api)

// Express Error Handler
app.use((err, req, res, next) => {
    debug(`Error ${err.message}`)

    if(err.message.match(/not found/)){
        return res.status(404).send({ error: err.message })
    }

    res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
    console.error(`${chalk.red('[Fatal Error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
}

function handleError (err) {
    console.error(`${chalk.red('[Error]')} ${err.message}`)
    console.error(err.stack)
}

const server = http.createServer(app)

/**
 * Si yo no estoy requiriendo este archivo 
 * levanta el servidor
 */
if(!module.parent) {
    /**
    * Buena practica de errores y reject de promesas
    * que no fueron manejadas
    */

    process.on('uncaughtException', handleFatalError)
    process.on('unhandledRejection', handleFatalError)

    server.listen(port, () => {
        console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}`)
    })
}

module.exports = server

