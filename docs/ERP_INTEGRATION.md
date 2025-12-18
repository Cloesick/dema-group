# ERP Integration Specification

## Overview

This document details the ERP integration strategy for connecting the DEMA Group platform with existing company ERP systems.

---

## Current ERP Landscape

### Company ERP Systems (To Be Confirmed)

| Company | Likely ERP | Integration Complexity |
|---------|-----------|----------------------|
| **DEMA** | Odoo / Exact Online | Medium |
| **Fluxer** | Exact Online | Medium |
| **Beltz247** | Custom / Excel | Low-High |
| **De Visschere** | Unknown | TBD |
| **Accu Components** | Unknown | TBD |

### Discovery Questions (Per Company)

```
□ What ERP system do you use?
□ What version?
□ Is there API access?
□ Who manages the ERP?
□ What data is in the ERP?
  □ Products/inventory?
  □ Customers?
  □ Orders/invoices?
  □ Pricing?
□ How often is data updated?
□ Are there existing integrations?
□ What are the pain points?
```

---

## Integration Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMA GROUP PLATFORM                       │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Products   │  │  Customers  │  │   Orders    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                  │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Message Queue (Redis/RabbitMQ)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │  Adapter  │  │  Adapter  │  │  Adapter  │  │ Adapter │ │
│  │   Odoo    │  │   Exact   │  │   SAP     │  │  Custom │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  DEMA ERP   │  │ Fluxer ERP  │  │ Other ERPs  │
│   (Odoo)    │  │   (Exact)   │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Adapter Pattern

```typescript
// Base adapter interface
interface ERPAdapter {
  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  
  // Products
  getProducts(filters?: ProductFilter): Promise<ERPProduct[]>;
  getProduct(sku: string): Promise<ERPProduct | null>;
  updateProduct(sku: string, data: Partial<ERPProduct>): Promise<void>;
  
  // Inventory
  getInventory(sku: string): Promise<InventoryLevel>;
  getAllInventory(): Promise<InventoryLevel[]>;
  
  // Customers
  getCustomer(id: string): Promise<ERPCustomer | null>;
  createCustomer(data: CustomerData): Promise<string>;
  updateCustomer(id: string, data: Partial<CustomerData>): Promise<void>;
  
  // Orders
  createOrder(order: OrderData): Promise<string>;
  getOrder(id: string): Promise<ERPOrder | null>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  
  // Invoices
  getInvoice(id: string): Promise<Invoice | null>;
  getCustomerInvoices(customerId: string): Promise<Invoice[]>;
}
```

---

## Odoo Integration

### Connection Setup

```typescript
// Odoo adapter configuration
interface OdooConfig {
  url: string;              // https://company.odoo.com
  database: string;         // Database name
  username: string;         // API user
  apiKey: string;           // API key (not password)
}

// Example connection
const odoo = new OdooAdapter({
  url: 'https://dema.odoo.com',
  database: 'dema-production',
  username: 'api@dema.be',
  apiKey: process.env.ODOO_API_KEY,
});
```

### Odoo API Methods

```typescript
class OdooAdapter implements ERPAdapter {
  // Products from product.product model
  async getProducts(): Promise<ERPProduct[]> {
    const products = await this.client.execute_kw(
      'product.product',
      'search_read',
      [
        [['sale_ok', '=', true], ['active', '=', true]],
        ['id', 'default_code', 'name', 'list_price', 'qty_available']
      ]
    );
    return products.map(this.mapProduct);
  }
  
  // Inventory from stock.quant
  async getInventory(sku: string): Promise<InventoryLevel> {
    const product = await this.getProductBySku(sku);
    const quants = await this.client.execute_kw(
      'stock.quant',
      'search_read',
      [
        [['product_id', '=', product.id], ['location_id.usage', '=', 'internal']],
        ['quantity', 'reserved_quantity', 'location_id']
      ]
    );
    return this.aggregateInventory(quants);
  }
  
  // Create sales order
  async createOrder(order: OrderData): Promise<string> {
    const partnerId = await this.getOrCreatePartner(order.customer);
    
    const orderId = await this.client.execute_kw(
      'sale.order',
      'create',
      [{
        partner_id: partnerId,
        client_order_ref: order.reference,
        order_line: order.items.map(item => [0, 0, {
          product_id: item.productId,
          product_uom_qty: item.quantity,
          price_unit: item.unitPrice,
        }]),
      }]
    );
    
    return orderId.toString();
  }
}
```

### Odoo Field Mapping

| Platform Field | Odoo Model | Odoo Field |
|---------------|------------|------------|
| `product.sku` | product.product | default_code |
| `product.name` | product.product | name |
| `product.price` | product.product | list_price |
| `product.cost` | product.product | standard_price |
| `inventory.quantity` | stock.quant | quantity |
| `customer.name` | res.partner | name |
| `customer.vat` | res.partner | vat |
| `order.reference` | sale.order | client_order_ref |
| `order.total` | sale.order | amount_total |

---

## Exact Online Integration

### Connection Setup

```typescript
// Exact Online uses OAuth2
interface ExactConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  division: number;        // Company division ID
}

// OAuth flow required
const exact = new ExactOnlineAdapter({
  clientId: process.env.EXACT_CLIENT_ID,
  clientSecret: process.env.EXACT_CLIENT_SECRET,
  redirectUri: 'https://demagroup.be/api/exact/callback',
  division: 123456,
});
```

### Exact Online API

```typescript
class ExactOnlineAdapter implements ERPAdapter {
  private accessToken: string;
  private baseUrl = 'https://start.exactonline.be/api/v1';
  
  // Products from Items endpoint
  async getProducts(): Promise<ERPProduct[]> {
    const response = await this.get(
      `/Items?$filter=IsSalesItem eq true&$select=ID,Code,Description,SalesPrice`
    );
    return response.d.results.map(this.mapProduct);
  }
  
  // Inventory from StockPositions
  async getInventory(sku: string): Promise<InventoryLevel> {
    const item = await this.getItemByCode(sku);
    const response = await this.get(
      `/StockPositions?$filter=ItemId eq guid'${item.ID}'`
    );
    return this.mapInventory(response.d.results);
  }
  
  // Create sales order
  async createOrder(order: OrderData): Promise<string> {
    const accountId = await this.getOrCreateAccount(order.customer);
    
    const salesOrder = await this.post('/SalesOrders', {
      OrderedBy: accountId,
      YourRef: order.reference,
      SalesOrderLines: order.items.map(item => ({
        Item: item.productId,
        Quantity: item.quantity,
        NetPrice: item.unitPrice,
      })),
    });
    
    return salesOrder.OrderID;
  }
}
```

### Exact Online Field Mapping

| Platform Field | Exact Endpoint | Exact Field |
|---------------|----------------|-------------|
| `product.sku` | Items | Code |
| `product.name` | Items | Description |
| `product.price` | Items | SalesPrice |
| `inventory.quantity` | StockPositions | InStock |
| `customer.name` | Accounts | Name |
| `customer.vat` | Accounts | VATNumber |
| `order.reference` | SalesOrders | YourRef |

---

## Sync Strategies

### 1. Real-Time Sync (Webhooks)

```typescript
// For critical data (orders, inventory changes)
interface WebhookConfig {
  // Platform → ERP (push orders)
  outbound: {
    events: ['order.created', 'order.updated', 'customer.created'];
    retryPolicy: {
      maxRetries: 3;
      backoffMs: [1000, 5000, 30000];
    };
  };
  
  // ERP → Platform (receive inventory updates)
  inbound: {
    endpoint: '/api/webhooks/erp';
    events: ['inventory.updated', 'product.updated', 'order.shipped'];
    validation: 'hmac_signature';
  };
}
```

### 2. Scheduled Sync (Polling)

```typescript
// For bulk data (products, full inventory)
interface SyncSchedule {
  products: {
    frequency: 'daily';
    time: '02:00';           // 2 AM
    fullSync: true;
  };
  
  inventory: {
    frequency: 'every_15_min';
    deltaOnly: true;         // Only changed items
  };
  
  customers: {
    frequency: 'hourly';
    deltaOnly: true;
  };
  
  orders: {
    frequency: 'every_5_min';
    direction: 'export';     // Platform → ERP
  };
}
```

### 3. On-Demand Sync

```typescript
// Manual triggers
interface ManualSync {
  // Admin can trigger full sync
  fullProductSync(): Promise<SyncResult>;
  fullInventorySync(): Promise<SyncResult>;
  
  // Sync specific item
  syncProduct(sku: string): Promise<SyncResult>;
  syncCustomer(id: string): Promise<SyncResult>;
  syncOrder(orderId: string): Promise<SyncResult>;
}
```

---

## Data Transformation

### Product Mapping

```typescript
// Transform ERP product to platform format
function mapERPProduct(erpProduct: any, source: 'odoo' | 'exact'): Product {
  const mappers = {
    odoo: (p) => ({
      sku: p.default_code,
      name_nl: p.name,
      base_price: p.list_price,
      cost_price: p.standard_price,
      erp_id: p.id.toString(),
    }),
    exact: (p) => ({
      sku: p.Code,
      name_nl: p.Description,
      base_price: p.SalesPrice,
      cost_price: p.CostPriceStandard,
      erp_id: p.ID,
    }),
  };
  
  return mappers[source](erpProduct);
}
```

### Order Mapping

```typescript
// Transform platform order to ERP format
function mapOrderToERP(order: Order, target: 'odoo' | 'exact'): any {
  const mappers = {
    odoo: (o) => ({
      partner_id: o.customer.erp_id,
      client_order_ref: o.order_number,
      order_line: o.items.map(item => [0, 0, {
        product_id: parseInt(item.product.erp_id),
        product_uom_qty: item.quantity,
        price_unit: item.unit_price,
      }]),
    }),
    exact: (o) => ({
      OrderedBy: o.customer.erp_id,
      YourRef: o.order_number,
      SalesOrderLines: o.items.map(item => ({
        Item: item.product.erp_id,
        Quantity: item.quantity,
        NetPrice: item.unit_price,
      })),
    }),
  };
  
  return mappers[target](order);
}
```

---

## Error Handling

### Retry Strategy

```typescript
interface RetryConfig {
  maxRetries: 3;
  backoffType: 'exponential';
  initialDelayMs: 1000;
  maxDelayMs: 60000;
  
  // Retry on these errors
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'RATE_LIMITED',
    'SERVICE_UNAVAILABLE',
  ];
  
  // Don't retry on these
  nonRetryableErrors: [
    'INVALID_CREDENTIALS',
    'NOT_FOUND',
    'VALIDATION_ERROR',
  ];
}
```

### Error Logging

```typescript
interface SyncError {
  id: string;
  timestamp: Date;
  company_id: string;
  sync_type: 'product' | 'inventory' | 'order' | 'customer';
  direction: 'import' | 'export';
  
  // Error details
  error_code: string;
  error_message: string;
  stack_trace?: string;
  
  // Context
  entity_id?: string;
  entity_type?: string;
  request_payload?: any;
  response_payload?: any;
  
  // Resolution
  resolved: boolean;
  resolved_at?: Date;
  resolution_notes?: string;
}
```

### Alert Configuration

```typescript
interface AlertConfig {
  // Alert on sync failures
  sync_failure: {
    threshold: 3;            // Alert after 3 consecutive failures
    channels: ['email', 'slack'];
    recipients: ['admin@demagroup.be'];
  };
  
  // Alert on data discrepancies
  data_mismatch: {
    threshold: 10;           // Alert if >10 mismatches
    channels: ['email'];
  };
  
  // Alert on connection issues
  connection_lost: {
    threshold: 1;            // Immediate alert
    channels: ['email', 'slack', 'sms'];
  };
}
```

---

## Conflict Resolution

### Inventory Conflicts

```typescript
// When platform and ERP have different stock levels
interface InventoryConflictResolution {
  strategy: 'erp_wins' | 'platform_wins' | 'manual' | 'lowest';
  
  // ERP is source of truth for inventory
  default: 'erp_wins';
  
  // Log all conflicts for review
  logConflicts: true;
  
  // Alert if difference exceeds threshold
  alertThreshold: 10;        // Alert if diff > 10 units
}
```

### Price Conflicts

```typescript
// When prices differ
interface PriceConflictResolution {
  strategy: 'erp_wins' | 'platform_wins' | 'manual';
  
  // Platform may have promotional prices
  default: 'platform_wins';
  
  // Sync base prices from ERP
  syncBasePrices: true;
  
  // Don't overwrite promotional prices
  preservePromotions: true;
}
```

### Customer Conflicts

```typescript
// When customer data differs
interface CustomerConflictResolution {
  strategy: 'erp_wins' | 'platform_wins' | 'merge' | 'manual';
  
  // Merge strategy
  merge: {
    // ERP wins for financial data
    erp_fields: ['credit_limit', 'payment_terms', 'vat_number'];
    
    // Platform wins for contact preferences
    platform_fields: ['marketing_consent', 'preferred_language'];
    
    // Most recent wins for contact info
    latest_wins: ['email', 'phone', 'address'];
  };
}
```

---

## Implementation Phases

### Phase 1: Read-Only Integration (Week 1-4)

```
□ Set up ERP connections
□ Import products from ERP
□ Import inventory levels
□ Import customer data
□ Set up scheduled sync (products, inventory)
□ Build admin dashboard for sync status
```

### Phase 2: Order Export (Week 5-8)

```
□ Map order data to ERP format
□ Implement order creation in ERP
□ Handle order confirmation flow
□ Set up webhook for order status updates
□ Test end-to-end order flow
```

### Phase 3: Bidirectional Sync (Week 9-12)

```
□ Implement real-time inventory sync
□ Sync customer updates both ways
□ Handle price updates from ERP
□ Implement conflict resolution
□ Build error handling and alerting
```

### Phase 4: Advanced Features (Week 13-16)

```
□ Invoice sync
□ Shipping/tracking sync
□ Credit limit sync
□ Payment status sync
□ Multi-warehouse support
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('OdooAdapter', () => {
  it('should map product correctly', () => {
    const odooProduct = {
      id: 123,
      default_code: 'PUMP-001',
      name: 'Submersible Pump',
      list_price: 299.99,
    };
    
    const result = adapter.mapProduct(odooProduct);
    
    expect(result.sku).toBe('PUMP-001');
    expect(result.name_nl).toBe('Submersible Pump');
    expect(result.base_price).toBe(299.99);
  });
});
```

### Integration Tests

```typescript
describe('ERP Integration', () => {
  it('should sync inventory from ERP', async () => {
    // Arrange
    const sku = 'TEST-001';
    await erpMock.setInventory(sku, 100);
    
    // Act
    await syncService.syncInventory(sku);
    
    // Assert
    const inventory = await inventoryService.getStock(sku);
    expect(inventory.quantity).toBe(100);
  });
  
  it('should create order in ERP', async () => {
    // Arrange
    const order = createTestOrder();
    
    // Act
    const erpOrderId = await syncService.exportOrder(order);
    
    // Assert
    expect(erpOrderId).toBeDefined();
    const erpOrder = await erpMock.getOrder(erpOrderId);
    expect(erpOrder.items.length).toBe(order.items.length);
  });
});
```

### End-to-End Tests

```typescript
describe('Order Flow E2E', () => {
  it('should complete full order cycle', async () => {
    // 1. Customer places order on platform
    const order = await placeOrder(testCustomer, testItems);
    expect(order.status).toBe('pending');
    
    // 2. Order syncs to ERP
    await waitForSync();
    const erpOrder = await erp.getOrder(order.erp_id);
    expect(erpOrder).toBeDefined();
    
    // 3. ERP confirms order
    await erp.confirmOrder(erpOrder.id);
    await waitForWebhook();
    
    // 4. Platform reflects confirmation
    const updatedOrder = await getOrder(order.id);
    expect(updatedOrder.status).toBe('confirmed');
    
    // 5. Inventory decremented
    const inventory = await getInventory(testItems[0].sku);
    expect(inventory.reserved).toBe(testItems[0].quantity);
  });
});
```

---

## Monitoring & Observability

### Metrics to Track

```typescript
interface SyncMetrics {
  // Volume
  syncs_total: Counter;
  syncs_by_type: Counter;           // products, inventory, orders
  syncs_by_company: Counter;
  
  // Performance
  sync_duration_seconds: Histogram;
  records_processed: Counter;
  
  // Errors
  sync_errors_total: Counter;
  sync_errors_by_type: Counter;
  
  // Data quality
  conflicts_total: Counter;
  mismatches_total: Counter;
}
```

### Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ ERP Integration Status                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DEMA (Odoo)        Fluxer (Exact)      Beltz247            │
│  ✅ Connected        ✅ Connected        ⚠️ Not configured   │
│  Last sync: 2m ago   Last sync: 5m ago                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Sync Activity (24h)                                  │   │
│  │ Products:  ████████████████████ 12,456 synced       │   │
│  │ Inventory: ████████████████████ 45,678 updates      │   │
│  │ Orders:    ████████             234 exported        │   │
│  │ Customers: ██████               156 synced          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Errors (24h)                                         │   │
│  │ ❌ 3 failed order exports (DEMA)                     │   │
│  │ ⚠️ 12 inventory mismatches (Fluxer)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

### Integration Effort by ERP

| ERP | Complexity | Effort | Notes |
|-----|------------|--------|-------|
| **Odoo** | Medium | 4-6 weeks | Good API, well documented |
| **Exact Online** | Medium | 4-6 weeks | OAuth required, good API |
| **SAP B1** | High | 8-12 weeks | Complex, may need middleware |
| **Custom/Excel** | Variable | 2-8 weeks | Depends on current state |

### Recommended Approach

1. **Start with one company** (DEMA) as pilot
2. **Read-only first** - import products/inventory
3. **Add order export** - push orders to ERP
4. **Iterate** - add more companies, more features
5. **Monitor closely** - catch issues early

### Total Estimated Effort

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Discovery | 2 weeks | ERP audit, requirements |
| Phase 1 | 4 weeks | Read-only sync (1 company) |
| Phase 2 | 4 weeks | Order export |
| Phase 3 | 4 weeks | Bidirectional sync |
| Phase 4 | 4 weeks | Additional companies |
| **Total** | **18 weeks** | Full integration |

---

*Document Version: 1.0*
*Last Updated: December 2024*
