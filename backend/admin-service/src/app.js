// backend/admin-service/src/app.js
require('dotenv').config({ path: '../../.env' });
const express = require('express');
const { default: AdminJS } = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const { sequelize } = require('../../auth-service/src/models'); // We reuse the auth service's model loader
const { User, Product, Category, Order, OrderItem } = sequelize.models;

AdminJS.registerAdapter({
    Adapter: AdminJSSequelize,
    Database: sequelize
});

const start = async () => {
    const app = express();

    // Session middleware for AdminJS authentication
    app.use(session({
        secret: process.env.JWT_SECRET, // Reuse the JWT secret for session signing
        resave: false,
        saveUninitialized: true,
    }));

    const adminJs = new AdminJS({
        // List all the models we want to manage
        resources: [
            { resource: User, options: { /* User options here */ } },
            { resource: Product, options: { /* Product options here */ } },
            { resource: Category, options: { /* Category options here */ } },
            { resource: Order, options: { /* Order options here */ } },
            { resource: OrderItem, options: { /* OrderItem options here */ } },
        ],
        rootPath: '/admin', // The path to the admin panel
        branding: {
            companyName: 'RaceParts E-commerce',
            softwareBrothers: false, // Hide AdminJS branding
        },
    });

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
        // Authentication logic for the admin panel
        authenticate: async (email, password) => {
            const user = await User.findOne({ where: { email } });
            if (user) {
                const matched = await bcrypt.compare(password, user.password);
                if (matched && user.role === 'admin') {
                    return user.toJSON(); // Return user object (without password) on success
                }
            }
            return false;
        },
        cookiePassword: 'a-secure-cookie-password-change-this', // A separate password for the session cookie
    });

    app.use(adminJs.options.rootPath, adminRouter);

    const PORT = process.env.ADMIN_SERVICE_PORT || 3005;
    app.listen(PORT, () => {
        console.log(`🚀 AdminJS started on http://localhost:${PORT}${adminJs.options.rootPath}`);
    });
};

start();