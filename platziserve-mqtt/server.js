'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziserve-db')
const { parsePayload } = require('./utils')

var ascoltatore = {
  type: 'redis',
  redis,
  return_buffers: true, // to handle binary payloads
  host: 'redis-13093.c8.us-east-1-4.ec2.cloud.redislabs.com',
  port: 13093,
  password: 'ivKjd54OlngILab6fTtxLecQ3ODZY8zA'
}

const settings = {
  port: 1883,
  backend: ascoltatore
}

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: log => debug(log)
}

const server = new mosca.Server(settings)
const clients = new Map()

let Agent, Metric

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)

  clients.set(client.id, null)
})

server.on('clientDisconnected', async (client) => {
  debug(`Client Disconnected: ${client.id}`)

  const agent = clients.get(client.id)

  if (agent) {
    // Mark AGent as disconnected
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (error) {
      return handleError(error)
    }

    // Delete Agent frin clients list
    clients.delete(client.id)

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`)
  }
})

/**
 * Escuchar publicaciones
 */
server.on('published', async (packet, client) => {
  /**
     * topic es el tipo de mensaje
     * payload informacion del mensaje
     */
  debug(`Received: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break

    case 'agent/message': {
      debug(`Payload: ${packet.payload}`)
      const payload = parsePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }

        debug(`Agent: ${agent.uuid} saved `)

        // Notify Agent id Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)

          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        /**
         * Factorizar el almacenamiento de metricas
         * de serial a paralelo
         */

        // Store Metrics - SERIAL
        // for (const metric of payload.metrics) {
        //   let m

        //   try {
        //     m = await Metric.create(agent.uuid, metric)
        //   } catch (e) {
        //     return handleError(e)
        //   }

        //   debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        // }

        // Store Metrics - PARALELO
        let result
        try {
          const promises = payload.metrics.map(metric => new Promise((resolve, reject) => {
            Metric.create(agent.uuid, metric)
              .then(
                (metricDB) => {
                  resolve(`Metric ${metricDB.id} saved on agent ${agent.uuid}`)
                }
              )
              .catch(
                (e) => {
                  reject(`Error con la metric ${JSON.stringify(metric)}`)
                }
              )
          }))
          result = await Promise.all(promises)
        } catch (error) {
          handleFatalError(error)
        }

        result.map(message => {
          debug(message)
        })
      }
      break
    }
  }
  debug(`Payload: ${packet.payload}`)
})

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqqt]')} server is running`)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal Error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[Error]')} ${err.message}`)
  console.error(err.stack)
}

/**
 * Buena practica de errores y reject de promesas
 * que no fueron manejadas
 */

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
