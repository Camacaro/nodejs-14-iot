#!usr/bin/env node

/**
 * Esto de arriba es para poder ejecutarlo en un entorno de node 
 * en vez de usar 
 * node platziver.js
 * pueda usar 
 * ./platziverse
 * o simplemente en el path
 * 
 * esto en windows no se puede hacer, tiene que ser un sistemas UNIX
 */


'use strict'

const args = require('args')

/**
 *  node platziverse-args.js 
 *  node platziverse-args.js  -h
 */
args
  .option('port', 'The port on which the app will be running', 3000)
  .option('reload', 'Enable/disable livereloading')
  .command('serve', 'Serve your static site', ['s'])
 
const flags = args.parse(process.argv)

