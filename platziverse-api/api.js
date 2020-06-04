'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const auth = require('express-jwt')
const util = require('util')
const guard = require('express-jwt-permissions')()
const db = require('platziverse-db');

const config = require('./config')

const jwt = require('./auth')
const sign = util.promisify(jwt.sign)

const api = express.Router()

let services, Agent, Metric 

api.get('/test', async (req, res, next) => {
  res.send({})
})

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

api.get('/token/:permisos', async (req, res, next) => {

  const { permisos } = req.params;

  const permisosArray = permisos.split(',');

  const token = await sign({
    admin: true, 
    username: 'platzi',
    permissions: permisosArray
  }, 
  config.auth.secret)

  res.send({token});
})

api.get('/agents', [auth(config.auth), guard.check(['agents:read'])] ,async (req, res, next) => {
  debug('A reqiues has come to /agents')

  // El decoded del Token se guarda en user
  const { user } = req

  console.log(user);

  if( !user || !user.username ) {
    return next(new Error(`Not Authorized`) )
  }

  let agents = []

  try {
    if( user.admin ) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (error) {
    return next(error)
  }

  res.send(agents)
})


api.get('/agents/:uuid', [auth(config.auth), guard.check(['agents:read'])], async (req, res, next) => {
  
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

api.get('/metrics/:uuid', [auth(config.auth), guard.check(['metrics:read']) ], async (req, res, next) => {
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

api.get('/metrics/:uuid/:type', [auth(config.auth), guard.check(['metrics:read']) ], async (req, res, next) => {
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
