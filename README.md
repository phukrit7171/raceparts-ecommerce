# Raceparts E-commerce

## Project Overview
A full-stack e-commerce application for racing car parts built with a microservices architecture. Includes product catalog, shopping cart, user authentication, payment processing, and admin functionality.

## Technology Stack
- **Frontend**: Next.js 13 (TypeScript)
- **Backend Services**: 
  - API Gateway
  - Authentication Service
  - Product Service
  - Cart Service
  - Payment Service
  - Admin Service
- **Database**: Sequelize ORM with migrations and seeders
- **Infrastructure**: Microservices architecture

## Prerequisites
- Node.js v22+
- npm v9+
- SQLite
- Stripe account (for payments)

## Setup Instructions

### 1. Clone repository
```bash
git clone https://github.com/your-username/raceparts-ecommerce.git
cd raceparts-ecommerce
```

### 2. Install dependencies
```bash
# Install root dependencies
npm run install-all

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (for each service)
cd ../backend
for service in */; do cd $service && npm install && cd ..; done
```

### 3. Database Configuration
1. Create a new database in your SQL server
2. Configure connection settings in `database/config.js`
3. Run migrations and seeders:
```bash
cd database
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 4. Environment Variables
Copy `.env.example` to `.env` and fill in values:
```bash
cp .env.example .env
```
Required variables:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for JSON Web Tokens
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `NEXTAUTH_SECRET` - NextAuth secret

### 5. Run the Application
Start all services in separate terminals:
```bash
# Start API Gateway
cd backend/api-gateway
npm start

# Start Auth Service
cd ../auth-service
npm start

# Start Product Service
cd ../product-service
npm start

# Start Cart Service
cd ../cart-service
npm start

# Start Payment Service
cd ../payment-service
npm start

# Start Admin Service
cd ../admin-service
npm start

# Start Frontend
cd ../../frontend
npm run dev
```

## Project Structure
```
├── backend/              # Backend microservices
│   ├── admin-service/    # Admin management
│   ├── api-gateway/      # API routing gateway
│   ├── auth-service/     # User authentication
│   ├── cart-service/     # Shopping cart management
│   ├── payment-service/  # Payment processing
│   └── product-service/  # Product catalog
├── database/             # Database migrations & seeders
├── docs/                 # Documentation
├── frontend/             # Next.js frontend application
├── .env.example          # Environment template
└── .sequelizerc          # Sequelize configuration
```

## API Documentation
See [docs/API_Documentation.md](docs/API_Documentation.md) for detailed API specifications.

## Deployment
The application can be deployed using Docker containers. Refer to [docs/HANDOVER.md](docs/HANDOVER.md) for deployment instructions.

## License
MIT Licensed - See [LICENSE](LICENSE) for details.
