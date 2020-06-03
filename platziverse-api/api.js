'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db');

const config = require('./config')

const api = express.Router()

let services, Agent, Metric 

api.use('*', async (req, res, next) => {
  if(!services) {
    debug('Connecting to database')
    try {
      services = await db(config.db)
    } catch (error) {
      return next(e)
    }
    
    Agent = services.Agent
    Metric = services.Metric
  }

  next();
})

api.get('/agents', async (req, res, next) => {
  debug('A reqiues has come to /agents')

  let agents = []

  try {
    agents = await Agent.findConnected()
  } catch (error) {
    return next(error)
  }

  res.send(agents)
})

api.get('/test', async (req, res, next) => {
  res.send({})
})

api.get('/agents/:uuid', async (req, res, next) => {
  
  const { uuid } = req.params

  debug(`A reqiues has come to /agents/${uuid}`)

  let agent

  try {
    agent = await Agent.findByUuId(uuid)
  } catch (error) {
    return next(error)
  }

  if( !agent ) {
    return next( new Error(`Agent not found with uuid ${uuid}`) )
  }

  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`A reqiues has come to /metrics/${uuid}`)

  let metrics = []

  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (error) {
    return next(error)
  }

  if( !metrics || metrics.length === 0 ) {
    return next( new Error(`Metrics not found for agent with uuid ${uuid}`) )
  }

  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params

  debug(`A reqiues has come to /metrics/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (error) {
    return next(error)
  }

  if( !metrics || metrics.length === 0 ) {
    return next( new Error(`Metrics (${type}) not found for agent with uuid ${uuid}`) )
  }

  res.send(metrics)
})

module.exports = api
