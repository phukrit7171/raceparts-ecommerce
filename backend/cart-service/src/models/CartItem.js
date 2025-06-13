const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, { tableName: 'cart_items', underscored: true });