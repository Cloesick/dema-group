# 📁 DemaWebshop Application Structure

## 🌳 Directory Tree Overview

```
dema-webshop/
├── src/                          # Source code (ALL application code)
│   ├── app/                      # Next.js App Router (Pages & API Routes)
│   ├── components/               # React components
│   ├── contexts/                 # React Context providers
│   ├── lib/                      # Utility libraries
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   ├── locales/                  # Internationalization
│   └── middleware.ts             # Next.js middleware
│
├── public/                       # Static assets (images, PDFs, JSON)
├── documents/                    # Product PDFs and JSON data
└── prisma/                       # Database schema

```

---

## 📄 Pages (Routes) - `src/app/`

### **Main Pages**
| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Homepage |
| `/about` | `src/app/about/page.tsx` | About page |
| `/contact` | `src/app/contact/page.tsx` | Contact form |
| `/cart` | `src/app/cart/page.tsx` | Shopping cart |
| `/checkout` | `src/app/checkout/page.tsx` | Checkout process |

### **Product Pages**
| Route | File | Description |
|-------|------|-------------|
| `/products` | `src/app/products/page.tsx` | All products overview |
| `/products/[sku]` | `src/app/products/[sku]/page.tsx` | Individual product detail |
| `/products/featured` | `src/app/products/featured/page.tsx` | Featured products ⭐ |
| `/product-groups/[groupId]` | `src/app/product-groups/[groupId]/page.tsx` | Product group detail |

### **Catalog Pages**
| Route | File | Description |
|-------|------|-------------|
| `/catalog` | `src/app/catalog/page.tsx` | Main catalog browser |
| `/catalog/highlights` | `src/app/catalog/highlights/page.tsx` | Catalog overview 📦 |
| `/catalog/explorer` | `src/app/catalog/explorer/page.tsx` | Product explorer 🔍 |
| `/catalog/[name]-grouped` | `src/app/catalog/*/page.tsx` | Individual catalog pages (40+) |
| `/catalogs` | `src/app/catalogs/page.tsx` | All catalogs list |

### **Account Pages**
| Route | File | Description |
|-------|------|-------------|
| `/account` | `src/app/account/page.tsx` | Account dashboard |
| `/account/orders/[id]` | `src/app/account/orders/[id]/page.tsx` | Order details |
| `/account/employee` | `src/app/account/employee/page.tsx` | Employee verification |
| `/account/pdfs` | `src/app/account/pdfs/page.tsx` | PDF management |
| `/login` | `src/app/login/page.tsx` | Login page |

### **Other Pages**
| Route | File | Description |
|-------|------|-------------|
| `/makita` | `src/app/makita/page.tsx` | Makita products |
| `/categories/[slug]` | `src/app/categories/[slug]/page.tsx` | Category pages |
| `/quote-request` | `src/app/quote-request/page.tsx` | Request quote |
| `/pdf-viewer` | `src/app/pdf-viewer/page.tsx` | PDF viewer |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy |
| `/terms` | `src/app/terms/page.tsx` | Terms of service |

---

## 🔌 API Routes - `src/app/api/`

| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/auth/[...nextauth]` | `src/app/api/auth/` | Authentication (NextAuth) |
| `/api/products` | `src/app/api/products/` | Product data API |
| `/api/catalog` | `src/app/api/catalog/` | Catalog data API |
| `/api/search` | `src/app/api/search/` | Search functionality |
| `/api/recommendations` | `src/app/api/recommendations/` | Product recommendations |
| `/api/quote-request` | `src/app/api/quote-request/` | Quote submissions |
| `/api/account/*` | `src/app/api/account/` | Account management |
| `/api/employee/*` | `src/app/api/employee/` | Employee verification |
| `/api/pdf/*` | `src/app/api/pdf/` | PDF operations |
| `/api/marketing/*` | `src/app/api/marketing/` | Marketing tracking |

---

## 🧩 Components - `src/components/`

### **Component Categories**
```
src/components/
├── layout/                 # Layout components (Header, Footer, Navbar)
├── products/              # Product-related components
├── cart/                  # Shopping cart components
├── account/               # Account-related components
├── categories/            # Category components
├── ui/                    # UI primitives (Button, Input, etc.)
├── CatalogProductCard.tsx
├── ProductGroupCard.tsx
├── ProductVariantCard.tsx
├── ProductFilter.tsx
├── StatsBanner.tsx
└── ... more components
```

---

## 🎨 Contexts - `src/contexts/`

| Context | File | Purpose |
|---------|------|---------|
| QuoteContext | `QuoteContext.tsx` | Quote/cart state management |
| LanguageContext | `LanguageContext.tsx` | Multi-language support |
| LocaleContext | `LocaleContext.tsx` | Locale/region settings |
| CookieConsentContext | `CookieConsentContext.tsx` | Cookie consent state |

---

## 🛠️ Utilities - `src/lib/`

| File | Purpose |
|------|---------|
| `fetchJson.ts` | Safe JSON fetching utility |
| `skuImageMap.ts` | Product image mapping |
| `firebaseClient.ts` | Firebase integration |
| `prisma.ts` | Database client |

---

## 📊 Data Sources

### **Static JSON Data** - `public/data/`
- Product grouped data files
- Catalog metadata
- Image mappings

### **PDF Catalogs** - `documents/Product_pdfs/`
```
documents/Product_pdfs/
├── json/                  # Extracted product data (26 catalogs)
│   ├── pomp-specials.json
│   ├── makita-catalogus-2022-nl.json
│   └── ... (24+ more)
├── images/                # Extracted product images
└── *.pdf                  # Original PDF catalogs
```

---

## 🗺️ Quick Navigation

### **To find:**
- **A page/route** → Look in `src/app/[route-name]/page.tsx`
- **A component** → Look in `src/components/`
- **An API endpoint** → Look in `src/app/api/[endpoint]/`
- **Product data** → Look in `documents/Product_pdfs/json/`
- **Styles** → Components use TailwindCSS inline
- **Database models** → Look in `prisma/schema.prisma`

---

## 🚀 Entry Points

1. **Homepage**: `src/app/page.tsx`
2. **Root Layout**: `src/app/layout.tsx`
3. **Providers**: `src/providers.tsx`
4. **Middleware**: `src/middleware.ts`
5. **Auth Config**: `src/auth.ts`

---

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration |
| `tailwind.config.ts` | TailwindCSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |
| `.env` / `.env.local` | Environment variables |

---

## 🔍 Finding Things Quickly

### **Search by feature:**
- **Products** → `src/app/products/` or `src/components/products/`
- **Catalogs** → `src/app/catalog/`
- **User accounts** → `src/app/account/`
- **Shopping cart** → `src/components/cart/` or `src/contexts/QuoteContext.tsx`
- **Search** → `src/components/products/ProductSearch*.tsx`
- **Filters** → `src/components/products/ProductFilters.tsx`

---

**Last Updated**: December 2025
**Framework**: Next.js 16.0.1 (App Router with Turbopack)
**Styling**: TailwindCSS + shadcn/ui
**Database**: PostgreSQL via Prisma
