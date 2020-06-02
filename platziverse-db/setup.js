'use strict'
const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')

const db = require('./')

const argv = require ('yargs')
  .boolean(['y','yes'])
  .argv

// console.dir([ argv.y, argv.yes ]);
// console.dir(argv._);

// hacer preguntas
const prompt = inquirer.createPromptModule()
async function setup () {
  let answer;

  if ( argv.y || argv.yes ) {
    answer = {
      setup: true
    } 
  } else {
    // Preguntar por consola
    answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your databaase, are you sure?'
      }
    ])
  }
  
  if (!answer.setup) {
    return console.log('Nothing happend :)')
  }

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: log => debug(log),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Success')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
