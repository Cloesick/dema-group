# Technical Architecture

## Platform Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UNIFIED PLATFORM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      PRESENTATION LAYER                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ Web App  │  │ Mobile   │  │ B2B      │  │ AI       │            │   │
│  │  │ (Next.js)│  │ (PWA)    │  │ Portal   │  │ Chatbot  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                        API LAYER (REST + GraphQL)                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ Product  │  │ Order    │  │ Customer │  │ Search   │            │   │
│  │  │ API      │  │ API      │  │ API      │  │ API      │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                       SERVICE LAYER                                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ Catalog  │  │ Pricing  │  │ Inventory│  │ Fulfillment│          │   │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │PostgreSQL│  │ Redis    │  │Elasticsearch│ │ S3/Blob │            │   │
│  │  │(Primary) │  │ (Cache)  │  │ (Search)  │  │ (Media) │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────┐    ┌───────────┐    ┌───────────┐
            │   ERP     │    │   CRM     │    │  Payment  │
            │ (Backend) │    │ (Hubspot) │    │ (Mollie)  │
            └───────────┘    └───────────┘    └───────────┘
```

---

## Technology Stack

### Frontend (Presentation Layer)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Web Framework** | Next.js 14 (React) | Already used in DEMA webshop, SSR, SEO |
| **Styling** | Tailwind CSS | Rapid development, consistent design |
| **UI Components** | shadcn/ui | Modern, accessible, customizable |
| **State Management** | Zustand | Lightweight, already in DEMA |
| **Icons** | Lucide React | Consistent iconography |
| **Forms** | React Hook Form + Zod | Validation, performance |

### Backend (API & Services)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **API Framework** | Next.js API Routes | Unified with frontend |
| **Database** | PostgreSQL (Supabase/Neon) | Reliable, scalable, JSON support |
| **Cache** | Redis (Upstash) | Session, cart, frequent queries |
| **Search** | Elasticsearch / Algolia | Fast product search, faceting |
| **File Storage** | Cloudflare R2 / AWS S3 | Product images, PDFs |
| **AI/ML** | OpenAI API | Chatbot, product recommendations |

### Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Hosting** | Vercel | Already used, excellent DX |
| **CDN** | Vercel Edge / Cloudflare | Global performance |
| **Monitoring** | Vercel Analytics + Sentry | Error tracking, performance |
| **CI/CD** | GitHub Actions | Automated deployments |

### Integrations

| System | Integration Method | Purpose |
|--------|-------------------|---------|
| **ERP** | REST API / Webhooks | Orders, inventory, pricing |
| **CRM** | HubSpot API | Customer data, marketing |
| **Payment** | Mollie / Stripe | B2B payments, invoicing |
| **Shipping** | PostNL / DPD API | Delivery tracking |
| **Email** | SendGrid / Resend | Transactional emails |

---

## Data Architecture

### Product Data Model

```typescript
// Core Product Schema
interface ProductGroup {
  id: string;
  name: string;
  description: {
    nl: string;
    en: string;
    fr: string;
  };
  category_id: string;
  brand_id: string;
  source_company: 'dema' | 'fluxer' | 'beltz247' | 'devisschere' | 'accu';
  media: {
    images: string[];
    documents: string[];
    videos: string[];
  };
  variants: ProductVariant[];
  attributes: Record<string, any>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  created_at: Date;
  updated_at: Date;
}

interface ProductVariant {
  sku: string;
  name: string;
  price: {
    excl_btw: number;
    incl_btw: number;
    currency: 'EUR';
  };
  stock: {
    available: number;
    warehouse: string;
    lead_time_days: number;
  };
  properties: Record<string, any>;
  weight_kg: number;
  dimensions: {
    length_mm: number;
    width_mm: number;
    height_mm: number;
  };
}
```

### Category Hierarchy

```
Root
├── Pumps & Accessories (DEMA)
│   ├── Submersible Pumps
│   ├── Centrifugal Pumps
│   ├── Well Pumps
│   └── Pump Accessories
├── Piping & Fittings (DEMA + Fluxer)
│   ├── Plastic Pipes
│   ├── Metal Pipes
│   ├── Fittings
│   └── Valves (Fluxer)
├── Industrial Hoses (DEMA)
│   ├── Rubber Hoses
│   ├── PVC Hoses
│   └── Couplings
├── Valves & Instrumentation (Fluxer)
│   ├── Ball Valves
│   ├── Gate Valves
│   ├── Control Valves
│   └── Instrumentation
├── Conveyor Systems (Beltz247)
│   ├── Conveyor Belts
│   ├── Belt Accessories
│   └── Maintenance Parts
├── Irrigation (DEMA + De Visschere)
│   ├── Sprinklers
│   ├── Drip Systems
│   └── Controllers
├── Power Tools (DEMA)
│   ├── Makita
│   ├── Kränzle
│   └── Airpress
└── Precision Components (Accu)
    ├── Fasteners
    ├── Standoffs
    └── Custom Parts
```

### Customer Data Model

```typescript
interface Customer {
  id: string;
  type: 'business' | 'individual';
  company: {
    name: string;
    vat_number: string;
    industry: string;
  };
  contacts: Contact[];
  addresses: Address[];
  payment_terms: {
    credit_limit: number;
    payment_days: number;
    payment_method: string;
  };
  pricing_group: string;
  source_company: string; // Original company relationship
  preferences: {
    language: 'nl' | 'en' | 'fr';
    currency: 'EUR';
    notifications: boolean;
  };
}
```

---

## Integration Architecture

### ERP Integration

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Platform   │◄───────►│  Integration│◄───────►│    ERP      │
│  (Next.js)  │   API   │    Layer    │   API   │  (Odoo/SAP) │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               │ Sync Jobs
                               ▼
                        ┌─────────────┐
                        │   Message   │
                        │   Queue     │
                        │  (Redis)    │
                        └─────────────┘
```

### Data Sync Patterns

| Data Type | Sync Direction | Frequency | Method |
|-----------|---------------|-----------|--------|
| Products | ERP → Platform | Real-time | Webhook |
| Inventory | ERP → Platform | Every 5 min | Polling |
| Prices | ERP → Platform | Daily | Batch |
| Orders | Platform → ERP | Real-time | API |
| Customers | Bidirectional | Real-time | API |

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AUTHENTICATION (NextAuth.js)            │   │
│  │  • Email/Password                                    │   │
│  │  • Magic Links                                       │   │
│  │  • SSO (future: Azure AD for enterprise)            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AUTHORIZATION (RBAC)                    │   │
│  │  • Admin: Full access                               │   │
│  │  • Sales: Customer + order management               │   │
│  │  • Customer: Own account + orders                   │   │
│  │  • Guest: Browse only                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DATA PROTECTION                         │   │
│  │  • HTTPS everywhere                                 │   │
│  │  • Data encryption at rest                          │   │
│  │  • GDPR compliance                                  │   │
│  │  • Regular security audits                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Scale (Phase 1)
- Products: 50,000 SKUs
- Users: 1,000 concurrent
- Orders: 500/day
- Storage: 100GB

### Target Scale (Phase 3)
- Products: 200,000 SKUs
- Users: 10,000 concurrent
- Orders: 5,000/day
- Storage: 1TB

### Scaling Strategy

| Component | Scaling Approach |
|-----------|------------------|
| Web servers | Vercel auto-scaling |
| Database | Vertical scaling → Read replicas |
| Search | Elasticsearch cluster |
| Cache | Redis cluster |
| Storage | CDN + object storage |

---

## Development Workflow

### Git Branching Strategy

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/product-search
  │     ├── feature/checkout-flow
  │     └── bugfix/cart-issue
  │
  └── hotfix/critical-fix
```

### CI/CD Pipeline

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Push   │───►│  Build  │───►│  Test   │───►│ Deploy  │
│         │    │         │    │         │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                  │
                              ┌──────────────────┼──────────────────┐
                              │                  │                  │
                              ▼                  ▼                  ▼
                        ┌─────────┐        ┌─────────┐        ┌─────────┐
                        │   Dev   │        │ Staging │        │  Prod   │
                        │         │        │         │        │         │
                        └─────────┘        └─────────┘        └─────────┘
```

---

## Migration from DEMA Webshop

### Current DEMA Webshop Assets to Leverage

| Asset | Status | Action |
|-------|--------|--------|
| Next.js codebase | ✅ Ready | Extend for multi-company |
| AI Chatbot | ✅ Ready | Expand knowledge base |
| Product data structure | ✅ Ready | Scale to all companies |
| UI components | ✅ Ready | Rebrand as needed |
| Deployment (Vercel) | ✅ Ready | Continue using |

### Required Extensions

| Feature | Effort | Priority |
|---------|--------|----------|
| Multi-company product support | Medium | High |
| Customer accounts & auth | Medium | High |
| Order management | High | High |
| ERP integration | High | Medium |
| Advanced search (Elasticsearch) | Medium | Medium |
| B2B pricing tiers | Medium | Medium |

---

## Cost Estimates

### Monthly Infrastructure Costs

| Service | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| Vercel Pro | €20 | €50 | €150 |
| Database (Supabase) | €25 | €75 | €200 |
| Search (Algolia) | €0 | €50 | €150 |
| Storage (R2) | €10 | €30 | €100 |
| Email (SendGrid) | €15 | €30 | €50 |
| Monitoring | €0 | €30 | €50 |
| **Total/month** | **€70** | **€265** | **€700** |

---

*Document Version: 1.0*
*Date: December 2024*
