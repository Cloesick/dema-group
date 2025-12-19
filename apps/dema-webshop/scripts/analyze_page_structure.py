import pdfplumber
import fitz
import re

pdf_plumber = pdfplumber.open(r'documents/Product_pdfs/rvs-draadfittingen.pdf')
pdf_fitz = fitz.open(r'documents/Product_pdfs/rvs-draadfittingen.pdf')

print("=" * 80)
print("RVS-DRAADFITTINGEN PDF STRUCTURE ANALYSIS")
print("=" * 80)

for page_num in range(4, 24):  # Pages 4-23 have product data
    page = pdf_plumber.pages[page_num - 1]
    fitz_page = pdf_fitz[page_num - 1]
    text = page.extract_text() or ""
    
    page_width = page.width
    page_mid = page_width / 2
    
    # Find series names
    series_matches = re.findall(r'(NR\s+\d+\s*[-–]\s*[A-Z0-9°\s]+?)(?=\s+NR\s|\s+RVS|\s+Bestelnr|\n)', text)
    other_series = re.findall(r'(LANGSNAAD GELASTE RVS BUIS|RVS BUISBODEM|LAS T-STUK|LASBOCHT|3D LASBOCHT|LASVERLOOP|LASNIPPEL|LASTULE|DRAADFLENS|VOORLASFLENS|VLAKKE FLENS|BLINDFLENS|ALU OVERSCHUIFFLENS|INOX BOORDRING)', text)
    
    # Get images
    images = []
    for img_idx, img_info in enumerate(fitz_page.get_images(full=True)):
        xref = img_info[0]
        base_image = pdf_fitz.extract_image(xref)
        width = base_image.get("width", 0)
        height = base_image.get("height", 0)
        if width < 50 or height < 50:
            continue
        rects = fitz_page.get_image_rects(xref)
        if rects:
            rect = rects[0]
            center_x = (rect.x0 + rect.x1) / 2
            side = 'L' if center_x < page_mid else 'R'
            images.append((side, rect.x0, rect.x1, rect.y0))
    
    # Count SKUs per column
    left_skus = []
    right_skus = []
    
    # Parse text line by line to determine column
    lines = text.split('\n')
    for line in lines:
        sku_matches = re.findall(r'(9(?:ZF|BUL|LAK|LAT|LAE|LAR|LABR|ZFBF|LAN|LAS|LAF|LAFL|ZFVL|ZFGF)[A-Z]*\d+)', line)
        if len(sku_matches) >= 2:
            # Two SKUs on same line = two columns
            left_skus.append(sku_matches[0])
            right_skus.append(sku_matches[1])
        elif len(sku_matches) == 1:
            # Single SKU - need to determine which column
            # Check if it matches patterns from left or right series
            sku = sku_matches[0]
            # For now, add to appropriate list based on previous context
            if right_skus and not left_skus:
                right_skus.append(sku)
            elif left_skus and not right_skus:
                left_skus.append(sku)
            else:
                # Default based on line position in text
                right_skus.append(sku)
    
    all_series = series_matches + other_series
    
    if all_series or images:
        print(f"\nPage {page_num}:")
        print(f"  Series: {all_series[:4]}{'...' if len(all_series) > 4 else ''}")
        print(f"  Images: {len(images)} - {images}")
        print(f"  SKUs: Left={len(left_skus)}, Right={len(right_skus)}, Total={len(left_skus)+len(right_skus)}")

print("\n" + "=" * 80)
