# RaceParts E-commerce Platform

A modern, full-stack e-commerce platform for automotive accessories, built with a microservice architecture using Node.js, Express, Sequelize, SQLite, and a Next.js frontend.

## Features

- Microservices for authentication, product management, cart, payment, and admin panel
- Admin panel with AdminJS for managing users, products, categories, and orders
- JWT-based authentication and role management
- Stripe integration for payments
- SQLite database with Sequelize ORM
- Modern Next.js frontend (React)
- Docker-ready architecture

## Project Structure

```
root/
├── backend/
│   ├── admin-service/      # Admin panel (AdminJS, Sequelize)
│   ├── api-gateway/        # API Gateway (Express)
│   ├── auth-service/       # Authentication microservice
│   ├── cart-service/       # Shopping cart microservice
│   ├── payment-service/    # Payment and order microservice
│   └── product-service/    # Product and category microservice
├── database/               # SQLite DB, migrations, seeders
├── docs/                   # API and architecture documentation
├── frontend/               # Next.js frontend (React)
├── .env                    # Environment variables
├── package.json            # Root package (scripts, dependencies)
└── README.md               # Project overview (this file)
```

## Getting Started

### Prerequisites
- Node.js v22+
- npm v9+
- (Optional) Docker for containerized deployment

### 1. Install Dependencies
From the root directory, run:
```bash
npm install
```
Then install dependencies for each service:
```bash
cd backend/admin-service && npm install
cd ../api-gateway && npm install
cd ../auth-service && npm install
cd ../cart-service && npm install
cd ../payment-service && npm install
cd ../product-service && npm install
cd ../../../frontend && npm install
```

### 2. Database Setup
- The default database is SQLite, located at `database/raceparts.db`.
- To initialize tables and seed data:
```bash
# (If using Sequelize CLI)
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 3. Environment Variables
Copy `.env.example` to `.env` and set values as needed. Example:
```
ADMIN_EMAIL=admin@raceparts.com
ADMIN_PASSWORD=admin123
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Running Services
Each service can be started individually:
```bash
# Example for admin-service
cd backend/admin-service
npm run dev
# Repeat for other services
```
Or use Docker Compose (if provided):
```bash
docker-compose up --build
```

### 5. Running the Frontend
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

## Admin Panel
- URL: `http://localhost:3005/admin`
- Default credentials: `admin@raceparts.com` / `admin123` (or as set in `.env`)

## API Documentation
See [docs/API_Documentation.md](docs/API_Documentation.md) for all endpoints and usage.

## Architecture
See [docs/Architecture_and_design_system.md](docs/Architecture_and_design_system.md) for diagrams and design notes.

## Handover & Maintenance
See [docs/HANDOVER.md](docs/HANDOVER.md) for project handover details.

## License
MIT
