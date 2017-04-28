'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ip: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      passwordHash:  {
        allowNull: false,
        type: Sequelize.STRING
      },
      passwordSalt:  {
        allowNull: false,
        type: Sequelize.STRING
      },
      token:  {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};
