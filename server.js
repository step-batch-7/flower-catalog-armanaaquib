const http = require('http');
const {stdout} = process;

const {processRequest} = require('./app');
const PORT = 4000;

const requestListener = function (req, res) {
  const remote = {addr: req.socket.remoteAddress, port: req.socket.remotePort};
  stdout.warn('New Connection: ', remote);

  req.on('close', (hadError) => {
    stdout.warn(remote, 'closed', `${hadError ? 'with error.' : ''}`);
  });

  req.on('end', () => stdout.warn(remote, 'ended'));

  req.on('error', (error) => stdout.error(`Socket Error ${error}`));

  processRequest(req, res);
};

const main = function () {
  const server = http.Server(requestListener);
  server.on('error', (error) => stdout.error(error));
  server.listen(PORT, () => stdout.log(`Listening at ${PORT}`));
};

main();
