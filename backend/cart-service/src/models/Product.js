const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    slug: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2) },
    images: { type: DataTypes.JSON },
}, { tableName: 'products', timestamps: false });