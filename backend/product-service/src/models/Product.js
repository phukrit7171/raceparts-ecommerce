const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: () => uuidv4(), unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    images: { type: DataTypes.JSON },
    specifications: { type: DataTypes.JSON },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true
  });
  return Product;
};