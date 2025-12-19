"""
Simple PDF Generator for E-Reader
==================================
Alternative method using markdown2 and pdfkit (wkhtmltopdf)

Usage:
    python scripts/generate_pdfs_simple.py

Requirements:
    pip install markdown2 pdfkit
    
    Download wkhtmltopdf from: https://wkhtmltopdf.org/downloads.html
    Or use: choco install wkhtmltopdf (Windows)
"""

import os
from pathlib import Path
try:
    import markdown2
    import pdfkit
    LIBS_AVAILABLE = True
except ImportError:
    LIBS_AVAILABLE = False

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "docs-pdf"

# Files to convert (in reading order)
DOCS_TO_CONVERT = [
    ("START_HERE.md", "01_START_HERE.pdf"),
    ("WELCOME_BACK.md", "02_WELCOME_BACK.pdf"),
    ("BATTERY_PRODUCTS_ROADMAP.md", "03_BATTERY_PRODUCTS_ROADMAP.pdf"),
    ("IMPLEMENTATION_CHECKLIST.md", "04_IMPLEMENTATION_CHECKLIST.pdf"),
    ("PREPARATION_SUMMARY.md", "05_PREPARATION_SUMMARY.pdf"),
    ("PHASE_2_IMAGES_GUIDE.md", "06_PHASE_2_IMAGES_GUIDE.pdf"),
    ("PHASE_3_CART_GUIDE.md", "07_PHASE_3_CART_GUIDE.pdf"),
    ("DYNAMIC_LOADING_SUMMARY.md", "08_DYNAMIC_LOADING_SUMMARY.pdf"),
]

# HTML template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        body {{
            font-family: Georgia, serif;
            font-size: 11pt;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            color: #333;
        }}
        h1 {{
            font-size: 24pt;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-top: 30px;
        }}
        h2 {{
            font-size: 18pt;
            margin-top: 25px;
            color: #2d3748;
        }}
        h3 {{
            font-size: 14pt;
            margin-top: 20px;
            color: #4a5568;
        }}
        code {{
            background: #f7fafc;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
        }}
        pre {{
            background: #f7fafc;
            padding: 15px;
            border-left: 4px solid #667eea;
            overflow-x: auto;
            font-size: 9pt;
        }}
        pre code {{
            background: none;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }}
        th {{
            background: #667eea;
            color: white;
            padding: 10px;
            text-align: left;
        }}
        td {{
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }}
        tr:nth-child(even) {{
            background: #f7fafc;
        }}
        ul, ol {{
            margin-left: 20px;
        }}
        li {{
            margin-bottom: 5px;
        }}
        blockquote {{
            border-left: 4px solid #cbd5e0;
            padding-left: 15px;
            color: #4a5568;
            font-style: italic;
        }}
        .title-page {{
            text-align: center;
            margin: 100px 0;
        }}
        .title-page h1 {{
            font-size: 32pt;
            border: none;
        }}
        .subtitle {{
            font-size: 14pt;
            color: #718096;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="title-page">
        <h1>{title}</h1>
        <p class="subtitle">Makita Battery Products Guide</p>
        <p>November 30, 2025</p>
    </div>
    <hr style="page-break-after: always;">
    {content}
</body>
</html>
"""

def convert_to_pdf_pdfkit(md_file, pdf_file):
    """Convert using pdfkit"""
    print(f"\n📄 Processing: {md_file.name}")
    
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"   ⚠️  File not found")
        return False
    
    # Convert markdown to HTML
    html_content = markdown2.markdown(md_content, extras=['tables', 'fenced-code-blocks', 'header-ids'])
    
    title = md_file.stem.replace('_', ' ').title()
    full_html = HTML_TEMPLATE.format(title=title, content=html_content)
    
    # PDF options for e-reader
    options = {
        'page-size': 'A4',
        'margin-top': '20mm',
        'margin-right': '15mm',
        'margin-bottom': '20mm',
        'margin-left': '15mm',
        'encoding': 'UTF-8',
        'enable-local-file-access': None,
        'print-media-type': None,
    }
    
    try:
        pdfkit.from_string(full_html, str(pdf_file), options=options)
        size_kb = pdf_file.stat().st_size / 1024
        print(f"   ✅ Created: {pdf_file.name} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def create_install_instructions():
    """Create instructions for installing dependencies"""
    instructions = """
# 📦 Installation Instructions

## Option 1: Using pip + wkhtmltopdf

1. Install Python packages:
   ```
   pip install markdown2 pdfkit
   ```

2. Install wkhtmltopdf:
   
   **Windows:**
   ```
   choco install wkhtmltopdf
   ```
   Or download from: https://wkhtmltopdf.org/downloads.html

   **Mac:**
   ```
   brew install wkhtmltopdf
   ```

   **Linux:**
   ```
   sudo apt-get install wkhtmltopdf
   ```

3. Run the script:
   ```
   python scripts/generate_pdfs_simple.py
   ```

## Option 2: Using pandoc (easier)

1. Install pandoc: https://pandoc.org/installing.html
   
   **Windows:**
   ```
   choco install pandoc
   ```

2. Run conversion manually:
   ```
   pandoc START_HERE.md -o START_HERE.pdf
   pandoc WELCOME_BACK.md -o WELCOME_BACK.pdf
   # ... repeat for each file
   ```

## Option 3: Online Converter (no installation)

1. Visit: https://www.markdowntopdf.com/
2. Upload each .md file
3. Download the PDF
4. Transfer to e-reader

## Option 4: Use Your Browser

1. Open each .md file in VS Code
2. Right-click → "Open Preview"
3. Print to PDF (Ctrl+P → Save as PDF)
4. Transfer to e-reader

Files to convert:
- START_HERE.md
- WELCOME_BACK.md
- BATTERY_PRODUCTS_ROADMAP.md
- IMPLEMENTATION_CHECKLIST.md
- PREPARATION_SUMMARY.md
- PHASE_2_IMAGES_GUIDE.md
- PHASE_3_CART_GUIDE.md
- DYNAMIC_LOADING_SUMMARY.md
"""
    
    output_file = PROJECT_ROOT / "PDF_CONVERSION_INSTRUCTIONS.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(instructions)
    
    print(f"\n✅ Created: {output_file.name}")
    return output_file

def main():
    """Main execution"""
    print("=" * 80)
    print("E-READER PDF GENERATOR")
    print("=" * 80)
    
    if not LIBS_AVAILABLE:
        print("\n⚠️  Required libraries not installed!")
        print("\nInstalling dependencies...")
        print("Run: pip install markdown2 pdfkit")
        print("\nThen install wkhtmltopdf:")
        print("  Windows: choco install wkhtmltopdf")
        print("  Mac: brew install wkhtmltopdf")
        print("  Linux: sudo apt-get install wkhtmltopdf")
        
        # Create instructions
        instructions_file = create_install_instructions()
        print(f"\n📄 See detailed instructions: {instructions_file.name}")
        return
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"\n📁 Output: {OUTPUT_DIR}")
    
    successful = 0
    failed = 0
    
    for md_file, pdf_file in DOCS_TO_CONVERT:
        md_path = PROJECT_ROOT / md_file
        pdf_path = OUTPUT_DIR / pdf_file
        
        if convert_to_pdf_pdfkit(md_path, pdf_path):
            successful += 1
        else:
            failed += 1
    
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"   ✅ Successful: {successful}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📁 Output: {OUTPUT_DIR}")
    print("\n💡 Transfer to e-reader:")
    print("   1. Connect e-reader")
    print("   2. Copy PDFs from docs-pdf folder")
    print("   3. Paste to e-reader's Documents")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        create_install_instructions()
