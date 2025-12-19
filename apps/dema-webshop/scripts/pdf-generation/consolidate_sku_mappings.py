"""
Consolidate SKU to Image Mappings
==================================
Reads all sku_to_image_mapping.json files from extracted catalog folders
and creates a unified Product_images.json for the frontend.
"""

import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
EXTRACTED_CATALOGS_DIR = PROJECT_ROOT / "public" / "product-images" / "extracted-catalogs"
OUTPUT_FILE = PROJECT_ROOT / "public" / "data" / "Product_images.json"

def load_catalog_mappings():
    """Load all SKU mapping files from extracted catalogs"""
    
    all_mappings = []
    catalogs_processed = 0
    
    if not EXTRACTED_CATALOGS_DIR.exists():
        print(f"❌ Extracted catalogs directory not found: {EXTRACTED_CATALOGS_DIR}")
        return []
    
    # Find all catalog folders
    catalog_folders = [f for f in EXTRACTED_CATALOGS_DIR.iterdir() if f.is_dir()]
    
    print(f"📁 Found {len(catalog_folders)} catalog folders")
    print()
    
    for catalog_folder in sorted(catalog_folders):
        mapping_file = catalog_folder / "sku_to_image_mapping.json"
        
        if not mapping_file.exists():
            print(f"   ⏭️  Skipping {catalog_folder.name} (no mapping file)")
            continue
        
        try:
            with open(mapping_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            catalog_name = data.get('catalog', catalog_folder.name)
            total_skus = data.get('total_skus', 0)
            mapping = data.get('mapping', {})
            
            if mapping:
                all_mappings.append({
                    'catalog': catalog_name,
                    'folder': catalog_folder.name,
                    'total_skus': total_skus,
                    'mapping': mapping
                })
                catalogs_processed += 1
                print(f"   ✅ {catalog_name}: {total_skus} SKUs")
            
        except Exception as e:
            print(f"   ❌ Error loading {catalog_folder.name}: {e}")
    
    print()
    print(f"✅ Loaded {catalogs_processed} catalog mappings")
    
    return all_mappings

def consolidate_mappings(all_mappings):
    """Consolidate all mappings into a single structure"""
    
    # Structure: SKU -> list of image locations across catalogs
    sku_images = {}
    
    total_skus = 0
    total_images = 0
    
    for catalog_data in all_mappings:
        catalog = catalog_data['catalog']
        folder = catalog_data['folder']
        mapping = catalog_data['mapping']
        
        for sku, image_list in mapping.items():
            if sku not in sku_images:
                sku_images[sku] = {
                    'sku': sku,
                    'images': [],
                    'catalogs': []
                }
                total_skus += 1
            
            # Add images from this catalog
            for img_data in image_list:
                # Build the web path to the image
                image_path = f"product-images/extracted-catalogs/{folder}/{img_data['filename']}"
                
                sku_images[sku]['images'].append({
                    'path': image_path,
                    'catalog': catalog,
                    'page': img_data['page'],
                    'related_skus': img_data.get('all_skus', [])
                })
                total_images += 1
            
            # Track which catalogs this SKU appears in
            if catalog not in sku_images[sku]['catalogs']:
                sku_images[sku]['catalogs'].append(catalog)
    
    # For each SKU, set primary image (first one)
    for sku, data in sku_images.items():
        if data['images']:
            data['image_path'] = data['images'][0]['path']
            data['primary_catalog'] = data['images'][0]['catalog']
    
    return sku_images, total_skus, total_images

def save_consolidated_mapping(sku_images, total_skus, total_images, all_mappings):
    """Save the consolidated mapping to JSON"""
    
    # Create output directory if needed
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    output_data = {
        'generated': datetime.now().isoformat(),
        'source': 'PDF extraction with SKU detection',
        'total_unique_skus': total_skus,
        'total_images': total_images,
        'catalogs_included': len(all_mappings),
        'catalog_names': [c['catalog'] for c in all_mappings],
        'sku_images': sku_images
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
    
    file_size = OUTPUT_FILE.stat().st_size / 1024 / 1024  # MB
    
    print(f"💾 Saved consolidated mapping: {OUTPUT_FILE.name}")
    print(f"   📁 Location: {OUTPUT_FILE}")
    print(f"   💿 Size: {file_size:.2f} MB")
    print(f"   🏷️  Unique SKUs: {total_skus:,}")
    print(f"   📸 Total images: {total_images:,}")

def generate_stats(sku_images):
    """Generate statistics about the mappings"""
    
    skus_with_multiple_images = sum(1 for data in sku_images.values() if len(data['images']) > 1)
    skus_in_multiple_catalogs = sum(1 for data in sku_images.values() if len(data['catalogs']) > 1)
    
    # Find SKUs with most images
    top_skus = sorted(sku_images.items(), key=lambda x: len(x[1]['images']), reverse=True)[:10]
    
    print()
    print("=" * 80)
    print("📊 STATISTICS")
    print("=" * 80)
    print(f"   SKUs with multiple images: {skus_with_multiple_images:,}")
    print(f"   SKUs in multiple catalogs: {skus_in_multiple_catalogs:,}")
    
    if top_skus:
        print()
        print("   Top 10 SKUs by image count:")
        for i, (sku, data) in enumerate(top_skus, 1):
            print(f"      {i:2d}. {sku:20s} - {len(data['images'])} images across {len(data['catalogs'])} catalogs")

def main():
    print("=" * 80)
    print("CONSOLIDATE SKU TO IMAGE MAPPINGS")
    print("=" * 80)
    print()
    print(f"📁 Input:  {EXTRACTED_CATALOGS_DIR}")
    print(f"📁 Output: {OUTPUT_FILE}")
    print()
    
    # Load all catalog mappings
    all_mappings = load_catalog_mappings()
    
    if not all_mappings:
        print("\n⚠️  No catalog mappings found!")
        return
    
    print()
    
    # Consolidate into single structure
    print("🔄 Consolidating mappings...")
    sku_images, total_skus, total_images = consolidate_mappings(all_mappings)
    
    print(f"   ✅ Consolidated {total_skus:,} unique SKUs")
    print(f"   ✅ Total {total_images:,} images")
    print()
    
    # Save to file
    save_consolidated_mapping(sku_images, total_skus, total_images, all_mappings)
    
    # Generate statistics
    generate_stats(sku_images)
    
    print()
    print("=" * 80)
    print("✅ CONSOLIDATION COMPLETE")
    print("=" * 80)
    print()
    print("💡 NEXT STEPS:")
    print("   1. The frontend will now use Product_images.json for SKU lookups")
    print("   2. Images are served from /product-images/extracted-catalogs/")
    print("   3. Test by viewing products with SKUs in the webshop")
    print("   4. Check that correct images appear for each SKU")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
