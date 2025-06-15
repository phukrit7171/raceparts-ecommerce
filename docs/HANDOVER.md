# RaceParts E-commerce Project - Handover Document

**To:** The Next Development Team  
**From:** The Original Developer  
**Date:** June 15, 2025  
**Project:** RaceParts E-commerce Platform

## 1. 🚀 Project Overview

Welcome to the RaceParts E-commerce project! This is a full-stack web application designed to sell automotive accessories. It has been built using a modern, scalable **microservice architecture** for the backend and a fast, reactive **SvelteKit** frontend.

The core goal was rapid development while establishing a professional, production-ready foundation. All primary features for a functioning e-commerce store are implemented and tested.

### Core Features Implemented

- **User System:** JWT-based registration and login.
- **Product Catalog:** API for browsing products with filtering and search.
- **Shopping Cart:** Persistent, user-specific cart functionality.
- **Payment:** Secure payment processing via **Stripe Checkout**.
- **Order Management:** Automatic order creation and stock reduction upon successful payment.
- **Admin Panel:** A full-featured dashboard for managing Users, Products, Categories, and Orders.
- **Responsive Frontend:** A working frontend for browsing, authentication, and checkout.

## 2. 🏗️ System Architecture

The application is architected as a set of independent microservices that communicate via a central **API Gateway**. This design promotes separation of concerns, scalability, and independent development.

### Architecture Diagram

```mermaid
graph TD
    subgraph "Browser (Client)"
        UI[SvelteKit Frontend<br/>(Port: 5173)]
    end

    UI --> |HTTP Requests| GW

    subgraph "API & Routing Layer"
        GW[API Gateway (Express.js)<br/>(Port: 3000)<br/>- CORS & Rate Limiting<br/>- Authentication Check<br/>- Request Routing]
    end

    GW -->|/api/auth/*| AUTH[Auth Service<br/>(Port: 3001)]
    GW -->|/api/products/*| PROD[Product Service<br/>(Port: 3002)]
    GW -->|/api/cart/*| CART[Cart Service<br/>(Port: 3003)]
    GW -->|/api/payment/*| PAY[Payment Service<br/>(Port: 3004)]

    subgraph "Backend Microservices (Node.js/Express.js)"
        AUTH
        PROD
        CART
        PAY
        ADMIN[Admin Service (AdminJS)<br/>(Port: 3005)<br/>Direct Access]
    end
    
    subgraph "Shared Resources"
        DB[(SQLite Database<br/>`database/raceparts.db`)]
    end

    subgraph "External Services"
        STRIPE[Stripe API]
    end
    
    AUTH --> DB
    PROD --> DB
    CART --> DB
    PAY --> DB
    ADMIN -.->|Reads Models| AUTH
    ADMIN -.->|Reads Models| PROD
    ADMIN -.->|Reads Models| PAY
    ADMIN --> DB

    PAY -->|API Calls| STRIPE
    STRIPE -->|Webhooks| PAY
```

### Key Architectural Decisions

1. **Microservices:** Each core business domain (Auth, Products, Cart, etc.) is a separate Node.js/Express application. This allows for independent scaling and updates.
2. **API Gateway Pattern:** The frontend **only** communicates with the API Gateway. The gateway is the single source of truth for routing, CORS, and primary authentication checks. It adds user information to request headers for downstream services.
3. **Shared Database (SQLite):** For rapid development, all services share a single SQLite database file. **Recommendation for future work:** In a large-scale production environment, consider migrating to a more robust database like PostgreSQL and potentially giving each service its own dedicated database schema or instance to enforce stronger boundaries.
4. **Stripe Checkout:** We opted for Stripe's hosted checkout page to maximize security and user trust, and to reduce frontend development time. All order fulfillment logic is triggered by Stripe webhooks.

## 3. 🛠️ Tech Stack & Dependencies

### Global (Project Root)

- `concurrently`: Runs all microservices and the frontend with a single command (`npm run dev`).
- `sequelize-cli`: Used for managing database migrations and seeders.
- `bcryptjs`, `uuid`: Required by the seeders.

### Frontend (`/frontend`)

- **Framework:** SvelteKit (v5+)
- **Styling:** Bootstrap 5, integrated with a [Start Bootstrap template](https://startbootstrap.com/template/shop-homepage).
- **API Client:** Axios (configured in `$lib/api.js`).
- **UI Notifications:** SweetAlert2.

### Backend (All services in `/backend`)

- **Runtime:** Node.js (v22+)
- **Framework:** Express.js
- **Database ORM:** Sequelize (v6) with SQLite3 dialect.
- **Authentication:** JSON Web Tokens (JWT) stored in secure, HTTP-only cookies.
- **Admin Panel:** AdminJS (v6) with its Express and Sequelize adapters.
- **Payment Gateway:** Stripe (`stripe-node`).

## 4. ⚙️ Getting Started & Setup

### Prerequisites

- Node.js (v22 or higher recommended)
- npm (v8 or higher)
- Git
- **Stripe CLI** (for testing payment webhooks)

### Installation & Setup

1. Clone the repository: `git clone <repo-url>`
2. Navigate to the project root: `cd raceparts-ecommerce`
3. **Environment Variables:**
   - Copy the example environment file: `cp .env.example .env`
   - Open the `.env` file and fill in the required values, especially **your own Stripe API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)**.
4. **Install all dependencies:**
   - Run `npm install` in the root directory.
   - Then run the master install script: `npm run install-all`. This will `cd` into each service and the frontend and run `npm install`.
5. **Database Setup:**
   - Run the database reset script to create the tables and populate them with sample data. This is an idempotent script and is safe to run multiple times.
   - `npm run db:reset`

### Running the Application

- **For Development:** From the project root, run `npm run dev`. This will start all backend services and the frontend concurrently.
  - **Frontend:** <http://localhost:5173>
  - **API Gateway:** <http://localhost:3000>
  - **Admin Panel:** <http://localhost:3005/admin> (Login with credentials from `.env`)
- **To run services individually** (useful for debugging):
  - `npm run dev:gateway`
  - `npm run dev:auth`
  - `npm run dev:products`
  - etc.

## 5. 🗂️ Codebase Deep Dive

### Backend Structure

- `/backend`: Contains all microservices.
- `/backend/api-gateway`: The most important service. It handles routing and authentication checks. See `app.js` for the proxy configuration and protected route logic.
- `/backend/auth-service`: Handles `/api/auth/register`, `/login`, `/logout`, `/me`.
- `/backend/product-service`: Handles `/api/products`.
- `/backend/cart-service`: Handles `/api/cart`.
- `/backend/payment-service`:
  - `/api/payment/create-checkout-session`: Creates the Stripe Checkout session.
  - `/webhook`: **This route is called directly by Stripe, not through the gateway.** It listens for payment success events.
- `/backend/admin-service`: A self-contained AdminJS panel.

### Frontend Structure (`/frontend/src`)

- `/routes`: This is where all pages live. It uses a file-based routing system.
  - `/`: Homepage (`+page.svelte`, `+page.server.js`).
  - `/auth/login`: Login page.
  - `/products/slug/[slug]`: A dynamic route for product details.
  - `+layout.svelte` & `+layout.server.js`: The master template for the entire site. **This is a critical file** as it loads user/cart data on every page load.
- `/lib`: Contains shared code.
  - `/lib/api.js`: The central Axios client. All API calls should go through this.
  - `/lib/stores/`: Contains global Svelte stores for managing state (auth, cart).
  - `/lib/styles/`: Contains global CSS.

## 6. 🧪 Testing

### API Integration Testing

A full end-to-end user journey should be tested using an API client like Postman or Insomnia. The most critical part is testing the payment flow.

**Payment Flow Test:**

1. Start all services.
2. In a separate terminal, start the Stripe webhook listener: `stripe listen --forward-to localhost:3004/webhook`.
3. Ensure the `STRIPE_WEBHOOK_SECRET` in your `.env` file matches the one provided by the Stripe CLI.
4. Use an API client to log in, add items to the cart, and call the `/api/payment/create-checkout-session` endpoint.
5. Take the `url` from the response, paste it into a browser, and complete the test payment.
6. Observe the logs in the payment service terminal to see the `checkout.session.completed` event being processed and the order being created.
7. Verify the data changes (new order, empty cart, reduced stock) in the Admin Panel.

### QA (Quality Assurance)

- **Cross-browser Testing:** The frontend has been tested on modern Chrome. It should be verified on Firefox, Safari, and Edge.
- **Responsiveness:** The UI uses Bootstrap 5 and should be responsive, but thorough testing on various mobile device sizes is recommended.
- **Edge Cases:** The QA team should test edge cases like:
  - Trying to checkout with an empty cart.
  - Trying to add an out-of-stock item to the cart (Note: this logic is not yet implemented and is a good next step).
  - Invalid form submissions (e.g., weak password, invalid email).

## 7. 🚀 DevOps & Deployment

### Containerization

The project is set up to be containerized using Docker, but the `Dockerfile`s and `docker-compose.yml` are not yet created.

**Next Steps for DevOps:**

1. **Create `Dockerfile`s:** Each microservice and the frontend will need its own `Dockerfile`.
   - For backend services, this will be based on a `node` image, copying `package.json`, running `npm install`, and then copying the source code.
   - For the SvelteKit frontend, a multi-stage build is recommended: one stage to `build` the static assets, and a final, lightweight stage (e.g., using Nginx) to serve those assets.
2. **Create `docker-compose.yml`:** This file will define all the services and allow them to be orchestrated with a single `docker-compose up` command. It will need to define networking so services can communicate with each other using their service names (e.g., `http://auth-service:3001`).
3. **CI/CD Pipeline:** A pipeline should be set up in a tool like GitHub Actions, GitLab CI, or Jenkins to automatically build, test, and deploy the containers upon a push to the main branch.

## 8. 💡 Recommendations for Future Work

- **Implement Proper Logging:** Use a structured logging library like Winston or Pino in all backend services and configure them to send logs to a centralized platform (e.g., Datadog, Logstash, AWS CloudWatch).
- **Database Migration:** For a production environment, migrate from SQLite to a more robust database like PostgreSQL or MySQL.
- **Image Handling:** The current product images are placeholders. Implement a proper image upload and hosting solution (e.g., using an S3 bucket or a service like Cloudinary).
- **Expand Features:**
  - Implement the "My Orders" and "My Profile" pages.
  - Add advanced product search and filtering on the frontend.
  - Implement "out of stock" logic.
- **Security Hardening:** Review all dependencies for vulnerabilities, add more robust input validation, and consider more advanced security headers.

This project is in a great state for handover. The architecture is sound, the core features are working, and the path forward is clear. Please feel free to reach out with any initial questions.
