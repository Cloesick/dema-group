# Technology Stack & Services Guide

## Overview

This document provides a comprehensive guide to all technologies, services, and tools used in the DEMA Group platform.

---

## Core Stack

### Frontend Framework

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Next.js** | 14.x | React framework with SSR/SSG | [nextjs.org/docs](https://nextjs.org/docs) |
| **React** | 18.x | UI library | [react.dev](https://react.dev) |
| **TypeScript** | 5.x | Type safety | [typescriptlang.org](https://www.typescriptlang.org/docs/) |

**Why Next.js?**
- Server-side rendering for SEO (critical for e-commerce)
- API routes (no separate backend needed initially)
- Image optimization built-in
- Vercel integration (same company)
- App Router with React Server Components

### Styling

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Tailwind CSS** | Utility-first CSS | [tailwindcss.com](https://tailwindcss.com/docs) |
| **shadcn/ui** | Component library | [ui.shadcn.com](https://ui.shadcn.com) |
| **Lucide React** | Icons | [lucide.dev](https://lucide.dev) |

**Why Tailwind?**
- No CSS file management
- Consistent design system
- Small bundle size (purges unused CSS)
- Works great with component libraries

### State Management

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Zustand** | Client state (cart, UI) | [zustand](https://github.com/pmndrs/zustand) |
| **TanStack Query** | Server state (API data) | [tanstack.com/query](https://tanstack.com/query) |

**State Responsibilities:**
```
Zustand:
├── Shopping cart
├── UI preferences (language, theme)
├── Quote basket
└── Temporary form state

TanStack Query:
├── Product data
├── User profile
├── Order history
└── Search results
```

---

## Backend Services

### Database

| Phase | Technology | Cost | Use Case |
|-------|------------|------|----------|
| **Phase 1** | JSON files | Free | Prototype, <10K products |
| **Phase 2** | Supabase PostgreSQL | Free-€25/mo | Production, <100K products |
| **Phase 3** | Dedicated PostgreSQL | €50-200/mo | Scale, >100K products |

**Supabase** ([supabase.com](https://supabase.com))
- PostgreSQL database
- Built-in Auth
- Real-time subscriptions
- Storage for files
- Edge Functions
- Free tier: 500MB database, 1GB storage

### Search

| Option | Cost | Best For | Setup |
|--------|------|----------|-------|
| **Meilisearch Cloud** | €0-100/mo | Recommended | Easy |
| **Meilisearch Self-hosted** | €0 + server | Cost-conscious | Medium |
| **Algolia** | €250+/mo | Enterprise | Easy |
| **Typesense** | €0-50/mo | Alternative to Meili | Easy |

**Meilisearch** ([meilisearch.com](https://www.meilisearch.com))
- Typo-tolerant search
- Faceted filtering
- <50ms response time
- Easy to set up

### Caching

| Service | Cost | Use Case |
|---------|------|----------|
| **Upstash Redis** | Free-€50/mo | Sessions, rate limiting, cart |
| **Vercel KV** | Free-€30/mo | Simple key-value |

**Upstash** ([upstash.com](https://upstash.com))
- Serverless Redis
- Pay-per-request
- Global replication
- Free tier: 10K commands/day

### Authentication

| Option | Cost | Features |
|--------|------|----------|
| **Supabase Auth** | Free | Email, OAuth, magic links |
| **NextAuth.js** | Free | Flexible, self-hosted |
| **Clerk** | Free-€25/mo | Beautiful UI, B2B features |

**Recommendation: Supabase Auth**
- Already using Supabase for database
- Integrated with Row Level Security
- Social logins included

---

## Infrastructure

### Hosting

| Service | Cost | Use Case |
|---------|------|----------|
| **Vercel** | Free-€20/mo | Next.js hosting (recommended) |
| **Netlify** | Free-€19/mo | Alternative |
| **Railway** | €5-50/mo | Full-stack with database |
| **Hetzner** | €5-50/mo | Self-hosted (advanced) |

**Vercel** ([vercel.com](https://vercel.com))
- Zero-config Next.js deployment
- Edge network (fast globally)
- Preview deployments
- Analytics included
- Free tier: 100GB bandwidth

### CDN & Assets

| Service | Cost | Use Case |
|---------|------|----------|
| **Vercel** | Included | Default for Next.js |
| **Cloudflare** | Free-€20/mo | Additional caching, DDoS |
| **Cloudinary** | Free-€89/mo | Image optimization |

### Domain & DNS

| Service | Cost | Features |
|---------|------|----------|
| **Cloudflare** | Free | DNS, SSL, DDoS protection |
| **Vercel Domains** | €10-20/yr | Simple integration |

---

## Development Tools

### Monorepo

| Tool | Purpose | Documentation |
|------|---------|---------------|
| **Turborepo** | Build system | [turbo.build](https://turbo.build) |
| **pnpm** | Package manager | [pnpm.io](https://pnpm.io) |

**Turborepo Benefits:**
- Caches builds (faster CI)
- Parallel execution
- Dependency graph aware

### Code Quality

| Tool | Purpose | Config File |
|------|---------|-------------|
| **ESLint** | Linting | `.eslintrc.js` |
| **Prettier** | Formatting | `.prettierrc` |
| **TypeScript** | Type checking | `tsconfig.json` |
| **Husky** | Git hooks | `.husky/` |

### Testing

| Tool | Purpose | Documentation |
|------|---------|---------------|
| **Vitest** | Unit tests | [vitest.dev](https://vitest.dev) |
| **Playwright** | E2E tests | [playwright.dev](https://playwright.dev) |
| **Testing Library** | Component tests | [testing-library.com](https://testing-library.com) |

---

## Third-Party Services

### AI & Chat

| Service | Cost | Use Case |
|---------|------|----------|
| **OpenAI GPT-4** | ~€50-200/mo | Product assistant chatbot |
| **OpenAI Embeddings** | ~€10/mo | Semantic search |

**Current Implementation:**
- GPT-4 for natural language product search
- Multilingual (NL/EN/FR)
- Context-aware recommendations

### Email

| Service | Cost | Use Case |
|---------|------|----------|
| **SendGrid** | Free-€20/mo | Transactional email |
| **Resend** | Free-€20/mo | Developer-friendly alternative |
| **Mailchimp** | Free-€13/mo | Marketing emails |

**SendGrid** ([sendgrid.com](https://sendgrid.com))
- 100 emails/day free
- Templates
- Analytics
- Good deliverability

### Payments (Future)

| Service | Fees | Best For |
|---------|------|----------|
| **Mollie** | 1.8% + €0.25 | Benelux (recommended) |
| **Stripe** | 1.4% + €0.25 | International |
| **MultiSafepay** | 1.5% + €0.25 | Dutch alternative |

**Mollie** ([mollie.com](https://www.mollie.com))
- Popular in Belgium/Netherlands
- iDEAL, Bancontact, credit cards
- Easy integration
- No monthly fees

### Analytics

| Service | Cost | Use Case |
|---------|------|----------|
| **Vercel Analytics** | Free-€10/mo | Basic web analytics |
| **PostHog** | Free-€50/mo | Product analytics, session replay |
| **Google Analytics** | Free | Standard analytics |
| **Plausible** | €9/mo | Privacy-friendly |

### Monitoring

| Service | Cost | Use Case |
|---------|------|----------|
| **Sentry** | Free-€26/mo | Error tracking |
| **Vercel** | Included | Basic monitoring |
| **Better Stack** | Free-€25/mo | Uptime monitoring |

**Sentry** ([sentry.io](https://sentry.io))
- Error tracking with stack traces
- Performance monitoring
- Release tracking
- Free tier: 5K errors/month

---

## Integration Services

### ERP (Future)

| System | Integration | Notes |
|--------|-------------|-------|
| **Odoo** | REST API | Open source, affordable |
| **Exact Online** | REST API | Popular in Benelux |
| **SAP Business One** | Complex | Enterprise |

### Shipping

| Service | Integration | Coverage |
|---------|-------------|----------|
| **SendCloud** | API | Multi-carrier (recommended) |
| **Shippo** | API | International |
| **Direct carriers** | Various | PostNL, DPD, DHL |

**SendCloud** ([sendcloud.com](https://www.sendcloud.com))
- Single API for multiple carriers
- Label generation
- Tracking
- Returns management

---

## Service Comparison Matrix

### Database Options

| Feature | Supabase | PlanetScale | Neon | Railway |
|---------|----------|-------------|------|---------|
| Free tier | 500MB | 5GB | 512MB | €5 credit |
| PostgreSQL | ✅ | ❌ (MySQL) | ✅ | ✅ |
| Auth included | ✅ | ❌ | ❌ | ❌ |
| Edge functions | ✅ | ❌ | ❌ | ✅ |
| Branching | ❌ | ✅ | ✅ | ❌ |
| **Recommendation** | **Best overall** | MySQL only | Good alternative | Full-stack |

### Search Options

| Feature | Meilisearch | Algolia | Typesense | Elasticsearch |
|---------|-------------|---------|-----------|---------------|
| Free tier | Self-host | 10K records | Self-host | Self-host |
| Typo tolerance | ✅ | ✅ | ✅ | Config needed |
| Facets | ✅ | ✅ | ✅ | ✅ |
| Setup difficulty | Easy | Easy | Easy | Hard |
| Cost at scale | €30-100/mo | €250+/mo | €30-100/mo | €100+/mo |
| **Recommendation** | **Best value** | Enterprise | Alternative | Complex needs |

### Hosting Options

| Feature | Vercel | Netlify | Railway | Render |
|---------|--------|---------|---------|--------|
| Next.js support | ✅ Native | ✅ Good | ✅ Good | ✅ Good |
| Free tier | Generous | Generous | €5/mo | Limited |
| Edge functions | ✅ | ✅ | ❌ | ❌ |
| Database | KV only | ❌ | ✅ | ✅ |
| **Recommendation** | **Best for Next.js** | Alternative | Full-stack | Budget |

---

## Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI
OPENAI_API_KEY=sk-xxx

# Search (when implemented)
MEILISEARCH_HOST=https://xxx.meilisearch.com
MEILISEARCH_API_KEY=xxx

# Cache (when implemented)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Optional

```env
# Email
SENDGRID_API_KEY=SG.xxx

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Payments (future)
MOLLIE_API_KEY=test_xxx
```

---

## Quick Start Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # All apps
pnpm dev:portal       # Portal only

# Build
pnpm build            # All apps
pnpm build --filter=portal

# Database (when using Supabase)
npx supabase start    # Local development
npx supabase db push  # Push migrations

# Search (when using Meilisearch)
docker run -p 7700:7700 getmeili/meilisearch

# Testing
pnpm test             # Unit tests
pnpm test:e2e         # E2E tests
```

---

## Decision Flowchart

```
Need a database?
├── <10K products → JSON files (free)
├── <100K products → Supabase free tier
└── >100K products → Supabase Pro or dedicated

Need search?
├── <1K products → Client-side filter
├── <50K products → Meilisearch Cloud
└── >50K products → Meilisearch dedicated or Elasticsearch

Need auth?
├── Simple login → Supabase Auth
├── Social + magic links → Supabase Auth
└── Enterprise SSO → Auth0 or Clerk

Need email?
├── <100/day → SendGrid free
├── <10K/month → SendGrid or Resend
└── Marketing → Mailchimp or Loops

Need payments?
├── Benelux focus → Mollie
├── International → Stripe
└── Both → Mollie + Stripe
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
