# RaceParts E-commerce Project - Handover Document

**To:** The Next Development Team  
**From:** The Original Developer  
**Date:** June 15, 2025  
**Project:** RaceParts E-commerce Platform

## 1. 🚀 Project Overview

Welcome to the RaceParts E-commerce project! This is a full-stack web application designed to sell automotive accessories. It is built with a modern, scalable **microservice architecture** for the backend and a fast, modern **Next.js** frontend (React).

The core goal was rapid development while establishing a professional, production-ready foundation. All primary features for a functioning e-commerce store are implemented and tested.

### Core Features Implemented

- **User System:** JWT-based registration and login.
- **Product Catalog:** API for browsing products with filtering and search.
- **Shopping Cart:** Persistent, user-specific cart functionality.
- **Payment:** Secure payment processing via **Stripe Checkout**.
- **Order Management:** Automatic order creation and stock reduction upon successful payment.
- **Admin Panel:** A full-featured dashboard for managing Users, Products, Categories, and Orders (AdminJS).
- **Responsive Frontend:** Next.js frontend for browsing, authentication, and checkout.

## 2. 🏗️ System Architecture

The application is architected as a set of independent microservices that communicate via a central **API Gateway**. This design promotes separation of concerns, scalability, and independent development.

- **Frontend:** Next.js (React) with Bootstrap 5
- **API Gateway:** Express.js (Port: 3000)
- **Microservices:**
  - Auth Service (Port: 3001)
  - Product Service (Port: 3002)
  - Cart Service (Port: 3003)
  - Payment Service (Port: 3004)
  - Admin Service (AdminJS, Port: 3005)
- **Database:** Shared SQLite database (`database/raceparts.db`) via Sequelize ORM
- **Payments:** Stripe integration

## 3. 🛠️ Tech Stack & Dependencies

- **Node.js** (v22+)
- **Express.js** (backend, API gateway, microservices)
- **Sequelize** (ORM)
- **SQLite** (development DB)
- **Next.js** (frontend)
- **Bootstrap 5** (UI)
- **Stripe** (payments)
- **AdminJS** (admin panel)
- **JWT** (authentication)

## 4. ⚙️ Getting Started & Setup

### Prerequisites

- Node.js (v22 or higher)
- npm (v8 or higher)
- Git
- Stripe CLI (for webhook testing)

### Installation & Setup

1. Clone the repository: `git clone <repo-url>`
2. Navigate to the project root: `cd raceparts-ecommerce`
3. Copy the example environment file: `cp .env.example .env`
4. Fill in the required values in `.env` (especially Stripe keys).
5. Install all dependencies:
   - Run `npm install` in the root directory.
   - Then run `npm install` in each backend service and the frontend.
6. Database setup:
   - Run migrations and seeders using Sequelize CLI or provided scripts.

### Running the Application

- **For Development:**
  - Start each backend service and the frontend individually using `npm run dev` in each directory.
  - Or use Docker Compose (if provided).
- **Frontend:** <http://localhost:5173>
- **API Gateway:** <http://localhost:3000>
- **Admin Panel:** <http://localhost:3005/admin> (Login with credentials from `.env`)

## 5. 🗂️ Codebase Deep Dive

- `/backend`: All microservices (admin, auth, cart, payment, product, gateway)
- `/frontend`: Next.js frontend
- `/database`: SQLite DB, migrations, seeders
- `/docs`: API and architecture documentation

## 6. 🧪 Testing

- Use Postman or Insomnia for API testing
- Use Stripe CLI for webhook testing
- Test payment flow end-to-end
- Test frontend on multiple browsers and devices

## 7. 🚀 DevOps & Deployment

- Project is ready for Dockerization (Dockerfiles and docker-compose recommended as next step)
- CI/CD pipeline setup is recommended for production

## 8. 💡 Recommendations for Future Work

- Migrate to PostgreSQL or MySQL for production
- Add image upload/hosting (e.g., S3, Cloudinary)
- Implement advanced product search and filtering
- Harden security and add centralized logging
- Expand frontend features (order history, profile management)

This project is in a great state for handover. The architecture is sound, the core features are working, and the path forward is clear. Please reach out with any questions!
