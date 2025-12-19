import re
import pdfplumber
import sys
sys.path.insert(0, 'scripts')
from analyze_product_pdfs import extract_all_series_from_page, extract_zwarte_draadfittingen_from_text

pdf = pdfplumber.open(r'documents/Product_pdfs/zwarte-draad-en-lasfittingen.pdf')
page = pdf.pages[13]
text = page.extract_text() or ''

# Check series detection
series_list = extract_all_series_from_page(text)
print(f"Series list: {series_list}")

# Check product extraction
products = extract_zwarte_draadfittingen_from_text(text, series_list, 300.0)
print(f"Products extracted: {len(products)}")
for p in products[:5]:
    print(f"  SKU: {p['sku']}, Series: {p.get('series_slug')}")
