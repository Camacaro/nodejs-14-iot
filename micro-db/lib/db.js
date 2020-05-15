'use strict'

const Sequilize = require('sequelize')
let sequelize = null

// Patron Singleton
module.exports = function setupDatabase (config) {
  if (!sequelize) {
    sequelize = new Sequilize(config)
  }

  return sequelize
}
