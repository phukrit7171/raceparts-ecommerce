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
    'http://172.20.128.1:5173', // Docker container IP address
    'http://localhost:3000', // Next.js default port
    'http://127.0.0.1:3000', // Next.js alternative localhost
    'http://localhost:3001', // Auth service
    'http://127.0.0.1:3001'  // Auth service alternative localhost
];
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is in whitelist or is a localhost URL
        if (whitelist.includes(origin) || 
            origin.startsWith('http://localhost') || 
            origin.startsWith('http://127.0.0.1') ||
            origin.startsWith('http://172.20.128.1')) {
            return callback(null, true);
        }
        
        console.log('Not allowed by CORS:', origin);
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
app.use(helmet());
app.use(morgan('dev')); // Logger for incoming requests
app.use(cookieParser()); // Use cookie parser to read JWT from cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --- NEW AUTH MIDDLEWARE ---
const attachUserToRequest = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Token is valid, attach user info to the request for protected routes
            req.user = decoded;
        } catch (err) {
            // Invalid token, clear the cookie
            res.clearCookie('jwt');
        }
    }
    next();
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
        timeout: 5000, // 5 second timeout
        proxyTimeout: 5000,
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
                            // Parse the cookie string
                            const [cookieName, ...parts] = cookie.split(';');
                            const cookieParts = parts.map(part => part.trim());
                            
                            // Remove any existing SameSite and Secure attributes
                            const filteredParts = cookieParts.filter(part => 
                                !part.toLowerCase().startsWith('samesite=') && 
                                !part.toLowerCase().startsWith('secure')
                            );
                            
                            // Add SameSite=None and Secure for production, or SameSite=Lax for development
                            const isProduction = process.env.NODE_ENV === 'production';
                            const sameSite = isProduction ? 'None' : 'Lax';
                            const secure = isProduction ? 'Secure' : '';
                            
                            // Reconstruct the cookie string
                            return `${cookieName}; ${filteredParts.join('; ')}; SameSite=${sameSite}${secure ? '; ' + secure : ''}`;
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
                    proxyReq.setHeader('x-user-role', req.user.role || '');
                }

                // Forward the original origin header
                if (req.headers.origin) {
                    proxyReq.setHeader('Origin', req.headers.origin);
                }

                // Handle request body
                if (req.body) {
                    const bodyData = JSON.stringify(req.body);
                    proxyReq.setHeader('Content-Type', 'application/json');
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                }
            },
            error: (err, req, res) => {
                console.error('[Gateway] Proxy error:', err);
                res.status(500).json({ 
                    success: false,
                    message: 'Internal server error',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
        }
    };

    // Add authentication check for protected routes
    if (isProtected) {
        app.use(route, (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            next();
        });
    }

    app.use(route, createProxyMiddleware(proxyOptions));
});

// Start the server
const PORT = process.env.API_GATEWAY_PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log('Forwarding /api/auth to auth-service');
});