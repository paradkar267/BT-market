# Bizleap Marketplace - System BRAIN

This document serves as the single source of truth for the Bizleap Marketplace project. It is intended for any future AI agent or developer to understand the architecture, workflows, data flow, integrations, and operational details of the system.

## 1. High-Level Overview
**Bizleap Marketplace** is a high-performance digital asset storefront for UI kits, web templates, and dashboards. 
The system operates as a modern Single Page Application (SPA) backed by an Express REST API connected to a serverless **Neon PostgreSQL** database.

### Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Radix UI, Framer Motion/GSAP, Lucide Icons.
- **Backend:** Node.js, Express 5.
- **Database & Auth:** Neon PostgreSQL (`@neondatabase/serverless`) with JWT authentication & Bcrypt password hashing.
- **Payments:** Razorpay (Backend order creation & HMAC-SHA256 signature verification).
- **Emails:** Nodemailer (via SMTP).

---

## 2. Architecture & Repository Structure

```text
BT market/
├── backend/
│   ├── config/
│   │   └── db.js             # Neon PostgreSQL connection pool & query runner
│   ├── middlewares/
│   │   └── authMiddleware.js # JWT verification & admin guard
│   ├── routes/
│   │   ├── authRoutes.js     # Signup, Login, Profile, Password Reset
│   │   ├── publicRoutes.js   # Templates catalog, Orders, Checkout, Reviews, Coupons
│   │   └── adminRoutes.js    # Analytics, Customers, Orders, Template upload/edit
│   ├── services/
│   │   └── emailService.js   # Receipts, Contact notifications
│   ├── uploads/              # Stored template assets and media
│   └── server.js             # Express server entry point (Port 3000)
├── frontend/
│   ├── src/
│   │   ├── components/       # UI Components (Radix, Custom, Layout)
│   │   ├── lib/
│   │   │   └── api.js        # Unified Axios/Fetch API client for Neon backend
│   │   ├── *Context.jsx      # Global State Managers (Auth, Cart, Wishlist, Theme)
│   │   ├── *Page.jsx         # Route Views (Home, CartPage, DashboardPage, etc.)
│   │   └── useTemplates.js   # Hook for fetching templates from Neon API
│   ├── index.html
│   └── vite.config.js        # Vite configuration (port 5173)
├── neon_schema.sql           # Canonical PostgreSQL schema for Neon
├── vercel.json               # Vercel deployment configuration & Render API proxy
└── package.json              # Monorepo-style package config
```

---

## 3. Data & State Flow

### 3.1 Global State (React Context)
The frontend relies on clean React Contexts backed by the Express REST API:
1. **`AuthContext.jsx`**: Manages JWT authentication stored in `localStorage` (`bizleap_token`). Fetches profile data from `GET /api/auth/me`.
2. **`CartContext.jsx`**: Manages local shopping cart array and syncs with backend order creation.
3. **`WishlistContext.jsx`**: Manages user wishlist items.
4. **`ThemeContext.jsx`**: Toggles a `dark` class on the HTML root and syncs with `localStorage`.

### 3.2 Database Schema (Neon PostgreSQL)
- **`users`**: User accounts with hashed passwords (`bcryptjs`), roles (`admin`, `customer`), and profile metadata.
- **`templates`**: Template catalog records with price, title, tags, description, live preview URL, file paths.
- **`purchases`**: Real purchase records linking `user_id`, `template_id`, `payment_id`, `amount`, and `status`.
- **`reviews`**: Verified template reviews linked to users and templates.
- **`coupons` & `coupon_redemptions`**: Discount codes, limits, expiration, and tracking.
- **`campaigns` & `announcements`**: Promotional banners and email broadcast campaigns.

---

## 4. Key Workflows

### 4.1 Purchase Flow & Checkout
1. User adds items to the cart (`CartContext`).
2. User clicks "Checkout" in `CartPage.jsx`.
3. Backend creates Razorpay order via `POST /api/create-order` calculating verified prices from Neon.
4. Razorpay checkout modal opens.
5. On successful payment, the signature is verified securely via `POST /api/verify-payment` using HMAC-SHA256 (`RAZORPAY_KEY_SECRET`).
6. Purchase records are inserted into the `purchases` table in Neon.
7. Backend sends receipt email via Nodemailer (`POST /api/send-receipt`).
8. Client triggers localized PDF invoice and user is routed to `/my-templates`.

---

## 5. Deployment & Configuration
- **Frontend:** Hosted on Vercel (`vercel.json` rewrites `/api/*` and `/uploads/*` to the Render backend).
- **Backend:** Hosted on Render (`node backend/server.js`).
- **Database:** Hosted on Neon Serverless PostgreSQL.
