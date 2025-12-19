"""
Generate Professional Product Images for Makita Batteries
==========================================================
Creates high-quality product images for all 19 Makita battery products
with proper branding, category colors, and professional layout.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
PRODUCTS_FILE = PROJECT_ROOT / "public" / "data" / "products.json"
OUTPUT_DIR = PROJECT_ROOT / "public" / "product-images" / "makita"

# Image settings
IMAGE_SIZE = (800, 800)
CATEGORY_COLORS = {
    'Batteries': {
        'bg': '#00B8A9',
        'accent': '#008E7E'
    },
    'Powerpacks': {
        'bg': '#4CAF50',
        'accent': '#388E3C'
    },
    'Chargers': {
        'bg': '#FF9800',
        'accent': '#F57C00'
    },
    'Adapters': {
        'bg': '#9C27B0',
        'accent': '#7B1FA2'
    }
}

MAKITA_TEAL = '#00B8A9'

def load_makita_products():
    """Load Makita products from products.json"""
    print("\n📦 Loading products...")
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    # Filter Makita products
    makita = [p for p in products if p.get('catalog') == 'makita']
    print(f"   Found {len(makita)} Makita products")
    return makita

def create_product_image(product):
    """Create a professional product image"""
    
    sku = product['sku']
    name = product['name']
    category = product.get('category', 'Product')
    
    # Get category colors
    colors = CATEGORY_COLORS.get(category, {'bg': '#00B8A9', 'accent': '#008E7E'})
    
    # Create image with gradient background
    img = Image.new('RGB', IMAGE_SIZE, 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background
    for y in range(IMAGE_SIZE[1]):
        ratio = y / IMAGE_SIZE[1]
        # Interpolate between bg and accent color
        r1, g1, b1 = int(colors['bg'][1:3], 16), int(colors['bg'][3:5], 16), int(colors['bg'][5:7], 16)
        r2, g2, b2 = int(colors['accent'][1:3], 16), int(colors['accent'][3:5], 16), int(colors['accent'][5:7], 16)
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        draw.rectangle([(0, y), (IMAGE_SIZE[0], y + 1)], fill=(r, g, b))
    
    # Add white content area
    margin = 80
    draw.rounded_rectangle(
        [(margin, margin), (IMAGE_SIZE[0] - margin, IMAGE_SIZE[1] - margin)],
        radius=20,
        fill='white'
    )
    
    # Try to load fonts
    try:
        font_large = ImageFont.truetype("arial.ttf", 80)
        font_medium = ImageFont.truetype("arial.ttf", 48)
        font_small = ImageFont.truetype("arial.ttf", 36)
        font_tiny = ImageFont.truetype("arial.ttf", 28)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_tiny = ImageFont.load_default()
    
    # Makita logo text at top
    logo_text = "MAKITA"
    bbox = draw.textbbox((0, 0), logo_text, font=font_medium)
    logo_width = bbox[2] - bbox[0]
    logo_x = (IMAGE_SIZE[0] - logo_width) // 2
    draw.text((logo_x, 120), logo_text, fill=MAKITA_TEAL, font=font_medium)
    
    # Category badge
    cat_bbox = draw.textbbox((0, 0), category, font=font_tiny)
    cat_width = cat_bbox[2] - cat_bbox[0]
    cat_height = cat_bbox[3] - cat_bbox[1]
    badge_x = (IMAGE_SIZE[0] - cat_width) // 2 - 20
    badge_y = 200
    draw.rounded_rectangle(
        [(badge_x, badge_y), (badge_x + cat_width + 40, badge_y + cat_height + 20)],
        radius=20,
        fill=colors['bg']
    )
    draw.text((badge_x + 20, badge_y + 10), category, fill='white', font=font_tiny)
    
    # Product icon (large emoji-style)
    icon_map = {
        'Batteries': '🔋',
        'Powerpacks': '⚡',
        'Chargers': '🔌',
        'Adapters': '🔗'
    }
    icon = icon_map.get(category, '📦')
    try:
        icon_font = ImageFont.truetype("seguiemj.ttf", 180)
    except:
        icon_font = ImageFont.truetype("arial.ttf", 180) if font_large else font_large
    
    bbox = draw.textbbox((0, 0), icon, font=icon_font)
    icon_width = bbox[2] - bbox[0]
    draw.text(((IMAGE_SIZE[0] - icon_width) // 2, 300), icon, font=icon_font, embedded_color=True)
    
    # SKU
    sku_text = f"SKU: {sku}"
    bbox = draw.textbbox((0, 0), sku_text, font=font_small)
    sku_width = bbox[2] - bbox[0]
    draw.text(((IMAGE_SIZE[0] - sku_width) // 2, 520), sku_text, fill='#666666', font=font_small)
    
    # Product name (wrapped if too long)
    name_parts = name.split()
    if len(name_parts) > 3:
        line1 = ' '.join(name_parts[:3])
        line2 = ' '.join(name_parts[3:6])
    else:
        line1 = name
        line2 = ''
    
    bbox1 = draw.textbbox((0, 0), line1, font=font_medium)
    name_width1 = bbox1[2] - bbox1[0]
    draw.text(((IMAGE_SIZE[0] - name_width1) // 2, 580), line1, fill='#333333', font=font_medium)
    
    if line2:
        bbox2 = draw.textbbox((0, 0), line2, font=font_medium)
        name_width2 = bbox2[2] - bbox2[0]
        draw.text(((IMAGE_SIZE[0] - name_width2) // 2, 640), line2, fill='#333333', font=font_medium)
    
    # XGT badge at bottom
    xgt_text = "XGT 40V MAX"
    bbox = draw.textbbox((0, 0), xgt_text, font=font_tiny)
    xgt_width = bbox[2] - bbox[0]
    xgt_height = bbox[3] - bbox[1]
    xgt_x = (IMAGE_SIZE[0] - xgt_width) // 2 - 15
    xgt_y = IMAGE_SIZE[1] - 100
    draw.rounded_rectangle(
        [(xgt_x, xgt_y), (xgt_x + xgt_width + 30, xgt_y + xgt_height + 15)],
        radius=8,
        fill='#FFD700'
    )
    draw.text((xgt_x + 15, xgt_y + 7), xgt_text, fill='#333333', font=font_tiny)
    
    return img

def update_products_with_images(products):
    """Update products.json with image paths"""
    print("\n📝 Updating products.json with image paths...")
    
    updated = 0
    for product in products:
        if product.get('catalog') == 'makita':
            sku = product['sku']
            image_path = f"/product-images/makita/{sku}.jpg"
            
            # Update media array
            product['media'] = [{
                "url": image_path,
                "role": "main",
                "type": "image",
                "format": "jpg"
            }]
            
            # Update imageUrl for compatibility
            product['imageUrl'] = image_path
            
            updated += 1
            print(f"   ✓ {sku}")
    
    # Save updated products
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2)
    
    print(f"   Updated {updated} products")

def main():
    print("=" * 80)
    print("GENERATING MAKITA PRODUCT IMAGES")
    print("=" * 80)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\n📁 Output: {OUTPUT_DIR}")
    
    # Load Makita products
    makita_products = load_makita_products()
    
    # Load all products for updating
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        all_products = json.load(f)
    
    print(f"\n🎨 Generating images...")
    print()
    
    created = 0
    for product in makita_products:
        sku = product['sku']
        name = product['name']
        category = product.get('category', 'Product')
        
        print(f"📸 {sku}: {name[:50]}...")
        
        # Create image
        img = create_product_image(product)
        
        # Save as JPG
        output_file = OUTPUT_DIR / f"{sku}.jpg"
        img.save(output_file, 'JPEG', quality=92, optimize=True)
        
        size_kb = output_file.stat().st_size / 1024
        print(f"   ✅ Created: {output_file.name} ({size_kb:.1f} KB)")
        print()
        
        created += 1
    
    # Update products.json
    update_products_with_images(all_products)
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"   ✅ Images created: {created}/19")
    print(f"   📁 Location: {OUTPUT_DIR}")
    print(f"   📝 products.json updated")
    print(f"\n💡 Images are now available on:")
    print(f"   - /makita page")
    print(f"   - /products page (when viewing Makita)")
    print(f"   - Individual product detail pages")
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
