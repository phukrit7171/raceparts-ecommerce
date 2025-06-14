// database/seeders/...-create-admin-user.js
'use strict';

// THIS IS THE FIX
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // These will now correctly read from your .env file
    const email = process.env.ADMIN_EMAIL || 'admin@raceparts.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`[Seeder] Preparing to create admin user: ${email} with password: ${password}`);

    const hashedPassword = await bcrypt.hash(password, 12);

    const users = await queryInterface.sequelize.query(
      `SELECT * FROM users WHERE email = '${email}'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      await queryInterface.bulkInsert('users', [{
        uuid: uuidv4(),
        email: email,
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      }], {});
      console.log(`[Seeder] Admin user '${email}' created successfully.`);
    } else {
      console.log(`[Seeder] Admin user '${email}' already exists. Forcing password update.`);
      // If user exists, let's just update the password to be sure it's correct
      await queryInterface.sequelize.query(
        `UPDATE users SET password = '${hashedPassword}' WHERE email = '${email}'`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const email = process.env.ADMIN_EMAIL || 'admin@raceparts.com';
    await queryInterface.bulkDelete('users', { email: email }, {});
  }
};