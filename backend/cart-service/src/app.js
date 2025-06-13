// backend/cart-service/src/app.js
require('dotenv').config({ path: '../../.env' });
const express = require('express');
const { sequelize } = require('./models');
const cartController = require('./controllers/cartController');
const { extractUser } = require('./middleware/auth');

const app = express();
app.use(express.json());

// Apply user extraction middleware to all routes
app.use(extractUser);

// Routes
app.get('/', cartController.getCart);
app.post('/', cartController.addItem);
app.put('/:itemId', cartController.updateItem);
app.delete('/:itemId', cartController.removeItem);

// Health check (does not need user extraction)
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

// DB Connection and Server Start
const PORT = process.env.CART_SERVICE_PORT || 3003;
sequelize.authenticate()
    .then(() => {
        console.log('✅ Cart service database connection established.');
        app.listen(PORT, () => {
            console.log(`🚀 Cart service running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Unable to connect to the cart service database:', err);
    });