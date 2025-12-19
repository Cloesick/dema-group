# DEMA Group API Service

Dedicated API service for inventory management, delivery tracking, and ERP/carrier integrations.

## Overview

This is a standalone Next.js API service that handles:
- **Inventory APIs** - Real-time stock levels from all 5 DEMA Group companies
- **Delivery APIs** - Shipment tracking across multiple carriers
- **Webhooks** - Receive updates from ERP systems and carriers

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:generate
pnpm db:push

# Start development server (port 3002)
pnpm dev
```

## API Endpoints

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/inventory` | Query stock levels |
| POST | `/api/v1/inventory` | Bulk stock update from ERP |
| GET | `/api/v1/inventory/:sku` | Get stock for specific SKU |

### Delivery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/delivery` | Track shipment |
| POST | `/api/v1/delivery` | Create new shipment |

### Webhooks

| Method | Endpoint | Source |
|--------|----------|--------|
| POST | `/api/v1/webhooks/inventory` | ERP systems |
| POST | `/api/v1/webhooks/delivery` | Carriers (UPS, DHL, PostNL, Bpost) |

## Authentication

### API Keys
All POST requests require an `x-api-key` header:
```bash
curl -X POST https://api.demagroup.be/api/v1/inventory \
  -H "x-api-key: dema_live_xxx" \
  -H "Content-Type: application/json" \
  -d '[{"sku": "PUMP-001", "quantity": 150}]'
```

### Webhook Signatures
Webhooks are verified using HMAC-SHA256:
- Header: `x-webhook-signature`
- Header: `x-company-id`

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dema_api"

# API Keys (per company)
DEMA_API_KEY=dema_live_xxx
FLUXER_API_KEY=fluxer_live_xxx
BELTZ247_API_KEY=beltz247_live_xxx
DEVISSCHERE_API_KEY=devisschere_live_xxx
ACCU_API_KEY=accu_live_xxx

# Webhook Secrets (per company)
WEBHOOK_SECRET_DEMA=whsec_xxx
WEBHOOK_SECRET_FLUXER=whsec_xxx
WEBHOOK_SECRET_BELTZ247=whsec_xxx
WEBHOOK_SECRET_DEVISSCHERE=whsec_xxx
WEBHOOK_SECRET_ACCU=whsec_xxx

# Carrier API Keys
UPS_CLIENT_ID=xxx
UPS_CLIENT_SECRET=xxx
DHL_API_KEY=xxx
POSTNL_API_KEY=xxx
BPOST_API_KEY=xxx
```

## Database Schema

See `prisma/schema.prisma` for the complete database schema including:
- Companies
- Products & Stock
- Stock Movements
- Orders & Order Items
- Shipments & Shipment Events
- API Logs & Webhook Logs

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DEMA Group Portal                        │
│                    (apps/portal:3001)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DEMA Group API                           │
│                     (apps/api:3002)                          │
├─────────────────────────────────────────────────────────────┤
│  /api/v1/inventory    │  /api/v1/delivery                   │
│  /api/v1/webhooks/*   │                                      │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│   PostgreSQL    │          │    Carriers     │
│   (Inventory,   │          │  UPS, DHL,      │
│    Orders)      │          │  PostNL, Bpost  │
└─────────────────┘          └─────────────────┘
         ▲
         │
┌─────────────────┐
│  ERP Systems    │
│  DEMA, Fluxer,  │
│  Beltz247, etc. │
└─────────────────┘
```

## Rate Limiting

- GET requests: 100 requests/minute per IP
- POST requests: 60 requests/minute per API key

## Development

```bash
# Run with Turbo (from monorepo root)
pnpm turbo run dev --filter=api

# Database commands
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations
```

---

## TODO: Integration Setup Checklist

### Phase 1: Infrastructure
- [ ] Set up PostgreSQL database (local or cloud: Supabase, Neon, Railway)
- [ ] Run `pnpm install` in `apps/api`
- [ ] Copy `.env.example` to `.env` and fill in values
- [ ] Run `pnpm db:generate` and `pnpm db:push`
- [ ] Test API locally: `pnpm dev` → http://localhost:3002

### Phase 2: Carrier API Credentials
Get API credentials from each carrier's developer portal:

| Carrier | Developer Portal | Credentials Needed |
|---------|------------------|-------------------|
| UPS | https://developer.ups.com | Client ID, Client Secret |
| DHL | https://developer.dhl.com | API Key |
| PostNL | https://developer.postnl.nl | API Key |
| Bpost | https://www.bpost.be/site/en/webservice-address | API Key |
| FedEx | https://developer.fedex.com | API Key, Secret |
| DPD | Contact DPD directly | API Key |
| GLS | Contact GLS directly | API Key |

### Phase 3: ERP Integration (Inbound Webhooks)
For each company (DEMA, Fluxer, Beltz247, De Visschere, Accu):

1. **Generate webhook secret** for each company:
   ```bash
   openssl rand -hex 32
   # Output: whsec_abc123...
   ```

2. **Share with ERP team**:
   - Webhook URL: `https://api.demagroup.be/api/v1/webhooks/inventory`
   - Webhook Secret: `whsec_xxx` (generated above)
   - Company ID: `dema` | `fluxer` | `beltz247` | `devisschere` | `accu`

3. **ERP sends stock updates** (example code in `src/lib/erp/webhook-sender.ts`):
   ```typescript
   // Headers required:
   // x-webhook-signature: HMAC-SHA256(body, secret)
   // x-company-id: dema
   // x-webhook-id: unique-id
   
   POST /api/v1/webhooks/inventory
   {
     "event": "stock.updated",
     "companyId": "dema",
     "timestamp": "2024-01-15T10:30:00Z",
     "data": {
       "sku": "PUMP-001",
       "newQuantity": 150,
       "warehouseLocation": "Roeselare-A1"
     }
   }
   ```

### Phase 4: Carrier Webhooks (Inbound)
Register your webhook URL with each carrier:

| Carrier | How to Register |
|---------|-----------------|
| UPS | Developer Portal → Webhooks → Add Subscription |
| DHL | Developer Portal → Track → Webhook Subscriptions |
| PostNL | Contact PostNL API support |
| Bpost | Contact Bpost API support |

Webhook URL: `https://api.demagroup.be/api/v1/webhooks/delivery`

### Phase 5: Outbound API Calls
Use the carrier clients to track packages and create shipments:

```typescript
import { carriers } from '@/lib/carriers'

// Track a package
const tracking = await carriers.track('ups', '1Z999AA10123456784')

// Create a shipment
const shipment = await carriers.createShipment({
  carrier: 'dhl',
  shipper: {
    name: 'DEMA NV',
    street: 'Ovenstraat 11',
    city: 'Roeselare',
    postalCode: '8800',
    country: 'BE',
  },
  recipient: {
    name: 'Customer Name',
    street: 'Customer Street 123',
    city: 'Kortrijk',
    postalCode: '8500',
    country: 'BE',
  },
  packages: [{ weight: 5, length: 30, width: 20, height: 15 }],
})

console.log(shipment.trackingNumber, shipment.labelUrl)
```

### Phase 6: Production Deployment
- [ ] Deploy API to Vercel/Railway/Fly.io
- [ ] Set up production database
- [ ] Configure environment variables in deployment platform
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Update webhook URLs to production domain
- [ ] Test all integrations end-to-end

---

## File Structure

```
apps/api/
├── src/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── inventory/route.ts    # Stock queries & updates
│   │   │   ├── delivery/route.ts     # Shipment tracking & creation
│   │   │   └── webhooks/
│   │   │       ├── inventory/route.ts # ERP stock webhooks
│   │   │       └── delivery/route.ts  # Carrier tracking webhooks
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── auth.ts                   # API key & webhook verification
│       ├── prisma.ts                 # Database client
│       ├── carriers/
│       │   ├── index.ts              # Unified CarrierHub
│       │   ├── ups.ts                # UPS API client
│       │   └── dhl.ts                # DHL API client
│       └── erp/
│           └── webhook-sender.ts     # Example ERP integration
├── prisma/
│   └── schema.prisma                 # Database schema
├── .env.example                      # Environment template
├── package.json
└── README.md                         # This file
```
