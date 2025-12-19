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
