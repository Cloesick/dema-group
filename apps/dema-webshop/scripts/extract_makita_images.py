#!/usr/bin/env python3
"""
Extract high-quality images from Makita PDF catalogs.

This script renders PDF pages at high DPI to get better quality images
than extracting embedded images which are often compressed.

Usage:
    python scripts/extract_makita_images.py
"""

import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

try:
    import fitz  # PyMuPDF
    from PIL import Image
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("Install with: pip install PyMuPDF Pillow")
    sys.exit(1)

# Paths
PDF_DIR = PROJECT_ROOT / "public" / "documents" / "Product_pdfs"
OUTPUT_DIR = PROJECT_ROOT / "public" / "images"

# Makita PDFs to process
MAKITA_PDFS = [
    "makita-catalogus-2022-nl.pdf",
    "makita-tuinfolder-2022-nl.pdf",
]

# Settings
DPI = 150  # Good balance of quality and file size
QUALITY = 85  # WebP quality


def render_pdf_pages(pdf_path: Path, output_dir: Path, dpi: int = 150, quality: int = 85):
    """Render all pages of a PDF as high-quality images."""
    
    pdf_stem = pdf_path.stem
    page_output_dir = output_dir / pdf_stem
    page_output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nProcessing: {pdf_path.name}")
    
    try:
        doc = fitz.open(str(pdf_path))
        total_pages = len(doc)
        print(f"  Total pages: {total_pages}")
        
        for page_num in range(total_pages):
            page = doc[page_num]
            page_number = page_num + 1  # 1-indexed
            
            # Output filename
            img_filename = f"{pdf_stem}__p{page_number}__rendered.webp"
            img_path = page_output_dir / img_filename
            
            # Skip if already exists
            if img_path.exists():
                continue
            
            # Render at high DPI
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            
            # Convert to PIL Image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Save as WebP
            img.save(img_path, "WEBP", quality=quality)
            
            if page_number % 10 == 0:
                print(f"  Rendered page {page_number}/{total_pages}")
        
        doc.close()
        print(f"  Done! Images saved to: {page_output_dir}")
        
    except Exception as e:
        print(f"  Error: {e}")


def main():
    print("=" * 60)
    print("Makita PDF Image Extraction")
    print("=" * 60)
    print(f"DPI: {DPI}")
    print(f"Quality: {QUALITY}")
    print(f"Output: {OUTPUT_DIR}")
    
    for pdf_name in MAKITA_PDFS:
        pdf_path = PDF_DIR / pdf_name
        if pdf_path.exists():
            render_pdf_pages(pdf_path, OUTPUT_DIR, DPI, QUALITY)
        else:
            print(f"\nWarning: PDF not found: {pdf_path}")
    
    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
