# 🌿 Organic Arusuvai (OA)

Premium organic e-commerce platform — **Next.js + Django + PostgreSQL + Docker**

## 🚀 Quick Start (3 Steps)

### Step 1: Add local domain to hosts file

**Windows** — Run as Administrator:
```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1 organicarusuvai.local"
```

**Mac/Linux:**
```bash
echo "127.0.0.1 organicarusuvai.local" | sudo tee -a /etc/hosts
```

### Step 2: Start Docker
```bash
cd OA
docker-compose up --build -d
```

### Step 3: Open in browser
- 🌐 **Store:** [http://organicarusuvai.local](http://organicarusuvai.local)
- 📊 **Admin Panel:** [http://organicarusuvai.local/admin](http://organicarusuvai.local/admin)
- ⚙️ **API:** [http://organicarusuvai.local/api/](http://organicarusuvai.local/api/)

## 🔌 Integrations Setup

Go to **Admin Panel → Settings** to configure:

| Integration | What to Configure | Dashboard Link |
|-------------|-------------------|----------------|
| 🔐 Google OAuth | Client ID + Secret | [/admin/settings/google-oauth](http://organicarusuvai.local/admin/settings/google-oauth) |
| 💳 Razorpay | Key ID + Secret | [/admin/settings/razorpay](http://organicarusuvai.local/admin/settings/razorpay) |
| 💬 WhatsApp | Access Token + Phone ID | [/admin/settings/whatsapp](http://organicarusuvai.local/admin/settings/whatsapp) |

Each page has **step-by-step instructions** to get your API keys.

## 📁 Project Structure
```
OA/
├── docker-compose.yml          # 4 services (nginx, frontend, backend, db)
├── nginx/default.conf          # Reverse proxy → organicarusuvai.local
├── frontend/                   # Next.js 13 + Tailwind
│   └── src/app/
│       ├── page.jsx            # Home
│       ├── category/[slug]/    # Category listing
│       ├── product/[slug]/     # Product detail
│       ├── search/             # Search
│       ├── cart/               # Cart
│       ├── checkout/           # Checkout
│       ├── account/            # Login + Profile
│       ├── wishlist/           # Wishlist
│       ├── orders/[id]/        # Order tracking
│       └── admin/              # Admin panel
│           ├── products/       # Product management
│           ├── orders/         # Order management
│           └── settings/       # Integration settings
│               ├── google-oauth/
│               ├── razorpay/
│               └── whatsapp/
├── backend/                    # Django 4.2 + DRF
│   ├── products/               # Product models + API
│   ├── accounts/               # User auth
│   ├── orders/                 # Cart, orders, wishlist
│   └── marketing/              # Banners, coupons, CMS
└── PRD.md                      # Full requirements doc
```

## 🛑 Stop
```bash
docker-compose down
```
