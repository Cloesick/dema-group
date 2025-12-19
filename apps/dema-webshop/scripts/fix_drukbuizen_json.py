#!/usr/bin/env python3
"""
Fix drukbuizen.json to:
1. Set proper series_id based on SKU prefix and product type
2. Inherit specs from table headers
3. Fix image sharing across multi-page tables
"""

import json
import re
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
JSON_PATH = PROJECT_ROOT / "documents" / "Product_pdfs" / "json" / "drukbuizen.json"
IMAGE_DIR = PROJECT_ROOT / "documents" / "Product_pdfs" / "images" / "drukbuizen"

# SKU prefix to product series mapping (comprehensive based on PDF analysis)
SKU_SERIES_MAP = {
    # === PVC DRUKBUIZEN (Pressure Pipes) ===
    "DB": ("pvc-drukbuis", "PVC Drukbuis"),
    "DBF": ("pvc-filterbuis", "PVC Filterbuis"),
    "DBT": ("pvc-drukbuis-transparant", "PVC Drukbuis Transparant"),
    "DBR": ("pvc-drukbuis-manchet", "PVC Drukbuis met Manchet"),
    
    # === PVC BOCHTEN (Bends) ===
    "PB": ("pvc-bocht", "PVC Bocht"),
    "PBF": ("pvc-bocht-flens", "PVC Bocht met Flens"),
    "PBK": ("pvc-bocht-kogelkraan", "PVC Bocht Kogelkraan"),
    "PBKI": ("pvc-bocht-kogelkraan-inwendig", "PVC Bocht Kogelkraan Inwendig"),
    "PBR": ("pvc-bocht-reparatie", "PVC Bocht Reparatie"),
    "PBS": ("pvc-s-bocht", "PVC S-Bocht"),
    
    # === PVC VERLOOPSTUKKEN (Reducers) ===
    "PK": ("pvc-verloopstuk", "PVC Verloopstuk"),
    "PKI": ("pvc-verloopstuk-binnendraad", "PVC Verloopstuk Binnendraad"),
    "PKU": ("pvc-verloopstuk-buitendraad", "PVC Verloopstuk Buitendraad"),
    "PKR": ("pvc-verloopring", "PVC Verloopring"),
    "PKRS": ("pvc-verloopring-spie", "PVC Verloopring Spie"),
    "PKG": ("pvc-koppeling-getrompt", "PVC Koppeling Getrompt"),
    
    # === PVC T-STUKKEN (T-pieces) ===
    "PT": ("pvc-t-stuk", "PVC T-stuk"),
    "PTI": ("pvc-t-stuk-binnendraad", "PVC T-stuk Binnendraad"),
    "PTU": ("pvc-t-stuk-buitendraad", "PVC T-stuk Buitendraad"),
    "PTD": ("pvc-doorvoer", "PVC Doorvoer"),
    "PTDK": ("pvc-doorvoer-klemring", "PVC Doorvoer met Klemring"),
    "PTDU": ("pvc-doorvoer-uitwendig", "PVC Doorvoer Uitwendig"),
    "PTKM": ("pvc-terugslagklep-membraan", "PVC Terugslagklep Membraan"),
    "PTKMT": ("pvc-terugslagklep-membraan-transparant", "PVC Terugslagklep Membraan Transparant"),
    "PTKZ": ("pvc-terugslagklep-zuiger", "PVC Terugslagklep Zuiger"),
    
    # === PVC INZETVERLOOP (Insert Reducers) ===
    "PI": ("pvc-inlijmring", "PVC Inlijmring"),
    "PII": ("pvc-inlijmring-binnendraad", "PVC Inlijmring Binnendraad"),
    "PID": ("pvc-inzetdraadsok", "PVC Inzetdraadsok"),
    
    # === PVC MOFFEN EN DOPPEN (Sockets and Caps) ===
    "PM": ("pvc-mof", "PVC Mof"),
    "PD": ("pvc-dop", "PVC Dop"),
    "PDM": ("pvc-dopmoer", "PVC Dopmoer met Dichting"),
    "PDMS": ("pvc-dopmoer-slang", "PVC Dopmoer Slang"),
    
    # === PVC FLENZEN (Flanges) ===
    "PF": ("pvc-flens", "PVC Flens"),
    "PLF": ("pvc-lijmflens", "PVC Lijmflens"),
    "PLK": ("pvc-lijmkap", "PVC Lijmkap"),
    
    # === PVC NIPPELS (Nipples) ===
    "PP": ("pvc-nippel", "PVC Nippel"),
    "PPM": ("pvc-nippel-metrisch", "PVC Nippel Metrisch"),
    "PPH": ("pvc-nippel-hoog", "PVC Nippel Hoog"),
    "PV": ("pvc-verloopnippel", "PVC Verloopnippel"),
    "PVU": ("pvc-verloopnippel-uitwendig", "PVC Verloopnippel Uitwendig"),
    "PVM": ("pvc-verloopmof", "PVC Verloopmof"),
    "PVMH": ("pvc-verloopmof-handgevormd", "PVC Verloopmof Handgevormd"),
    "PVK": ("pvc-vlotterkraan", "PVC Vlotterkraan"),
    "PVLK": ("pvc-vlotterkraan-lijm", "PVC Vlotterkraan Lijm"),
    
    # === PVC REPARATIE (Repair) ===
    "PR": ("pvc-reparatiemof", "PVC Reparatiemof"),
    "PRI": ("pvc-reparatie-inwendig", "PVC Reparatie Inwendig"),
    "PRU": ("pvc-reparatie-uitwendig", "PVC Reparatie Uitwendig"),
    "PH": ("pvc-herstelmof", "PVC Herstelmof"),
    
    # === PVC SPECIALS ===
    "PE": ("pvc-eindstuk", "PVC Eindstuk"),
    "PSK": ("pvc-schuifafsluiter", "PVC Schuifafsluiter"),
    "PAF": ("pvc-afsluiter", "PVC Afsluiter"),
    "PAFK": ("pvc-afsluiter-kogelkraan", "PVC Afsluiter Kogelkraan"),
    
    # === PVC LIJMFITTINGEN (Glue Fittings - Inch) ===
    "LP": ("pvc-lijmfitting", "PVC Lijmfitting"),
    "LF": ("pvc-lijmfitting-inch", "PVC Lijmfitting Inch"),
    "LFB": ("pvc-lijmfitting-bocht", "PVC Lijmfitting Bocht"),
    "LFBK": ("pvc-lijmfitting-bolkraan", "PVC Lijmfitting Bolkraan"),
    "LFD": ("pvc-lijmfitting-dop", "PVC Lijmfitting Dop"),
    "LFI": ("pvc-lijmfitting-inwendig", "PVC Lijmfitting Inwendig"),
    "LFID": ("pvc-lijmfitting-inwendig-dop", "PVC Lijmfitting Inwendig Dop"),
    "LFKR": ("pvc-lijmfitting-kraagbus", "PVC Lijmfitting Kraagbus"),
    "LFP": ("pvc-lijmfitting-pilaar", "PVC Lijmfitting Pilaar"),
    
    # === PVC KOGELKRANEN EN AFSLUITERS (Ball Valves) ===
    "GF": ("pvc-kogelkraan", "PVC Kogelkraan"),
    
    # === PVC MANCHETBUIZEN ===
    "HDBF": ("pvc-manchetbuis-flens", "PVC Manchetbuis met Flens"),
    
    # === UPHF FLENZEN ===
    "UPHF": ("uphf-overschuifflens", "UPHF Overschuifflens"),
    
    # === PP BUISKLEMMEN EN VULBLOKJES ===
    "BKL": ("pp-buisklem", "PP Buisklem"),
    "BKLV": ("pp-vulblokje", "PP Vulblokje"),
}

# SKU to material/seal mapping based on PDF table titles
# Format: SKU prefix or full SKU pattern -> (seal_material, connection_type, additional_info)
SKU_MATERIAL_MAP = {
    # Page 46: Kogelkraan met dubbele wartel
    "GF161546": ("EPDM", "lijmmof", "kraagbusdichting"),  # EPDM kraagbusdichting
    "GF161375": ("VITON", "lijmmof", "kraagbusdichting"),  # VITON kraagbusdichting
    
    # Page 47: Bocht kogelkraan
    "PBK": ("EPDM", "lijmmof", None),
    "PBKI": ("EPDM", "binnendraad", "kraagbusdichting"),
    
    # Page 48: Membraanafsluiter / Vlinderklep
    "PVLK": ("EPDM", "lijmmof", "zitting"),
    
    # Page 50: Terugslagkleppen
    "PTKM": ("EPDM", "lijmmof", "verzinkte veer"),  # Met verzinkte veer
    "PTKZ": ("EPDM", "lijmmof", "zonder veer"),  # Zonder veer (verticale montage)
    "GF161562": ("VITON", "lijmmof", "rvs veer"),  # Met RVS veer
    "PTKMT": ("NBR", "lijmmof", "transparant"),  # Transparant met veer
    
    # Page 51: Tussenklem terugslagklep / Y-terugslagklep
    "GF161303": ("EPDM", "tussenklem", None),
    "PSK": ("EPDM", "lijmspie", None),  # Y-terugslagklep
    
    # Page 52: Voetklep / Kijkglas / Vlotterkraan
    "PVK": ("EPDM", "lijmmof", None),
    "PKG": ("EPDM", "lijmmof", None),
}


def get_sku_prefix(sku):
    """Extract the letter prefix from a SKU."""
    prefix = ""
    for c in sku:
        if c.isalpha():
            prefix += c
        else:
            break
    return prefix


def get_material_for_sku(sku):
    """Get material properties for a SKU based on its prefix or pattern."""
    # Try exact prefix matches (longer prefixes first)
    for length in range(min(len(sku), 10), 2, -1):
        prefix = sku[:length]
        if prefix in SKU_MATERIAL_MAP:
            return SKU_MATERIAL_MAP[prefix]
    
    # Try letter-only prefix
    letter_prefix = get_sku_prefix(sku)
    if letter_prefix in SKU_MATERIAL_MAP:
        return SKU_MATERIAL_MAP[letter_prefix]
    
    return None


def get_series_for_sku(sku):
    """Get the series_id and series_name for a SKU based on its prefix."""
    prefix = get_sku_prefix(sku)
    
    # Try exact match first
    if prefix in SKU_SERIES_MAP:
        return SKU_SERIES_MAP[prefix]
    
    # Try progressively shorter prefixes
    for length in range(len(prefix) - 1, 0, -1):
        short_prefix = prefix[:length]
        if short_prefix in SKU_SERIES_MAP:
            return SKU_SERIES_MAP[short_prefix]
    
    # Default
    return ("pvc-hulpstuk", "PVC Hulpstuk")


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
        sku = rec.get("sku", "")
        if not sku:
            continue
        
        series_slug, series_name = get_series_for_sku(sku)
        new_series_id = f"drukbuizen__{series_slug}"
        
        # Update if different
        if rec.get("series_id") != new_series_id:
            rec["series_id"] = new_series_id
            rec["series_name"] = series_name
            
            # Also update _enriched
            if "_enriched" in rec:
                rec["_enriched"]["series_raw"] = series_name
                rec["_enriched"]["series"] = series_slug
            
            fixed += 1
    
    return records, fixed


def fix_material_properties(records):
    """Add material properties (seal_material, connection_type) based on SKU patterns."""
    fixed = 0
    for rec in records:
        sku = rec.get("sku", "")
        if not sku:
            continue
        
        material_info = get_material_for_sku(sku)
        if material_info:
            seal_material, connection_type, additional_info = material_info
            
            # Add material properties
            rec["seal_material"] = seal_material
            rec["connection_type"] = connection_type
            if additional_info:
                rec["seal_info"] = additional_info
            
            # Also update _enriched if present
            if "_enriched" in rec:
                rec["_enriched"]["seal_material"] = seal_material
                rec["_enriched"]["connection_type"] = connection_type
            
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
    print("Loading drukbuizen.json...")
    records = load_json()
    print(f"Loaded {len(records)} records")
    
    # Fix series IDs
    print("\nFixing series IDs based on SKU prefixes...")
    records, series_fixed = fix_series_ids(records)
    print(f"  Fixed {series_fixed} series IDs")
    
    # Fix material properties (EPDM, VITON, NBR, etc.)
    print("\nFixing material properties...")
    records, material_fixed = fix_material_properties(records)
    print(f"  Added material properties to {material_fixed} records")
    
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
    for series, count in series_counts.most_common(15):
        print(f"  {series}: {count}")
    
    # Summary by material
    material_counts = Counter(r.get("seal_material") for r in records if r.get("seal_material"))
    if material_counts:
        print("\n=== Records by seal material ===")
        for material, count in material_counts.most_common():
            print(f"  {material}: {count}")


if __name__ == "__main__":
    main()
