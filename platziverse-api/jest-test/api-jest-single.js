
const supertest = require('supertest');
const server = require('../server');
const request = supertest(server)

describe('Probar funcionalidades del componente User', () => {

    afterAll(async () => {
      await new Promise(resolve => setTimeout(() => resolve(), 1000)); // avoid jest open handle error
    });

    test(`Testing 01 - Method /api/test (GET)`, async () => {
      const response = await request.get('/api/test');
      expect(response.body).toEqual({});
      expect(response.statusCode).toEqual(200);
    });


})