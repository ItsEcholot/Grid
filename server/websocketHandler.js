const minimist = require('minimist');
const uuidV4 = require('uuid/v4');
const commandHandler = require('./commandHandler');

const models = require('./models');
const User = models.User;

module.exports = {
  clientConnected: function (socket) {
    this.bindSocketCallbacks(socket);
  },
  bindSocketCallbacks: function (socket) {
    let challenges = [];

    socket.on('latencyPing', function (data) {
      socket.emit('latencyPong');
    });

    socket.on('command', function (data) {
      if(data.command && data.username && data.token)  {
        data.username = models.sequelize.fn('lower', data.username);
        User.findOne({where: {username: data.username}}).then((user) => {
          if(data.token === user.token)
            socket.emit('response', commandHandler(minimist(data.command.split(' ')), socket, user));
          else
            socket.emit('response', 'Unauthorized');
        });
      }
    });

    socket.on('requestLoginChallenge', (data) => {
      if(!data.username)
        return;

      data.username = models.sequelize.fn('lower', data.username);
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
    socket.on('login', (data) => {
      if(!data.username)
        return;

      data.username = models.sequelize.fn('lower', data.username);
      User.findOne({
        where:  {
          username: data.username
        }
      }).then((user) => {
        if(challenges[data.username] && data.challenge && challenges[data.username] === data.challenge) {
          if(user.checkAuthorizationHash(data.hash, data.challenge)) {
            const token = uuidV4();
            user.updateAttributes({
              token: token
            });
            socket.emit('authorization',  {
              success: true,
              username: user.username,
              token: token
            });
            socket.authorizedUsername = data.username;
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
    socket.on('checkUsernameAvailability', (data) => {
      if(!data.username)
        return;

      data.username = models.sequelize.fn('lower', data.username);
      User.findOne({where: {username: data.username}}).then((user) => {
        socket.emit('checkUsernameAvailabilityReply', {
          result: !user
        });
      });
    });
    socket.on('register', (data) => {
      if(!data.username || !data.passwordHash || !data.passwordSalt)  {
        socket.emit('registerReply', {
          success: false
        });
        return;
      }

      data.username = models.sequelize.fn('lower', data.username);
      User.findOrCreate({
        where: {username: data.username},
        defaults: {
          passwordHash: data.passwordHash,
          passwordSalt: data.passwordSalt,
          ip: null
        }
      }).spread((user, created) => {
        socket.emit('registerReply', {
          success: created
        });
      });
    });

    socket.on('disconnect', (data) => {
      if (socket.authorizedUsername)  {
        User.findOne({where: {username: socket.authorizedUsername}}).then((user) => {
          user.updateAttributes({
            token: ''
          });
        });
      }
    });
  }
}
