# DEMA Group Portal API

## API Architecture

This directory contains the API routes for the DEMA Group unified portal.

## Endpoints

### Inventory / Stock APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | Get stock levels (query by SKU, companyId) |
| `/api/inventory` | POST | Receive bulk stock updates from ERP |
| `/api/inventory/[sku]` | GET | Get stock for specific SKU |

**Headers Required:**
- `x-api-key`: API key for authentication (POST requests)

**Example Request:**
```bash
# Get stock for a product
curl "https://portal.demagroup.be/api/inventory?sku=PUMP-001&companyId=dema"

# Update stock (from ERP)
curl -X POST "https://portal.demagroup.be/api/inventory" \
  -H "Content-Type: application/json" \
  -H "x-api-key: dema_xxx" \
  -d '[{"sku": "PUMP-001", "companyId": "dema", "quantity": 150}]'
```

### Delivery / Tracking APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/delivery` | GET | Track shipment by tracking number or order ID |
| `/api/delivery` | POST | Create new shipment with carrier |

**Supported Carriers:**
- UPS
- DHL
- PostNL
- Bpost
- FedEx
- DPD
- GLS

**Example Request:**
```bash
# Track a shipment
curl "https://portal.demagroup.be/api/delivery?trackingNumber=1Z999AA10123456784&carrier=ups"

# Create shipment
curl -X POST "https://portal.demagroup.be/api/delivery" \
  -H "Content-Type: application/json" \
  -H "x-api-key: dema_xxx" \
  -d '{"carrier": "ups", "orderId": "ORD-001", "recipient": {...}}'
```

### Webhooks

Webhook endpoints receive real-time updates from external systems.

| Endpoint | Source | Description |
|----------|--------|-------------|
| `/api/webhooks/inventory` | ERP Systems | Stock level changes |
| `/api/webhooks/delivery` | Carriers | Shipment status updates |

**Inventory Webhook Events:**
- `stock.updated` - Stock level changed
- `stock.reserved` - Stock reserved for order
- `stock.released` - Reserved stock released
- `stock.received` - New stock received from supplier
- `stock.adjusted` - Manual stock adjustment

**Delivery Webhook Events:**
- `shipment.created` - Label created
- `shipment.picked_up` - Carrier picked up package
- `shipment.in_transit` - Package in transit
- `shipment.out_for_delivery` - Out for delivery
- `shipment.delivered` - Successfully delivered
- `shipment.exception` - Delivery exception
- `shipment.returned` - Package returned

## Security

### API Keys
Each company has its own API key for authentication:
- `DEMA_API_KEY` - DEMA ERP integration
- `FLUXER_API_KEY` - Fluxer ERP integration
- `BELTZ247_API_KEY` - Beltz247 ERP integration
- `DEVISSCHERE_API_KEY` - De Visschere ERP integration
- `ACCU_API_KEY` - Accu Components API integration

### Webhook Signatures
Webhooks are verified using HMAC-SHA256 signatures:
- `WEBHOOK_SECRET_DEMA`
- `WEBHOOK_SECRET_FLUXER`
- `WEBHOOK_SECRET_BELTZ247`
- `WEBHOOK_SECRET_DEVISSCHERE`
- `WEBHOOK_SECRET_ACCU`

## Environment Variables

```env
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

## Integration Flow

### ERP → Portal (Stock Updates)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  DEMA ERP   │────▶│ /api/webhooks/   │────▶│  Database   │
│  Fluxer ERP │     │   inventory      │     │  (Stock)    │
│  etc.       │     └──────────────────┘     └─────────────┘
└─────────────┘              │
                             ▼
                    ┌──────────────────┐
                    │  WebSocket/SSE   │
                    │  (Real-time UI)  │
                    └──────────────────┘
```

### Carrier → Portal (Delivery Updates)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    UPS      │────▶│ /api/webhooks/   │────▶│  Database   │
│    DHL      │     │   delivery       │     │  (Orders)   │
│    PostNL   │     └──────────────────┘     └─────────────┘
│    Bpost    │              │
└─────────────┘              ▼
                    ┌──────────────────┐
                    │  Notifications   │
                    │  (Email/SMS)     │
                    └──────────────────┘
```

## Future Enhancements

- [ ] WebSocket support for real-time stock updates
- [ ] Server-Sent Events (SSE) for delivery tracking
- [ ] Rate limiting per API key
- [ ] Request logging and analytics
- [ ] Retry logic for failed webhook deliveries
- [ ] Multi-warehouse stock aggregation
