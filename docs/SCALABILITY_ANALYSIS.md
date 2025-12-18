# Scalability Analysis & Recommendations

## Current State Assessment

### What We Have Now

| Component | Current Implementation | Scalability Limit |
|-----------|----------------------|-------------------|
| **Data storage** | JSON files (~800MB) | ~50K products max |
| **Search** | Client-side filtering | ~5K products usable |
| **Hosting** | Vercel free tier | 100GB bandwidth/mo |
| **Auth** | None | N/A |
| **Cart** | Zustand (local) | Single session |
| **Images** | Static files | ~10GB practical |

### Bottlenecks Identified

```
CRITICAL:
├── JSON files loaded entirely into memory
├── No database = no inventory sync
└── No customer accounts = no B2B features

HIGH:
├── Search performance degrades >5K products
├── No caching layer
└── Each company = separate data silo

MEDIUM:
├── No CI/CD pipeline
├── No automated testing
└── Manual deployment process
```

---

## Scaling Phases

### Phase 1: Foundation (Current → Month 3)
**Goal:** Working prototype with real data

| Change | Effort | Impact |
|--------|--------|--------|
| Consolidate to single Next.js app | Medium | High |
| Add Supabase database | Medium | Critical |
| Implement basic auth | Medium | High |
| Add Meilisearch | Low | High |

**Architecture:**
```
┌─────────────────────────────────────┐
│         Next.js (Vercel)            │
│  ┌─────────────────────────────┐    │
│  │     Single Portal App       │    │
│  │  /dema  /fluxer  /beltz247  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────┐       ┌─────────┐
│Supabase │       │Meilisearch│
│PostgreSQL│      │ (Search) │
└─────────┘       └─────────┘
```

### Phase 2: Growth (Month 3 → Month 12)
**Goal:** Production-ready platform

| Change | Effort | Impact |
|--------|--------|--------|
| Redis caching | Low | Medium |
| Customer accounts + roles | High | Critical |
| Order management | High | Critical |
| ERP integration | High | High |
| Email notifications | Medium | Medium |

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    CDN (Cloudflare)                      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  Next.js (Vercel)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Portal    │  │   API       │  │   Admin     │     │
│  │   (SSR)     │  │   Routes    │  │   Panel     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
              │              │              │
    ┌─────────┴──────────────┴──────────────┴─────────┐
    ▼                   ▼                   ▼         ▼
┌─────────┐       ┌─────────┐       ┌─────────┐  ┌─────────┐
│Supabase │       │Meilisearch│     │  Redis  │  │ SendGrid│
│PostgreSQL│      │         │       │ (Cache) │  │ (Email) │
│ + Auth  │       └─────────┘       └─────────┘  └─────────┘
└─────────┘
     │
     ▼
┌─────────┐
│   ERP   │
│ (Odoo)  │
└─────────┘
```

### Phase 3: Scale (Month 12 → Month 36)
**Goal:** Multi-country, high-volume platform

| Change | Effort | Impact |
|--------|--------|--------|
| Dedicated PostgreSQL | Medium | High |
| Elasticsearch cluster | High | Medium |
| Multi-region deployment | High | Medium |
| Microservices (if needed) | Very High | Medium |

---

## Database Schema Design

### Core Tables

```sql
-- Companies (the 5 group companies)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,  -- 'dema', 'fluxer', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  contact_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (unified across companies)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_nl VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_fr VARCHAR(255),
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  category_id UUID REFERENCES categories(id),
  sku VARCHAR(100) NOT NULL,
  name_nl VARCHAR(500) NOT NULL,
  name_en VARCHAR(500),
  name_fr VARCHAR(500),
  description_nl TEXT,
  description_en TEXT,
  description_fr TEXT,
  brand VARCHAR(255),
  price_excl_vat DECIMAL(10,2),
  price_incl_vat DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  properties JSONB DEFAULT '{}',
  images TEXT[],
  pdf_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, sku)
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  label VARCHAR(255),
  price_excl_vat DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  properties JSONB DEFAULT '{}',
  
  UNIQUE(product_id, sku)
);

-- Customers (B2B)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id),
  company_name VARCHAR(255) NOT NULL,
  vat_number VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  pricing_tier VARCHAR(50) DEFAULT 'standard',
  credit_limit DECIMAL(10,2),
  payment_terms_days INT DEFAULT 30,
  source_company_id UUID REFERENCES companies(id),  -- Original relationship
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,  -- 'billing', 'shipping'
  street VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'BE',
  is_default BOOLEAN DEFAULT false
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10,2),
  vat_amount DECIMAL(10,2),
  total DECIMAL(10,2),
  shipping_address_id UUID REFERENCES customer_addresses(id),
  billing_address_id UUID REFERENCES customer_addresses(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### Row Level Security (RLS)

```sql
-- Customers can only see their own data
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer record"
  ON customers FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Orders visible only to owner
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );
```

---

## Performance Benchmarks

### Target Response Times

| Operation | Target | Acceptable | Current |
|-----------|--------|------------|---------|
| Page load (LCP) | <1.5s | <2.5s | ~2s |
| Search query | <200ms | <500ms | ~1s (client) |
| Product list (50 items) | <300ms | <500ms | ~500ms |
| Add to cart | <100ms | <200ms | ~50ms |
| Checkout | <500ms | <1s | N/A |

### Load Capacity Targets

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Concurrent users | 100 | 1,000 | 10,000 |
| Products in catalog | 50,000 | 200,000 | 500,000 |
| Orders/day | 100 | 1,000 | 5,000 |
| Search queries/min | 100 | 1,000 | 10,000 |

---

## Cost Scaling Model

### Monthly Costs by Stage

| Stage | Users | Products | Monthly Cost |
|-------|-------|----------|--------------|
| **MVP** | <100 | <10K | €0-50 |
| **Launch** | <1K | <50K | €50-150 |
| **Growth** | <10K | <200K | €150-500 |
| **Scale** | <100K | <500K | €500-2000 |

### Cost Breakdown at Growth Stage

```
Vercel Pro                    €20/mo
Supabase Pro                  €25/mo
Meilisearch Cloud             €30/mo
Upstash Redis                 €10/mo
SendGrid (10K emails)         €20/mo
Sentry                        €26/mo
Domain + SSL                  €2/mo
OpenAI API                    €50/mo
────────────────────────────────────
Total                         ~€183/mo
```

---

## Migration Strategy

### From JSON to Database

```typescript
// scripts/migrate-to-supabase.ts

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function migrateProducts() {
  // Load existing JSON data
  const catalogs = fs.readdirSync('./public/data')
    .filter(f => f.endsWith('_grouped.json'))
  
  for (const catalog of catalogs) {
    const data = JSON.parse(
      fs.readFileSync(`./public/data/${catalog}`, 'utf-8')
    )
    
    // Map to database schema
    const products = data.map(group => ({
      company_id: getCompanyId('dema'),  // Map based on catalog
      sku: group.group_id,
      name_nl: group.name,
      brand: group.brand,
      category_id: getCategoryId(group.category),
      properties: group.variants[0]?.properties || {},
      images: group.media?.images || [],
    }))
    
    // Batch insert
    const { error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'company_id,sku' })
    
    if (error) console.error(`Error migrating ${catalog}:`, error)
    else console.log(`Migrated ${products.length} products from ${catalog}`)
  }
}

migrateProducts()
```

### Search Index Sync

```typescript
// lib/search-sync.ts

import { MeiliSearch } from 'meilisearch'

const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY!,
})

export async function syncProductToSearch(product: Product) {
  await meili.index('products').addDocuments([{
    id: product.id,
    sku: product.sku,
    name: product.name_nl,
    name_en: product.name_en,
    name_fr: product.name_fr,
    brand: product.brand,
    category: product.category?.name_nl,
    company: product.company?.slug,
    price: product.price_excl_vat,
    properties: product.properties,
  }])
}

// Supabase trigger to auto-sync
// CREATE TRIGGER sync_product_search
//   AFTER INSERT OR UPDATE ON products
//   FOR EACH ROW EXECUTE FUNCTION notify_search_sync();
```

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database migration fails | Medium | High | Test with subset first, keep JSON backup |
| Search index out of sync | Medium | Medium | Real-time sync + daily full reindex |
| Vercel costs spike | Low | Medium | Set spending limits, monitor usage |
| Performance degradation | Medium | High | Load testing before launch |
| Data loss | Low | Critical | Daily backups, point-in-time recovery |

---

## Recommended Immediate Actions

### This Week
1. ✅ Consolidate to single portal app (done)
2. ⬜ Set up Supabase project
3. ⬜ Create database schema
4. ⬜ Migrate product data

### This Month
1. ⬜ Implement Meilisearch
2. ⬜ Add basic authentication
3. ⬜ Set up CI/CD pipeline
4. ⬜ Deploy to production

### This Quarter
1. ⬜ Customer accounts
2. ⬜ Order management
3. ⬜ ERP integration planning
4. ⬜ Performance optimization

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Review: Monthly during development*
