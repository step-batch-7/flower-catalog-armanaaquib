const http = require('http');

const {processRequest} = require('./app');
const PORT = process.argv[2] || 4000;

const requestListener = function (req, res) {
  const remote = {addr: req.socket.remoteAddress, port: req.socket.remotePort};
  console.warn('New Connection: ', remote);

  req.on('close', (hadError) => {
    console.warn(remote, 'closed', `${hadError ? 'with error.' : ''}`)
  });

  req.on('end', () => console.warn(remote, 'ended'));

  req.on('error', (error) => console.error(`Socket Error ${error}`));

  processRequest(req, res);
};

const main = function () {
  const server = http.Server(requestListener)
  server.on('error', (error) => console.error(error));
  server.listen(PORT, () => console.log(`Listening at ${PORT}`));
};

main();