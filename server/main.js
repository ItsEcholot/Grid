const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const sequalize = require('sequelize')('grid', 'gridUser', 'gridPassword', {
  storage: './grid.sqlite'
});

const ioHandler = require('./websocketHandler');

app.get('/', function (req, res) {
  res.send('API reached');
});

io.on('connection', function (socket) {
  ioHandler.clientConnected(socket);
  console.log('Users connected: ' + Object.keys(io.sockets.sockets).length);
});

http.listen(8008, function () {
  console.log('Listening on *:8008');
});
