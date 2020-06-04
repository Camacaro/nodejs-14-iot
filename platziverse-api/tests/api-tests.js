'use strict'

const test = require('ava')
const request = require('supertest')
const proxyquire = require('proxyquire');
const util = require('util');
const sinon = require('sinon');

const config = require('../config')

const { agentFixtures, metricFixtures } = require('platziverse-utils');
const auth = require('../auth')
const sign = util.promisify(auth.sign)

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}
let token = null

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
        

    token = await sign(
        {
            admin: true, 
            username: 'platzi',
            permissions: [
                'metrics:read',
                'agents:read'
            ]
        }, 
        config.auth.secret
    )

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
    .set('Authorization', `Bearer ${token}`)
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

test.serial.cb('api/agents - invalid signature', t => {
    request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}bad`)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((err, res) => {
        t.regex(res.body.error, /invalid signature/, 'Error should invalid signature');
        t.end()
    })
})

test.serial.cb(`api/agents/:uuid`, t => {
    request(server)
    .get(`/api/agents/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            t.truthy(res.body.error, 'should return an error');
            t.regex(res.body.error, /not found/, 'Error should contains not found');
            t.end();
        });
});

test.serial.cb('/api/metrics/:uuid', t => {
    request(server)
        .get(`/api/metrics/${uuid}`)
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
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
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            t.truthy(res.body.error, 'should return an error');
            t.regex(res.body.error, /not found/, 'Error should contains not found');
            t.end();
        });
});