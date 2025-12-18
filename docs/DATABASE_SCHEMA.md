# Multi-Company Database Schema

## Overview

Complete database schema for the DEMA Group platform supporting 5 companies with unified customer management, orders, inventory, and CRM.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  companies  │       │    users    │       │  customers  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──┐   │ id          │   ┌──►│ id          │
│ slug        │   │   │ email       │   │   │ company_name│
│ name        │   │   │ role        │   │   │ vat_number  │
│ ...         │   │   │ company_id  │───┘   │ ...         │
└─────────────┘   │   └─────────────┘       └─────────────┘
       │          │          │                     │
       │          │          │                     │
       ▼          │          ▼                     ▼
┌─────────────┐   │   ┌─────────────┐       ┌─────────────┐
│  products   │   │   │user_company │       │customer_    │
├─────────────┤   │   │_access      │       │company_rel  │
│ id          │   │   ├─────────────┤       ├─────────────┤
│ company_id  │───┘   │ user_id     │       │ customer_id │
│ sku         │       │ company_id  │       │ company_id  │
│ name        │       │ permissions │       │ customer_no │
│ ...         │       └─────────────┘       │ pricing_tier│
└─────────────┘                             └─────────────┘
       │                                           │
       │                                           │
       ▼                                           ▼
┌─────────────┐                             ┌─────────────┐
│  inventory  │                             │   orders    │
├─────────────┤                             ├─────────────┤
│ product_id  │                             │ id          │
│ warehouse_id│                             │ customer_id │
│ quantity    │                             │ company_id  │
│ ...         │                             │ status      │
└─────────────┘                             └─────────────┘
```

---

## Core Tables

### Companies

```sql
-- The 5 group companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,      -- 'dema', 'fluxer', 'beltz247', etc.
  name VARCHAR(255) NOT NULL,            -- 'DEMA NV'
  legal_name VARCHAR(255),               -- Full legal name
  vat_number VARCHAR(50),                -- BE0123456789
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Address
  street VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'BE',
  
  -- Branding
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),              -- #FF0000
  
  -- Settings
  default_currency VARCHAR(3) DEFAULT 'EUR',
  default_language VARCHAR(2) DEFAULT 'nl',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 5 companies
INSERT INTO companies (slug, name, legal_name) VALUES
  ('dema', 'DEMA', 'DEMA NV'),
  ('fluxer', 'Fluxer', 'Fluxer BVBA'),
  ('beltz247', 'Beltz247', 'Beltz247 NV'),
  ('devisschere', 'De Visschere Technics', 'De Visschere Technics BVBA'),
  ('accu', 'Accu Components', 'Accu Components NV');
```

### Users (Internal Staff)

```sql
-- Internal users (employees, admins)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,                   -- Supabase auth.users reference
  
  -- Profile
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  
  -- Role
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  -- 'super_admin': Full access to all companies
  -- 'company_admin': Admin for specific company(ies)
  -- 'sales': Sales staff
  -- 'warehouse': Warehouse staff
  -- 'support': Customer support
  -- 'viewer': Read-only access
  
  -- Primary company (for non-super_admin)
  primary_company_id UUID REFERENCES companies(id),
  
  -- Settings
  language VARCHAR(2) DEFAULT 'nl',
  timezone VARCHAR(50) DEFAULT 'Europe/Brussels',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User access to multiple companies
CREATE TABLE user_company_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Granular permissions
  permissions JSONB DEFAULT '{
    "products": {"read": true, "write": false, "delete": false},
    "orders": {"read": true, "write": false, "delete": false},
    "customers": {"read": true, "write": false, "delete": false},
    "inventory": {"read": true, "write": false, "delete": false},
    "reports": {"read": true, "write": false, "delete": false},
    "settings": {"read": false, "write": false, "delete": false}
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, company_id)
);
```

### Customers (B2B Clients)

```sql
-- B2B customers (external)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,                   -- Supabase auth.users reference (if they have login)
  
  -- Company info
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  vat_number VARCHAR(50),
  chamber_of_commerce VARCHAR(50),       -- KvK / BCE number
  
  -- Primary contact
  contact_first_name VARCHAR(100),
  contact_last_name VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  
  -- Classification
  customer_type VARCHAR(50) DEFAULT 'business',
  -- 'business': Regular B2B
  -- 'reseller': Resells our products
  -- 'contractor': Project-based
  -- 'government': Public sector
  
  industry VARCHAR(100),                 -- 'agriculture', 'construction', etc.
  employee_count VARCHAR(50),            -- '1-10', '11-50', etc.
  
  -- Settings
  preferred_language VARCHAR(2) DEFAULT 'nl',
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Marketing
  accepts_marketing BOOLEAN DEFAULT false,
  marketing_source VARCHAR(100),         -- How they found us
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  -- 'pending': Awaiting approval
  -- 'active': Can place orders
  -- 'suspended': Temporarily blocked
  -- 'closed': Account closed
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer relationship with each company
CREATE TABLE customer_company_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Company-specific customer number
  customer_number VARCHAR(50),           -- e.g., 'DEMA-10234'
  
  -- Pricing
  pricing_tier VARCHAR(50) DEFAULT 'standard',
  -- 'standard': List prices
  -- 'silver': 5% discount
  -- 'gold': 10% discount
  -- 'platinum': 15% discount
  -- 'custom': Custom pricing rules
  
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Credit
  credit_limit DECIMAL(12,2),
  current_balance DECIMAL(12,2) DEFAULT 0,
  payment_terms_days INT DEFAULT 30,     -- Net 30, Net 60, etc.
  
  -- ERP reference
  erp_customer_id VARCHAR(100),          -- ID in company's ERP system
  
  -- Status
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  first_order_at TIMESTAMPTZ,
  last_order_at TIMESTAMPTZ,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(customer_id, company_id),
  UNIQUE(company_id, customer_number)
);

-- Customer addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Type
  address_type VARCHAR(20) NOT NULL,     -- 'billing', 'shipping', 'both'
  label VARCHAR(100),                    -- 'Headquarters', 'Warehouse', etc.
  
  -- Address
  street VARCHAR(255) NOT NULL,
  street2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) DEFAULT 'BE',
  
  -- Contact at this address
  contact_name VARCHAR(200),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  
  -- Delivery instructions
  delivery_instructions TEXT,
  
  -- Flags
  is_default_billing BOOLEAN DEFAULT false,
  is_default_shipping BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer contacts (multiple people per customer)
CREATE TABLE customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Contact info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  
  -- Role
  job_title VARCHAR(100),
  department VARCHAR(100),
  role VARCHAR(50),                      -- 'decision_maker', 'buyer', 'technical', 'accounts'
  
  -- Access
  has_portal_access BOOLEAN DEFAULT false,
  auth_id UUID,                          -- If they have login
  
  -- Communication
  is_primary BOOLEAN DEFAULT false,
  receives_invoices BOOLEAN DEFAULT false,
  receives_marketing BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Product Catalog

### Categories

```sql
-- Unified category tree (shared across companies)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hierarchy
  parent_id UUID REFERENCES categories(id),
  level INT DEFAULT 0,                   -- 0 = root, 1 = child, etc.
  path LTREE,                            -- Materialized path for fast queries
  
  -- Identification
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Names (multilingual)
  name_nl VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_fr VARCHAR(255),
  
  -- Descriptions
  description_nl TEXT,
  description_en TEXT,
  description_fr TEXT,
  
  -- Display
  image_url VARCHAR(500),
  icon VARCHAR(50),                      -- Icon name or emoji
  sort_order INT DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Which companies sell products in which categories
CREATE TABLE company_categories (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Company-specific settings
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  
  PRIMARY KEY (company_id, category_id)
);
```

### Products

```sql
-- Products (company-specific)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  category_id UUID REFERENCES categories(id),
  
  -- Identification
  sku VARCHAR(100) NOT NULL,
  manufacturer_sku VARCHAR(100),         -- Original manufacturer SKU
  ean VARCHAR(20),                       -- Barcode
  
  -- Names (multilingual)
  name_nl VARCHAR(500) NOT NULL,
  name_en VARCHAR(500),
  name_fr VARCHAR(500),
  
  -- Descriptions
  description_nl TEXT,
  description_en TEXT,
  description_fr TEXT,
  
  -- Short descriptions (for cards)
  short_description_nl VARCHAR(500),
  short_description_en VARCHAR(500),
  short_description_fr VARCHAR(500),
  
  -- Brand
  brand VARCHAR(255),
  manufacturer VARCHAR(255),
  
  -- Pricing
  cost_price DECIMAL(10,2),              -- Our cost
  base_price DECIMAL(10,2),              -- List price excl. VAT
  compare_at_price DECIMAL(10,2),        -- "Was" price for sales
  vat_rate DECIMAL(5,2) DEFAULT 21.00,
  
  -- Units
  unit VARCHAR(50) DEFAULT 'piece',      -- 'piece', 'meter', 'kg', 'liter'
  unit_quantity DECIMAL(10,3) DEFAULT 1, -- Quantity per unit
  min_order_quantity INT DEFAULT 1,
  order_multiple INT DEFAULT 1,          -- Must order in multiples of X
  
  -- Physical
  weight_kg DECIMAL(10,3),
  length_cm DECIMAL(10,2),
  width_cm DECIMAL(10,2),
  height_cm DECIMAL(10,2),
  
  -- Technical specifications (flexible JSON)
  specifications JSONB DEFAULT '{}',
  -- Example: {"voltage": "230V", "power": "1500W", "material": "RVS"}
  
  -- Media
  images TEXT[],                         -- Array of image URLs
  documents TEXT[],                      -- Array of PDF URLs
  videos TEXT[],                         -- Array of video URLs
  
  -- PDF catalog reference
  pdf_catalog VARCHAR(255),
  pdf_page INT,
  
  -- Grouping
  product_group_id UUID,                 -- For variants
  series VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  -- 'draft': Not visible
  -- 'active': Available for sale
  -- 'discontinued': No longer sold
  -- 'out_of_stock': Temporarily unavailable
  
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  url_slug VARCHAR(255),
  
  -- Search
  search_keywords TEXT,                  -- Additional search terms
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, sku)
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Identification
  sku VARCHAR(100) NOT NULL,
  ean VARCHAR(20),
  
  -- Variant attributes
  variant_label VARCHAR(255),            -- "DN50", "1 inch", "Red"
  attributes JSONB DEFAULT '{}',         -- {"size": "DN50", "color": "Red"}
  
  -- Pricing (overrides product if set)
  base_price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  
  -- Physical (overrides product if set)
  weight_kg DECIMAL(10,3),
  
  -- Media
  image_url VARCHAR(500),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, sku)
);

-- Product relationships (cross-sell, upsell, alternatives)
CREATE TABLE product_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  relationship_type VARCHAR(50) NOT NULL,
  -- 'accessory': Goes with this product
  -- 'alternative': Can replace this product
  -- 'upsell': Better version
  -- 'cross_sell': Often bought together
  -- 'spare_part': Replacement part
  
  sort_order INT DEFAULT 0,
  
  UNIQUE(product_id, related_product_id, relationship_type)
);

-- Cross-company product links (same product sold by multiple companies)
CREATE TABLE product_cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  linked_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Indicates these are the same/equivalent product
  is_same_product BOOLEAN DEFAULT true,
  
  UNIQUE(product_id, linked_product_id)
);
```

### Pricing Rules

```sql
-- Customer-specific pricing
CREATE TABLE customer_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Can apply to product, category, or brand
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  brand VARCHAR(255),
  
  -- Pricing rule
  price_type VARCHAR(50) NOT NULL,
  -- 'fixed': Fixed price
  -- 'discount_percent': Percentage off
  -- 'discount_amount': Fixed amount off
  
  value DECIMAL(10,2) NOT NULL,
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  min_quantity INT DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Only one rule per product/customer combination
  UNIQUE(customer_id, company_id, product_id)
);

-- Volume/quantity discounts
CREATE TABLE quantity_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Apply to product, category, or brand
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  brand VARCHAR(255),
  
  -- Tiers
  min_quantity INT NOT NULL,
  max_quantity INT,
  
  -- Discount
  discount_type VARCHAR(50) NOT NULL,    -- 'percent', 'fixed_per_unit', 'fixed_total'
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Inventory Management

```sql
-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),  -- NULL = shared warehouse
  
  -- Identification
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  
  -- Address
  street VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'BE',
  
  -- Contact
  contact_name VARCHAR(200),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory levels
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  
  -- Quantities
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,       -- Reserved for orders
  quantity_available INT GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  quantity_incoming INT DEFAULT 0,       -- Expected from suppliers
  
  -- Reorder
  reorder_point INT,                     -- Alert when below this
  reorder_quantity INT,                  -- How much to order
  
  -- Location
  bin_location VARCHAR(50),              -- Warehouse location code
  
  -- Tracking
  last_counted_at TIMESTAMPTZ,
  last_received_at TIMESTAMPTZ,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, variant_id, warehouse_id)
);

-- Inventory movements (audit trail)
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id),
  
  -- Movement details
  movement_type VARCHAR(50) NOT NULL,
  -- 'receipt': Goods received
  -- 'sale': Sold to customer
  -- 'return': Customer return
  -- 'adjustment': Manual adjustment
  -- 'transfer': Between warehouses
  -- 'damage': Damaged goods
  
  quantity INT NOT NULL,                 -- Positive or negative
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  
  -- Reference
  reference_type VARCHAR(50),            -- 'order', 'purchase_order', 'manual'
  reference_id UUID,
  
  -- Details
  reason TEXT,
  performed_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Orders & Quotes

```sql
-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  
  -- Identification
  order_number VARCHAR(50) UNIQUE NOT NULL,  -- 'DEMA-2024-00123'
  reference VARCHAR(100),                    -- Customer's PO number
  
  -- Type
  order_type VARCHAR(50) DEFAULT 'standard',
  -- 'standard': Normal order
  -- 'quote': Quote/proposal
  -- 'recurring': Subscription/repeat order
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  -- 'draft': Being created
  -- 'pending': Awaiting confirmation
  -- 'confirmed': Confirmed, awaiting payment/fulfillment
  -- 'processing': Being prepared
  -- 'shipped': Sent to customer
  -- 'delivered': Received by customer
  -- 'completed': Fully completed
  -- 'cancelled': Cancelled
  
  payment_status VARCHAR(50) DEFAULT 'pending',
  -- 'pending': Not paid
  -- 'partial': Partially paid
  -- 'paid': Fully paid
  -- 'refunded': Refunded
  
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',
  -- 'unfulfilled': Not shipped
  -- 'partial': Partially shipped
  -- 'fulfilled': Fully shipped
  
  -- Addresses
  billing_address_id UUID REFERENCES customer_addresses(id),
  shipping_address_id UUID REFERENCES customer_addresses(id),
  
  -- Pricing
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount_total DECIMAL(12,2) DEFAULT 0,
  shipping_total DECIMAL(12,2) DEFAULT 0,
  vat_total DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Discount
  discount_code VARCHAR(50),
  discount_type VARCHAR(50),             -- 'percent', 'fixed'
  discount_value DECIMAL(10,2),
  
  -- Shipping
  shipping_method VARCHAR(100),
  shipping_carrier VARCHAR(100),
  tracking_number VARCHAR(255),
  tracking_url VARCHAR(500),
  
  -- Dates
  ordered_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Expected dates
  expected_ship_date DATE,
  expected_delivery_date DATE,
  
  -- Notes
  customer_notes TEXT,                   -- Notes from customer
  internal_notes TEXT,                   -- Internal notes
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  
  -- ERP
  erp_order_id VARCHAR(100),
  synced_to_erp_at TIMESTAMPTZ,
  
  -- Source
  source VARCHAR(50) DEFAULT 'web',      -- 'web', 'phone', 'email', 'api'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Product reference
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  -- Snapshot (in case product changes)
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(500) NOT NULL,
  
  -- Quantities
  quantity INT NOT NULL,
  quantity_fulfilled INT DEFAULT 0,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 21.00,
  line_total DECIMAL(12,2) NOT NULL,
  
  -- Fulfillment
  warehouse_id UUID REFERENCES warehouses(id),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order status history
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes (separate from orders for flexibility)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  
  -- Identification
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  -- 'draft': Being created
  -- 'sent': Sent to customer
  -- 'viewed': Customer viewed
  -- 'accepted': Customer accepted
  -- 'rejected': Customer rejected
  -- 'expired': Past validity date
  -- 'converted': Converted to order
  
  -- Validity
  valid_until DATE,
  
  -- Contact info (for non-registered customers)
  contact_name VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_company VARCHAR(255),
  
  -- Pricing
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount_total DECIMAL(12,2) DEFAULT 0,
  vat_total DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  
  -- Notes
  customer_message TEXT,                 -- What customer asked for
  internal_notes TEXT,
  terms_and_conditions TEXT,
  
  -- Conversion
  converted_order_id UUID REFERENCES orders(id),
  converted_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote items
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  sku VARCHAR(100),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 21.00,
  line_total DECIMAL(12,2) NOT NULL,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## CRM & Marketing

```sql
-- Customer interactions/activities
CREATE TABLE customer_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  
  -- Activity type
  activity_type VARCHAR(50) NOT NULL,
  -- 'note': Internal note
  -- 'email': Email sent/received
  -- 'call': Phone call
  -- 'meeting': Meeting
  -- 'quote': Quote sent
  -- 'order': Order placed
  -- 'support': Support ticket
  
  -- Details
  subject VARCHAR(255),
  description TEXT,
  
  -- References
  reference_type VARCHAR(50),            -- 'order', 'quote', 'ticket'
  reference_id UUID,
  
  -- Assignment
  performed_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),  -- NULL = group-wide
  
  -- Campaign info
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  
  -- Content
  content_html TEXT,
  content_text TEXT,
  
  -- Targeting
  segment_criteria JSONB,                -- Filter criteria
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  
  -- Schedule
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Stats
  recipients_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions/Discount codes
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),  -- NULL = all companies
  
  -- Identification
  code VARCHAR(50) UNIQUE,               -- NULL = automatic
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Type
  promotion_type VARCHAR(50) NOT NULL,
  -- 'percentage': Percentage off
  -- 'fixed_amount': Fixed amount off
  -- 'free_shipping': Free shipping
  -- 'buy_x_get_y': Buy X get Y free
  
  -- Value
  discount_value DECIMAL(10,2),
  
  -- Conditions
  min_order_amount DECIMAL(10,2),
  min_quantity INT,
  
  -- Applies to
  applies_to VARCHAR(50) DEFAULT 'all',  -- 'all', 'products', 'categories'
  applicable_products UUID[],
  applicable_categories UUID[],
  
  -- Limits
  usage_limit INT,                       -- Total uses allowed
  usage_per_customer INT,                -- Uses per customer
  current_usage INT DEFAULT 0,
  
  -- Validity
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ERP Integration

```sql
-- ERP sync configuration
CREATE TABLE erp_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  
  -- ERP system
  erp_type VARCHAR(50) NOT NULL,         -- 'odoo', 'exact', 'sap', 'custom'
  erp_version VARCHAR(50),
  
  -- Connection
  api_url VARCHAR(500),
  api_key_encrypted TEXT,                -- Encrypted API key
  
  -- Sync settings
  sync_products BOOLEAN DEFAULT true,
  sync_inventory BOOLEAN DEFAULT true,
  sync_customers BOOLEAN DEFAULT true,
  sync_orders BOOLEAN DEFAULT true,
  
  -- Sync frequency (cron expression)
  sync_schedule VARCHAR(100) DEFAULT '*/15 * * * *',  -- Every 15 min
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_status VARCHAR(50),
  last_sync_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id)
);

-- ERP sync log
CREATE TABLE erp_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  
  -- Sync details
  sync_type VARCHAR(50) NOT NULL,        -- 'products', 'inventory', 'orders', 'customers'
  direction VARCHAR(20) NOT NULL,        -- 'import', 'export'
  
  -- Results
  status VARCHAR(50) NOT NULL,           -- 'success', 'partial', 'failed'
  records_processed INT DEFAULT 0,
  records_created INT DEFAULT 0,
  records_updated INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  
  -- Errors
  errors JSONB,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field mappings for ERP sync
CREATE TABLE erp_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  
  -- Entity
  entity_type VARCHAR(50) NOT NULL,      -- 'product', 'customer', 'order'
  
  -- Mapping
  platform_field VARCHAR(100) NOT NULL,  -- Our field name
  erp_field VARCHAR(100) NOT NULL,       -- ERP field name
  
  -- Transformation
  transform_type VARCHAR(50),            -- 'direct', 'lookup', 'formula'
  transform_config JSONB,
  
  -- Direction
  sync_direction VARCHAR(20) DEFAULT 'both',  -- 'import', 'export', 'both'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes for Performance

```sql
-- Companies
CREATE INDEX idx_companies_slug ON companies(slug);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(primary_company_id);

-- Customers
CREATE INDEX idx_customers_email ON customers(contact_email);
CREATE INDEX idx_customers_vat ON customers(vat_number);
CREATE INDEX idx_customer_company_rel ON customer_company_relationships(customer_id, company_id);

-- Products
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(company_id, sku);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('dutch', name_nl || ' ' || COALESCE(description_nl, '')));

-- Inventory
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity_available) WHERE quantity_available < reorder_point;

-- Orders
CREATE INDEX idx_orders_company ON orders(company_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(ordered_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Quotes
CREATE INDEX idx_quotes_company ON quotes(company_id);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Example policies (Supabase)

-- Super admins see everything
CREATE POLICY "Super admins full access" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Company users see their company's products
CREATE POLICY "Company users see own products" ON products
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_company_access
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Customers see products from companies they're registered with
CREATE POLICY "Customers see available products" ON products
  FOR SELECT
  USING (
    status = 'active'
    AND company_id IN (
      SELECT company_id FROM customer_company_relationships
      WHERE customer_id = (SELECT id FROM customers WHERE auth_id = auth.uid())
    )
  );
```

---

## Summary

This schema supports:

| Feature | Tables |
|---------|--------|
| **5 companies** | `companies` |
| **User management** | `users`, `user_company_access` |
| **Customer accounts** | `customers`, `customer_company_relationships`, `customer_addresses`, `customer_contacts` |
| **Product catalog** | `categories`, `products`, `product_variants` |
| **Pricing rules** | `customer_pricing`, `quantity_discounts` |
| **Inventory** | `warehouses`, `inventory`, `inventory_movements` |
| **Orders** | `orders`, `order_items`, `order_status_history` |
| **Quotes** | `quotes`, `quote_items` |
| **CRM** | `customer_activities`, `email_campaigns`, `promotions` |
| **ERP integration** | `erp_configurations`, `erp_sync_logs`, `erp_field_mappings` |

**Total: 30+ tables** covering all business requirements.

---

*Document Version: 1.0*
*Last Updated: December 2024*
