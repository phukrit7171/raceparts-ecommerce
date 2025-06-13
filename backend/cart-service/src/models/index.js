const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', '..', '..', '..', 'database', 'config.js'))[env];

const sequelize = new Sequelize(config);
const db = {};

// Load models
fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Define associations
db.CartItem.belongsTo(db.User, { foreignKey: 'user_id' });
db.User.hasMany(db.CartItem, { foreignKey: 'user_id' });

db.CartItem.belongsTo(db.Product, { foreignKey: 'product_id' });
db.Product.hasMany(db.CartItem, { foreignKey: 'product_id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;