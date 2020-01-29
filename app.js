const fs = require('fs');

const {loadTemplate} = require('./lib/viewTemplate');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;
const STORAGE_FILE = `${__dirname}/data/commentsDetail.json`;

const notFound = function (req, res) {
  res.writeHeader(404, {'Content-Length': 0});
  res.end();
};

const doesNotFileExist = function (path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const serveStaticFile = function (req, res) {
  const path = `${STATIC_FOLDER}${req.url}`;

  if (doesNotFileExist(path)) return notFound(req, res);

  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];

  const content = fs.readFileSync(path);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.write(content);
  res.end();
};

const serveHomePage = function (req, res) {
  req.url = '/index.html';
  return serveStaticFile(req, res);
};

const getCommentsDetail = function () {
  if (!fs.existsSync(STORAGE_FILE)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
};

const addCommentHtml = function (commentsHtml, commentDetail) {
  const commentHtml = `
  <div class="comment">
    <h3>${commentDetail.name}</h3>
    <h5>${commentDetail.date}</h5>
    <p>${commentDetail.comment}</p>
  </div>`;

  return commentsHtml + commentHtml;
};

const replace = function (text, refBag) {

  const replaceWithKeyValue = function (text, key) {
    const pattern = new RegExp(key, 'g');
    return text.replace(pattern, refBag[key]);
  };

  const keys = Object.keys(refBag);
  return keys.reduce(replaceWithKeyValue, text);
};

const formatHtmlWhiteSpaces = function (text) {
  const whiteSpacesBag = {' ': '&nbsp;', '\r\n': '<br>'};

  return replace(text, whiteSpacesBag);
};

const updateToHtmlFormat = function (commentDetail) {
  commentDetail.date = new Date(commentDetail.date).toLocaleString();
  commentDetail.name = formatHtmlWhiteSpaces(commentDetail.name);
  commentDetail.comment = formatHtmlWhiteSpaces(commentDetail.comment);
  return commentDetail;
};

const serveGuestBookPage = function (req, res) {
  let commentsDetail = getCommentsDetail();
  commentsDetail = commentsDetail.map(updateToHtmlFormat);

  const comments = commentsDetail.reduce(addCommentHtml, '');
  const guestBookPage = loadTemplate('guest-book.html', {comments});

  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', guestBookPage.length);
  res.write(guestBookPage);
  res.end();
};

const redirectTo = function (newUrl, res) {
  res.setHeader('location', newUrl);
  res.writeHeader(301);
  res.end();
};

const formatStringWhiteSpaces = function (text) {
  const whiteSpacesBag = {
    '\\+': ' ',
    '%0D%0A': '\r\n',
    '%3F': '?',
    '%2C': ',',
    '%21': '!',
    '%2F': '/'
  };

  return replace(text, whiteSpacesBag);
};

const addQuery = (query, queryTextLine) => {
  const [key, value] = queryTextLine.split('=');
  query[key] = value;
  return query;
};

const parseQuery = function (queryText) {
  const queryTextLines = queryText.split('&');
  return queryTextLines.reduce(addQuery, {});
};

const addComment = function (data) {
  let commentDetails = getCommentsDetail();
  const date = new Date();
  const query = parseQuery(data);
  const commentDetail = {...query, date};

  commentDetail.name = formatStringWhiteSpaces(commentDetail.name);
  commentDetail.comment = formatStringWhiteSpaces(commentDetail.comment);

  commentDetails.unshift(commentDetail);
  commentDetails = JSON.stringify(commentDetails);
  fs.writeFileSync(STORAGE_FILE, commentDetails, 'utf8');
}

const addCommentAndRedirect = function (req, res) {
  let data = ''
  req.on('data', (chunk) => data += chunk);

  req.on('end', () => {
    addComment(data);
    redirectTo('guest-book.html', res);
  })
};

const findHandler = function (req) {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'POST' && req.url === '/addComment') return addCommentAndRedirect;
  if (req.method === 'GET' && req.url === '/guest-book.html') return serveGuestBookPage;
  if (req.method === 'GET') return serveStaticFile;
  return notFound;
};

const processRequest = (req, res) => {
  const handler = findHandler(req);
  handler(req, res);
};

module.exports = {processRequest};