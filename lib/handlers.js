const fs = require('fs');
const querystring = require('querystring');

const { App } = require('./app');
const { loadTemplate } = require('./viewTemplate');
const { Comment, Comments } = require('./comment');
const { loadCommentsDetail, saveCommentsDetail } = require('./dataStore');

const MIME_TYPES = require('./mimeTypes.js');
const PUBLIC_FOLDER = `${__dirname}/../public`;

const doesNotFileExist = function (path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const getAbsolutePath = function (url) {
  const path = url === '/' ? '/index.html' : url;
  return PUBLIC_FOLDER + path;
};

const serveStaticPage = function (req, res, next) {
  const absolutePath = getAbsolutePath(req.url);

  if (doesNotFileExist(absolutePath)) {
    next();
    return;
  }

  const [, extension] = absolutePath.match(/.*\.(.*)$/) || [];
  const contentType = MIME_TYPES[extension];

  const content = fs.readFileSync(absolutePath);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.end(content);
};

const notFound = function (req, res) {
  const statusCode = 404;
  res.writeHead(statusCode);
  res.end('Not Found');
};

const methodNotAllowed = function (req, res) {
  const statusCode = 400;
  res.writeHead(statusCode, 'Method Not Allowed');
  res.end();
};

const readBody = function (req, res, next) {
  let data = '';

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    req.body = data;
    next();
  });
};

const serveGuestBookPage = function (req, res) {
  const comments = app.comments.toHtml();
  const guestBookPage = loadTemplate('guest-book.html', { comments });

  res.setHeader('Content-Type', MIME_TYPES.html);
  res.setHeader('Content-Length', guestBookPage.length);
  res.write(guestBookPage);
  res.end();
};

const redirectTo = function (newUrl, res) {
  res.setHeader('location', newUrl);
  const statusCode = 303;
  res.writeHeader(statusCode);
  res.end();
};

const addComment = function (data) {
  const comments = app.comments;

  const query = querystring.parse(data);
  const time = new Date();
  const comment = new Comment(query.name, time, query.comment);

  comments.addComment(comment);
  saveCommentsDetail(comments.toJSON());
};

const addCommentAndRedirect = function (req, res) {
  addComment(req.body);
  redirectTo('guest-book.html', res);
};

const app = new App();

loadCommentsDetail(app, Comments);

app.use(readBody);

app.post('/comment', addCommentAndRedirect);
app.get('/guest-book.html', serveGuestBookPage);
app.get('', serveStaticPage);
app.get('', notFound);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
