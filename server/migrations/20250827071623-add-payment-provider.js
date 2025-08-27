'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_payments_provider ADD VALUE 'gkash';
    `)
  },

  async down (queryInterface, Sequelize) {
  }
};
