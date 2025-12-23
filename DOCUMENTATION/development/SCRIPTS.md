# Build & Data Scripts

## Overview

Scripts for data extraction, processing, and catalog generation.

## Main Scripts

### Product Data Generation

```bash
# Generate grouped product catalogs
node scripts/generate_grouped_catalogs.js
```

**Purpose:** Groups raw product data into product families with variants.

**Output:** `public/data/*_grouped.json`

### PDF Analysis

```bash
# Extract data from PDF catalogs
python scripts/analyze_product_pdfs.py
```

**Purpose:** Unified script for all PDF data extraction:
- Series detection
- Image extraction
- Material detection
- SKU mapping
- Property extraction

**Note:** All PDF parsing logic should be consolidated in this single script.

### Image Sync

```bash
npm run sync-images
```

**Purpose:** Synchronizes product images from extracted PDFs.

## Script Locations

```
scripts/
├── generate_grouped_catalogs.js    # Main grouping script
├── analyze_product_pdfs.py         # PDF extraction (unified)
├── catalog-processing/             # Catalog enrichment
├── images/                         # Image processing
├── makita/                         # Makita-specific
└── pdf-generation/                 # PDF tools
```

## Property Extraction

In `generate_grouped_catalogs.js`:

```javascript
const propertyFields = [
  // Basic
  'type', 'materiaal', 'material',
  
  // Dimensions
  'diameter', 'lengte', 'breedte', 'hoogte',
  'maat', 'size', 'dn', 'inch',
  
  // Technical
  'druk', 'pressure', 'bar',
  'debiet', 'flow', 'capaciteit',
  'vermogen', 'power', 'watt', 'kw',
  'spanning', 'voltage',
  
  // Makita-specific
  'model', 'toerental', 'slagkracht',
  'boorkop', 'zaagblad', 'accu', 'lader',
  
  // ... 50+ fields
];
```

## Adding New Catalogs

1. **Add PDF** to `documents/Product_pdfs/`

2. **Extract data:**
   ```bash
   python scripts/analyze_product_pdfs.py --input new_catalog.pdf
   ```

3. **Generate grouped JSON:**
   ```bash
   node scripts/generate_grouped_catalogs.js
   ```

4. **Verify output** in `public/data/`

## npm Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "jest",
    "sync-images": "node scripts/sync-images.js",
    "generate-catalogs": "node scripts/generate_grouped_catalogs.js"
  }
}
```

---

*Last Updated: December 2024*
