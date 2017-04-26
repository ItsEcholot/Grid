const minimist = require('minimist');
const commandHandler = require('./commandHandler');

module.exports = {
  clientConnected: function (socket) {
    this.bindSocketCallbacks(socket);
    socket.emit('response', commandHandler(minimist('motd'.split(' ')), socket));
  },
  bindSocketCallbacks: function (socket) {
    socket.on('latencyPing', function (data) {
      socket.emit('latencyPong');
    });
    socket.on('command', function (data) {
      socket.emit('response', commandHandler(minimist(data.split(' ')), socket));
    });
  }
}
