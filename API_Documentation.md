# RaceParts API Documentation

## Base URL

```text
http://localhost:3000/api
```

## Authentication

All protected routes require JWT token in cookies or Authorization header:

```text
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Service (Port: 3001)

### POST /auth/register

Register a new user

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login

User login

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout

User logout (clears JWT cookie)

### GET /auth/me

Get current user profile (Protected)

**Response:**

```json
{
  "success": true,
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "role": "customer"
  }
}
```

---

## 🛍️ Product Service (Port: 3002)

### GET /products

Get all products with pagination and filtering

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Category slug
- `search`: Search term
- `sort`: Sort by (name, price, created_at)
- `order`: Sort order (asc, desc)
- `min_price`: Minimum price
- `max_price`: Maximum price

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "uuid": "product-uuid-1",
        "name": "Racing Brake Pads",
        "slug": "racing-brake-pads",
        "description": "High-performance brake pads for racing",
        "price": 199.99,
        "stock_quantity": 50,
        "category": {
          "name": "Brakes",
          "slug": "brakes"
        },
        "images": [
          "/images/brake-pads-1.jpg",
          "/images/brake-pads-2.jpg"
        ],
        "specifications": {
          "material": "Ceramic",
          "temperature_range": "0-800°C"
        },
        "is_active": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 60,
      "items_per_page": 12
    }
  }
}
```

### GET /products/:uuid

Get single product by UUID

### GET /products/slug/:slug

Get single product by slug

### GET /products/category/:slug

Get products by category slug

### POST /products/search

Advanced product search

```json
{
  "query": "brake pads",
  "filters": {
    "category": "brakes",
    "price_range": [50, 500],
    "in_stock": true
  }
}
```

---

## 📂 Category Service

### GET /categories

Get all categories

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Brakes",
      "slug": "brakes",
      "description": "Brake components and accessories",
      "image_url": "/images/categories/brakes.jpg",
      "product_count": 25
    }
  ]
}
```
