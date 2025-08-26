'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('request_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      method: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      ip_address: {
        type: Sequelize.STRING
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      request_body: {
        type: Sequelize.TEXT
      },
      response_status_code: {
        type: Sequelize.INTEGER
      },
      response_body: {
        type: Sequelize.TEXT
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('request_logs');
  }
};