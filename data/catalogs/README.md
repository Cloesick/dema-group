# Data Catalogs

This directory contains product and pricing catalogs that are generated locally. These files should not be committed to Git.

## Files Generated Locally

The following files are generated locally and should not be committed:

- `accu-components-products.json` - Accu Components product catalog
- `beltz247-products.json` - Beltz247 product catalog
- `devisschere-products.json` - Devisschere product catalog
- `fluxer-products.json` - Fluxer product catalog
- `price-structure.json` - Pricing structure data
- `suppliers-database.json` - Supplier database

## How to Generate

1. Install dependencies:
```bash
pnpm install
```

2. Run the catalog generation script:
```bash
pnpm run generate-catalogs
```

This will:
- Fetch latest product data
- Process pricing information
- Generate all catalog files

## Validation

After generation, validate the catalogs:
```bash
pnpm run validate-catalogs
```

## Important Notes

- Never commit the generated JSON files
- Always regenerate locally after pulling changes
- Use the validation script to ensure data integrity
- Report any generation errors in the issue tracker

## Data Structure

Each catalog follows this structure:
```typescript
interface Product {
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  supplier: string;
  // ... other fields
}
```

## Troubleshooting

If you encounter issues:

1. Clear the cache:
```bash
pnpm run clear-catalog-cache
```

2. Verify source data is available
3. Check logs in `logs/catalog-generation.log`
4. Run validation with verbose output:
```bash
pnpm run validate-catalogs --verbose
```
