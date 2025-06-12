# 🏁 RaceParts E-commerce Platform

A modern, full-stack automotive accessories e-commerce platform built with microservices architecture and containerized deployment.

## 🚀 Features

### 🛍️ Customer Features
- **Product Catalog**: Browse automotive parts by categories
- **Advanced Search**: Search products by name, description, and specifications
- **Shopping Cart**: Add/remove items with real-time updates
- **Secure Checkout**: Stripe payment integration with order tracking
- **User Authentication**: JWT-based login/registration system
- **Responsive Design**: Mobile-first Bootstrap 5 interface
- **Order History**: Track past purchases and order status

### 👨‍💼 Admin Features
- **Product Management**: CRUD operations for products and categories
- **Order Management**: View and update order statuses
- **User Management**: Manage customer accounts
- **Inventory Tracking**: Monitor stock levels
- **Sales Analytics**: Dashboard with sales insights
- **Bulk Operations**: Mass product updates and imports

## 🏗️ Architecture

### Tech Stack
- **Frontend**: SvelteKit + Bootstrap 5 + Start Bootstrap Shop Template
- **Backend**: Node.js + Express.js (Microservices)
- **Database**: SQLite + Sequelize ORM
- **Authentication**: JWT + HTTP-only Cookies
- **Payment**: Stripe Payment Gateway
- **Admin Panel**: AdminJS
- **Containerization**: Docker + Docker Compose
- **API**: RESTful with Axios

### Microservices Architecture
```
Frontend (SvelteKit) → API Gateway → Microservices
                                   ├── Auth Service
                                   ├── Product Service
                                   ├── Cart Service
                                   ├── Payment Service
                                   └── Admin Service
```

## 📁 Project Structure

```
raceparts-ecommerce/
├── 📄 docker-compose.yml          # Container orchestration
├── 📄 .env.example               # Environment variables template
├── 📄 README.md                  # This file
├── 📁 frontend/                  # SvelteKit application
│   ├── 📁 src/
│   │   ├── 📄 app.html
│   │   ├── 📁 routes/            # SvelteKit routes
│   │   │   ├── 📄 +layout.svelte
│   │   │   ├── 📄 +page.svelte   # Homepage
│   │   │   ├── 📁 products/      # Product pages
│   │   │   ├── 📁 cart/          # Shopping cart
│   │   │   ├── 📁 checkout/      # Checkout process
│   │   │   ├── 📁 auth/          # Authentication
│   │   │   └── 📁 admin/         # Admin routes
│   │   ├── 📁 lib/
│   │   │   ├── 📁 components/    # Reusable components
│   │   │   ├── 📁 stores/        # Svelte stores
│   │   │   ├── 📁 utils/         # Utility functions
│   │   │   └── 📄 api.js         # API client
│   │   └── 📁 static/            # Static assets
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   └── 📄 Dockerfile
├── 📁 backend/                   # Microservices
│   ├── 📁 api-gateway/          # Main API Gateway
│   │   ├── 📁 src/
│   │   │   ├── 📄 app.js
│   │   │   ├── 📁 middleware/
│   │   │   └── 📁 routes/
│   │   ├── 📄 package.json
│   │   └── 📄 Dockerfile
│   ├── 📁 auth-service/         # Authentication
│   │   ├── 📁 src/
│   │   │   ├── 📄 app.js
│   │   │   ├── 📁 models/
│   │   │   ├── 📁 controllers/
│   │   │   └── 📁 middleware/
│   │   ├── 📄 package.json
│   │   └── 📄 Dockerfile
│   ├── 📁 product-service/      # Product management
│   ├── 📁 cart-service/         # Shopping cart
│   ├── 📁 payment-service/      # Stripe integration
│   └── 📁 admin-service/        # AdminJS panel
└── 📁 database/
    ├── 📁 migrations/           # Database migrations
    ├── 📁 seeders/             # Sample data
    └── 📄 config.json          # Database config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone Repository
```bash
git clone https://github.com/phukrit 7171/raceparts-ecommerce.git
cd raceparts-ecommerce
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configurations
nano .env
```

### 3. Environment Variables
```env
# Database
DATABASE_URL=sqlite:./database/raceparts.db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Stripe Payment Gateway
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Service Ports
AUTH_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
CART_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
ADMIN_SERVICE_PORT=3005
API_GATEWAY_PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Admin Credentials
ADMIN_EMAIL=admin@raceparts.com
ADMIN_PASSWORD=admin123
```

### 4. Docker Development
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 5. Manual Development
```bash
# Install all dependencies
npm run install-all

# Setup database
npm run db:migrate
npm run db:seed

# Start all services
npm run dev

# Or start services individually
npm run dev:gateway    # API Gateway (Port 3000)
npm run dev:auth      # Auth Service (Port 3001)
npm run dev:products  # Product Service (Port 3002)
npm run dev:cart      # Cart Service (Port 3003)
npm run dev:payment   # Payment Service (Port 3004)
npm run dev:admin     # Admin Service (Port 3005)
npm run dev:frontend  # Frontend (Port 5173)
```

## 📱 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main e-commerce website |
| **API Gateway** | http://localhost:3000 | API endpoints |
| **Admin Panel** | http://localhost:3005/admin | AdminJS dashboard |
| **Auth Service** | http://localhost:3001 | Authentication API |
| **Product Service** | http://localhost:3002 | Product management API |
| **Cart Service** | http://localhost:3003 | Shopping cart API |
| **Payment Service** | http://localhost:3004 | Payment processing API |

## 🔧 Development Commands

```bash
# Package Management
npm run install-all          # Install all dependencies
npm run clean               # Clean node_modules and locks

# Database
npm run db:migrate          # Run migrations
npm run db:seed            # Seed sample data
npm run db:reset           # Reset database

# Development
npm run dev                # Start all services
npm run dev:frontend       # Start frontend only
npm run dev:backend        # Start backend services only

# Testing
npm run test               # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests

# Production
npm run build             # Build all services
npm run start             # Start production build
npm run prod              # Production with PM2

# Docker
npm run docker:build      # Build Docker images
npm run docker:up         # Start containers
npm run docker:down       # Stop containers
npm run docker:logs       # View logs
```

## 🔒 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** with bcrypt
- **Input Validation** and sanitization
- **SQL Injection** protection via Sequelize ORM
- **XSS Protection** with Content Security Policy
- **CSRF Protection** with CSRF tokens
- **Rate Limiting** to prevent abuse
- **HTTPS Enforcement** in production
- **Environment Variables** for sensitive data

## 💳 Payment Integration

### Stripe Setup
1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard
3. Add keys to `.env` file
4. Configure webhooks for order updates

### Supported Payment Methods
- Credit/Debit Cards (Visa, MasterCard, American Express)
- Digital Wallets (Apple Pay, Google Pay)
- Bank Transfers (ACH, SEPA)

## 📊 Database Schema

### Core Tables
- **users**: Customer and admin accounts
- **categories**: Product categories
- **products**: Product catalog
- **cart_items**: Shopping cart contents
- **orders**: Purchase orders
- **order_items**: Order line items

### Key Relationships
- Users have many cart items and orders
- Products belong to categories
- Orders contain multiple order items
- Cart items reference users and products

## 🛡️ Admin Panel

Access the admin panel at `http://localhost:3005/admin`

**Default Admin Credentials:**
- Email: `admin@raceparts.com`
- Password: `admin123`

### Admin Features
- **Dashboard**: Sales overview and analytics
- **Products**: Add, edit, delete products
- **Categories**: Manage product categories
- **Orders**: View and update order status
- **Users**: Manage customer accounts
- **Reports**: Sales and inventory reports

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run specific service tests
npm run test:auth
npm run test:products
npm run test:cart
npm run test:payment
```

### Integration Tests
```bash
# API integration tests
npm run test:integration

# Database tests
npm run test:db
```

### End-to-End Tests
```bash
# Full user journey tests
npm run test:e2e

# Specific flow tests
npm run test:checkout
npm run test:auth-flow
```

## 🚀 Deployment

### Production Environment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale product-service=3
```

### Environment Setup
1. Set production environment variables
2. Configure SSL certificates
3. Setup reverse proxy (Nginx)
4. Configure monitoring and logging
5. Setup backup procedures

## 📈 Performance Optimization

- **Database Indexing** on frequently queried fields
- **Query Optimization** with Sequelize includes
- **Caching** with Redis for sessions and cart data
- **Image Optimization** with WebP format
- **CDN Integration** for static assets
- **Bundle Splitting** for faster frontend loading
- **API Rate Limiting** to prevent overload

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check database file permissions
ls -la database/
# Recreate database
npm run db:reset
```

**Port Already in Use**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Docker Issues**
```bash
# Clean Docker cache
docker system prune -a
# Rebuild containers
docker-compose up --build --force-recreate
```

**Stripe Webhook Issues**
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3004/webhook
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Submit GitHub issues for bugs and feature requests
- **Community**: Join our Discord server for discussions
- **Email**: support@raceparts.com

## 🙏 Acknowledgments

- **Start Bootstrap** for the Shop homepage template
- **Stripe** for payment processing
- **AdminJS** for the admin interface
- **SvelteKit** community for the excellent framework
- **Docker** for containerization

---

## 📸 Screenshots

### Homepage
![Homepage](docs/screenshots/homepage.png)

### Product Catalog
![Products](docs/screenshots/products.png)

### Shopping Cart
![Cart](docs/screenshots/cart.png)

### Checkout Process
![Checkout](docs/screenshots/checkout.png)

### Admin Panel
![Admin](docs/screenshots/admin.png)

---

**Built with ❤️ for the automotive community**
