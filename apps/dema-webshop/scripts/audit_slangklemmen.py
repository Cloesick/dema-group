"""Audit slangklemmen PDF to identify structure and current extraction status."""
import pdfplumber
import re
from pathlib import Path
import json

pdf = pdfplumber.open(r'documents/Product_pdfs/slangklemmen.pdf')

print("=" * 80)
print("SLANGKLEMMEN PDF AUDIT")
print("=" * 80)
print(f"Total pages: {len(pdf.pages)}")

# Check all pages to understand structure
for page_num in range(len(pdf.pages)):
    page = pdf.pages[page_num]
    text = page.extract_text() or ''
    if len(text) > 50:
        print(f"\nPage {page_num + 1}:")
        print(f"  Text preview: {text[:400]}...")
        
        # Look for SKU patterns
        sku_patterns = [
            r'[A-Z]{2,5}\d{3,}',  # Generic SKU pattern
            r'\d{5,}',  # Numeric SKUs
        ]
        for pattern in sku_patterns:
            matches = re.findall(pattern, text)
            if matches:
                print(f"  SKUs found ({pattern}): {list(set(matches))[:15]}")

# Check current extraction
print("\n" + "=" * 80)
print("CURRENT EXTRACTION STATUS")
print("=" * 80)

grouped_path = Path('public/data/slangklemmen_grouped.json')
if grouped_path.exists():
    data = json.loads(grouped_path.read_text(encoding='utf-8'))
    print(f"Groups: {len(data)}")
    print(f"Total variants: {sum(g.get('variant_count', 0) for g in data)}")
    print("\nAll groups:")
    for i, g in enumerate(data):
        has_img = "✓" if g.get('images') else "✗"
        print(f"  {i+1}. {g['name']} - {g.get('variant_count')} variants [{has_img}]")
