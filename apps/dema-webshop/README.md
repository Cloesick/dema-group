# DEMA Webshop

![Tests](https://github.com/Cloesick/DemaFinal/actions/workflows/test.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-108%20tests-brightgreen)
![Vercel](https://img.shields.io/badge/vercel-deployed-black)

B2B e-commerce platform for industrial equipment, pumps, tools, and technical supplies. Built with Next.js 16 and React 19.

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript + TailwindCSS
- **Authentication**: NextAuth.js + Firebase
- **Database**: Firebase Firestore + Prisma
- **Payments**: Stripe
- **State**: Zustand
- **Email**: Nodemailer + Resend
- **PDF**: pdf-lib + pdfjs-dist

## Production URLs

- **Frontend**: https://demashop.vercel.app (Vercel) *(pending)*
- **Custom Domain**: https://demashop.be *(pending)*
- **GitHub**: https://github.com/Cloesick/DemaFinal

---

## Configuration Summary (Priority Ranked)

### 🔴 Critical Infrastructure (P1)

| # | Configuration | Status | Description |
|---|---------------|--------|-------------|
| 1 | **GitHub Repository** | ✅ Done | Code versioned at Cloesick/DemaFinal |
| 2 | **Vercel Deployment** | 🔄 Pending | Connect GitHub repo to Vercel |
| 3 | **Firebase Setup** | ✅ Done | Authentication and Firestore database |
| 4 | **Environment Variables** | ✅ Done | SMTP, Firebase, Stripe configs |
| 5 | **Next.js Configuration** | ✅ Done | Turbopack, image optimization |

### 🟠 Core Features (P2)

| # | Configuration | Status | Description |
|---|---------------|--------|-------------|
| 6 | **Product Catalog** | ✅ Done | 26+ catalogs with grouped products |
| 7 | **Shopping Cart** | ✅ Done | Zustand-based cart with persistence |
| 8 | **Quote Requests** | ✅ Done | Email notifications for B2B quotes |
| 9 | **User Accounts** | ✅ Done | NextAuth.js authentication |
| 10 | **Checkout Flow** | ✅ Done | Stripe integration |
| 11 | **PDF Catalogs** | ✅ Done | Viewable product catalogs |

### 🟡 User Experience (P3)

| # | Configuration | Status | Description |
|---|---------------|--------|-------------|
| 12 | **Internationalization** | ✅ Done | NL/FR/EN via src/locales |
| 13 | **Product Search** | ✅ Done | Category and product filtering |
| 14 | **Responsive Design** | ✅ Done | Mobile-first TailwindCSS |
| 15 | **Image Optimization** | ✅ Done | Next.js Image component |
| 16 | **Loading States** | ⬜ Todo | Skeleton loaders |

### 🟢 Content & Compliance (P4)

| # | Configuration | Status | Description |
|---|---------------|--------|-------------|
| 17 | **Privacy Policy** | ✅ Done | /privacy page |
| 18 | **Terms of Service** | ✅ Done | /terms page |
| 19 | **Contact Page** | ✅ Done | /contact with form |
| 20 | **About Page** | ✅ Done | /about company info |
| 21 | **GDPR Cookie Consent** | ⬜ Todo | Cookie banner needed |

### 🔵 Analytics & Optimization (P5)

| # | Configuration | Status | Description |
|---|---------------|--------|-------------|
| 22 | **Google Analytics** | ⬜ Todo | GA4 tracking |
| 23 | **SEO Meta Tags** | ⬜ Todo | Open Graph, structured data |
| 24 | **Performance** | ⬜ Todo | Lighthouse optimization |

### ⚪ Pending (P6)

| # | Configuration | Status | Description |
|---|---------------|--------|-------------|
| 25 | **Vercel Deployment** | ⬜ Todo | Production hosting |
| 26 | **Custom Domain** | ⬜ Todo | demashop.be DNS setup |

---

## Testing

```bash
# Run all tests (108 tests)
npm test

# Run with coverage
npm run test:coverage

# Run only user journey tests (62 tests)
npm run test:journeys

# Run CI tests (for GitHub Actions)
npm run test:ci

# Watch mode during development
npm run test:watch
```

### Test Structure

| Suite | Tests | Description |
|-------|-------|-------------|
| `contact.test.tsx` | 13 | Contact form validation |
| `login.test.tsx` | 10 | Authentication flow |
| `quote.test.tsx` | 6 | Quote context |
| `fuzzySearch.test.ts` | 17 | Search functionality |
| **User Journeys** | **62** | E2E persona tests |

### User Journey Personas

| Persona | Type | Sector | Tests |
|---------|------|--------|-------|
| Gardener | B2B | Agriculture | 12 |
| Handyman | B2C | Construction | 12 |
| Farmer | B2B | Agriculture | 12 |
| Plumber | B2B | Plumbing | 13 |
| Industrial | B2B | Industry | 13 |

---

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open http://localhost:3000

## Project Structure

```
dema-webshop/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── cart/           # Shopping cart
│   │   ├── catalog/        # Product catalogs
│   │   ├── checkout/       # Checkout flow
│   │   ├── products/       # Product pages
│   │   └── ...
│   ├── components/         # React components
│   │   ├── cart/           # Cart components
│   │   ├── layout/         # Header, Footer
│   │   ├── products/       # Product cards, lists
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities
│   ├── locales/            # i18n translations
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript types
├── public/
│   ├── data/               # Product JSON data
│   ├── images/             # Static images
│   └── pdfs/               # PDF catalogs
├── scripts/                # Build & data scripts
│   ├── catalog-processing/ # Data enrichment
│   ├── images/             # Image generation
│   ├── makita/             # Makita integration
│   └── pdf-generation/     # PDF tools
└── prisma/                 # Database schema
```

## Environment Variables

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="DEMA Shop" <noreply@demashop.be>

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Stripe
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

## Product Catalogs

| Catalog | Products | Category |
|---------|----------|----------|
| Makita Tools | 500+ | Power Tools |
| Airpress | 300+ | Compressors |
| Pumps | 400+ | Water Pumps |
| Fittings | 600+ | Plumbing |
| Hoses | 200+ | Industrial |
| ... | ... | ... |

## Scripts

```bash
# Sync product images
npm run sync-images

# Generate grouped catalogs
node scripts/generate_grouped_catalogs.js

# Enrich catalog data
python scripts/catalog-processing/enrich_catalog.py
```

## Deployment

### Vercel (Recommended)
1. Go to https://vercel.com/new
2. Import `Cloesick/DemaFinal` from GitHub
3. Configure environment variables
4. Deploy

### Environment Variables for Vercel
Add all variables from `.env.example` in Vercel dashboard.

## License

Proprietary - DEMA © 2025
