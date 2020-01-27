const fs = require('fs');

const Response = require('./lib/response');
const {loadTemplate} = require('./lib/viewTemplate');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;

const serveStaticFile = function (req) {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);

  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];

  const content = fs.readFileSync(path);
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;

  return res;
};

const serveHomePage = function (req) {
  req.url = '/index.html';
  return serveStaticFile(req);
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

const formatHtmlWhiteSpaces = function (text) {
  const whiteSpacesBag = {'\\+': ' ', '%0D%0A': '<br>', '%3F': '?', '%2C': ','};

  const replaceWithKeyValue = function (text, key) {
    const pattern = new RegExp(key, 'g');
    return text.replace(pattern, whiteSpacesBag[key]);
  };

  const keys = Object.keys(whiteSpacesBag);
  return keys.reduce(replaceWithKeyValue, text);
};

const getCommentDetails = function () {
  if (!fs.existsSync('./data/comments.json')) {
    return [];
  }

  return JSON.parse(fs.readFileSync('./data/comments.json', 'utf8'));
};

const serveGuestBookPage = function (req) {
  const commentDetails = getCommentDetails();
  const comments = commentDetails.reduce(addCommentHtml, '');

  let guestBookPage = loadTemplate('guest-book.html', {comments});
  guestBookPage = formatHtmlWhiteSpaces(guestBookPage);

  const res = new Response()
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', guestBookPage.length);
  res.statusCode = 200;
  res.body = guestBookPage;

  return res;
};


const addCommentAndServePage = function (req) {
  const date = new Date().toLocaleString();
  const commentDetail = {...req.body, date};

  let commentDetails = getCommentDetails();
  commentDetails.unshift(commentDetail);

  commentDetails = JSON.stringify(commentDetails);
  fs.writeFileSync('./data/comments.json', commentDetails, 'utf8');

  return serveGuestBookPage(req);
};

const findHandler = function (req) {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'POST' && req.url === '/addComment') return addCommentAndServePage;
  if (req.method === 'GET' && req.url === '/guest-book.html') return serveGuestBookPage;
  if (req.method === 'GET') return serveStaticFile;
  return new Response();
};

const processRequest = (req) => {
  const handler = findHandler(req);
  return handler(req);
}

module.exports = {processRequest};