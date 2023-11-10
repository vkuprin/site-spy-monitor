const http = require('http');

const HOSTNAME = '127.0.0.1';
const PORT = 3000;

const requestHandler = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.end('Hello Ofelia Lane, How is is going \n');
};

const server = http.createServer(requestHandler);

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
