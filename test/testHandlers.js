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

describe('Get Ageratun page', function () {
  it('should return ageratun page', function (done) {
    request(app.serve.bind(app))
      .get('/ageratum.html')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect(/<title>Ageratum<\/title>/);
  });
});

describe('Get guest-book page', function () {
  it('should return guest-book page', function (done) {
    request(app.serve.bind(app))
      .get('/guest-book.html')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect(/<title>Guest Book<\/title>/);
  });
});

describe('GET nonExisting Url', () => {
  it('should return 404 for a non existing page', (done) => {
    request(app.serve.bind(app))
      .get('/badPage')
      .expect(404, done);
  });
});

describe('Get hideWateringCan script', function () {
  it('should return hideWateringCan', function (done) {
    request(app.serve.bind(app))
      .get('/scripts/hideWateringCan.js')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'application/javascript', done)
      .expect(/hideWateringCan = function ()/);
  });
});
