const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, { tableName: 'users', timestamps: false });