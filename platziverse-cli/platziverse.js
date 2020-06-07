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

const blessed = require('blessed');
// GRAFICAS
const contrib = require('blessed-contrib');
const moment = require('moment');
const PlatziverseAgent = require('platziverse-agent');

const agent = new PlatziverseAgent()
const screen = blessed.screen()

const agents = new Map()
const agentMetrics = new Map()

const grid = new contrib.grid({
    rows: 1,
    cols: 4,
    screen
})

// LISTA DE AGENTES
const tree = grid.set(0, 0, 1, 1, contrib.tree, {
    label: 'Connected Agents'
})

const line = grid.set(0, 1, 1, 3, contrib.line, {
    label: 'Metric',
})

agent.on('agent/connected', payload => {
    const { uuid } = payload.agent

    if(!agents.has(uuid)){
        agents.set(uuid, payload.agent)
        agentMetrics.set(uuid, {})
    }

    renderData()
})

agent.on('agent/disconnected', payload => {
    const { uuid } = payload.agent

    if(agents.has(uuid)){
        agents.delete(uuid)
        agentMetrics.delete(uuid)
    }

    renderData()
})

agent.on('agent/message', payload => {
    const {uuid} = payload.agent
    const {timestamp} = payload

    if(!agents.has(uuid)){
        agents.set(uuid, payload.agent)
        agentMetrics.set(uuid, {})
    }

    const metrics = agentMetrics.get(uuid)
    
    // metrics = {
    //     rss: [200, 300, 100],
    //     promiseMetric: [0.1, 0.2, 0.3],
    // }

    payload.metrics.forEach( metric => {
        const { type, value } = metric

        if( !Array.isArray( metrics[type] ) ) {
            metrics[type] = []
        }

        const length = metrics[type].length 

        if(length >= 20 ){
            metrics[type].shift()
        }

        metrics[type].push({
            value,
            timestamp: moment(timestamp).format('HH:mm:ss')
        })
    })

    renderData()
})

function renderData() {
    const treeData = {}

    for (let [uuid, val] of agents ) {
        
        const title = `${val.name} - (${val.pid})`
        
        treeData[title] = {
            uuid,
            agent: true,
            children: {}
        }

        const metrics = agentMetrics.get(uuid)

        // metrics = {
        //     rss: [200, 300, 100],
        //     memory: [0.1, 0.2, 0.3],
        // }

        Object.keys(metrics).forEach(type => {
            // memory, rss, etc
            const metric = {
                uuid,
                type,
                metric: true
            }

            const metricName = ` ${type}`

            treeData[title].children[metricName] = metric
            // {
            //     children: {
            //         rss: {
            //             uuid,
            //             type,
            //             metric: true
            //         }
            //     }
            // }
        })
    }

    tree.setData({
        extended: true,
        children: treeData
    })

    screen.render()
}

/**
 * Si presiono alguna de esas teclas salgo de la terminal
 */
screen.key([ 'escape', 'q', 'C-c'], (ch, key) => {
    process.exit(0)
} )

agent.connect()
// para poder interactuar con el teclado el monitor
tree.focus()
screen.render()