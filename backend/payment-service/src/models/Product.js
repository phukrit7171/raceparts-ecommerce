// backend/payment-service/src/models/Product.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // THIS IS THE MISSING PIECE
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
    }
}, {
    tableName: 'products',
    timestamps: false // We don't manage timestamps in this service's model
});