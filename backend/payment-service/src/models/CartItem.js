const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "CartItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      quantity: { type: DataTypes.INTEGER },
    },
    { tableName: "cart_items", underscored: true }
  );
