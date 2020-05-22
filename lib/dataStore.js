const redis = require('redis');

const loadCommentsDetail = function (app) {
  const client = redis.createClient();
  client.get('commentsDetail', function (err, data) {
    if (err) {
      throw err;
    } else {
      app.commentsDetail = data;
    }
  });
  client.quit();
};

const saveCommentsDetail = function (commentsDetail) {
  const client = redis.createClient();
  client.set('commentsDetail', commentsDetail, function (err) {
    if (err) {
      throw err;
    }
  });
  client.quit();
};

module.exports = { loadCommentsDetail, saveCommentsDetail };
