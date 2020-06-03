'use strict'
// const debug = require('debug')('platziverse:api:config')

const {db} = require('platziverse-utils');

module.exports = {
    db,
    auth: {
        secret: process.env.SECRET || 'platzi'
    }
}