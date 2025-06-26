# RaceParts E-commerce Platform

A modern, full-stack e-commerce platform for automotive accessories, built with a microservice architecture using Node.js, Express, Sequelize, SQLite, and a Next.js frontend.

## Features

- Microservices for authentication, product management, cart, payment, and admin panel
- Admin panel with AdminJS for managing users, products, categories, and orders
- JWT-based authentication and role management
- Stripe integration for payments
- SQLite database with Sequelize ORM
- Modern Next.js frontend (React)

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

### 1. Install Dependencies
From the root directory, run:
```bash
npm install
```
Then install dependencies for each service:
```bash
npm run install-all
```

### 2. Database Setup
- The default database is SQLite, located at `database/raceparts.db`.
- To initialize tables and seed data:
```bash
npm run db:reset
```

### 3. Environment Variables
Copy `.env.example` to `.env` and set values as needed. Example:
```
ADMIN_EMAIL=admin@raceparts.com
ADMIN_PASSWORD=admin123
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
<!-- start Stripe forward port for redirect from checkout page-->
### 4. Stripe Checkout Redirect (Local Development)

If you are testing Stripe payments locally, you need to forward the Stripe webhook and checkout redirect to your local frontend.  
Use the Stripe CLI to forward events and handle redirects:

```bash
# Forward Stripe webhooks to your backend (adjust port as needed)
stripe listen --forward-to localhost:3004/webhook

# Forward checkout success/cancel redirects to your frontend (adjust port as needed)
stripe checkout sessions create \
  --success-url "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}" \
  --cancel-url "http://localhost:3000/cancel"
```

- Replace ports if your frontend/backend run on different ports.
- Make sure your `.env` Stripe keys match your Stripe dashboard.

### 5. Running Services
All services can be started:
```bash
npm run dev
```




## Admin Panel
- URL: `http://localhost:3005/admin`
- Default credentials: `admin@raceparts.com` / `admin123` (or as set in `.env`)

## API Documentation
See [docs/API_Documentation.md](docs/API_Documentation.md) for all endpoints and usage.

## Architecture
See [docs/Architecture_and_design_system.md](docs/Architecture_and_design_system.md) for diagrams and design notes.
- Note: The architecture documentation includes Docker-based deployment for future expansion, but Docker is not required for local development at this time.

## Handover & Maintenance
See [docs/HANDOVER.md](docs/HANDOVER.md) for project handover details.

## License
MIT
