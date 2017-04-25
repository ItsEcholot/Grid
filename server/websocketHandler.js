const minimist = require('minimist');
const commandHandler = require('./commandHandler');

module.exports = {
  clientConnected: function (socket) {
    this.bindSocketCallbacks(socket);
  },
  bindSocketCallbacks: function (socket) {
    socket.on('command', function (data) {
      socket.emit('response', commandHandler(minimist(data.split(' '))));
    });
  }
}
