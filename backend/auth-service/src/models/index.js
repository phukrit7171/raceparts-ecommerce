// backend/auth-service/src/models/index.js

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', '..', '..' ,'..','database','config.json'))[env]

const sequelize = new Sequelize({
  ...config,
  storage: path.join(__dirname, '..', '..', '..', 'database', 'raceparts.db') // Correct path to DB
});

const db = {};

// Read all model files from the current directory
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Associate models if needed
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;