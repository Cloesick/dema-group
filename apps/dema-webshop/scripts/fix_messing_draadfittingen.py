#!/usr/bin/env python3
"""
Fix messing-draadfittingen.json to:
1. Set proper series_id based on product type (NR 1, NR 2, etc.)
2. Add size (maat) property
3. Fix image sharing across tables
"""

import json
import re
from collections import defaultdict
from pathlib import Path
import fitz

PROJECT_ROOT = Path(__file__).parent.parent
JSON_PATH = PROJECT_ROOT / "documents" / "Product_pdfs" / "json" / "messing-draadfittingen.json"
PDF_PATH = PROJECT_ROOT / "documents" / "Product_pdfs" / "messing-draadfittingen.pdf"
IMAGE_DIR = PROJECT_ROOT / "documents" / "Product_pdfs" / "images" / "messing-draadfittingen"

# SKU prefix to product series mapping based on PDF analysis
# Format: SKU prefix -> (series_slug, series_name, product_type)
SKU_SERIES_MAP = {
    # NR 1 - Bocht 90° buitendraad-binnendraad (page 3)
    "MF1": ("messing-bocht-90-bb", "NR 1 - Messing Bocht 90° B/B", "bocht"),
    
    # NR 2 - Bocht 90° binnendraad-binnendraad (page 3)
    "MF2": ("messing-bocht-90-binnendraad", "NR 2 - Messing Bocht 90° Binnendraad", "bocht"),
    
    # NR 12 - Bocht 45° (page 7)
    "MF12": ("messing-bocht-45", "NR 12 - Messing Bocht 45°", "bocht"),
    
    # NR 18 - T-stuk (page 8)
    "MF18": ("messing-t-stuk-bb", "NR 18 - Messing T-stuk", "t-stuk"),
    
    # NR 22 - Kruisstuk (page 8)
    "MF22": ("messing-kruisstuk", "NR 22 - Messing Kruisstuk", "kruisstuk"),
    
    # NR 23 - Pijpnippel (page 9)
    "MF23": ("messing-pijpnippel", "NR 23 - Messing Pijpnippel", "nippel"),
    "MFBU": ("messing-pijpnippel", "NR 23 - Messing Pijpnippel", "nippel"),
    
    # NR 24 - Verloopnippel / Verloopsok (page 10-11)
    "MF240": ("messing-verloopnippel", "NR 240 - Messing Verloopnippel", "nippel"),
    "MF241": ("messing-verloopsok", "NR 241 - Messing Verloopsok", "sok"),
    "MF245": ("messing-verloopsok-zeskant", "NR 245 - Messing Verloopsok Zeskant", "sok"),
    "MF246": ("messing-verloopnippel-zeskant", "NR 246 - Messing Verloopnippel Zeskant", "nippel"),
    
    # NR 27 - Nippel zeskant (page 12)
    "MF27": ("messing-nippel-zeskant", "NR 27 - Messing Nippel Zeskant", "nippel"),
    
    # NR 28 - Dubbele nippel (page 12)
    "MF28": ("messing-dubbele-nippel", "NR 28 - Messing Dubbele Nippel", "nippel"),
    
    # NR 29 - Dubbele nippel lang (page 12)
    "MF29": ("messing-dubbele-nippel-lang", "NR 29 - Messing Dubbele Nippel Lang", "nippel"),
    
    # NR 30 - Plug (page 13)
    "MF30": ("messing-plug", "NR 30 - Messing Plug", "plug"),
    
    # NR 31 - Plug met binnenzeskant (page 13)
    "MF31": ("messing-plug-binnenzeskant", "NR 31 - Messing Plug Binnenzeskant", "plug"),
    
    # NR 34 - Kap (page 14)
    "MF34": ("messing-kap", "NR 34 - Messing Kap", "kap"),
    
    # NR 47 - Slangpilaar (page 15)
    "MF47": ("messing-slangpilaar", "NR 47 - Messing Slangpilaar", "slangpilaar"),
    
    # NR 53 - Slangpilaar met buitendraad (page 15)
    "MF53": ("messing-slangpilaar-buitendraad", "NR 53 - Messing Slangpilaar Buitendraad", "slangpilaar"),
    
    # NR 54 - Slangpilaar met binnendraad (page 16)
    "MF54": ("messing-slangpilaar-binnendraad", "NR 54 - Messing Slangpilaar Binnendraad", "slangpilaar"),
    
    # NR 90 - Knie 90° (page 4)
    "MF90": ("messing-knie-90", "NR 90 - Messing Knie 90°", "knie"),
    
    # NR 92 - Knie 90° verloop (page 4)
    "MF92": ("messing-knie-90-verloop", "NR 92 - Messing Knie 90° Verloop", "knie"),
    
    # NR 94 - Bocht 90° dubbel buitendraad (page 4)
    "MF94": ("messing-bocht-90-dubbel-buitendraad", "NR 94 - Messing Bocht 90° Dubbel Buitendraad", "bocht"),
    
    # NR 96 - Kniekoppeling (page 5)
    "MF96": ("messing-kniekoppeling", "NR 96 - Messing Kniekoppeling", "koppeling"),
    
    # NR 98 - Kniekoppeling verloop (page 5)
    "MF98": ("messing-kniekoppeling-verloop", "NR 98 - Messing Kniekoppeling Verloop", "koppeling"),
    
    # NR 110 - Verloopnippel (page 6)
    "MF110": ("messing-verloopnippel-110", "NR 110 - Messing Verloopnippel", "nippel"),
    
    # NR 112 - Verlengstuk (page 6)
    "MF112": ("messing-verlengstuk", "NR 112 - Messing Verlengstuk", "verlengstuk"),
    
    # NR 120 - Sok (page 7)
    "MF120": ("messing-sok", "NR 120 - Messing Sok", "sok"),
    
    # NR 121 - Sok binnendraad (page 7)
    "MF121": ("messing-sok-binnendraad", "NR 121 - Messing Sok Binnendraad", "sok"),
    
    # NR 130 - T-stuk verloop (page 8)
    "MF130": ("messing-t-stuk-verloop", "NR 130 - Messing T-stuk Verloop", "t-stuk"),
}


def get_sku_prefix(sku):
    """Extract the prefix from a SKU (letters + first numbers that form the type)."""
    if not sku:
        return ""
    
    # Match pattern like MF130, MF241, MF90, etc.
    match = re.match(r'^(MF\d+)', sku)
    if match:
        return match.group(1)
    
    # Fallback: just letters
    prefix = ""
    for c in sku:
        if c.isalpha():
            prefix += c
        else:
            break
    return prefix


def get_series_for_sku(sku):
    """Get the series info for a SKU based on its prefix."""
    if not sku:
        return None
    
    # Check for special prefixes first (like MFBU)
    for prefix in ["MFBU"]:
        if sku.startswith(prefix) and prefix in SKU_SERIES_MAP:
            return SKU_SERIES_MAP[prefix]
    
    # Try to match the numeric prefix (MF130, MF241, etc.)
    match = re.match(r'^(MF)(\d+)', sku)
    if match:
        base = match.group(1)
        num = match.group(2)
        
        # Try progressively shorter numeric prefixes
        for length in range(len(num), 0, -1):
            test_prefix = base + num[:length]
            if test_prefix in SKU_SERIES_MAP:
                return SKU_SERIES_MAP[test_prefix]
    
    return None


def extract_size_from_sku(sku):
    """Try to extract size info from SKU pattern."""
    # Common patterns: MF28012 -> 1/2", MF2411418 -> 1/4" x 1/8"
    # This is complex, so we'll rely on the JSON data instead
    return None


def load_json():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data):
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def fix_series_ids(records):
    """Fix series_id based on SKU prefix."""
    fixed = 0
    for rec in records:
        sku = rec.get("sku") or ""
        if not sku:
            continue
        
        series_info = get_series_for_sku(sku)
        if series_info:
            series_slug, series_name, product_type = series_info
            new_series_id = f"messing-draadfittingen__{series_slug}"
            
            if rec.get("series_id") != new_series_id:
                rec["series_id"] = new_series_id
                rec["series_name"] = series_name
                rec["product_type"] = product_type
                
                # Also update _enriched
                if "_enriched" in rec:
                    rec["_enriched"]["series_raw"] = series_name
                    rec["_enriched"]["series"] = series_slug
                    rec["_enriched"]["product_type"] = product_type
                
                fixed += 1
    
    return records, fixed


def fix_material_property(records):
    """Ensure all records have material = messing."""
    fixed = 0
    for rec in records:
        if rec.get("material") != "messing":
            rec["material"] = "messing"
            rec["material_name"] = "Messing"
            if "_enriched" in rec:
                rec["_enriched"]["material"] = "messing"
            fixed += 1
    return records, fixed


def fix_image_sharing(records):
    """Fix image sharing for records in the same series."""
    # Group by series_id
    series_groups = defaultdict(list)
    for rec in records:
        series_id = rec.get("series_id", "unknown")
        series_groups[series_id].append(rec)
    
    fixed = 0
    for series_id, group in series_groups.items():
        # Sort by page
        group.sort(key=lambda x: x.get("page", 0))
        
        # Find first image in series
        first_image = None
        for rec in group:
            if rec.get("image"):
                first_image = rec["image"]
                break
        
        # Apply to records without image
        if first_image:
            for rec in group:
                if not rec.get("image"):
                    rec["image"] = first_image
                    fixed += 1
    
    return records, fixed


def main():
    print("Loading messing-draadfittingen.json...")
    records = load_json()
    print(f"Loaded {len(records)} records")
    
    # Fix series IDs
    print("\nFixing series IDs based on SKU prefixes...")
    records, series_fixed = fix_series_ids(records)
    print(f"  Fixed {series_fixed} series IDs")
    
    # Fix material property
    print("\nFixing material properties...")
    records, material_fixed = fix_material_property(records)
    print(f"  Fixed {material_fixed} material properties")
    
    # Fix image sharing
    print("\nFixing image sharing...")
    records, image_fixed = fix_image_sharing(records)
    print(f"  Fixed {image_fixed} missing images")
    
    # Count records without images
    missing = sum(1 for r in records if not r.get("image"))
    print(f"\nRecords still missing images: {missing}")
    
    # Save
    print(f"\nSaving {len(records)} records...")
    save_json(records)
    print("Done!")
    
    # Summary by series
    from collections import Counter
    series_counts = Counter(r.get("series_id") for r in records)
    print("\n=== Records by series ===")
    for series, count in series_counts.most_common(20):
        print(f"  {series}: {count}")


if __name__ == "__main__":
    main()
