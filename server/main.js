const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const ioHandler = require('./websocketHandler');
const models = require('./models');

models.sequelize.sync().then(() =>  {
  console.log('DB synced');
});

io.on('connection', function (socket) {
  ioHandler.clientConnected(socket, models);
  console.log('Users connected: ' + Object.keys(io.sockets.sockets).length);
});

http.listen(8008, function () {
  console.log('Listening on *:8008');
});
