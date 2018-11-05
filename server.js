const http = require('http');
const app = require('./app');

const port = process.env.PORT || 33000;

const server = http.createServer(app);

console.log("Server is running.");

server.listen(port);
