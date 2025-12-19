#!/usr/bin/env python3
"""
Extract clean product images from Makita PDF catalogs using smart filtering.

This script:
1. Deletes all existing Makita images (old extraction)
2. Re-extracts images using smart filtering criteria
3. Updates product data to use the best available image per page
"""

import sys
import json
import shutil
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

try:
    import fitz
    from PIL import Image
    import io
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("Install with: pip install PyMuPDF Pillow")
    sys.exit(1)

# Paths
PDF_DIR = PROJECT_ROOT / "public" / "documents" / "Product_pdfs"
IMAGE_DIR = PROJECT_ROOT / "public" / "images"
DATA_FILE = PROJECT_ROOT / "public" / "data" / "products_all_grouped.json"

# Makita PDFs
MAKITA_PDFS = [
    "makita-catalogus-2022-nl.pdf",
    "makita-tuinfolder-2022-nl.pdf",
]

# Image quality criteria
MIN_DIMENSION = 150      # Both width and height must be at least this
MIN_SIZE_KB = 15         # Must be at least 15KB
MAX_SIZE_KB = 180        # Must be under 180KB (filter full-page backgrounds)
MIN_ASPECT = 0.3         # Not too tall/narrow
MAX_ASPECT = 3.0         # Not too wide (banners)


def is_good_product_image(width, height, size_bytes):
    """Check if image meets quality criteria for a product image."""
    if width < MIN_DIMENSION or height < MIN_DIMENSION:
        return False
    
    size_kb = size_bytes / 1024
    if size_kb < MIN_SIZE_KB or size_kb > MAX_SIZE_KB:
        return False
    
    aspect = width / height if height > 0 else 0
    if aspect < MIN_ASPECT or aspect > MAX_ASPECT:
        return False
    
    return True


def extract_makita_images(pdf_path, output_dir):
    """Extract clean product images from a Makita PDF."""
    pdf_stem = pdf_path.stem
    page_output_dir = output_dir / pdf_stem
    page_output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nProcessing: {pdf_path.name}")
    
    # Track best image per page
    page_images = {}  # page_num -> [(path, size), ...]
    
    try:
        doc = fitz.open(str(pdf_path))
        total_pages = len(doc)
        print(f"  Total pages: {total_pages}")
        
        extracted = 0
        skipped = 0
        
        for page_num in range(1, total_pages + 1):
            page = doc[page_num - 1]
            page_height = page.rect.height
            page_images[page_num] = []
            
            for img_idx, img_info in enumerate(page.get_images(full=True)):
                try:
                    xref = img_info[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    width = base_image.get("width", 0)
                    height = base_image.get("height", 0)
                    size_bytes = len(image_bytes)
                    
                    # Get image position
                    rects = page.get_image_rects(xref)
                    if rects:
                        rect = rects[0]
                        # Skip header (top 10%) and footer (bottom 5%)
                        if rect.y1 < page_height * 0.1 or rect.y0 > page_height * 0.95:
                            skipped += 1
                            continue
                    
                    # Check quality criteria
                    if not is_good_product_image(width, height, size_bytes):
                        skipped += 1
                        continue
                    
                    # Save image
                    img_filename = f"{pdf_stem}__p{page_num}__product__v{img_idx + 1}.webp"
                    img_path = page_output_dir / img_filename
                    
                    pil_img = Image.open(io.BytesIO(image_bytes))
                    if pil_img.mode not in ("RGB", "RGBA", "LA", "P"):
                        pil_img = pil_img.convert("RGB")
                    pil_img.save(img_path, "WEBP", quality=90)
                    
                    rel_path = f"images/{pdf_stem}/{img_filename}"
                    page_images[page_num].append((rel_path, size_bytes))
                    extracted += 1
                    
                except Exception as e:
                    print(f"    Error on page {page_num}, image {img_idx}: {e}")
            
            # Sort images by size (best quality first)
            page_images[page_num].sort(key=lambda x: x[1], reverse=True)
        
        doc.close()
        print(f"  Extracted: {extracted} good images")
        print(f"  Skipped: {skipped} bad images (icons, banners, etc.)")
        
    except Exception as e:
        print(f"  Error: {e}")
    
    return page_images


def update_product_data(catalog_images):
    """Update product data to use the best extracted images."""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = 0
    no_image = 0
    
    for group in data:
        catalog = group.get("catalog", "")
        if not catalog or "makita" not in catalog.lower():
            continue
        
        # Get page number
        page = None
        if group.get("variants"):
            variant = group["variants"][0]
            page = variant.get("page") or variant.get("page_in_pdf")
        
        if not page:
            continue
        
        # Find best image for this page
        page_imgs = catalog_images.get(catalog, {}).get(page, [])
        
        if page_imgs:
            best_image = page_imgs[0][0]  # First = largest = best
            if group.get("media"):
                group["media"][0]["url"] = best_image
            else:
                group["media"] = [{"url": best_image, "role": "main"}]
            updated += 1
        else:
            no_image += 1
    
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\nUpdated {updated} product groups with new images")
    print(f"{no_image} products have no good image available")


def main():
    print("=" * 60)
    print("Makita Smart Image Extraction")
    print("=" * 60)
    print(f"Criteria: {MIN_DIMENSION}px min, {MIN_SIZE_KB}-{MAX_SIZE_KB}KB, aspect {MIN_ASPECT}-{MAX_ASPECT}")
    
    # Step 1: Delete old Makita images
    print("\n[Step 1] Cleaning old images...")
    for pdf_name in MAKITA_PDFS:
        pdf_stem = Path(pdf_name).stem
        old_dir = IMAGE_DIR / pdf_stem
        if old_dir.exists():
            # Only delete non-rendered images (keep rendered for now as backup)
            for f in old_dir.glob("*.webp"):
                if "rendered" not in f.name:
                    f.unlink()
            print(f"  Cleaned: {old_dir.name}")
    
    # Step 2: Extract new images
    print("\n[Step 2] Extracting clean product images...")
    all_catalog_images = {}
    
    for pdf_name in MAKITA_PDFS:
        pdf_path = PDF_DIR / pdf_name
        if pdf_path.exists():
            page_images = extract_makita_images(pdf_path, IMAGE_DIR)
            all_catalog_images[pdf_path.stem] = page_images
        else:
            print(f"  Warning: PDF not found: {pdf_path}")
    
    # Step 3: Update product data
    print("\n[Step 3] Updating product data...")
    update_product_data(all_catalog_images)
    
    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
