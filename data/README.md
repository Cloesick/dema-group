# DEMA Group Data

This directory contains structured data for the DEMA Group companies, products, suppliers, and pricing.

## Directory Structure

```
data/
├── catalogs/
│   ├── fluxer-products.json       # Fluxer valve and instrumentation catalog
│   ├── beltz247-products.json     # Beltz247 conveyor belt catalog
│   ├── devisschere-products.json  # De Visschere Technics irrigation catalog
│   ├── accu-components-products.json # Accu Components precision parts catalog
│   ├── suppliers-database.json    # Supplier relationships and contacts
│   └── price-structure.json       # Pricing tiers and product pricing
└── README.md
```

## Data Sources

- **Company Websites**: Product categories and specifications extracted from official websites
- **Market Research**: Pricing based on industry benchmarks and competitor analysis
- **Documentation**: Company profiles from `docs/02-company-analysis/`

## Usage

These JSON files can be used for:

1. **E-commerce Platform**: Import into unified webshop
2. **ERP Integration**: Seed data for inventory management
3. **AI Chatbot**: Product knowledge base
4. **Cross-selling**: Identify complementary products across companies

## Data Schema

### Product Structure
```json
{
  "sku": "string",
  "name": "string",
  "name_nl": "string (Dutch)",
  "category": "string",
  "specifications": {},
  "applications": ["string"],
  "price": {}
}
```

### Supplier Structure
```json
{
  "id": "string",
  "name": "string",
  "country": "string",
  "relationship": "Dealer|Supplier|Partner",
  "relationship_company": "DEMA|Fluxer|Beltz247|DVT|Accu",
  "product_categories": ["string"]
}
```

## Notes

- Prices are indicative and based on market research
- SKUs are generated for reference; actual SKUs may differ
- Data should be validated with actual company catalogs before production use

---

*Last Updated: December 2024*
