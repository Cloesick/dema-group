"""
Map extracted aandrijftechniek images to SKUs in catalog
"""
import json
from pathlib import Path
import shutil
from collections import defaultdict

# Load catalog
catalog_path = Path('src/data/catalog_products.json')
with open(catalog_path, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# Load image mapping
image_mapping_path = Path('C:/Users/prova/Documents/Projects/PDF_Analyzer/output/aandrijftechniek_images.json')
with open(image_mapping_path, 'r', encoding='utf-8') as f:
    image_mapping = json.load(f)

# Find aandrijftechniek products
aandrijf_products = [p for p in catalog if 'aandrijftechniek' in str(p.get('catalog', '')).lower()]

print("=" * 80)
print("MAPPING AANDRIJFTECHNIEK IMAGES TO PRODUCTS")
print("=" * 80)

print(f"\n📦 Found {len(aandrijf_products)} aandrijftechniek products")
print(f"📸 Extracted {sum(len(imgs) for imgs in image_mapping['images_by_page'].values())} product images")

# Backup catalog
backup_path = Path('src/data/catalog_products_backup_aandrijf_images.json')
print(f"\n💾 Creating backup...")
shutil.copy(catalog_path, backup_path)
print(f"   ✓ Backup saved")

# Build page -> images mapping
page_images = {}
for page_str, images in image_mapping['images_by_page'].items():
    page_num = int(page_str)
    page_images[page_num] = images

# Build page -> products mapping
products_by_page = defaultdict(list)
for product in aandrijf_products:
    # Try page_in_pdf field first
    page = product.get('page_in_pdf')
    if page:
        products_by_page[page].append(product)
        continue
    
    # Extract page from description
    desc = product.get('description', '')
    import re
    page_match = re.search(r'[Pp]ages?:?\s*(\d+)', desc)
    if page_match:
        page = int(page_match.group(1))
        products_by_page[page].append(product)
    else:
        # Try from image_paths
        image_paths = product.get('image_paths', [])
        if image_paths:
            path_match = re.search(r'_p(\d{3})', image_paths[0])
            if path_match:
                page = int(path_match.group(1))
                products_by_page[page].append(product)

print(f"\n⚡ Mapping images to products...")

stats = {
    'products_updated': 0,
    'images_assigned': 0,
    'pages_with_matches': 0
}

# Strategy: Assign all images from a page to all products on that page
for page_num, products in products_by_page.items():
    if page_num not in page_images:
        continue
    
    images = page_images[page_num]
    if not images:
        continue
    
    stats['pages_with_matches'] += 1
    
    # Create image URLs for webshop
    image_urls = []
    for img_info in images:
        # Copy to public directory
        src_path = Path('C:/Users/prova/Documents/Projects/PDF_Analyzer') / img_info['path']
        dest_dir = Path('public/images/products/aandrijftechniek')
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / img_info['filename']
        
        if src_path.exists():
            shutil.copy(src_path, dest_path)
            image_url = f"/images/products/aandrijftechniek/{img_info['filename']}"
            image_urls.append(image_url)
    
    # Assign to all products on this page
    for product in products:
        # Replace old brand logo images with new product images
        product['images'] = image_urls
        product['image_paths'] = image_urls  # Also update image_paths
        if image_urls:
            product['imageUrl'] = image_urls[0]  # Set first as main image
        
        stats['products_updated'] += 1
        stats['images_assigned'] += len(image_urls)
        
        if stats['products_updated'] <= 10:
            print(f"   ✓ {product['sku']:20} Page {page_num:3} → {len(image_urls)} images")

# Save updated catalog
print(f"\n💾 Saving updated catalog...")
with open(catalog_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)
print(f"   ✓ Saved to {catalog_path}")

# Statistics
print(f"\n📊 MAPPING STATISTICS:")
print(f"   Pages with matches:      {stats['pages_with_matches']}")
print(f"   Products updated:        {stats['products_updated']}")
print(f"   Total images assigned:   {stats['images_assigned']}")
print(f"   Avg images per product:  {stats['images_assigned']/max(1,stats['products_updated']):.1f}")

# Show sample
print(f"\n📋 SAMPLE UPDATED PRODUCTS:")
updated_products = [p for p in aandrijf_products if p.get('images')][:5]
for p in updated_products:
    print(f"\n   SKU: {p['sku']}")
    print(f"   Page: {p.get('page_in_pdf')}")
    print(f"   Images: {len(p['images'])}")
    for img in p['images'][:2]:
        print(f"      {img}")

print(f"\n{'='*80}")
print("✅ MAPPING COMPLETE!")
print("="*80)
