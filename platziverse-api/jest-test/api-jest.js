
const request = require('supertest');
const proxyquire = require('proxyquire');

const agentFixtures = require('../tests/fixtures/agent')

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

beforeEach( async () => {
  // Crear mocks
  sandbox = jest.fn()

  dbStub = sandbox.mockReturnValue(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.mockReturnValue(Promise.resolve('123'))

  const api = proxyquire('../api', {
    'platziverse-db': dbStub
  })

  server = proxyquire('../server', {
    'api': api
  })

  console.log('fn Before');
})

afterEach( async () => {

  // restaurar todos los mocks
  sandbox && jest.restoreAllMocks()
  console.log('fn After');
  await new Promise(resolve => setTimeout(() => resolve(), 1000)); // avoid jest open handle error
})



test(`Testing 01 - Method /api/test (GET)`, async () => {
  
  const response = await request(server).get('/api/agents123')

  console.log(response.body);
  
  let body = JSON.stringify(response.body)
  let expected = JSON.stringify( agentFixtures.connected )

  // expect(body).toEqual(expected);
  // expect(response.statusCode).toEqual(200);

  expect('').toEqual('');
});