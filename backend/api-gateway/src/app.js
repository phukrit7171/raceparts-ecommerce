// backend/api-gateway/src/app.js

require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev')); // Logger for incoming requests
app.use(cookieParser()); // Use cookie parser to read JWT from cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --- NEW AUTH MIDDLEWARE ---
const attachUserToRequest = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Invalid token, but maybe it's a public route, so just continue
                return next();
            }
            // Token is valid, attach user info to the request for protected routes
            req.user = decoded; 
            next();
        });
    } else {
        next();
    }
};
app.use(attachUserToRequest); // Apply to all requests

// Health check for the gateway itself
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'API Gateway is running' });
});

// Service URLs from environment variables
const services = [
    {
        route: '/api/auth',
        target: `http://localhost:${process.env.AUTH_SERVICE_PORT || 3001}`
    },

    { 
        route: '/api/products', 
        target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 3002}` 
    },
    { 
        route: '/api/cart', 
        target: `http://localhost:${process.env.CART_SERVICE_PORT || 3003}`,
        protected: true // Example of a protected route is protected and requires authentication
    }
];

// Set up proxies for each service
sservices.forEach(({ route, target, protected: isProtected }) => {
    app.use(route, (req, res, next) => {
        // --- ROUTE PROTECTION LOGIC ---
        if (isProtected && !req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: You must be logged in.' });
        }
        next();
    }, 
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`^${route}`]: '' },
        on: {
            proxyReq: (proxyReq, req, res) => {
                // Pass user details to the downstream service in headers
                if (req.user) {
                    proxyReq.setHeader('x-user-id', req.user.id);
                    proxyReq.setHeader('x-user-email', req.user.email);
                }
                
                console.log(`[Gateway] Proxying ${req.method} ${req.originalUrl} to ${target}${proxyReq.path}`);
                if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
                    const bodyData = JSON.stringify(req.body);
                    proxyReq.setHeader('Content-Type', 'application/json');
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                }
            }
        }
    }));
});

// Start the server
const PORT = process.env.API_GATEWAY_PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log('Forwarding /api/auth to auth-service');
});