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

/************************************************************************************************** */

const firstPromise = Promise.resolve("first-promise").catch(() => "error");
const secondPromise = Promise.reject("failed").catch(() => "error");
const thirdPromise = Promise.resolve("third-promise").catch(() => "error");

const completeResult = Promise.all([firstPromise, secondPromise, thirdPromise]).then((result) => {
  conosle.log(result)
})

/************************************************************************************************** */

/** 
 * Resolver promesas en paralelo
*/
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
        })
    )
    result = await Promise.all(promises)
} catch (error) {
    handleFatalError(error)
}

result.map(message => {
    debug(message)
})