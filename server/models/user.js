const crypto = require('crypto');

'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    passwordSalt: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    instanceMethods:  {
      checkAuthorizationHash: function (compareHash, challenge) {
        let hash = crypto.createHash('sha512');
        hash.update(this.username + challenge + this.passwordHash);
        let digestedHash = hash.digest('hex');
        if(compareHash === digestedHash)  {
          return true;
        }
      }
    }
  });
  return User;
};
