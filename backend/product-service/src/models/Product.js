const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: () => {
        const uuid = uuidv4();
        console.log(`[Product Model] Generated UUID: ${uuid}`);
        return uuid;
      },
      unique: true,
      allowNull: false
    },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    images: { type: DataTypes.JSON },
    specifications: { type: DataTypes.JSON },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (product, options) => {
        console.log(`[Product Model] Before create hook - UUID: ${product.uuid}`);
        if (!product.uuid) {
          product.uuid = uuidv4();
          console.log(`[Product Model] Generated UUID in hook: ${product.uuid}`);
        }
      }
    }
  });
  return Product;
};