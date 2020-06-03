'use strict'

const test = require('ava')
const request = require('supertest')
const proxyquire = require('proxyquire');

const sinon = require('sinon');

const { agentFixtures, metricFixtures } = require('platziverse-utils');

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

const uuid = 'yyy-yyy-yyy'
const uuidBad = 'yyy-yyy-123'
const type = 'cpu'

test.beforeEach( async () => {
    sandbox = sinon.createSandbox()

    dbStub = sandbox.stub()
    dbStub.returns(Promise.resolve({
        Agent: AgentStub,
        Metric: MetricStub
    }))

    AgentStub.findConnected = sandbox.stub()
    AgentStub.findConnected
        .returns(Promise.resolve(agentFixtures.connected)) 

    AgentStub.findByUuId = sandbox.stub()
    AgentStub.findByUuId
        .withArgs(uuid)
        .returns(Promise.resolve(agentFixtures.byUuid(uuid))) 



    MetricStub.findByAgentUuid = sandbox.stub() 
    MetricStub.findByAgentUuid
        .withArgs(uuid)
        .returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid))) 

    MetricStub.findByTypeAgentUuid = sandbox.stub() 
    MetricStub.findByTypeAgentUuid
        .withArgs(type, uuid)
        .returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, uuid))) 
        

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

test.serial.cb(`api/agents/:uuid`, t => {
    request(server)
    .get(`/api/agents/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
        t.falsy(err, 'should not return error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify( agentFixtures.byUuid(uuid) )
        t.deepEqual(body, expected, 'response body should be the expected')
        // este end lo uso cuando trabajo con el callback
        t.end()
    })
})

test.serial.cb('/api/agents/:uuid - not found', t => {
    request(server)
        .get(`/api/agents/${uuidBad}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            console.log(res.body);
            if (err) {
                console.log(err);
            }
            t.truthy(res.body.error, 'should return an error');
            t.regex(res.body.error, /not found/, 'Error should contains not found');
            t.end();
        });
});

test.serial.cb('/api/metrics/:uuid', t => {
    request(server)
        .get(`/api/metrics/${uuid}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            t.falsy(err, 'should not return an error');
            let body = JSON.stringify(res.body);
            let expected = JSON.stringify(metricFixtures.findByAgentUuid(uuid));
            t.deepEqual(body, expected, 'response body should be the expected');
            t.end();
        });
});

test.serial.cb('/api/metrics/:uuid - not found', t => {
    request(server)
        .get(`/api/metrics/${uuidBad}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            t.truthy(res.body.error, 'should return an error');
            t.regex(res.body.error, /not found/, 'Error should contains not found');
            t.end();
        });
});

test.serial.cb('/api/metrics/:uuid/:type', t => {
    request(server)
        .get(`/api/metrics/${uuid}/${type}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            console.log(res.body);
            console.log(metricFixtures.findByTypeAgentUuid(type, uuid));
            t.falsy(err, 'should not return an error');
            let body = JSON.stringify(res.body);
            let expected = JSON.stringify(metricFixtures.findByTypeAgentUuid(type, uuid));
            t.deepEqual(body, expected, 'response body should be the expected');
            t.end();
        });
});

test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
    request(server)
        .get(`/api/metrics/${uuidBad}/${type}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            t.truthy(res.body.error, 'should return an error');
            t.regex(res.body.error, /not found/, 'Error should contains not found');
            t.end();
        });
});