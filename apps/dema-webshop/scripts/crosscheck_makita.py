#!/usr/bin/env python3
"""
Cross-check Makita PDF content against frontend product data.
"""

import fitz
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

def main():
    # Load product data
    with open(PROJECT_ROOT / "public/data/products_all_grouped.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Get Makita products from catalogus
    makita = [g for g in data if g.get("catalog", "").startswith("makita-catalogus")]
    
    print("=" * 60)
    print("CROSS-CHECK: Makita PDF vs Frontend Data")
    print("=" * 60)
    print(f"Total Makita products: {len(makita)}")
    
    doc = fitz.open(str(PROJECT_ROOT / "public/documents/Product_pdfs/makita-catalogus-2022-nl.pdf"))
    
    matches = 0
    mismatches = 0
    
    # Check first 10 products
    for product in makita[:10]:
        variants = product.get("variants", [])
        if not variants:
            continue
            
        variant = variants[0]
        page_num = variant.get("page") or variant.get("page_in_pdf")
        sku = variant.get("sku", "")
        name = product.get("name", "Unknown")
        
        if not page_num or not sku:
            continue
        
        print(f"\n--- {name} ---")
        print(f"  Page: {page_num}")
        print(f"  SKU: {sku}")
        
        # Get page text
        page = doc[page_num - 1]
        text = page.get_text()
        
        # Check if SKU appears in page text
        if sku in text:
            print(f"  [OK] SKU found in PDF")
            matches += 1
        else:
            print(f"  [!!] SKU NOT found in PDF page {page_num}")
            mismatches += 1
        
        # Show parsed properties
        props = {k: v for k, v in variant.items() if k not in ["sku", "page", "page_in_pdf", "catalog", "brand"]}
        if props:
            print(f"  Properties: {list(props.keys())[:5]}")
    
    doc.close()
    
    print("\n" + "=" * 60)
    print(f"RESULTS: {matches} matches, {mismatches} mismatches")
    print("=" * 60)

if __name__ == "__main__":
    main()
