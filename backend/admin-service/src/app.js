// backend/admin-service/src/app.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const express = require("express");
const { default: AdminJS } = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSSequelize = require("@adminjs/sequelize");
const session = require("express-session");
const bcrypt = require("bcryptjs");
// DEBUG: Checking const declaration
console.log('DEBUG: AdminJSSequelize object:', typeof AdminJSSequelize, AdminJSSequelize);

// --- v6 COMPATIBILITY CHANGES START HERE ---

// 1. Explicitly import the base classes from the adapter
const { Database, Resource } = AdminJSSequelize;
console.log('DEBUG: Database and Resource imported:', { Database: typeof Database, Resource: typeof Resource });
// 2. Load the User model from the auth-service
const UserModel = require("../../auth-service/src/models/User");

// 3. Load Product and Category models from the product-service
const ProductModel = require("../../product-service/src/models/Product");
const CategoryModel = require("../../product-service/src/models/Category");

// 4. Load Order and OrderItem models from the payment-service
const OrderModel = require("../../payment-service/src/models/Order");
const OrderItemModel = require("../../payment-service/src/models/OrderItem");

// Translations configuration
const translations = {
  translation: {
    labels: {
      users: 'Users',
      products: 'Products',
      categories: 'Categories',
      orders: 'Orders',
      order_items: 'Order Items',
      'role.customer': 'Customer',
      'role.admin': 'Admin',
      'is_active.true': 'Yes',
      'is_active.false': 'No',
      'status.pending': 'Pending',
      'status.paid': 'Paid',
      'status.shipped': 'Shipped',
      'status.delivered': 'Delivered',
      'status.cancelled': 'Cancelled'
    },
    properties: {
      email: 'Email',
      id: 'ID',
      updatedAt: 'Updated At',
      createdAt: 'Created At',
      role: 'Role',
      address: 'Address',
      phone: 'Phone',
      last_name: 'Last Name',
      first_name: 'First Name',
      uuid: 'UUID',
      password: 'Password',
      name: 'Name',
      description: 'Description',
      price: 'Price',
      stock_quantity: 'Stock Quantity',
      category_id: 'Category',
      images: 'Images',
      specifications: 'Specifications',
      is_active: 'Is Active',
      slug: 'Slug',
      image_url: 'Image URL',
      total_amount: 'Total Amount',
      status: 'Status',
      stripe_payment_intent_id: 'Stripe Payment Intent ID',
      shipping_address: 'Shipping Address',
      quantity: 'Quantity'
    }
  }
};

const start = async () => {
  // We need to initialize sequelize in this service as well to pass it to the models
  const { sequelize } = require("../../auth-service/src/models");

  // Initialize each model with the sequelize instance
  const User = UserModel(sequelize);
  const Product = ProductModel(sequelize);
  const Category = CategoryModel(sequelize);
  const Order = OrderModel(sequelize);
  const OrderItem = OrderItemModel(sequelize);

  // This is the correct way to register the adapter in v6
  AdminJS.registerAdapter({
    Database,
    Resource,
    options: {
      // Add any Sequelize-specific options here
      sequelize: sequelize,
      // Enable timestamps
      timestamps: true,
      // Enable underscored option for snake_case
      underscored: true,
    }
  });

  // --- v6 COMPATIBILITY CHANGES END HERE ---

  const app = express();

  app.use(
    session({
      secret: process.env.JWT_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

  const adminJs = new AdminJS({
    resources: [
      {
        resource: User,
        options: {
          navigation: {
            name: translations.translation.labels.users,
            icon: 'User',
          },
          properties: {
            id: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false
              }
            },
            email: { 
              isTitle: true,
              isRequired: true
            },
            password: {
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true
              },
              isRequired: true
            },
            uuid: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false
              }
            },
            role: {
              availableValues: [
                { value: 'customer', label: translations.translation.labels['role.customer'] },
                { value: 'admin', label: translations.translation.labels['role.admin'] },
              ],
              isRequired: true
            },
            first_name: {
              isRequired: false,
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: true
              }
            },
            last_name: {
              isRequired: false,
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: true
              }
            },
            phone: {
              isRequired: false,
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: true
              }
            },
            address: {
              isRequired: false,
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: true
              }
            },
            createdAt: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false
              }
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false
              }
            }
          },
          listProperties: ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'createdAt'],
          id: 'users',
          actions: {
            new: {
              before: async (request) => {
                if (request.payload.password) {
                  request.payload = {
                    ...request.payload,
                    password: await bcrypt.hash(request.payload.password, 12)
                  }
                }
                return request
              }
            },
            edit: {
              before: async (request) => {
                if (request.payload.password) {
                  request.payload = {
                    ...request.payload,
                    password: await bcrypt.hash(request.payload.password, 12)
                  }
                }
                return request
              }
            }
          }
        },
      },
      {
        resource: Product,
        options: {
          navigation: {
            name: translations.translation.labels.products,
            icon: 'Package',
          },
          properties: {
            id: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false
              }
            },
            uuid: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false
              }
            },
            name: {
              isTitle: true,
              isRequired: true
            },
            slug: {
              isRequired: true
            },
            description: {
              type: 'textarea'
            },
            price: {
              isRequired: true,
              type: 'number'
            },
            stock_quantity: {
              type: 'number',
              isRequired: false
            },
            category_id: {
              reference: 'categories',
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: true
              }
            },
            images: {
              type: 'mixed',
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: true
              }
            },
            specifications: {
              type: 'mixed',
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: true
              }
            },
            is_active: {
              availableValues: [
                { value: true, label: translations.translation.labels['is_active.true'] },
                { value: false, label: translations.translation.labels['is_active.false'] },
              ],
            },
            createdAt: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false
              }
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false
              }
            }
          },
          listProperties: ['id', 'name', 'price', 'stock_quantity', 'category_id', 'is_active', 'createdAt'],
          id: 'products',
          actions: {
            new: {
              before: async (request) => {
                console.log('[AdminJS Product] Creating new product with payload:', request.payload);
                return request;
              },
              after: async (response) => {
                console.log('[AdminJS Product] Product created:', response.record?.params);
                return response;
              }
            },
            edit: {
              before: async (request) => {
                console.log('[AdminJS Product] Editing product with payload:', request.payload);
                return request;
              }
            }
          }
        },
      },
      {
        resource: Category,
        options: {
          navigation: {
            name: translations.translation.labels.categories,
            icon: 'Folder',
          },
          properties: {
            name: { isTitle: true },
          },
          listProperties: ['id', 'name', 'slug', 'createdAt'],
          id: 'categories'
        },
      },
      {
        resource: Order,
        options: {
          navigation: {
            name: translations.translation.labels.orders,
            icon: 'ShoppingCart',
          },
          properties: {
            status: {
              availableValues: [
                { value: 'pending', label: translations.translation.labels['status.pending'] },
                { value: 'paid', label: translations.translation.labels['status.paid'] },
                { value: 'shipped', label: translations.translation.labels['status.shipped'] },
                { value: 'delivered', label: translations.translation.labels['status.delivered'] },
                { value: 'cancelled', label: translations.translation.labels['status.cancelled'] },
              ],
            },
          },
          listProperties: ['id', 'total_amount', 'status', 'createdAt'],
          id: 'orders'
        },
      },
      {
        resource: OrderItem,
        options: {
          navigation: {
            name: translations.translation.labels.order_items,
            icon: 'List',
          },
          listProperties: ['id', 'quantity', 'price', 'createdAt'],
          id: 'order_items'
        },
      },
    ],
    rootPath: "/admin",
    branding: {
      companyName: "RaceParts E-commerce",
      softwareBrothers: false,
    },
    locale: {
      language: 'en',
      translations,
      i18n: {
        backend: {
          loadPath: '/admin/locales/{{lng}}/{{ns}}',
        },
        debug: true,
        initImmediate: true,
        ns: ['translation'],
        defaultNS: 'translation',
        fallbackLng: ['en'],
        interpolation: {
          escapeValue: false,
        },
      },
    },
    // Add Sequelize-specific configuration
    database: {
      client: 'sqlite3',
      connection: {
        filename: path.join(__dirname, '..', '..', '..', 'database', 'raceparts.db')
      },
      useNullAsDefault: true
    }
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      // We will handle session logic ourselves for more control
      session: session({
        secret: process.env.JWT_SECRET || "a-very-strong-fallback-secret",
        resave: false,
        saveUninitialized: false, // Only save sessions that have been modified
      }),
      authenticate: async (email, password) => {
        try {
          console.log(`[Admin Auth] Attempting to authenticate user: ${email}`);
          const user = await User.findOne({ where: { email: email } });

          if (!user) {
            console.log(`[Admin Auth] User not found: ${email}`);
            return null; // Explicitly return null for user not found
          }

          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (!isPasswordMatch) {
            console.log(`[Admin Auth] Password mismatch for user: ${email}`);
            return null; // Explicitly return null for password mismatch
          }

          if (user.role !== "admin") {
            console.log(`[Admin Auth] User is not an admin: ${email}`);
            return null; // Explicitly return null for wrong role
          }

          console.log(`[Admin Auth] Authentication successful for: ${email}`);
          // Return the full user object, AdminJS will handle it
          return user;
        } catch (error) {
          console.error("[Admin Auth] Error during authentication:", error);
          return null;
        }
      },
      cookieName: "adminjs-session", // More specific cookie name
      cookiePassword:
        "a-secure-cookie-password-that-is-at-least-32-characters-long", // Use a longer password
    },
    null, // Pass null for the router to let the buildAuthenticatedRouter create its own
    {
      // Session options passed to express-session
      resave: false,
      saveUninitialized: true,
    }
  );

  app.use(adminJs.options.rootPath, adminRouter);

  const PORT = process.env.ADMIN_SERVICE_PORT || 3005;
  app.listen(PORT, () => {
    console.log(
      `🚀 AdminJS started on http://localhost:${PORT}${adminJs.options.rootPath}`
    );
  });
};

start();
