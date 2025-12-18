# Migration Path & Enterprise Platform Architecture

## Executive Summary

This document addresses the migration path from GitHub + Vercel to enterprise infrastructure, and the architecture needed to manage all 5 companies from a unified platform.

**Key Question:** How easy is it to scale from current setup to enterprise?

**Answer:** **Moderately easy** if we architect correctly from the start. The code is portable; the challenge is data and services.

---

## Current State vs Target State

### Current (dema-webshop)

```
Single company (DEMA)
├── Next.js frontend
├── JSON file data
├── No user accounts
├── No inventory sync
├── No order management
└── Vercel hosting
```

### Target (DEMA Group Platform)

```
5 companies unified
├── Single portal with company sections
├── PostgreSQL database (multi-tenant)
├── Unified customer accounts
├── Real-time inventory
├── Order management + ERP
├── Marketing automation
├── Analytics dashboard
└── Scalable infrastructure
```

---

## Migration Difficulty Assessment

### What's Easy to Migrate

| Component | Difficulty | Notes |
|-----------|------------|-------|
| **Next.js code** | ✅ Easy | Runs anywhere Node.js runs |
| **React components** | ✅ Easy | Framework-agnostic |
| **Tailwind CSS** | ✅ Easy | Just CSS, no lock-in |
| **Static assets** | ✅ Easy | Copy to any CDN/storage |
| **API routes** | ✅ Easy | Standard REST, portable |

### What Requires Work

| Component | Difficulty | Notes |
|-----------|------------|-------|
| **Vercel-specific features** | 🟡 Medium | Edge functions, ISR need alternatives |
| **JSON → Database** | 🟡 Medium | Schema design, migration scripts |
| **Add authentication** | 🟡 Medium | New system needed |
| **Multi-tenant data** | 🟠 Hard | Architecture decision |
| **ERP integration** | 🟠 Hard | Complex, company-specific |

### What's Hard

| Component | Difficulty | Notes |
|-----------|------------|-------|
| **Real-time inventory** | 🔴 Complex | Requires ERP sync |
| **Order management** | 🔴 Complex | Business logic heavy |
| **Marketing automation** | 🔴 Complex | Third-party integrations |
| **Multi-company permissions** | 🔴 Complex | RBAC system needed |

---

## Enterprise Platform Architecture

### Multi-Tenant Design Options

#### Option A: Single Database, Company Column

```sql
-- All companies in one database, filtered by company_id
CREATE TABLE products (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),  -- Filter key
  sku VARCHAR(100),
  name VARCHAR(500),
  ...
);

-- Row Level Security
CREATE POLICY company_isolation ON products
  USING (company_id = current_setting('app.current_company')::uuid);
```

**Pros:** Simple, single deployment
**Cons:** Data isolation concerns, single point of failure

#### Option B: Separate Schemas per Company

```sql
-- Each company has its own schema
CREATE SCHEMA dema;
CREATE SCHEMA fluxer;
CREATE SCHEMA beltz247;

-- Tables duplicated per schema
CREATE TABLE dema.products (...);
CREATE TABLE fluxer.products (...);
```

**Pros:** Better isolation, easier compliance
**Cons:** More complex queries, schema sync needed

#### Option C: Separate Databases (Recommended for Scale)

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Services                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │   Search    │  │  Analytics  │         │
│  │  (Unified)  │  │  (Unified)  │  │  (Unified)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────┬───────────┼───────────┬─────────┐
        ▼         ▼           ▼           ▼         ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  DEMA   │ │ Fluxer  │ │Beltz247 │ │DeVissch.│ │  Accu   │
   │   DB    │ │   DB    │ │   DB    │ │   DB    │ │   DB    │
   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**Pros:** Full isolation, independent scaling, compliance-ready
**Cons:** More infrastructure, cross-company queries harder

### Recommended: Hybrid Approach

```
┌─────────────────────────────────────────────────────────────┐
│                   DEMA GROUP PORTAL                          │
│              (Single Next.js Application)                    │
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │  /dema  │ │/fluxer  │ │/beltz247│ │/devissch│ │ /accu  ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│              (Next.js API Routes or tRPC)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   SHARED DB   │   │    SEARCH     │   │    CACHE      │
│  (PostgreSQL) │   │ (Meilisearch) │   │   (Redis)     │
│               │   │               │   │               │
│ • Users       │   │ • All products│   │ • Sessions    │
│ • Companies   │   │ • Unified     │   │ • Cart        │
│ • Products    │   │   index       │   │ • Rate limits │
│ • Orders      │   │               │   │               │
│ • Inventory   │   │               │   │               │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## Complete Platform Features

### 1. User Management

```typescript
// User roles and permissions
interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'sales' | 'customer';
  company_id?: string;        // null for super_admin
  permissions: Permission[];
}

interface Permission {
  resource: 'products' | 'orders' | 'customers' | 'reports';
  actions: ('read' | 'write' | 'delete')[];
  company_scope: 'own' | 'all';  // own company or all companies
}
```

### 2. Customer Accounts

```typescript
interface Customer {
  id: string;
  company_name: string;
  vat_number: string;
  
  // Multi-company relationship
  company_relationships: {
    company_id: string;       // DEMA, Fluxer, etc.
    customer_number: string;  // Company-specific ID
    pricing_tier: string;
    credit_limit: number;
    payment_terms: number;
  }[];
  
  // Unified across companies
  addresses: Address[];
  contacts: Contact[];
  preferences: Preferences;
}
```

### 3. Unified Product Catalog

```typescript
interface Product {
  id: string;
  company_id: string;         // Which company sells this
  
  // Basic info
  sku: string;
  name: MultiLang;
  description: MultiLang;
  
  // Categorization
  category_id: string;
  brand: string;
  
  // Pricing (can vary by customer)
  base_price: number;
  pricing_rules: PricingRule[];
  
  // Inventory
  stock_quantity: number;
  warehouse_location: string;
  reorder_point: number;
  
  // Cross-company
  related_products: string[]; // Products from other companies
  alternatives: string[];
}
```

### 4. Order Management

```typescript
interface Order {
  id: string;
  order_number: string;
  
  // Multi-company support
  company_id: string;         // Which company fulfills
  customer_id: string;
  
  // Items can span companies (marketplace model)
  items: OrderItem[];
  
  // Status tracking
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  
  // Integration
  erp_reference?: string;
  shipping_tracking?: string;
}
```

### 5. Marketing & CRM

```typescript
interface MarketingFeatures {
  // Email campaigns
  email_lists: EmailList[];
  campaigns: Campaign[];
  templates: EmailTemplate[];
  
  // Customer segmentation
  segments: CustomerSegment[];
  
  // Promotions
  promotions: Promotion[];
  discount_codes: DiscountCode[];
  
  // Analytics
  campaign_metrics: CampaignMetrics[];
  customer_lifetime_value: CLVData[];
}
```

### 6. Analytics Dashboard

```typescript
interface DashboardMetrics {
  // Per company
  company_metrics: {
    company_id: string;
    revenue: TimeSeriesData;
    orders: TimeSeriesData;
    customers: TimeSeriesData;
    top_products: ProductMetric[];
  }[];
  
  // Group-wide
  group_metrics: {
    total_revenue: number;
    total_orders: number;
    cross_sell_revenue: number;  // Sales across companies
    customer_overlap: number;    // Customers buying from multiple
  };
}
```

---

## Migration Phases

### Phase 1: Foundation (Months 1-3)

**Goal:** Single codebase, basic multi-company support

```
Week 1-4: Database Setup
├── Set up Supabase/PostgreSQL
├── Design multi-tenant schema
├── Migrate DEMA product data
└── Basic auth with company roles

Week 5-8: Unified Portal
├── Merge dema-webshop into portal
├── Add company routing (/dema, /fluxer, etc.)
├── Implement company-aware components
└── Unified search across companies

Week 9-12: Customer Accounts
├── Customer registration
├── Company-customer relationships
├── Basic order history
└── Quote management
```

**Infrastructure:** GitHub + Vercel + Supabase
**Cost:** ~€50/month

### Phase 2: Integration (Months 4-6)

**Goal:** Real business operations

```
Week 13-16: Order Management
├── Shopping cart (multi-company)
├── Checkout flow
├── Order processing
└── Email notifications

Week 17-20: Inventory & ERP
├── Inventory tracking
├── ERP integration planning
├── Stock sync (manual first)
└── Reorder alerts

Week 21-24: Admin Dashboard
├── Company admin panels
├── User management
├── Basic reporting
└── Product management UI
```

**Infrastructure:** Same + Meilisearch + Redis
**Cost:** ~€100/month

### Phase 3: Scale (Months 7-12)

**Goal:** Enterprise-ready platform

```
Month 7-8: Marketing
├── Email campaign system
├── Customer segmentation
├── Promotion engine
└── Analytics integration

Month 9-10: Advanced Features
├── B2B pricing rules
├── Quote workflows
├── Approval chains
└── Credit management

Month 11-12: Infrastructure Scale
├── Evaluate AWS/dedicated hosting
├── Performance optimization
├── Security audit
└── Compliance review
```

**Infrastructure:** Migrate to AWS or Hetzner if needed
**Cost:** €200-500/month

---

## Infrastructure Migration Path

### From Vercel to Self-Hosted

#### Step 1: Containerize

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

#### Step 2: Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/demagroup
    depends_on:
      - db
      - redis
      - meilisearch

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=demagroup
      - POSTGRES_PASSWORD=password

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:latest
    volumes:
      - meili_data:/meili_data

volumes:
  postgres_data:
  redis_data:
  meili_data:
```

#### Step 3: Kubernetes (Production Scale)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dema-portal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dema-portal
  template:
    metadata:
      labels:
        app: dema-portal
    spec:
      containers:
      - name: portal
        image: demagroup/portal:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
```

### Migration Checklist

```
□ Containerize application (Docker)
□ Set up CI/CD pipeline (GitHub Actions)
□ Provision infrastructure (Hetzner/AWS)
□ Set up managed database (or self-host PostgreSQL)
□ Configure load balancer
□ Set up SSL certificates
□ Configure DNS
□ Migrate data
□ Test thoroughly
□ Switch DNS (zero-downtime)
□ Monitor and optimize
```

---

## Cost Comparison at Scale

### 5 Companies, 50K Products, 10K Monthly Orders

| Setup | Monthly Cost | Pros | Cons |
|-------|-------------|------|------|
| **Vercel + Supabase** | €200-400 | Simple, managed | Limited control |
| **Hetzner + Self-hosted** | €100-200 | Cheap, full control | DevOps needed |
| **AWS Full** | €500-1000 | Enterprise, scalable | Complex, expensive |
| **Hybrid (Vercel + Hetzner)** | €150-300 | Best of both | Some complexity |

### Recommended Path

| Phase | Infrastructure | Monthly Cost |
|-------|---------------|--------------|
| **MVP** | Vercel + Supabase | €50 |
| **Launch** | Vercel + Supabase Pro | €100 |
| **Growth** | Vercel + Hetzner backend | €200 |
| **Scale** | Full Hetzner or AWS | €300-500 |

---

## Key Architectural Decisions

### Decision 1: Single App vs Micro-Frontends

**Recommendation: Single App**

```
✅ Single Next.js app with company routes
   /dema, /fluxer, /beltz247, etc.

❌ Separate apps per company
   dema.demagroup.be, fluxer.demagroup.be
```

**Why:** Simpler deployment, shared components, unified auth.

### Decision 2: Database Strategy

**Recommendation: Single Database with Row-Level Security**

```
✅ One PostgreSQL with company_id filtering
❌ Separate databases per company
```

**Why:** Simpler queries, easier cross-company features, Supabase supports this well.

### Decision 3: Authentication

**Recommendation: Supabase Auth → Migrate to Auth0 if needed**

```
Phase 1-2: Supabase Auth (free, simple)
Phase 3+:  Auth0 or Keycloak (if enterprise SSO needed)
```

### Decision 4: Search

**Recommendation: Meilisearch**

```
✅ Meilisearch (unified index, all companies)
❌ Per-company search indexes
```

**Why:** Cross-company search is a key feature, single index is simpler.

---

## Summary

### Migration Difficulty: **Moderate**

| Aspect | Difficulty | Time |
|--------|------------|------|
| Code migration | Easy | 1-2 weeks |
| Database setup | Medium | 2-4 weeks |
| Multi-tenant architecture | Medium | 4-6 weeks |
| User management | Medium | 2-4 weeks |
| Full platform features | Hard | 6-12 months |

### Key Success Factors

1. **Design for multi-tenant from start** - Don't bolt it on later
2. **Use managed services initially** - Supabase, Vercel, etc.
3. **Containerize early** - Makes migration trivial
4. **Abstract infrastructure** - Don't hard-code Vercel-specific features
5. **Plan data migration** - JSON → PostgreSQL is the biggest task

### Bottom Line

**The code is portable.** Next.js runs anywhere. The real work is:
- Designing the multi-company data model
- Building the business features (orders, inventory, CRM)
- Integrating with existing ERPs

**Start simple, scale when needed.** Vercel + Supabase can handle significant load. Only migrate to dedicated infrastructure when you have clear requirements that justify the complexity.

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Review: Before each phase transition*
