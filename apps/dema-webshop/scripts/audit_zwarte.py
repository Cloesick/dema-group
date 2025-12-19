"""Audit zwarte-draad-en-lasfittingen PDF to identify all series and SKUs per page."""
import pdfplumber
import re
from collections import defaultdict

pdf = pdfplumber.open(r'documents/Product_pdfs/zwarte-draad-en-lasfittingen.pdf')

# SKU patterns for zwarte draadfittingen - include 7LA prefix for lasfittingen
sku_pattern = re.compile(r'7(?:ZF|GB|BUL|LAK|LAT|LAE|LAR|LABR|ZFBF|LAN|LAS|LAF|LA)\w+')

# NR pattern
nr_pattern = re.compile(r'NR\s+(\d+[A-Z]?)\s*[-–]\s*([A-Z0-9°\s\-]+?)(?=\s+NR\s|\s*$|\n)', re.IGNORECASE)

# Other series patterns
other_series = [
    'STALEN GASBUIS', 'STALEN BUIZEN', 'ZWARTE PIJPNIPPELS',
    'LANGSNAAD', 'LASBOCHT', 'LASNIPPEL', 'LASVERLOOP', 'LASTULE',
    'LAS T-STUK', '3D LASBOCHT', 'BLINDFLENS', 'VLAKKE FLENS', 
    'VOORLASFLENS', 'DRAADFLENS', 'BUISFLENS'
]

print("=" * 80)
print("ZWARTE-DRAAD-EN-LASFITTINGEN PDF AUDIT")
print("=" * 80)

total_skus = 0
page_data = {}

for page_num in range(len(pdf.pages)):
    page = pdf.pages[page_num]
    text = page.extract_text() or ''
    
    # Skip pages without product data (first few pages are usually intro)
    if not sku_pattern.search(text):
        continue
    
    # Find NR series
    nr_matches = nr_pattern.findall(text)
    series_found = [f"NR {nr} - {name.strip()}" for nr, name in nr_matches]
    
    # Find other series
    for s in other_series:
        if s in text.upper():
            if s not in series_found:
                series_found.append(s)
    
    # Find all SKUs
    skus = sku_pattern.findall(text)
    unique_skus = list(dict.fromkeys(skus))  # Remove duplicates, preserve order
    
    if unique_skus:
        page_data[page_num + 1] = {
            'series': series_found,
            'skus': unique_skus,
            'sku_count': len(unique_skus)
        }
        total_skus += len(unique_skus)
        
        print(f"\nPage {page_num + 1}:")
        print(f"  Series: {series_found}")
        print(f"  SKUs ({len(unique_skus)}): {unique_skus[:10]}{'...' if len(unique_skus) > 10 else ''}")

print("\n" + "=" * 80)
print(f"SUMMARY: {len(page_data)} pages with products, {total_skus} total SKUs")
print("=" * 80)

# Now compare with extracted JSON
import json
from pathlib import Path

extracted = json.loads(Path('documents/Product_pdfs/json/zwarte-draad-en-lasfittingen.json').read_text(encoding='utf-8'))
extracted_skus = set(p.get('sku') for p in extracted if p.get('sku'))

print(f"\nExtracted JSON has {len(extracted_skus)} unique SKUs")

# Find missing SKUs
pdf_skus = set()
for page_info in page_data.values():
    pdf_skus.update(page_info['skus'])

missing = pdf_skus - extracted_skus
extra = extracted_skus - pdf_skus

if missing:
    print(f"\nMISSING from extraction ({len(missing)}):")
    for sku in sorted(missing)[:20]:
        print(f"  - {sku}")
    if len(missing) > 20:
        print(f"  ... and {len(missing) - 20} more")
else:
    print("\n✓ No missing SKUs!")

if extra:
    print(f"\nEXTRA in extraction (not in PDF scan): {len(extra)}")
