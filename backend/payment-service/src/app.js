// backend/payment-service/src/app.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const express = require('express');
const { sequelize } = require('./models');
const paymentController = require('./controllers/paymentController');
const { extractUser } = require('./middleware/auth');

const app = express();

// The webhook route must be registered BEFORE express.json()
// to receive the raw body needed for signature verification.
app.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Protected routes
app.post('/create-checkout-session', extractUser, paymentController.createCheckoutSession);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

// DB Connection and Server Start
const PORT = process.env.PAYMENT_SERVICE_PORT || 3004;
sequelize.authenticate()
    .then(() => {
        console.log('✅ Payment service database connection established.');
        app.listen(PORT, () => {
            console.log(`🚀 Payment service running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Unable to connect to the payment service database:', err);
    });