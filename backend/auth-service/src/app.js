// backend/auth-service/src/app.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const authController = require('./controllers/authController');

const app = express();

// 1) GLOBAL MIDDLEWARE
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
    max: 100, // 100 requests from the same IP
    windowMs: 60 * 60 * 1000, // in 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);


// 2) ROUTES
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);
app.get('/me', authController.protect, authController.getMe);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// 3) DATABASE CONNECTION & SERVER START
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connection has been established successfully.');
        app.listen(PORT, () => {
            console.log(`🚀 Auth service running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Unable to connect to the database:', err);
    });