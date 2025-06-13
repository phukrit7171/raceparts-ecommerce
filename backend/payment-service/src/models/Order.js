const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
module.exports = (sequelize) =>
  sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        unique: true,
        allowNull: false,
      },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "paid",
          "shipped",
          "delivered",
          "cancelled"
        ),
        defaultValue: "pending",
      },
      stripe_payment_intent_id: { type: DataTypes.STRING },
      shipping_address: { type: DataTypes.JSON },
    },
    { tableName: "orders", underscored: true }
  );
