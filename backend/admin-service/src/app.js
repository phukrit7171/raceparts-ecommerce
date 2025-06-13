// backend/admin-service/src/app.js
require('dotenv').config({ path: '../../.env' });
const express = require('express');
const { default: AdminJS } = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// --- v6 COMPATIBILITY CHANGES START HERE ---

// 1. Explicitly import the base classes from the adapter
const { Database, Resource } = AdminJSSequelize;

// 2. Load the User model from the auth-service
const UserModel = require('../../auth-service/src/models/User');

// 3. Load Product and Category models from the product-service
const ProductModel = require('../../product-service/src/models/Product');
const CategoryModel = require('../../product-service/src/models/Category');

// 4. Load Order and OrderItem models from the payment-service
const OrderModel = require('../../payment-service/src/models/Order');
const OrderItemModel = require('../../payment-service/src/models/OrderItem');

const start = async () => {
    // We need to initialize sequelize in this service as well to pass it to the models
    const { sequelize } = require('../../auth-service/src/models');
    
    // Initialize each model with the sequelize instance
    const User = UserModel(sequelize);
    const Product = ProductModel(sequelize);
    const Category = CategoryModel(sequelize);
    const Order = OrderModel(sequelize);
    const OrderItem = OrderItemModel(sequelize);

    // This is the correct way to register the adapter in v6
    AdminJS.registerAdapter({ Database, Resource });

    // --- v6 COMPATIBILITY CHANGES END HERE ---

    const app = express();

    app.use(session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: true,
    }));

    const adminJs = new AdminJS({
        // Pass the initialized models directly
        resources: [
            { resource: User, options: { /* User options */ } },
            { resource: Product, options: { /* Product options */ } },
            { resource: Category, options: { /* Category options */ } },
            { resource: Order, options: { /* Order options */ } },
            { resource: OrderItem, options: { /* OrderItem options */ } },
        ],
        rootPath: '/admin',
        branding: {
            companyName: 'RaceParts E-commerce',
            softwareBrothers: false,
        },
    });

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
        authenticate: async (email, password) => {
            const user = await User.findOne({ where: { email } });
            if (user) {
                const matched = await bcrypt.compare(password, user.password);
                if (matched && user.role === 'admin') {
                    // For v6, you might need to return the plain object
                    return Promise.resolve(user.toJSON());
                }
            }
            return false;
        },
        cookiePassword: 'a-secure-cookie-password-change-this',
    });

    app.use(adminJs.options.rootPath, adminRouter);

    const PORT = process.env.ADMIN_SERVICE_PORT || 3005;
    app.listen(PORT, () => {
        console.log(`🚀 AdminJS started on http://localhost:${PORT}${adminJs.options.rootPath}`);
    });
};

start();