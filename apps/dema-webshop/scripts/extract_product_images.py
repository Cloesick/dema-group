#!/usr/bin/env python3
"""Extract product images from PDF catalogs and link them to SKUs.

This script:
1. Reads existing JSON outputs from old_analyze_product_pdfs.py
2. Extracts images from PDFs using pymupdf (fitz)
3. Matches images to specific series using vertical proximity on the page
4. Converts images to WebP format for optimal web performance
5. Saves images with structured naming: {pdf_stem}/{series_slug}_{sku}.webp
6. Updates JSON files with accurate image paths per series
7. Generates image-sku-mapping.json with complete SKU lists per image

Key improvements over naive page-level matching:
- Groups SKUs by series_name on each page
- Matches images to the nearest series below them (images appear above tables)
- Handles multiple series per page correctly
- Uses series_id for consistent image naming

Usage:
    python extract_product_images.py [--update-json] [--quality 85] [--max-width 1200]
"""

import argparse
import io
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import fitz  # pymupdf
except ImportError:
    print("ERROR: pymupdf not installed. Run: pip install pymupdf")
    sys.exit(1)

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow numpy")
    sys.exit(1)

# Optional OCR for SKU detection on images
try:
    import easyocr
    OCR_AVAILABLE = True
    OCR_READER = None  # Lazy initialization
except ImportError:
    OCR_AVAILABLE = False
    OCR_READER = None


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

PDF_DIR = Path(r"C:\Users\nicol\Projects\dema-webshop\documents\Product_pdfs")
JSON_DIR = PDF_DIR / "json"
IMAGE_OUTPUT_DIR = PDF_DIR / "images"
IMAGE_SKU_MAPPING_FILE = IMAGE_OUTPUT_DIR / "image-sku-mapping.json"

# Minimum image dimensions to extract (skip tiny icons/logos)
MIN_IMAGE_WIDTH = 100
MIN_IMAGE_HEIGHT = 100

# Default WebP quality (higher = better quality, larger files)
DEFAULT_WEBP_QUALITY = 95  # Increased from 85 for better image quality

# Minimum area (width * height) for product images
# Filters out small logos, icons, and brand marks
MIN_IMAGE_AREA = 10000  # e.g., 100x100 or 114x103 (rubber-slangen accessory images)

# Maximum aspect ratio deviation from square (filters out banners/strips)
# Ratio > 3.0 means very wide or very tall (likely a banner or logo strip)
MAX_ASPECT_RATIO = 4.0  # Allow slightly wider images (rubber-slangen hose images are ~3.05)

# Maximum distance (in PDF points) between image bottom and table top
# for them to be considered related
MAX_IMAGE_TABLE_DISTANCE = 300


# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r"[äàáâã]", "a", text)
    text = re.sub(r"[ëèéê]", "e", text)
    text = re.sub(r"[ïìíî]", "i", text)
    text = re.sub(r"[öòóôõ]", "o", text)
    text = re.sub(r"[üùúû]", "u", text)
    text = re.sub(r"[ñ]", "n", text)
    text = re.sub(r"[ß]", "ss", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text


def load_json_records(json_path: Path) -> List[Dict[str, Any]]:
    """Load records from a JSON file."""
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Handle both list and dict payloads
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            # Try to extract records from common structures
            if "variations" in data:
                return data["variations"]
            elif "products" in data:
                return data["products"]
            elif "items" in data:
                return data["items"]
            else:
                # Return as single-item list
                return [data]
        return []
    except Exception as e:
        print(f"  Warning: Could not load {json_path}: {e}")
        return []


def get_page_records(records: List[Dict[str, Any]], page_num: int) -> List[Dict[str, Any]]:
    """Get all records from a specific page.
    
    Supports both flat format (page field) and legacy format (_context.page_number).
    """
    page_records = []
    for rec in records:
        # Try flat format first
        rec_page = rec.get("page")
        if rec_page is None:
            # Fallback to legacy format
            ctx = rec.get("_context") or {}
            rec_page = ctx.get("page_number")
        
        if rec_page == page_num:
            page_records.append(rec)
    return page_records


def get_category_from_records(records: List[Dict[str, Any]]) -> Optional[str]:
    """Extract category from a list of records.
    
    Supports both flat format (series_name) and legacy format (_context.category).
    """
    for rec in records:
        # Try flat format first
        category = rec.get("series_name")
        if category:
            return category
        # Fallback to legacy format
        ctx = rec.get("_context") or {}
        category = ctx.get("category")
        if category:
            return category
    return None


def get_skus_from_records(records: List[Dict[str, Any]]) -> List[str]:
    """Extract all SKUs from a list of records."""
    skus = []
    for rec in records:
        sku = rec.get("sku")
        if sku:
            skus.append(str(sku))
    return skus


def group_records_by_series(records: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Group records by series_id for accurate image matching.
    
    Returns dict: series_id -> list of records
    """
    from collections import defaultdict
    groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    
    for rec in records:
        series_id = rec.get("series_id") or rec.get("series_name") or "unknown"
        groups[series_id].append(rec)
    
    return dict(groups)


def get_series_info(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Extract series metadata from a group of records.
    
    Returns dict with:
    - series_id: Unique identifier for the series
    - series_name: Human-readable name
    - skus: List of SKUs in this series
    - first_sku: First SKU (for naming)
    """
    if not records:
        return {"series_id": "unknown", "series_name": "Unknown", "skus": [], "first_sku": None}
    
    first = records[0]
    skus = [r.get("sku") for r in records if r.get("sku")]
    
    return {
        "series_id": first.get("series_id") or slugify(first.get("series_name", "unknown")),
        "series_name": first.get("series_name") or "Unknown",
        "skus": skus,
        "first_sku": skus[0] if skus else None,
    }


def get_sku_series(skus: List[str]) -> Optional[str]:
    """Extract common prefix from SKUs to form a series identifier."""
    if not skus:
        return None
    
    # Find common prefix
    if len(skus) == 1:
        # Single SKU - use first part before digits change
        sku = skus[0]
        match = re.match(r"^([A-Za-z]+\d*)", sku)
        if match:
            return match.group(1)
        return sku[:8] if len(sku) > 8 else sku
    
    # Multiple SKUs - find common prefix
    prefix = skus[0]
    for sku in skus[1:]:
        while prefix and not sku.startswith(prefix):
            prefix = prefix[:-1]
    
    return prefix if prefix else skus[0][:8]


# ---------------------------------------------------------------------------
# Text/Table Position Detection
# ---------------------------------------------------------------------------

def find_text_positions_on_page(
    page: fitz.Page,
    search_texts: List[str],
) -> Dict[str, Tuple[float, float, float, float]]:
    """Find bounding boxes of specific text strings on a page.
    
    Returns dict: text -> (x0, y0, x1, y1) bbox
    """
    positions = {}
    
    for text in search_texts:
        if not text:
            continue
        # Search for the text on the page
        text_instances = page.search_for(text, quads=False)
        if text_instances:
            # Use first occurrence
            rect = text_instances[0]
            positions[text] = (rect.x0, rect.y0, rect.x1, rect.y1)
    
    return positions


def find_series_positions_on_page(
    page: fitz.Page,
    series_groups: Dict[str, List[Dict[str, Any]]],
) -> List[Dict[str, Any]]:
    """Find vertical positions of each series on a page.
    
    Searches for series_name text (the table header) to find where each series is located.
    This is more reliable than searching for SKUs.
    
    Returns list of dicts with series_id, y_top, y_bottom, bbox, and series info.
    """
    series_positions = []
    
    for series_id, records in series_groups.items():
        info = get_series_info(records)
        series_name = info["series_name"]
        skus = info["skus"]
        
        if not series_name:
            continue
        
        # Search for the series name (table header) on the page
        # This is more reliable than searching for SKUs
        header_instances = page.search_for(series_name, quads=False)
        
        if header_instances:
            # Use the first occurrence of the header
            header_rect = header_instances[0]
            y_top = header_rect.y0
            y_bottom = header_rect.y1
            
            # Also search for SKUs to get the full table extent
            for sku in skus[:3]:
                sku_instances = page.search_for(sku, quads=False)
                for rect in sku_instances:
                    y_bottom = max(y_bottom, rect.y1)
            
            series_positions.append({
                "series_id": series_id,
                "series_name": series_name,
                "skus": skus,
                "first_sku": info["first_sku"],
                "y_top": y_top,
                "y_bottom": y_bottom + 20,
                "header_bbox": (header_rect.x0, header_rect.y0, header_rect.x1, header_rect.y1),
            })
        else:
            # Fallback: search for SKUs if header not found
            y_positions = []
            for sku in skus[:5]:
                instances = page.search_for(sku, quads=False)
                for rect in instances:
                    y_positions.append((rect.y0, rect.y1))
            
            if y_positions:
                y_top = min(y[0] for y in y_positions)
                y_bottom = max(y[1] for y in y_positions) + 20
                
                series_positions.append({
                    "series_id": series_id,
                    "series_name": series_name,
                    "skus": skus,
                    "first_sku": info["first_sku"],
                    "y_top": y_top,
                    "y_bottom": y_bottom,
                    "header_bbox": None,
                })
    
    # Sort by vertical position (top to bottom)
    series_positions.sort(key=lambda x: x["y_top"])
    
    return series_positions


def match_image_to_series(
    image_bbox: Tuple[float, float, float, float],
    series_positions: List[Dict[str, Any]],
    max_distance: float = 300,
) -> Optional[Dict[str, Any]]:
    """Match an image to the nearest series based on vertical position.
    
    Strategy:
    1. Find the series whose header/table is closest to the image
    2. Image can be above, below, or overlapping with the table
    3. Prefer series where image is directly above the header
    
    Returns the matched series info or None.
    """
    if not series_positions:
        return None
    
    img_x0, img_y0, img_x1, img_y1 = image_bbox
    img_center_y = (img_y0 + img_y1) / 2
    img_center_x = (img_x0 + img_x1) / 2
    
    best_match = None
    best_score = float("inf")
    
    for series in series_positions:
        series_y_top = series["y_top"]
        series_y_bottom = series["y_bottom"]
        
        # Calculate vertical distance
        if img_y1 <= series_y_top:
            # Image is above the series
            v_distance = series_y_top - img_y1
            # Bonus: image directly above is preferred
            score = v_distance
        elif img_y0 >= series_y_bottom:
            # Image is below the series (less common, penalize)
            v_distance = img_y0 - series_y_bottom
            score = v_distance + 500  # Penalty for being below
        else:
            # Image overlaps with series vertically
            score = 0  # Best case
        
        # Also consider horizontal alignment if header bbox is available
        if series.get("header_bbox"):
            hx0, hy0, hx1, hy1 = series["header_bbox"]
            header_center_x = (hx0 + hx1) / 2
            h_distance = abs(img_center_x - header_center_x)
            # Add small horizontal penalty
            score += h_distance * 0.1
        
        if score < best_score and score < max_distance:
            best_score = score
            best_match = series
    
    return best_match


# ---------------------------------------------------------------------------
# Image Extraction
# ---------------------------------------------------------------------------

def get_ocr_reader():
    """Get or initialize the OCR reader (lazy loading)."""
    global OCR_READER
    if OCR_AVAILABLE and OCR_READER is None:
        print("  Initializing OCR reader (first time only)...")
        OCR_READER = easyocr.Reader(['en'], gpu=False, verbose=False)
    return OCR_READER


def extract_skus_from_image(image_bytes: bytes, known_sku_patterns: List[str] = None) -> List[str]:
    """Use OCR to detect SKU/product numbers visible on the image.
    
    Looks for patterns like:
    - Pure numbers: 36744, 369007
    - Alphanumeric codes: ABSB02090, LF1201, 369430-2IVR
    - Model numbers with dashes/dots
    
    Note: OCR is slow and may not find SKUs on all images. 
    Falls back gracefully if no SKUs detected.
    
    Returns list of detected SKUs, sorted by confidence.
    """
    if not OCR_AVAILABLE:
        return []
    
    try:
        reader = get_ocr_reader()
        if reader is None:
            return []
        
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Run OCR
        results = reader.readtext(np.array(img), detail=1)
        
        detected_skus = []
        
        # SKU patterns to look for - must be specific enough to avoid false positives
        sku_patterns = [
            r'\b\d{5,8}\b',  # 5-8 digit numbers (e.g., 36744, 369007)
            r'\b[A-Z]{2,5}\d{3,6}[A-Z]?\b',  # Letter prefix + numbers (e.g., ABSB02090)
            r'\b\d{5,6}[-/]\d{1,3}[A-Z]*\b',  # Numbers with suffix (e.g., 369430-2IVR)
            r'\b[A-Z]{1,3}\d{4,5}\b',  # Short prefix + numbers (e.g., LF1201)
        ]
        
        # Words to exclude (brand names, common text)
        exclude_words = {'AIRPRESS', 'COMPRESSOREN', 'WWW', 'NET', 'COMBI', 'DRY', 'APS'}
        
        for bbox, text, confidence in results:
            if confidence < 0.6:  # Higher threshold for reliability
                continue
            
            text = text.strip().upper()
            
            # Skip if it's a known brand/common word
            if text in exclude_words:
                continue
            
            # Check against known SKU patterns
            for pattern in sku_patterns:
                matches = re.findall(pattern, text)
                for match in matches:
                    if len(match) >= 5 and match not in exclude_words:  # Minimum length for SKU
                        detected_skus.append(match)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_skus = []
        for sku in detected_skus:
            if sku not in seen:
                seen.add(sku)
                unique_skus.append(sku)
        
        return unique_skus[:3]  # Return up to 3 SKUs
        
    except Exception as e:
        return []


def is_likely_logo_or_brand(
    width: int,
    height: int,
    min_area: int = MIN_IMAGE_AREA,
    max_aspect_ratio: float = MAX_ASPECT_RATIO,
) -> bool:
    """Detect if an image is likely a logo or brand image rather than a product.
    
    Filters based on:
    - Area too small (logos/icons)
    - Extreme aspect ratio (banners/strips)
    """
    area = width * height
    if area < min_area:
        return True
    
    # Check aspect ratio (both wide and tall extremes)
    if height > 0:
        ratio = max(width / height, height / width)
        if ratio > max_aspect_ratio:
            return True
    
    return False


def is_black_and_white_only(image_bytes: bytes, saturation_threshold: float = 15.0) -> bool:
    """Detect if an image is purely black and white (no color).
    
    These are typically diagrams, technical drawings, or text-only images.
    Real product photos have color saturation.
    
    Args:
        image_bytes: Raw image bytes
        saturation_threshold: Max average saturation to consider B&W (0-255 scale)
    
    Returns:
        True if image appears to be black and white only
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to HSV to check saturation
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        # Convert to HSV using numpy
        arr = np.array(img, dtype=np.float32) / 255.0
        
        # Calculate saturation: S = (max - min) / max
        max_rgb = np.max(arr, axis=2)
        min_rgb = np.min(arr, axis=2)
        
        # Avoid division by zero
        with np.errstate(divide='ignore', invalid='ignore'):
            saturation = np.where(max_rgb > 0, (max_rgb - min_rgb) / max_rgb, 0)
        
        # Average saturation (0-1 scale, convert to 0-255 for threshold)
        avg_saturation = np.mean(saturation) * 255
        
        # If average saturation is very low, it's B&W
        return avg_saturation < saturation_threshold
        
    except Exception:
        return False


def is_text_heavy_image(image_bytes: bytes, edge_ratio_threshold: float = 0.15) -> bool:
    """Detect if an image is mostly text/logos rather than a product photo.
    
    Text-heavy images have many sharp horizontal/vertical edges.
    Product photos have more organic shapes and gradients.
    
    Args:
        image_bytes: Raw image bytes
        edge_ratio_threshold: Ratio of edge pixels to total (higher = more edges)
    
    Returns:
        True if image appears to be text-heavy
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")  # Grayscale
        arr = np.array(img, dtype=np.float32)
        
        # Simple edge detection using gradient
        grad_x = np.abs(np.diff(arr, axis=1))
        grad_y = np.abs(np.diff(arr, axis=0))
        
        # Count strong edges (gradient > 50)
        edge_threshold = 50
        edge_pixels_x = np.sum(grad_x > edge_threshold)
        edge_pixels_y = np.sum(grad_y > edge_threshold)
        total_pixels = arr.size
        
        edge_ratio = (edge_pixels_x + edge_pixels_y) / (2 * total_pixels)
        
        # High edge ratio with low color = likely text/logo
        return edge_ratio > edge_ratio_threshold
        
    except Exception:
        return False


def has_sufficient_color_variance(image_bytes: bytes, min_std: float = 35.0) -> bool:
    """Check if image has enough color variance to be a real product photo.
    
    Solid colors, simple gradients, and uniform backgrounds fail this check.
    Real product photos have varied colors and textures.
    
    Args:
        image_bytes: Raw image bytes
        min_std: Minimum standard deviation across all channels
    
    Returns:
        True if image has sufficient color variance
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.array(img)
        
        # Check standard deviation across all channels
        overall_std = np.std(arr)
        
        return overall_std >= min_std
        
    except Exception:
        return True  # Default to keeping image if check fails


def get_image_quality_score(image_bytes: bytes, width: int, height: int) -> dict:
    """Calculate quality metrics for an image.
    
    Returns dict with:
    - is_valid: Whether image passes all quality checks
    - rejection_reason: Why image was rejected (if any)
    - metrics: Detailed quality metrics
    """
    result = {
        "is_valid": True,
        "rejection_reason": None,
        "metrics": {}
    }
    
    # Check 1: Size
    area = width * height
    if area < MIN_IMAGE_AREA:
        result["is_valid"] = False
        result["rejection_reason"] = f"too_small ({width}x{height})"
        return result
    
    # Check 2: Aspect ratio
    if height > 0:
        ratio = max(width / height, height / width)
        if ratio > MAX_ASPECT_RATIO:
            result["is_valid"] = False
            result["rejection_reason"] = f"bad_aspect_ratio ({ratio:.1f})"
            return result
    
    # Check 3: Black and white only
    if is_black_and_white_only(image_bytes):
        result["is_valid"] = False
        result["rejection_reason"] = "black_and_white_only"
        return result
    
    # Check 4: Background/decorative image
    if is_background_image(image_bytes):
        result["is_valid"] = False
        result["rejection_reason"] = "background_or_banner"
        return result
    
    # Check 5: Text-heavy + low color (likely brand logo)
    if is_black_and_white_only(image_bytes, saturation_threshold=25.0) and is_text_heavy_image(image_bytes):
        result["is_valid"] = False
        result["rejection_reason"] = "text_heavy_logo"
        return result
    
    # Check 6: Insufficient color variance
    if not has_sufficient_color_variance(image_bytes, min_std=30.0):
        result["is_valid"] = False
        result["rejection_reason"] = "low_color_variance"
        return result
    
    return result


def is_background_image(image_bytes: bytes, bar_height_pct: float = 0.1, threshold: int = 20) -> bool:
    """Detect if an image is a background/decorative image rather than a product.
    
    Checks for:
    - Solid black bars at top or bottom (cropped backgrounds)
    - Very uniform color distribution (floor/wall textures)
    - Wide banner-style images with dark colors (factory/lifestyle shots)
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.array(img)
        h, w = arr.shape[:2]
        bar_h = max(5, int(h * bar_height_pct))
        
        # Check top bar for solid black
        top_bar = arr[:bar_h, :, :]
        top_mean = np.mean(top_bar)
        top_std = np.std(top_bar)
        
        # Check bottom bar for solid black
        bottom_bar = arr[-bar_h:, :, :]
        bottom_mean = np.mean(bottom_bar)
        bottom_std = np.std(bottom_bar)
        
        # Solid black bar: very dark (mean < threshold) and uniform (std < threshold)
        has_black_top = top_mean < threshold and top_std < threshold
        has_black_bottom = bottom_mean < threshold and bottom_std < threshold
        
        if has_black_top or has_black_bottom:
            return True
        
        # Check for very uniform images (likely floor/wall textures)
        overall_std = np.std(arr)
        if overall_std < 25:
            return True
        
        # Check for wide banner-style images with dark colors (factory/lifestyle shots)
        # These are typically decorative images, not product photos
        aspect_ratio = w / h
        brightness = np.mean(arr)
        
        # Wide images (ratio > 2.0) that are dark (brightness < 130) are likely factory shots
        if aspect_ratio > 2.0 and brightness < 130:
            return True
        
        # Very wide images (ratio > 2.5) are almost always decorative banners
        if aspect_ratio > 2.5:
            return True
        
        return False
        
    except Exception:
        return False


def extract_images_from_page(
    page: fitz.Page,
    doc: fitz.Document,
    min_width: int = MIN_IMAGE_WIDTH,
    min_height: int = MIN_IMAGE_HEIGHT,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Extract all images from a PDF page with their bounding boxes.
    
    Returns:
        Tuple of (product_images, brand_images)
        
    Product images pass all filters.
    Brand images are those filtered out due to size/aspect ratio.
    """
    product_images = []
    brand_images = []
    
    for img_info in page.get_images(full=True):
        xref = img_info[0]
        
        try:
            # Get image data
            base_image = doc.extract_image(xref)
            if not base_image:
                continue
            
            image_bytes = base_image.get("image")
            image_ext = base_image.get("ext", "png")
            width = base_image.get("width", 0)
            height = base_image.get("height", 0)
            
            # Get image position on page
            img_rects = page.get_image_rects(xref)
            if not img_rects:
                continue
            
            # Use first rect (image might appear multiple times)
            rect = img_rects[0]
            
            img_data = {
                "xref": xref,
                "bbox": (rect.x0, rect.y0, rect.x1, rect.y1),
                "width": width,
                "height": height,
                "bytes": image_bytes,
                "ext": image_ext,
                "ocr_skus": [],  # Will be populated for product images
            }
            
            # Categorize: filter out non-product images using quality checks
            if width < min_width or height < min_height:
                img_data["rejection_reason"] = "too_small"
                brand_images.append(img_data)
            else:
                # Run comprehensive quality checks
                quality = get_image_quality_score(image_bytes, width, height)
                
                if not quality["is_valid"]:
                    img_data["rejection_reason"] = quality["rejection_reason"]
                    brand_images.append(img_data)
                else:
                    # For product images, try to detect SKUs via OCR
                    ocr_skus = extract_skus_from_image(image_bytes)
                    img_data["ocr_skus"] = ocr_skus
                    product_images.append(img_data)
                
        except Exception as e:
            print(f"    Warning: Could not extract image xref={xref}: {e}")
            continue
    
    return product_images, brand_images


# REMOVED: has_black_background and replace_black_with_white functions
# These were causing image quality issues by replacing dark pixels with white


def convert_to_webp(
    image_bytes: bytes,
    output_path: Path,
    quality: int = 95,
    max_width: Optional[int] = None,
) -> bool:
    """Convert image bytes to WebP format, preserving transparency.
    
    WebP supports alpha channels natively, so we preserve transparency
    instead of compositing onto a white background (which caused artifacts).
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Handle different modes - PRESERVE TRANSPARENCY (WebP supports alpha)
        if img.mode == "RGBA":
            # Keep RGBA as-is - no white background compositing
            pass
        elif img.mode == "LA":
            # Grayscale with alpha - convert to RGBA to preserve transparency
            img = img.convert("RGBA")
        elif img.mode == "P":
            # Palette mode - may have transparency
            if "transparency" in img.info:
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
        elif img.mode == "L":
            # Grayscale - convert to RGB
            img = img.convert("RGB")
        elif img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        
        # Resize if max_width specified
        if max_width and img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save as WebP with high quality (supports both RGB and RGBA)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(output_path, "WEBP", quality=quality, method=6)
        return True
    except Exception as e:
        print(f"    Warning: Could not convert image to WebP: {e}")
        return False


def generate_image_filename(
    pdf_stem: str,
    page_num: int,
    series_id: Optional[str] = None,
    series_name: Optional[str] = None,
    first_sku: Optional[str] = None,
    skus: Optional[List[str]] = None,
    ocr_skus: Optional[List[str]] = None,
    image_index: int = 0,
    total_images: int = 1,
    max_length: int = 200,
) -> str:
    """Generate image filename based on series_id only.
    
    Format: {pdf}__p{page}__{series_slug}[__v{N}].webp
    
    Components:
    - pdf: Source PDF name (e.g., "abs-persluchtbuizen")
    - page: Page number with 'p' prefix (e.g., "p5")
    - series_slug: Product series/category slug (e.g., "abs-bocht-90")
    - v{N}: Variant number if multiple images for same series (e.g., "v2")
    
    Examples:
    - abs-persluchtbuizen__p5__abs-bocht-90.webp
    - abs-persluchtbuizen__p5__abs-bocht-90__v2.webp
    - drukbuizen__p12__pvc-bocht-45.webp
    
    SKUs match images via series_id - no SKUs in filename needed.
    """
    parts = []
    
    # 1. PDF stem (source document)
    pdf_slug = slugify(pdf_stem) or "unknown"
    parts.append(pdf_slug[:30])
    
    # 2. Page number
    parts.append(f"p{page_num}")
    
    # 3. Series slug (extract from series_id or slugify series_name)
    series_slug = None
    if series_id:
        # series_id format: "catalog__series-slug" - extract the slug part
        if "__" in series_id:
            series_slug = series_id.split("__")[-1]
        else:
            series_slug = series_id
    elif series_name:
        series_slug = slugify(series_name)
    
    if series_slug:
        parts.append(series_slug[:50])
    else:
        parts.append(f"unknown-{page_num}")
    
    # 4. Variant number (only if multiple images for same series)
    if total_images > 1 or image_index > 0:
        parts.append(f"v{image_index + 1}")
    
    # Join with double underscore
    filename = "__".join(parts)
    
    # Ensure we don't exceed max length
    if len(filename) > max_length - 5:
        filename = filename[:max_length - 5].rstrip("-_")
    
    return filename + ".webp"




# ---------------------------------------------------------------------------
# Main Processing
# ---------------------------------------------------------------------------

def process_pdf(
    pdf_path: Path,
    json_records: List[Dict[str, Any]],
    output_dir: Path,
    quality: int = 85,
    max_width: Optional[int] = None,
    save_brands: bool = True,
) -> List[Dict[str, Any]]:
    """Process a single PDF and extract images linked to specific series.
    
    Uses series-based matching to correctly link images to SKUs when
    multiple series appear on the same page.
    
    Brand/logo images are saved to images/brands/{pdf_stem}/ folder.
    """
    extracted = []
    pdf_stem = pdf_path.stem
    pdf_output_dir = output_dir / slugify(pdf_stem)
    brand_output_dir = output_dir / "brands" / slugify(pdf_stem)
    
    try:
        doc = fitz.open(str(pdf_path))
    except Exception as e:
        print(f"  Error opening PDF: {e}")
        return []
    
    print(f"  Processing {pdf_path.name} ({len(doc)} pages)...")
    
    # Group records by page
    from collections import defaultdict
    records_by_page: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
    for rec in json_records:
        page_num = rec.get("page")
        if page_num is None:
            ctx = rec.get("_context") or {}
            page_num = ctx.get("page_number")
        if page_num:
            records_by_page[page_num].append(rec)
    
    # Track which series have been assigned images (for deduplication)
    series_image_count: Dict[str, int] = defaultdict(int)
    
    for page_num in sorted(records_by_page.keys()):
        if page_num < 1 or page_num > len(doc):
            continue
        
        page = doc[page_num - 1]  # 0-indexed
        page_records = records_by_page[page_num]
        
        if not page_records:
            continue
        
        # Extract images from this page (product and brand images)
        images, brand_images = extract_images_from_page(page, doc)
        
        # Save brand images to separate folder
        if save_brands and brand_images:
            brand_output_dir.mkdir(parents=True, exist_ok=True)
            for idx, brand_img in enumerate(brand_images):
                brand_filename = f"{slugify(pdf_stem)}__p{page_num}__brand_{idx + 1}.webp"
                brand_path = brand_output_dir / brand_filename
                convert_to_webp(
                    brand_img["bytes"],
                    brand_path,
                    quality=quality,
                    max_width=max_width,
                )
        
        if not images:
            continue
        
        # Group records by series on this page
        series_groups = group_records_by_series(page_records)
        
        # Find vertical positions of each series
        series_positions = find_series_positions_on_page(page, series_groups)
        
        # Sort images by vertical position (top to bottom)
        images.sort(key=lambda x: x["bbox"][1])
        
        # First pass: count images per series to know totals
        image_series_assignments = []
        for img_data in images:
            matched_series = match_image_to_series(
                img_data["bbox"],
                series_positions,
                max_distance=MAX_IMAGE_TABLE_DISTANCE,
            )
            
            if matched_series:
                series_id = matched_series["series_id"]
            else:
                category = get_category_from_records(page_records)
                series_id = slugify(category) if category else f"page-{page_num}"
            
            image_series_assignments.append((img_data, matched_series, series_id))
        
        # Count total images per series on this page
        from collections import Counter
        page_series_counts = Counter(sid for _, _, sid in image_series_assignments)
        
        # Second pass: generate filenames with correct totals
        page_series_index: Dict[str, int] = defaultdict(int)
        
        for img_data, matched_series, series_id in image_series_assignments:
            if matched_series:
                series_name = matched_series["series_name"]
                skus = matched_series["skus"]
                first_sku = matched_series["first_sku"]
            else:
                category = get_category_from_records(page_records)
                series_name = category
                skus = get_skus_from_records(page_records)
                first_sku = skus[0] if skus else None
            
            # Get index and total for this series on this page
            img_idx = page_series_index[series_id]
            page_series_index[series_id] += 1
            total_on_page = page_series_counts[series_id]
            
            # For total images, consider global count across all pages
            total_images = max(total_on_page, series_image_count.get(series_id, 0) + total_on_page)
            
            # Get OCR-detected SKUs from the image (if any)
            ocr_skus = img_data.get("ocr_skus", [])
            
            filename = generate_image_filename(
                pdf_stem=pdf_stem,
                page_num=page_num,
                series_id=series_id,
                series_name=series_name,
                first_sku=first_sku,
                skus=skus,
                ocr_skus=ocr_skus,  # Pass OCR-detected SKUs
                image_index=series_image_count[series_id] + img_idx,
                total_images=total_images,
            )
            
            # Update global count after generating filename
            if img_idx == total_on_page - 1:
                series_image_count[series_id] += total_on_page
            
            output_path = pdf_output_dir / filename
            
            # Convert and save
            if convert_to_webp(
                img_data["bytes"],
                output_path,
                quality=quality,
                max_width=max_width,
            ):
                relative_path = f"images/{slugify(pdf_stem)}/{filename}"
                
                extracted.append({
                    "pdf": pdf_path.name,
                    "page": page_num,
                    "series_id": series_id if matched_series else None,
                    "series_name": matched_series["series_name"] if matched_series else None,
                    "skus": matched_series["skus"] if matched_series else skus,
                    "ocr_skus": ocr_skus,  # SKUs detected directly on the image
                    "image_path": relative_path,
                    "original_size": (img_data["width"], img_data["height"]),
                })
                
                series_label = series_id if matched_series else "unmatched"
                print(f"    Page {page_num} [{series_label}]: {filename}")
    
    doc.close()
    return extracted


def load_image_sku_mapping() -> Dict[str, Any]:
    """Load existing image-SKU mapping or return empty dict."""
    if IMAGE_SKU_MAPPING_FILE.exists():
        try:
            with open(IMAGE_SKU_MAPPING_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_image_sku_mapping(mapping: Dict[str, Any]) -> None:
    """Save image-SKU mapping to JSON file."""
    with open(IMAGE_SKU_MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    print(f"  Saved image-SKU mapping to {IMAGE_SKU_MAPPING_FILE.name}")


def update_image_sku_mapping(
    mapping: Dict[str, Any],
    image_mappings: List[Dict[str, Any]],
    json_path: Path,
) -> int:
    """Update the image-SKU mapping with complete SKU lists.
    
    Args:
        mapping: Existing mapping dict to update
        image_mappings: List of image extraction results
        json_path: Path to the product JSON file
        
    Returns:
        Number of images added/updated in the mapping
    """
    from collections import defaultdict
    
    # Load all SKUs from the JSON grouped by series_id
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            products = json.load(f)
    except Exception:
        return 0
    
    if not isinstance(products, list):
        return 0
    
    # Build series_id -> all SKUs mapping from the product data
    series_to_all_skus: Dict[str, List[str]] = defaultdict(list)
    for product in products:
        series_id = product.get("series_id")
        sku = product.get("sku")
        if series_id and sku:
            if sku not in series_to_all_skus[series_id]:
                series_to_all_skus[series_id].append(sku)
    
    updated = 0
    for img_data in image_mappings:
        image_path = img_data.get("image_path")
        series_id = img_data.get("series_id")
        
        if not image_path:
            continue
        
        # Get ALL SKUs for this series from the product JSON
        all_skus = series_to_all_skus.get(series_id, []) if series_id else []
        
        # Fall back to the SKUs from extraction if no series match
        if not all_skus:
            all_skus = img_data.get("skus", [])
        
        mapping[image_path] = {
            "series_id": series_id,
            "series_name": img_data.get("series_name"),
            "pdf": img_data.get("pdf"),
            "page": img_data.get("page"),
            "skus": sorted(all_skus),  # Complete list of ALL SKUs
            "sku_count": len(all_skus),
        }
        updated += 1
    
    return updated


def generate_mapping_from_existing() -> Dict[str, Any]:
    """Generate image-SKU mapping from existing images and JSON files.
    
    This can be run without re-extracting images to build the mapping
    from current state.
    """
    from collections import defaultdict
    
    mapping = {}
    
    # Find all image directories
    for img_dir in IMAGE_OUTPUT_DIR.iterdir():
        if not img_dir.is_dir():
            continue
        
        pdf_stem = img_dir.name
        json_path = JSON_DIR / f"{pdf_stem}.json"
        
        if not json_path.exists():
            continue
        
        # Load products and build series -> SKUs mapping
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                products = json.load(f)
        except Exception:
            continue
        
        if not isinstance(products, list):
            continue
        
        series_to_skus: Dict[str, List[str]] = defaultdict(list)
        series_to_name: Dict[str, str] = {}
        
        for product in products:
            series_id = product.get("series_id")
            sku = product.get("sku")
            series_name = product.get("series_name")
            if series_id and sku:
                if sku not in series_to_skus[series_id]:
                    series_to_skus[series_id].append(sku)
                if series_name:
                    series_to_name[series_id] = series_name
        
        # Find all images and extract series_id from filename
        for img_file in img_dir.glob("*.webp"):
            # Parse filename: {pdf}__p{page}__{series_slug}__{skus}__v{N}.webp
            match = re.match(r"[^_]+__p(\d+)__([a-z0-9-]+)__", img_file.name)
            if not match:
                continue
            
            page = int(match.group(1))
            series_slug = match.group(2)  # e.g., "abs-knie-90"
            
            # Construct full series_id with PDF prefix (new format)
            full_series_id = f"{pdf_stem}__{series_slug}"
            
            relative_path = f"images/{pdf_stem}/{img_file.name}"
            all_skus = series_to_skus.get(full_series_id, [])
            
            mapping[relative_path] = {
                "series_id": full_series_id,
                "series_name": series_to_name.get(full_series_id),
                "pdf": f"{pdf_stem}.pdf",
                "page": page,
                "skus": sorted(all_skus),
                "sku_count": len(all_skus),
            }
    
    return mapping


def update_json_with_images(
    json_path: Path,
    image_mappings: List[Dict[str, Any]],
) -> int:
    """Update JSON file with image paths for matching records.
    
    Simple matching: SKU.series_id → Image.series_id
    
    Each table (series_id) has one or more images.
    All SKUs in that table get assigned those images.
    
    Adds fields:
    - image: Primary image path (first image for the series)
    - images: List of all image paths for the series (if multiple)
    """
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"  Warning: Could not read {json_path}: {e}")
        return 0
    
    updated_count = 0
    
    from collections import defaultdict
    
    # Build mapping: series_id -> list of image paths
    series_images: Dict[str, List[str]] = defaultdict(list)
    
    for mapping in image_mappings:
        series_id = mapping.get("series_id")
        image_path = mapping.get("image_path")
        
        if series_id and image_path:
            if image_path not in series_images[series_id]:
                series_images[series_id].append(image_path)
    
    def update_record(rec: Dict[str, Any]) -> bool:
        series_id = rec.get("series_id")
        if not series_id:
            return False
        
        # Match by series_id
        if series_id in series_images:
            images = series_images[series_id]
            rec["image"] = images[0]
            if len(images) > 1:
                rec["images"] = images
            elif "images" in rec:
                del rec["images"]
            return True
        
        return False
    
    # Handle both list and dict structures
    if isinstance(data, list):
        for rec in data:
            if isinstance(rec, dict) and update_record(rec):
                updated_count += 1
    elif isinstance(data, dict):
        for key in ["variations", "products", "items"]:
            if key in data and isinstance(data[key], list):
                for rec in data[key]:
                    if isinstance(rec, dict) and update_record(rec):
                        updated_count += 1
    
    if updated_count > 0:
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    return updated_count


def main():
    parser = argparse.ArgumentParser(
        description="Extract product images from PDF catalogs"
    )
    parser.add_argument(
        "--update-json",
        action="store_true",
        help="Update JSON files with image paths",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=DEFAULT_WEBP_QUALITY,
        help=f"WebP quality (1-100, default: {DEFAULT_WEBP_QUALITY})",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=1200,
        help="Maximum image width in pixels (default: 1200)",
    )
    parser.add_argument(
        "--pdf",
        type=str,
        help="Process only this PDF (filename)",
    )
    parser.add_argument(
        "--generate-mapping",
        action="store_true",
        help="Generate image-SKU mapping from existing images (no extraction)",
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Preview mode: analyze images and show what would be filtered without saving",
    )
    parser.add_argument(
        "--save-rejected",
        action="store_true",
        help="Save rejected images to a separate folder for review",
    )
    
    args = parser.parse_args()
    
    # Handle --generate-mapping mode (no extraction needed)
    if args.generate_mapping:
        print("=" * 60)
        print("Generating Image-SKU Mapping from Existing Data")
        print("=" * 60)
        mapping = generate_mapping_from_existing()
        save_image_sku_mapping(mapping)
        print(f"\nTotal images mapped: {len(mapping)}")
        total_skus = sum(m.get("sku_count", 0) for m in mapping.values())
        print(f"Total SKUs covered: {total_skus}")
        print("=" * 60)
        return
    
    # Handle --preview mode
    if args.preview:
        print("=" * 60)
        print("PREVIEW MODE - Analyzing Image Quality Filters")
        print("=" * 60)
        print("This will show what images would be accepted/rejected without saving.\n")
        
        pdf_files = list(PDF_DIR.glob("*.pdf"))
        if args.pdf:
            pdf_files = [p for p in pdf_files if p.name.lower() == args.pdf.lower()]
        
        rejection_stats = {}
        total_accepted = 0
        total_rejected = 0
        
        for pdf_path in sorted(pdf_files)[:5]:  # Limit to 5 PDFs for preview
            print(f"\n📄 {pdf_path.name}")
            
            try:
                doc = fitz.open(str(pdf_path))
                
                for page_num in range(min(10, len(doc))):  # First 10 pages
                    page = doc[page_num]
                    product_imgs, rejected_imgs = extract_images_from_page(page, doc)
                    
                    total_accepted += len(product_imgs)
                    total_rejected += len(rejected_imgs)
                    
                    for img in rejected_imgs:
                        reason = img.get("rejection_reason", "unknown")
                        rejection_stats[reason] = rejection_stats.get(reason, 0) + 1
                    
                    if rejected_imgs:
                        print(f"  Page {page_num + 1}: ✅ {len(product_imgs)} accepted, ❌ {len(rejected_imgs)} rejected")
                        for img in rejected_imgs[:3]:
                            print(f"    - {img['width']}x{img['height']}: {img.get('rejection_reason', 'unknown')}")
                
                doc.close()
                
            except Exception as e:
                print(f"  Error: {e}")
        
        print("\n" + "=" * 60)
        print("📊 PREVIEW SUMMARY")
        print("=" * 60)
        print(f"✅ Would accept: {total_accepted} images")
        print(f"❌ Would reject: {total_rejected} images")
        print(f"\nRejection reasons:")
        for reason, count in sorted(rejection_stats.items(), key=lambda x: -x[1]):
            print(f"  - {reason}: {count}")
        print("\nRun without --preview to actually extract images.")
        print("Use --save-rejected to save rejected images for manual review.")
        print("=" * 60)
        return
    
    print("=" * 60)
    print("Product Image Extraction")
    print("=" * 60)
    print(f"PDF directory: {PDF_DIR}")
    print(f"JSON directory: {JSON_DIR}")
    print(f"Output directory: {IMAGE_OUTPUT_DIR}")
    print(f"Quality: {args.quality}")
    print(f"Max width: {args.max_width}px")
    print(f"Update JSON: {args.update_json}")
    print(f"Save rejected: {args.save_rejected}")
    print("=" * 60)
    
    # Create output directory
    IMAGE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Create rejected images directory if needed
    rejected_dir = IMAGE_OUTPUT_DIR / "_rejected"
    if args.save_rejected:
        rejected_dir.mkdir(parents=True, exist_ok=True)
    
    # Find all PDFs and their corresponding JSONs
    pdf_files = list(PDF_DIR.glob("*.pdf"))
    
    if args.pdf:
        pdf_files = [p for p in pdf_files if p.name.lower() == args.pdf.lower()]
        if not pdf_files:
            print(f"ERROR: PDF not found: {args.pdf}")
            sys.exit(1)
    
    total_images = 0
    total_updated = 0
    total_mapped = 0
    total_rejected = 0
    rejection_stats = {}
    
    # Load existing image-SKU mapping (to preserve data from previous runs)
    image_sku_mapping = load_image_sku_mapping()
    
    for pdf_path in sorted(pdf_files):
        json_path = JSON_DIR / f"{pdf_path.stem}.json"
        
        if not json_path.exists():
            print(f"\nSkipping {pdf_path.name} (no JSON found)")
            continue
        
        print(f"\n{pdf_path.name}")
        
        # Load JSON records
        records = load_json_records(json_path)
        if not records:
            print("  No records found in JSON")
            continue
        
        # Extract images
        image_mappings = process_pdf(
            pdf_path,
            records,
            IMAGE_OUTPUT_DIR,
            quality=args.quality,
            max_width=args.max_width,
            save_brands=args.save_rejected,  # Save rejected to brands folder for review
        )
        
        total_images += len(image_mappings)
        
        # Update image-SKU mapping with complete SKU lists
        if image_mappings:
            mapped = update_image_sku_mapping(image_sku_mapping, image_mappings, json_path)
            total_mapped += mapped
        
        # Update JSON if requested
        if args.update_json and image_mappings:
            updated = update_json_with_images(json_path, image_mappings)
            total_updated += updated
            if updated:
                print(f"  Updated {updated} records with image paths")
    
    # Save the complete image-SKU mapping
    if total_mapped > 0:
        save_image_sku_mapping(image_sku_mapping)
    
    print("\n" + "=" * 60)
    print(f"Total images extracted: {total_images}")
    print(f"Total images in SKU mapping: {len(image_sku_mapping)}")
    if args.update_json:
        print(f"Total records updated: {total_updated}")
    if args.save_rejected:
        print(f"Rejected images saved to: {rejected_dir}")
    print("=" * 60)


if __name__ == "__main__":
    main()
