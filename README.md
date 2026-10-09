# 🛍️ JayasriMart — Full-Stack Modern E-Commerce Platform

A production-grade, full-featured e-commerce marketplace built with **Spring Boot 3 (Java 17)**, **MySQL 8.0**, and **React 19 + TypeScript + Vite**.

---

## 🌟 Features Overview

### 🛒 Customer Experience
* **Dynamic Home & Storefront**: Curated categories, featured deal banners, new arrivals, promotional alerts, brand trust showcases.
* **Product Catalog & Advanced Discovery**: Search by keyword, filter by categories and brands, sort by price/newest, live stock indicator, dynamic pagination.
* **Product Detail Hub**: High-res image gallery, variant selector, customer reviews submission & ratings, related recommendations.
* **Persistent Cart & Wishlist**: Real-time item total calculation, automatic sync with customer account, single-click wishlist management.
* **Multi-Step Checkout**:
  * Step 1: Saved delivery address selection or new address registration.
  * Step 2: Payment method selection (Cash on Delivery, Simulated Card, UPI/QR) & discount coupon validation (`WELCOME10`, `JAYASRI50`, `SUPERDEAL`).
  * Step 3: Transaction confirmation with instant printable receipt and order tracking ID.
* **User Dashboard (`/account`)**:
  * Order history with real-time delivery status badge (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  * Self-service order cancellation for pending shipments.
  * Saved address book manager.
  * Saved wishlist items with 1-click "Move to Cart".

### 🛡️ Admin Control Suite (`/admin`)
* **Real-time Analytics**: Live metrics for Total Revenue (₹), Total Orders, Registered Customers, and Low Stock Inventory Alerts.
* **Product Catalog Management**: Full CRUD modal for creating products, editing pricing/SKU/stock/images, and toggling active status.
* **Category & Brand Management**: Add and manage custom product taxonomies.
* **Order Processing**: Track customer orders with real-time status update workflows.
* **Customer Moderation**: List registered accounts and toggle active/disabled states.
* **Coupon & Discount Engine**: Create percentage or fixed discount coupon codes with minimum order amount thresholds.
* **Review Moderation**: Approve or remove customer feedback before public display.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, React Router v7, Lucide Icons, Axios |
| **Backend** | Spring Boot 3.3.4, Java 17, Spring Security 6, JJWT (0.12.6), Spring Data JPA |
| **Database** | MySQL 8.0 (`marketplace` database) |
| **Security** | Stateless JWT authentication, BCrypt password hashing, `@Transactional` stock decrement |

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@jayasrimart.com` | `Admin@123` |
| **Customer** | `customer@jayasrimart.com` | `Customer@123` |

> 💡 *Both demo logins can also be auto-filled via the 1-click buttons on the Login page.*

---

## 🎟️ Demo Promo Codes

* `WELCOME10` — 10% Discount on orders above ₹299 (Max discount ₹200).
* `JAYASRI50` — Flat ₹50 OFF on orders above ₹499.
* `SUPERDEAL` — 20% Discount on orders above ₹1,000 (Max discount ₹500).

---

## 🚀 Getting Started

### 1. Database Configuration
Ensure MySQL server is running on `localhost:3306` with a database named `marketplace`:
```sql
CREATE DATABASE IF NOT EXISTS marketplace;
```
Configure your credentials in [`e-commerce/src/main/resources/application.yaml`](file:///c:/Jayasri_mart/e-commerce/src/main/resources/application.yaml):
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/marketplace?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: YOUR_MYSQL_PASSWORD
```

### 2. Run Backend (Spring Boot)
```bash
cd c:\Jayasri_mart\e-commerce
.\mvnw.cmd spring-boot:run
```
* Backend starts at `http://localhost:8080`.
* The `DataSeeder` automatically populates default admin/customer accounts, 8 categories, 8 brands, 22 demo products, and promo coupons.

### 3. Run Frontend (React + Vite)
```bash
cd c:\Jayasri_mart\Frontend\digital-pistol-target
npm install
npm run dev
```
* Frontend starts at `http://localhost:5173`.

---

## 📡 REST API Reference Summary

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new customer
* `POST /api/auth/login` — Sign in and receive JWT token
* `GET /api/auth/me` — Fetch currently authenticated user

### Products & Catalog (`/api/products`, `/api/categories`, `/api/brands`)
* `GET /api/products` — Paginated catalog with keyword search, category, brand, and price filters
* `GET /api/products/{id}` — Product details with variant list
* `GET /api/products/featured` — Top featured products
* `GET /api/categories` — Category list with product counts
* `GET /api/brands` — Brand directory

### Cart & Wishlist (`/api/cart`, `/api/wishlist`)
* `GET /api/cart` — Get user's active cart
* `POST /api/cart/items` — Add product to cart
* `PUT /api/cart/items/{id}` — Update item quantity
* `DELETE /api/cart/items/{id}` — Remove item from cart
* `GET /api/wishlist` — Get customer wishlist
* `POST /api/wishlist/items/{productId}` — Toggle wishlist item

### Checkout & Orders (`/api/orders`, `/api/coupons`)
* `POST /api/orders` — Place order (`@Transactional` with server-side pricing & stock verification)
* `GET /api/orders/my-orders` — Customer order history
* `POST /api/orders/{id}/cancel` — Cancel pending order
* `GET /api/coupons/validate` — Validate promo code against current cart total

### Admin Hub (`/api/admin`)
* `GET /api/admin/dashboard` — Revenue, orders, users, and low-stock alerts
* `GET /api/admin/orders` — View and manage all platform orders
* `PATCH /api/admin/orders/{id}/status` — Update order delivery status
* `GET /api/admin/users` — Moderate registered customers
* `PATCH /api/admin/users/{id}/status` — Activate/deactivate customer accounts
