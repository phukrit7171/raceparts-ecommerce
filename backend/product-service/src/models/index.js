const { Sequelize, Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', '..', '..', 'database', 'config.js'))[env];

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
db.Category.hasMany(db.Product, { foreignKey: 'category_id', as: 'products' });
db.Product.belongsTo(db.Category, { foreignKey: 'category_id', as: 'category' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Op; // Export the Op object for complex queries (like 'search')

module.exports = db;