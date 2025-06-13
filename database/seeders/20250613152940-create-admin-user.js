"use strict";
const { scrypt, randomBytes } = require("node:crypto"); // Use built-in crypto
const { promisify } = require("node:util");
const { v4: uuidv4 } = require("uuid");

const scryptAsync = promisify(scrypt);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const email = process.env.ADMIN_EMAIL || "admin@raceparts.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    // Hashing the password with crypto.scrypt
    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scryptAsync(password, salt, 64);
    const hashedPassword = `${salt}:${derivedKey.toString("hex")}`; // Store as salt:hash

    const users = await queryInterface.sequelize.query(
      `SELECT * FROM users WHERE email = '${email}'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      await queryInterface.bulkInsert(
        "users",
        [
          {
            uuid: uuidv4(),
            email: email,
            password: hashedPassword,
            first_name: "Admin",
            last_name: "User",
            role: "admin"
          },
        ],
        {}
      );
      console.log(`Admin user '${email}' created.`);
    } else {
      console.log(`Admin user '${email}' already exists. Skipping.`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const email = process.env.ADMIN_EMAIL || "admin@raceparts.com";
    await queryInterface.bulkDelete("users", { email: email }, {});
  },
};
