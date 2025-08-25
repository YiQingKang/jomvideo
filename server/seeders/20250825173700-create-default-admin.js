'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('12341234', 10);
    const adminId = uuidv4();
    await queryInterface.bulkInsert('users', [{
      id: adminId,
      name: 'Admin User',
      email: 'admin@appbaystudio.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      credits: 0,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@appbaystudio.com' }, {});
  }
};