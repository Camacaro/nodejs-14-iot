function fatal (err) {
    console.error(`${chalk.red('[Fatal Error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
}
  
function normal (err) {
    console.error(`${chalk.red('[Error]')} ${err.message}`)
    console.error(err.stack)
}

module.exports = {
    fatal,
    normal
  }