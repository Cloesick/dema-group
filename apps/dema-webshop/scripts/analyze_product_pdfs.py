import argparse
import io
import json
import re
import shutil
from dataclasses import dataclass, asdict
from hashlib import md5
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import pdfplumber

try:
    import fitz  # PyMuPDF for image extraction
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


# ============================================================================
# PROJECT PATHS
# ============================================================================
PROJECT_ROOT = Path(__file__).parent.parent  # scripts/ -> project root
PDF_DIR = PROJECT_ROOT / "documents" / "Product_pdfs"
JSON_DIR = PROJECT_ROOT / "documents" / "Product_pdfs" / "json"
IMAGE_DIR = PROJECT_ROOT / "documents" / "Product_pdfs" / "images"


# ------------------------
# Generic helpers
# ------------------------

HeaderRow = List[Optional[str]]
DataRow = List[Optional[str]]


@dataclass
class RowContext:
    source_pdf: str
    page_number: int
    category: Optional[str]


# ------------------------
# Enrichment helpers (inlined from previous enrich_product_json)
# ------------------------


@dataclass
class EnrichedContext:
    series_raw: Optional[str]
    series: Optional[str]
    catalog_group: Optional[str]
    product_type: Optional[str]
    material: Optional[str]
    family_id: Optional[str]
    sku_series: Optional[str]


def slugify(text: Optional[str]) -> Optional[str]:
    if text is None:
        return None
    t = text.strip().lower()
    t = re.sub(r"/", " ", t)
    t = re.sub(r"[^a-z0-9]+", "-", t)
    t = re.sub(r"-+", "-", t).strip("-")
    return t or None


# ============================================================================
# PROPERTY DISPLAY CONFIG - Icons and colors for product properties
# ============================================================================

# Property display configuration: icon (Lucide icon name), color (Tailwind bg class)
# Icons represent the PROPERTY TYPE, not the value
# This config is exported to JSON for frontend consumption
PROPERTY_DISPLAY_CONFIG = {
    # === POWER & ENERGY ===
    "horsepower": {
        "icon": "Horse",           # 🐴 Horse for HP
        "color": "bg-amber-100",
        "text_color": "text-amber-800",
        "label": "PK",
    },
    "pk": {
        "icon": "Horse",           # 🐴 Horse for PK (paardenkracht)
        "color": "bg-amber-100",
        "text_color": "text-amber-800",
        "label": "PK",
    },
    "power_kw": {
        "icon": "Gauge",           # Gauge meter for kW
        "color": "bg-yellow-100",
        "text_color": "text-yellow-700",
        "label": "Vermogen (kW)",
    },
    "vermogen": {
        "icon": "Gauge",           # Gauge meter for power
        "color": "bg-yellow-100",
        "text_color": "text-yellow-700",
        "label": "Vermogen",
    },
    "voltage": {
        "icon": "Zap",             # ⚡ Lightning bolt for voltage
        "color": "bg-orange-100",
        "text_color": "text-orange-700",
        "label": "Spanning",
    },
    "spanning": {
        "icon": "Zap",             # ⚡ Lightning bolt
        "color": "bg-orange-100",
        "text_color": "text-orange-700",
        "label": "Spanning",
    },
    "stroom": {
        "icon": "Activity",        # Current/amperage wave
        "color": "bg-rose-100",
        "text_color": "text-rose-700",
        "label": "Stroom (A)",
    },
    
    # === PRESSURE & FLOW ===
    "pressure": {
        "icon": "Gauge",           # Pressure gauge
        "color": "bg-red-100",
        "text_color": "text-red-700",
        "label": "Druk",
    },
    "werkdruk": {
        "icon": "Gauge",           # Pressure gauge
        "color": "bg-red-100",
        "text_color": "text-red-700",
        "label": "Werkdruk",
    },
    "flow_rate": {
        "icon": "Waves",           # 🌊 Water waves for flow
        "color": "bg-blue-100",
        "text_color": "text-blue-700",
        "label": "Debiet",
    },
    "debiet": {
        "icon": "Waves",           # 🌊 Water waves
        "color": "bg-blue-100",
        "text_color": "text-blue-700",
        "label": "Debiet",
    },
    "opvoerhoogte": {
        "icon": "ArrowUpFromLine", # Lift height arrow up
        "color": "bg-sky-100",
        "text_color": "text-sky-700",
        "label": "Opvoerhoogte",
    },
    
    # === DIMENSIONS ===
    "size": {
        "icon": "Ruler",           # 📏 Ruler for size
        "color": "bg-teal-100",
        "text_color": "text-teal-700",
        "label": "Maat",
    },
    "maat": {
        "icon": "Ruler",           # 📏 Ruler
        "color": "bg-teal-100",
        "text_color": "text-teal-700",
        "label": "Maat",
    },
    "diameter": {
        "icon": "CircleDashed",    # ⭕ Circle for diameter
        "color": "bg-teal-100",
        "text_color": "text-teal-700",
        "label": "Diameter",
    },
    "length": {
        "icon": "MoveHorizontal",  # ↔️ Horizontal arrow for length
        "color": "bg-green-100",
        "text_color": "text-green-700",
        "label": "Lengte",
    },
    "lengte": {
        "icon": "MoveHorizontal",  # ↔️ Horizontal arrow
        "color": "bg-green-100",
        "text_color": "text-green-700",
        "label": "Lengte",
    },
    "wanddikte": {
        "icon": "Layers",          # Wall thickness layers
        "color": "bg-stone-100",
        "text_color": "text-stone-700",
        "label": "Wanddikte",
    },
    "weight": {
        "icon": "Weight",          # ⚖️ Weight scale
        "color": "bg-slate-100",
        "text_color": "text-slate-700",
        "label": "Gewicht",
    },
    "gewicht": {
        "icon": "Weight",          # ⚖️ Weight scale
        "color": "bg-slate-100",
        "text_color": "text-slate-700",
        "label": "Gewicht",
    },
    
    # === ANGLES ===
    "angle": {
        "icon": "CornerDownRight", # 📐 Angle corner
        "color": "bg-pink-100",
        "text_color": "text-pink-700",
        "label": "Hoek",
    },
    
    # === TEMPERATURE ===
    "temperature": {
        "icon": "Thermometer",     # 🌡️ Thermometer
        "color": "bg-red-100",
        "text_color": "text-red-700",
        "label": "Temperatuur",
    },
    "temp_range": {
        "icon": "Thermometer",     # 🌡️ Thermometer
        "color": "bg-red-100",
        "text_color": "text-red-700",
        "label": "Temp. bereik",
    },
    
    # === MATERIALS ===
    "material": {
        "icon": "Layers",          # Stacked layers for material
        "color": "bg-slate-100",
        "text_color": "text-slate-700",
        "label": "Materiaal",
    },
    "messing": {
        "icon": "Coins",           # 🪙 Gold coins for brass
        "color": "bg-amber-100",
        "text_color": "text-amber-800",
        "label": "Messing",
    },
    "rvs": {
        "icon": "Shield",          # 🛡️ Shield for stainless steel
        "color": "bg-zinc-200",
        "text_color": "text-zinc-800",
        "label": "RVS/Inox",
    },
    "pvc": {
        "icon": "Cylinder",        # Pipe/cylinder for PVC
        "color": "bg-gray-100",
        "text_color": "text-gray-700",
        "label": "PVC",
    },
    "pp": {
        "icon": "Cylinder",        # Pipe/cylinder
        "color": "bg-blue-100",
        "text_color": "text-blue-700",
        "label": "PP",
    },
    "pe": {
        "icon": "Cylinder",        # Pipe/cylinder
        "color": "bg-sky-100",
        "text_color": "text-sky-700",
        "label": "PE",
    },
    "verzinkt": {
        "icon": "ShieldCheck",     # Protected/coated shield
        "color": "bg-stone-200",
        "text_color": "text-stone-700",
        "label": "Verzinkt",
    },
    "aluminium": {
        "icon": "Hexagon",         # Hexagon for aluminum
        "color": "bg-neutral-200",
        "text_color": "text-neutral-700",
        "label": "Aluminium",
    },
    
    # === SEAL MATERIALS ===
    "seal_material": {
        "icon": "CircleDot",       # O-ring seal
        "color": "bg-emerald-100",
        "text_color": "text-emerald-700",
        "label": "Afdichting",
    },
    "epdm": {
        "icon": "CircleDot",       # O-ring
        "color": "bg-emerald-100",
        "text_color": "text-emerald-700",
        "label": "EPDM",
    },
    "viton": {
        "icon": "CircleDot",       # O-ring
        "color": "bg-orange-100",
        "text_color": "text-orange-700",
        "label": "VITON",
    },
    "nbr": {
        "icon": "CircleDot",       # O-ring
        "color": "bg-yellow-100",
        "text_color": "text-yellow-700",
        "label": "NBR",
    },
    
    # === CONNECTION TYPES ===
    "connection_type": {
        "icon": "Link2",           # 🔗 Link for connection
        "color": "bg-indigo-100",
        "text_color": "text-indigo-700",
        "label": "Aansluiting",
    },
    "aansluiting": {
        "icon": "Link2",           # 🔗 Link
        "color": "bg-indigo-100",
        "text_color": "text-indigo-700",
        "label": "Aansluiting",
    },
    "buitendraad": {
        "icon": "CircleArrowUp",   # ⬆️ Male thread (outward)
        "color": "bg-indigo-100",
        "text_color": "text-indigo-700",
        "label": "Buitendraad",
    },
    "binnendraad": {
        "icon": "CircleArrowDown", # ⬇️ Female thread (inward)
        "color": "bg-violet-100",
        "text_color": "text-violet-700",
        "label": "Binnendraad",
    },
    "lijmmof": {
        "icon": "Droplets",        # 💧 Glue drops
        "color": "bg-cyan-100",
        "text_color": "text-cyan-700",
        "label": "Lijmmof",
    },
    "flens": {
        "icon": "CircleDot",       # Flange circle
        "color": "bg-purple-100",
        "text_color": "text-purple-700",
        "label": "Flens",
    },
    
    # === PRODUCT INFO ===
    "brand": {
        "icon": "Award",           # 🏆 Brand/award
        "color": "bg-amber-50",
        "text_color": "text-amber-700",
        "label": "Merk",
    },
    "type": {
        "icon": "Tag",             # 🏷️ Type tag
        "color": "bg-gray-100",
        "text_color": "text-gray-700",
        "label": "Type",
    },
    "model": {
        "icon": "Box",             # 📦 Model box
        "color": "bg-gray-100",
        "text_color": "text-gray-700",
        "label": "Model",
    },
    
    # === DEFAULT ===
    "default": {
        "icon": "Info",            # ℹ️ Info circle
        "color": "bg-gray-100",
        "text_color": "text-gray-600",
        "label": "Eigenschap",
    },
}


def get_property_display(prop_name: str) -> Dict[str, str]:
    """Get display config for a property name."""
    prop_lower = prop_name.lower().replace("_", "").replace("-", "")
    
    # Direct match
    if prop_name in PROPERTY_DISPLAY_CONFIG:
        return PROPERTY_DISPLAY_CONFIG[prop_name]
    
    # Partial match
    for key, config in PROPERTY_DISPLAY_CONFIG.items():
        if key in prop_lower or prop_lower in key:
            return config
    
    return PROPERTY_DISPLAY_CONFIG["default"]


# NOTE: Property display config is now maintained in src/config/propertyIcons.ts
# The Python PROPERTY_DISPLAY_CONFIG above is kept for reference but the TypeScript
# version is the source of truth for the frontend.


# ============================================================================
# IMAGE EXTRACTION - Extract and share images from PDF pages
# ============================================================================

def render_page_as_image(
    pdf_path: Path,
    page_num: int,
    output_dir: Optional[Path] = None,
    dpi: int = 200,
    quality: int = 90,
) -> Optional[str]:
    """Render a PDF page as a high-quality image.
    
    This renders the entire page at high DPI for better quality than
    extracting embedded images which are often compressed.
    
    Args:
        pdf_path: Path to the PDF file
        page_num: 1-indexed page number
        output_dir: Output directory for images
        dpi: Resolution for rendering (default 200 for good quality)
        quality: WebP quality (0-100)
    
    Returns:
        Relative image path or None if failed
    """
    if not HAS_FITZ or not HAS_PIL:
        return None
    
    pdf_stem = pdf_path.stem
    if output_dir is None:
        output_dir = IMAGE_DIR / pdf_stem
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    img_filename = f"{pdf_stem}__p{page_num}__rendered.webp"
    img_path = output_dir / img_filename
    
    # Skip if already exists
    if img_path.exists():
        return f"images/{pdf_stem}/{img_filename}"
    
    try:
        doc = fitz.open(str(pdf_path))
        page = doc[page_num - 1]  # 0-indexed
        
        # Render at high DPI
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert to PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Save as WebP
        img.save(img_path, "WEBP", quality=quality)
        
        doc.close()
        
        return f"images/{pdf_stem}/{img_filename}"
        
    except Exception as e:
        print(f"    Warning: Failed to render page {page_num}: {e}")
        return None


def is_good_product_image(width: int, height: int, size_bytes: int, aspect_ratio: float = None) -> bool:
    """Determine if an image is likely a good product image vs icon/banner/decoration.
    
    Good product images typically:
    - Have both dimensions > 200px (not tiny icons)
    - Are roughly square-ish (aspect ratio 0.3-3.0, not banners)
    - Are > 15KB (not simple icons/decorations)
    - Are < 200KB (not full-page backgrounds)
    
    Args:
        width: Image width in pixels
        height: Image height in pixels  
        size_bytes: Image file size in bytes
        aspect_ratio: Optional pre-calculated aspect ratio
    
    Returns:
        True if image appears to be a good product image
    """
    # Calculate aspect ratio if not provided
    if aspect_ratio is None and height > 0:
        aspect_ratio = width / height
    
    # Filter criteria for good product images
    min_dimension = 150  # Both dimensions must be at least this
    min_size_kb = 15     # Must be at least 15KB (filter tiny icons)
    max_size_kb = 200    # Must be under 200KB (filter full-page images)
    min_aspect = 0.3     # Not too tall/narrow
    max_aspect = 3.0     # Not too wide (banners)
    
    # Check all criteria
    if width < min_dimension or height < min_dimension:
        return False
    if size_bytes < min_size_kb * 1024:
        return False
    if size_bytes > max_size_kb * 1024:
        return False
    if aspect_ratio and (aspect_ratio < min_aspect or aspect_ratio > max_aspect):
        return False
    
    return True


def extract_images_from_page(
    pdf_path: Path,
    page_num: int,
    series_slug: str,
    output_dir: Optional[Path] = None,
) -> List[str]:
    """Extract images from a PDF page and save as WebP.
    
    Args:
        pdf_path: Path to the PDF file
        page_num: 1-indexed page number
        series_slug: Slugified series name for filename
        output_dir: Output directory for images (default: IMAGE_DIR / pdf_stem)
    
    Returns:
        List of relative image paths (e.g., "images/messing-draadfittingen/...")
    """
    if not HAS_FITZ or not HAS_PIL:
        return []
    
    pdf_stem = pdf_path.stem
    if output_dir is None:
        output_dir = IMAGE_DIR / pdf_stem
    
    output_dir.mkdir(parents=True, exist_ok=True)
    images = []
    
    try:
        doc = fitz.open(str(pdf_path))
        page = doc[page_num - 1]  # 0-indexed
        
        for img_idx, img_info in enumerate(page.get_images(full=True)):
            try:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                
                # Check image size (skip tiny images like icons)
                width = base_image.get("width", 0)
                height = base_image.get("height", 0)
                
                if width < 50 or height < 50:
                    continue
                
                # Generate filename
                if img_idx == 0:
                    img_filename = f"{pdf_stem}__p{page_num}__{series_slug}.webp"
                else:
                    img_filename = f"{pdf_stem}__p{page_num}__{series_slug}__v{img_idx + 1}.webp"
                
                img_path = output_dir / img_filename
                
                # Save image (if not exists)
                if not img_path.exists():
                    pil_img = Image.open(io.BytesIO(image_bytes))
                    
                    # Preserve transparency for RGBA/LA/P modes
                    if pil_img.mode in ("RGBA", "LA", "P"):
                        pass  # Keep as-is
                    elif pil_img.mode != "RGB":
                        pil_img = pil_img.convert("RGB")
                    
                    pil_img.save(img_path, "WEBP", quality=90)
                
                rel_path = f"images/{pdf_stem}/{img_filename}"
                images.append(rel_path)
                
            except Exception as e:
                print(f"    Warning: Failed to extract image {img_idx} from page {page_num}: {e}")
        
        doc.close()
        
    except Exception as e:
        print(f"    Warning: Failed to open PDF for image extraction: {e}")
    
    return images


def extract_makita_product_images(
    pdf_path: Path,
    page_num: int,
    output_dir: Optional[Path] = None,
) -> List[Tuple[str, int]]:
    """Extract clean product images from Makita catalog pages.
    
    Makita catalogs have a different layout than other catalogs:
    - Multiple products per page
    - Mix of product photos, icons, banners, and decorative elements
    - Good product images are typically 150-700px, 20-150KB
    
    This function filters out:
    - Tiny icons (<150px or <15KB)
    - Wide banners (aspect ratio > 3)
    - Full-page backgrounds (>200KB)
    - Header/footer elements
    
    Args:
        pdf_path: Path to the PDF file
        page_num: 1-indexed page number
        output_dir: Output directory for images
    
    Returns:
        List of tuples: (relative_image_path, file_size_bytes)
        Sorted by file size descending (best quality first)
    """
    if not HAS_FITZ or not HAS_PIL:
        return []
    
    pdf_stem = pdf_path.stem
    if output_dir is None:
        output_dir = IMAGE_DIR / pdf_stem
    
    output_dir.mkdir(parents=True, exist_ok=True)
    good_images = []
    
    try:
        doc = fitz.open(str(pdf_path))
        page = doc[page_num - 1]
        page_height = page.rect.height
        
        for img_idx, img_info in enumerate(page.get_images(full=True)):
            try:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                width = base_image.get("width", 0)
                height = base_image.get("height", 0)
                size_bytes = len(image_bytes)
                
                # Get image position on page
                rects = page.get_image_rects(xref)
                if rects:
                    rect = rects[0]
                    # Skip images in header area (top 10% of page)
                    if rect.y1 < page_height * 0.1:
                        continue
                    # Skip images in footer area (bottom 5% of page)
                    if rect.y0 > page_height * 0.95:
                        continue
                
                # Check if this is a good product image
                if not is_good_product_image(width, height, size_bytes):
                    continue
                
                # Generate filename with quality indicator
                img_filename = f"{pdf_stem}__p{page_num}__product__v{img_idx + 1}.webp"
                img_path = output_dir / img_filename
                
                # Save image
                if not img_path.exists():
                    pil_img = Image.open(io.BytesIO(image_bytes))
                    if pil_img.mode not in ("RGB", "RGBA", "LA", "P"):
                        pil_img = pil_img.convert("RGB")
                    pil_img.save(img_path, "WEBP", quality=90)
                
                rel_path = f"images/{pdf_stem}/{img_filename}"
                good_images.append((rel_path, size_bytes))
                
            except Exception as e:
                print(f"    Warning: Failed to extract Makita image {img_idx} from page {page_num}: {e}")
        
        doc.close()
        
    except Exception as e:
        print(f"    Warning: Failed to open Makita PDF for image extraction: {e}")
    
    # Sort by file size descending (largest = best quality)
    good_images.sort(key=lambda x: x[1], reverse=True)
    
    return good_images


def extract_images_with_bboxes_from_page(
    pdf_path: Path,
    page_num: int,
    series_slug: str,
    output_dir: Optional[Path] = None,
    column_filter: Optional[str] = None,  # 'left', 'right', or None for all
) -> List[Tuple[str, Tuple[float, float, float, float]]]:
    """Extract images from a PDF page and also return their page-space bounding boxes.

    Returns a list of tuples:
    - (relative_image_path, (x0, y0, x1, y1))

    The bbox coordinates are in the PDF page coordinate space as returned by PyMuPDF.
    """
    if not HAS_FITZ or not HAS_PIL:
        return []

    pdf_stem = pdf_path.stem
    if output_dir is None:
        output_dir = IMAGE_DIR / pdf_stem
    output_dir.mkdir(parents=True, exist_ok=True)

    out: List[Tuple[str, Tuple[float, float, float, float]]] = []

    try:
        doc = fitz.open(str(pdf_path))
        page = doc[page_num - 1]
        page_width = page.rect.width
        page_mid_x = page_width / 2

        filtered_img_count = 0
        for img_idx, img_info in enumerate(page.get_images(full=True)):
            try:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]

                width = base_image.get("width", 0)
                height = base_image.get("height", 0)
                if width < 50 or height < 50:
                    continue

                # Use the first placement rect as the representative bbox.
                rects = []
                try:
                    rects = page.get_image_rects(xref)
                except Exception:
                    rects = []
                if not rects:
                    continue

                rect = rects[0]
                
                # Filter by column if specified
                img_center_x = (rect.x0 + rect.x1) / 2
                if column_filter == 'left' and img_center_x >= page_mid_x:
                    continue  # Skip right-side images
                if column_filter == 'right' and img_center_x < page_mid_x:
                    continue  # Skip left-side images

                # Use filtered count for naming (not raw img_idx)
                if filtered_img_count == 0:
                    img_filename = f"{pdf_stem}__p{page_num}__{series_slug}.webp"
                else:
                    img_filename = f"{pdf_stem}__p{page_num}__{series_slug}__v{filtered_img_count + 1}.webp"
                filtered_img_count += 1

                img_path = output_dir / img_filename
                if not img_path.exists():
                    pil_img = Image.open(io.BytesIO(image_bytes))
                    if pil_img.mode in ("RGBA", "LA", "P"):
                        pass
                    elif pil_img.mode != "RGB":
                        pil_img = pil_img.convert("RGB")
                    pil_img.save(img_path, "WEBP", quality=90)

                rel_path = f"images/{pdf_stem}/{img_filename}"
                out.append((rel_path, (float(rect.x0), float(rect.y0), float(rect.x1), float(rect.y1))))
            except Exception as e:
                print(f"    Warning: Failed to extract image {img_idx} from page {page_num}: {e}")

        doc.close()
    except Exception as e:
        print(f"    Warning: Failed to open PDF for image extraction: {e}")

    return out


def _bbox_intersection_area(a: Tuple[float, float, float, float], b: Tuple[float, float, float, float]) -> float:
    ax0, ay0, ax1, ay1 = a
    bx0, by0, bx1, by1 = b
    ix0 = max(ax0, bx0)
    iy0 = max(ay0, by0)
    ix1 = min(ax1, bx1)
    iy1 = min(ay1, by1)
    if ix1 <= ix0 or iy1 <= iy0:
        return 0.0
    return float((ix1 - ix0) * (iy1 - iy0))


def _bbox_area(a: Tuple[float, float, float, float]) -> float:
    x0, y0, x1, y1 = a
    if x1 <= x0 or y1 <= y0:
        return 0.0
    return float((x1 - x0) * (y1 - y0))


# ============================================================================
# DEMA CATALOG PAGE DETECTION - Detect pages with DEMA footer
# ============================================================================

# DEMA brand colors (approximate RGB values)
DEMA_BLUE_RGB = (0, 160, 200)  # Blue footer/header background
DEMA_YELLOW_RGB = (255, 255, 0)  # Yellow highlight for specs text

def color_distance(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    """Calculate Euclidean distance between two RGB colors."""
    return ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2) ** 0.5


def is_dema_blue(color: Tuple[int, int, int], tolerance: float = 60) -> bool:
    """Check if a color is close to DEMA blue."""
    return color_distance(color, DEMA_BLUE_RGB) < tolerance


def is_dema_yellow(color: Tuple[int, int, int], tolerance: float = 60) -> bool:
    """Check if a color is close to DEMA yellow."""
    return color_distance(color, DEMA_YELLOW_RGB) < tolerance


def has_dema_footer(page) -> bool:
    """Check if a pdfplumber page has a DEMA footer (blue bar at bottom).
    
    The DEMA footer is typically:
    - A blue rectangle at the bottom of the page
    - Contains the DEMA logo or text
    - Height ~20-40 points
    
    Args:
        page: pdfplumber page object
        
    Returns:
        True if DEMA footer detected
    """
    page_height = page.height
    page_width = page.width
    
    # Look for rectangles in the bottom 50 points of the page
    footer_zone_top = page_height - 50
    
    rects = page.rects or []
    for rect in rects:
        # Check if rectangle is in footer zone
        if rect.get("top", 0) < footer_zone_top:
            continue
        
        # Check if rectangle spans most of the page width
        rect_width = rect.get("width", 0) or (rect.get("x1", 0) - rect.get("x0", 0))
        if rect_width < page_width * 0.8:
            continue
        
        # Check fill color (non_stroking_color is fill, stroking_color is stroke)
        fill_color = rect.get("non_stroking_color")
        # fill_color can be a float (grayscale), tuple, or list
        if fill_color and isinstance(fill_color, (list, tuple)) and len(fill_color) >= 3:
            # Convert to 0-255 range if in 0-1 range
            if all(0 <= c <= 1 for c in fill_color[:3]):
                rgb = tuple(int(c * 255) for c in fill_color[:3])
            else:
                rgb = tuple(int(c) for c in fill_color[:3])
            
            if is_dema_blue(rgb):
                return True
    
    # Alternative: check for "DEMA" text in footer zone
    chars = page.chars or []
    footer_chars = [c for c in chars if c.get("top", 0) > footer_zone_top]
    footer_text = "".join(c.get("text", "") for c in footer_chars).upper()
    
    if "DEMA" in footer_text:
        return True
    
    return False


def extract_blue_header_text(page) -> Optional[Tuple[str, str]]:
    """Extract series title from blue background text blocks.
    
    Looks for text with blue background (white text on blue) which indicates
    series headers like "NR 1121 - MESSING DOORVOERKOPPELING".
    
    Returns:
        Tuple of (series_slug, series_name) or None
    """
    chars = page.chars or []
    
    # Group chars by their background color
    blue_text_chars = []
    
    for char in chars:
        # Check background color (non_stroking_color when text is on colored rect)
        # This is tricky - we need to find chars that are on top of blue rectangles
        pass  # Complex implementation - for now rely on text patterns
    
    # Fallback: Look for text matching series patterns in upper portion of page
    page_height = page.height
    header_zone_bottom = page_height * 0.25  # Top 25% of page
    
    header_chars = [c for c in chars if c.get("top", 0) < header_zone_bottom]
    
    # Group by line (similar y position)
    lines = {}
    for char in header_chars:
        y = round(char.get("top", 0) / 5) * 5  # Round to nearest 5
        if y not in lines:
            lines[y] = []
        lines[y].append(char)
    
    # Sort chars in each line by x position and join
    for y in sorted(lines.keys()):
        line_chars = sorted(lines[y], key=lambda c: c.get("x0", 0))
        line_text = "".join(c.get("text", "") for c in line_chars).strip()
        
        # Check if this looks like a series title
        result = detect_series_title(line_text)
        if result:
            return result
    
    return None


def extract_yellow_specs_text(page, below_y: float = 0) -> Optional[str]:
    """Extract specs text from yellow highlighted area below series title.
    
    Looks for text like "BUITENDRAAD", "BINNENDRAAD" etc. that appears
    on yellow background below the series title.
    
    Args:
        page: pdfplumber page object
        below_y: Only look for text below this y coordinate
        
    Returns:
        Specs text if found
    """
    chars = page.chars or []
    
    # Look for chars below the specified y position
    candidate_chars = [c for c in chars if c.get("top", 0) > below_y]
    
    # Group by line
    lines = {}
    for char in candidate_chars:
        y = round(char.get("top", 0) / 5) * 5
        if y not in lines:
            lines[y] = []
        lines[y].append(char)
    
    # Check each line for specs patterns
    for y in sorted(lines.keys()):
        line_chars = sorted(lines[y], key=lambda c: c.get("x0", 0))
        line_text = "".join(c.get("text", "") for c in line_chars).strip().upper()
        
        # Check if this matches any specs pattern
        for pattern in SPECS_PATTERNS:
            if pattern in line_text:
                return line_text
    
    return None


# ============================================================================
# SERIES DETECTION - Detect series titles from blue headers
# ============================================================================

# Pattern for series titles like "NR 1 - MESSING BOCHT 90°", "NR 23 - MESSING PIJPNIPPEL"
SERIES_TITLE_PATTERN = re.compile(
    r"^NR\s*(\d+)\s*[-–]\s*(.+)$",
    re.IGNORECASE
)

# Alternative patterns for other catalog types
ALT_SERIES_PATTERNS = [
    # PVC/PE products: "PVC DRUKBUIS PN7,5", "PE BUIS SDR11"
    re.compile(r"^(PVC|PE|PP|ABS|HDPE|LDPE)\s+(.+)$", re.IGNORECASE),
    # Kogelkraan, Terugslagklep, etc.
    re.compile(r"^(KOGELKRAAN|TERUGSLAGKLEP|VLINDERKLEP|SCHUIFAFSLUITER)\s+(.+)$", re.IGNORECASE),
    # Generic product types
    re.compile(r"^([A-Z]{2,})\s+(BOCHT|KNIE|T-STUK|NIPPEL|SOK|PLUG|KAP|KOPPELING|KLEP|KRAAN|BUIS|FLENS|MOF|DOP)\s*(.*)$", re.IGNORECASE),
]

# Specs text patterns (yellow highlighted text below series title)
SPECS_PATTERNS = [
    "BUITENDRAAD", "BINNENDRAAD", "LIJMMOF", "LIJMSPIE",
    "VERZINKT", "RVS", "INOX", "MESSING", "PP", "PVC", "PE",
    "EPDM", "VITON", "NBR", "RUBBER", "METRISCH", "INCH",
    "MET FLENS", "ZONDER FLENS", "MET VEER", "ZONDER VEER",
    "TRANSPARANT", "KRAAGBUSDICHTING",
]


def detect_series_title(text: str) -> Optional[Tuple[str, str]]:
    """Detect series title from text.
    
    Returns:
        Tuple of (series_slug, series_name) or None if not detected
    """
    text = text.strip()
    if not text:
        return None
    
    # Try NR pattern first
    match = SERIES_TITLE_PATTERN.match(text)
    if match:
        nr = match.group(1)
        name = match.group(2).strip()
        series_name = f"NR {nr} - {name}"
        series_slug = slugify(series_name) or f"nr-{nr}"
        return (series_slug, series_name)
    
    # Try alternative patterns
    for pattern in ALT_SERIES_PATTERNS:
        match = pattern.match(text)
        if match:
            series_name = text
            series_slug = slugify(series_name)
            if series_slug:
                return (series_slug, series_name)
    
    return None


def extract_langsnaad_products_from_text(page_text: str) -> List[Dict[str, Any]]:
    """Extract LANGSNAAD GELASTE RVS BUIS products from page text.
    
    The PDF has a two-column layout where table detection fails.
    This function parses the text directly to extract all products.
    
    Returns:
        List of product dicts with sku, maat, wanddikte, lengte
    """
    if not page_text:
        return []
    
    # Pattern: SKU + Maat + Wanddikte + Lengte (e.g., "9LABU00600 6,00 mm 1,00 mm 6 m")
    pattern = re.compile(r'(9LABU\d{5})\s+([\d,]+\s*mm)\s+([\d,]+\s*mm)\s+(\d+\s*m)')
    
    products = []
    for match in pattern.finditer(page_text):
        products.append({
            "bestelnr": match.group(1),
            "sku": match.group(1),
            "maat": match.group(2).strip(),
            "wanddikte": match.group(3).strip(),
            "lengte": match.group(4).strip(),
            "series_name": "LANGSNAAD GELASTE RVS BUIS",
            "series_id": "langsnaad-gelaste-rvs-buis",
            "type": "langsnaad_gelaste_rvs_buis",
        })
    
    return products


def extract_rvs_draadfittingen_from_text(page_text: str, series_list: List[Tuple[str, str]], page_mid_x: float = 300.0) -> List[Dict[str, Any]]:
    """Extract RVS draadfittingen products from page text for two-column layouts.
    
    Handles various SKU patterns:
    - 9ZF (fittingen)
    - 9BUL (buizen)
    - 9LAK, 9LAT, 9LAE, 9LAR, 9LABR (RVS BUISBODEM)
    - 9ZFBF (fittingen)
    
    Associates products with correct series based on position in text.
    
    Returns:
        List of product dicts
    """
    if not page_text:
        return []
    
    products = []
    
    # Generic pattern for all RVS draadfittingen SKUs
    # Matches various RVS SKU prefixes followed by digits
    # Updated to handle values starting with digits (e.g., "90 mm" after 9LAS090)
    # Uses negative lookahead to avoid matching next SKU as value
    # Pattern captures SKU and first property value (size, DN, dimension, etc.)
    # Handles formats like: "9ZF9018 1/8"", "9LAS090 90 mm", "9ZFGF12 DN15 x 1/2""
    sku_pattern = re.compile(r'(9(?:ZF|BUL|LAK|LAT|LAE|LAR|LABR|ZFBF|ZFVF|LAN|LAS|LAF|LAFL|ZFVL|ZFGF|LASR)[A-Z]*\d+)\s+([^\s]+(?:\s+x\s+[^\s]+)?)')
    
    # Determine series assignment based on text position
    all_skus_in_order = []
    
    for match in sku_pattern.finditer(page_text):
        sku = match.group(1)
        # Get the value after SKU (could be size, dimensions, etc.)
        value = match.group(2).strip()
        # Clean up the value - stop at common delimiters
        value = re.split(r'\s{2,}|\t', value)[0].strip()
        
        all_skus_in_order.append({
            "bestelnr": sku,
            "sku": sku,
            "size": value.replace('"', '"').replace("'", "'"),
            "pos": match.start(),
        })
    
    # Sort by position in text
    all_skus_in_order.sort(key=lambda x: x["pos"])
    
    # Remove duplicates (keep first occurrence)
    seen_skus = set()
    unique_products = []
    for prod in all_skus_in_order:
        if prod["sku"] not in seen_skus:
            seen_skus.add(prod["sku"])
            unique_products.append(prod)
    
    # Assign series based on SKU pattern matching to series name
    # Build mapping from SKU prefix patterns to series
    series_nr_map = {}  # Maps NR number to (series_slug, series_name)
    series_prefix_map = {}  # Maps SKU prefix to (series_slug, series_name)
    
    for slug, name in series_list:
        # Extract NR number from series name like "NR 90 - KNIE 90°"
        nr_match = re.search(r'NR\s+(\d+)', name)
        if nr_match:
            nr_num = nr_match.group(1)
            series_nr_map[nr_num] = (slug, name)
        
        # Map non-NR series to SKU prefixes
        # LASTULE -> 9LAS (without R suffix), LASR for reduced versions
        # LASVERLOOP -> 9LAE, 9LAR
        # RVS BUISBODEM -> 9LAK, 9LAT
        # LASNIPPEL -> 9LAN
        # DRAADFLENS, VOORLASFLENS -> 9LAFL, 9ZFVL
        # BLINDFLENS, VLAKKE FLENS -> 9ZFGF, 9ZFBF
        name_upper = name.upper()
        if 'LASTULE' in name_upper:
            series_prefix_map['9LAS'] = (slug, name)
            series_prefix_map['9LASR'] = (slug, name)
        elif 'LASVERLOOP' in name_upper:
            series_prefix_map['9LAE'] = (slug, name)
            series_prefix_map['9LAR'] = (slug, name)
        elif 'BUISBODEM' in name_upper:
            series_prefix_map['9LAK'] = (slug, name)
            series_prefix_map['9LAT'] = (slug, name)
        elif 'LASNIPPEL' in name_upper:
            series_prefix_map['9LAN'] = (slug, name)
        elif 'LAS T-STUK' in name_upper or 'T-STUK' in name_upper:
            series_prefix_map['9LABR'] = (slug, name)
        elif 'LASBOCHT' in name_upper or '3D LASBOCHT' in name_upper:
            series_prefix_map['9LAF'] = (slug, name)
        elif 'DRAADFLENS' in name_upper:
            series_prefix_map['9LAFL'] = (slug, name)
        elif 'VOORLASFLENS' in name_upper:
            series_prefix_map['9ZFVL'] = (slug, name)
        elif 'BLINDFLENS' in name_upper:
            series_prefix_map['9ZFGF'] = (slug, name)
        elif 'VLAKKE FLENS' in name_upper:
            series_prefix_map['9ZFVF'] = (slug, name)
        elif 'INOX BOORDRING' in name_upper:
            series_prefix_map['9LABR'] = (slug, name)  # Shares prefix with T-STUK
        elif 'ALU OVERSCHUIFFLENS' in name_upper:
            series_prefix_map['9LAFL'] = (slug, name)  # Shares prefix
    
    for i, prod in enumerate(unique_products):
        sku = prod["sku"]
        assigned = False
        
        # First try SKU prefix matching for non-NR series
        for prefix, (slug, name) in series_prefix_map.items():
            if sku.startswith(prefix):
                prod["series_slug"], prod["series_name"] = slug, name
                assigned = True
                break
        
        # Then try NR number matching for NR series
        if not assigned and len(series_list) >= 2 and series_nr_map:
            for nr_num, (slug, name) in series_nr_map.items():
                sku_nr_match = re.search(r'9[A-Z]+(\d+)', sku)
                if sku_nr_match:
                    sku_nr = sku_nr_match.group(1)
                    if sku_nr.startswith(nr_num):
                        prod["series_slug"], prod["series_name"] = slug, name
                        assigned = True
                        break
        
        if not assigned:
            if len(series_list) >= 1:
                # Fallback to first series
                prod["series_slug"], prod["series_name"] = series_list[0]
            else:
                prod["series_slug"] = "unknown"
                prod["series_name"] = "Unknown"
        
        prod["series_id"] = prod["series_slug"]
        del prod["pos"]
        products.append(prod)
    
    return products


def extract_messing_draadfittingen_from_text(page_text: str, series_list: List[Tuple[str, str]], page_mid_x: float = 300.0) -> List[Dict[str, Any]]:
    """Extract messing draadfittingen products from page text for two-column layouts.
    
    Handles SKU patterns like: MF138, MF112, MF234, etc.
    """
    if not page_text:
        return []
    
    products = []
    
    # Pattern for messing draadfittingen SKUs: MF followed by digits
    sku_pattern = re.compile(r'(MF\d+[A-Z]?)\s+(\d+/\d+"|[\d/]+(?:\s*(?:mm|cm|"))?)')
    
    all_skus_in_order = []
    
    for match in sku_pattern.finditer(page_text):
        sku = match.group(1)
        value = match.group(2).strip()
        
        all_skus_in_order.append({
            "bestelnr": sku,
            "sku": sku,
            "size": value.replace('"', '"').replace("'", "'"),
            "pos": match.start(),
        })
    
    all_skus_in_order.sort(key=lambda x: x["pos"])
    
    # Remove duplicates
    seen_skus = set()
    unique_products = []
    for prod in all_skus_in_order:
        if prod["sku"] not in seen_skus:
            seen_skus.add(prod["sku"])
            unique_products.append(prod)
    
    # Assign series based on NR number in SKU
    series_nr_map = {}
    for slug, name in series_list:
        nr_match = re.search(r'NR\s+(\d+)', name)
        if nr_match:
            nr_num = nr_match.group(1)
            series_nr_map[nr_num] = (slug, name)
    
    for prod in unique_products:
        sku = prod["sku"]
        assigned = False
        
        # Extract number from SKU (e.g., MF138 -> 1, MF238 -> 2, MF9012 -> 90)
        sku_num_match = re.search(r'MF(\d+)', sku)
        if sku_num_match and series_nr_map:
            sku_digits = sku_num_match.group(1)
            # Try matching first 1-3 digits to NR numbers
            for length in [3, 2, 1]:
                if len(sku_digits) >= length:
                    prefix = sku_digits[:length]
                    if prefix in series_nr_map:
                        prod["series_slug"], prod["series_name"] = series_nr_map[prefix]
                        assigned = True
                        break
        
        if not assigned and series_list:
            prod["series_slug"], prod["series_name"] = series_list[0]
        elif not assigned:
            prod["series_slug"] = "unknown"
            prod["series_name"] = "Unknown"
        
        prod["series_id"] = prod["series_slug"]
        del prod["pos"]
        products.append(prod)
    
    return products


def extract_slangklemmen_from_text(page_text: str, series_list: List[Tuple[str, str]], page_mid_x: float = 300.0) -> List[Dict[str, Any]]:
    """Extract slangklemmen products from page text for two-column layouts.
    
    Handles SKU patterns like: GM46013, GMI46013, MAXM11006, MAXI11007, SBI110081, etc.
    """
    if not page_text:
        return []
    
    products = []
    
    # Pattern for slangklemmen SKUs
    # Formats: GM46013, GMI46013, MAXM11006, MAXI11007, MAX21005, SBI110081, SBIV110082, SB110082, X1371042
    sku_pattern = re.compile(r'((?:GMI?|MAXI?|SBIV?|QDW|X)\d{4,})\s+(\d+(?:[,\.]\d+)?\s*mm)')
    
    all_skus_in_order = []
    
    for match in sku_pattern.finditer(page_text):
        sku = match.group(1)
        value = match.group(2).strip()
        
        all_skus_in_order.append({
            "bestelnr": sku,
            "sku": sku,
            "size": value,
            "pos": match.start(),
        })
    
    all_skus_in_order.sort(key=lambda x: x["pos"])
    
    # Remove duplicates
    seen_skus = set()
    unique_products = []
    for prod in all_skus_in_order:
        if prod["sku"] not in seen_skus:
            seen_skus.add(prod["sku"])
            unique_products.append(prod)
    
    # Build series map from detected series
    series_prefix_map = {}
    for slug, name in series_list:
        name_upper = name.upper()
        if 'ALU KLEMSCHALEN' in name_upper:
            series_prefix_map['GM'] = (slug, name)
        elif 'RVS KLEMSCHALEN' in name_upper:
            series_prefix_map['GMI'] = (slug, name)
        elif 'MINI-CLIP' in name_upper:
            series_prefix_map['MAXM'] = (slug, name)
        elif '1-OOR' in name_upper:
            series_prefix_map['MAXI'] = (slug, name)
        elif 'GALVA' in name_upper and '2-OOR' in name_upper:
            series_prefix_map['MAX'] = (slug, name)
        elif 'INOX' in name_upper and '2-OOR' in name_upper:
            series_prefix_map['MAXI2'] = (slug, name)
        elif 'W4' in name_upper:
            series_prefix_map['SBIV'] = (slug, name)
        elif 'W2' in name_upper:
            series_prefix_map['SBI'] = (slug, name)
        elif 'VERZINKT' in name_upper:
            series_prefix_map['SB'] = (slug, name)
        elif 'SLANGKLEMBAND' in name_upper or 'BANDKLEM' in name_upper:
            series_prefix_map['X'] = (slug, name)
    
    for prod in unique_products:
        sku = prod["sku"]
        assigned = False
        
        # Try to match SKU prefix to series (check longer prefixes first)
        for prefix in sorted(series_prefix_map.keys(), key=len, reverse=True):
            if sku.startswith(prefix):
                slug, name = series_prefix_map[prefix]
                prod["series_slug"], prod["series_name"] = slug, name
                assigned = True
                break
        
        if not assigned and series_list:
            prod["series_slug"], prod["series_name"] = series_list[0]
        elif not assigned:
            prod["series_slug"] = "unknown"
            prod["series_name"] = "Unknown"
        
        prod["series_id"] = prod["series_slug"]
        del prod["pos"]
        products.append(prod)
    
    return products


def extract_slangkoppelingen_from_text(page_text: str, series_list: List[Tuple[str, str]], page_mid_x: float = 300.0) -> List[Dict[str, Any]]:
    """Extract slangkoppelingen products from page text for two-column layouts.
    
    Handles SKU patterns like: B77050040, 9B77050040, C4050, 9C77070075, etc.
    """
    if not page_text:
        return []
    
    products = []
    
    # Pattern for slangkoppelingen SKUs
    # Formats: B77050040, 9B77050040, C4050, 9C77070075, B8050, etc.
    # Also handles: HK1234, SK1234, etc.
    sku_pattern = re.compile(r'(\d?[A-Z]\d{1,5}[A-Z]?\d*)\s+(\d+(?:\s+\d+)?(?:/\d+)?(?:\s*mm)?(?:\s*x\s*\d+(?:\s+\d+)?(?:/\d+)?(?:\s*mm)?)*)')
    
    all_skus_in_order = []
    
    for match in sku_pattern.finditer(page_text):
        sku = match.group(1)
        value = match.group(2).strip()
        
        # Filter out false positives (too short or doesn't look like a SKU)
        if len(sku) < 4:
            continue
        # Must start with optional digit + letter
        if not re.match(r'^\d?[A-Z]', sku):
            continue
            
        all_skus_in_order.append({
            "bestelnr": sku,
            "sku": sku,
            "size": value,
            "pos": match.start(),
        })
    
    all_skus_in_order.sort(key=lambda x: x["pos"])
    
    # Remove duplicates
    seen_skus = set()
    unique_products = []
    for prod in all_skus_in_order:
        if prod["sku"] not in seen_skus:
            seen_skus.add(prod["sku"])
            unique_products.append(prod)
    
    # Build series map from detected series
    # For slangkoppelingen, match SKU prefix to series type
    # B77 -> BAUER TYPE 77, 9B77 -> BAUER TYPE 77 - RVS, C4 -> PERROT TYPE 4, etc.
    series_type_map = {}
    for slug, name in series_list:
        name_upper = name.upper()
        # Extract type number from series name
        type_match = re.search(r'(?:BAUER|PERROT)\s+TYPE\s+(\d+[A-Z]?)', name_upper)
        if type_match:
            type_num = type_match.group(1)
            is_rvs = 'RVS' in name_upper or 'INOX' in name_upper
            prefix = '9' if is_rvs else ''
            if 'BAUER' in name_upper:
                series_type_map[f'{prefix}B{type_num}'] = (slug, name)
            elif 'PERROT' in name_upper:
                series_type_map[f'{prefix}C{type_num}'] = (slug, name)
    
    for prod in unique_products:
        sku = prod["sku"]
        assigned = False
        
        # Try to match SKU prefix to series
        for prefix, (slug, name) in series_type_map.items():
            if sku.startswith(prefix):
                prod["series_slug"], prod["series_name"] = slug, name
                assigned = True
                break
        
        if not assigned and series_list:
            prod["series_slug"], prod["series_name"] = series_list[0]
        elif not assigned:
            prod["series_slug"] = "unknown"
            prod["series_name"] = "Unknown"
        
        prod["series_id"] = prod["series_slug"]
        del prod["pos"]
        products.append(prod)
    
    return products


def extract_verzinkte_buizen_from_text(page_text: str, series_list: List[Tuple[str, str]], page_mid_x: float = 300.0) -> List[Dict[str, Any]]:
    """Extract verzinkte buizen products from page text for two-column layouts.
    
    Handles SKU patterns like: ZF118, GB38, ZF90R1238, BUL14120, etc. (no 7 prefix)
    """
    if not page_text:
        return []
    
    products = []
    
    # Pattern for verzinkte buizen SKUs: ZF, GB, BUL (no 7 prefix)
    # Handles: single sizes (1/2"), mixed sizes (2 1/2"), reduction sizes (1/2" x 3/8"), triple sizes (3/8" x 1/4" x 3/8")
    sku_pattern = re.compile(r'((?:ZF|GB|BUL)\w+)\s+(\d+(?:\s+\d+)?(?:/\d+)?"\s*(?:x\s*\d+(?:\s+\d+)?(?:/\d+)?"\s*)*)')
    
    all_skus_in_order = []
    
    for match in sku_pattern.finditer(page_text):
        sku = match.group(1)
        value = match.group(2).strip()
        
        all_skus_in_order.append({
            "bestelnr": sku,
            "sku": sku,
            "size": value.replace('"', '"').replace("'", "'"),
            "pos": match.start(),
        })
    
    all_skus_in_order.sort(key=lambda x: x["pos"])
    
    # Remove duplicates
    seen_skus = set()
    unique_products = []
    for prod in all_skus_in_order:
        if prod["sku"] not in seen_skus:
            seen_skus.add(prod["sku"])
            unique_products.append(prod)
    
    # Assign series based on NR number in SKU
    # Handle both NR 90 and NR 90R separately (R suffix indicates reduction fitting)
    series_nr_map = {}  # For regular NR series (NR 90, NR 130, etc.)
    series_nr_r_map = {}  # For R-suffix series (NR 90R, NR 130R, etc.)
    for slug, name in series_list:
        nr_match = re.search(r'NR\s+(\d+)(R)?', name)
        if nr_match:
            nr_num = nr_match.group(1)
            has_r = nr_match.group(2) is not None
            if has_r:
                series_nr_r_map[nr_num] = (slug, name)
            else:
                series_nr_map[nr_num] = (slug, name)
    
    # Build map of non-NR series by name for special SKU prefixes
    special_series_map = {}
    for slug, name in series_list:
        name_upper = name.upper()
        if 'VERZINKTE BUIS' in name_upper and 'NR' not in name_upper:
            special_series_map['GB'] = (slug, name)
        elif 'PIJPNIPPEL' in name_upper and 'NR' not in name_upper:
            special_series_map['BUL'] = (slug, name)
    
    for prod in unique_products:
        sku = prod["sku"]
        assigned = False
        
        # First check for special SKU prefixes (GB -> VERZINKTE BUIS, BUL -> PIJPNIPPEL)
        for prefix, (slug, name) in special_series_map.items():
            if sku.startswith(prefix):
                prod["series_slug"], prod["series_name"] = slug, name
                assigned = True
                break
        
        # Then try to match by NR number in SKU
        # Check if SKU has R suffix (e.g., ZF90R1238 -> NR 90R)
        if not assigned:
            sku_r_match = re.search(r'[A-Z]+(\d+)R', sku)
            sku_num_match = re.search(r'[A-Z]+(\d+)', sku)
            
            if sku_r_match and series_nr_r_map:
                # SKU has R suffix - match to NR xxR series
                sku_digits = sku_r_match.group(1)
                for length in [3, 2, 1]:
                    if len(sku_digits) >= length:
                        prefix = sku_digits[:length]
                        if prefix in series_nr_r_map:
                            prod["series_slug"], prod["series_name"] = series_nr_r_map[prefix]
                            assigned = True
                            break
            
            if not assigned and sku_num_match and series_nr_map:
                # Regular SKU - match to regular NR series
                sku_digits = sku_num_match.group(1)
                for length in [3, 2, 1]:
                    if len(sku_digits) >= length:
                        prefix = sku_digits[:length]
                        if prefix in series_nr_map:
                            prod["series_slug"], prod["series_name"] = series_nr_map[prefix]
                            assigned = True
                            break
        
        if not assigned and series_list:
            prod["series_slug"], prod["series_name"] = series_list[0]
        elif not assigned:
            prod["series_slug"] = "unknown"
            prod["series_name"] = "Unknown"
        
        prod["series_id"] = prod["series_slug"]
        del prod["pos"]
        products.append(prod)
    
    return products


def extract_zwarte_draadfittingen_from_text(page_text: str, series_list: List[Tuple[str, str]], page_mid_x: float = 300.0) -> List[Dict[str, Any]]:
    """Extract zwarte draad- en lasfittingen products from page text for two-column layouts.
    
    Handles SKU patterns like: 7ZF118, 7GB64, 7ZF12, etc.
    """
    if not page_text:
        return []
    
    products = []
    
    # Pattern for zwarte draadfittingen SKUs: 7ZF, 7GB, etc.
    # Handles: single sizes (1/2"), mixed sizes (2 1/2"), reduction sizes (1/2" x 3/8")
    # Uses \w+ to capture SKUs like 7ZF90R1238 (with R for reduction fittings)
    sku_pattern = re.compile(r'(7(?:ZF|GB|BUL|LAK|LAT|LAE|LAR|LABR|ZFBF|LAN|LAS|LAF)\w+)\s+(\d+(?:\s+\d+)?(?:/\d+)?"\s*(?:x\s*\d+(?:/\d+)?")?)')
    
    all_skus_in_order = []
    
    for match in sku_pattern.finditer(page_text):
        sku = match.group(1)
        value = match.group(2).strip()
        
        all_skus_in_order.append({
            "bestelnr": sku,
            "sku": sku,
            "size": value.replace('"', '"').replace("'", "'"),
            "pos": match.start(),
        })
    
    all_skus_in_order.sort(key=lambda x: x["pos"])
    
    # Remove duplicates
    seen_skus = set()
    unique_products = []
    for prod in all_skus_in_order:
        if prod["sku"] not in seen_skus:
            seen_skus.add(prod["sku"])
            unique_products.append(prod)
    
    # Assign series based on NR number in SKU
    # Handle both NR 90 and NR 90R separately (R suffix indicates reduction fitting)
    series_nr_map = {}  # For regular NR series (NR 90, NR 130, etc.)
    series_nr_r_map = {}  # For R-suffix series (NR 90R, NR 130R, etc.)
    for slug, name in series_list:
        nr_match = re.search(r'NR\s+(\d+)(R)?', name)
        if nr_match:
            nr_num = nr_match.group(1)
            has_r = nr_match.group(2) is not None
            if has_r:
                series_nr_r_map[nr_num] = (slug, name)
            else:
                series_nr_map[nr_num] = (slug, name)
    
    # Build map of non-NR series by name for special SKU prefixes
    special_series_map = {}
    for slug, name in series_list:
        name_upper = name.upper()
        if 'STALEN GASBUIS' in name_upper:
            special_series_map['7GB'] = (slug, name)
        elif 'PIJPNIPPEL' in name_upper and 'NR' not in name_upper:
            special_series_map['7BUL'] = (slug, name)
    
    for prod in unique_products:
        sku = prod["sku"]
        assigned = False
        
        # First check for special SKU prefixes (7GB -> STALEN GASBUIS, etc.)
        for prefix, (slug, name) in special_series_map.items():
            if sku.startswith(prefix):
                prod["series_slug"], prod["series_name"] = slug, name
                assigned = True
                break
        
        # Then try to match by NR number in SKU
        # Check if SKU has R suffix (e.g., 7ZF90R1238 -> NR 90R)
        if not assigned:
            sku_r_match = re.search(r'7[A-Z]+(\d+)R', sku)
            sku_num_match = re.search(r'7[A-Z]+(\d+)', sku)
            
            if sku_r_match and series_nr_r_map:
                # SKU has R suffix - match to NR xxR series
                sku_digits = sku_r_match.group(1)
                for length in [3, 2, 1]:
                    if len(sku_digits) >= length:
                        prefix = sku_digits[:length]
                        if prefix in series_nr_r_map:
                            prod["series_slug"], prod["series_name"] = series_nr_r_map[prefix]
                            assigned = True
                            break
            
            if not assigned and sku_num_match and series_nr_map:
                # Regular SKU - match to regular NR series
                sku_digits = sku_num_match.group(1)
                for length in [3, 2, 1]:
                    if len(sku_digits) >= length:
                        prefix = sku_digits[:length]
                        if prefix in series_nr_map:
                            prod["series_slug"], prod["series_name"] = series_nr_map[prefix]
                            assigned = True
                            break
        
        if not assigned and series_list:
            prod["series_slug"], prod["series_name"] = series_list[0]
        elif not assigned:
            prod["series_slug"] = "unknown"
            prod["series_name"] = "Unknown"
        
        prod["series_id"] = prod["series_slug"]
        del prod["pos"]
        products.append(prod)
    
    return products


def extract_all_series_from_page(page_text: str) -> List[Tuple[str, str]]:
    """Extract all series (NR patterns) from page text for multi-column layouts.
    
    Returns:
        List of (series_slug, series_name) tuples
    """
    if not page_text:
        return []
    
    results = []
    
    # Pattern that captures NR number and name, stopping before next NR or end
    # Include hyphens in name to capture "T-STUK", "VERLOOP T-STUK", etc.
    nr_pattern = re.compile(r'NR\s+(\d+[A-Z]?)\s*[-–]\s*([A-Z0-9°\s\-]+?)(?=\s+NR\s|\s*$|\n)', re.IGNORECASE)
    for match in nr_pattern.finditer(page_text):
        nr = match.group(1)
        name = match.group(2).strip()
        series_name = f"NR {nr} - {name}"
        series_slug = slugify(series_name) or f"nr-{nr}"
        results.append((series_slug, series_name))
    
    # Also check for other common series patterns in RVS/zwarte draadfittingen
    other_patterns = [
        (r'LANGSNAAD GELASTE RVS BUIS', 'LANGSNAAD GELASTE RVS BUIS'),
        (r'RVS BUISBODEM', 'RVS BUISBODEM'),
        (r'LAS T-STUK \d+°', None),  # Will use matched text
        (r'3D LASBOCHT \d+°', None),  # 3D LASBOCHT 90°
        (r'LASBOCHT \d+°', None),  # LASBOCHT 45°, LASBOCHT 90°
        (r'LASKNIE \d+°', None),  # LASKNIE 90°
        (r'LASVERLOOP', 'LASVERLOOP'),
        (r'LASKOPPELING', 'LASKOPPELING'),
        (r'LASKAP', 'LASKAP'),
        (r'LASREDUCTIE', 'LASREDUCTIE'),
        (r'LASBUIS', 'LASBUIS'),
        (r'LASNIPPEL', 'LASNIPPEL'),
        (r'LASDOP', 'LASDOP'),
        (r'LASFLENZEN', 'LASFLENZEN'),
        (r'BUISFLENS', 'BUISFLENS'),
        (r'LASTULE', 'LASTULE'),
        (r'DRAADFLENS', 'DRAADFLENS'),
        (r'VOORLASFLENS', 'VOORLASFLENS'),
        (r'VLAKKE FLENS', 'VLAKKE FLENS'),
        (r'BLINDFLENS', 'BLINDFLENS'),
        (r'ALU OVERSCHUIFFLENS', 'ALU OVERSCHUIFFLENS'),
        (r'INOX BOORDRING', 'INOX BOORDRING'),
        # Zwarte draad- en lasfittingen specific
        (r'STALEN GASBUIS', 'STALEN GASBUIS'),
        (r'ZWARTE PIJPNIPPELS', 'ZWARTE PIJPNIPPELS'),
        # Slangkoppelingen specific - BAUER, PERROT, GEKA types
        (r'BAUER TYPE \d+[A-Z]?\s*(?:-\s*RVS)?', None),  # BAUER TYPE 77, BAUER TYPE 77 - RVS
        (r'PERROT TYPE \d+[A-Z]?\s*(?:-\s*RVS)?', None),  # PERROT TYPE 70, PERROT TYPE 70 - RVS
        (r'GEKA KOPPELING\s+\w+', None),  # GEKA KOPPELING BINNENDRAAD
        (r'PVDF KOPPELINGEN', 'PVDF KOPPELINGEN'),
        (r'HERSTELTULE\s+\w+(?:\s+\w+)?', None),  # HERSTELTULE T-STUK
        (r'CAMLOCK TYPE [A-Z]', None),  # CAMLOCK TYPE A, B, C, etc.
        (r'STORZ KOPPELING', 'STORZ KOPPELING'),
        (r'GUILLEMIN KOPPELING', 'GUILLEMIN KOPPELING'),
        # Slangklemmen specific
        (r'ALU KLEMSCHALEN', 'ALU KLEMSCHALEN'),
        (r'RVS KLEMSCHALEN', 'RVS KLEMSCHALEN'),
        (r'MINI-CLIP SLANGKLEMMEN(?:\s+INOX)?', None),
        (r'(?:INOX\s+)?1-OOR SLANGKLEMMEN', None),
        (r'(?:GALVA\s+)?2-OOR SLANGKLEMMEN', None),
        (r'(?:INOX\s+)?2-OOR SLANGKLEMMEN', None),
        (r'SCHROEFKLEMMEN\s+(?:INOX\s+)?W[24]', None),
        (r'SUPRA SCHROEFKLEMMEN\s+(?:INOX\s+)?W[24]', None),
        (r'SCHROEFKLEMMEN VERZINKT', 'SCHROEFKLEMMEN VERZINKT'),
        (r'SLANGKLEMBAND\s+(?:INOX\s+)?\d*', None),
        (r'BANDKLEM\s+(?:INOX\s+)?\d*', None),
    ]
    for pattern, fixed_name in other_patterns:
        for match in re.finditer(pattern, page_text, re.IGNORECASE):
            name = fixed_name or match.group(0).upper()
            slug = slugify(name)
            if slug and (slug, name) not in results:
                results.append((slug, name))
    
    return results


def extract_specs_text(text: str) -> Optional[str]:
    """Extract specs text (material, connection type) from text.
    
    Returns:
        Specs text if found, None otherwise
    """
    text_upper = text.upper().strip()
    
    for pattern in SPECS_PATTERNS:
        if pattern in text_upper:
            # Return the original text (preserving case)
            return text.strip()
    
    return None


def detect_seal_material(specs_text: str) -> Optional[Tuple[str, str]]:
    """Detect seal material from specs text.
    
    Returns:
        Tuple of (material_slug, material_name) or None
    """
    if not specs_text:
        return None
    
    text_upper = specs_text.upper()
    
    materials = [
        ("epdm", "EPDM"),
        ("viton", "VITON"),
        ("nbr", "NBR"),
        ("ptfe", "PTFE"),
        ("silicone", "Silicone"),
    ]
    
    for slug, name in materials:
        if name in text_upper:
            return (slug, name)
    
    return None


def detect_connection_type(specs_text: str) -> Optional[str]:
    """Detect connection type from specs text.
    
    Returns:
        Connection type string or None
    """
    if not specs_text:
        return None
    
    text_upper = specs_text.upper()
    
    connection_types = [
        ("lijmmof", "LIJMMOF"),
        ("lijmspie", "LIJMSPIE"),
        ("binnendraad", "BINNENDRAAD"),
        ("buitendraad", "BUITENDRAAD"),
        ("flens", "FLENS"),
        ("klemring", "KLEMRING"),
    ]
    
    for conn_type, pattern in connection_types:
        if pattern in text_upper:
            return conn_type
    
    return None


# ============================================================================
# MATERIAL DETECTION - Enhanced material detection from various sources
# ============================================================================

# SKU prefix to material mapping
SKU_MATERIAL_MAP = {
    # Messing fittings
    "MF": ("messing", "Messing"),
    "MFBU": ("messing", "Messing"),
    
    # RVS fittings
    "RVS": ("rvs", "RVS"),
    "316": ("rvs-316", "RVS 316"),
    "304": ("rvs-304", "RVS 304"),
    
    # Verzinkt
    "GB": ("verzinkt", "Verzinkt staal"),
    "ZF": ("verzinkt", "Verzinkt staal"),
    
    # PVC
    "DB": ("pvc", "PVC"),
    "PB": ("pvc", "PVC"),
    "PT": ("pvc", "PVC"),
    "GF": ("pvc", "PVC"),
    
    # PP
    "PP": ("pp", "PP (Polypropyleen)"),
    "BKL": ("pp", "PP (Polypropyleen)"),
    
    # PE
    "HDBU": ("hdpe", "HDPE"),
    "LDBU": ("ldpe", "LDPE"),
    "PE": ("pe", "PE (Polyethyleen)"),
    
    # ABS
    "ABS": ("abs", "ABS"),
    
    # Aluminium
    "AL": ("aluminium", "Aluminium"),
    
    # Slangkoppelingen
    "GM": ("messing", "Messing"),
    "GMI": ("rvs", "RVS/Inox"),
    "C": ("aluminium", "Aluminium"),
    "CI": ("rvs", "RVS 316"),
    "VA": ("aluminium", "Aluminium"),
    "VAI": ("rvs", "RVS/Inox"),
}


def detect_material_from_sku(sku: str) -> Optional[Tuple[str, str]]:
    """Detect material from SKU prefix.
    
    Returns:
        Tuple of (material_slug, material_name) or None
    """
    if not sku:
        return None
    
    sku_upper = sku.upper()
    
    # Try progressively shorter prefixes
    for length in range(min(len(sku_upper), 6), 1, -1):
        prefix = sku_upper[:length]
        if prefix in SKU_MATERIAL_MAP:
            return SKU_MATERIAL_MAP[prefix]
    
    return None


# ============================================================================
# MESSING SKU DECODING - Extract size info from SKU patterns
# ============================================================================

# Inch size encoding map: code -> display string
INCH_SIZE_CODES = {
    "18": '1/8"',
    "14": '1/4"',
    "38": '3/8"',
    "12": '1/2"',
    "34": '3/4"',
    "1": '1"',
    "10": '1"',
    "54": '5/4"',
    "64": '6/4"',
    "32": '3/2"',
    "2": '2"',
    "20": '2"',
    "212": '2 1/2"',
    "3": '3"',
    "30": '3"',
    "4": '4"',
    "40": '4"',
}

def decode_messing_sku_sizes(sku: str, series_name: str) -> Optional[Dict[str, str]]:
    """Decode size information from messing fitting SKU.
    
    Patterns:
    1. MF{series_nr}{size1}{size2} - Two sizes (verloopring, verloopnippel, wartel)
       Example: MF2411214 -> series 241, size1=1/2", size2=1/4"
    2. MF{series_nr}{size}{length} - Single size with length
       Example: MF23012015 -> series 230, size=1/2", length=15
    3. Generic MF SKU with size codes anywhere
    
    Args:
        sku: The SKU code (e.g., "MF2411214")
        series_name: The series name containing NR number (e.g., "NR 241 - MESSING VERLOOPRING")
    
    Returns:
        Dict with decoded sizes or None if not decodable
    """
    if not sku:
        return None
    
    sku_upper = sku.upper()
    
    # Only process MF (messing fitting) SKUs
    if not sku_upper.startswith("MF"):
        return None
    
    result = {}
    size_portion = None
    
    # Determine if this is a two-size product based on series name
    # Products with two sizes: verloop (reducer), wartel (union), overgang (transition)
    is_two_size_product = False
    if series_name:
        name_upper = series_name.upper()
        two_size_keywords = ['VERLOOP', 'WARTEL', 'OVERGANG', 'REDUCTIE', 'VERLOOPRING', 'VERLOOPNIPPEL']
        is_two_size_product = any(kw in name_upper for kw in two_size_keywords)
    
    # Try to extract series number from series_name (e.g., "NR 241 - ..." -> "241")
    series_nr = None
    if series_name:
        series_match = re.match(r"NR\s*(\d+)", series_name, re.IGNORECASE)
        if series_match:
            series_nr = series_match.group(1)
    
    # If we have a series number, try to find it in the SKU
    if series_nr:
        expected_prefix = f"MF{series_nr}"
        if sku_upper.startswith(expected_prefix):
            size_portion = sku_upper[len(expected_prefix):]
    
    # If no series match, try generic decoding from position 2 onwards
    if not size_portion:
        # Skip "MF" prefix and try to find size codes
        remainder = sku_upper[2:]
        
        # Try to find where size codes start by looking for known patterns
        # Common patterns: digits that decode to valid sizes
        for start_pos in range(len(remainder)):
            test_portion = remainder[start_pos:]
            if len(test_portion) >= 2:
                # Check if this could be a size code
                code = test_portion[:2]
                if code in INCH_SIZE_CODES:
                    size_portion = test_portion
                    break
                # Also try single digit
                code = test_portion[:1]
                if code in INCH_SIZE_CODES and len(test_portion) > 1:
                    size_portion = test_portion
                    break
    
    if not size_portion:
        return None
    
    # Try to decode size codes
    # For fittings with two sizes (verloopring, verloopnippel, etc.)
    # The pattern is typically: {size1_code}{size2_code}
    
    # Try different split points to find valid size combinations
    decoded_sizes = []
    
    for split_pos in range(1, min(len(size_portion), 5)):  # Limit search
        code1 = size_portion[:split_pos]
        code2_full = size_portion[split_pos:]
        
        # For code2, try different lengths (might have trailing length digits)
        for code2_len in [3, 2, 1]:
            if len(code2_full) >= code2_len:
                code2 = code2_full[:code2_len]
                
                size1 = INCH_SIZE_CODES.get(code1)
                size2 = INCH_SIZE_CODES.get(code2)
                
                if size1 and size2:
                    remaining = code2_full[code2_len:]
                    decoded_sizes.append((size1, size2, split_pos, remaining))
    
    # For two-size products (verloopring, verloopnippel, wartel), try two-size decoding first
    if is_two_size_product and decoded_sizes:
        # Prefer combinations that use more of the size_portion (less remaining)
        # Then prefer longer first codes
        decoded_sizes.sort(key=lambda x: (len(x[3]), -x[2]))
        best = decoded_sizes[0]
        result["size"] = f"{best[0]} x {best[1]}"
        result["size_1"] = best[0]
        result["size_2"] = best[1]
        if best[3]:  # Remaining digits
            result["sku_suffix"] = best[3]
        result["sku_decoded"] = True
        return result
    
    # For single-size products (nippels, verlengstukken), try single-size with length suffix
    # Pattern: {size_code}{length_digits} where length is 2-3 digits
    for code_len in [2, 1, 3]:  # Prefer 2-digit codes like "12" for 1/2"
        if len(size_portion) >= code_len:
            code = size_portion[:code_len]
            size = INCH_SIZE_CODES.get(code)
            if size:
                remaining = size_portion[code_len:]
                # If remaining looks like a length (2-3 digits), this is likely a single-size product
                if remaining and len(remaining) >= 2 and remaining.isdigit():
                    result["size"] = size
                    result["size_1"] = size
                    result["sku_suffix"] = remaining
                    result["sku_decoded"] = True
                    return result
    
    # If we have two-size combinations but product type is unknown, use if remaining is minimal
    if decoded_sizes:
        decoded_sizes.sort(key=lambda x: (len(x[3]), -x[2]))
        best = decoded_sizes[0]
        # Only use two-size if remaining is empty or very short (not a length code)
        if len(best[3]) <= 1:
            result["size"] = f"{best[0]} x {best[1]}"
            result["size_1"] = best[0]
            result["size_2"] = best[1]
            if best[3]:  # Remaining digits
                result["sku_suffix"] = best[3]
            result["sku_decoded"] = True
            return result
    
    # Fallback: single-size without length requirement
    for code_len in [3, 2, 1]:
        if len(size_portion) >= code_len:
            code = size_portion[:code_len]
            size = INCH_SIZE_CODES.get(code)
            if size:
                result["size"] = size
                result["size_1"] = size
                # Remaining digits might be length or other info
                remaining = size_portion[code_len:]
                if remaining:
                    result["sku_suffix"] = remaining
                result["sku_decoded"] = True
                return result
    
    return None


# Messing fitting SKU prefix to series name mapping
MESSING_SKU_SERIES = {
    # Bochten
    "MF1": "NR 1 - MESSING BOCHT 90°",
    "MF2": "NR 2 - MESSING BOCHT 45°",
    # Nippels
    "MF23": "NR 23 - MESSING PIJPNIPPEL",
    "MF24": "NR 24 - MESSING DUBBELE NIPPEL",
    # Sokken
    "MF9": "NR 9 - MESSING SOK",
    "MF90": "NR 90 - MESSING VERLOOPSOK",
    # Verloopringen/nippels
    "MF241": "NR 241 - MESSING VERLOOPRING",
    "MF245": "NR 245 - MESSING VERLOOPNIPPEL",
    # Verlengstukken
    "MF230": "NR 230 - MESSING KRAANVERLENGSTUK",
    # Wartels
    "MF110": "NR 110 - MESSING WARTEL",
    # T-stukken
    "MF130": "NR 130 - MESSING T-STUK",
    "MF13": "NR 13 - MESSING T-STUK",
    # Pluggen/doppen
    "MF18": "NR 18 - MESSING PLUG",
    "MF12": "NR 12 - MESSING DOP",
    # Kruisstukken
    "MF98": "NR 98 - MESSING KRUISSTUK",
}

# RVS fitting SKU prefix to series name mapping
RVS_SKU_SERIES = {
    "RVS23": "NR 23 - RVS PIJPNIPPEL",
    "RVS24": "NR 24 - RVS DUBBELE NIPPEL",
    "RVS9": "NR 9 - RVS SOK",
    "RVS241": "NR 241 - RVS VERLOOPRING",
    "RVS245": "NR 245 - RVS VERLOOPNIPPEL",
    "RVS110": "NR 110 - RVS WARTEL",
    "RVS130": "NR 130 - RVS T-STUK",
}


def infer_series_from_sku(sku: str, pdf_name: str) -> Optional[Tuple[str, str]]:
    """Infer series name from SKU prefix for messing/rvs fittings.
    
    Args:
        sku: The SKU code (e.g., "MF2411214")
        pdf_name: Source PDF name to determine catalog type
        
    Returns:
        Tuple of (series_id, series_name) or None
    """
    if not sku:
        return None
    
    sku_upper = sku.upper()
    pdf_lower = pdf_name.lower()
    
    # Select appropriate mapping based on PDF
    if "messing" in pdf_lower:
        series_map = MESSING_SKU_SERIES
    elif "rvs" in pdf_lower:
        series_map = RVS_SKU_SERIES
    else:
        return None
    
    # Try progressively shorter prefixes to find a match
    for prefix_len in range(min(len(sku_upper), 6), 1, -1):
        prefix = sku_upper[:prefix_len]
        if prefix in series_map:
            series_name = series_map[prefix]
            series_id = slugify(series_name) or prefix.lower()
            return (series_id, series_name)
    
    return None


def enrich_makita_specific(rec: Dict[str, Any], enriched_ctx: Dict[str, Any]) -> None:
    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()
    if "makita" not in source_pdf:
        return

    # Extract prices from all fields containing € symbol
    # This catches prices in fields like 'prijs_in', 'excl_btw', etc.
    price_excl = None
    price_incl = None
    
    for key, value in rec.items():
        if not isinstance(value, str) or "€" not in value:
            continue
        
        # Parse price using regex
        price_match = re.search(r"€\s*([\d.]+,\d{2})", value)
        if not price_match:
            # Try format with space: "€ 419 ,00"
            price_match = re.search(r"€\s*([\d.]+)\s*,\s*(\d{2})", value)
            if price_match:
                try:
                    price_str = f"{price_match.group(1)},{price_match.group(2)}"
                    price_str = price_str.replace(".", "").replace(",", ".")
                    price = float(price_str)
                except (ValueError, AttributeError):
                    continue
            else:
                continue
        else:
            try:
                price_str = price_match.group(1).replace(".", "").replace(",", ".")
                price = float(price_str)
            except (ValueError, AttributeError):
                continue
        
        key_lower = key.lower()
        value_lower = value.lower()
        
        # Determine if excl or incl BTW
        if "excl" in key_lower or "excl" in value_lower:
            if price_excl is None:
                price_excl = price
        elif "incl" in key_lower or "incl" in value_lower:
            if price_incl is None:
                price_incl = price
        elif "prijs" in key_lower:
            if price_excl is None:
                price_excl = price
        else:
            if price_excl is None:
                price_excl = price
    
    # Set prices on the record
    if price_excl is not None and "price_excl_btw" not in rec:
        rec["price_excl_btw"] = price_excl
        enriched_ctx["price_excl_btw"] = price_excl
    if price_incl is not None and "price_incl_btw" not in rec:
        rec["price_incl_btw"] = price_incl
        enriched_ctx["price_incl_btw"] = price_incl
    
    # Calculate missing price (21% BTW)
    if price_incl and not price_excl:
        calc_excl = round(price_incl / 1.21, 2)
        rec["price_excl_btw"] = calc_excl
        enriched_ctx["price_excl_btw"] = calc_excl
    elif price_excl and not price_incl:
        calc_incl = round(price_excl * 1.21, 2)
        rec["price_incl_btw"] = calc_incl
        enriched_ctx["price_incl_btw"] = calc_incl

    # Extract voltage, power, weight using regex
    all_text = " ".join(str(v) for v in rec.values() if isinstance(v, str))
    
    # Dual voltage: "2 x 18V"
    dual_v_match = re.search(r"(\d+)\s*x\s*(\d+)\s*[Vv]", all_text)
    if dual_v_match and "voltage_v" not in rec:
        count = int(dual_v_match.group(1))
        voltage = int(dual_v_match.group(2))
        rec["voltage_v"] = voltage
        rec["voltage_total_v"] = count * voltage
        enriched_ctx["voltage_v"] = voltage
    else:
        # Single voltage: "18V", "40Vmax"
        v_match = re.search(r"(\d+)\s*[Vv](?:max)?(?:\s|$)", all_text)
        if v_match and "voltage_v" not in rec:
            rec["voltage_v"] = int(v_match.group(1))
            enriched_ctx["voltage_v"] = int(v_match.group(1))
    
    # Weight: "5,4 kg"
    w_match = re.search(r"(\d+(?:[.,]\d+)?)\s*[kK][gG]", all_text)
    if w_match and "weight_kg" not in rec:
        weight_str = w_match.group(1).replace(",", ".")
        rec["weight_kg"] = float(weight_str)
        enriched_ctx["weight_kg"] = float(weight_str)
    
    # Power kW: "1,4 kW"
    kw_match = re.search(r"(\d+(?:[.,]\d+)?)\s*[kK][Ww]", all_text)
    if kw_match and "power_kw" not in rec:
        power_str = kw_match.group(1).replace(",", ".")
        rec["power_kw"] = float(power_str)
        enriched_ctx["power_kw"] = float(power_str)
    
    # Power W: "1400W"
    w_match = re.search(r"(\d+)\s*[Ww](?:att)?(?:\s|$)", all_text)
    if w_match and "power_w" not in rec and "power_kw" not in rec:
        rec["power_w"] = int(w_match.group(1))
        enriched_ctx["power_w"] = int(w_match.group(1))

    # Original makita_ranges logic
    makita_ranges: List[Dict[str, Any]] = []
    pattern = re.compile(r"^(\d+)_v_(\d+)vmax_(\d+)_(\d+)_nm$")

    for key, value in rec.items():
        if not isinstance(key, str) or not isinstance(value, str):
            continue
        if value != "yes":
            continue

        m = pattern.match(key)
        if not m:
            continue

        try:
            v_min = int(m.group(1))
            v_max = int(m.group(2))
            t_min = int(m.group(3))
            t_max = int(m.group(4))
        except ValueError:
            continue

        makita_ranges.append(
            {
                "key": key,
                "voltage": {"min_v": v_min, "max_v": v_max},
                "torque": {"min_nm": t_min, "max_nm": t_max},
                "available": "yes",
            }
        )

    if makita_ranges:
        enriched_ctx["makita_ranges"] = makita_ranges
        
def detect_catalog_group(source_pdf: str) -> Optional[str]:
    n = source_pdf.lower()
    if "abs-persluchtbuizen" in n:
        return "compressed_air"
    if "bronpompen" in n:
        return "well_pumps"
    if "centrifugaalpompen" in n:
        return "centrifugal_pumps"
    if "dompelpompen" in n:
        return "submersible_pumps"
    if "aandrijftechniek" in n:
        return "drive_technology"
    if "kranzle" in n:
        return "pressure_washers"
    if "drukbuizen" in n or "kunststof-afvoerleidingen" in n:
        return "plastic_pipes"
    return None


def detect_product_type(source_pdf: str, category: Optional[str], record: Dict[str, Any]) -> Optional[str]:
    n = source_pdf.lower()
    cat = (category or "").lower()

    if "abs-persluchtbuizen" in n:
        return "compressed_air_pipe"
    if "bronpompen" in n:
        return "well_pump"
    if "centrifugaalpompen" in n:
        return "centrifugal_pump"
    if "dompelpompen" in n:
        kg = str(record.get("korrelgrootte") or "").lower()
        if any(x in kg for x in ["50", "60", "70"]):
            return "sewage_submersible_pump"
        return "submersible_pump"
    if "aandrijftechniek" in n:
        return "drive_bearing"
    if "kranzle" in n:
        return "pressure_washer"
    if "drukbuizen" in n or "kunststof-afvoerleidingen" in n:
        return "plastic_pipe"

    if "pomp" in cat:
        return "pump"
    if "buis" in cat or "leiding" in cat:
        return "pipe"

    return None


def detect_material(source_pdf: str, category: Optional[str]) -> Optional[str]:
    n = source_pdf.lower()
    cat = (category or "").lower()

    if "abs-persluchtbuizen" in n:
        return "ABS"
    if "drukbuizen" in n or "kunststof-afvoerleidingen" in n:
        if "pp" in cat:
            return "PP"
        if "pvc" in cat:
            return "PVC"
        return "PVC"
    if "aandrijftechniek" in n:
        return "steel"
    if "kranzle" in n:
        return None
    if "bronpompen" in n or "centrifugaalpompen" in n or "dompelpompen" in n:
        return None

    if "rvs" in cat:
        return "stainless_steel"
    if "staal" in cat:
        return "steel"

    return None


def detect_sku_series(record: Dict[str, Any]) -> Optional[str]:
    candidates: List[str] = []
    for key in ["bestelnr", "code", "model", "type"]:
        v = record.get(key)
        if isinstance(v, str) and v.strip():
            candidates.append(v.strip())

    for raw in candidates:
        token = raw.split()[0]
        m = re.match(r"([A-Za-z]+)[0-9].*", token)
        if m:
            return m.group(1).lower()

    return None


def enrich_airpress_specific(rec: Dict[str, Any], enriched_ctx: Dict[str, Any]) -> None:
    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()
    if "airpress" not in source_pdf:
        return

    series = None
    intake = None
    volume = None

    code_candidates: List[str] = []
    for key in ["hl_150_24", "code", "model", "type"]:
        v = rec.get(key)
        if isinstance(v, str) and v.strip():
            code_candidates.append(v.strip())

    code_text = " ".join(code_candidates)
    m = re.search(r"\b([a-zA-Z]{1,4})[ _]?([0-9]{2,4})[-_/ ]([0-9]{1,4})\b", code_text)
    if m:
        series = m.group(1).lower()
        try:
            intake = float(m.group(2))
        except ValueError:
            intake = None
        try:
            volume = float(m.group(3))
        except ValueError:
            volume = None

    pressures: List[float] = []
    for _, v in rec.items():
        if not isinstance(v, str):
            continue
        if "bar" in v.lower():
            num_match = re.search(r"([0-9]+(?:,[0-9]+)?)", v)
            if num_match:
                try:
                    pressures.append(float(num_match.group(1).replace(",", ".")))
                except ValueError:
                    pass

    pressure_min = min(pressures) if pressures else None
    pressure_max = max(pressures) if pressures else None

    flows: List[float] = []
    for _, v in rec.items():
        if not isinstance(v, str):
            continue
        if "l/min" in v.lower():
            num_match = re.search(r"([0-9]+(?:,[0-9]+)?)", v)
            if num_match:
                try:
                    flows.append(float(num_match.group(1).replace(",", ".")))
                except ValueError:
                    pass

    flow_output = None
    flow_intake = None
    if flows:
        flows_sorted = sorted(flows)
        flow_output = flows_sorted[0]
        flow_intake = flows_sorted[-1]

    airpress_data: Dict[str, Any] = {}

    if series is not None:
        airpress_data["compressor_series"] = series
    if intake is not None:
        airpress_data["intake_l_min_from_code"] = intake
    if volume is not None:
        airpress_data["tank_volume_l_from_code"] = volume

    if pressure_min is not None:
        airpress_data["pressure_min_bar"] = pressure_min
    if pressure_max is not None:
        airpress_data["pressure_max_bar"] = pressure_max

    if flow_output is not None:
        airpress_data["flow_output_l_min"] = flow_output
    if flow_intake is not None:
        airpress_data["flow_intake_l_min"] = flow_intake

    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        if re.fullmatch(r"[0-9]+[_a-zA-Z]*", k) and v.strip():
            airpress_data.setdefault("sku", v.strip())
            break

    for _, v in rec.items():
        if not isinstance(v, str):
            continue
        if "rpm" in v.lower():
            m_rpm = re.search(r"([0-9]+)", v)
            if m_rpm:
                try:
                    airpress_data.setdefault("rpm", int(m_rpm.group(1)))
                except ValueError:
                    pass
            break

    for _, v in rec.items():
        if not isinstance(v, str):
            continue
        if "db" in v.lower():
            m_db = re.search(r"([0-9]+(?:,[0-9]+)?)", v)
            if m_db:
                try:
                    airpress_data.setdefault("noise_db_a", float(m_db.group(1).replace(",", ".")))
                except ValueError:
                    pass
            break

    for _, v in rec.items():
        if not isinstance(v, str):
            continue
        if "mm" in v.lower() and ("x" in v or "*" in v):
            nums = re.findall(r"[0-9]+(?:,[0-9]+)?", v)
            dims: List[float] = []
            for n in nums[:3]:
                try:
                    dims.append(float(n.replace(",", ".")))
                except ValueError:
                    pass
            if dims:
                airpress_data.setdefault("dimensions_mm", dims)
            break

    weights: List[float] = []
    for _, v in rec.items():
        if not isinstance(v, str):
            continue
        if "kg" in v.lower():
            m_kg = re.search(r"([0-9]+(?:,[0-9]+)?)", v)
            if m_kg:
                try:
                    weights.append(float(m_kg.group(1).replace(",", ".")))
                except ValueError:
                    pass
    if weights:
        w_min = min(weights)
        w_max = max(weights)
        airpress_data.setdefault("weight_empty_kg", w_min)
        airpress_data.setdefault("weight_full_kg", w_max)

    if airpress_data:
        enriched_ctx["airpress"] = airpress_data


def enrich_bronpompen(rec: Dict[str, Any], enriched_ctx: Dict[str, Any]) -> None:
    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()
    if "bronpompen" not in source_pdf:
        return

    variation: Dict[str, Any] = {}

    variation["type"] = rec.get("type")
    variation["nominal_diameter_inch"] = "3"

    motors: Dict[str, Any] = {}
    mv_230 = rec.get("motor_voltage_230")
    mv_400 = rec.get("motor_voltage_400")
    if mv_230:
        motors["3x230V"] = mv_230
    if mv_400:
        motors["3x400V"] = mv_400
    if motors:
        variation["motors"] = motors

    def to_float(val: Any) -> Optional[float]:
        if isinstance(val, str):
            try:
                return float(val.replace(",", "."))
            except ValueError:
                return None
        if isinstance(val, (int, float)):
            return float(val)
        return None

    variation["power_kw"] = to_float(rec.get("vermogen_kw"))
    variation["flow_rate_m3h"] = to_float(rec.get("debiet_m3_h"))
    variation["head_m"] = to_float(rec.get("opvoerhoogte_m"))

    conn = rec.get("aan_sluiting") or rec.get("aansluiting")
    if isinstance(conn, str):
        variation["connection_inch"] = conn.replace("\"", "").replace("”", "").strip()

    pump_dia = rec.get("pomp_dia_mm")
    if isinstance(pump_dia, str):
        m = re.search(r"([0-9]+(?:,[0-9]+)?)", pump_dia)
        if m:
            try:
                variation["pump_diameter_mm"] = float(m.group(1).replace(",", "."))
            except ValueError:
                pass

    enriched_ctx["bronpomp_variation"] = variation


def enrich_drive_technology(rec: Dict[str, Any], enriched_ctx: Dict[str, Any]) -> None:
    """Attach a lagerblok variation object for drive-technology bearing blocks.

    Target shape matches the provided product_series.variations example,
    as far as fields are available in the extracted JSON.
    """

    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()
    if "catalogus-aandrijftechniek" not in source_pdf:
        return

    variation: Dict[str, Any] = {}

    # Inner diameter (bore) in mm
    inner_dia = rec.get("binnendiameter_mm")
    if isinstance(inner_dia, str) and inner_dia.strip():
        try:
            variation["inner_diameter_mm"] = float(inner_dia.replace(",", "."))
        except ValueError:
            pass

    # Housing unit, e.g. from 'lagerhuis_p204' column
    housing_unit = None
    for k, v in rec.items():
        if not isinstance(k, str):
            continue
        if not isinstance(v, str):
            continue
        if k.startswith("lagerhuis") and v.strip():
            housing_unit = v.strip()
            break
    if housing_unit is not None:
        variation["housing_unit"] = housing_unit

    # Insert bearing code, look for UC* style codes if present
    insert_bearing = None
    for k, v in rec.items():
        if not isinstance(v, str):
            continue
        if re.search(r"\bUC[0-9]{3}.*", v):
            insert_bearing = v.strip()
            break
    if insert_bearing is not None:
        variation["insert_bearing"] = insert_bearing

    # Product code: if we ever add a code/SKU field for this table, surface it here.
    # For now, derive a simple code from housing_unit + inner diameter if both exist.
    if housing_unit is not None and "inner_diameter_mm" in variation:
        variation["product_code"] = f"{housing_unit}-{int(variation['inner_diameter_mm'])}"

    if variation:
        enriched_ctx["lagerblok_variation"] = variation


def enrich_black_fittings(rec: Dict[str, Any], enriched_ctx: Dict[str, Any]) -> None:
    """Decode zwarte-draad-en-lasfittingen SKU keys like 7ZF9012.

    Example: 7ZF9012 -> angle 90 deg, size_code "12" which corresponds
    to 1/2" from the size column.
    """

    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()
    if "zwarte-draad-en-lasfittingen" not in source_pdf:
        return

    sku_key: Optional[str] = None
    for k in rec.keys():
        if not isinstance(k, str):
            continue
        # Heuristic: these keys are all starting with '7' and then letters/digits
        if re.fullmatch(r"7[0-9A-Za-z]+", k):
            sku_key = k
            break

    if not sku_key:
        return

    sku = sku_key.upper()

    angle_deg: Optional[int] = None
    m_angle = re.search(r"(45|90|180)", sku)
    if m_angle:
        try:
            angle_deg = int(m_angle.group(1))
        except ValueError:
            angle_deg = None

    size_code: Optional[str] = None
    m_code = re.search(r"(\d{2})$", sku)
    if m_code:
        size_code = m_code.group(1)

    size_inch: Optional[str] = None
    # Prefer explicit size text from maat/maten columns, e.g. 1/2" or 2 1/2".
    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        key = k.lower()
        if "maat" in key or "maten" in key:
            txt = v.strip()
            if txt:
                size_inch = txt
                size_inch_value = parse_inch_size(txt)
                break

    black_fitting: Dict[str, Any] = {}
    black_fitting["sku_key"] = sku_key
    if angle_deg is not None:
        black_fitting["angle_deg"] = angle_deg
    if size_code is not None:
        black_fitting["size_code"] = size_code
    if size_inch is not None:
        black_fitting["size_inch"] = size_inch

    if black_fitting:
        enriched_ctx["black_fitting"] = black_fitting


def enrich_galvanized_pipes(rec: Dict[str, Any], enriched_ctx: Dict[str, Any]) -> None:
    """Enrich verzinkte-buizen rows with decoded SKU and dimensions.

    Examples:
    - Header/column codes like GB38 or ZF118 map to SKUs, while the actual
      inch size is given in maat_* columns (e.g. 3/8", 1/8").
    """

    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()
    if "verzinkte-buizen" not in source_pdf:
        return

    # SKU code: look for cell values like GB34, GB2, ZF118, etc.
    sku_code: Optional[str] = None
    for k, v in rec.items():
        if not isinstance(v, str):
            continue
        if re.fullmatch(r"[A-Za-z]{2,4}[0-9]{1,4}", v.strip()):
            sku_code = v.strip().upper()
            break

    # If not found in values, fall back to header-like keys such as gb38.
    if not sku_code:
        for k in rec.keys():
            if not isinstance(k, str):
                continue
            if re.fullmatch(r"[a-z]{2,4}[0-9]{1,4}", k):
                sku_code = k.upper()
                break

    # Size in inches from maat_* columns, e.g. 3/8", 1/2", 2 1/2".
    size_inch: Optional[str] = None
    size_inch_value: Optional[float] = None
    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        if "maat" in k.lower():
            txt = v.strip()
            if txt:
                size_inch = txt
                break

    # Wall thickness in mm from wanddikte_*_mm if present.
    wall_thickness_mm: Optional[float] = None
    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        if "wanddikte" in k.lower():
            m = re.search(r"([0-9]+(?:,[0-9]+)?)", v)
            if m:
                try:
                    wall_thickness_mm = float(m.group(1).replace(",", "."))
                except ValueError:
                    wall_thickness_mm = None
            break

    # Length in meters from *_m fields like 6_m = "6 m".
    length_m: Optional[float] = None
    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        if k.endswith("_m"):
            m = re.search(r"([0-9]+(?:,[0-9]+)?)\s*m\b", v.lower())
            if m:
                try:
                    length_m = float(m.group(1).replace(",", "."))
                except ValueError:
                    length_m = None
            break

    # For threaded nipples etc., there are columns like 40_mm with the
    # actual physical length.
    length_mm: Optional[float] = None
    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        if k.lower().endswith("_mm") and "wanddikte" not in k.lower():
            m = re.search(r"([0-9]+(?:,[0-9]+)?)", v)
            if m:
                try:
                    length_mm = float(m.group(1).replace(",", "."))
                except ValueError:
                    length_mm = None
            break

    galvanized: Dict[str, Any] = {}
    if sku_code:
        galvanized["sku_code"] = sku_code
    if size_inch:
        galvanized["size_inch"] = size_inch
    if size_inch_value is not None:
        galvanized["size_inch_value"] = size_inch_value
    if wall_thickness_mm is not None:
        galvanized["wall_thickness_mm"] = wall_thickness_mm
    if length_m is not None:
        galvanized["length_m"] = length_m
    if length_mm is not None:
        galvanized["length_mm"] = length_mm

    if galvanized:
        enriched_ctx["galvanized_piece"] = galvanized


def enrich_airpress_nl_fr(rec: Dict[str, Any], enriched_ctx: Dict[str, Any]) -> None:
    """Parse section-level metadata from Airpress NL-FR catalog text blocks.

    We extract:
    - page_ref: numeric page reference in the text (e.g. 23, 26)
    - titles_line: first non-empty, non-numeric line (multi-language title)
    - series_line: last non-empty, non-numeric line (multi-language series description)
    - series_code: single-letter series identifier from series_line (e.g. G, K)
    """

    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()
    if "airpress-catalogus-nl-fr" not in source_pdf:
        return

    text: Optional[str] = None
    for k, v in rec.items():
        if not isinstance(k, str):
            continue
        if k.startswith("zuigercompressoren_") and isinstance(v, str) and v.strip():
            text = v
            break

    if not text:
        return

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    page_ref: Optional[int] = None
    titles_line: Optional[str] = None
    series_line: Optional[str] = None

    # Detect page_ref as the first line that is purely numeric
    for ln in lines:
        if re.fullmatch(r"\d+", ln):
            try:
                page_ref = int(ln)
            except ValueError:
                page_ref = None
            break

    # Titles: first non-numeric line
    for ln in lines:
        if not re.fullmatch(r"\d+", ln):
            titles_line = ln
            break

    # Series line: last non-numeric line (if different from titles)
    for ln in reversed(lines):
        if not re.fullmatch(r"\d+", ln):
            series_line = ln
            break

    series_code: Optional[str] = None
    if series_line:
        m = re.search(r"[Ss]erie\s+([A-Z])\b", series_line)
        if m:
            series_code = m.group(1)

    section: Dict[str, Any] = {}
    if page_ref is not None:
        section["page_ref"] = page_ref
    if titles_line is not None:
        section["titles_line"] = titles_line
    if series_line is not None:
        section["series_line"] = series_line
    if series_code is not None:
        section["series_code"] = series_code

    if section:
        enriched_ctx["airpress_section"] = section


def build_family_id(
    catalog_group: Optional[str],
    product_type: Optional[str],
    series: Optional[str],
    record: Dict[str, Any],
) -> Optional[str]:
    if not product_type:
        return None

    key_parts: List[str] = []
    if catalog_group:
        key_parts.append(catalog_group)
    key_parts.append(product_type)
    if series:
        key_parts.append(series)

    if catalog_group in {"compressed_air", "plastic_pipes"}:
        maat = str(record.get("maat") or "").strip()
        wand = str(record.get("wanddikte") or "").strip()
        if maat:
            key_parts.append(maat)
        if wand:
            key_parts.append(f"wd-{wand}")

    elif catalog_group in {"well_pumps", "centrifugal_pumps", "submersible_pumps"}:
        t = str(record.get("type") or "").strip()
        vermogen = str(record.get("vermogen_kw") or "").strip()
        if t:
            key_parts.append(t)
        if vermogen:
            key_parts.append(f"p-{vermogen}")

    elif catalog_group == "drive_technology":
        code = str(record.get("code") or "").strip()
        binnendia = str(record.get("binnendiameter_mm") or "").strip()
        buitendia = str(record.get("buitendiameter_mm") or "").strip()
        if code:
            key_parts.append(code)
        if binnendia and buitendia:
            key_parts.append(f"{binnendia}x{buitendia}")

    elif catalog_group == "pressure_washers":
        model = str(record.get("model") or record.get("type") or "").strip()
        if model:
            key_parts.append(model)

    bestelnr = str(record.get("bestelnr") or "").strip()
    if bestelnr:
        key_parts.append(bestelnr.split(" ")[0])

    base = "-".join(slugify(p) or "x" for p in key_parts if p)
    if not base:
        return None

    digest = md5("|".join(key_parts).encode("utf-8")).hexdigest()[:6]
    return f"{base}-{digest}"


def enrich_record(rec: Dict[str, Any]) -> Dict[str, Any]:
    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "")
    category = ctx.get("category")

    catalog_group = detect_catalog_group(source_pdf)

    # Default: use detected category as series label, but for centrifugal pumps
    # the header row often contains a generic word like 'VARIATIES'. In that
    # case, fall back to a more meaningful series name based on the catalog.
    series_raw = category
    if catalog_group == "centrifugal_pumps":
        if not series_raw or str(series_raw).strip().upper() == "VARIATIES":
            series_raw = "centrifugaal pompen"

    series = slugify(series_raw) if series_raw else None
    product_type = detect_product_type(source_pdf, category, rec)
    material = detect_material(source_pdf, category)
    family_id = build_family_id(catalog_group, product_type, series, rec)
    sku_series = detect_sku_series(rec)

    diameter_mm: Optional[float] = None
    length_m: Optional[float] = None
    if catalog_group in {"compressed_air", "plastic_pipes"}:
        maat_val = rec.get("maat")
        if isinstance(maat_val, str):
            m = re.search(r"([0-9]+(?:,[0-9]+)?)\s*mm", maat_val.lower())
            if m:
                try:
                    diameter_mm = float(m.group(1).replace(",", "."))
                except ValueError:
                    diameter_mm = None

        lengte_val = rec.get("lengte")
        if isinstance(lengte_val, str):
            m_len = re.search(r"([0-9]+(?:,[0-9]+)?)\s*m\b", lengte_val.lower())
            if m_len:
                try:
                    length_m = float(m_len.group(1).replace(",", "."))
                except ValueError:
                    length_m = None

        if length_m is None:
            for k, v in rec.items():
                if not isinstance(v, str) or not isinstance(k, str):
                    continue
                if k.endswith("_m") or "lengte" in k.lower():
                    m_len = re.search(r"([0-9]+(?:,[0-9]+)?)\s*m\b", v.lower())
                    if m_len:
                        try:
                            length_m = float(m_len.group(1).replace(",", "."))
                            break
                        except ValueError:
                            length_m = None

    enriched_ctx = EnrichedContext(
        series_raw=series_raw,
        series=series,
        catalog_group=catalog_group,
        product_type=product_type,
        material=material,
        family_id=family_id,
        sku_series=sku_series,
    )

    enriched_dict = asdict(enriched_ctx)
    if diameter_mm is not None:
        enriched_dict["diameter_mm"] = diameter_mm
    if length_m is not None:
        enriched_dict["length_m"] = length_m

    enrich_airpress_specific(rec, enriched_dict)
    enrich_makita_specific(rec, enriched_dict)

    enrich_bronpompen(rec, enriched_dict)
    enrich_drive_technology(rec, enriched_dict)
    enrich_black_fittings(rec, enriched_dict)
    enrich_galvanized_pipes(rec, enriched_dict)
    enrich_airpress_nl_fr(rec, enriched_dict)

    rec["_enriched"] = enriched_dict
    return rec


# ============================================================================
# SKU PATTERNS - Consolidated patterns for all PDF types
# ============================================================================

# Patterns that indicate a value is NOT an SKU (contains units/measurements)
NON_SKU_PATTERNS = re.compile(
    r"(?i)"
    r"(\d+\s*[Ll]\b)"              # Liters: "200 L", "1000L"
    r"|(\d+\s*bar\b)"              # Pressure: "16 bar"
    r"|(Ø\s*\d+)"                  # Diameter: "Ø 446", "Ø1100"
    r"|(\d+\s*mm\b)"               # Millimeters: "1440 mm", "350 mm"
    r"|(\d+[,.]?\d*\s*kg\b)"       # Weight: "60 kg", "13,5 kg"
    r"|([+-]?\d+\s*°C)"            # Temperature: "-40 °C", "3 °C"
    r"|(\d+\s*/\s*min)"            # Flow rate: "L/min", "m³/min"
    r"|(\d+\s*/\s*hour)"           # Hourly rate: "m³/hour"
    r"|(\d+\s*[Vv]\s*/\s*\d+)"     # Voltage: "230V / 50 Hz"
    r"|(\d+/\d+\")"                # Inch fractions: "3/8\"", "1/2\""
    r"|(\d+\s*['\"])"              # Inch notation: "1\"", "2'"
    r"|(R\d{3}[a-z]?)"             # Refrigerant: "R134a", "R404a"
    r"|(\d+\s*x\s*\d+\s*x\s*\d+)"  # Dimensions: "350 x 500 x 450"
)

# Alias for backward compatibility
AIRPRESS_NON_SKU_PATTERNS = NON_SKU_PATTERNS

# SKU patterns by PDF type
SKU_PATTERNS = {
    # Airpress: 5-10 digit numeric, with optional suffixes
    "airpress": re.compile(
        r"^(?:"
        r"\d{5,10}"                   # Pure numeric: 36094, 390006, 4311552
        r"|\d{5,10}[-/][A-Za-z0-9.]+" # With suffix: 450110-P, 45202/1.5
        r"|\d{2}[A-Z]{2,3}\d{6}"      # Letter-in-middle: 43ES071101, 43ESI071101
        r"|\d[A-Z]\d{4}"              # Short letter-in-middle: 9C0652
        r"|\d{5}-[A-Z]{2,}\d*"        # With letter suffix: 12002-OFAG2
        r"|\d{4,10}[A-Z]{0,2}"        # Numeric with optional letters: 45134, 2506FA
        r")$"
    ),
    # Bronpompen: 8-digit numeric codes
    "bronpompen": re.compile(r"^\d{8}$"),
    # Drukbuizen/Kunststof: 2-3 letter prefix + 5-7 digits (DB050075, PF12345)
    "drukbuizen": re.compile(r"^[A-Z]{2,3}\d{5,7}$"),
    # Centrifugaalpompen/Dompelpompen: Type names as identifiers
    "pumps": re.compile(r"^[A-Z]{2,}[\s-]?\d+.*$"),
}

# Alias for backward compatibility
AIRPRESS_SKU_PATTERN = SKU_PATTERNS["airpress"]


def is_valid_sku(value: Optional[str], pdf_type: str = "airpress") -> bool:
    """Check if a cell value looks like a valid SKU for the given PDF type.
    
    Args:
        value: The cell value to check
        pdf_type: One of 'airpress', 'bronpompen', 'drukbuizen', 'pumps'
    
    Returns:
        True if the value matches the SKU pattern for the PDF type
    """
    if not value or not isinstance(value, str):
        return False
    v = value.strip()
    if not v:
        return False
    # Must not contain unit patterns
    if NON_SKU_PATTERNS.search(v):
        return False
    # Must match SKU pattern for this PDF type
    pattern = SKU_PATTERNS.get(pdf_type, SKU_PATTERNS["airpress"])
    return bool(pattern.match(v))


def is_airpress_sku_value(value: Optional[str]) -> bool:
    """Check if a cell value looks like an Airpress SKU/bestelnr."""
    if not value or not isinstance(value, str):
        return False
    v = value.strip()
    if not v:
        return False
    # Must not contain unit patterns
    if AIRPRESS_NON_SKU_PATTERNS.search(v):
        return False
    # Must match SKU pattern
    return bool(AIRPRESS_SKU_PATTERN.match(v))


def detect_airpress_sku_column(header: List[str], sample_rows: List[DataRow]) -> Optional[int]:
    """Detect which column contains SKU/bestelnr in Airpress tables.
    
    The SKU column has an icon header (empty/unrecognized text) and contains
    values that match SKU patterns without unit indicators.
    
    Returns the column index or None if not detected.
    """
    if not sample_rows:
        return None
    
    candidates: List[int] = []
    
    for col_idx, h in enumerate(header):
        # Header should be empty, very short, or contain only symbols/icons
        h_clean = h.strip() if h else ""
        # Skip columns with clear header text containing units
        if any(unit in h_clean.lower() for unit in ["bar", "mm", "kg", "l/min", "°c", "volt"]):
            continue
        # Skip columns with diameter symbol
        if "Ø" in h_clean or "ø" in h_clean:
            continue
        
        # Check if column data looks like SKUs
        sku_matches = 0
        non_sku_matches = 0
        
        for row in sample_rows[:10]:  # Check first 10 rows
            if col_idx >= len(row):
                continue
            cell = row[col_idx]
            if cell is None:
                continue
            cell_str = str(cell).strip()
            if not cell_str:
                continue
            
            if is_airpress_sku_value(cell_str):
                sku_matches += 1
            elif AIRPRESS_NON_SKU_PATTERNS.search(cell_str):
                non_sku_matches += 1
        
        # Column is a candidate if most values look like SKUs
        if sku_matches >= 2 and sku_matches > non_sku_matches:
            candidates.append((col_idx, sku_matches))
    
    if not candidates:
        return None
    
    # Return the column with most SKU matches
    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[0][0]


def normalize_header_cell(cell: Optional[str]) -> str:
    if cell is None:
        return ""
    text = str(cell).replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def merge_header_rows(header_rows: Sequence[HeaderRow]) -> List[str]:
    """Merge multi-line headers into single strings per column.

    Example: ["Opv.", "hoogte m"] -> "Opv. hoogte m".
    """
    if not header_rows:
        return []

    max_cols = max(len(r) for r in header_rows)
    merged: List[str] = []

    for col_idx in range(max_cols):
        parts: List[str] = []
        for row in header_rows:
            if col_idx < len(row) and row[col_idx] not in (None, ""):
                parts.append(normalize_header_cell(row[col_idx]))
        merged.append(" ".join(p for p in parts if p))

    return merged


def filter_empty_rows(rows: Sequence[DataRow]) -> List[DataRow]:
    filtered: List[DataRow] = []
    for row in rows:
        if not row:
            continue
        if all((c is None) or (str(c).strip() == "") for c in row):
            continue
        filtered.append(row)
    return filtered


def clean_row(row: DataRow) -> DataRow:
    return [str(c).strip() if c is not None else None for c in row]


def slugify_header(h: str) -> str:
    h = h.strip().lower()
    h = h.replace("/", " ")
    h = re.sub(r"[^a-z0-9]+", "_", h)
    h = re.sub(r"_+", "_", h).strip("_")
    return h


def infer_pomp_specials_key_from_value(
    value: Any,
    already: Dict[str, Any],
) -> Optional[str]:
    """Infer a stable field key from a cell value (pomp-specials only).

    This is used when the table header is missing/garbled and we only have col_N placeholders.
    We infer the semantic meaning based on units/patterns.
    """

    if value is None:
        return None
    s = value.strip() if isinstance(value, str) else str(value).strip()
    if not s:
        return None

    s_norm = re.sub(r"\s+", " ", s).strip()
    s_up = s_norm.upper()

    # DN connections
    if re.fullmatch(r"DN\s*\d+", s_up):
        if "aanzuig_dn" not in already:
            return "aanzuig_dn"
        if "steek_dn" not in already:
            return "steek_dn"
        return "dn"

    # Weight
    if re.search(r"\bkg\b", s_norm, re.IGNORECASE):
        return "weight_kg"

    # RPM
    if re.search(r"\brpm\b", s_norm, re.IGNORECASE):
        return "rpm"

    # Power
    if re.search(r"\bk\s*w\b|\bkw\b", s_norm, re.IGNORECASE):
        return "vermogen_kw"
    if re.search(r"\bpk\b", s_norm, re.IGNORECASE):
        return "vermogen_pk"

    # Voltage / current
    if re.search(r"\b\d+\s*x\s*\d+\s*v\b", s_norm, re.IGNORECASE) or re.search(r"\b\d+\s*v\b", s_norm, re.IGNORECASE):
        return "spanning_v"
    if re.search(r"\b\d+[\.,]?\d*\s*a\b", s_norm, re.IGNORECASE):
        return "stroom_a"

    # Flow
    if re.search(r"m\s*3\s*/\s*h|m³\s*/\s*h|m3\s*/\s*h", s_norm, re.IGNORECASE):
        return "debiet_m3_h"
    if re.search(r"\bl\s*/\s*min\b|\bl/min\b", s_norm, re.IGNORECASE):
        return "debiet_l_min"
    if re.search(r"\bl\s*/\s*u\b|\bl/u\b", s_norm, re.IGNORECASE):
        return "debiet_l_u"

    # Dimensions / diameters
    if re.search(r"\bmm\b", s_norm, re.IGNORECASE):
        # Heuristic: first mm value tends to be connection/diameter; second may be pump diameter.
        if "aansluiting" not in already:
            return "aansluiting_mm"
        if "pomp_dia_mm" not in already:
            return "pomp_dia_mm"
        return "dimensions_mm"

    # Heights / depths in meters
    if re.search(r"\b\d+[\.,]?\d*\s*m\b", s_norm, re.IGNORECASE):
        # If opvoerhoogte already exists, treat as suction depth.
        if "opvoerhoogte_m" not in already:
            return "opvoerhoogte_m"
        if "aanzuigdiepte_m" not in already:
            return "aanzuigdiepte_m"
        return "length_m"

    # Fuel types
    if s_up in {"BENZINE", "DIESEL"}:
        return "brandstof"

    return None


def parse_boolean(value: Optional[str]) -> Optional[bool]:
    if value is None:
        return None
    v = value.strip().lower()
    if v in {"ja", "yes", "y", "true", "1"}:
        return True
    if v in {"nee", "no", "n", "false", "0"}:
        return False
    return None


def parse_range(value: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    if not value:
        return None, None
    text = value.replace(",", ".")
    # Match patterns like "0.6 - 4.8" or "35-61"
    m = re.match(r"\s*([0-9]*\.?[0-9]+)\s*[-–]\s*([0-9]*\.?[0-9]+)\s*", text)
    if not m:
        return None, None
    try:
        return float(m.group(1)), float(m.group(2))
    except ValueError:
        return None, None


def parse_inch_size(value: Optional[str]) -> Optional[float]:
    """Parse sizes like 1/2", 2 1/2", 3" into a numeric inch value.

    Returns None if the format cannot be parsed.
    """

    if not value:
        return None
    text = str(value).strip().replace("\u201d", '"').replace("\u201c", '"')
    text = text.replace("\"", "").strip()
    if not text:
        return None

    total = 0.0
    for part in text.split():
        part = part.strip()
        if not part:
            continue
        if "/" in part:
            num, _, den = part.partition("/")
            try:
                n = float(num)
                d = float(den)
                if d != 0:
                    total += n / d
            except ValueError:
                return None
        else:
            try:
                total += float(part)
            except ValueError:
                return None

    return total if total > 0 else None


def is_bold_font(fontname: str) -> bool:
    fname = fontname.lower()
    return "bold" in fname or "bd" in fname


def detect_row_bold(page: pdfplumber.page.Page, row_bbox: Tuple[float, float, float, float]) -> bool:
    """Heuristic: if any char in this bbox uses a bold-ish font, mark in_stock=True."""
    x0, top, x1, bottom = row_bbox
    chars = page.within_bbox((x0, top, x1, bottom)).chars
    for ch in chars:
        fontname = ch.get("fontname") or ""
        if is_bold_font(fontname):
            return True
    return False


def extract_category_above_table(page: pdfplumber.page.Page, table_bbox: Tuple[float, float, float, float]) -> Tuple[Optional[str], Optional[str]]:
    x0, top, x1, _ = table_bbox
    # Clamp search region to page bounds to avoid pdfplumber bbox errors
    page_x0, page_top, page_x1, page_bottom = page.bbox
    search_top = max(page_top, top - 50)
    search_x0 = max(page_x0, x0 - 10)
    search_x1 = min(page_x1, x1 + 10)
    if search_x0 >= search_x1 or search_top >= top:
        return None, None
    # Slightly widen horizontally, but stay within page
    words = page.within_bbox((search_x0, search_top, search_x1, top)).extract_words()
    if not words:
        return None, None
    # Group words by their vertical line; use first line as header and last as application
    lines: Dict[int, List[str]] = {}
    for w in words:
        key = int(round(w["top"]))
        lines.setdefault(key, []).append(w["text"])
    if not lines:
        return None, None

    line_keys = sorted(lines.keys())
    first_line_key = line_keys[0]
    last_line_key = line_keys[-1]

    header_text = " ".join(lines[first_line_key])
    header_text = re.sub(r"\s+", " ", header_text).strip()
    application_text = " ".join(lines[last_line_key])
    application_text = re.sub(r"\s+", " ", application_text).strip()

    return (header_text or None, application_text or None)


def extract_product_specs_above_table(page: pdfplumber.page.Page, table_bbox: Tuple[float, float, float, float]) -> Dict[str, str]:
    """Extract product-level specs from the text block above/beside the table.

    These are key-value pairs like:
    - Omgevingstemperatuur: maximum 50°C
    - Maximum bedrijfsdruk: NVT
    - Vervuilingsgraad water: NVT
    - Toepassing: schakelkast voor monofasige onderwaterpompen
    - Behuizing: thermoplastisch
    - Beschermingsgraad: IP50

    Returns a dict of slugified keys to values.
    """
    x0, top, x1, _ = table_bbox
    page_x0, page_top, page_x1, page_bottom = page.bbox

    # Look at a larger region above the table (up to 250 pixels)
    search_top = max(page_top, top - 250)
    search_x0 = max(page_x0, 0)
    search_x1 = min(page_x1, page.width)

    if search_x0 >= search_x1 or search_top >= top:
        return {}

    text = page.within_bbox((search_x0, search_top, search_x1, top)).extract_text()
    if not text:
        return {}

    specs: Dict[str, str] = {}

    # Known spec labels to look for
    spec_patterns = [
        # Temperature
        (r"[Oo]mgevingstemperatuur\s*[:\-]?\s*(.+)", "max_temp"),
        (r"[Tt]emperatuurbereik\s+vloeistof\s*[:\-]?\s*(.+)", "liquid_temp_range"),
        (r"[Tt]emperatuurbereik\s*[:\-]?\s*(.+)", "temp_range"),
        # Pressure / water
        (r"[Mm]aximum\s+bedrijfsdruk\s*[:\-]?\s*(.+)", "max_pressure"),
        (r"[Vv]ervuilingsgraad\s+water\s*[:\-]?\s*(.+)", "water_pollution"),
        # Application / type
        (r"[Tt]oepassing\s*[:\-]?\s*(.+)", "application_desc"),
        (r"[Tt]ype\s*[:\-]?\s*(.+)", "product_type"),
        # Housing / material
        (r"[Bb]ehuizing\s*[:\-]?\s*(.+)", "housing"),
        (r"[Bb]eschermingsgraad\s*[:\-]?\s*(.+)", "protection_class"),
        (r"[Mm]ateriaal\s+waaier\s*[:\-]?\s*(.+)", "impeller_material"),
        (r"[Mm]ateriaal\s+lagerblok\s*[:\-]?\s*(.+)", "bearing_block_material"),
        (r"[Mm]ateriaal\s*[:\-]?\s*(.+)", "material"),
        # Manufacturer / series
        (r"[Ff]abrikant\s*[:\-]?\s*(.+)", "manufacturer"),
        (r"[Pp]roductreeks\s+fabrikant\s+lagerhuis\s*[:\-]?\s*(.+)", "housing_series"),
        (r"[Pp]roductreeks\s+fabrikant\s+lager\s*[:\-]?\s*(.+)", "bearing_series"),
        # Mounting
        (r"[Aa]sbevestiging\s*[:\-]?\s*(.+)", "shaft_mounting"),
    ]

    # Known brands to detect in text (often in title or as standalone text)
    known_brands = ["NTN", "DAB", "Rovatti", "Kranzle", "Kränzle", "Makita", "Airpress", "Pedrollo", "Grundfos", "Wilo", "Flotec", "Ebara", "Calpeda", "Lowara", "Bauer", "Georg Fischer", "GF", "Dema", "Firehose", "SDMO", "Börger", "Borger", "Honda", "FK", "Walterscheid"]
    for brand in known_brands:
        if re.search(rf"\b{brand}\b", text, re.IGNORECASE):
            specs["brand"] = brand
            break

    for pattern, key in spec_patterns:
        m = re.search(pattern, text)
        if m:
            value = m.group(1).strip()
            # Clean up: take only up to newline or next label
            value = re.split(r"\n|[A-Z][a-z]+\s*:", value)[0].strip()
            if value and value.lower() != "nvt":
                specs[key] = value
    
    # Extract product title patterns (for PDFs without key:value format)
    # These are typically in ALL CAPS or Title Case at the start of text blocks
    title_patterns = [
        # PVC products: "PVC DRUKBUIS PN7,5", "PVC-U DRUKBUIS", etc.
        (r"(PVC[-\s]?U?\s+[A-Z]+(?:\s+PN[\d,\.]+)?)", "product_title"),
        # PE products: "PE BUIS SDR11", "PE100 BUIS", etc.
        (r"(PE\d*\s+[A-Z]+(?:\s+SDR\d+)?)", "product_title"),
        # ABS products: "ABS PERSLUCHTBUIS", etc.
        (r"(ABS\s+[A-Z]+)", "product_title"),
        # RVS/Messing fittings: "RVS DRAADFITTING", "MESSING FITTING", etc.
        (r"((?:RVS|MESSING|VERZINKT)\s+[A-Z]+)", "product_title"),
        # Generic product series with PN rating
        (r"([A-Z]{2,}\s+[A-Z]+\s+PN[\d,\.]+)", "product_title"),
    ]
    
    for pattern, key in title_patterns:
        m = re.search(pattern, text)
        if m and key not in specs:
            specs[key] = m.group(1).strip()
    
    # Extract subtitle/variant info (e.g., "LIJMMOF - GLAD", "MET FLENS")
    subtitle_patterns = [
        (r"(LIJMMOF\s*[-–]\s*\w+)", "product_variant"),
        (r"(MET\s+\w+)", "product_variant"),
        (r"(ZONDER\s+\w+)", "product_variant"),
        (r"(BINNENDRAAD|BUITENDRAAD)", "thread_type"),
    ]
    
    for pattern, key in subtitle_patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m and key not in specs:
            specs[key] = m.group(1).strip()

    return specs


def normalize_sku_from_bestelnr(rec: Dict[str, Any]) -> None:
    """Normalize bestelnr / order_number / code fields to a canonical 'sku' field.

    Across PDFs, the first column is often named 'bestelnr', 'order_number',
    'code', 'artikelnr', or similar. This helper copies that value to 'sku'
    so downstream consumers have a consistent field name.

    For Makita PDFs, the SKU is often in _context.category (e.g. 'B-28606')
    or _context.application (model codes like 'DLM330Z').
    """

    if rec.get("sku"):
        # Already has an explicit sku, nothing to do.
        return

    ctx = rec.get("_context") or {}
    source_pdf = str(ctx.get("source_pdf") or "").lower()

    # Makita-specific: SKU from category or application
    if "makita" in source_pdf:
        category = str(ctx.get("category") or "")
        application = str(ctx.get("application") or "")

        # Category often contains a product code like B-28606
        if category and re.match(r"^[A-Z]-?\d+", category.upper()):
            rec["sku"] = category.strip()
            return

        # Application contains model codes like "DLM330Z DLM330SM" - take the first
        if application:
            models = application.split()
            for model in models:
                model = model.strip()
                # Makita model codes typically start with letters and have digits
                if model and re.match(r"^[A-Z]{2,}[0-9]", model.upper()):
                    rec["sku"] = model
                    return

    # Check enriched data for SKU (e.g. airpress.sku)
    enr = rec.get("_enriched") or {}
    if isinstance(enr, dict):
        # Airpress compressors have SKU in _enriched.airpress.sku
        airpress = enr.get("airpress") or {}
        if isinstance(airpress, dict):
            airpress_sku = airpress.get("sku")
            if isinstance(airpress_sku, str) and airpress_sku.strip():
                rec["sku"] = airpress_sku.strip()
                return

    # Priority order for SKU-like fields (generic)
    sku_candidates = ["bestelnr", "order_number", "artikelnr", "code", "col_0"]

    for key in sku_candidates:
        val = rec.get(key)
        if isinstance(val, str) and val.strip():
            rec["sku"] = val.strip()
            return


def extract_angle_from_context(rec: Dict[str, Any]) -> None:
    """Extract angle property from series name, SKU, or application text.
    
    Common patterns:
    - Series name: "BOCHT 90°", "KNIE 45°", "T-STUK 90°", "LASBOCHT 90°"
    - SKU suffix: ABSB02090 (ends in 90), LF1201 (45° knie)
    - Application: "90° elbow", "45 graden"
    """
    if rec.get("angle"):
        return  # Already has angle
    
    # Sources to check for angle
    series = str(rec.get("series_name", ""))
    application = str(rec.get("application", ""))
    sku = str(rec.get("sku", "") or rec.get("bestelnr", ""))
    
    # Also check _context.category which becomes series_name later
    ctx = rec.get("_context") or {}
    category = str(ctx.get("category", "") or "")
    
    combined_text = f"{series} {application} {category}".upper()
    
    # Pattern 1: Explicit angle in text (90°, 45°, 30°, 15°)
    angle_match = re.search(r'\b(90|45|30|15|87|67|22)\s*[°º]', combined_text)
    if angle_match:
        rec["angle"] = f"{angle_match.group(1)}°"
        return
    
    # Pattern 2: Angle keywords without degree symbol
    # "BOCHT 90", "KNIE 45", "90 GRADEN"
    angle_keyword_match = re.search(r'(?:BOCHT|KNIE|ELBOW|LASBOCHT|T-STUK)\s*(\d{2})\b', combined_text)
    if angle_keyword_match:
        angle = angle_keyword_match.group(1)
        if angle in ('90', '45', '30', '15', '87', '67', '22'):
            rec["angle"] = f"{angle}°"
            return
    
    # Pattern 3: "X graden" or "X degrees"
    graden_match = re.search(r'(\d{2})\s*(?:GRADEN|DEGREES|GRAD)', combined_text)
    if graden_match:
        angle = graden_match.group(1)
        if angle in ('90', '45', '30', '15', '87', '67', '22'):
            rec["angle"] = f"{angle}°"
            return
    
    # Pattern 4: T-pieces are typically 90° junctions
    if re.search(r'\bT[-\s]?STUK\b', combined_text):
        rec["angle"] = "90°"
        return
    
    # Pattern 5: SKU suffix for ABS pipes (ABSB02090 = 90°)
    if sku and re.match(r'^ABS[A-Z]', sku, re.IGNORECASE):
        sku_angle = re.search(r'(90|45|30|15)$', sku)
        if sku_angle:
            rec["angle"] = f"{sku_angle.group(1)}°"
            return


def normalize_black_fittings_sku(rec: Dict[str, Any], source_pdf: str) -> None:
    """Normalize dynamic black-fittings SKU keys into explicit sku fields.

    For zwarte-draad-en-lasfittingen.pdf we currently get rows where the
    left column (bestelnr) becomes a dynamic key like "7bul14120" and the
    cell value sometimes contains the actual BUL* order number, e.g.:

        {"7bul14120": "7BUL38040", ...}

    or is null when only a placeholder is present:

        {"7bul14120": None, ...}

    This helper converts those patterns into a stable shape:

        - If value is a non-empty SKU-like string, set:
            sku = value (right side)
            sku_property = key (left side)
        - If value is null/empty but key looks like a SKU, set:
            sku = key
            sku_property = key

    The original dynamic key is removed from the record.
    """

    if "zwarte-draad-en-lasfittingen" not in source_pdf.lower():
        return

    sku_key: Optional[str] = None
    sku_val: Any = None

    # Find the first dynamic key that matches the 7XXXX pattern used in this PDF.
    for k, v in list(rec.items()):
        if not isinstance(k, str):
            continue
        if not re.fullmatch(r"7[0-9A-Za-z]+", k):
            continue
        sku_key = k
        sku_val = v
        break

    if not sku_key:
        return

    # Decide how to populate the canonical sku fields.
    sku_str: Optional[str] = None
    sku_property: str = sku_key

    if isinstance(sku_val, str) and sku_val.strip():
        # Right-hand side holds the actual order number (e.g. BUL38040).
        sku_str = sku_val.strip()
    else:
        # Fallback: use the dynamic key itself as sku when the value is null/empty.
        sku_str = sku_key

    # Attach normalized fields and drop the dynamic key.
    if sku_str:
        rec.setdefault("sku", sku_str)
        rec.setdefault("sku_property", sku_property)

    rec.pop(sku_key, None)


def extract_zwarte_draad_sku(rec: Dict[str, Any]) -> Optional[str]:
    """Get canonical SKU for zwarte-draad-en-lasfittingen rows.

    Prefer an explicit 'sku' field (if already normalized); otherwise use the
    first header-like key matching 7[0-9A-Za-z]+ or its non-empty value.
    """

    sku = rec.get("sku")
    if isinstance(sku, str) and sku.strip():
        return sku.strip()

    sku_key: Optional[str] = None
    sku_val: Any = None
    for k, v in rec.items():
        if not isinstance(k, str):
            continue
        if not re.fullmatch(r"7[0-9A-Za-z]+", k):
            continue
        sku_key = k
        sku_val = v
        break

    if not sku_key:
        return None

    if isinstance(sku_val, str) and sku_val.strip():
        return sku_val.strip()
    return sku_key


def extract_zwarte_draad_size_inch(rec: Dict[str, Any]) -> Optional[str]:
    """Derive size in inches from maat/maten columns or enriched black_fitting."""

    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        kl = k.lower()
        if "maat" in kl or "maten" in kl:
            txt = v.strip()
            if txt:
                return txt

    enr = rec.get("_enriched") or {}
    if isinstance(enr, dict):
        bf = enr.get("black_fitting") or {}
        if isinstance(bf, dict):
            size_inch = bf.get("size_inch")
            if isinstance(size_inch, str) and size_inch.strip():
                return size_inch.strip()

    return None


def extract_zwarte_draad_length_mm(rec: Dict[str, Any]) -> Optional[int]:
    """Derive physical length in mm from *_mm columns (excluding wanddikte)."""

    best: Optional[int] = None
    for k, v in rec.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        kl = k.lower()
        if not kl.endswith("_mm"):
            continue
        if "wanddikte" in kl:
            continue
        m = re.search(r"([0-9]+)", v)
        if not m:
            continue
        try:
            val = int(m.group(1))
        except ValueError:
            continue
        if best is None or val < best:
            best = val
    return best


def derive_zwarte_draad_description(ctx: Dict[str, Any]) -> str:
    """Map zwarte-draad table context to a readable description.

    Uses the category and application text above the table to choose a
    human-friendly label, with special casing for NR 23 pijpnippels.
    """

    category = str(ctx.get("category") or "")
    application = str(ctx.get("application") or "")

    if "NR 23 - PIJPNIPPEL" in category.upper() and "BUITENDRAAD" in application.upper():
        return "Pijpnippel Buitendraad"

    parts: List[str] = []
    if category:
        parts.append(category)
    if application:
        parts.append(application)
    if parts:
        return " - ".join(parts)
    return "Zwarte draad fitting"


def infer_type_from_context(pdf_name: str, category: Optional[str], existing: Optional[str] = None) -> Optional[str]:
    """Infer a coarse type label based on PDF filename and category text.

    Used as a fallback when the table does not provide an explicit 'Type' column.
    """
    if existing and str(existing).strip():
        return existing

    n = pdf_name.lower()
    cat = (category or "").strip()

    if "abs-persluchtbuizen" in n:
        return "compressed_air_pipe"
    if "bronpompen" in n:
        return "well_pump"
    if "centrifugaalpompen" in n:
        return "centrifugal_pump"
    if "dompelpompen" in n:
        return "submersible_pump"
    if "aandrijftechniek" in n:
        return "drive_component"
    if "drukbuizen" in n or "kunststof-afvoerleidingen" in n:
        return "plastic_pipe"
    if "kranzle" in n:
        return "pressure_washer"

    # Fallback: slugified category text if present
    if cat:
        return slugify_header(cat)

    return None


# ------------------------
# Table extraction
# ------------------------

@dataclass
class ExtractedTable:
    header: List[str]
    rows: List[DataRow]
    bboxes: List[Tuple[float, float, float, float]]  # row bounding boxes


def _row_looks_like_data(row: List[Optional[str]]) -> bool:
    """Heuristic: check if the row looks like data rather than a header.
    
    Returns True if:
    - First non-empty cell looks like a product code/SKU, OR
    - Any cell in the row matches the Airpress SKU pattern (for grouped tables)
    """
    # First, check if any cell looks like an Airpress SKU (handles grouped tables)
    for cell in row:
        if cell is None:
            continue
        cell_str = str(cell).strip()
        if not cell_str:
            continue
        # Check against Airpress SKU pattern (5-10 digit codes with optional suffixes)
        if re.match(r"^\d{5,10}(-[A-Za-z0-9.]+)?$", cell_str):
            return True
    
    # Then check the first non-empty cell
    for cell in row:
        if cell is None:
            continue
        cell = str(cell).strip()
        if not cell:
            continue
        # If first non-empty cell starts with a digit, looks like data (e.g. "17130231")
        if cell[0].isdigit():
            return True
        # Product codes: letters followed by digits (e.g. "ABSBU016", "7BUL14120", "ZF9012")
        if re.match(r"^[A-Za-z]+\d+", cell):
            return True
        # Short alphanumeric codes with digits (e.g. "T1-40", "B-28606")
        if len(cell) <= 12 and any(c.isdigit() for c in cell):
            return True
        # Otherwise assume it's a header label (e.g. "Bestelnr", "Maat", "Type")
        return False
    return False


def _repair_missing_cells_from_text(page: pdfplumber.page.Page, table_bbox: Tuple[float, float, float, float], rows: List[List[Any]], num_cols: int) -> List[List[Any]]:
    """Repair rows with missing cells by extracting full text lines from page.
    
    pdfplumber sometimes fails to extract cells in tables with alternating colors
    or complex formatting. This function extracts complete text lines and parses
    them to fill in missing values.
    """
    if not rows:
        return rows
    
    x0, top, x1, bottom = table_bbox
    row_height = (bottom - top) / len(rows) if rows else 20
    
    # Extract all chars in the table area
    table_chars = [c for c in page.chars 
                   if top <= c['top'] <= bottom 
                   and x0 <= c['x0'] <= x1]
    
    # Group chars by y position into text lines
    from collections import defaultdict
    lines_by_y = defaultdict(list)
    for c in table_chars:
        y_key = round(c['top'] / 2) * 2
        lines_by_y[y_key].append(c)
    
    # Convert each line to full text with y position, adding spaces between words
    text_lines = []
    for y in sorted(lines_by_y.keys()):
        chars = sorted(lines_by_y[y], key=lambda c: c['x0'])
        # Build text with spaces where there are gaps
        text_parts = []
        prev_x1 = None
        for c in chars:
            if prev_x1 is not None:
                gap = c['x0'] - prev_x1
                # If gap is larger than average char width, add space
                if gap > 3:  # ~3px gap indicates word boundary
                    text_parts.append(' ')
            text_parts.append(c['text'])
            prev_x1 = c['x1'] if 'x1' in c else c['x0'] + 6  # Estimate x1 if not present
        text = ''.join(text_parts).strip()
        if text:
            text_lines.append((y, text))
    
    # Match text lines to rows by finding the closest y position
    used_text_lines = set()
    repaired = []
    
    for i, row in enumerate(rows):
        row_center_y = top + (i + 0.5) * row_height
        
        # Find the closest text line for this row
        best_match_idx = None
        best_match_text = None
        best_distance = float('inf')
        
        for idx, (y, text) in enumerate(text_lines):
            if idx in used_text_lines:
                continue
            distance = abs(y - row_center_y)
            if distance < best_distance and distance < row_height:
                best_distance = distance
                best_match_idx = idx
                best_match_text = text
        
        # Check if row needs repair (has any None values)
        row_has_none = row and any(v is None or (isinstance(v, str) and not v.strip()) for v in row)
        
        # If row is complete, just mark the text line as used
        if not row_has_none:
            if best_match_idx is not None:
                used_text_lines.add(best_match_idx)
            repaired.append(row)
            continue
        
        # Row needs repair - parse the full text line
        if row and best_match_text:
            used_text_lines.add(best_match_idx)
            row = list(row)  # Make mutable
            
            # Parse the text line into components
            # Pattern: SKU (alphanumeric) + Size (number + mm) + Pressure (number + bar)
            import re
            
            # Extract SKU (alphanumeric code before the first space or dimension)
            # SKUs like ABSB02590 end before "25 mm"
            sku_match = re.match(r'^([A-Z]{2,}[A-Z0-9]*\d+)(?:\s|$)', best_match_text, re.IGNORECASE)
            if sku_match and (row[0] is None or not str(row[0]).strip()):
                sku = sku_match.group(1)
                # Validate: SKU shouldn't end with the same digits as the size
                # e.g., ABSB02590 is valid, but ABSB0259025 is not (25 is the size)
                if len(sku) > 6:
                    row[0] = sku
            
            # Extract size (number + mm)
            size_match = re.search(r'(\d+)\s*mm', best_match_text, re.IGNORECASE)
            if size_match and len(row) > 1 and (row[1] is None or not str(row[1]).strip()):
                row[1] = f"{size_match.group(1)} mm"
            
            # Extract pressure (number + bar)
            pressure_match = re.search(r'(\d+(?:[,\.]\d+)?)\s*bar', best_match_text, re.IGNORECASE)
            if pressure_match and len(row) > 2 and (row[2] is None or not str(row[2]).strip()):
                row[2] = f"{pressure_match.group(1)} bar"
            
            # Extract length (number + m, but not mm)
            length_match = re.search(r'(\d+)\s*m(?!m)\b', best_match_text, re.IGNORECASE)
            if length_match:
                # Find the last column that's None
                for col_idx in range(len(row) - 1, -1, -1):
                    if row[col_idx] is None or not str(row[col_idx]).strip():
                        row[col_idx] = f"{length_match.group(1)} m"
                        break
        
        repaired.append(row)
    
    return repaired


def find_tables_with_bboxes(page: pdfplumber.page.Page) -> List[ExtractedTable]:
    """Use pdfplumber's table finder to get tables plus row bboxes.

    This gives us geometry for category detection and bold detection.
    """
    tables: List[ExtractedTable] = []
    for t in page.find_tables():
        raw = t.extract()
        if not raw:
            continue
        header_rows = []
        data_rows = []

        # Detect how many header rows: check if rows look like data
        row0_is_data = _row_looks_like_data(raw[0])
        row1_is_data = len(raw) >= 2 and _row_looks_like_data(raw[1])
        
        if len(raw) == 1:
            # Single row table - treat as data with generated headers
            if row0_is_data:
                header_rows = []
                data_rows = raw
            else:
                # Single header row with no data - skip
                continue
        elif row0_is_data and row1_is_data:
            # Both rows look like data - no header row, generate column names
            header_rows = []
            data_rows = raw
        elif row1_is_data:
            # Only 1 header row
            header_rows = raw[:1]
            data_rows = raw[1:]
        else:
            # 2 header rows (multi-line headers)
            header_rows = raw[:2]
            data_rows = raw[2:]

        header = merge_header_rows(header_rows)
        data_rows = filter_empty_rows([clean_row(r) for r in data_rows])
        if not data_rows:
            continue
        
        # Repair missing cells in first column (common issue with alternating row colors)
        # Adjust bbox to account for removed header rows
        x0, top, x1, bottom = t.bbox
        num_header_rows = len(header_rows)
        total_rows = len(raw)
        if total_rows > 0 and num_header_rows > 0:
            row_height_estimate = (bottom - top) / total_rows
            adjusted_top = top + num_header_rows * row_height_estimate
            adjusted_bbox = (x0, adjusted_top, x1, bottom)
        else:
            adjusted_bbox = t.bbox
        
        num_cols = max(len(r) for r in data_rows) if data_rows else 0
        data_rows = _repair_missing_cells_from_text(page, adjusted_bbox, data_rows, num_cols)
        
        # If no header was detected, generate column names based on data width
        if not header and data_rows:
            max_cols = max(len(r) for r in data_rows)
            header = [f"col_{i}" for i in range(max_cols)]
        
        # Fix missing header cells - pdfplumber sometimes returns None for cells that have text
        # Replace None with col_N placeholders, then try to infer from context
        if header:
            # Common header patterns: [Bestelnr, Maat, Werkdruk, Wanddikte, Lengte]
            # pdfplumber often misses first and last columns
            known_headers = {
                "maat": True, "maten": True, "werkdruk": True, "druk": True,
                "wanddikte": True, "lengte": True, "flens": True,
            }
            
            for i, h in enumerate(header):
                if h is None or h == "":
                    header[i] = f"col_{i}"
            
            # If we have known headers in the middle, infer first/last columns
            has_known_middle = any(slugify_header(h) in known_headers for h in header if h)
            
            # First column is typically Bestelnr/SKU
            if header[0] == "col_0" and data_rows:
                first_col_vals = [r[0] for r in data_rows if r and r[0] and isinstance(r[0], str)]
                if first_col_vals and any(re.match(r'^[A-Z]{2,}[A-Z0-9]*\d+', v) for v in first_col_vals):
                    header[0] = "bestelnr"
            
            # Last column is often Lengte (length) if it contains "m" values
            last_idx = len(header) - 1
            if header[last_idx] == f"col_{last_idx}" and data_rows:
                last_col_vals = [r[last_idx] for r in data_rows if r and len(r) > last_idx and r[last_idx] and isinstance(r[last_idx], str)]
                if last_col_vals and any(re.search(r'\d+\s*m\b', v) for v in last_col_vals):
                    header[last_idx] = "lengte"

        # Estimate row bboxes from table bbox by evenly splitting vertically
        x0, top, x1, bottom = t.bbox
        row_height = (bottom - top) / max(len(data_rows), 1)
        row_bboxes: List[Tuple[float, float, float, float]] = []
        for i in range(len(data_rows)):
            r_top = top + i * row_height
            r_bottom = top + (i + 1) * row_height
            row_bboxes.append((x0, r_top, x1, r_bottom))

        tables.append(ExtractedTable(header=header, rows=data_rows, bboxes=row_bboxes))
    return tables


# ------------------------
# Per-PDF mappers
# ------------------------


def extract_abs_persluchtbuizen(row: DataRow, header: List[str]) -> Dict[str, Any]:
    hmap = {i: slugify_header(h) if h else f"col_{i}" for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}
    
    # ABS SKU pattern: ABS + 2-4 letters + 3-5 digits (ABSBU016, ABSBO2090, ABSKR090)
    abs_sku_pattern = re.compile(r'^ABS[A-Z]{1,4}\d{3,5}$', re.IGNORECASE)
    
    # First pass: find SKU in any column
    for idx, value in enumerate(row):
        v = value.strip() if isinstance(value, str) else None
        if v and abs_sku_pattern.match(v):
            obj["bestelnr"] = v
            break

    for idx, value in enumerate(row):
        key = hmap.get(idx) or f"col_{idx}"
        raw_h = header[idx] if idx < len(header) else None
        v = value
        if v is not None:
            v = v.strip()
        # Columns whose header looks like ABSBU016 etc. are actually bestelnr values,
        # not real properties. Map any non-empty cell to bestelnr and do not keep the
        # raw column key (e.g. 'absbu016').
        # Two cases:
        # 1) Header itself is a pure code like "X0817015" and the cell only has a mark
        #    (x, X, •, checkmark). Then store the header code as bestelnr.
        # 2) ABSBU016-style header where the cell v contains the actual code text.
        if raw_h is not None:
            raw_h_str = str(raw_h).strip()
        else:
            raw_h_str = ""

        mark_values = {"x", "X", "•", ""}

        # Extract leading alphanumeric code from the raw header, to handle
        # headers like "ABSKR090" or "ABSKR090 (90°)".
        header_code: Optional[str] = None
        if raw_h_str:
            m_code = re.match(r"([A-Za-z0-9]+)", raw_h_str)
            if m_code:
                header_code = m_code.group(1)

        if header_code and v in mark_values:
            obj["bestelnr"] = header_code
        elif re.match(r"^[a-z]+[0-9]+$", key) and v:
            obj["bestelnr"] = v
        elif key in {"bestelnr", "bestelnr_order_id", "order_id"}:
            obj["bestelnr"] = v
        # col_0 with SKU-like value (e.g., ABSBU016, ABSBO2090) -> bestelnr
        elif key == "col_0" and v and re.match(r"^[A-Z]{2,}[A-Z0-9]+$", v, re.IGNORECASE):
            obj["bestelnr"] = v
        elif key.startswith("maat") or key.startswith("maten"):
            obj["maat"] = v
        elif "werkdruk" in key or "druk" in key:
            obj["werkdruk"] = v
        # col_2 with pressure-like value (e.g., "10 bar") -> werkdruk
        elif key == "col_2" and v and re.search(r"\d+\s*bar", v, re.IGNORECASE):
            obj["werkdruk"] = v
        elif "wanddikte" in key:
            obj["wanddikte"] = v
        # Columns like '5 m' should be treated as a length property with value '5 m'.
        elif "lengte" in key or key.endswith("_m"):
            obj["lengte"] = v
        else:
            obj[key] = v
    
    return obj


def infer_pomp_specials_bestelnr_idx(rows: List[DataRow]) -> Optional[int]:
    """Infer which column holds the SKU (bestelnr) for pomp-specials tables.

    In pomp-specials, pdfplumber sometimes fails to extract the header row.
    We infer the SKU column by counting SKU-like values per column.
    """

    if not rows:
        return None

    # Heuristics based on the PDF examples:
    # - Bestelnr is visually the first column in pomp-specials and contains no spaces.
    #   Prefer column 0 when it looks SKU-like.
    # - Pure numeric 7-8 digits (e.g. 18540001, 50960019, 19490005)
    # - Alpha+digits codes (e.g. X106033, VYN043880)
    numeric_pat = re.compile(r"^\d{7,8}$")
    alpha_num_pat = re.compile(r"^[A-Z]{1,6}\d{5,}$")

    # Fast path: if column 0 consistently contains SKU-like values, lock onto it.
    col0_hits = 0
    col0_total = 0
    for r in rows:
        try:
            if len(r) < 1:
                continue
            cell0 = r[0]
        except Exception:
            continue
        if cell0 is None:
            continue
        s0 = cell0.strip() if isinstance(cell0, str) else str(cell0).strip()
        if not s0:
            continue
        if " " in s0:
            continue
        col0_total += 1
        if numeric_pat.fullmatch(s0) or alpha_num_pat.fullmatch(s0.upper()):
            col0_hits += 1

    # If we have at least a couple of strong matches in column 0, treat it as bestelnr.
    if col0_hits >= 2:
        return 0

    # Determine max columns
    max_cols = 0
    for r in rows:
        try:
            max_cols = max(max_cols, len(r))
        except Exception:
            continue
    if max_cols == 0:
        return None

    scores = [0] * max_cols
    for r in rows:
        for i in range(max_cols):
            try:
                cell = r[i]
            except Exception:
                cell = None
            if cell is None:
                continue
            s = cell.strip() if isinstance(cell, str) else str(cell).strip()
            if not s:
                continue
            # Strong signals
            if numeric_pat.fullmatch(s):
                scores[i] += 3
            elif alpha_num_pat.fullmatch(s.upper()):
                scores[i] += 2
            # Weak signal: numeric with spaces (rare)
            elif numeric_pat.fullmatch(re.sub(r"\s+", "", s)):
                scores[i] += 1

    best_score = max(scores) if scores else 0
    if best_score <= 0:
        return None
    return int(scores.index(best_score))


def synthesize_pomp_specials_header(header: Optional[List[str]], rows: List[DataRow]) -> Optional[List[str]]:
    """Create an effective header for pomp-specials tables.

    If the extracted header is missing/garbled (no Bestelnr), infer the SKU column
    and label it "Bestelnr" so downstream mapping can work.
    """

    h = list(header or [])
    header_joined = " ".join([str(x) for x in h if x is not None]).lower()
    has_bestelnr = ("bestel" in header_joined) or ("bestelnr" in header_joined)
    if has_bestelnr and h:
        return h

    inferred_idx = infer_pomp_specials_bestelnr_idx(rows)
    if inferred_idx is None:
        return h if h else None

    # Ensure header length
    needed = inferred_idx + 1
    if len(h) < needed:
        h = h + [None] * (needed - len(h))

    h[inferred_idx] = "Bestelnr"

    # Fill any remaining missing columns with stable names
    for i in range(len(h)):
        if h[i] is None or str(h[i]).strip() == "":
            h[i] = f"col_{i}"

    return h


def extract_pomp_specials(row: DataRow, header: List[str]) -> Dict[str, Any]:
    """Extract a row from pomp-specials tables.

    Pomp-specials is an "image + spec block + table" layout where tables vary by page.
    We must map by header labels, and we must take the SKU strictly from the Bestelnr column
    (never by scanning arbitrary columns) to avoid false positives.
    """

    obj: Dict[str, Any] = {}

    # Build an index->field mapping from the table header
    def normalize_header(h: str) -> str:
        s = (h or "").strip().lower()
        s = s.replace("\n", " ")
        s = re.sub(r"\s+", " ", s)
        return s

    header_norm = [normalize_header(h) for h in (header or [])]

    # Identify bestelnr (SKU) column
    bestelnr_idx: Optional[int] = None
    for i, hn in enumerate(header_norm):
        if any(k in hn for k in ("bestelnr", "bestel", "artikel")):
            bestelnr_idx = i
            break

    # Map other known headers to stable keys
    col_to_key: Dict[int, str] = {}
    for i, hn in enumerate(header_norm):
        if bestelnr_idx is not None and i == bestelnr_idx:
            continue

        if not hn:
            continue

        # Common column labels across pomp-specials pages
        if hn.startswith("type") or hn == "type motor" or hn == "type pomp":
            col_to_key[i] = "type"
        elif "toer" in hn or "rpm" in hn or "omw" in hn:
            col_to_key[i] = "rpm"
        elif "vermogen" in hn and ("pk" in hn or "p.k" in hn):
            col_to_key[i] = "vermogen_pk"
        elif "vermogen" in hn and "kw" in hn:
            col_to_key[i] = "vermogen_kw"
        elif hn == "vermogenv" or hn == "vermogen":
            # ambiguous; keep raw under a stable-ish key
            col_to_key[i] = "vermogen"
        elif "debiet" in hn:
            # Some pages use m3/h, others l/min
            if "m3" in hn or "m³" in hn:
                col_to_key[i] = "debiet_m3_h"
            elif "l" in hn and "/" in hn:
                col_to_key[i] = "debiet_l_min"
            else:
                col_to_key[i] = "debiet"
        elif "opv" in hn or "opvoer" in hn or "op.hoogte" in hn or "ophoogte" in hn:
            col_to_key[i] = "opvoerhoogte_m"
        elif "aanzuig" in hn:
            # Can be depth (m) or DN connection
            if "dn" in hn:
                col_to_key[i] = "aanzuig_dn"
            else:
                col_to_key[i] = "aanzuigdiepte_m"
        elif "steek" in hn:
            col_to_key[i] = "steek_dn" if "dn" in hn else "steek"
        elif "aansluit" in hn:
            col_to_key[i] = "aansluiting"
        elif "spanning" in hn or hn.endswith(" v") or hn == "v":
            col_to_key[i] = "spanning_v"
        elif "stroom" in hn or hn.endswith(" a") or hn == "a":
            col_to_key[i] = "stroom_a"
        elif "brandstof" in hn:
            col_to_key[i] = "brandstof"
        elif "gebruiks" in hn or "duur" in hn:
            col_to_key[i] = "gebruiksduur"
        elif "korrel" in hn or "korrelgrootte" in hn:
            col_to_key[i] = "korrelgrootte"
        elif "gewicht" in hn or hn.endswith(" kg"):
            col_to_key[i] = "weight_kg"
        elif "koppeling" in hn or "stekeling" in hn or "stekeling" in hn:
            col_to_key[i] = "koppeling"
        else:
            # Fallback: keep as slugified header
            col_to_key[i] = slugify_header(hn)

    # Extract bestelnr from its column only
    if bestelnr_idx is None:
        return {}

    try:
        raw_sku = row[bestelnr_idx]
    except Exception:
        raw_sku = None

    sku = raw_sku.strip() if isinstance(raw_sku, str) else (str(raw_sku).strip() if raw_sku is not None else "")
    if not sku:
        return {}
    obj["bestelnr"] = sku

    debiet_raw = None
    opv_raw = None

    for idx, value in enumerate(row):
        if idx == bestelnr_idx:
            continue
        v = value.strip() if isinstance(value, str) else value
        if v is None or (isinstance(v, str) and not v.strip()):
            continue

        key = col_to_key.get(idx)
        if not key:
            continue

        # If the header is unknown/placeholder (col_N), try to infer the semantic key from the value.
        if isinstance(key, str) and key.startswith("col_"):
            inferred = infer_pomp_specials_key_from_value(v, obj)
            if inferred:
                key = inferred

        # Sanity override: even if the header implies a field, if the value clearly indicates
        # a different unit (kg/DN/rpm/kW/pk/etc), override the key. This fixes shifted columns.
        inferred_override = infer_pomp_specials_key_from_value(v, obj)
        if inferred_override and inferred_override != key:
            # Only override when it would place the value into a currently-unset field.
            if inferred_override not in obj:
                key = inferred_override

        # Avoid overwriting if inference yields a key already set.
        if key in obj:
            continue

        obj[key] = v
        if key == "debiet_m3_h":
            debiet_raw = str(v)
        if key == "opvoerhoogte_m":
            opv_raw = str(v)

    if debiet_raw:
        dmin, dmax = parse_range(debiet_raw)
        obj["debiet_m3_h_min"] = dmin
        obj["debiet_m3_h_max"] = dmax
    if opv_raw:
        hmin, hmax = parse_range(opv_raw)
        obj["opvoerhoogte_m_min"] = hmin
        obj["opvoerhoogte_m_max"] = hmax

    return obj


def parse_zuigerpompen_table_text(table_text: str) -> List[Dict[str, Any]]:
    if not table_text:
        return []

    t = re.sub(r"\s+", " ", table_text).strip()
    t = t.replace("\u201d", '"').replace("\u201c", '"').replace("\u2019", "'")

    pattern = re.compile(
        r"(?P<bestelnr>X\d{7})\s+"
        r"(?P<type>HERCULES\s+\d+)\s+"
        r"(?P<spanning_v>\d+x\d+V)\s+"
        r"(?P<vermogen_kw>\d+[\.,]?\d*)\s+"
        r"(?P<debiet_m3_h>\d+[\.,]?\d*\s*m3/h)\s+"
        r"(?P<aanzuig>[^\s]+)\s+"
        r"(?P<steek>[^\s]+)\s+"
        r"(?P<opvoerhoogte_m>\d+\s*m)\s+"
        r"(?:(?P<inhoud_vat>\d+L)\s+)?"
        r"(?P<aanzuigdiepte_m>\d+\s*m)",
        re.IGNORECASE,
    )

    out: List[Dict[str, Any]] = []
    for m in pattern.finditer(t):
        d = m.groupdict()
        obj: Dict[str, Any] = {
            "bestelnr": d.get("bestelnr"),
            "type": d.get("type"),
            "spanning_v": d.get("spanning_v"),
            "vermogen_kw": d.get("vermogen_kw"),
            "debiet_m3_h": d.get("debiet_m3_h"),
            "aanzuig": d.get("aanzuig"),
            "steek": d.get("steek"),
            "opvoerhoogte_m": d.get("opvoerhoogte_m"),
            "aanzuigdiepte_m": d.get("aanzuigdiepte_m"),
        }

        inhoud = d.get("inhoud_vat")
        if inhoud:
            obj["inhoud_vat"] = inhoud

        out.append(obj)

    return out


def extract_zuigerpompen(row: DataRow, header: List[str]) -> Dict[str, Any]:
    hmap = {i: slugify_header(h) for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}

    pump_sku_pattern = re.compile(r'^X\d{7}$')

    # pdfplumber can split SKUs across cells/lines (e.g. "X0330 233" or with newlines).
    # Pre-scan the entire row with whitespace removed to reliably recover the SKU.
    try:
        row_joined = "".join(str(v) for v in row if v is not None)
    except Exception:
        row_joined = ""
    row_compact = re.sub(r"\s+", "", row_joined)
    m = re.search(r"X\d{7}", row_compact)
    if m and "bestelnr" not in obj:
        obj["bestelnr"] = m.group(0)

    for idx, value in enumerate(row):
        key = hmap.get(idx)
        v = value.strip() if isinstance(value, str) else value

        v_compact = None
        if v and isinstance(v, str):
            v_compact = re.sub(r"\s+", "", v)

        if v_compact and pump_sku_pattern.match(v_compact):
            if "bestelnr" not in obj:
                obj["bestelnr"] = v_compact
            continue

        if not key:
            continue

        if key.startswith("bestelnr") or key == "col_0":
            if v_compact and pump_sku_pattern.match(v_compact):
                obj["bestelnr"] = v_compact
            elif v and "bestelnr" not in obj:
                obj["bestelnr"] = v
        elif key.startswith("type"):
            obj["type"] = v
        elif key.startswith("spanning_v") or key.startswith("spanning"):
            obj["spanning_v"] = v
        elif key.startswith("vermogen_kw") or ("vermogen" in key and "kw" in key):
            obj["vermogen_kw"] = v
        elif key.startswith("debiet_m3_h") or "debiet" in key:
            obj["debiet_m3_h"] = v
        elif key.startswith("aanzuig"):
            obj["aanzuig"] = v
        elif key.startswith("steek"):
            obj["steek"] = v
        elif key.startswith("opv_hoogte") or "opvoer" in key or "hoogte" in key:
            obj["opvoerhoogte_m"] = v
        elif "aanzuigdiepte" in key:
            obj["aanzuigdiepte_m"] = v
        else:
            obj[key] = v

    if obj.get("length_mm") and not obj.get("aanzuigdiepte_m"):
        obj["aanzuigdiepte_m"] = obj["length_mm"]
        del obj["length_mm"]

    return obj


def extract_bronpompen(row: DataRow, header: List[str]) -> Dict[str, Any]:
    hmap = {i: slugify_header(h) for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}
    
    # Bronpompen SKU pattern: 8-digit codes (may start with 0, 2, etc.)
    bronpompen_sku_pattern = re.compile(r'^\d{8}$')
    
    # First pass: find all SKUs in the row
    skus_found = []
    for idx, value in enumerate(row):
        v = value.strip() if isinstance(value, str) else value
        if v and isinstance(v, str) and bronpompen_sku_pattern.match(v):
            skus_found.append((idx, v))
    
    # Assign SKUs based on position
    if skus_found:
        # First SKU becomes bestelnr
        obj["bestelnr"] = skus_found[0][1]
        # Additional SKUs are motor variants
        for i, (idx, sku) in enumerate(skus_found[1:], 1):
            obj[f"motor_variant_{i}"] = sku

    # Second pass: extract other fields
    for idx, value in enumerate(row):
        key = hmap.get(idx)
        v = value.strip() if isinstance(value, str) else value
        
        # Skip if already processed as SKU
        if v and isinstance(v, str) and bronpompen_sku_pattern.match(v):
            continue
        
        if not key:
            continue

        if key.startswith("type"):
            obj["type"] = v
        elif "vermogen" in key and "kw" in key:
            obj["vermogen_kw"] = v
        elif "debiet" in key:
            obj["debiet_m3_h"] = v
        elif "opv" in key or "hoogte" in key:
            obj["opvoerhoogte_m"] = v
        elif "aansluiting" in key:
            obj["aansluiting"] = v
        elif "stroom" in key:
            obj["stroom_a"] = v
        elif "kabel" in key:
            obj["kabellengte_m"] = v
        elif "gewicht" in key:
            obj["gewicht_kg"] = v
        else:
            obj[key] = v

    return obj


def extract_aandrijftechniek(row: DataRow, header: List[str], page: pdfplumber.page.Page, row_bbox: Tuple[float, float, float, float]) -> Dict[str, Any]:
    hmap = {i: slugify_header(h) for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}
    
    # Aandrijftechniek CODE patterns - specific prefixes used in this catalog:
    # - RL* (RLNUCP, RLFUCP, etc.) - lagerblokken
    # - CAR* (CARBU) - cardan parts
    # - Numeric codes (11050583, etc.)
    # Exclude UC* which are spanlager codes, not product codes
    aandrijf_code_pattern = re.compile(
        r'^(?:'
        r'RL[A-Z]+\d+'          # RLNUCP204, RLFUCP205
        r'|CAR[A-Z]*\d+'        # CARBU11395290
        r'|[A-Z]{3,}[A-Z0-9]*\d{3,}'  # Other 3+ letter codes with digits
        r'|\d{6,}'              # Pure numeric codes (6+ digits)
        r')$'
    )

    for idx, value in enumerate(row):
        key = hmap.get(idx)
        v = value.strip() if isinstance(value, str) else value
        
        # Try to detect CODE in first column only (idx == 0) to avoid false positives
        if idx == 0 and v and isinstance(v, str) and aandrijf_code_pattern.match(v):
            obj["code"] = v
            obj["bestelnr"] = v
            continue
        
        if not key:
            continue

        if key == "code" or key == "col_0":
            if v:
                obj["code"] = v
                obj["bestelnr"] = v
        elif "binnendiameter" in key or "asdiameter" in key or key == "col_1":
            obj["binnendiameter_mm"] = v
        elif "buitendiameter" in key:
            obj["buitendiameter_mm"] = v
        elif "maximale_dynamische_belasting" in key:
            obj["max_dynamische_belasting"] = v
        elif "maximale_statische_belasting" in key:
            obj["max_statische_belasting"] = v
        elif "lagerhuis" in key or key == "col_2":
            obj["lagerhuis"] = v
        elif "spanlager" in key or key == "col_3":
            # col_3 is typically Spanlager (bearing code like UC205G2)
            if v and re.match(r'^[A-Z]{2}\d+[A-Z0-9]*$', v):
                obj["spanlager"] = v
            else:
                obj["spanlager"] = v
        elif "breedte" in key:
            obj["breedte_mm"] = v
        else:
            obj[key] = v
    
    # If CODE still not found, try to extract from page text in the row bbox area
    if not obj.get("code") and row_bbox:
        x0, top, x1, bottom = row_bbox
        # Crop to the first ~25% of the row (where CODE column is)
        code_area = page.within_bbox((x0, top, x0 + (x1 - x0) * 0.25, bottom))
        if code_area:
            text = code_area.extract_text() or ""
            # Find CODE pattern in extracted text
            for word in text.split():
                word = word.strip()
                if aandrijf_code_pattern.match(word):
                    obj["code"] = word
                    obj["bestelnr"] = word
                    break

    in_stock = detect_row_bold(page, row_bbox)
    obj["in_stock"] = bool(in_stock)
    return obj


def extract_centrifugaalpompen(row: DataRow, header: List[str]) -> Dict[str, Any]:
    hmap = {i: slugify_header(h) for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}

    debiet_raw = None
    opv_raw = None
    
    # Pump SKU patterns: X followed by 7 digits, or 8 digits
    pump_sku_pattern = re.compile(r'^(X\d{7}|\d{8})$')

    for idx, value in enumerate(row):
        key = hmap.get(idx)
        v = value.strip() if isinstance(value, str) else value
        
        # Try to detect SKU in any column (pdfplumber sometimes misses first column)
        if v and isinstance(v, str) and pump_sku_pattern.match(v):
            if "bestelnr" not in obj:
                obj["bestelnr"] = v
            continue
        
        if not key:
            continue

        if key.startswith("bestelnr"):
            if v:
                obj["bestelnr"] = v
        elif key.startswith("type"):
            obj["type"] = v
        elif "spanning" in key or key.endswith("_v"):
            obj["spanning_v"] = v
        elif "vermogen" in key and "kw" in key:
            obj["vermogen_kw"] = v
        elif "debiet" in key:
            debiet_raw = v
            obj["debiet_m3_h"] = v
        elif "opvoer" in key or "hoogte" in key:
            opv_raw = v
            obj["opvoerhoogte_m"] = v
        else:
            obj[key] = v

    if debiet_raw:
        dmin, dmax = parse_range(debiet_raw)
        obj["debiet_m3_h_min"] = dmin
        obj["debiet_m3_h_max"] = dmax
    if opv_raw:
        hmin, hmax = parse_range(opv_raw)
        obj["opvoerhoogte_m_min"] = hmin
        obj["opvoerhoogte_m_max"] = hmax

    return obj


def extract_dompelpompen(row: DataRow, header: List[str]) -> Dict[str, Any]:
    hmap = {i: slugify_header(h) for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}
    
    # Pump SKU patterns: X followed by 7 digits, or 8 digits
    pump_sku_pattern = re.compile(r'^(X\d{7}|\d{8})$')

    for idx, value in enumerate(row):
        key = hmap.get(idx)
        v = value.strip() if isinstance(value, str) else value
        
        # Try to detect SKU in any column
        if v and isinstance(v, str) and pump_sku_pattern.match(v):
            if "bestelnr" not in obj:
                obj["bestelnr"] = v
            continue
        
        if not key:
            continue

        if key.startswith("bestelnr"):
            if v:
                obj["bestelnr"] = v
        elif "korrelgrootte" in key:
            obj["korrelgrootte"] = v
        elif "vlotter" in key:
            obj["vlotter"] = parse_boolean(v)
        elif "kabellengte" in key:
            obj["kabellengte"] = v
        elif key.startswith("type"):
            obj["type"] = v
        elif "spanning" in key:
            obj["spanning_v"] = v
        elif "vermogen" in key:
            obj["vermogen_kw"] = v
        elif "debiet" in key:
            obj["debiet_m3_h"] = v
        elif "opvoer" in key or "hoogte" in key:
            obj["opvoerhoogte_m"] = v
        elif "gewicht" in key:
            obj["gewicht_kg"] = v
        else:
            obj[key] = v

    return obj


def extract_pe_buizen(row: DataRow, header: List[str]) -> Dict[str, Any]:
    """Extract PE buizen products with SKU patterns like HDBUH07505005."""
    hmap = {i: slugify_header(h) for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}
    
    # PE buizen SKU pattern: HDBU + letter + digits (e.g., HDBUH07505005)
    pe_sku_pattern = re.compile(r'^HDBU[A-Z]\d{8,}$')

    for idx, value in enumerate(row):
        key = hmap.get(idx)
        v = value.strip() if isinstance(value, str) else value
        
        # Detect SKU in any column (first column often has None header)
        if v and isinstance(v, str) and pe_sku_pattern.match(v):
            obj["bestelnr"] = v
            continue
        
        if not key:
            # For PE-buizen, col_0 is bestelnr, col_1 is maat, col_2 is werkdruk, col_3 is lengte
            if idx == 0 and v:
                obj["bestelnr"] = v
            elif idx == 1 and v:
                obj["maat"] = v
            elif idx == 2 and v:
                obj["werkdruk"] = v
            elif idx == 3 and v:
                obj["lengte"] = v
            continue

        if key.startswith("bestelnr") or key == "col_0":
            if v:
                obj["bestelnr"] = v
        elif "maat" in key or key == "col_1":
            obj["maat"] = v
        elif "werkdruk" in key or key == "col_2":
            obj["werkdruk"] = v
        elif "lengte" in key or key == "col_3":
            obj["lengte"] = v
        else:
            obj[key] = v

    return obj


def extract_drukbuizen(row: DataRow, header: List[str]) -> Dict[str, Any]:
    hmap = {i: slugify_header(h) for i, h in enumerate(header)}
    obj: Dict[str, Any] = {}
    
    # Drukbuizen SKU patterns: DB/AB/PF/PP/etc followed by digits
    drukbuizen_sku_pattern = re.compile(r'^[A-Z]{2,3}\d{5,7}$')

    for idx, value in enumerate(row):
        key = hmap.get(idx)
        v = value.strip() if isinstance(value, str) else value
        
        # Check if value looks like a drukbuizen SKU (even if header is None)
        if v and isinstance(v, str) and drukbuizen_sku_pattern.match(v):
            obj["bestelnr"] = v
            continue
        
        if not key:
            continue

        # In kunststof-afvoerleidingen the header often contains order codes
        # like AB0317 / AB0322 etc. These are not real property names but the
        # bestelnr for that column. Treat such slugified keys as bestelnr
        # values instead of emitting them as separate properties.
        if re.fullmatch(r"[a-z]{2}[0-9]{3,}", key):
            if v:
                obj["bestelnr"] = v
        elif "maat" in key:
            obj["maat"] = v
        elif "wanddikte" in key:
            obj["wanddikte"] = v
        elif "lengte" in key:
            obj["lengte"] = v
        elif "werkdruk" in key:
            obj["werkdruk"] = v
        elif key == "sn" or "sn_" in key:
            obj["sn"] = v
        else:
            obj[key] = v

    return obj


def extract_airpress_row(row: DataRow, header: List[str], sku_col_idx: Optional[int]) -> Dict[str, Any]:
    """Extract a row from Airpress catalog tables with SKU column detection.
    
    Target output structure:
    - article_sku: The product SKU/bestelnr
    - product_type: The product sub-type (from grouped table col_0)
    - connection_size / specification: The spec value (from col_2+)
    
    Handles multiple table patterns:
    1. SKU column with icon header (detected via sku_col_idx)
    2. Grouped tables where col_0=product_type, col_1=SKU, col_2+=specs
    3. Fallback: scan all columns for SKU-like values
    """
    obj: Dict[str, Any] = {}
    
    # Dynamically find the SKU column by scanning all cells
    sku_col = None
    model_col = None
    for idx, cell in enumerate(row):
        cell_val = cell.strip() if isinstance(cell, str) else ""
        if cell_val and is_airpress_sku_value(cell_val):
            sku_col = idx
            break
    
    # If SKU found, look for model name in earlier columns
    if sku_col is not None and sku_col > 0:
        for idx in range(sku_col - 1, -1, -1):
            cell_val = row[idx].strip() if isinstance(row[idx], str) else ""
            if cell_val and not is_airpress_sku_value(cell_val):
                model_col = idx
                break
    
    # Legacy pattern detection for backward compatibility
    col_0_val = row[0].strip() if len(row) > 0 and isinstance(row[0], str) else ""
    col_1_val = row[1].strip() if len(row) > 1 and isinstance(row[1], str) else ""
    
    # Grouped table pattern: col_0 is product type (or empty), col_1 is SKU
    is_grouped_table = (
        len(row) >= 2 and  # At least 2 columns
        is_airpress_sku_value(col_1_val) and  # col_1 looks like SKU
        not is_airpress_sku_value(col_0_val)  # col_0 is NOT an SKU (it's a product type)
    )
    
    # Also check: col_0 is SKU (simpler 2-column tables)
    is_simple_sku_table = (
        len(row) >= 1 and
        is_airpress_sku_value(col_0_val)
    )
    
    # Use dynamically detected SKU column if found (handles tables with SKU in any column)
    if sku_col is not None and not is_grouped_table and not is_simple_sku_table:
        # SKU found in column other than 0 or 1 (e.g., column 4 for compressor tables)
        sku_val = row[sku_col].strip() if isinstance(row[sku_col], str) else ""
        obj["article_sku"] = sku_val
        
        # Get model name from earlier column if found
        if model_col is not None:
            model_val = row[model_col].strip() if isinstance(row[model_col], str) else ""
            if model_val:
                obj["model_name"] = model_val
        
        # Process all other columns as specifications
        for idx, value in enumerate(row):
            if idx == sku_col or idx == model_col:
                continue
            v = value.strip() if isinstance(value, str) else value
            if v:
                field_name = _infer_airpress_field_name(v, idx)
                obj[field_name] = v
    
    elif is_grouped_table:
        # Grouped table: col_0=product_type/model_name, col_1=SKU, col_2+=specs
        if col_0_val:
            # Determine if col_0 is a model name (alphanumeric like B5900B, PAT 24B)
            # or a product type (text like "Internal plugs", "Parallel Plugs")
            if re.match(r'^[A-Z0-9]+\s*[A-Z0-9]*$', col_0_val) and len(col_0_val) <= 15:
                obj["model_name"] = col_0_val
            else:
                obj["product_type"] = col_0_val
        obj["article_sku"] = col_1_val
        
        # Process remaining columns as specifications
        for idx in range(2, len(row)):
            v = row[idx].strip() if isinstance(row[idx], str) else row[idx]
            if v:
                field_name = _infer_airpress_field_name(v, idx)
                obj[field_name] = v
                
    elif is_simple_sku_table:
        # Simple table: col_0=SKU, col_1+=specs
        obj["article_sku"] = col_0_val
        
        for idx in range(1, len(row)):
            v = row[idx].strip() if isinstance(row[idx], str) else row[idx]
            if v:
                field_name = _infer_airpress_field_name(v, idx)
                obj[field_name] = v
                
    elif sku_col_idx is not None:
        # Explicit SKU column detected (icon header)
        for idx, value in enumerate(row):
            v = value.strip() if isinstance(value, str) else value
            if idx == sku_col_idx:
                if v:
                    obj["article_sku"] = v
            elif v:
                field_name = _infer_airpress_field_name(v, idx)
                obj[field_name] = v
    else:
        # Fallback: scan for SKU and map other columns
        hmap = {i: slugify_header(h) for i, h in enumerate(header)}
        for idx, value in enumerate(row):
            key = hmap.get(idx) or f"col_{idx}"
            v = value.strip() if isinstance(value, str) else value
            
            if is_airpress_sku_value(v) and "article_sku" not in obj:
                obj["article_sku"] = v
            elif v:
                field_name = _infer_airpress_field_name(v, idx) if key.startswith("col_") else key
                obj[field_name] = v
    
    # Also set bestelnr for backward compatibility with normalize_sku_from_bestelnr
    if obj.get("article_sku"):
        obj["bestelnr"] = obj["article_sku"]
    
    return obj


def _infer_airpress_field_name(value: str, col_idx: int) -> str:
    """Infer semantic field name from value pattern."""
    v_str = str(value)
    
    # Connection sizes: 1/4", 3/8", 1/2", 1/8" x 1/4", 6 mm, etc.
    # Match fraction followed by any quote character, or mm sizes, or "x" combinations
    if re.search(r'\d+/\d+.?$|^\d+\s*mm$|.?\s*x\s*.+$', v_str) and len(v_str) <= 20:
        return "connection_size"
    
    # Pressure: 10 bar, 4-5 bar
    if re.search(r"\d+\s*[-–]?\s*\d*\s*bar\b", v_str, re.IGNORECASE):
        return "max_pressure_bar"
    
    # Volume/capacity: 600 ml, 50 L
    if re.search(r"\d+\s*[mM][lL]\b|\d+\s*[Ll]\b", v_str):
        return "capacity"
    
    # Flow rate: 250-300 L/min, 150 l/min
    if re.search(r"\d+\s*[-–]?\s*\d*\s*[Ll]/min", v_str):
        return "air_consumption_l_min"
    
    # Weight: 0.2 kg, 5,5 kg
    if re.search(r"\d+[,.]?\d*\s*kg\b", v_str):
        return "net_weight_kg"
    
    # Diameter: Ø 50, Ø50mm
    if re.search(r"Ø\s*\d+", v_str):
        return "diameter_mm"
    
    # Dimensions: 350 x 500 x 450
    if re.search(r"\d+\s*x\s*\d+\s*x\s*\d+", v_str):
        return "dimensions_mm"
    
    # Length/size in mm: 100 mm, 160 mm (nozzle length)
    if re.search(r"^\d+\s*mm$", v_str):
        return "size_mm"
    
    # Voltage: 230V / 50 Hz
    if re.search(r"\d+\s*[Vv]", v_str):
        return "voltage"
    
    # Temperature: -20°C, +60°C
    if re.search(r"[+-]?\d+\s*°C", v_str):
        return "temperature_c"
    
    # Amperage: 4 A, 6.3 A
    if re.search(r"^\d+[,.]?\d*\s*A\b", v_str):
        return "amperage"
    
    # Piece count: 6 pcs, 7 pcs
    if re.search(r"\d+\s*pcs", v_str, re.IGNORECASE):
        return "content_count_pcs"
    
    # System type: Euro, Orion (short text without numbers)
    if v_str in ["Euro", "Orion", "EURO", "ORION"]:
        return "system_type"
    
    # Nozzle feature descriptions: "Short 20 mm", "Long 160 mm", "Turbo"
    if re.search(r"(Short|Long|Turbo)\s*\d*", v_str, re.IGNORECASE):
        return "nozzle_feature"
    
    # Material types: PU, Nylon, Rubber, Steel, etc.
    if v_str in ["PU", "Nylon", "Rubber", "Steel", "Aluminium", "Aluminum", "Cast iron", "Plastic"]:
        return "wheel_material"
    
    # Range values with hyphen: 85-200 (lift range)
    if re.search(r"^\d+\s*[-–]\s*\d+$", v_str) and "bar" not in v_str.lower():
        return "range_mm"
    
    # Pure numeric values - try to infer from magnitude
    if re.match(r"^\d+$", v_str):
        num = int(v_str)
        # Large numbers likely weight capacity (kg)
        if num >= 500 and num <= 10000:
            return "load_capacity_kg"
        # Medium numbers could be lengths (mm)
        elif num >= 50 and num < 500:
            return "dimension_mm"
        # Small numbers could be counts or small measurements
        elif num < 50:
            return "count_or_small_dim"
    
    # Default: use column index
    return f"spec_{col_idx}"


def extract_kranzle_transposed(table: ExtractedTable) -> List[Dict[str, Any]]:
    """Extract Kranzle product data from their specific table format.

    Kranzle PDFs have tables where:
    - Header row: ['MODEL', None, 'K 1152 TS\\nK 1152 TST', None] or similar
    - Data rows: ['Art.-nr. TS...', '', '602010', ''] or spec rows
    - The actual data is typically in column 2 (index 2)
    
    Also handles accessory tables with format:
    - ['Hogedrukslang...', 'm | Art.-nr.', '10 (DN 6) | 43416']
    """
    if not table.rows and not table.header:
        return []

    header = [normalize_header_cell(h) for h in table.header]
    rows = [clean_row(r) for r in table.rows]
    
    # Kranzle SKU pattern: 5-6 digit article numbers, optionally with suffix
    kranzle_sku_pattern = re.compile(r'^\d{5,6}(-\d+)?$')
    
    products: List[Dict[str, Any]] = []
    
    # Check if this is a MODEL table (header contains 'MODEL')
    header_str = " ".join(str(h) for h in header if h)
    if "MODEL" in header_str.upper():
        # Find model names from header - they appear after 'MODEL' label
        # Header format: ['MODEL', None, 'K 1152 TS\nK 1152 TST', None, 'Model2', None, ...]
        model_columns: List[Tuple[int, str]] = []  # (column_index, model_name)
        for idx, h in enumerate(header):
            if h and str(h).strip() and str(h).upper() != "MODEL":
                model_name = str(h).strip().replace("\n", " / ")
                model_columns.append((idx, model_name))
        
        if not model_columns:
            return []
        
        # Extract Art.-nr. values from rows for each model column
        for row in rows:
            if len(row) < 3:
                continue
            label = str(row[0]).strip() if row[0] else ""
            
            # Check for Art.-nr. rows
            if "art" in label.lower() and "nr" in label.lower():
                # Extract SKU for each model column
                for col_idx, model_name in model_columns:
                    if col_idx < len(row):
                        val = row[col_idx]
                        if val and isinstance(val, str):
                            val = val.strip()
                            if kranzle_sku_pattern.match(val):
                                # Use model name as series for grouping
                                series_slug = slugify(model_name.split("/")[0].strip())
                                products.append({
                                    "model": model_name,
                                    "sku": val,
                                    "variant_type": label,
                                    "series_id": series_slug,
                                    "series_name": model_name,
                                })
        return products
    
    # Check if this is a specs table (first column has spec names)
    # These don't contain SKUs, so we return empty
    first_col_labels = [str(row[0]).strip().lower() if row and row[0] else "" for row in rows]
    if any(label in ["werkdruk", "doorloopcapaciteit", "motortoerental", "vermogenopname"] 
           for label in first_col_labels):
        # This is a specs table - we'll merge specs later
        return []
    
    # Check if this is an accessories table (contains 'Art.-nr.' in second column header)
    if len(header) >= 2:
        second_col = str(header[1]).lower() if header[1] else ""
        if "art" in second_col and "nr" in second_col:
            # Accessories table format: [description, 'unit | Art.-nr.', 'value | sku']
            for row in [header] + rows:
                if len(row) < 3:
                    continue
                description = str(row[0]).strip() if row[0] else ""
                value_col = str(row[2]).strip() if len(row) > 2 and row[2] else ""
                
                if "|" in value_col:
                    parts = value_col.split("|")
                    for part in parts:
                        part = part.strip()
                        if kranzle_sku_pattern.match(part):
                            desc_clean = description.replace("\n", " ")
                            series_slug = slugify(desc_clean.split()[0] if desc_clean else "accessory")
                            products.append({
                                "model": desc_clean,
                                "sku": part,
                                "accessory": True,
                                "series_id": f"kranzle-accessory-{series_slug}",
                                "series_name": desc_clean,
                            })
                            break
    
    return products


# ============================================================================
# MAKITA PRICE AND PROPERTY EXTRACTION - Regex-based parsing
# ============================================================================

# Regex patterns for extracting prices from various Makita catalog formats
PRICE_PATTERNS = [
    # Standard format: "€ 495,00" or "€495,00" or "€ 1.495,00"
    re.compile(r"€\s*([\d.]+,\d{2})"),
    # With space in number: "€ 419 ,00"
    re.compile(r"€\s*([\d.]+)\s*,\s*(\d{2})"),
    # Price range: "€ 495,00 - € 595,00" (take first)
    re.compile(r"€\s*([\d.]+,\d{2})\s*[-–]"),
]

# Regex patterns for extracting technical properties
PROPERTY_PATTERNS = {
    # Voltage patterns: "18V", "2 x 18V", "40Vmax", "230V"
    'voltage_v': re.compile(r"(\d+)\s*[Vv](?:max)?(?:\s|$)"),
    'dual_voltage': re.compile(r"(\d+)\s*x\s*(\d+)\s*[Vv]"),
    # Power patterns: "1400W", "1,4 kW", "2.1kW"
    'power_w': re.compile(r"(\d+(?:[.,]\d+)?)\s*[Ww](?:att)?(?:\s|$)"),
    'power_kw': re.compile(r"(\d+(?:[.,]\d+)?)\s*[kK][Ww]"),
    # Weight patterns: "5,4 kg", "13.0kg"
    'weight_kg': re.compile(r"(\d+(?:[.,]\d+)?)\s*[kK][gG]"),
    # Dimensions: "190 mm", "32mm", "6,00 mm"
    'dimension_mm': re.compile(r"(\d+(?:[.,]\d+)?)\s*[mM][mM]"),
    # RPM: "2800 rpm", "0-2800 min-1"
    'rpm': re.compile(r"(\d+(?:\s*[-–]\s*\d+)?)\s*(?:rpm|min-1|omw/min)", re.IGNORECASE),
    # Torque: "136 Nm", "7,2 Nm"
    'torque_nm': re.compile(r"(\d+(?:[.,]\d+)?)\s*[Nn][mM]"),
    # Capacity: "32 mm (beton)", "13 mm (hout)"
    'capacity_mm': re.compile(r"(\d+(?:[.,]\d+)?)\s*[mM][mM]\s*\([^)]+\)"),
    # Battery: "BL1850B", "BL4040"
    'battery_model': re.compile(r"\b(BL\d{4}[A-Z]?)\b"),
    # Charger: "DC18RD", "DC40RA"
    'charger_model': re.compile(r"\b(DC\d{2}[A-Z]{1,2})\b"),
}


def parse_euro_price(value: str) -> Optional[float]:
    """Parse a Euro price string to float.
    
    Handles formats like:
    - "€ 495,00" -> 495.00
    - "€ 1.495,00" -> 1495.00
    - "€ 419 ,00" -> 419.00
    - "5,4 kg\n€ 589,00" -> 589.00
    
    Returns:
        Float price or None if not parseable
    """
    if not value or "€" not in str(value):
        return None
    
    value_str = str(value)
    
    # Try each pattern
    for pattern in PRICE_PATTERNS:
        match = pattern.search(value_str)
        if match:
            try:
                if len(match.groups()) == 2:
                    # Pattern with separated decimal: "419 ,00"
                    price_str = f"{match.group(1)},{match.group(2)}"
                else:
                    price_str = match.group(1)
                
                # Normalize: remove thousand separators (.), replace decimal comma with dot
                price_str = price_str.replace(".", "").replace(",", ".")
                return float(price_str)
            except (ValueError, AttributeError):
                continue
    
    return None


def extract_makita_prices(record: Dict[str, Any]) -> None:
    """Extract prices from all fields in a Makita product record.
    
    Searches all string fields for € symbols and extracts prices.
    Sets price_excl_btw and/or price_incl_btw based on field name context.
    
    Args:
        record: Product record dict (modified in place)
    """
    price_excl = None
    price_incl = None
    
    for key, value in list(record.items()):
        if not isinstance(value, str) or "€" not in value:
            continue
        
        price = parse_euro_price(value)
        if price is None:
            continue
        
        key_lower = key.lower()
        
        # Determine if excl or incl BTW based on field name
        if "excl" in key_lower and "incl" not in key_lower:
            if price_excl is None:
                price_excl = price
        elif "incl" in key_lower:
            if price_incl is None:
                price_incl = price
        elif "prijs" in key_lower or "price" in key_lower:
            # Generic price field - assume excl BTW (B2B catalog)
            if price_excl is None:
                price_excl = price
        else:
            # Field contains € but no clear indicator - check for both in value
            if "excl" in value.lower():
                if price_excl is None:
                    price_excl = price
            elif "incl" in value.lower():
                if price_incl is None:
                    price_incl = price
            else:
                # Default to excl BTW for B2B catalogs
                if price_excl is None:
                    price_excl = price
    
    # Set extracted prices
    if price_excl is not None:
        record["price_excl_btw"] = price_excl
    if price_incl is not None:
        record["price_incl_btw"] = price_incl
    
    # If we have incl but not excl, calculate excl (21% BTW in Belgium/Netherlands)
    if price_incl is not None and price_excl is None:
        record["price_excl_btw"] = round(price_incl / 1.21, 2)
    # If we have excl but not incl, calculate incl
    elif price_excl is not None and price_incl is None:
        record["price_incl_btw"] = round(price_excl * 1.21, 2)


def normalize_makita_properties(record: Dict[str, Any]) -> None:
    """Normalize and extract structured properties from Makita product fields.
    
    Uses regex patterns to extract:
    - Voltage (V, dual voltage)
    - Power (W, kW)
    - Weight (kg)
    - Dimensions (mm)
    - RPM
    - Torque (Nm)
    - Battery/charger models
    
    Args:
        record: Product record dict (modified in place)
    """
    # Collect all text values for pattern matching
    all_text = " ".join(str(v) for v in record.values() if isinstance(v, str))
    
    # Extract voltage
    dual_match = PROPERTY_PATTERNS['dual_voltage'].search(all_text)
    if dual_match:
        count = int(dual_match.group(1))
        voltage = int(dual_match.group(2))
        if 'voltage' not in record:
            record['voltage'] = f"{count} x {voltage}V"
            record['voltage_v'] = voltage
            record['voltage_total_v'] = count * voltage
    else:
        volt_match = PROPERTY_PATTERNS['voltage_v'].search(all_text)
        if volt_match and 'voltage_v' not in record:
            record['voltage_v'] = int(volt_match.group(1))
    
    # Extract power
    kw_match = PROPERTY_PATTERNS['power_kw'].search(all_text)
    if kw_match and 'power_kw' not in record:
        power_str = kw_match.group(1).replace(",", ".")
        record['power_kw'] = float(power_str)
    else:
        w_match = PROPERTY_PATTERNS['power_w'].search(all_text)
        if w_match and 'power_w' not in record:
            power_str = w_match.group(1).replace(",", ".")
            record['power_w'] = float(power_str)
    
    # Extract weight
    weight_match = PROPERTY_PATTERNS['weight_kg'].search(all_text)
    if weight_match and 'weight_kg' not in record:
        weight_str = weight_match.group(1).replace(",", ".")
        record['weight_kg'] = float(weight_str)
    
    # Extract torque
    torque_match = PROPERTY_PATTERNS['torque_nm'].search(all_text)
    if torque_match and 'torque_nm' not in record:
        torque_str = torque_match.group(1).replace(",", ".")
        record['torque_nm'] = float(torque_str)
    
    # Extract RPM
    rpm_match = PROPERTY_PATTERNS['rpm'].search(all_text)
    if rpm_match and 'rpm' not in record:
        record['rpm'] = rpm_match.group(1).replace(" ", "")
    
    # Extract battery model
    battery_match = PROPERTY_PATTERNS['battery_model'].search(all_text)
    if battery_match and 'battery_model' not in record:
        record['battery_model'] = battery_match.group(1)
    
    # Extract charger model
    charger_match = PROPERTY_PATTERNS['charger_model'].search(all_text)
    if charger_match and 'charger_model' not in record:
        record['charger_model'] = charger_match.group(1)


def extract_makita_transposed(table: ExtractedTable) -> List[Dict[str, Any]]:
    """Transform Makita spec-vs-model matrix so each model becomes an object.

    Makita catalogs have transposed tables where:
    - First column: spec names (Spanning, Max.koppel, Boorkop, etc.)
    - Header row: model codes (DF002GZ01, HP001GM201, etc.)
    - Each column is a product variant

    Model codes matching patterns like XX###XX## are treated as SKUs.
    """
    if not table.rows:
        return []

    # Include header row as first logical row to know model names
    header = [normalize_header_cell(h) for h in table.header]
    rows = [header] + [clean_row(r) for r in table.rows]

    if not rows or len(rows[0]) < 2:
        return []

    model_names = rows[0][1:]
    models: List[Dict[str, Any]] = []

    # Makita model code pattern: 2+ letters, digits, optional letters/digits
    # Examples: DF002GZ01, HP001GM201, DA001GZ01, HR007GZ01, DLM330Z, BL4040
    makita_sku_pattern = re.compile(r"^[A-Z]{2,}[0-9]+[A-Z0-9]*$", re.IGNORECASE)

    for col_idx, model in enumerate(model_names, start=1):
        if model is None or str(model).strip() == "":
            continue

        model_str = str(model).strip()
        m: Dict[str, Any] = {"model": model_str}

        # If model name looks like a Makita SKU, set it as sku
        if makita_sku_pattern.match(model_str):
            m["sku"] = model_str

        for r in rows[1:]:
            if col_idx >= len(r):
                continue
            spec_name_raw = r[0]
            if spec_name_raw is None or str(spec_name_raw).strip() == "":
                continue
            spec_name = slugify_header(normalize_header_cell(spec_name_raw))
            value = r[col_idx]
            if isinstance(value, str):
                value = value.strip()
            if value:  # Only add non-empty values
                m[spec_name] = value

        # Extract price from any field containing € symbol
        extract_makita_prices(m)
        
        # Parse and normalize property values using regex
        normalize_makita_properties(m)

        models.append(m)

    return models


# NOTE: The following build_*_catalog functions have been removed in favor of
# the unified flatten_records_with_grouping() approach:
# - build_zuigerpompen_product_series
# - build_verzinkte_buizen_catalog  
# - build_zwarte_draad_flat
# - build_slangkoppelingen_catalog
# - build_kranzle_catalog
#
# All PDFs now output flat JSON arrays with grouping metadata (series_id, series_name, etc.)


# ------------------------
# Flat output with grouping metadata
# ------------------------


def generate_series_id(category: Optional[str], pdf_name: str, include_pdf_prefix: bool = True) -> str:
    """Generate a unique series identifier from category and PDF name.
    
    Args:
        category: The table header / series name (e.g., "ABS KNIE 90°")
        pdf_name: The source PDF filename
        include_pdf_prefix: If True, prefix with PDF stem to avoid cross-PDF collisions
        
    Returns:
        Unique series_id like "abs-persluchtbuizen__abs-knie-90"
    """
    pdf_stem = slugify(pdf_name.replace(".pdf", "")) or "unknown"
    
    if category:
        slug = slugify(category)
        if slug:
            if include_pdf_prefix:
                return f"{pdf_stem}__{slug}"
            return slug
    
    # Fallback to PDF stem only
    return pdf_stem


def flatten_records_with_grouping(records: List[Dict[str, Any]], pdf_name: str) -> List[Dict[str, Any]]:
    """Convert all records to flat format with grouping metadata.
    
    Each record gets:
    - sku: the canonical SKU field
    - series_id: slugified grouping key for client-side aggregation
    - series_name: human-readable series/category name
    - All original fields preserved
    - Inherited specs denormalized from _context.product_specs
    """
    flat: List[Dict[str, Any]] = []
    
    for rec in records:
        if not isinstance(rec, dict):
            continue
        
        ctx = rec.get("_context") or {}
        enr = rec.get("_enriched") or {}
        product_specs = ctx.get("product_specs") or {}
        
        # Build the flat record
        out: Dict[str, Any] = {}
        
        # 1. SKU - canonical field
        sku = rec.get("sku")
        if not sku:
            # Try common alternatives in priority order
            for k in ("order_number", "bestelnr", "code", "model"):
                v = rec.get(k)
                if isinstance(v, str) and v.strip():
                    sku = v.strip()
                    break
        
        # If still no SKU, check col_0 and col_1 with smart detection
        if not sku:
            col_0 = rec.get("col_0")
            col_1 = rec.get("col_1")
            
            # col_0 looks like a measurement (e.g., "1/2"", "3/4"", "1 "", "20 mm") -> use col_1 as SKU
            if isinstance(col_0, str) and re.match(r'^[\d/]+\s*["\']?$|^\d+\s*mm$', col_0.strip()):
                if isinstance(col_1, str) and col_1.strip():
                    sku = col_1.strip()
            # col_1 looks like a numeric article code (e.g., "45349") -> use col_1 as SKU
            elif isinstance(col_1, str) and re.match(r'^\d{4,}$', col_1.strip()):
                sku = col_1.strip()
            # Fallback to col_0 if it looks like an SKU (alphanumeric code)
            elif isinstance(col_0, str) and re.match(r'^[A-Z]{2,}[A-Z0-9]+$', col_0.strip(), re.IGNORECASE):
                sku = col_0.strip()
            elif isinstance(col_0, str) and col_0.strip():
                sku = col_0.strip()
        
        # Validate SKU - skip records with invalid/placeholder SKUs
        if sku:
            sku_str = str(sku).strip()
            # Remove common PDF artifacts (checkmarks, bullets, etc.)
            sku_str = re.sub(r'[\uf0fc\uf0fb\uf0a7\u2022\u2713\u2714]', '', sku_str).strip()
            # Invalid patterns: "- -", "- XX cm", empty, just dashes/spaces, single dash
            invalid_sku_patterns = [
                r'^-\s*-$',           # "- -"
                r'^-\s+\d+',          # "- 11,5 cm", "- 25 cm"
                r'^-+\s*$',           # "---", "--", "- ", "-"
                r'^\s*$',             # empty/whitespace
                r'^\d+\s*-\s*$',      # "0 -", "1 -" (placeholder)
            ]
            is_invalid = any(re.match(p, sku_str) for p in invalid_sku_patterns)
            if is_invalid:
                continue  # Skip this record entirely
            # Update sku with cleaned version
            sku = sku_str
        else:
            continue  # Skip records without SKU
        
        # 1b. Makita-specific: If SKU doesn't look like a valid model code,
        # try to extract from series_name or application field
        if "makita" in pdf_name.lower():
            makita_model_pattern = re.compile(r'^[A-Z]{2,3}\d{3,}[A-Z0-9]*$', re.IGNORECASE)
            if not makita_model_pattern.match(sku):
                # Try series_name - often contains the actual model code
                series_name_raw = ctx.get("series_name", "")
                if series_name_raw:
                    # Extract first valid model code from series_name
                    # e.g., "UC010GZ UC010GT101 UC011GZ UC011GT101" -> "UC010GZ"
                    for part in str(series_name_raw).split():
                        if makita_model_pattern.match(part):
                            sku = part
                            break
                
                # If still invalid, try application field
                if not makita_model_pattern.match(sku):
                    app = ctx.get("application", "") or rec.get("application", "")
                    if app:
                        for part in str(app).split():
                            if makita_model_pattern.match(part):
                                sku = part
                                break
                
                # Final check - if still invalid, skip this record
                if not makita_model_pattern.match(sku):
                    continue
        
        # 1c. Kranzle-specific: Validate SKU is a proper article number (5-6 digits)
        if "kranzle" in pdf_name.lower():
            kranzle_sku_pattern = re.compile(r'^\d{5,6}(-\d+)?$')
            if not kranzle_sku_pattern.match(sku):
                # Try to extract from art_nr fields or model
                for field in ["art_nr", "art_nr_ts_zonder_slanghaspel", "art_nr_tst_incl_slanghaspel"]:
                    val = rec.get(field)
                    if val and isinstance(val, str):
                        val = val.strip()
                        if kranzle_sku_pattern.match(val):
                            sku = val
                            break
                        # Try extracting from pipe-separated value
                        if "|" in val:
                            for part in val.split("|"):
                                part = part.strip()
                                if kranzle_sku_pattern.match(part):
                                    sku = part
                                    break
                # If still invalid, skip
                if not kranzle_sku_pattern.match(sku):
                    continue
        
        out["sku"] = sku
        
        # 2. Series/grouping metadata - prefer explicit series_id from context
        category = ctx.get("category")
        application = ctx.get("application")
        
        # Use series_id from context if available (from DEMA blue header detection)
        ctx_series_id = ctx.get("series_id")
        ctx_series_name = ctx.get("series_name")
        
        if ctx_series_id:
            out["series_id"] = ctx_series_id
        else:
            out["series_id"] = generate_series_id(category, pdf_name)
        
        if ctx_series_name:
            out["series_name"] = ctx_series_name
        else:
            out["series_name"] = category or pdf_name.replace(".pdf", "").replace("-", " ").title()
        
        # 2b. Improve series detection for messing/rvs fittings using SKU patterns
        # If series_name is a poor placeholder, try to infer from SKU
        poor_series_names = ["Bestelnr Maat", "Bestelnr Maten", "bestelnr maat"]
        if out.get("series_name") in poor_series_names or (
            out.get("series_name") and re.match(r'^(MF|RVS)\d+', str(out.get("series_name")))
        ):
            inferred_series = infer_series_from_sku(sku, pdf_name)
            if inferred_series:
                out["series_id"] = inferred_series[0]
                out["series_name"] = inferred_series[1]
        
        # 3. Source PDF and page info for traceability
        out["source_pdf"] = ctx.get("source_pdf")
        out["page"] = ctx.get("page_number")
        
        # 4. Brand (from product_specs or context)
        brand = product_specs.get("brand") or ctx.get("brand")
        if brand:
            out["brand"] = brand
        
        # 5. Copy all non-internal fields from original record
        for k, v in rec.items():
            if k.startswith("_"):  # Skip _context, _enriched
                continue
            if k == "sku":  # Already handled
                continue
            out[k] = v
        
        # 5b. Normalize property keys to consistent names
        # First, rename Dutch/variant keys to standard English
        KEY_NORMALIZATION = {
            # Size/dimensions
            "maat": "size",
            "afmeting": "size",
            "diameter": "diameter_mm",
            "lengte": "length_mm",
            "breedte": "width_mm",
            "hoogte": "height_mm",
            "dikte": "thickness_mm",
            "wanddikte": "wall_thickness_mm",
            # Pressure
            "druk": "pressure_bar",
            "werkdruk": "pressure_bar",
            "max_druk": "max_pressure_bar",
            "pn": "pressure_rating",
            # Weight
            "gewicht": "weight_kg",
            # Connection
            "aansluiting": "connection",
            "draad": "thread",
            "binnendraad": "thread_female",
            "buitendraad": "thread_male",
            # Flow/capacity
            "debiet": "flow_rate",
            "capaciteit": "capacity",
            "inhoud": "volume",
            # Power
            "vermogen": "power_w",
            "spanning": "voltage_v",
            # Material
            "materiaal": "material",
        }
        
        normalized_out: Dict[str, Any] = {}
        for k, v in out.items():
            k_lower = k.lower().replace(" ", "_")
            new_key = KEY_NORMALIZATION.get(k_lower, k)
            normalized_out[new_key] = v
        out = normalized_out
        
        # 5c. Rename generic col_N fields to semantic names based on value patterns
        col_renames: Dict[str, str] = {}
        
        for k, v in list(out.items()):
            if not k.startswith("col_") or not isinstance(v, str):
                continue
            v_stripped = v.strip()
            
            # Fitting sizes with x (e.g., "1/2" x 3/8"", "3/4 x 1/2", "1" x 3/4"")
            if re.search(r'[\d/]+.*[xX×].*[\d/]+', v_stripped):
                col_renames[k] = "size"
            # Single fraction measurements (e.g., "1/2"", "3/4"", "1/2", "1"")
            elif re.match(r'^[\d/]+\s*["\'"″]?\s*$', v_stripped) and len(v_stripped) < 15:
                col_renames[k] = "size"
            # Length in mm (e.g., "125 mm", "200 mm") - but NOT if it's actually weight
            elif re.match(r'^\d+\s*mm$', v_stripped, re.IGNORECASE) and 'kg' not in v_stripped.lower():
                col_renames[k] = "length_mm"
            # Diameter in mm (e.g., "Ø 25", "25 Ø")
            elif re.search(r'[Øø]\s*\d+|\d+\s*[Øø]', v_stripped):
                col_renames[k] = "diameter_mm"
            # Multiple sizes separated by / (e.g., "10 / 11 / 13 / ... mm")
            elif re.search(r'\d+\s*/\s*\d+.*mm', v_stripped):
                col_renames[k] = "socket_sizes"
            # Weight (e.g., "19 kg", "2,5 kg")
            elif re.match(r'^[\d,\.]+\s*kg$', v_stripped, re.IGNORECASE):
                col_renames[k] = "weight_kg"
            # Pressure (e.g., "10 bar", "16 bar")
            elif re.match(r'^[\d,\.]+\s*bar$', v_stripped, re.IGNORECASE):
                col_renames[k] = "pressure_bar"
            # Length in meters (e.g., "5 m", "10m")
            elif re.match(r'^[\d,\.]+\s*m$', v_stripped, re.IGNORECASE):
                col_renames[k] = "length_m"
            # Volume in liters (e.g., "50 L", "100 l")
            elif re.match(r'^[\d,\.]+\s*[lL]$', v_stripped):
                col_renames[k] = "volume_l"
            # Product type/model names (e.g., "VORTEX 200", "DAB K30/70")
            # col_0 with uppercase product names -> type
            elif k == "col_0" and re.match(r'^[A-Z][A-Z0-9\s/\-]+$', v_stripped) and len(v_stripped) > 3:
                col_renames[k] = "model_name"
        
        for old_key, new_key in col_renames.items():
            if old_key in out and new_key not in out:
                out[new_key] = out.pop(old_key)
        
        # 6. Denormalize inherited product specs
        for spec_key, spec_val in product_specs.items():
            if spec_key == "brand":  # Already handled
                continue
            # Prefix with spec_ to avoid collisions
            out[f"spec_{spec_key}"] = spec_val
        
        # 7. Application as separate field
        if application:
            out["application"] = application
        
        # 8. Material detection from SKU prefix
        if sku and not out.get("material"):
            material_info = detect_material_from_sku(sku)
            if material_info:
                out["material"] = material_info[0]
                out["material_name"] = material_info[1]
        
        # 8b. Messing SKU decoding - extract size from SKU pattern if not already present
        if sku and not out.get("size"):
            decoded = decode_messing_sku_sizes(sku, out.get("series_name", ""))
            if decoded:
                for dec_key, dec_val in decoded.items():
                    if dec_key not in out or not out[dec_key]:
                        out[dec_key] = dec_val
        
        # 9. Seal material and connection type from specs text
        specs_text = ctx.get("specs_text") or product_specs.get("specs_text")
        if specs_text:
            out["specs_text"] = specs_text
            
            seal_info = detect_seal_material(specs_text)
            if seal_info:
                out["seal_material"] = seal_info[0]
                out["seal_material_name"] = seal_info[1]
            
            conn_type = detect_connection_type(specs_text)
            if conn_type:
                out["connection_type"] = conn_type
        
        # 10. Image paths (from context)
        images = ctx.get("images") or []
        if images:
            out["image"] = images[0] if images else ""
            out["images"] = images
        
        # 11. Preserve enriched data under a cleaner structure
        if enr:
            out["_enriched"] = enr
        
        flat.append(out)
    
    # Sort by SKU for consistent output
    flat.sort(key=lambda x: str(x.get("sku") or x.get("series_id") or ""))
    
    return flat


# ============================================================================
# PDF CONFIGURATION - Pages to skip, extraction settings per PDF type
# ============================================================================

PDF_CONFIG = {
    "airpress-catalogus-eng": {
        "skip_pages": {
            35,         # Piston pump specifications (no SKUs, just model specs)
            37,         # Controller feature comparison (MAM-860 vs MAM-6080)
            110, 114,   # Roller cabinet feature descriptions (marketing content)
            131, 132, 133,  # Explanation of Pictograms pages
        },
        "extractor": "airpress",
        "sku_field": "article_sku",
        "extract_images": True,
    },
    "airpress-catalogus-nl-fr": {
        "skip_pages": {
            2, 3,       # Index/Table of Contents and Noise Level Reference
            23,         # Controller feature comparison
            63, 64, 65, # Marketing/feature pages
            66,         # Marketing/feature page
            80, 81, 82, # Symbol Legend pages (Symbolen/Symbole/Légende)
        },
        "extractor": "airpress",
        "sku_field": "article_sku",
        "extract_images": True,
    },
    "bronpompen": {
        "skip_pages": set(),
        "extractor": "bronpompen",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
    },
    "drukbuizen": {
        "skip_pages": set(),
        "extractor": "drukbuizen",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
    },
    "kunststof-afvoerleidingen": {
        "skip_pages": set(),
        "extractor": "drukbuizen",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
    },
    "kranzle": {
        "skip_pages": set(),
        "extractor": "kranzle_transposed",
        "extract_images": True,
    },
    "makita": {
        "skip_pages": set(),
        "extractor": "makita_transposed",
        "extract_images": True,
    },
    "airpress": {
        "skip_pages": set(),
        "extract_images": True,
    },
    "dompelpompen": {
        "skip_pages": set(),
        "extract_images": True,
    },
    "centrifugaalpompen": {
        "skip_pages": set(),
        "extract_images": True,
    },
    "bronpompen": {
        "skip_pages": set(),
        "extract_images": True,
    },
    "zuigerpompen": {
        "skip_pages": set(),
        "extract_images": True,
    },
    # Fittings catalogs with NR X - PRODUCT NAME pattern
    "messing-draadfittingen": {
        "skip_pages": {1, 2},  # Cover and index pages
        "extractor": "generic",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
        "extract_images": True,
        "detect_series": True,
    },
    "rvs-draadfittingen": {
        "skip_pages": {1, 2},  # Cover and index pages
        "extractor": "generic",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
        "extract_images": True,
        "detect_series": True,
    },
    "slangkoppelingen": {
        "skip_pages": {1, 2},
        "extractor": "generic",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
        "extract_images": True,
    },
    "verzinkte-buizen": {
        "skip_pages": set(),
        "extractor": "generic",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
        "extract_images": True,
    },
    "zwarte-draad-en-lasfittingen": {
        "skip_pages": set(),
        "extractor": "generic",
        "sku_field": "bestelnr",
        "skip_empty_sku": True,
        "extract_images": True,
    },
    "digitale-versie-pompentoebehoren": {
        "skip_pages": set(),
        "extract_images": True,
    },
    "pomp-specials": {
        "skip_pages": set(),
        "extract_images": True,
    },
    "catalogus-aandrijftechniek": {
        "skip_pages": set(),
        "extract_images": True,
    },
}


def get_pdf_config(pdf_name: str) -> Dict[str, Any]:
    """Get configuration for a PDF based on its filename."""
    name_lower = pdf_name.lower()
    for key, config in PDF_CONFIG.items():
        if key in name_lower:
            return config
    return {"skip_pages": set(), "extractor": "generic"}


# ------------------------
# Driver per PDF
# ------------------------


def process_pdf(
    pdf_path: Path,
    output_dir: Path,
    clean_images: bool = False,
) -> Dict[str, Any]:
    name = pdf_path.name.lower()
    records: List[Dict[str, Any]] = []
    config = get_pdf_config(name)
    skip_pages = config.get("skip_pages", set())

    # Optional destructive cleanup: remove previous extracted images for this PDF so
    # regenerated outputs don't mix old/new assets.
    if clean_images:
        try:
            shutil.rmtree(IMAGE_DIR / pdf_path.stem, ignore_errors=True)
        except Exception:
            pass

    # Check if this is a DEMA catalog (has DEMA footer on first few pages)
    is_dema_catalog = False
    detect_series = config.get("detect_series", False)
    extract_images_flag = config.get("extract_images", False)
    
    with pdfplumber.open(str(pdf_path)) as pdf:
        print(f"  Opened {pdf_path.name} with {len(pdf.pages)} pages")
        
        # Check first 5 pages for DEMA footer to determine catalog type
        for check_page in pdf.pages[:5]:
            if has_dema_footer(check_page):
                is_dema_catalog = True
                detect_series = True
                extract_images_flag = True
                print(f"    Detected DEMA catalog format (blue footer found)")
                break
        
        current_category: Optional[str] = None
        current_series_slug: Optional[str] = None
        current_series_name: Optional[str] = None
        current_specs_text: Optional[str] = None
        current_images: List[str] = []
        current_images_with_bboxes: List[Tuple[str, Tuple[float, float, float, float]]] = []

        # Pomp-specials continuation pages: carry forward page-level context when the table continues.
        last_pomp_specials_product_specs: Optional[Dict[str, str]] = None
        last_pomp_specials_application_text: Optional[str] = None
        last_pomp_specials_header: Optional[List[str]] = None
        
        for page_number, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text() or ""
            # Skip non-product pages based on config
            if page_number in skip_pages:
                continue
            
            # NOTE: We no longer skip pages based on DEMA footer detection per-page
            # The footer detection is used only to identify DEMA catalog format initially
            # Individual pages may not have detectable footers due to PDF structure
                
            tables = find_tables_with_bboxes(page)
            if not tables:
                continue

            print(f"    Page {page_number}: found {len(tables)} tables")
            
            # For draadfittingen catalogs, use page-level series detection due to multi-column layout
            page_series_list: List[Tuple[str, str]] = []
            page_mid_x: float = page.width / 2 if page else 300.0
            is_draadfittingen = "rvs-draadfittingen" in name or "messing-draadfittingen" in name or "zwarte-draad-en-lasfittingen" in name or "verzinkte-buizen" in name or "slangkoppelingen" in name or "slangklemmen" in name
            page_text = page.extract_text() or ""
            
            # Special handling for LANGSNAAD GELASTE RVS BUIS - use text-based extraction
            if is_draadfittingen and "LANGSNAAD GELASTE RVS BUIS" in page_text:
                langsnaad_products = extract_langsnaad_products_from_text(page_text)
                if langsnaad_products:
                    print(f"      LANGSNAAD text extraction: {len(langsnaad_products)} products")
                    # Get page images
                    page_images = []
                    if extract_images_flag:
                        page_images_with_bboxes = extract_images_with_bboxes_from_page(pdf_path, page_number, "langsnaad-gelaste-rvs-buis")
                        page_images = [p for p, _ in page_images_with_bboxes]
                    
                    for prod in langsnaad_products:
                        prod["source_pdf"] = pdf_path.name
                        prod["page"] = page_number
                        if page_images:
                            prod["image"] = page_images[0]
                            prod["images"] = page_images
                        prod = enrich_record(prod)
                        records.append(prod)
                    continue  # Skip normal table processing for this page
            
            # For draadfittingen pages with two-column layout, use text-based extraction
            if is_draadfittingen:
                page_series_list = extract_all_series_from_page(page_text)
                text_products = []
                catalog_type = ""
                
                # RVS draadfittingen (9-prefixed SKUs)
                if "rvs-draadfittingen" in name:
                    has_skus = bool(re.search(r'9(?:ZF|BUL|LAK|LAT|LAE|LAR|LABR|ZFBF|LAN|LAS|LAF|LAFL|ZFVL|ZFGF)[A-Z]*\d+', page_text))
                    if has_skus and len(page_series_list) >= 1:
                        text_products = extract_rvs_draadfittingen_from_text(page_text, page_series_list, page_mid_x)
                        catalog_type = "RVS"
                
                # Messing draadfittingen (MF-prefixed SKUs)
                elif "messing-draadfittingen" in name:
                    has_skus = bool(re.search(r'MF\d+', page_text))
                    if has_skus and len(page_series_list) >= 1:
                        text_products = extract_messing_draadfittingen_from_text(page_text, page_series_list, page_mid_x)
                        catalog_type = "MESSING"
                
                # Zwarte draad- en lasfittingen (7-prefixed SKUs)
                elif "zwarte-draad-en-lasfittingen" in name:
                    has_skus = bool(re.search(r'7(?:ZF|GB|BUL|LAK|LAT|LAE|LAR|LABR|ZFBF|LAN|LAS|LAF)[A-Z]*\d+', page_text))
                    if has_skus and len(page_series_list) >= 1:
                        text_products = extract_zwarte_draadfittingen_from_text(page_text, page_series_list, page_mid_x)
                        catalog_type = "ZWARTE"
                
                # Verzinkte buizen (ZF, GB, BUL prefixed SKUs without 7)
                elif "verzinkte-buizen" in name:
                    has_skus = bool(re.search(r'(?<![0-9])(?:ZF|GB|BUL)\d+', page_text))
                    if has_skus and len(page_series_list) >= 1:
                        text_products = extract_verzinkte_buizen_from_text(page_text, page_series_list, page_mid_x)
                        catalog_type = "VERZINKTE"
                
                # Slangkoppelingen (B77, 9B77, C4, 9C77 prefixed SKUs)
                elif "slangkoppelingen" in name:
                    has_skus = bool(re.search(r'\d?[BC]\d{1,3}\d{3,}', page_text))
                    if has_skus and len(page_series_list) >= 1:
                        text_products = extract_slangkoppelingen_from_text(page_text, page_series_list, page_mid_x)
                        catalog_type = "SLANGKOPPELINGEN"
                
                # Slangklemmen (GM, GMI, MAXM, MAXI, SBI, SBIV, SB, X prefixed SKUs)
                elif "slangklemmen" in name:
                    has_skus = bool(re.search(r'(?:GMI?|MAXI?|SBIV?|QDW|X)\d{4,}', page_text))
                    if has_skus and len(page_series_list) >= 1:
                        text_products = extract_slangklemmen_from_text(page_text, page_series_list, page_mid_x)
                        catalog_type = "SLANGKLEMMEN"
                
                if text_products:
                    print(f"      {catalog_type} text extraction: {len(text_products)} products, series: {[s[1] for s in page_series_list]}")
                    
                    # Extract images for EACH series separately, using column filtering for two-column layouts
                    # Use series_slug as key to properly assign images to products by their series
                    series_images_by_slug: Dict[str, List[str]] = {}
                    series_images_by_idx: Dict[int, List[str]] = {}
                    if extract_images_flag:
                        for idx, (series_slug, series_name) in enumerate(page_series_list):
                            # For two-column layouts, filter by column position
                            if len(page_series_list) == 2:
                                column_filter = 'left' if idx == 0 else 'right'
                            else:
                                column_filter = None
                            images_with_bboxes = extract_images_with_bboxes_from_page(pdf_path, page_number, series_slug, column_filter=column_filter)
                            img_paths = [p for p, _ in images_with_bboxes]
                            series_images_by_slug[series_slug] = img_paths
                            series_images_by_idx[idx] = img_paths
                    
                    # Assign images based on product's series_slug (not position)
                    for prod_idx, prod in enumerate(text_products):
                        prod["source_pdf"] = pdf_path.name
                        prod["page"] = page_number
                        
                        # First try to match by product's series_slug
                        prod_series_slug = prod.get("series_slug", "")
                        if prod_series_slug and prod_series_slug in series_images_by_slug and series_images_by_slug[prod_series_slug]:
                            prod["image"] = series_images_by_slug[prod_series_slug][0]
                            prod["images"] = series_images_by_slug[prod_series_slug]
                        elif len(page_series_list) == 2 and series_images_by_idx:
                            # Fallback: for two-column layouts, alternate between columns
                            col_idx = 0 if prod_idx % 2 == 0 else 1
                            if col_idx in series_images_by_idx and series_images_by_idx[col_idx]:
                                prod["image"] = series_images_by_idx[col_idx][0]
                                prod["images"] = series_images_by_idx[col_idx]
                            elif 0 in series_images_by_idx and series_images_by_idx[0]:
                                prod["image"] = series_images_by_idx[0][0]
                                prod["images"] = series_images_by_idx[0]
                        elif series_images_by_idx and 0 in series_images_by_idx and series_images_by_idx[0]:
                            # Single column - use first available images
                            prod["image"] = series_images_by_idx[0][0]
                            prod["images"] = series_images_by_idx[0]
                        
                        prod = enrich_record(prod)
                        records.append(prod)
                    continue  # Skip normal table processing for this page
            
            if is_draadfittingen:
                page_series_list = extract_all_series_from_page(page_text)
                if page_series_list:
                    # Use the first series as default for this page
                    current_series_slug, current_series_name = page_series_list[0]
                    current_category = current_series_name
                    print(f"      Page series: {[s[1] for s in page_series_list]}")
            
            # For DEMA catalogs, try to extract series from blue header
            if is_dema_catalog or detect_series:
                blue_header = extract_blue_header_text(page)
                if blue_header:
                    current_series_slug, current_series_name = blue_header
                    current_category = current_series_name
                    print(f"      Series: {current_series_name}")
                
                # Extract yellow specs text
                yellow_specs = extract_yellow_specs_text(page)
                if yellow_specs:
                    current_specs_text = yellow_specs
                    print(f"      Specs: {current_specs_text}")

            for t in tables:
                table_bbox = (page.bbox[0], page.bbox[1], page.bbox[2], page.bbox[3])
                # More precise would be t.bbox, but our row bboxes already use it; we want
                # category above the whole table.
                table_bbox = t.bboxes[0][0], t.bboxes[0][1], t.bboxes[0][2], t.bboxes[-1][3]
                
                # For draadfittingen: assign series based on table's horizontal position (left/right column)
                if is_draadfittingen and len(page_series_list) >= 2:
                    table_center_x = (table_bbox[0] + table_bbox[2]) / 2
                    if table_center_x < page_mid_x:
                        # Left column - use first series
                        current_series_slug, current_series_name = page_series_list[0]
                    else:
                        # Right column - use second series
                        current_series_slug, current_series_name = page_series_list[1]
                    current_category = current_series_name

                # Zuigerpompen: pdfplumber can miss SKU cells (None) even though the SKU is visible.
                # IMPORTANT: Only recover SKUs from the table region text, not the full page text,
                # otherwise we risk assigning unrelated SKUs from other sections.
                zuigerpompen_missing_sku_candidates: List[str] = []
                zuigerpompen_missing_sku_idx: int = 0
                if "zuigerpompen" in name:
                    table_skus: set[str] = set()
                    try:
                        for _row in t.rows:
                            try:
                                row_joined = "".join(str(v) for v in _row if v is not None)
                            except Exception:
                                row_joined = ""
                            row_compact = re.sub(r"\s+", "", row_joined)
                            for m in re.findall(r"X\d{7}", row_compact):
                                table_skus.add(m)
                    except Exception:
                        table_skus = set()

                    try:
                        table_text = page.crop(table_bbox).extract_text() or ""
                    except Exception:
                        table_text = ""
                    table_text_compact = re.sub(r"\s+", "", table_text)
                    table_text_skus = re.findall(r"X\d{7}", table_text_compact)

                    # Preserve order as seen in the table, but only keep SKUs not already in table cells.
                    zuigerpompen_missing_sku_candidates = [s for s in table_text_skus if s not in table_skus]

                header_text, application_text = extract_category_above_table(page, table_bbox)
                category = header_text or current_category
                
                # Detect series title from header text (NR X - PRODUCT NAME pattern)
                if header_text:
                    series_info = detect_series_title(header_text)
                    if series_info:
                        current_series_slug, current_series_name = series_info
                        current_category = current_series_name
                        category = current_category
                    else:
                        current_category = category
                
                # Extract specs text (BUITENDRAAD, BINNENDRAAD, etc.)
                if application_text:
                    specs = extract_specs_text(application_text)
                    if specs:
                        current_specs_text = specs
                
                # Extract images from page (share with all SKUs in this table)
                # Use series_slug if available, otherwise use pdf name as fallback
                image_slug = current_series_slug or slugify(name) or "unknown"
                if extract_images_flag:
                    page_images_with_bboxes = extract_images_with_bboxes_from_page(pdf_path, page_number, image_slug)
                    if page_images_with_bboxes:
                        current_images_with_bboxes = page_images_with_bboxes
                        current_images = [p for p, _ in page_images_with_bboxes]

                # Extract product-level specs from text above table (temp, pressure, etc.)
                product_specs = extract_product_specs_above_table(page, table_bbox)

                # Pre-compute table-level images (bbox overlap with table bbox)
                table_images: List[str] = []
                if current_images_with_bboxes:
                    for img_path, img_bbox in current_images_with_bboxes:
                        img_area = _bbox_area(img_bbox)
                        if img_area <= 0:
                            continue
                        inter = _bbox_intersection_area(img_bbox, table_bbox)
                        if (inter / img_area) >= 0.15:
                            table_images.append(img_path)

                if "pomp-specials" in name:
                    # Continuation pages often have only the continued table.
                    # If we can't re-extract specs/application on this page, carry over the previous context.
                    if (not application_text) and last_pomp_specials_application_text:
                        application_text = last_pomp_specials_application_text
                    if (not product_specs) and last_pomp_specials_product_specs:
                        product_specs = dict(last_pomp_specials_product_specs)
                    if application_text:
                        last_pomp_specials_application_text = application_text
                    if product_specs:
                        last_pomp_specials_product_specs = dict(product_specs)

                    # Header inheritance for continuation pages:
                    # If the continued table does not repeat its header (or pdfplumber yields garbage/empty header),
                    # reuse the last good header for correct column mapping.
                    header_has_bestelnr = False
                    try:
                        header_joined = " ".join([str(h) for h in (t.header or []) if h is not None]).lower()
                        header_has_bestelnr = ("bestel" in header_joined) or ("bestelnr" in header_joined)
                    except Exception:
                        header_has_bestelnr = False

                    # Always attempt to synthesize an effective header for pomp-specials.
                    # This handles pages where pdfplumber fails to capture the header row.
                    synthesized_header = synthesize_pomp_specials_header(t.header, t.rows)
                    if synthesized_header:
                        last_pomp_specials_header = list(synthesized_header)
                    elif header_has_bestelnr:
                        last_pomp_specials_header = list(t.header or [])
                
                # Add specs_text to product_specs for downstream processing
                if current_specs_text:
                    product_specs["specs_text"] = current_specs_text

                if "zuigerpompen" in name:
                    try:
                        ztxt = page.crop(table_bbox).extract_text() or ""
                    except Exception:
                        ztxt = ""
                    parsed = parse_zuigerpompen_table_text(ztxt)
                    if parsed:
                        for obj in parsed:
                            inferred_type = infer_type_from_context(pdf_path.name, current_category, obj.get("type"))
                            if inferred_type is not None:
                                obj.setdefault("type", inferred_type)

                            ctx = RowContext(
                                source_pdf=pdf_path.name,
                                page_number=page_number,
                                category=current_category,
                            )
                            obj["_context"] = asdict(ctx)
                            if current_series_slug:
                                obj["_context"]["series_id"] = current_series_slug
                            if current_series_name:
                                obj["_context"]["series_name"] = current_series_name
                            if application_text:
                                obj["_context"]["application"] = application_text
                            if product_specs:
                                obj["_context"]["product_specs"] = product_specs
                            if table_images:
                                obj["_context"]["images"] = table_images
                            elif current_images:
                                obj["_context"]["images"] = current_images
                            if current_specs_text:
                                obj["_context"]["specs_text"] = current_specs_text

                            normalize_sku_from_bestelnr(obj)
                            extract_angle_from_context(obj)
                            obj = enrich_record(obj)
                            records.append(obj)

                    # Always skip row-wise parsing for zuigerpompen to avoid duplicates.
                    continue

                # Special handling for Kranzle (transposed tables)
                if "kranzle" in name:
                    models = extract_kranzle_transposed(t)
                    for m in models:
                        # Attach context
                        ctx = {
                            "source_pdf": pdf_path.name,
                            "page_number": page_number,
                            "category": current_category,
                            "series_id": current_series_slug,
                            "series_name": current_series_name,
                        }
                        if application_text:
                            ctx["application"] = application_text
                        if product_specs:
                            ctx["product_specs"] = product_specs
                        if table_images:
                            ctx["images"] = table_images
                        elif current_images:
                            ctx["images"] = current_images
                        if current_specs_text:
                            ctx["specs_text"] = current_specs_text
                        m["_context"] = ctx
                        # Ensure generic type
                        inferred_type = infer_type_from_context(pdf_path.name, current_category, m.get("type"))
                        if inferred_type is not None:
                            m.setdefault("type", inferred_type)
                        # Apply enrichment so analyze_product_pdfs does both extract + enrich
                        m = enrich_record(m)
                        records.append(m)
                    continue

                # Special handling for Makita (transposed tables like Kranzle)
                if "makita" in name:
                    models = extract_makita_transposed(t)
                    for m in models:
                        # Attach context
                        ctx = {
                            "source_pdf": pdf_path.name,
                            "page_number": page_number,
                            "category": current_category,
                            "series_id": current_series_slug,
                            "series_name": current_series_name,
                        }
                        if application_text:
                            ctx["application"] = application_text
                        if product_specs:
                            ctx["product_specs"] = product_specs
                        if table_images:
                            ctx["images"] = table_images
                        elif current_images:
                            ctx["images"] = current_images
                        if current_specs_text:
                            ctx["specs_text"] = current_specs_text
                        ctx["brand"] = "Makita"
                        m["_context"] = ctx
                        # Ensure generic type
                        inferred_type = infer_type_from_context(pdf_path.name, current_category, m.get("type"))
                        if inferred_type is not None:
                            m.setdefault("type", inferred_type)
                        # Apply enrichment
                        m = enrich_record(m)
                        records.append(m)
                    continue

                # For Airpress PDFs, detect SKU column once per table
                airpress_sku_col_idx: Optional[int] = None
                airpress_current_group: Optional[str] = None  # Track product group for grouped tables
                airpress_current_sku: Optional[str] = None  # Track SKU for continuation rows
                airpress_current_model: Optional[str] = None  # Track model name for continuation rows
                if "airpress-catalogus" in name:
                    airpress_sku_col_idx = detect_airpress_sku_column(t.header, t.rows)

                # Row-wise extraction for other PDFs
                for row, row_bbox in zip(t.rows, t.bboxes):
                    ctx = RowContext(
                        source_pdf=pdf_path.name,
                        page_number=page_number,
                        category=current_category,
                    )

                    if "abs-persluchtbuizen" in name:
                        obj = extract_abs_persluchtbuizen(row, t.header)
                        # Skip rows without SKU
                        if not obj.get("bestelnr"):
                            continue
                    elif "bronpompen" in name:
                        obj = extract_bronpompen(row, t.header)
                        # Skip rows without SKU (header rows, empty rows)
                        if not obj.get("bestelnr"):
                            continue
                    elif "aandrijftechniek" in name:
                        obj = extract_aandrijftechniek(row, t.header, page, row_bbox)
                        # Skip rows without CODE (header rows, empty rows)
                        if not obj.get("code"):
                            continue
                    elif "centrifugaalpompen" in name:
                        obj = extract_centrifugaalpompen(row, t.header)
                        # Skip rows without SKU
                        if not obj.get("bestelnr"):
                            continue
                    elif "pomp-specials" in name:
                        # Prefer synthesized header for this table; fall back to last good header for continuation pages.
                        effective_header = synthesize_pomp_specials_header(t.header, t.rows) or last_pomp_specials_header or t.header

                        obj = extract_pomp_specials(row, effective_header or [])
                        # Skip rows without SKU
                        if not obj.get("bestelnr"):
                            continue
                    elif "dompelpompen" in name:
                        obj = extract_dompelpompen(row, t.header)
                        # Skip rows without SKU
                        if not obj.get("bestelnr"):
                            continue
                    elif "zuigerpompen" in name:
                        obj = extract_zuigerpompen(row, t.header)

                        # Fallback: if SKU is missing (often due to split/None in first column),
                        # assign from page text list in order, skipping already-used SKUs.
                        if not obj.get("bestelnr"):
                            looks_like_product = False
                            try:
                                # Guard against header rows and random text rows.
                                tv = obj.get("type")
                                sv = obj.get("spanning_v")
                                pv = obj.get("vermogen_kw")
                                fv = obj.get("debiet_m3_h")

                                tv_s = str(tv).strip().lower() if tv is not None else ""
                                sv_s = str(sv).strip().lower() if sv is not None else ""
                                pv_s = str(pv).strip().lower() if pv is not None else ""
                                fv_s = str(fv).strip().lower() if fv is not None else ""

                                # Header indicators (e.g. "type", "spanning", "vermogen")
                                if tv_s in {"type", ""}:
                                    looks_like_product = False
                                elif "spanning" in tv_s or "vermogen" in tv_s or "debiet" in tv_s:
                                    looks_like_product = False
                                else:
                                    # Require at least one numeric spec field to be present.
                                    has_numeric_spec = any(
                                        re.search(r"\d", s) for s in (sv_s, pv_s, fv_s)
                                    )
                                    looks_like_product = has_numeric_spec
                            except Exception:
                                looks_like_product = False

                            if looks_like_product and zuigerpompen_missing_sku_candidates:
                                if zuigerpompen_missing_sku_idx < len(zuigerpompen_missing_sku_candidates):
                                    obj["bestelnr"] = zuigerpompen_missing_sku_candidates[zuigerpompen_missing_sku_idx]
                                    zuigerpompen_missing_sku_idx += 1

                        # Skip rows without SKU
                        if not obj.get("bestelnr"):
                            continue
                    elif "pe-buizen" in name:
                        obj = extract_pe_buizen(row, t.header)
                        # Skip rows without SKU
                        if not obj.get("bestelnr"):
                            continue
                    elif "drukbuizen" in name or "kunststof-afvoerleidingen" in name:
                        obj = extract_drukbuizen(row, t.header)
                        # Skip rows without SKU (header rows, empty rows)
                        if not obj.get("bestelnr"):
                            continue
                    elif "airpress-catalogus" in name:
                        # Use Airpress-specific extractor with SKU column detection
                        obj = extract_airpress_row(row, t.header, airpress_sku_col_idx)
                        
                        # Propagate product_type from previous rows in grouped tables
                        if obj.get("product_type"):
                            airpress_current_group = obj["product_type"]
                        elif airpress_current_group and not obj.get("product_type"):
                            obj["product_type"] = airpress_current_group
                        
                        # Propagate SKU and model_name for continuation rows (spec variants)
                        if obj.get("article_sku"):
                            airpress_current_sku = obj["article_sku"]
                            airpress_current_model = obj.get("model_name")
                        elif airpress_current_sku and not obj.get("article_sku"):
                            # This is a continuation row - inherit SKU and model from previous row
                            obj["article_sku"] = airpress_current_sku
                            obj["bestelnr"] = airpress_current_sku
                            if airpress_current_model:
                                obj["model_name"] = airpress_current_model
                            obj["is_variant"] = True  # Mark as spec variant
                    else:
                        # Fallback: generic column mapping
                        hmap = {i: slugify_header(h) for i, h in enumerate(t.header)}
                        obj = {}
                        for idx, val in enumerate(row):
                            key = hmap.get(idx) or f"col_{idx}"
                            v = val.strip() if isinstance(val, str) else val
                            obj[key] = v
                        
                        # Skip completely empty rows
                        if not any(v for v in obj.values() if v and str(v).strip()):
                            continue

                    # Ensure a generic type field is present
                    inferred_type = infer_type_from_context(pdf_path.name, current_category, obj.get("type"))
                    if inferred_type is not None:
                        obj.setdefault("type", inferred_type)

                    # Attach context before downstream normalization/enrichment
                    obj["_context"] = asdict(ctx)
                    # Add series info for SKU inheritance
                    if current_series_slug:
                        obj["_context"]["series_id"] = current_series_slug
                    if current_series_name:
                        obj["_context"]["series_name"] = current_series_name
                    if application_text:
                        obj["_context"]["application"] = application_text
                    if product_specs:
                        obj["_context"]["product_specs"] = product_specs

                    # Attach images with best-effort per-row association:
                    # 1) images overlapping the row bbox
                    # 2) else images overlapping the table bbox
                    # 3) else all page images
                    row_images: List[str] = []
                    if current_images_with_bboxes:
                        for img_path, img_bbox in current_images_with_bboxes:
                            img_area = _bbox_area(img_bbox)
                            if img_area <= 0:
                                continue
                            inter = _bbox_intersection_area(img_bbox, row_bbox)
                            if (inter / img_area) >= 0.15:
                                row_images.append(img_path)

                    if row_images:
                        obj["_context"]["images"] = row_images
                    elif table_images:
                        obj["_context"]["images"] = table_images
                    elif current_images:
                        obj["_context"]["images"] = current_images
                    if current_specs_text:
                        obj["_context"]["specs_text"] = current_specs_text

                    # Skip description/legend/header rows for Airpress (rows with no SKU and non-product content)
                    if "airpress-catalogus" in name:
                        has_sku = obj.get("article_sku") or obj.get("bestelnr")
                        if not has_sku:
                            # Check for long description text
                            first_val = next((v for v in obj.values() if isinstance(v, str) and len(v) > 50), None)
                            if first_val and len(first_val) > 100:
                                continue
                            # Check for header-like rows (all caps category names, percentages, etc.)
                            vals = [str(v) for v in obj.values() if v and isinstance(v, str)]
                            if vals and all(len(v) < 30 for v in vals):
                                # Short values only - likely header row
                                non_spec_vals = [v for v in vals if not any(c.isdigit() for c in v) or v in ['50%', '10', '3']]
                                if len(non_spec_vals) == len(vals):
                                    continue
                    
                    # Normalize zwarte-draad-en-lasfittingen dynamic SKU keys into explicit fields
                    normalize_black_fittings_sku(obj, pdf_path.name)

                    # Normalize bestelnr / order_number / code / col_0 to sku for all PDFs
                    normalize_sku_from_bestelnr(obj)
                    
                    # Extract angle from series name or SKU for pipe/fitting products
                    extract_angle_from_context(obj)

                    # Apply enrichment so this script handles the full pipeline
                    obj = enrich_record(obj)
                    records.append(obj)

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / f"{pdf_path.stem}.json"

    # Always output flat format with grouping metadata for consistent structure
    # This replaces the previous nested catalog builders (zuigerpompen, verzinkte-buizen, etc.)
    payload = flatten_records_with_grouping(records, pdf_path.name)

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"  Wrote JSON for {pdf_path.name} -> {out_path}")

    # Build a small summary so the caller can report an overview after all
    # PDFs are processed.
    summary: Dict[str, Any] = {
        "pdf": pdf_path.name,
        "output": str(out_path),
    }

    unique_skus: set[str] = set()
    bestelnr_count: int = 0

    def _collect_skus_from_obj(obj: Any) -> None:
        nonlocal bestelnr_count
        if isinstance(obj, dict):
            # Common keys for order/SKU codes (sku is the canonical field)
            for k in ("sku", "order_number", "bestelnr", "sku_code", "code"):
                v = obj.get(k)
                if isinstance(v, str) and v.strip():
                    val = v.strip().upper()
                    unique_skus.add(val)
                    if k == "bestelnr":
                        bestelnr_count += 1
                    break  # Only count once per record
            for v in obj.values():
                _collect_skus_from_obj(v)
        elif isinstance(obj, list):
            for v in obj:
                _collect_skus_from_obj(v)

    if isinstance(payload, list):
        summary["payload_type"] = "list"
        summary["items"] = len(payload)
        _collect_skus_from_obj(payload)
    elif isinstance(payload, dict):
        summary["payload_type"] = "object"
        # Try to give a meaningful size metric for structured catalogs
        if "product_groups" in payload and isinstance(payload["product_groups"], list):
            summary["product_groups"] = len(payload["product_groups"])
        elif "product_series" in payload:
            # Single-series object like zuigerpompen
            series = payload.get("product_series") or {}
            if isinstance(series, dict) and isinstance(series.get("variations"), list):
                summary["variations"] = len(series["variations"])
        _collect_skus_from_obj(payload)

    summary["unique_skus"] = len(unique_skus)
    summary["bestelnr_count"] = bestelnr_count

    return summary


def discover_pdfs(base_dir: Path) -> List[Path]:
    if not base_dir.exists():
        return []
    return sorted(p for p in base_dir.glob("*.pdf") if p.is_file())


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze Dema Product PDFs into JSON.")
    parser.add_argument(
        "--pdf-dir",
        type=str,
        default=str(PDF_DIR),
        help="Directory containing product PDFs",
    )
    parser.add_argument(
        "--only",
        type=str,
        default=None,
        help="Process only PDFs whose filename contains this (case-insensitive).",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Output directory for JSON files (default: alongside PDF dir in 'json')",
    )
    parser.add_argument(
        "--clean-images",
        action="store_true",
        help="Delete extracted images for each PDF (documents/Product_pdfs/images/<pdf_stem>) before regenerating.",
    )
    args = parser.parse_args()
    pdf_dir = Path(args.pdf_dir)

    if args.output_dir:
        output_dir = Path(args.output_dir)
    else:
        output_dir = pdf_dir / "json"

    pdfs = discover_pdfs(pdf_dir)
    if args.only:
        only = str(args.only).lower().strip()
        pdfs = [p for p in pdfs if only in p.name.lower()]
    if not pdfs:
        print(f"No PDFs found in {pdf_dir}")
        return

    summaries: List[Dict[str, Any]] = []
    for pdf_path in pdfs:
        print(f"Processing {pdf_path.name}...")
        try:
            s = process_pdf(pdf_path, output_dir, clean_images=bool(args.clean_images))
        except Exception as exc:  # pragma: no cover - safety net
            print(f"  ERROR processing {pdf_path.name}: {exc}")
            continue
        summaries.append(s)

    print(f"Done. JSON files written to {output_dir}")

    # Overview
    print("\nOverview:")
    total_unique_skus = 0
    total_bestelnr = 0
    for s in summaries:
        pdf_name = s.get("pdf")
        out = s.get("output")
        ptype = s.get("payload_type", "?")
        extra = []
        if "items" in s:
            extra.append(f"items={s['items']}" )
        if "product_groups" in s:
            extra.append(f"product_groups={s['product_groups']}")
        if "variations" in s:
            extra.append(f"variations={s['variations']}")
        if "unique_skus" in s:
            extra.append(f"unique_skus={s['unique_skus']}")
            total_unique_skus += int(s["unique_skus"] or 0)
        if "bestelnr_count" in s:
            extra.append(f"bestelnr_count={s['bestelnr_count']}")
            total_bestelnr += int(s["bestelnr_count"] or 0)
        extra_str = ("; ".join(extra)) if extra else ""
        if extra_str:
            print(f"  {pdf_name}: type={ptype}, {extra_str}\n    -> {out}")
        else:
            print(f"  {pdf_name}: type={ptype}\n    -> {out}")

    print(f"\nProcessed files: {len(summaries)}; total unique SKUs/order codes: {total_unique_skus}; total bestelnr occurrences: {total_bestelnr}")


if __name__ == "__main__":
    main()
