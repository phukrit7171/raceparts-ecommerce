// backend/product-service/src/app.js
require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const productController = require('./controllers/productController');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get('/', productController.getAllProducts);
app.get('/slug/:slug', productController.getProductBySlug);
app.get('/categories', productController.getAllCategories);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

// DB Connection and Server Start
const PORT = process.env.PRODUCT_SERVICE_PORT || 3002;
sequelize.authenticate()
    .then(() => {
        console.log('✅ Product service database connection established.');
        app.listen(PORT, () => {
            console.log(`🚀 Product service running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Unable to connect to the product service database:', err);
    });