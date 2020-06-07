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
let extended = []
let selected = {
    uuid: null,
    type: null
}

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
    showLegend: true,
    minY: 0,
    xPadding: 5
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


/**
 * Con esto tomaremos la seleccion de la pantalla
 * extender los agentes
 */
tree.on('select', node => {
    const { uuid, type } = node

    // si fue seleccionado un agente
    if( node.agent ) {
        // si se encuentra extendido el node agregamos el agente
        node.extended ? extended.push(uuid) : extended = extended.filter(e => e !== uuid )
        selected.type = null
        selected.uuid = null
        return
    }

    selected.uuid = uuid
    selected.type = type

    renderMetric()
})

function renderData() {
    const treeData = {}
    let idx = 0
    for (let [uuid, val] of agents ) {
        
        const title = `${val.name} - (${val.pid})`
        
        treeData[title] = {
            uuid,
            agent: true,
            extended: extended.includes(uuid),
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

            const metricName = ` ${type} ${" ".repeat(1000)} ${idx++}`

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

    // screen.render()
    renderMetric()
}

function renderMetric () {
    if(!selected.uuid && !selected.type) {
        line.setData(
            [
                {
                    x: [], 
                    y: [],
                    title: ''
                }
            ]
        )

        screen.render()
        return;
    }

    const metrics = agentMetrics.get(selected.uuid)
    const values = metrics[selected.type]
    const series = [{
        title: selected.type,
        x: values.map( v => v.timestamp).slice(-10), // obtener los ultimos 10
        y: values.map( v => v.value ).slice(-10) // obtener los ultimos 10
    }]
    
    line.setData(series)
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