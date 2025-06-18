const { Sequelize } = require('sequelize');
const config = require('./test.config')[process.env.NODE_ENV || 'development'];

// Create a new Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    storage: config.storage,
    logging: config.logging,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
