'use strict'

const test = require('ava')
const request = require('supertest')

const server = require('../server');

// El cb es para trabajar con callback ya que supertest trabaja con eso
test.serial.cb('api/agents', t => {
    request(server)
    .get('/api/test')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
        t.falsy(err, 'should not return error')
        let body = res.body
        t.deepEqual(body, {}, 'response body should be the expected')
        // este end lo uso cuando trabajo con el callback
        t.end()
    })
})