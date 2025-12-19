#!/usr/bin/env python3
"""
Fix material properties across multiple PDF catalogs.
Adds material, coating, and seal properties based on SKU patterns and page context.
"""

import json
from collections import defaultdict, Counter
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
JSON_DIR = PROJECT_ROOT / "documents" / "Product_pdfs" / "json"

# ============================================================================
# SLANGKOPPELINGEN - Coupling materials (VERZINKT, INOX/RVS, PVDF)
# ============================================================================
SLANGKOPPELINGEN_MATERIALS = {
    # Bauer type - Verzinkt (pages 4-9)
    "B": {"pages": range(4, 10), "material": "verzinkt", "material_name": "Verzinkt staal"},
    # Bauer type - Inox (pages 10-11)
    "BI": {"pages": range(10, 12), "material": "rvs", "material_name": "RVS/Inox"},
    
    # Perrot type - Verzinkt (pages 14-20)
    "P": {"pages": range(14, 21), "material": "verzinkt", "material_name": "Verzinkt staal"},
    # Perrot type - Inox (pages 21-23)
    "PI": {"pages": range(21, 24), "material": "rvs", "material_name": "RVS/Inox"},
    
    # D-koppeling - Verzinkt (pages 28-35)
    "D": {"pages": range(28, 36), "material": "verzinkt", "material_name": "Verzinkt staal"},
    
    # Storz - Aluminium (pages 36-42)
    "ST": {"pages": range(36, 43), "material": "aluminium", "material_name": "Aluminium"},
    
    # Camlock - Various materials
    "C": {"pages": range(50, 60), "material": "aluminium", "material_name": "Aluminium"},
    "CI": {"pages": range(60, 65), "material": "rvs", "material_name": "RVS 316"},
    "CPP": {"pages": range(65, 70), "material": "pp", "material_name": "PP (Polypropyleen)"},
    
    # GEKA koppelingen - Messing (pages 75-80)
    "GM": {"pages": range(75, 85), "material": "messing", "material_name": "Messing"},
    "GMI": {"pages": range(85, 90), "material": "rvs", "material_name": "RVS/Inox"},
    
    # PVDF koppelingen (pages 87-90)
    "PVDF": {"pages": range(87, 95), "material": "pvdf", "material_name": "PVDF"},
}

# SKU prefix patterns for slangkoppelingen material detection
SLANGKOPPELINGEN_SKU_MATERIALS = {
    # Bauer
    "BV": ("verzinkt", "Verzinkt staal"),  # Bauer Verzinkt
    "BI": ("rvs", "RVS/Inox"),  # Bauer Inox
    "BR": ("rvs", "RVS/Inox"),  # Bauer RVS
    
    # Perrot
    "PV": ("verzinkt", "Verzinkt staal"),
    "PI": ("rvs", "RVS/Inox"),
    "PR": ("rvs", "RVS/Inox"),
    
    # D-koppeling
    "DV": ("verzinkt", "Verzinkt staal"),
    "DI": ("rvs", "RVS/Inox"),
    
    # Storz
    "ST": ("aluminium", "Aluminium"),
    "STI": ("rvs", "RVS/Inox"),
    
    # Camlock
    "CA": ("aluminium", "Aluminium"),
    "CI": ("rvs", "RVS 316"),
    "CPP": ("pp", "PP (Polypropyleen)"),
    "CPVDF": ("pvdf", "PVDF"),
    
    # GEKA
    "GM": ("messing", "Messing"),
    "GMI": ("rvs", "RVS/Inox"),
    
    # Guillemin
    "GU": ("aluminium", "Aluminium"),
    "GUI": ("rvs", "RVS/Inox"),
    
    # DSP
    "DSP": ("aluminium", "Aluminium"),
    "DSPI": ("rvs", "RVS/Inox"),
    
    # Zuivelkoppelingen DIN
    "MKDIN": ("rvs", "RVS 304"),
    
    # Tankwagen
    "VA": ("aluminium", "Aluminium"),
    "VAI": ("rvs", "RVS/Inox"),
    
    # PVDF
    "PVDF": ("pvdf", "PVDF"),
    "LDP": ("pvdf", "PVDF"),  # PVDF fittings
}

# ============================================================================
# MESSING-DRAADFITTINGEN - All messing
# ============================================================================
MESSING_MATERIALS = {
    "default": ("messing", "Messing"),
}

# ============================================================================
# RVS-DRAADFITTINGEN - RVS 304 and RVS 316
# ============================================================================
RVS_SKU_MATERIALS = {
    "304": ("rvs-304", "RVS 304"),
    "316": ("rvs-316", "RVS 316"),
    # Default for RVS fittings
    "default": ("rvs", "RVS"),
}

# ============================================================================
# VERZINKTE-BUIZEN - All verzinkt
# ============================================================================
VERZINKT_MATERIALS = {
    "default": ("verzinkt", "Verzinkt staal"),
}

# ============================================================================
# ZWARTE-DRAAD-EN-LASFITTINGEN - Zwart staal
# ============================================================================
ZWART_MATERIALS = {
    "default": ("zwart-staal", "Zwart staal"),
}


def get_sku_prefix(sku):
    """Extract the letter prefix from a SKU."""
    if not sku:
        return ""
    prefix = ""
    for c in sku:
        if c.isalpha():
            prefix += c
        else:
            break
    return prefix.upper()


def fix_slangkoppelingen():
    """Fix material properties for slangkoppelingen.json."""
    json_path = JSON_DIR / "slangkoppelingen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        sku = rec.get("sku") or ""
        prefix = get_sku_prefix(sku)
        
        # Try to match SKU prefix to material
        material = None
        material_name = None
        
        # Try progressively shorter prefixes
        for length in range(len(prefix), 0, -1):
            short_prefix = prefix[:length]
            if short_prefix in SLANGKOPPELINGEN_SKU_MATERIALS:
                material, material_name = SLANGKOPPELINGEN_SKU_MATERIALS[short_prefix]
                break
        
        if material:
            rec["material"] = material
            rec["material_name"] = material_name
            if "_enriched" in rec:
                rec["_enriched"]["material"] = material
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_messing_draadfittingen():
    """Fix material properties for messing-draadfittingen.json."""
    json_path = JSON_DIR / "messing-draadfittingen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        if not rec.get("material"):
            rec["material"] = "messing"
            rec["material_name"] = "Messing"
            if "_enriched" in rec:
                rec["_enriched"]["material"] = "messing"
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_rvs_draadfittingen():
    """Fix material properties for rvs-draadfittingen.json."""
    json_path = JSON_DIR / "rvs-draadfittingen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        sku = rec.get("sku") or ""
        series_name = rec.get("series_name") or ""
        
        # Detect RVS 304 vs 316 from SKU or series name
        if "316" in sku or "316" in series_name:
            material = "rvs-316"
            material_name = "RVS 316"
        elif "304" in sku or "304" in series_name:
            material = "rvs-304"
            material_name = "RVS 304"
        else:
            material = "rvs"
            material_name = "RVS"
        
        if rec.get("material") != material:
            rec["material"] = material
            rec["material_name"] = material_name
            if "_enriched" in rec:
                rec["_enriched"]["material"] = material
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_verzinkte_buizen():
    """Fix material properties for verzinkte-buizen.json."""
    json_path = JSON_DIR / "verzinkte-buizen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        if not rec.get("material"):
            rec["material"] = "verzinkt"
            rec["material_name"] = "Verzinkt staal"
            if "_enriched" in rec:
                rec["_enriched"]["material"] = "verzinkt"
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_zwarte_fittingen():
    """Fix material properties for zwarte-draad-en-lasfittingen.json."""
    json_path = JSON_DIR / "zwarte-draad-en-lasfittingen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        if not rec.get("material"):
            rec["material"] = "zwart-staal"
            rec["material_name"] = "Zwart staal"
            if "_enriched" in rec:
                rec["_enriched"]["material"] = "zwart-staal"
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_rubber_slangen():
    """Fix material properties for rubber-slangen.json."""
    json_path = JSON_DIR / "rubber-slangen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        series_name = (rec.get("series_name") or "").upper()
        
        # Detect rubber type from series name
        if "EPDM" in series_name:
            material = "epdm"
            material_name = "EPDM Rubber"
        elif "NBR" in series_name or "NITRIL" in series_name:
            material = "nbr"
            material_name = "NBR (Nitril) Rubber"
        elif "SBR" in series_name:
            material = "sbr"
            material_name = "SBR Rubber"
        elif "SILICONE" in series_name:
            material = "silicone"
            material_name = "Silicone Rubber"
        else:
            material = "rubber"
            material_name = "Rubber"
        
        if rec.get("material") != material:
            rec["material"] = material
            rec["material_name"] = material_name
            if "_enriched" in rec:
                rec["_enriched"]["material"] = material
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_pe_buizen():
    """Fix material properties for pe-buizen.json."""
    json_path = JSON_DIR / "pe-buizen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        series_name = (rec.get("series_name") or "").upper()
        sku = (rec.get("sku") or "").upper()
        
        # Detect PE type
        if "HDPE" in series_name or "HDPE" in sku:
            material = "hdpe"
            material_name = "HDPE (Hoge dichtheid PE)"
        elif "LDPE" in series_name or "LDPE" in sku:
            material = "ldpe"
            material_name = "LDPE (Lage dichtheid PE)"
        elif "PP" in series_name[:3] or sku.startswith("PP"):
            material = "pp"
            material_name = "PP (Polypropyleen)"
        else:
            material = "pe"
            material_name = "PE (Polyethyleen)"
        
        if rec.get("material") != material:
            rec["material"] = material
            rec["material_name"] = material_name
            if "_enriched" in rec:
                rec["_enriched"]["material"] = material
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_abs_persluchtbuizen():
    """Fix material properties for abs-persluchtbuizen.json."""
    json_path = JSON_DIR / "abs-persluchtbuizen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        if not rec.get("material"):
            rec["material"] = "abs"
            rec["material_name"] = "ABS (Acrylonitril-butadieen-styreen)"
            if "_enriched" in rec:
                rec["_enriched"]["material"] = "abs"
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def fix_kunststof_afvoerleidingen():
    """Fix material properties for kunststof-afvoerleidingen.json."""
    json_path = JSON_DIR / "kunststof-afvoerleidingen.json"
    if not json_path.exists():
        print(f"  Skipping: {json_path.name} not found")
        return 0
    
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    fixed = 0
    for rec in records:
        series_name = (rec.get("series_name") or "").upper()
        
        # Detect material from series name
        if "PP" in series_name[:3]:
            material = "pp"
            material_name = "PP (Polypropyleen)"
        elif "PVC" in series_name:
            material = "pvc"
            material_name = "PVC"
        else:
            material = "kunststof"
            material_name = "Kunststof"
        
        if rec.get("material") != material:
            rec["material"] = material
            rec["material_name"] = material_name
            if "_enriched" in rec:
                rec["_enriched"]["material"] = material
            fixed += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    return fixed


def main():
    print("Fixing material properties across catalogs...\n")
    
    results = {}
    
    print("1. Slangkoppelingen...")
    results["slangkoppelingen"] = fix_slangkoppelingen()
    print(f"   Fixed {results['slangkoppelingen']} records")
    
    print("2. Messing draadfittingen...")
    results["messing-draadfittingen"] = fix_messing_draadfittingen()
    print(f"   Fixed {results['messing-draadfittingen']} records")
    
    print("3. RVS draadfittingen...")
    results["rvs-draadfittingen"] = fix_rvs_draadfittingen()
    print(f"   Fixed {results['rvs-draadfittingen']} records")
    
    print("4. Verzinkte buizen...")
    results["verzinkte-buizen"] = fix_verzinkte_buizen()
    print(f"   Fixed {results['verzinkte-buizen']} records")
    
    print("5. Zwarte draad- en lasfittingen...")
    results["zwarte-fittingen"] = fix_zwarte_fittingen()
    print(f"   Fixed {results['zwarte-fittingen']} records")
    
    print("6. Rubber slangen...")
    results["rubber-slangen"] = fix_rubber_slangen()
    print(f"   Fixed {results['rubber-slangen']} records")
    
    print("7. PE buizen...")
    results["pe-buizen"] = fix_pe_buizen()
    print(f"   Fixed {results['pe-buizen']} records")
    
    print("8. ABS persluchtbuizen...")
    results["abs-persluchtbuizen"] = fix_abs_persluchtbuizen()
    print(f"   Fixed {results['abs-persluchtbuizen']} records")
    
    print("9. Kunststof afvoerleidingen...")
    results["kunststof-afvoerleidingen"] = fix_kunststof_afvoerleidingen()
    print(f"   Fixed {results['kunststof-afvoerleidingen']} records")
    
    print(f"\n=== Summary ===")
    total = sum(results.values())
    print(f"Total records fixed: {total}")
    for catalog, count in results.items():
        if count > 0:
            print(f"  {catalog}: {count}")


if __name__ == "__main__":
    main()
