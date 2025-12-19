"""
Convert Documentation to E-Reader PDFs
======================================
Converts markdown documentation to well-formatted PDFs for e-readers

Usage:
    python scripts/generate_ereader_pdfs.py

Requirements:
    pip install markdown weasyprint pygments
"""

import os
from pathlib import Path
import markdown
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

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

# E-Reader optimized CSS
EREADER_CSS = """
@page {
    size: A4;
    margin: 2cm 1.5cm;
    @top-center {
        content: "Makita Battery Products Guide";
        font-size: 10pt;
        color: #666;
    }
    @bottom-center {
        content: counter(page);
        font-size: 10pt;
        color: #666;
    }
}

body {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
    max-width: 100%;
}

h1 {
    font-size: 24pt;
    font-weight: bold;
    color: #1a1a1a;
    margin-top: 30pt;
    margin-bottom: 15pt;
    border-bottom: 3pt solid #667eea;
    padding-bottom: 10pt;
    page-break-after: avoid;
}

h2 {
    font-size: 18pt;
    font-weight: bold;
    color: #2d3748;
    margin-top: 20pt;
    margin-bottom: 10pt;
    page-break-after: avoid;
}

h3 {
    font-size: 14pt;
    font-weight: bold;
    color: #4a5568;
    margin-top: 15pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
}

h4 {
    font-size: 12pt;
    font-weight: bold;
    color: #718096;
    margin-top: 12pt;
    margin-bottom: 6pt;
}

p {
    margin-bottom: 10pt;
    text-align: justify;
    orphans: 3;
    widows: 3;
}

code {
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    background-color: #f7fafc;
    padding: 2pt 4pt;
    border-radius: 3pt;
    border: 1pt solid #e2e8f0;
}

pre {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background-color: #f7fafc;
    padding: 10pt;
    border-left: 4pt solid #667eea;
    border-radius: 4pt;
    overflow-x: auto;
    margin: 10pt 0;
    page-break-inside: avoid;
}

pre code {
    background: none;
    border: none;
    padding: 0;
}

ul, ol {
    margin-left: 20pt;
    margin-bottom: 10pt;
}

li {
    margin-bottom: 5pt;
}

blockquote {
    border-left: 4pt solid #cbd5e0;
    padding-left: 15pt;
    margin-left: 0;
    color: #4a5568;
    font-style: italic;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 15pt 0;
    page-break-inside: avoid;
    font-size: 10pt;
}

th {
    background-color: #667eea;
    color: white;
    padding: 8pt;
    text-align: left;
    font-weight: bold;
}

td {
    padding: 8pt;
    border-bottom: 1pt solid #e2e8f0;
}

tr:nth-child(even) {
    background-color: #f7fafc;
}

a {
    color: #667eea;
    text-decoration: none;
}

strong {
    font-weight: bold;
    color: #1a1a1a;
}

em {
    font-style: italic;
}

hr {
    border: none;
    border-top: 2pt solid #e2e8f0;
    margin: 20pt 0;
}

/* Emoji handling */
.emoji {
    font-family: 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif;
}

/* Checkbox styling */
input[type="checkbox"] {
    margin-right: 5pt;
}

/* Code block syntax highlighting */
.highlight {
    background: #f7fafc;
}

/* Box elements */
.box {
    border: 2pt solid #cbd5e0;
    padding: 15pt;
    margin: 15pt 0;
    border-radius: 5pt;
    background-color: #f7fafc;
    page-break-inside: avoid;
}

/* Success/Info/Warning boxes */
.success {
    border-color: #48bb78;
    background-color: #f0fff4;
}

.info {
    border-color: #4299e1;
    background-color: #ebf8ff;
}

.warning {
    border-color: #ed8936;
    background-color: #fffaf0;
}

/* Title page */
.title-page {
    text-align: center;
    margin-top: 100pt;
}

.title-page h1 {
    font-size: 32pt;
    border: none;
}

.title-page .subtitle {
    font-size: 16pt;
    color: #718096;
    margin-top: 20pt;
}

.title-page .date {
    font-size: 12pt;
    color: #a0aec0;
    margin-top: 10pt;
}
"""

def convert_markdown_to_html(md_content, title):
    """Convert markdown to HTML with extensions"""
    md = markdown.Markdown(extensions=[
        'extra',
        'codehilite',
        'tables',
        'toc',
        'nl2br',
        'sane_lists'
    ])
    
    html_content = md.convert(md_content)
    
    # Wrap in HTML document
    html_doc = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
    </head>
    <body>
        <div class="title-page">
            <h1>{title}</h1>
            <p class="subtitle">Makita Battery Products - Implementation Guide</p>
            <p class="date">Generated: November 30, 2025</p>
        </div>
        <div style="page-break-after: always;"></div>
        {html_content}
    </body>
    </html>
    """
    
    return html_doc

def generate_pdf(md_file, pdf_file):
    """Generate PDF from markdown file"""
    print(f"\n📄 Processing: {md_file.name}")
    
    # Read markdown file
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"   ⚠️  File not found: {md_file}")
        return False
    
    # Get title from filename
    title = md_file.stem.replace('_', ' ').title()
    
    # Convert to HTML
    html_content = convert_markdown_to_html(md_content, title)
    
    # Create PDF
    try:
        font_config = FontConfiguration()
        
        html = HTML(string=html_content)
        css = CSS(string=EREADER_CSS, font_config=font_config)
        
        html.write_pdf(
            pdf_file,
            stylesheets=[css],
            font_config=font_config
        )
        
        # Get file size
        size_kb = pdf_file.stat().st_size / 1024
        print(f"   ✅ Created: {pdf_file.name} ({size_kb:.1f} KB)")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def create_combined_pdf():
    """Create a single combined PDF with all guides"""
    print("\n📚 Creating combined PDF...")
    
    combined_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Makita Battery Products - Complete Guide</title>
    </head>
    <body>
        <div class="title-page">
            <h1>Makita Battery Products</h1>
            <p class="subtitle">Complete Implementation Guide</p>
            <p class="date">November 30, 2025</p>
            <div style="margin-top: 40pt;">
                <p>All documentation in one file</p>
                <p>8 guides • ~100 pages</p>
            </div>
        </div>
        <div style="page-break-after: always;"></div>
    """
    
    # Add table of contents
    combined_html += """
    <h1>Table of Contents</h1>
    <ol style="font-size: 12pt; line-height: 2;">
    """
    
    for idx, (md_file, _) in enumerate(DOCS_TO_CONVERT, 1):
        title = md_file.replace('.md', '').replace('_', ' ').title()
        combined_html += f"<li>{title}</li>\n"
    
    combined_html += "</ol>\n<div style='page-break-after: always;'></div>\n"
    
    # Add each document
    for idx, (md_file, _) in enumerate(DOCS_TO_CONVERT, 1):
        md_path = PROJECT_ROOT / md_file
        
        if not md_path.exists():
            print(f"   ⚠️  Skipping {md_file} (not found)")
            continue
        
        with open(md_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        title = md_file.replace('.md', '').replace('_', ' ').title()
        
        # Add section
        combined_html += f"""
        <div style="page-break-before: always;"></div>
        <div class="box info">
            <h1>Part {idx}: {title}</h1>
        </div>
        """
        
        md = markdown.Markdown(extensions=['extra', 'codehilite', 'tables', 'toc', 'nl2br', 'sane_lists'])
        combined_html += md.convert(md_content)
        
        print(f"   ✅ Added: {md_file}")
    
    combined_html += "</body></html>"
    
    # Generate PDF
    try:
        font_config = FontConfiguration()
        html = HTML(string=combined_html)
        css = CSS(string=EREADER_CSS, font_config=font_config)
        
        output_file = OUTPUT_DIR / "00_COMPLETE_GUIDE.pdf"
        html.write_pdf(output_file, stylesheets=[css], font_config=font_config)
        
        size_kb = output_file.stat().st_size / 1024
        print(f"\n   ✅ Combined PDF: {output_file.name} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"   ❌ Error creating combined PDF: {e}")
        return False

def main():
    """Main execution"""
    print("=" * 80)
    print("GENERATING E-READER PDFs")
    print("=" * 80)
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"\n📁 Output directory: {OUTPUT_DIR}")
    
    # Track success
    successful = 0
    failed = 0
    
    # Generate individual PDFs
    print("\n" + "─" * 80)
    print("INDIVIDUAL PDFs")
    print("─" * 80)
    
    for md_file, pdf_file in DOCS_TO_CONVERT:
        md_path = PROJECT_ROOT / md_file
        pdf_path = OUTPUT_DIR / pdf_file
        
        if generate_pdf(md_path, pdf_path):
            successful += 1
        else:
            failed += 1
    
    # Generate combined PDF
    print("\n" + "─" * 80)
    print("COMBINED PDF")
    print("─" * 80)
    
    if create_combined_pdf():
        successful += 1
    else:
        failed += 1
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"   ✅ Successful: {successful}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📁 Output folder: {OUTPUT_DIR}")
    print(f"\n💡 Transfer PDFs to your e-reader:")
    print(f"   1. Connect e-reader to computer")
    print(f"   2. Copy files from: {OUTPUT_DIR}")
    print(f"   3. Paste to e-reader's Documents folder")
    print(f"\n📖 Reading order:")
    print(f"   → Start with: 00_COMPLETE_GUIDE.pdf (all in one)")
    print(f"   → Or read individually: 01-08 in order")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
