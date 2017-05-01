const crypto = require('crypto');

'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    passwordSalt: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    indexes:  [
      {
        unique: true,
        name: 'users_username',
        fields: [sequelize.fn('lower', sequelize.col('username'))]
      }
    ],
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      ipToString: (ip) => {
        return  ((ip >> 24)  & 0xFF) + "." +
                ((ip >> 16)  & 0xFF) + "." +
                ((ip >> 8)   & 0xFF) + "." +
                (ip          & 0xFF);
      },
      stringToIP: (string) => {
        let stringArr = string.split('.');
        let num = 0;
        for(let i=0; i<stringArr.length; i++) {
          let power = 3-i;
          num += ((parseInt(stringArr[i])%256 * Math.pow(256,power)));
        }
        return num;
      }
    },
    instanceMethods:  {
      checkAuthorizationHash: function(compareHash, challenge)  {
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
