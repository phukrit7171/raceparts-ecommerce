# RaceParts E-commerce

Online store for racing car parts and accessories.

## 🏎️ Features

- User accounts and authentication
- Browse products by category
- Shopping cart and checkout
- Order tracking
- Admin dashboard

## 🛠️ Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: SQLite (development), PostgreSQL (production)
- **Tools**: Docker, Sequelize ORM

## 📚 API Documentation

### Authentication Service

#### Register New User
- **Endpoint**: `POST /register`
- **Description**: Create a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St"
  }
  ```
- **Required Fields**: `email`, `password`, `first_name`, `last_name`
- **Response**: JWT token and user data

#### Login
- **Endpoint**: `POST /login`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: JWT token in cookie and response body

#### Logout
- **Endpoint**: `POST /logout`
- **Description**: Invalidate user session
- **Response**: Success message

#### Get Current User
- **Endpoint**: `GET /me`
- **Description**: Get current authenticated user's information
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User data

### Product Service

#### Get All Products
- **Endpoint**: `GET /`
- **Description**: Get paginated list of products with filtering and sorting
- **Query Parameters**:
  - `page` (number, default: 1) - Page number
  - `limit` (number, default: 12) - Items per page
  - `search` (string, optional) - Search term for product name/description
  - `category` (string, optional) - Filter by category slug
  - `sort` (string, default: 'createdAt') - Field to sort by
  - `order` (string, default: 'DESC') - Sort order ('ASC' or 'DESC')
- **Response**: Paginated list of products

#### Get Product by Slug
- **Endpoint**: `GET /slug/:slug`
- **Description**: Get product details by slug
- **URL Parameters**:
  - `slug` (string) - Product slug
- **Response**: Product details

#### Get All Categories
- **Endpoint**: `GET /categories`
- **Description**: Get all product categories with product counts
- **Response**: List of categories

### Cart Service

#### Get Cart
- **Endpoint**: `GET /`
- **Description**: Get current user's cart
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Cart items with product details and subtotal

#### Add Item to Cart
- **Endpoint**: `POST /`
- **Description**: Add product to cart or update quantity if already exists
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "productId": 1,
    "quantity": 2
  }
  ```
- **Response**: Updated cart item

#### Update Cart Item
- **Endpoint**: `PATCH /:itemId`
- **Description**: Update item quantity in cart
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**:
  - `itemId` (number) - Cart item ID
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response**: Updated cart item

#### Remove Item from Cart
- **Endpoint**: `DELETE /:itemId`
- **Description**: Remove item from cart
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**:
  - `itemId` (number) - Cart item ID
- **Response**: Success message

### Payment Service

#### Create Checkout Session
- **Endpoint**: `POST /create-checkout-session`
- **Description**: Create Stripe checkout session
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "origin": "http://localhost:5173"
  }
  ```
- **Response**: Stripe session ID and URL

#### Webhook (Stripe)
- **Endpoint**: `POST /webhook`
- **Description**: Handle Stripe webhook events
- **Headers**: `Stripe-Signature` (from Stripe)
- **Body**: Raw JSON from Stripe
- **Note**: Used internally by Stripe, not for direct client use

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm (v8+)
- PostgreSQL (for production)
- Stripe account (for payments)

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raceparts
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Service Ports
AUTH_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
CART_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
API_GATEWAY_PORT=3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend
   cd frontend
   npm install
   
   # Install backend services
   cd ../backend
   cd auth-service && npm install
   cd ../api-gateway && npm install
   cd ../cart-service && npm install
   cd ../payment-service && npm install
   cd ../admin-service && npm install
   ```

2. **Setup environment**
   - Copy `.env.example` to `.env` in each service
   - Update database and API keys

3. **Start development servers**
   ```bash
   # Start all services
   npm run dev:frontend
   npm run dev:backend
   ```

4. **Access the app**
   - Website: http://localhost:5173
   - API: http://localhost:3000

## 🛠️ Available Scripts

- `npm run dev:frontend` - Start frontend
- `npm run dev:backend` - Start all backend services
- `npm run build` - Build for production
- `npm test` - Run tests

## 📦 Services

### Frontend
- `frontend/` - Main Next.js application
  - Pages, components, and styles
  - API route handlers
  - Client-side state management

### Backend Services
- `backend/api-gateway/` - API Gateway
  - Routes requests to appropriate microservices
  - Handles CORS and request/response transformation
  - Load balancing and service discovery

- `backend/auth-service/` - Authentication Service
  - User registration and authentication
  - JWT token management
  - User profile management

- `backend/cart-service/` - Cart Service
  - Shopping cart operations
  - Cart item management
  - Price calculations

- `backend/payment-service/` - Payment Service
  - Stripe integration
  - Checkout session management
  - Order processing
  - Webhook handling

- `backend/admin-service/` - Admin Dashboard
  - Product management
  - Order management
  - User management
  - Analytics and reporting

### Database
- `backend/**/migrations/` - Database migrations
- `backend/**/models/` - Sequelize models
- `backend/**/seeders/` - Database seed data

## 📝 License

MIT
