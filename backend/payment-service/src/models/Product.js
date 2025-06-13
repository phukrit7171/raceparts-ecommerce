const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      price: { type: DataTypes.DECIMAL(10, 2) },
      stock_quantity: { type: DataTypes.INTEGER },
    },
    { tableName: "products", timestamps: false }
  );
