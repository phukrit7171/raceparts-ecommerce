# RaceParts E-commerce Platform

## Project Overview
RaceParts is a microservices-based e-commerce platform specialized in automotive parts. The system consists of multiple backend services:

- **Auth Service** (3001): User authentication and management
- **Product Service** (3002): Product catalog and category management
- **Cart Service** (3003): Shopping cart functionality (including PATCH method for quantity updates)
- **Payment Service** (3004): Payment processing and order management
- **Admin Service** (3005): Admin dashboard for managing all entities
- **API Gateway** (3000): Central entry point for all API requests

## API Documentation
All endpoints are accessible through the API Gateway at:
```
http://localhost:3000/api
```

### Authentication
Protected routes require JWT authentication via:
- **Authorization Header:** `Bearer <token>`
- **Cookie:** `jwt=<token>`

### Service Endpoints

#### 🔐 Auth Service
```
POST /auth/register
POST /auth/login
POST /auth/logout
GET /auth/me
```

#### 🛍️ Product Service
```
GET /products
GET /products/:uuid
GET /products/slug/:slug
GET /products/category/:slug
POST /products/search
```

#### 🛒 Cart Service
```
GET /cart - Retrieve user's cart
POST /cart - Add item to cart
PATCH /cart/:itemId - Update item quantity
DELETE /cart/:itemId - Remove item from cart
```

#### 💰 Payment Service
```
POST /payment/create-checkout-session - Create Stripe checkout session
POST /payment/webhook - Stripe webhook endpoint (raw JSON body required)
```

#### 📊 Admin Service
Admin dashboard available at:
```
http://localhost:3005/admin
```
Provides UI for managing:
- Users
- Products
- Categories
- Orders
- Order items

## Development Setup
Start all services:
```bash
cd backend/auth-service && npm run dev
cd backend/product-service && npm run dev
cd backend/cart-service && npm run dev
cd backend/payment-service && npm run dev
cd backend/admin-service && npm run dev
cd backend/api-gateway && npm run dev
```

Frontend development:
```bash
cd frontend
npm run dev
```

## Health Check
- API Gateway: `http://localhost:3000/health`

## Architecture
- Central API Gateway handles CORS, authentication, and routing
- Independent services for each domain (auth, products, cart, payments, admin)
- Shared database models between services (Admin Service accesses models from other services)
- JWT-based authentication across services
