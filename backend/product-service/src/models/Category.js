const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    image_url: { type: DataTypes.STRING }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true
  });
  return Category;
};