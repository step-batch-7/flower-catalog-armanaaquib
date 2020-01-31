const http = require('http');
const {stdout, stderr} = process;

const {app} = require('./lib/handlers');
const PORT = 4000;

const main = function () {
  const server = new http.Server(app.serve.bind(app));
  server.on('error', (error) => stderr.write(error));
  server.listen(PORT, () => stdout.write(`Listening at ${PORT}`));
};

main();
