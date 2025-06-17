// backend/api-gateway/src/app.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
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
    origin: ['http://localhost:5173', 'http://localhost:3000'],
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
    },
    {
        route: '/api/payment',
        target: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 3004}`,
        protected: true // Protected because creating a payment intent requires a logged-in user
    }
];

// Set up proxies for each service
services.forEach(({ route, target, protected: isProtected }) => {

    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: { [`^${route}`]: '' },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[Gateway] -> PROXYING ${req.method} ${req.originalUrl} to ${target}${proxyReq.path}`);

                // Add user headers if the user object exists on the request
                if (req.user) {
                    proxyReq.setHeader('x-user-id', req.user.id);
                    proxyReq.setHeader('x-user-email', req.user.email || '');
                }

                // The crucial part: handle requests with a body
                if (req.body) {
                    const bodyData = JSON.stringify(req.body);
                    // You must set the Content-Type and Content-Length headers
                    proxyReq.setHeader('Content-Type', 'application/json');
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    // And then write the data to the proxy request stream
                    proxyReq.write(bodyData);
                }
            },
            // Add error handling for robustness
            error: (err, req, res) => {
                console.error('[Gateway] Proxy error:', err);
                res.status(500).send('Proxy Error');
            }
        }
    };

    const proxy = createProxyMiddleware(proxyOptions);

    if (isProtected) {
        // For protected routes, run the auth check middleware first
        app.use(route, (req, res, next) => {
            if (!req.user) {
                console.log(`[Gateway] -> BLOCKED Unauthenticated request to protected route ${req.originalUrl}`);
                return res.status(401).json({ success: false, message: 'Unauthorized: You must be logged in.' });
            }
            next();
        }, proxy);
    } else {
        // For public routes, just use the proxy
        app.use(route, proxy);
    }
});

// Start the server
const PORT = process.env.API_GATEWAY_PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log('Forwarding /api/auth to auth-service');
});