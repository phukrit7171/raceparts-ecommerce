const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "OrderItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { tableName: "order_items", underscored: true }
  );
