const request = require('supertest');
// const fs = require('fs');
const {app} = require('../lib/handlers');

describe('Get Home Page', function () {
  it('should get the home page / path', function (done) {
    request(app.serve.bind(app))
      .get('/')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect(/<title>Flower Catalog<\/title>/);
  });
});

describe('Get Abeliophyllum page', function () {
  it('should return abeliophyllum page', function (done) {
    request(app.serve.bind(app))
      .get('/abeliophyllum.html')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect(/<title>Abeliophyllum<\/title>/);
  });
});

