'use strict'

const debug = require('debug')('platziverse:mqtt');
const mosca = require('mosca');
const redis = require('redis');
const chalk = require('chalk');
const db = require('platziserve-db')

var ascoltatore = {
    type: 'redis',
    redis,
    return_buffers: true, // to handle binary payloads
    host: 'redis-13093.c8.us-east-1-4.ec2.cloud.redislabs.com',
    port: 13093,
    password: 'ivKjd54OlngILab6fTtxLecQ3ODZY8zA'
  };

const settings = {
    port: 1883,
    backend: ascoltatore,
}

const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: log => debug(log),
}

const server = new mosca.Server(settings)

let Agent, Metric 

server.on('clientConnected', client => {
    debug(`Client Connected: ${client.id}`);
})

server.on('clientDisconnected', client => {
    debug(`Client Disconnected: ${client.id}`);
})

server.on('published', (packet, client) => {
    /**
     * topic es el tipo de mensaje 
     * payload informacion del mensaje
     */
    debug(`Received: ${packet.topic}`);
    debug(`Payload: ${packet.payload}`);
})

server.on('ready', async () => {
    
    const services = await db(config).catch(handleFatalError)

    Agent = services.Agent
    Metric = services.Metric

    console.log(`${chalk.green('[platziverse-mqqt]')} server is running`);
});

server.on('error', handleFatalError)

function handleFatalError() {
    console.error(`${chalk.red('[Fatal Error]')} ${err.message}`);
    console.error(err.stack);
    process.exit(1)
}

/**
 * Buena practica de errores y reject de promesas
 * que no fueron manejadas
 */

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)