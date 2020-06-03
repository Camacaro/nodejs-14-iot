'use strict'

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

const debug = require('debug')('platziverse:utils')

function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }

  try {
    payload = JSON.parse(payload)
  } catch (e) {
    payload = null
  }

  return payload
}

const db = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: log => debug(log)
}

module.exports = {
  parsePayload,
  db,
  agentFixtures,
  metricFixtures
}
