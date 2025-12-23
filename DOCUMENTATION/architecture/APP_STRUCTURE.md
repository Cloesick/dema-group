# Application Structure

## Directory Overview

```
dema-webshop/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── chat/             # AI chatbot endpoint
│   │   │   ├── products/         # Product API
│   │   │   ├── quote-request/    # Quote submission
│   │   │   └── search/           # Search API
│   │   ├── cart/                 # Shopping cart page
│   │   ├── catalog/              # Catalog pages (40+)
│   │   ├── categories/           # Category pages
│   │   ├── checkout/             # Checkout flow
│   │   ├── makita/               # Makita brand page
│   │   ├── products/             # Product pages
│   │   └── ...
│   ├── components/               # React components
│   │   ├── chat/                 # AI chatbot components
│   │   ├── layout/               # Header, Footer, Nav
│   │   ├── products/             # Product cards, lists
│   │   └── ui/                   # Reusable UI components
│   ├── config/                   # Configuration
│   │   ├── propertyIcons.ts      # Property display config
│   │   └── productKnowledgeBase.ts # AI knowledge base
│   ├── contexts/                 # React contexts
│   │   ├── QuoteContext.tsx      # Quote basket state
│   │   └── LanguageContext.tsx   # i18n state
│   ├── lib/                      # Utilities
│   └── store/                    # Zustand stores
├── public/
│   ├── data/                     # Product JSON files
│   │   ├── products_all_grouped.json
│   │   └── [catalog]_grouped.json
│   ├── images/                   # Product images
│   │   └── products/             # Extracted from PDFs
│   └── pdfs/                     # PDF catalogs
├── scripts/                      # Build scripts
│   ├── generate_grouped_catalogs.js
│   └── analyze_product_pdfs.py
└── docs/                         # Documentation
```

## Key Files

### Entry Points

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Homepage |
| `src/app/client-layout.tsx` | Client-side providers |

### Configuration

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js config |
| `tailwind.config.ts` | Tailwind CSS |
| `tsconfig.json` | TypeScript |
| `.env.local` | Environment variables |

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ProductGroupCard` | `src/components/` | Product display card |
| `ProductAssistant` | `src/components/chat/` | AI chatbot |
| `QuoteBasket` | `src/components/` | Quote management |
| `PropertyBadges` | `src/components/products/` | Spec display |

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ Components  │  │   API       │         │
│  │  (SSR/SSG)  │  │  (Client)   │  │  Routes     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  JSON Files   │   │   OpenAI      │   │    SMTP       │
│  (Products)   │   │   (Chatbot)   │   │   (Email)     │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Page Routes

### Main Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Homepage |
| `/products` | `app/products/page.tsx` | All products |
| `/cart` | `app/cart/page.tsx` | Shopping cart |
| `/checkout` | `app/checkout/page.tsx` | Checkout |

### Catalog Pages

| Route | File | Description |
|-------|------|-------------|
| `/catalog` | `app/catalog/page.tsx` | Catalog browser |
| `/catalog/[name]` | `app/catalog/[name]/page.tsx` | Individual catalog |
| `/makita` | `app/makita/page.tsx` | Makita products |

### API Routes

| Endpoint | Purpose |
|----------|---------|
| `/api/chat/product-assistant` | AI chatbot |
| `/api/products` | Product data |
| `/api/quote-request` | Submit quote |
| `/api/search` | Search products |

## State Management

### Zustand Stores

| Store | Purpose |
|-------|---------|
| `quoteStore` | Quote basket items |
| `cartStore` | Shopping cart |

### React Contexts

| Context | Purpose |
|---------|---------|
| `QuoteContext` | Quote state & actions |
| `LanguageContext` | Current language (NL/EN/FR) |

## Component Hierarchy

```
RootLayout
├── ClientLayout
│   ├── Header
│   │   ├── Navigation
│   │   ├── LanguageSwitcher
│   │   └── CartIcon
│   ├── Main Content (Pages)
│   │   ├── ProductGroupCard
│   │   ├── PropertyBadges
│   │   └── ...
│   ├── Footer
│   └── ProductAssistant (Chatbot)
```

---

*Last Updated: December 2024*
