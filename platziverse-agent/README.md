# platziverse-agent

Un agente es un sistema de computo que esta censando algo, por ejemplo, si tenemos un sistema IoT que controle las cosas del hogar lo mas común seria tener un sensor de gas, otro de agua, otro ponele en el patio que monitore la temperatura, etc… Bueno cada uno de estos modulos que censan cosas distintas vendrían a ser un agente distinto, la cuestión es que el modulo de “platziverse-agent” vendría a simular 1 modulo de esto, y si ejecuto este modulo “platziverse-agent” en varias terminales lo que estaría haciendo es simular X cantidad de módulos con distinta configuración de monitoreo y que todo esto se comunique con una especie de “servidor central” que funcionaria de “middleware” y que en este caso serían los modulos de platziverse-db junto a platziverse-mqtt

## Usage

``` js
    const PlatziverseAgent = require('platzicer-agent')

    const agent = new PlatziverseAgent({
        interval: 2000
    })

    agent.connect()

    // this agent only 
    agent.on('connected')
    agent.on('disconnected')
    agent.on('message')

    agent.on('agent/connected')
    agent.on('agent/disconnected')
    agent.on('agent/message', payload => {
        console.log(payload)
    })

    setTimeout( () => agent.disconnect(), 20000 )
```