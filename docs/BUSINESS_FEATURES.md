# Business Features Specification

## Overview

Detailed specifications for all business features required for the DEMA Group unified platform.

---

## 1. User Management

### 1.1 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | Platform administrator | All companies, all features |
| **Company Admin** | Company manager | Own company, all features |
| **Sales Manager** | Sales team lead | Own company, sales + customers |
| **Sales Rep** | Sales staff | Own company, limited write |
| **Warehouse** | Warehouse staff | Inventory only |
| **Support** | Customer support | Orders + customers (read/limited write) |
| **Viewer** | Read-only access | View only |

### 1.2 Permission Matrix

```
                    Products  Orders  Customers  Inventory  Reports  Settings
Super Admin         CRUD      CRUD    CRUD       CRUD       CRUD     CRUD
Company Admin       CRUD      CRUD    CRUD       CRUD       CRUD     CRUD
Sales Manager       R         CRUD    CRUD       R          R        -
Sales Rep           R         CRU     CRU        R          R        -
Warehouse           R         R       -          CRUD       R        -
Support             R         RU      RU         R          R        -
Viewer              R         R       R          R          R        -

C=Create, R=Read, U=Update, D=Delete
```

### 1.3 User Features

```typescript
// User management features
interface UserManagement {
  // Authentication
  login: {
    email_password: boolean;
    sso_google: boolean;
    sso_microsoft: boolean;
    two_factor: boolean;
  };
  
  // Profile
  profile: {
    avatar: boolean;
    preferences: boolean;
    notifications: boolean;
  };
  
  // Activity
  activity_log: boolean;
  session_management: boolean;
}
```

---

## 2. Customer Portal

### 2.1 Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

Step 1: Basic Info
├── Company name
├── VAT number (auto-validate)
├── Contact person
├── Email
└── Phone

Step 2: Company Details
├── Industry
├── Company size
├── Address (billing)
├── Address (shipping) - optional
└── How did you find us?

Step 3: Account Setup
├── Create password
├── Accept terms
├── Marketing consent
└── Submit

Step 4: Verification
├── Email verification
├── Admin review (optional)
└── Account activated

Step 5: Welcome
├── Welcome email
├── Getting started guide
└── First order discount (optional)
```

### 2.2 Customer Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER DASHBOARD                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Recent Orders│  │ Open Quotes  │  │ Quick Order  │      │
│  │     12       │  │      3       │  │   [Button]   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Recent Orders                                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ #DEMA-2024-001234  │ €1,234.56 │ Shipped │ View    │   │
│  │ #DEMA-2024-001233  │ €567.89   │ Processing│ View  │   │
│  │ #DEMA-2024-001232  │ €2,345.67 │ Delivered │ View  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Frequently Ordered                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [Product] [Product] [Product] [Product]             │   │
│  │ [Add to Cart buttons]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Customer Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Order History** | View all past orders | P1 |
| **Order Tracking** | Track shipment status | P1 |
| **Reorder** | One-click reorder from history | P1 |
| **Quote Requests** | Request quotes for large orders | P1 |
| **Saved Carts** | Save carts for later | P2 |
| **Favorites** | Save favorite products | P2 |
| **Multiple Addresses** | Manage shipping addresses | P1 |
| **Multiple Contacts** | Add team members | P2 |
| **Invoices** | Download invoices/credit notes | P1 |
| **Account Settings** | Update company info | P1 |
| **Price Lists** | View customer-specific pricing | P2 |

---

## 3. Order Management

### 3.1 Order Lifecycle

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Draft  │───►│ Pending │───►│Confirmed│───►│Processing│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                    │                              │
                    │                              ▼
                    │                        ┌─────────┐
                    │                        │ Shipped │
                    │                        └─────────┘
                    │                              │
                    ▼                              ▼
              ┌─────────┐                   ┌─────────┐
              │Cancelled│                   │Delivered│
              └─────────┘                   └─────────┘
                                                  │
                                                  ▼
                                            ┌─────────┐
                                            │Completed│
                                            └─────────┘
```

### 3.2 Order Features

```typescript
interface OrderFeatures {
  // Creation
  creation: {
    web_checkout: boolean;
    quick_order: boolean;        // Enter SKUs directly
    csv_import: boolean;         // Upload order file
    phone_order: boolean;        // Staff creates for customer
    api_order: boolean;          // External system
  };
  
  // Processing
  processing: {
    auto_confirmation: boolean;  // Auto-confirm if in stock
    manual_review: boolean;      // Require approval
    split_shipment: boolean;     // Ship available items first
    backorder: boolean;          // Allow backorders
  };
  
  // Fulfillment
  fulfillment: {
    pick_list: boolean;          // Generate pick lists
    packing_slip: boolean;       // Generate packing slips
    shipping_label: boolean;     // Generate labels
    tracking: boolean;           // Track shipments
  };
  
  // Communication
  communication: {
    order_confirmation: boolean;
    shipping_notification: boolean;
    delivery_confirmation: boolean;
    review_request: boolean;
  };
}
```

### 3.3 Order Admin Interface

```
┌─────────────────────────────────────────────────────────────┐
│ Orders                                    [+ New Order]      │
├─────────────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [Company ▼] [Date Range] [Search...]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ □ │ #DEMA-2024-001234 │ Acme Corp │ €1,234 │ Pending   │ │
│ │ □ │ #FLUX-2024-000567 │ BuildCo   │ €567   │ Shipped   │ │
│ │ □ │ #DEMA-2024-001233 │ FarmTech  │ €2,345 │ Processing│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Bulk Actions: [Confirm] [Print Pick Lists] [Export]         │
│                                                              │
│ Showing 1-25 of 1,234 orders              [< 1 2 3 ... >]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Quote System

### 4.1 Quote Workflow

```
Customer Request                    Staff Processing
      │                                   │
      ▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│ Add items   │                    │ Review      │
│ to quote    │                    │ request     │
│ basket      │                    │             │
└─────────────┘                    └─────────────┘
      │                                   │
      ▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│ Submit      │───────────────────►│ Create      │
│ request     │                    │ quote       │
└─────────────┘                    └─────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ Apply       │
                                   │ pricing     │
                                   └─────────────┘
                                          │
      ┌───────────────────────────────────┘
      ▼
┌─────────────┐
│ Customer    │
│ receives    │
│ quote       │
└─────────────┘
      │
      ├──────────────┬──────────────┐
      ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Accept      │ │ Negotiate   │ │ Reject      │
│ → Order     │ │ → Revise    │ │ → Close     │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 4.2 Quote Features

| Feature | Description |
|---------|-------------|
| **Quick Quote** | Customer submits product list |
| **Custom Quote** | Staff creates custom quote |
| **Pricing Rules** | Apply customer-specific pricing |
| **Validity Period** | Set expiration date |
| **PDF Generation** | Professional quote PDF |
| **Email Delivery** | Send quote via email |
| **Revision History** | Track quote changes |
| **One-Click Accept** | Customer accepts online |
| **Negotiation** | Back-and-forth on pricing |
| **Convert to Order** | Seamless conversion |

---

## 5. Inventory Management

### 5.1 Inventory Features

```typescript
interface InventoryFeatures {
  // Tracking
  tracking: {
    real_time_stock: boolean;
    multi_warehouse: boolean;
    bin_locations: boolean;
    serial_numbers: boolean;
    batch_tracking: boolean;
    expiry_dates: boolean;
  };
  
  // Movements
  movements: {
    receipts: boolean;           // Goods in
    shipments: boolean;          // Goods out
    transfers: boolean;          // Between warehouses
    adjustments: boolean;        // Manual corrections
    returns: boolean;            // Customer returns
    damage_write_off: boolean;
  };
  
  // Alerts
  alerts: {
    low_stock: boolean;
    out_of_stock: boolean;
    overstock: boolean;
    reorder_point: boolean;
  };
  
  // Reporting
  reporting: {
    stock_levels: boolean;
    movement_history: boolean;
    valuation: boolean;
    turnover: boolean;
  };
}
```

### 5.2 Stock Display on Website

```typescript
// Stock display options
type StockDisplay = 
  | 'exact'           // "23 in stock"
  | 'range'           // "10-25 in stock"
  | 'availability'    // "In stock" / "Low stock" / "Out of stock"
  | 'hidden';         // Don't show stock

// Configuration per company
interface StockDisplayConfig {
  show_stock: boolean;
  display_type: StockDisplay;
  low_stock_threshold: number;
  show_expected_date: boolean;  // "Expected: Jan 15"
  allow_backorder: boolean;
}
```

### 5.3 Inventory Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Inventory Dashboard                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Total SKUs   │  │ Low Stock    │  │ Out of Stock │      │
│  │   12,456     │  │     234      │  │      45      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Alerts                                               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ⚠️ 45 products out of stock                          │   │
│  │ ⚠️ 234 products below reorder point                  │   │
│  │ 📦 3 shipments expected today                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Recent Movements                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Receipt  │ PO-2024-123 │ +500 units │ 10:23 AM     │   │
│  │ Shipment │ ORD-001234  │ -25 units  │ 10:15 AM     │   │
│  │ Adjust   │ Manual      │ -3 units   │ 09:45 AM     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. CRM Features

### 6.1 Customer 360 View

```
┌─────────────────────────────────────────────────────────────┐
│ Customer: Acme Construction NV                    [Edit]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────┐  ┌─────────────────────────────┐   │
│ │ Company Info        │  │ Key Metrics                  │   │
│ ├─────────────────────┤  ├─────────────────────────────┤   │
│ │ VAT: BE0123456789   │  │ Lifetime Value: €45,678     │   │
│ │ Since: Jan 2022     │  │ Orders (YTD): 23            │   │
│ │ Tier: Gold (10%)    │  │ Avg Order: €1,234           │   │
│ │ Credit: €10,000     │  │ Last Order: 5 days ago      │   │
│ └─────────────────────┘  └─────────────────────────────┘   │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tabs: [Overview] [Orders] [Quotes] [Contacts] [Notes]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Activity Timeline                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 📦 Order #1234 placed - €567.89          Dec 15, 10:23 │ │
│ │ 📧 Quote #Q-789 sent                      Dec 14, 15:45 │ │
│ │ 📞 Call with Jan (discussed Q4 needs)     Dec 12, 11:00 │ │
│ │ 📦 Order #1233 delivered                  Dec 10, 09:30 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 CRM Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Activity Logging** | Track all interactions | P1 |
| **Notes** | Add notes to customers | P1 |
| **Tasks** | Assign follow-up tasks | P2 |
| **Email Integration** | Log emails automatically | P2 |
| **Call Logging** | Log phone calls | P2 |
| **Meeting Scheduling** | Schedule meetings | P3 |
| **Document Storage** | Attach files to customers | P2 |
| **Custom Fields** | Add custom data fields | P2 |
| **Segmentation** | Group customers by criteria | P2 |
| **Lead Scoring** | Score potential customers | P3 |

---

## 7. Marketing Features

### 7.1 Email Marketing

```typescript
interface EmailMarketing {
  // Campaigns
  campaigns: {
    newsletters: boolean;
    promotions: boolean;
    product_announcements: boolean;
    automated_sequences: boolean;
  };
  
  // Targeting
  targeting: {
    all_customers: boolean;
    by_company: boolean;        // Customers of specific company
    by_segment: boolean;        // Custom segments
    by_purchase_history: boolean;
    by_engagement: boolean;
  };
  
  // Templates
  templates: {
    drag_drop_editor: boolean;
    html_editor: boolean;
    template_library: boolean;
    personalization: boolean;   // {{customer.name}}
  };
  
  // Analytics
  analytics: {
    open_rate: boolean;
    click_rate: boolean;
    conversion_tracking: boolean;
    unsubscribe_tracking: boolean;
  };
}
```

### 7.2 Promotions Engine

```typescript
interface Promotion {
  // Types
  type: 
    | 'percentage_off'      // 10% off
    | 'fixed_amount_off'    // €50 off
    | 'free_shipping'
    | 'buy_x_get_y'         // Buy 2 get 1 free
    | 'bundle_discount';    // Buy together, save
  
  // Conditions
  conditions: {
    min_order_amount?: number;
    min_quantity?: number;
    specific_products?: string[];
    specific_categories?: string[];
    specific_customers?: string[];
    first_order_only?: boolean;
  };
  
  // Limits
  limits: {
    total_uses?: number;
    uses_per_customer?: number;
    valid_from: Date;
    valid_until: Date;
  };
  
  // Code
  code?: string;              // null = automatic
  auto_apply: boolean;        // Apply without code
}
```

### 7.3 Promotion Examples

| Promotion | Configuration |
|-----------|---------------|
| **New Customer 10%** | `type: percentage_off, value: 10, first_order_only: true` |
| **Free Shipping >€100** | `type: free_shipping, min_order_amount: 100` |
| **Summer Sale** | `type: percentage_off, value: 15, categories: ['outdoor']` |
| **Bulk Discount** | `type: percentage_off, value: 20, min_quantity: 100` |
| **Welcome Code** | `type: fixed_amount_off, value: 25, code: 'WELCOME25'` |

---

## 8. Reporting & Analytics

### 8.1 Dashboard Metrics

```
┌─────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                    [This Month ▼]        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Revenue          Orders           Customers      Avg Order  │
│  €234,567         1,234            456            €190       │
│  ↑ 12% vs LM      ↑ 8% vs LM       ↑ 5% vs LM    ↑ 3% vs LM │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Revenue by Company                                   │   │
│  │ ████████████████████████ DEMA      €120,000 (51%)  │   │
│  │ ██████████████           Fluxer    €65,000  (28%)  │   │
│  │ ████████                 Beltz247  €35,000  (15%)  │   │
│  │ ███                      Others    €14,567  (6%)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Revenue Trend (12 months)                            │   │
│  │     ╭──╮                                             │   │
│  │    ╭╯  ╰╮   ╭──╮                          ╭──╮      │   │
│  │ ──╯      ╰──╯  ╰──────────────────────────╯  ╰──   │   │
│  │ J  F  M  A  M  J  J  A  S  O  N  D                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Available Reports

| Report | Description | Frequency |
|--------|-------------|-----------|
| **Sales Summary** | Revenue, orders, AOV | Daily |
| **Sales by Company** | Breakdown per company | Daily |
| **Sales by Category** | Top categories | Weekly |
| **Sales by Product** | Top products | Weekly |
| **Customer Report** | New, active, churned | Weekly |
| **Inventory Report** | Stock levels, turnover | Daily |
| **Quote Conversion** | Quote → Order rate | Weekly |
| **Marketing ROI** | Campaign performance | Per campaign |

### 8.3 Export Options

- PDF reports
- Excel/CSV export
- Scheduled email reports
- API access for BI tools

---

## 9. Integration Points

### 9.1 ERP Integration

```typescript
interface ERPIntegration {
  // Supported systems
  systems: ['odoo', 'exact_online', 'sap_business_one', 'custom_api'];
  
  // Sync entities
  sync: {
    products: {
      direction: 'import' | 'export' | 'bidirectional';
      fields: ['sku', 'name', 'price', 'stock'];
      frequency: 'realtime' | 'hourly' | 'daily';
    };
    customers: {
      direction: 'bidirectional';
      fields: ['name', 'vat', 'addresses', 'credit_limit'];
      frequency: 'realtime';
    };
    orders: {
      direction: 'export';
      trigger: 'on_confirmation';
    };
    inventory: {
      direction: 'import';
      frequency: 'every_15_min';
    };
  };
}
```

### 9.2 Shipping Integration

```typescript
interface ShippingIntegration {
  // Carriers
  carriers: ['dhl', 'dpd', 'postnl', 'bpost', 'ups', 'fedex'];
  
  // Features
  features: {
    rate_calculation: boolean;
    label_generation: boolean;
    tracking_sync: boolean;
    pickup_scheduling: boolean;
  };
  
  // Via aggregator
  aggregator: 'sendcloud' | 'shippo' | 'direct';
}
```

### 9.3 Payment Integration

```typescript
interface PaymentIntegration {
  // Providers
  providers: {
    mollie: {
      methods: ['ideal', 'bancontact', 'creditcard', 'paypal'];
    };
    stripe: {
      methods: ['creditcard', 'sepa'];
    };
  };
  
  // B2B specific
  b2b_features: {
    invoice_payment: boolean;    // Pay on invoice (Net 30)
    credit_check: boolean;
    payment_terms: boolean;
  };
}
```

---

## 10. Implementation Priority

### Phase 1 (Months 1-3) - Foundation

| Feature | Priority | Effort |
|---------|----------|--------|
| User authentication | P1 | 2 weeks |
| Customer registration | P1 | 2 weeks |
| Product catalog (multi-company) | P1 | 3 weeks |
| Basic cart & checkout | P1 | 2 weeks |
| Quote request system | P1 | 2 weeks |
| Order management (basic) | P1 | 2 weeks |

### Phase 2 (Months 4-6) - Operations

| Feature | Priority | Effort |
|---------|----------|--------|
| Inventory management | P1 | 3 weeks |
| Customer pricing tiers | P1 | 2 weeks |
| Order fulfillment workflow | P1 | 2 weeks |
| Email notifications | P1 | 1 week |
| Basic reporting | P1 | 2 weeks |
| Admin dashboard | P1 | 2 weeks |

### Phase 3 (Months 7-9) - Enhancement

| Feature | Priority | Effort |
|---------|----------|--------|
| CRM features | P2 | 3 weeks |
| Advanced pricing rules | P2 | 2 weeks |
| Promotions engine | P2 | 2 weeks |
| Customer portal enhancements | P2 | 2 weeks |
| ERP integration | P2 | 4 weeks |

### Phase 4 (Months 10-12) - Scale

| Feature | Priority | Effort |
|---------|----------|--------|
| Email marketing | P2 | 3 weeks |
| Advanced analytics | P2 | 2 weeks |
| Shipping integration | P2 | 2 weeks |
| Payment integration | P2 | 2 weeks |
| API for external systems | P2 | 2 weeks |

---

## Summary

| Category | Features | Tables | Effort |
|----------|----------|--------|--------|
| **User Management** | 7 | 2 | 4 weeks |
| **Customer Portal** | 11 | 4 | 6 weeks |
| **Order Management** | 12 | 3 | 6 weeks |
| **Quote System** | 10 | 2 | 4 weeks |
| **Inventory** | 12 | 3 | 6 weeks |
| **CRM** | 10 | 2 | 4 weeks |
| **Marketing** | 8 | 2 | 4 weeks |
| **Reporting** | 8 | 0 | 3 weeks |
| **Integrations** | 6 | 3 | 8 weeks |
| **Total** | **84** | **21** | **45 weeks** |

**Estimated total development: 10-12 months** for full feature set.

---

*Document Version: 1.0*
*Last Updated: December 2024*
