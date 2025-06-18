// backend/auth-service/src/app.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is in whitelist or is a localhost URL
        if (origin.startsWith('http://localhost') || 
            origin.startsWith('http://127.0.0.1') ||
            origin.startsWith('http://172.20.128.1')) {
            return callback(null, true);
        }
        
        logger.warn('Not allowed by CORS:', { origin });
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-XSRF-TOKEN',
        'x-access-token',
        'credentials',
        'withCredentials'
    ],
    exposedHeaders: [
        'set-cookie',
        'access-control-allow-credentials',
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle CORS headers for all responses
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Check if the origin is allowed
    if (origin) {
        const isAllowed = origin.startsWith('http://localhost') || 
                        origin.startsWith('http://127.0.0.1') ||
                        origin.startsWith('http://172.20.128.1');
        
        if (isAllowed) {
            // Set the Access-Control-Allow-Origin header to the exact origin that made the request
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Vary', 'Origin');
            
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
                return res.status(200).end();
            }
            
            return next();
        }
    }
    
    // If we get here, either no origin was provided or it's not allowed
    if (req.method === 'OPTIONS') {
        // Still respond to OPTIONS with 200 OK, but without CORS headers
        return res.status(200).end();
    }
    
    next();
});

// Import routes
const authRoutes = require('./routes/auth');

// Use routes - mount at root since the gateway handles the /api/auth prefix
app.use('/', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', { error: err });
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

// Start server
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Test database connection and start server
sequelize.authenticate()
    .then(() => {
        logger.info('Database connection has been established successfully.');
        app.listen(PORT, () => {
            logger.info(`🚀 Auth service running on port ${PORT}`);
        });
    })
    .catch(err => {
        logger.error('Unable to connect to the database:', { error: err });
        process.exit(1);
    });

module.exports = app;