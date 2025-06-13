// database/config.js
const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database', 'raceparts.db'), // Absolute path
    logging: console.log
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database', 'raceparts.db'), // Absolute path
    logging: false
  }
};