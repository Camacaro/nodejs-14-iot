'use strict'

const http = require('http')
const debug = require('debug')('platziverse:api:server')
const chalk = require('chalk')
const express = require('express')
const { handleError } = require('platziverse-utils');

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

    process.on('uncaughtException', handleError.fatal )
    process.on('unhandledRejection', handleError.fatal )

    server.listen(port, () => {
        console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}`)
    })
}


module.exports = server

