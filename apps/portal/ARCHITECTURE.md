# DEMA Group Portal - Architecture Blueprint

## Overview

This document describes the complete architecture blueprint for the DEMA Group B2B Portal, following the Kramp.com "Eagle" model. The blueprint provides all necessary structures, types, pages, and APIs - ready to be populated with actual product data.

## Table of Contents

1. [Type Definitions](#type-definitions)
2. [Pages & Features](#pages--features)
3. [API Endpoints](#api-endpoints)
4. [Service Layer](#service-layer)
5. [Data Flow](#data-flow)
6. [Implementation Checklist](#implementation-checklist)

---

## Type Definitions

All TypeScript interfaces are defined in `src/types/index.ts`:

### Core Types

| Type | Description |
|------|-------------|
| `Product` | Complete product with specs, pricing, stock, media |
| `ProductPricing` | B2B pricing with volume tiers |
| `ProductSpecification` | Technical specs with filtering support |
| `CrossReference` | OEM/competitor part number mapping |
| `ProductCompatibility` | Machine/equipment compatibility |
| `StockStatus` | Multi-warehouse stock levels |

### Catalog Types

| Type | Description |
|------|-------------|
| `Category` | Product category with filters |
| `Subcategory` | Nested category structure |
| `CategoryFilter` | Faceted search filter definition |
| `Brand` | Product brand/manufacturer |

### Customer Types

| Type | Description |
|------|-------------|
| `Customer` | B2B customer account |
| `CustomerCompany` | Business details, VAT, etc. |
| `CustomerAddress` | Billing/shipping addresses |
| `CustomerPreferences` | Language, notifications, etc. |

### Order Types

| Type | Description |
|------|-------------|
| `Order` | Complete order with items, status |
| `OrderItem` | Line item with backorder support |
| `Cart` | Shopping cart with pricing |
| `ShoppingList` | Saved product lists |

### Search Types

| Type | Description |
|------|-------------|
| `SearchQuery` | Search parameters with filters |
| `SearchResult` | Paginated results with facets |
| `SearchFacet` | Filter facet with counts |

### Configurator Types

| Type | Description |
|------|-------------|
| `ConfiguratorProduct` | Configurable product definition |
| `ConfiguratorStep` | Configuration wizard step |
| `ConfiguratorOption` | Step option with pricing |
| `ConfiguratorConfiguration` | Saved configuration |

### Academy Types

| Type | Description |
|------|-------------|
| `Course` | Training course |
| `CourseModule` | Course section |
| `CourseLesson` | Video/text/quiz content |
| `CourseEnrollment` | User progress tracking |

---

## Pages & Features

### 1. Product Listing (`/products`)

**File:** `src/app/products/page.tsx`

Features:
- ✅ Faceted search with filters
- ✅ Category navigation pills
- ✅ Subcategory sidebar
- ✅ Sort options (name, price, relevance)
- ✅ Grid/List view toggle
- ✅ Pagination
- ✅ Active filter tags
- ✅ URL-based state (shareable)

**To implement:**
- [ ] Connect to real product API
- [ ] Implement filter aggregations
- [ ] Add price range slider
- [ ] Add stock filter

### 2. Product Detail (`/products/[slug]`)

**File:** `src/app/products/[slug]/page.tsx`

Features:
- ✅ Image gallery with thumbnails
- ✅ B2B pricing with volume tiers
- ✅ Stock status per warehouse
- ✅ Specifications table (grouped)
- ✅ Documents & downloads
- ✅ Cross-references table
- ✅ Compatibility info
- ✅ Related products section
- ✅ Add to cart with quantity
- ✅ Add to favorites

**To implement:**
- [ ] Connect to real product API
- [ ] Image zoom functionality
- [ ] Video player integration
- [ ] Real-time stock updates
- [ ] Customer-specific pricing

### 3. Dealer Locator (`/dealers`)

**File:** `src/app/dealers/page.tsx`

Features:
- ✅ Search by city/postal code
- ✅ Category filters
- ✅ Service filters
- ✅ List view with cards
- ✅ Map view placeholder
- ✅ Opening hours display
- ✅ Open/closed status
- ✅ Direct contact links
- ✅ Google Maps directions

**To implement:**
- [ ] Integrate Leaflet or Google Maps
- [ ] Geolocation for "near me"
- [ ] Distance calculation
- [ ] Connect to dealer API

### 4. Customer Account (`/account`)

**File:** `src/app/account/page.tsx`

Features:
- ✅ Dashboard overview
- ✅ Quick stats (orders, lists, credit)
- ✅ Recent orders list
- ✅ Order detail view
- ✅ Order status tracking
- ✅ Shopping lists management
- ✅ Address management
- ✅ Company info display

**To implement:**
- [ ] Authentication integration
- [ ] Payment methods section
- [ ] Notification preferences
- [ ] Account settings
- [ ] Invoice downloads

### 5. Product Configurator (`/configurator`)

**File:** `src/app/configurator/page.tsx`

Features:
- ✅ Configurator type selection
- ✅ Step-by-step wizard
- ✅ Select/input/multi-select steps
- ✅ Real-time price calculation
- ✅ Configuration summary sidebar
- ✅ Generated SKU
- ✅ Validation with errors
- ✅ Progress indicator

**To implement:**
- [ ] Save/load configurations
- [ ] PDF export
- [ ] Share configuration link
- [ ] Add to cart integration
- [ ] More configurator types

### 6. Academy (`/academy`)

**File:** `src/app/academy/page.tsx`

Features:
- ✅ Course catalog grid
- ✅ Category/level filters
- ✅ Free course filter
- ✅ Search courses
- ✅ Course cards with meta
- ✅ Certificate badges
- ✅ Rating display

**To implement:**
- [ ] Course detail page
- [ ] Video player
- [ ] Quiz functionality
- [ ] Progress tracking
- [ ] Certificate generation
- [ ] My learning dashboard

---

## API Endpoints

### Products API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | Search/list products |
| `/api/products` | POST | Create product (admin) |
| `/api/products/[id]` | GET | Get single product |
| `/api/products/[id]` | PUT | Update product (admin) |
| `/api/products/[id]` | DELETE | Delete product (admin) |

### Inventory API (existing)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | Get stock levels |
| `/api/inventory` | POST | Bulk stock update |
| `/api/inventory/[sku]` | GET | Get stock for SKU |

### Delivery API (existing)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/delivery` | GET | Track shipment |
| `/api/delivery` | POST | Create shipment |

### Webhooks (existing)

| Endpoint | Source | Description |
|----------|--------|-------------|
| `/api/webhooks/inventory` | ERP | Stock updates |
| `/api/webhooks/delivery` | Carriers | Shipment updates |

---

## Service Layer

### API Client (`src/lib/api.ts`)

Centralized API client with:
- Authentication token management
- Request/response handling
- Error handling
- Query parameter building

### API Services

| Service | Description |
|---------|-------------|
| `productApi` | Product CRUD and search |
| `categoryApi` | Category management |
| `companyApi` | Dealer/company data |
| `authApi` | Authentication |
| `orderApi` | Order management |
| `cartApi` | Shopping cart |
| `shoppingListApi` | Saved lists |
| `courseApi` | Academy courses |
| `inventoryApi` | Stock queries |
| `configuratorApi` | Product configuration |

### React Hooks (`src/hooks/useApi.ts`)

| Hook | Description |
|------|-------------|
| `useApi` | Generic data fetching with cache |
| `useMutation` | POST/PUT/DELETE operations |
| `usePaginated` | Paginated data with navigation |
| `useInfinite` | Infinite scroll loading |
| `useDebouncedSearch` | Search with debounce |
| `useLocalStorage` | Persistent local state |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  Pages (React)  →  Hooks (useApi)  →  Services (api.ts)         │
│       ↓                  ↓                    ↓                  │
│  Components      State Management      API Client                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES                                  │
├─────────────────────────────────────────────────────────────────┤
│  /api/products  │  /api/inventory  │  /api/orders  │  etc.      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE                                    │
├─────────────────────────────────────────────────────────────────┤
│  Products  │  Categories  │  Customers  │  Orders  │  Stock     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SYSTEMS                               │
├─────────────────────────────────────────────────────────────────┤
│  ERP (DEMA, Fluxer, etc.)  │  Carriers (UPS, DHL)  │  PIM       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Set up database (PostgreSQL/Prisma recommended)
- [ ] Implement authentication (NextAuth.js)
- [ ] Create product data import pipeline
- [ ] Connect ERP webhooks

### Phase 2: Product Catalog
- [ ] Import product data from PIM/ERP
- [ ] Implement search with Elasticsearch/Algolia
- [ ] Set up image CDN
- [ ] Configure filter aggregations

### Phase 3: Customer Features
- [ ] Customer registration flow
- [ ] B2B pricing rules engine
- [ ] Shopping cart persistence
- [ ] Order creation flow

### Phase 4: Integrations
- [ ] Real-time stock from ERP
- [ ] Carrier tracking integration
- [ ] Payment gateway (invoice/credit)
- [ ] Email notifications

### Phase 5: Advanced Features
- [ ] Product configurator backend
- [ ] Academy LMS integration
- [ ] Map integration (Leaflet)
- [ ] Mobile optimization

---

## File Structure

```
apps/portal/src/
├── app/
│   ├── account/
│   │   └── page.tsx          # Customer dashboard
│   ├── academy/
│   │   └── page.tsx          # Training courses
│   ├── api/
│   │   ├── products/
│   │   │   ├── route.ts      # Products list/search
│   │   │   └── [id]/
│   │   │       └── route.ts  # Single product
│   │   ├── inventory/        # Stock APIs
│   │   ├── delivery/         # Tracking APIs
│   │   └── webhooks/         # ERP/Carrier webhooks
│   ├── configurator/
│   │   └── page.tsx          # Product configurator
│   ├── dealers/
│   │   └── page.tsx          # Dealer locator
│   ├── products/
│   │   ├── page.tsx          # Product listing
│   │   └── [slug]/
│   │       └── page.tsx      # Product detail
│   └── page.tsx              # Homepage
├── components/               # Shared components
├── config/
│   ├── brands.ts             # Company brands
│   ├── catalog.ts            # Product catalog
│   └── products.ts           # Product config
├── contexts/                 # React contexts
├── hooks/
│   └── useApi.ts             # Data fetching hooks
├── lib/
│   └── api.ts                # API service layer
├── locales/                  # i18n translations
└── types/
    └── index.ts              # TypeScript definitions
```

---

## Next Steps

1. **Choose a database** - PostgreSQL with Prisma ORM recommended
2. **Set up authentication** - NextAuth.js with credentials provider
3. **Import product data** - Use the PIM import tool already built
4. **Configure search** - Algolia or Elasticsearch for faceted search
5. **Connect ERP** - Use existing webhook architecture

The blueprint is ready - just add your data! 🚀
