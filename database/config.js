// database/config.js
const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    // This now creates the path relative to THIS FILE's location, which is always correct.
    storage: path.join(__dirname, 'raceparts.db'),
    logging: console.log
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'raceparts.db'),
    logging: false
  }
};