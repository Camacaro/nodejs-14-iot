'use strict'

const test = require('ava')
const request = require('supertest')
const proxyquire = require('proxyquire');

const sinon = require('sinon');

const { agentFixtures } = require('platziverse-utils');

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

test.beforeEach( async () => {
    sandbox = sinon.createSandbox()

    dbStub = sandbox.stub()
    dbStub.returns(Promise.resolve({
        Agent: AgentStub,
        Metric: MetricStub
    }))

    AgentStub.findConnected = sandbox.stub()
    AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected)) 

    const api = proxyquire('../api', {
        'platziverse-db': dbStub
    })

    server = proxyquire('../server', {
        './api': api
    })
    

})

test.afterEach( () => {
    sandbox && sinon.resetHistory()
})


// El cb es para trabajar con callback ya que supertest trabaja con eso
test.serial.cb('api/agents', t => {
    request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
        t.falsy(err, 'should not return error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify( agentFixtures.connected )
        t.deepEqual(body, expected, 'response body should be the expected')
        // este end lo uso cuando trabajo con el callback
        t.end()
    })
})