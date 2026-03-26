# 📋 Organic Arusuvai — Product Requirements Document (PRD)

**Project:** Organic Arusuvai E-Commerce Platform
**Client:** Organic Arusuvai
**Prepared by:** Lingeshkumar Gv
**Date:** March 22, 2026
**Domain:** organicarusuvai.online
**Stack:** Next.js 14 + Django 4.2 + PostgreSQL 15 (Docker)

---

## 1. Introduction

Organic Arusuvai is a full-featured e-commerce website for selling organic products (spices, farm products, ready mixes, millets, cold-pressed oils). The platform includes SEO optimization, Google OAuth login, Razorpay payments, WhatsApp CRM broadcasts, real-time order tracking, and a powerful admin panel — all deployed via Docker on a Hostinger VPS.

---

## 2. Product Categories

| # | Category |
|---|----------|
| 1 | Spices |
| 2 | Farm Products |
| 3 | Ready Mixes |
| 4 | Millets |
| 5 | Cold Pressed Oils |

Products have variants (size/weight), images (min 4 per product, 800×800px), prices, and stock levels.

---

## 3. Site Map & Pages

### 3.1 Customer-Facing (Frontend)

| Page | Features |
|------|----------|
| **Home** | Hero banner slider (5 slides, 1920×800px), global search bar, category carousel, featured products grid |
| **Category Listing** | Category banner (1920×400px), product grid with filters (price, brand, organic), sort options |
| **Product Detail (PDP)** | Image gallery (4+ images), variant selector (weight/size), add to cart, reviews, related products |
| **Search Results** | Filters (price/brand/organic), products grid |
| **Cart** | Items list, quantity controls, order summary, proceed to checkout |
| **Checkout** | Delivery address, coupon codes, Razorpay payment gateway |
| **Order Tracking** | Real-time GPS map, ETA counter, order details |
| **My Account** | Google OAuth login, order history, reorder, profile management, wishlist |
| **Contact Support** | WhatsApp chat integration |

### 3.2 Admin Panel (/admin)

| Section | Features |
|---------|----------|
| **Dashboard** | Sales analytics, order stats, user metrics |
| **Products** | Add/remove products, set price, manage variants, edit stock, categories |
| **Orders** | Order dashboard, processing, out for delivery, completed |
| **Users** | Customer list, analytics |
| **Content CMS** | Banners, static pages, feedback management |
| **Marketing** | WhatsApp broadcasts, AI poster generation, promo codes |
| **Settings** | Payment gateways, hosting config, security |

---

## 4. Technical Architecture

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js + React | 14 + 18 | SSR, PWA, SEO, code splitting |
| UI Framework | Tailwind CSS | 3.x | Responsive design |
| Backend | Django + DRF | 4.2 | REST API, admin, business logic |
| Database | PostgreSQL | 15 | Primary data store |
| Cache | Redis | 7 | Session cache, rate limiting |
| Auth | Google OAuth 2.0 | — | Social login |
| Payments | Razorpay | — | UPI, cards, netbanking |
| CRM | WhatsApp Business API | — | Order notifications, marketing |
| Media | AWS S3 / Cloudinary | — | Product images, banners |
| Deployment | Docker + Docker Compose | — | Multi-container orchestration |
| Hosting | Hostinger VPS | — | Production server |

---

## 5. Database Schema (Key Models)

### Users
- id, email, name, phone, google_id, avatar, role (customer/admin), created_at

### Categories
- id, name, slug, image, banner_image, description, is_active, sort_order

### Products
- id, name, slug, description, category_id (FK), base_price, discount_price, is_featured, is_active, seo_title, seo_description, created_at

### ProductVariants
- id, product_id (FK), name (e.g. "500g"), price, stock, sku

### ProductImages
- id, product_id (FK), image_url, alt_text, sort_order

### Orders
- id, user_id (FK), status (placed/processing/out_for_delivery/delivered/cancelled), total, delivery_address, payment_id, coupon_id, tracking_info, created_at

### OrderItems
- id, order_id (FK), product_id (FK), variant_id (FK), quantity, price

### Reviews
- id, product_id (FK), user_id (FK), rating, comment, created_at

### Coupons
- id, code, discount_type (percent/flat), discount_value, min_order, max_uses, valid_from, valid_to, is_active

### Banners
- id, title, image_url, link_url, position (hero/category), sort_order, is_active

### Wishlists
- id, user_id (FK), product_id (FK)

---

## 6. API Endpoints (REST)

### Auth
- `POST /api/auth/google/` — Google OAuth callback
- `GET /api/auth/me/` — Current user profile
- `PUT /api/auth/profile/` — Update profile

### Products
- `GET /api/products/` — List with filters & pagination
- `GET /api/products/:slug/` — Product detail
- `GET /api/categories/` — All categories
- `GET /api/categories/:slug/products/` — Products by category

### Cart & Orders
- `GET/POST/PUT/DELETE /api/cart/` — Cart CRUD
- `POST /api/orders/` — Place order
- `GET /api/orders/` — Order history
- `GET /api/orders/:id/` — Order detail + tracking
- `POST /api/orders/:id/reorder/` — Reorder

### Payments
- `POST /api/payments/create/` — Create Razorpay order
- `POST /api/payments/verify/` — Verify payment signature

### Reviews & Wishlist
- `POST /api/reviews/` — Submit review
- `GET/POST/DELETE /api/wishlist/` — Wishlist CRUD

### Admin
- `GET/POST/PUT/DELETE /api/admin/products/`
- `GET/PUT /api/admin/orders/`
- `GET /api/admin/analytics/`
- `POST /api/admin/marketing/broadcast/`
- `GET/POST/PUT/DELETE /api/admin/coupons/`
- `GET/POST/PUT/DELETE /api/admin/banners/`

---

## 7. Development Phases

### Phase 1 — Foundation (Current Sprint)
- [x] Docker setup (Compose, Dockerfiles)
- [ ] Django project scaffold + database models
- [ ] Next.js project scaffold + design system
- [ ] Home page with hero, categories, featured products

### Phase 2 — Product Catalog
- [ ] Category listing page with filters
- [ ] Product detail page (PDP) with gallery, variants
- [ ] Search functionality
- [ ] SEO optimization (meta tags, structured data)

### Phase 3 — User Auth & Cart
- [ ] Google OAuth integration
- [ ] User profile & account pages
- [ ] Cart functionality (add/remove/quantity)
- [ ] Wishlist

### Phase 4 — Checkout & Payments
- [ ] Checkout flow (address, coupons)
- [ ] Razorpay payment integration
- [ ] Order confirmation & email notifications

### Phase 5 — Orders & Tracking
- [ ] Order history & detail pages
- [ ] Real-time tracking with GPS map
- [ ] Reorder functionality

### Phase 6 — Admin Panel
- [ ] Admin dashboard with analytics
- [ ] Product & category management
- [ ] Order management & status updates
- [ ] CMS (banners, static pages)
- [ ] Coupon management

### Phase 7 — Marketing & Polish
- [ ] WhatsApp broadcast integration
- [ ] AI poster generation
- [ ] Performance optimization
- [ ] PWA support
- [ ] Final QA & deployment

---

## 8. Customer Input Requirements

| # | Field | Input | Status |
|---|-------|-------|--------|
| 1 | Business Name | Organic Arusuvai | ✅ Done |
| 2 | Logo File | Upload via Google Drive | ☐ Pending |
| 3 | Categories | Spices, Farm Products, Ready Mixes, Millets, Cold Pressed Oils | ✅ Done |
| 4 | Product Catalog | Excel (Name/Price/Stock/Category/Image URL) | ☐ Pending |
| 5 | Product Images (500+) | JPG 800×800px via Google Drive | ☐ Pending |
| 6 | Category Banners (12) | JPG 1920×400px | ☐ Pending |
| 7 | Home Sliders (5) | JPG 1920×800px | ☐ Pending |
| 8 | Brand Colors | Primary: ___ Secondary: ___ | ☐ Pending |
| 9 | Font Colors | Primary: ___ Secondary: ___ | ☐ Pending |
| 10 | Target Locations | Chennai Zones | ☐ Pending |
| 11 | Monthly Order Goal | _____ orders | ☐ Pending |
| 12 | Domain Name | ____.in | ☐ Pending |
| 13 | Custom Product Fields | Size / Weight / Variant | ☐ Pending |
