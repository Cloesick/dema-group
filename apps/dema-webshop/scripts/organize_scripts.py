"""
Organize Scripts by Functionality
==================================
Reorganizes all scripts into logical subdirectories for better maintainability.
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

# Base directory
SCRIPTS_DIR = Path(__file__).parent

# Script organization map (script_name: target_folder)
ORGANIZATION = {
    # Image Generation & Processing
    'generate_makita_images.py': 'images',
    'map_aandrijf_images.py': 'images',
    'sync-images.js': 'images',
    
    # PDF & Document Generation
    'convert_to_pdf.bat': 'pdf-generation',
    'create_printable_html.py': 'pdf-generation',
    'generate_ereader_pdfs.py': 'pdf-generation',
    'generate_pdfs_simple.py': 'pdf-generation',
    'crosscheck_pdfs.js': 'pdf-generation',
    'render_pdf_pages.js': 'pdf-generation',
    'render_single.js': 'pdf-generation',
    'test_pdf_links.py': 'pdf-generation',
    
    # Catalog & Product Data Processing
    'advanced_enrichment.py': 'catalog-processing',
    'clean_and_remerge.py': 'catalog-processing',
    'enrich_catalog.py': 'catalog-processing',
    'find_best_source.py': 'catalog-processing',
    'parse_descriptions.js': 'catalog-processing',
    'pomp_catalog_utils.py': 'catalog-processing',
    'verify_catalog_data.py': 'catalog-processing',
    'check_request_quote_products.py': 'catalog-processing',
    
    # Makita Integration
    'integrate_makita_batteries_clean.py': 'makita',
    # Note: generate_makita_images.py stays in images but we'll create a symlink
}

def create_readme(folder, description, scripts):
    """Create a README in each folder"""
    readme_path = SCRIPTS_DIR / folder / 'README.md'
    
    content = f"""# {folder.replace('-', ' ').title()}

{description}

## Scripts in this folder:

"""
    
    for script in sorted(scripts):
        content += f"- **{script}**\n"
    
    content += f"""
## Usage

All scripts can be run from the project root or from this directory.

**Last organized:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"   ✓ Created {readme_path.name}")

def main():
    print("=" * 80)
    print("ORGANIZING SCRIPTS BY FUNCTIONALITY")
    print("=" * 80)
    
    # Create backup timestamp
    backup_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    print(f"\n📁 Working directory: {SCRIPTS_DIR}")
    print(f"⏰ Timestamp: {backup_timestamp}\n")
    
    # Count scripts per folder
    folder_scripts = {}
    for script, folder in ORGANIZATION.items():
        if folder not in folder_scripts:
            folder_scripts[folder] = []
        folder_scripts[folder].append(script)
    
    # Move scripts
    moved = 0
    skipped = 0
    
    print("📦 Moving scripts...\n")
    
    for script, target_folder in sorted(ORGANIZATION.items()):
        source = SCRIPTS_DIR / script
        target_dir = SCRIPTS_DIR / target_folder
        target = target_dir / script
        
        # Check if source exists
        if not source.exists():
            print(f"   ⚠️  {script} - not found, skipping")
            skipped += 1
            continue
        
        # Check if already in target
        if source.parent == target_dir:
            print(f"   ✓ {script} - already in {target_folder}")
            skipped += 1
            continue
        
        # Move file
        try:
            shutil.move(str(source), str(target))
            print(f"   ✅ {script} → {target_folder}/")
            moved += 1
        except Exception as e:
            print(f"   ❌ {script} - Error: {e}")
            skipped += 1
    
    # Create special handling for Makita images (copy to makita folder)
    makita_img_source = SCRIPTS_DIR / 'images' / 'generate_makita_images.py'
    makita_img_target = SCRIPTS_DIR / 'makita' / 'generate_makita_images.py'
    
    if makita_img_source.exists() and not makita_img_target.exists():
        try:
            shutil.copy2(str(makita_img_source), str(makita_img_target))
            print(f"   📋 generate_makita_images.py → makita/ (copy)")
            folder_scripts['makita'].append('generate_makita_images.py')
        except Exception as e:
            print(f"   ⚠️  Could not copy to makita/: {e}")
    
    # Create README files
    print("\n📝 Creating README files...\n")
    
    descriptions = {
        'images': 'Scripts for generating and processing product images, including Makita product images and catalog image mapping.',
        'pdf-generation': 'Scripts for generating PDFs, rendering PDF pages, and creating e-reader friendly documentation.',
        'catalog-processing': 'Scripts for enriching, validating, and processing product catalog data from various sources.',
        'makita': 'Scripts specifically for Makita battery product integration, including data import and image generation.',
    }
    
    for folder, scripts in folder_scripts.items():
        create_readme(folder, descriptions.get(folder, f'Scripts for {folder}'), scripts)
    
    # Create main index README
    print("\n📄 Creating main index...\n")
    
    index_path = SCRIPTS_DIR / 'README.md'
    index_content = f"""# Scripts Directory

Organized by functionality for better maintainability.

## 📁 Directory Structure

### 🖼️ images/
**Product image generation and processing**

Scripts: {len(folder_scripts.get('images', []))}

Main scripts:
- `generate_makita_images.py` - Generate professional Makita product images
- `map_aandrijf_images.py` - Map Aandrijftechniek catalog images
- `sync-images.js` - Synchronize product images

[View all →](./images/)

---

### 📄 pdf-generation/
**PDF rendering and document generation**

Scripts: {len(folder_scripts.get('pdf-generation', []))}

Main scripts:
- `generate_ereader_pdfs.py` - Create e-reader optimized PDFs
- `create_printable_html.py` - Generate printable HTML documents
- `render_pdf_pages.js` - Render PDF pages to images
- `crosscheck_pdfs.js` - Validate PDF catalog data

[View all →](./pdf-generation/)

---

### 📊 catalog-processing/
**Product data enrichment and validation**

Scripts: {len(folder_scripts.get('catalog-processing', []))}

Main scripts:
- `enrich_catalog.py` - Enrich product catalog with additional data
- `verify_catalog_data.py` - Validate catalog data integrity
- `clean_and_remerge.py` - Clean and merge catalog data
- `parse_descriptions.js` - Parse product descriptions

[View all →](./catalog-processing/)

---

### 🔋 makita/
**Makita product integration**

Scripts: {len(folder_scripts.get('makita', []))}

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

**Last organized:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**Total scripts:** {sum(len(scripts) for scripts in folder_scripts.values())}

**Categories:** {len(folder_scripts)}
"""
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    print(f"   ✓ Created main README.md")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"   ✅ Scripts moved: {moved}")
    print(f"   ⏭️  Scripts skipped: {skipped}")
    print(f"   📁 Folders created: {len(folder_scripts)}")
    print(f"   📝 README files: {len(folder_scripts) + 1}")
    print("\n📂 New structure:")
    for folder, scripts in sorted(folder_scripts.items()):
        print(f"   └── {folder}/ ({len(scripts)} scripts)")
    print("=" * 80)
    print("\n✅ Script organization complete!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
