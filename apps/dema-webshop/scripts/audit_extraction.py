import json
import pdfplumber
import re

# Load extracted data
with open('documents/Product_pdfs/json/rvs-draadfittingen.json') as f:
    extracted = json.load(f)

# Load grouped data
with open('public/data/rvs_draadfittingen_grouped.json') as f:
    grouped = json.load(f)

pdf = pdfplumber.open(r'documents/Product_pdfs/rvs-draadfittingen.pdf')

print("=" * 80)
print("EXTRACTION AUDIT: rvs-draadfittingen")
print("=" * 80)

# Count SKUs per page in PDF
pdf_counts = {}
for page_num in range(4, 24):
    page = pdf.pages[page_num - 1]
    text = page.extract_text() or ""
    skus = set(re.findall(r'9(?:ZF|BUL|LAK|LAT|LAE|LAR|LABR|ZFBF|LAN|LAS|LAF|LAFL|ZFVL|ZFGF)[A-Z]*\d+', text))
    if skus:
        pdf_counts[page_num] = len(skus)

# Count extracted SKUs per page
extracted_counts = {}
for p in extracted:
    page = p.get('page', 0)
    if page not in extracted_counts:
        extracted_counts[page] = 0
    extracted_counts[page] += 1

print("\nPer-page comparison:")
print(f"{'Page':<6} {'PDF':<8} {'Extracted':<10} {'Status'}")
print("-" * 40)

total_pdf = 0
total_extracted = 0
for page_num in sorted(set(list(pdf_counts.keys()) + list(extracted_counts.keys()))):
    pdf_count = pdf_counts.get(page_num, 0)
    ext_count = extracted_counts.get(page_num, 0)
    total_pdf += pdf_count
    total_extracted += ext_count
    status = "✓" if pdf_count == ext_count else f"DIFF: {ext_count - pdf_count:+d}"
    print(f"{page_num:<6} {pdf_count:<8} {ext_count:<10} {status}")

print("-" * 40)
print(f"{'TOTAL':<6} {total_pdf:<8} {total_extracted:<10}")

print("\n" + "=" * 80)
print("GROUPED DATA SUMMARY:")
print("=" * 80)
print(f"\nTotal groups: {len(grouped)}")
print(f"Total variants: {sum(g['variant_count'] for g in grouped)}")

# Check for image assignments
print("\n" + "=" * 80)
print("IMAGE ASSIGNMENT CHECK:")
print("=" * 80)

# Group by series and check images
series_images = {}
for p in extracted:
    series = p.get('series_name', 'Unknown')
    image = p.get('image', 'NO IMAGE')
    if series not in series_images:
        series_images[series] = set()
    series_images[series].add(image)

for series, images in sorted(series_images.items()):
    if len(images) > 1:
        print(f"\n{series}:")
        for img in images:
            print(f"  - {img}")
    else:
        img = list(images)[0]
        # Check if image name matches series
        series_slug = series.lower().replace(' ', '-').replace('°', '')
        if series_slug not in img and 'nr-' not in img:
            print(f"\n{series}: {img} (POSSIBLE MISMATCH)")
