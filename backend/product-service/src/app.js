// backend/product-service/src/app.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const productController = require('./controllers/productController');

const app = express();

// Middleware
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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