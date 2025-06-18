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

// CORS Configuration
const whitelist = [
    'http://localhost:5173',
    'http://localhost:5174', // dev fallback when default port is busy
    'http://localhost:5175', // dev fallback when default port is busy
    'http://172.20.128.1:5173' // Docker container IP address
];
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is in whitelist or is a localhost URL
        if (whitelist.includes(origin) || 
            origin.startsWith('http://localhost') || 
            origin.startsWith('http://172.20.128.1')) {
            return callback(null, true);
        }
        
        console.log('Not allowed by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // This is required for cookies/authorization headers with credentials
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
        'access-control-allow-headers',
        'access-control-allow-origin',
        'access-control-allow-methods'
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Handle CORS headers for all responses
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Check if the origin is allowed
    if (origin) {
        const isAllowed = whitelist.includes(origin) || 
                        origin.startsWith('http://localhost') || 
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
        target: `http://localhost:${process.env.AUTH_SERVICE_PORT || 3001}`,
        protected: false // Auth routes are public
    },
    {
        route: '/api/products',
        target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 3002}`,
        protected: false,
        pathRewrite: {
            '^/api/products/categories': '/categories',
            '^/api/products/slug/([^/]+)$': '/products/slug/$1',
            '^/api/products/(?!categories|slug)': '/products/$1',
            '^/api/products$': ''
        }
    },
    {
        route: '/api/cart',
        target: `http://localhost:${process.env.CART_SERVICE_PORT || 3003}`,
        protected: true // Cart operations require authentication
    },
    {
        route: '/api/payment',
        target: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 3004}`,
        protected: true // Protected because creating a payment intent requires a logged-in user
    }
];

// Set up proxies for each service
services.forEach(({ route, target, protected: isProtected, pathRewrite }) => {

    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: pathRewrite || { [`^${route}`]: '' },
        on: {
            proxyRes: (proxyRes, req, res) => {
                const origin = req.headers.origin;
                if (origin) {
                    proxyRes.headers['Access-Control-Allow-Origin'] = origin;
                    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
                    proxyRes.headers['Vary'] = 'Origin';
                    
                    // Ensure cookies are properly set
                    if (proxyRes.headers['set-cookie']) {
                        const cookies = Array.isArray(proxyRes.headers['set-cookie']) 
                            ? proxyRes.headers['set-cookie'] 
                            : [proxyRes.headers['set-cookie']];
                            
                        proxyRes.headers['set-cookie'] = cookies.map(cookie => {
                            return cookie
                                .split(';')
                                .filter(v => v.trim().toLowerCase() !== 'secure' && !v.trim().toLowerCase().startsWith('samesite='))
                                .join(';')
                                .concat('; SameSite=None');
                        });
                    }
                }
            },
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