# Architecture Decision Records (ADR)

## Overview

This document captures key architectural decisions, their rationale, alternatives considered, and trade-offs.

---

## ADR-001: Monorepo vs Multi-Repo

### Decision
**Monorepo with Turborepo**

### Context
Need to manage 5+ company websites with shared components.

### Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Monorepo (chosen)** | Shared code, atomic changes, single CI | Complexity, large repo |
| **Multi-repo** | Simple, independent deploys | Code duplication, version drift |
| **npm packages** | Clean separation | Publishing overhead, slower iteration |

### Trade-offs Accepted
- Higher initial setup complexity
- Requires team to learn Turborepo
- Larger git clone size

### Revisit If
- Team struggles with monorepo workflow
- Build times exceed 10 minutes
- Need to open-source individual packages

---

## ADR-002: Package Manager

### Decision
**pnpm** (with npm fallback documented)

### Rationale
- Faster installs (symlinked node_modules)
- Disk space efficient
- Native workspace support
- Strict dependency resolution

### Fallback
If pnpm causes issues:
```bash
# Switch to npm workspaces
# 1. Delete pnpm-workspace.yaml
# 2. Update package.json:
{
  "workspaces": ["apps/*", "packages/*"]
}
# 3. Run: npm install
```

---

## ADR-003: Database Strategy

### Decision
**Phase 1: JSON → Phase 2: PostgreSQL + Supabase**

### Current State (Phase 1)
- JSON files in `/public/data/`
- Client-side search
- No real-time inventory

### Target State (Phase 2)

| Component | Technology | Why |
|-----------|------------|-----|
| **Database** | PostgreSQL (Supabase) | Relational, proven, free tier |
| **Search** | Supabase Full-Text or Meilisearch | Fast, typo-tolerant |
| **Cache** | Vercel Edge + Redis (Upstash) | Low latency |
| **CDN** | Vercel/Cloudflare | Static assets |

### Migration Path
```
Phase 1 (Now)     → Phase 2 (Month 3)      → Phase 3 (Month 12)
JSON files        → Supabase PostgreSQL    → Dedicated PostgreSQL
Client search     → Meilisearch            → Elasticsearch
No cache          → Redis (Upstash)        → Redis Cluster
```

### Recommended Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js (Vercel) - Portal + Company Sites                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  Next.js API Routes + tRPC (type-safe)                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Supabase    │   │  Meilisearch  │   │    Redis      │
│  PostgreSQL   │   │   (Search)    │   │   (Cache)     │
│               │   │               │   │               │
│ • Products    │   │ • Product     │   │ • Sessions    │
│ • Customers   │   │   index       │   │ • Cart        │
│ • Orders      │   │ • Filters     │   │ • Rate limit  │
│ • Inventory   │   │               │   │               │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## ADR-004: Authentication

### Decision
**Supabase Auth** (or NextAuth.js as alternative)

### Requirements
- B2B customer accounts
- Multiple users per company
- Role-based access (buyer, approver, admin)
- SSO ready (future)

### Comparison

| Feature | Supabase Auth | NextAuth.js | Auth0 |
|---------|---------------|-------------|-------|
| Cost | Free tier | Free | Paid |
| Setup | Easy | Medium | Easy |
| B2B features | Basic | DIY | Excellent |
| Self-host | Yes | Yes | No |
| Database integration | Native | Manual | Manual |

### Recommendation
**Supabase Auth** for simplicity since we're already using Supabase for database.

---

## ADR-005: Search Strategy

### Decision
**Meilisearch** (self-hosted or cloud)

### Why Not Alternatives

| Option | Issue |
|--------|-------|
| Supabase Full-Text | Limited fuzzy matching, no facets |
| Algolia | Expensive at scale (€500+/month) |
| Elasticsearch | Complex to manage |
| Client-side | Won't scale past 10K products |

### Meilisearch Benefits
- Typo-tolerant by default
- Faceted search (filters)
- Fast (<50ms)
- Free self-hosted, affordable cloud
- Easy setup

### Implementation
```typescript
// Example search integration
import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_KEY,
})

// Search with filters
const results = await client.index('products').search('pump', {
  filter: ['company = dema', 'category = submersible'],
  facets: ['brand', 'category', 'price_range'],
  limit: 20,
})
```

---

## ADR-006: Deployment Strategy

### Decision
**Single Vercel Project with Path Routing** (not multiple projects)

### Problem with Current Approach
6 Vercel projects = 6 × builds, 6 × domains, 6 × costs

### Better Approach
Single Next.js app with dynamic routing:

```
demagroup.be/              → Portal home
demagroup.be/products      → Unified catalog
demagroup.be/dema          → DEMA section
demagroup.be/fluxer        → Fluxer section
demagroup.be/beltz247      → Beltz247 section
```

### Implementation
```
apps/
└── portal/                 # Single deployable app
    └── src/app/
        ├── page.tsx        # Home
        ├── products/       # Unified catalog
        ├── dema/           # DEMA routes
        │   ├── page.tsx
        │   └── [category]/
        ├── fluxer/         # Fluxer routes
        └── ...
```

### Trade-offs
- ✅ Single deployment
- ✅ Shared authentication
- ✅ Unified cart/checkout
- ❌ Larger bundle (mitigated by code splitting)
- ❌ Single point of failure

---

## ADR-007: State Management

### Decision
**Zustand + React Query**

### Responsibilities

| Tool | Purpose |
|------|---------|
| **Zustand** | Client state (cart, UI, preferences) |
| **React Query** | Server state (products, orders, user data) |
| **URL params** | Filters, search, pagination |

### Why Not Redux
- Overkill for this use case
- More boilerplate
- Zustand is simpler and sufficient

---

## ADR-008: Internationalization

### Decision
**next-intl** with URL-based locale

### URL Structure
```
demagroup.be/nl/products    # Dutch
demagroup.be/en/products    # English  
demagroup.be/fr/products    # French
```

### Content Strategy
| Content Type | Storage | Translation |
|--------------|---------|-------------|
| UI strings | JSON files | Manual |
| Product names | Database | Per-product field |
| Product descriptions | Database | Per-product field |
| Categories | Database | Lookup table |

---

## ADR-009: CI/CD Pipeline

### Decision
**GitHub Actions → Vercel**

### Pipeline Stages

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build

  # Vercel handles deployment automatically
```

---

## ADR-010: Cost Projections

### Monthly Costs at Scale

| Service | Free Tier | Growth (€50K MRR) | Scale (€200K MRR) |
|---------|-----------|-------------------|-------------------|
| **Vercel** | €0 | €20/mo | €150/mo |
| **Supabase** | €0 | €25/mo | €100/mo |
| **Meilisearch Cloud** | €0 (self-host) | €30/mo | €100/mo |
| **Upstash Redis** | €0 | €10/mo | €50/mo |
| **Domain** | - | €15/yr | €15/yr |
| **Email (SendGrid)** | €0 | €20/mo | €100/mo |
| **Monitoring (Sentry)** | €0 | €26/mo | €80/mo |
| **Total** | **€0** | **~€130/mo** | **~€580/mo** |

### Self-Hosted Alternative
If costs become concern, can self-host on:
- Hetzner VPS: €20-50/mo for all services
- Requires DevOps expertise

---

## Summary: Recommended Tech Stack

### Immediate (Phase 1)
| Layer | Technology | Cost |
|-------|------------|------|
| Frontend | Next.js 14 | Free |
| Hosting | Vercel | Free |
| Database | JSON → Supabase | Free |
| Auth | Supabase Auth | Free |
| AI Chat | OpenAI GPT-4 | ~€50/mo |

### Growth (Phase 2)
| Layer | Technology | Cost |
|-------|------------|------|
| Search | Meilisearch Cloud | €30/mo |
| Cache | Upstash Redis | €10/mo |
| Email | SendGrid | €20/mo |
| Monitoring | Sentry | €26/mo |

### Scale (Phase 3)
| Layer | Technology | Cost |
|-------|------------|------|
| Database | Supabase Pro | €100/mo |
| CDN | Cloudflare Pro | €20/mo |
| Analytics | PostHog | €50/mo |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Review: Quarterly or after major decisions*
