# Scripts Directory

Organized by functionality for better maintainability.

## 📁 Directory Structure

### 🖼️ images/
**Product image generation and processing**

Scripts: 3

Main scripts:
- `generate_makita_images.py` - Generate professional Makita product images
- `map_aandrijf_images.py` - Map Aandrijftechniek catalog images
- `sync-images.js` - Synchronize product images

[View all →](./images/)

---

### 📄 pdf-generation/
**PDF rendering and document generation**

Scripts: 8

Main scripts:
- `generate_ereader_pdfs.py` - Create e-reader optimized PDFs
- `create_printable_html.py` - Generate printable HTML documents
- `render_pdf_pages.js` - Render PDF pages to images
- `crosscheck_pdfs.js` - Validate PDF catalog data

[View all →](./pdf-generation/)

---

### 📊 catalog-processing/
**Product data enrichment and validation**

Scripts: 8

Main scripts:
- `enrich_catalog.py` - Enrich product catalog with additional data
- `verify_catalog_data.py` - Validate catalog data integrity
- `clean_and_remerge.py` - Clean and merge catalog data
- `parse_descriptions.js` - Parse product descriptions

[View all →](./catalog-processing/)

---

### 🔋 makita/
**Makita product integration**

Scripts: 2

Main scripts:
- `integrate_makita_batteries_clean.py` - Integrate Makita battery products
- `generate_makita_images.py` - Generate Makita product images

[View all →](./makita/)

---

## 🚀 Quick Start

### Generate Makita Images
```bash
python scripts/makita/generate_makita_images.py
```

### Enrich Catalog Data
```bash
python scripts/catalog-processing/enrich_catalog.py
```

### Generate E-Reader PDFs
```bash
python scripts/pdf-generation/generate_ereader_pdfs.py
```

### Verify Catalog Data
```bash
python scripts/catalog-processing/verify_catalog_data.py
```

---

## 📦 Archive

Old or deprecated scripts are moved to `archive/` folder.

---

**Last organized:** 2025-11-30 18:10:07

**Total scripts:** 21

**Categories:** 4
