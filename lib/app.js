const {stdout} = process;

const matchRoute = function (route, req) {
  if (route.method) {
    return req.method === route.method && req.url.match(route.path);
  }
  return true;
};

class App {
  constructor () {
    this.routes = [];
  }
  get(path, handler) {
    this.routes.push({path, handler, method: 'GET'});
  }
  post(path, handler) {
    this.routes.push({path, handler, method: 'POST'});
  }

  use(middleware) {
    this.routes.push({handler: middleware});
  }

  serve(req, res) {
    stdout.write('Request: ' + req.url + ' ' + req.method + '\n');

    const matchingHandlers = this.routes.filter((route) => {
      return matchRoute(route, req);
    });

    const next = function () {
      const emptyLength = 0;
      if (matchingHandlers.length === emptyLength) {
        return;
      }
      const router = matchingHandlers.shift();
      router.handler(req, res, next);
    };
    next();
  }
}

module.exports = {App};
