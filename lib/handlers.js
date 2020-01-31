const fs = require('fs');
const querystring = require('querystring');

const {App} = require('./app');
const {loadTemplate} = require('./viewTemplate');

const MIME_TYPES = require('./mimeTypes.js');
const PUBLIC_FOLDER = `${__dirname}/../public`;
const STORAGE_FILE = `${__dirname}/../data/commentsDetail.json`;

const doesNotFileExist = function (path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const getAbsolutePath = function (url) {
  const path = url === '/' ? '/index.html' : url;
  return PUBLIC_FOLDER + path;
};

// eslint-disable-next-line max-statements
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
  res.write(content);
  res.end();
};

const notFound = function (req, res) {
  res.writeHead(404);
  res.end('Not Found');
};

const methodNotAllowed = function (req, res) {
  res.writeHead(400, 'Method Not Allowed');
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

const getCommentsDetail = function () {
  if (!fs.existsSync(STORAGE_FILE)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
};

const addCommentHtml = function (commentsHtml, commentDetail) {
  const commentHtml = `
  <tr class="comment-row">
    <td class="name"><strong>${commentDetail.name}</strong></td>
    <td class="time">${commentDetail.date.toLocaleString()}</td>
    <td class="comment"><pre>${commentDetail.comment}</pre></td>
  </tr>`;

  return commentsHtml + commentHtml;
};

const updateDate = function (commentDetail) {
  commentDetail.date = new Date(commentDetail.date);
  return commentDetail;
};

const serveGuestBookPage = function (req, res) {
  let commentsDetail = getCommentsDetail();
  commentsDetail = commentsDetail.map(updateDate);

  const comments = commentsDetail.reduce(addCommentHtml, '');
  const guestBookPage = loadTemplate('guest-book.html', {comments});

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
  let commentDetails = getCommentsDetail();
  const date = new Date();
  const query = querystring.parse(data);
  const commentDetail = {...query, date};

  commentDetails.unshift(commentDetail);
  commentDetails = JSON.stringify(commentDetails);

  fs.writeFileSync(STORAGE_FILE, commentDetails, 'utf8');
};

const addCommentAndRedirect = function (req, res) {
  addComment(req.body);
  redirectTo('guest-book.html', res);
};

const app = new App();

app.use(readBody);

app.post('/comment', addCommentAndRedirect);
app.get('/guest-book.html', serveGuestBookPage);
app.get('', serveStaticPage);
app.get('', notFound);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = {app};
