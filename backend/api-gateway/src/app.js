// backend/api-gateway/src/app.js

require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev')); // Logger for incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
    // We will add other services here as we build them
    // { route: '/api/products', target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 3002}` },
    // { route: '/api/cart', target: `http://localhost:${process.env.CART_SERVICE_PORT || 3003}` },
];

// Set up proxies for each service
services.forEach(({ route, target }) => {
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${route}`]: '',
        },
        // THIS onProxyReq IS THE CRITICAL FIX
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[Gateway] Rewriting and proxying ${req.method} ${req.originalUrl} to ${target}${proxyReq.path}`);
                
                // For POST/PUT/PATCH requests, we need to re-stream the body.
                if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
                    const bodyData = JSON.stringify(req.body);
                    // Set the content-length header to match the new body
                    proxyReq.setHeader('Content-Type', 'application/json');
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    // Write the body to the proxy request
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