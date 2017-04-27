const minimist = require('minimist');
const uuidV4 = require('uuid/v4');
const commandHandler = require('./commandHandler');

const models = require('./models');
const User = models.User;

module.exports = {
  clientConnected: function (socket) {
    this.bindSocketCallbacks(socket);
    //socket.emit('response', commandHandler(minimist('motd'.split(' ')), socket));
  },
  bindSocketCallbacks: function (socket) {
    let challenges = [];

    socket.on('latencyPing', function (data) {
      socket.emit('latencyPong');
    });

    socket.on('command', function (data) {
      socket.emit('response', commandHandler(minimist(data.split(' ')), socket));
    });

    socket.on('requestLoginChallenge', function (data) {
      if(!data.username)
        return;

      User.findOne({
        where: {
          username: data.username
        }
      }).then((user) => {
        if(!user) {
          socket.emit('authorization',  {
            success: false,
            error: `User ${data.username} not in Grid backbone database`
          });
          return;
        }

        challenges[data.username] = uuidV4();
        setTimeout(() =>  {
          challenges.splice(data.username, 1);
        }, 30000);
        socket.emit('loginChallenge', {
          challenge: challenges[data.username],
          salt: user.passwordSalt
        });
      });
    });
    socket.on('login', function (data) {
      if(!data.username)
        return;

      User.findOne({
        where:  {
          username: data.username
        }
      }).then((user) => {
        if(challenges[data.username] && data.challenge && challenges[data.username] === data.challenge) {
          if(user.checkAuthorizationHash(data.hash, data.challenge)) {
            user.updateAttributes({
              token: uuidV4()
            });
            socket.emit('authorization',  {
              success: true,
              username: user.username,
              token: user.token
            });
            challenges.splice(data.username, 1);
          }
          else {
            socket.emit('authorization',  {
              success: false,
              error: 'Wrong password'
            });
          }
        }
        else {
          socket.emit('authorization',  {
            success: false,
            error: 'Challenge failed or missing'
          });
        }
      });
    });
  }
}
