#!/usr/bin/env python3
"""
Fix catalogus-aandrijftechniek-150922.json to:
1. Share images across multi-page tables
2. Fix missing images for records on pages without images (use previous page's image)
3. Ensure consistent image assignment within series
"""

import json
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
JSON_PATH = PROJECT_ROOT / "documents" / "Product_pdfs" / "json" / "catalogus-aandrijftechniek-150922.json"
IMAGE_DIR = PROJECT_ROOT / "documents" / "Product_pdfs" / "images" / "catalogus-aandrijftechniek-150922"


def load_json():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data):
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_images_by_page():
    """Map page numbers to available images."""
    images = list(IMAGE_DIR.glob("*.webp"))
    img_by_page = defaultdict(list)
    
    for img in images:
        name = img.name
        if "__p" in name:
            try:
                page_part = name.split("__p")[1].split("__")[0]
                page_num = int(page_part)
                img_by_page[page_num].append(f"images/catalogus-aandrijftechniek-150922/{img.name}")
            except:
                pass
    
    return img_by_page


def find_image_for_page(page, img_by_page, series_name=None):
    """Find the best image for a page, checking current and previous pages."""
    # First check current page
    if page in img_by_page:
        images = img_by_page[page]
        # If series_name provided, try to find matching image
        if series_name:
            series_slug = series_name.lower().replace(" ", "-")[:20]
            for img in images:
                if series_slug in img.lower():
                    return img
        # Return first image on page
        return images[0] if images else None
    
    # Check previous pages (up to 5 pages back)
    for check_page in range(page - 1, max(1, page - 6), -1):
        if check_page in img_by_page:
            return img_by_page[check_page][0]
    
    return None


def fix_image_sharing(records):
    """Fix image sharing for multi-page tables."""
    img_by_page = get_images_by_page()
    
    # Group records by series_id
    series_groups = defaultdict(list)
    for rec in records:
        series_id = rec.get("series_id", "unknown")
        series_groups[series_id].append(rec)
    
    fixed_count = 0
    
    for series_id, group in series_groups.items():
        # Sort by page
        group.sort(key=lambda x: x.get("page", 0))
        
        # Find the first image in the series (from earliest page)
        first_image = None
        for rec in group:
            if rec.get("image"):
                first_image = rec["image"]
                break
        
        # If no image found in records, try to find one from pages
        if not first_image:
            pages = sorted(set(r.get("page") for r in group if r.get("page")))
            if pages:
                series_name = group[0].get("series_name", "")
                first_image = find_image_for_page(pages[0], img_by_page, series_name)
        
        # Apply image to all records in series that don't have one
        if first_image:
            for rec in group:
                if not rec.get("image"):
                    rec["image"] = first_image
                    fixed_count += 1
    
    return records, fixed_count


def fix_kegellagers_series(records):
    """Specifically fix KEGELLAGERS series on pages 37-38."""
    kegellager_image = "images/catalogus-aandrijftechniek-150922/catalogus-aandrijftechniek-150__p37__kegellagers__v1.webp"
    
    fixed = 0
    for rec in records:
        series_name = rec.get("series_name", "")
        page = rec.get("page", 0)
        
        # Check if this is a KEGELLAGERS record
        if "KEGELLAGER" in series_name.upper() or (page in [37, 38] and not rec.get("image")):
            if not rec.get("image"):
                rec["image"] = kegellager_image
                fixed += 1
            
            # Also update series_id if it's generic
            if rec.get("series_id") == "catalogus-aandrijftechniek-150922__kegellagers":
                pass  # Keep as is
            elif "kegellager" not in rec.get("series_id", "").lower():
                # This might be a misclassified record
                pass
    
    return records, fixed


def main():
    print("Loading catalogus-aandrijftechniek-150922.json...")
    records = load_json()
    print(f"Loaded {len(records)} records")
    
    # Count records without images before fix
    missing_before = sum(1 for r in records if not r.get("image"))
    print(f"Records missing images: {missing_before}")
    
    # Fix KEGELLAGERS series specifically
    print("\nFixing KEGELLAGERS series...")
    records, kegel_fixed = fix_kegellagers_series(records)
    print(f"  Fixed {kegel_fixed} KEGELLAGERS records")
    
    # Fix general image sharing
    print("\nFixing image sharing across multi-page tables...")
    records, general_fixed = fix_image_sharing(records)
    print(f"  Fixed {general_fixed} records")
    
    # Count records without images after fix
    missing_after = sum(1 for r in records if not r.get("image"))
    print(f"\nRecords still missing images: {missing_after}")
    
    # Save
    print(f"\nSaving {len(records)} records...")
    save_json(records)
    print("Done!")
    
    # Summary
    print("\n=== Summary ===")
    print(f"Total records: {len(records)}")
    print(f"Images fixed: {missing_before - missing_after}")
    print(f"Still missing: {missing_after}")


if __name__ == "__main__":
    main()
