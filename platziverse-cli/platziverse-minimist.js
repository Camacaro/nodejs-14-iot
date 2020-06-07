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

const minimist = require('minimist');

console.log('Hello platziverse');

// console.log(process.argv);
// node platziverse.js --a --name IoT --host localhost
const args = minimist(process.argv)
console.log(args);
console.log(args.host);
console.log(args.name);


