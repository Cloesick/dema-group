#!/usr/bin/env python3
"""
Fix bronpompen.json to:
1. Add missing ST-series products from pages 6-7
2. Structure motor variants as parent/children
3. Share images across multi-page tables
4. Fix table header interpretation (Type = SKU)
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
JSON_PATH = PROJECT_ROOT / "documents" / "Product_pdfs" / "json" / "bronpompen.json"
IMAGE_DIR = PROJECT_ROOT / "documents" / "Product_pdfs" / "images" / "bronpompen"

def load_json():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data):
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def find_image_for_series(series_id, page):
    """Find the best image for a series, checking current and previous pages."""
    images = list(IMAGE_DIR.glob("*.webp"))
    
    # Look for images on this page first, then previous pages
    for check_page in range(page, max(3, page - 3), -1):
        for img in images:
            if f"__p{check_page}__" in img.name:
                return f"images/bronpompen/{img.name}"
    
    return None

def get_series_image_mapping():
    """Map series to their primary image (from first page of table)."""
    # Based on PDF analysis:
    # - Pages 4-5: 3" bronpompen (image on p4)
    # - Pages 6-7: 4" BRONPOMP SERIE ST (image on p6) 
    # - Pages 8-12: 4" bronpompen SP series (various images)
    # - Pages 14-19: 6" bronpompen
    # - Pages 20-22, 24-29: 8" bronpompen
    
    return {
        # 3" bronpompen
        "bronpompen__beregening-huishoudelijk-industrieel": {
            "pages": [4],
            "image": "images/bronpompen/bronpompen__p4__schakelkast-voor-monofasige.webp"
        },
        # 4" bronpompmotoren  
        "bronpompen__huishoudelijk-landbouw-industrieel": {
            "pages": [5],
            "image": "images/bronpompen/bronpompen__p5__huishoudelijk-landbouw-industrieel.webp"
        },
        # 4" BRONPOMP SERIE ST - spans pages 6-7
        "bronpompen__4-bronpomp-serie-st": {
            "pages": [6, 7],
            "image": "images/bronpompen/bronpompen__p6__4-bronpomp-serie-st.webp"  # Will need to extract
        },
        # 4" bronpompen (continuation on page 7)
        "bronpompen__4-bronpompen": {
            "pages": [7],
            "image": "images/bronpompen/bronpompen__p6__4-bronpomp-serie-st.webp"  # Share from p6
        },
    }

# ST-series products from pages 6-7 (manually extracted from PDF)
ST_SERIES_PAGE_6 = [
    {
        "type": "ST-0519",
        "hydraulisch_deel": "MATST0519",
        "motor_1x230v": "MSM075",
        "motor_3x230v": "MST075", 
        "motor_3x400v": "MST076",
        "vermogen_kw": "0,55",
        "pk": "0,75",
        "debiet_m3h": "0 - 1,5",
        "opvoerhoogte_m": "30 - 126",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "11,7"
    },
    {
        "type": "ST-0526",
        "hydraulisch_deel": "MATST0526",
        "motor_1x230v": "MSM100",
        "motor_3x230v": "MST100",
        "motor_3x400v": "MST101",
        "vermogen_kw": "0,75",
        "pk": "1",
        "debiet_m3h": "0 - 1,5",
        "opvoerhoogte_m": "39 - 173",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "13,4"
    },
    {
        "type": "ST-0538",
        "hydraulisch_deel": "MATST0538",
        "motor_1x230v": "MSM150",
        "motor_3x230v": "MST150",
        "motor_3x400v": "MST151",
        "vermogen_kw": "1,1",
        "pk": "1,5",
        "debiet_m3h": "0 - 1,5",
        "opvoerhoogte_m": "52 - 253",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "16,9"
    },
    {
        "type": "ST-0552",
        "hydraulisch_deel": "MATST0552",
        "motor_1x230v": "MSM300",
        "motor_3x230v": "MST300",
        "motor_3x400v": "MST301",
        "vermogen_kw": "2,2",
        "pk": "3",
        "debiet_m3h": "0 - 1,5",
        "opvoerhoogte_m": "84 - 343",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "24,8"
    },
    {
        "type": "ST-1007",
        "hydraulisch_deel": "MATST1007",
        "motor_1x230v": "MSM050",
        "motor_3x230v": "-",
        "motor_3x400v": "MST050",
        "vermogen_kw": "0,37",
        "pk": "0,50",
        "debiet_m3h": "1,5 - 3",
        "opvoerhoogte_m": "22 - 46",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "9,3"
    },
    {
        "type": "ST-1010",
        "hydraulisch_deel": "MATST1010",
        "motor_1x230v": "MSM075",
        "motor_3x230v": "MST075",
        "motor_3x400v": "MST076",
        "vermogen_kw": "0,55",
        "pk": "0,75",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "7 - 46",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "10,3"
    },
    {
        "type": "ST-1014",
        "hydraulisch_deel": "MATST1014",
        "motor_1x230v": "MSM100",
        "motor_3x230v": "MST100",
        "motor_3x400v": "MST101",
        "vermogen_kw": "0,75",
        "pk": "1",
        "debiet_m3h": "1,5 - 3",
        "opvoerhoogte_m": "42 - 92",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "11,5"
    },
    {
        "type": "ST-1020",
        "hydraulisch_deel": "MATST1020",
        "motor_1x230v": "MSM150",
        "motor_3x230v": "MST150",
        "motor_3x400v": "MST161",
        "vermogen_kw": "1,1",
        "pk": "1,5",
        "debiet_m3h": "1,5 - 3",
        "opvoerhoogte_m": "64 - 139",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "13,6"
    },
    {
        "type": "ST-1028",
        "hydraulisch_deel": "MATST1028",
        "motor_1x230v": "MSM200",
        "motor_3x230v": "MST200",
        "motor_3x400v": "MST201",
        "vermogen_kw": "1,5",
        "pk": "2",
        "debiet_m3h": "1,5 - 3",
        "opvoerhoogte_m": "85 - 189",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "15,0"
    },
    {
        "type": "ST-1040",
        "hydraulisch_deel": "MATST1040",
        "motor_1x230v": "MSM300",
        "motor_3x230v": "MST300",
        "motor_3x400v": "MST301",
        "vermogen_kw": "2,2",
        "pk": "3",
        "debiet_m3h": "1,5 - 3",
        "opvoerhoogte_m": "120 - 265",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "20,8"
    },
    {
        "type": "ST-1807",
        "hydraulisch_deel": "MATST1807",
        "motor_1x230v": "MSM075",
        "motor_3x230v": "MST075",
        "motor_3x400v": "MST076",
        "vermogen_kw": "0,55",
        "pk": "0,75",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "7 - 46",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "10,6"
    },
    {
        "type": "ST-1809",
        "hydraulisch_deel": "MATST1809",
        "motor_1x230v": "MSM100",
        "motor_3x230v": "MST100",
        "motor_3x400v": "MST101",
        "vermogen_kw": "0,75",
        "pk": "1",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "10 - 59",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "10,9"
    },
    {
        "type": "ST-1814",
        "hydraulisch_deel": "MATST1814",
        "motor_1x230v": "MSM150",
        "motor_3x230v": "MST150",
        "motor_3x400v": "MST151",
        "vermogen_kw": "1,1",
        "pk": "1,5",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "20 - 93",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "12,8"
    },
    {
        "type": "ST-1818",
        "hydraulisch_deel": "MATST1818",
        "motor_1x230v": "MSM200",
        "motor_3x230v": "MST200",
        "motor_3x400v": "MST201",
        "vermogen_kw": "1,5",
        "pk": "2",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "25 - 120",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "15,1"
    },
    {
        "type": "ST-1827",
        "hydraulisch_deel": "MATST1827",
        "motor_1x230v": "MSM300",
        "motor_3x230v": "MST300",
        "motor_3x400v": "MST301",
        "vermogen_kw": "2,2",
        "pk": "3",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "35 - 175",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "18,2"
    },
    {
        "type": "ST-1835",
        "hydraulisch_deel": "MATST1835",
        "motor_1x230v": "-",
        "motor_3x230v": "MST400",
        "motor_3x400v": "MST401",
        "vermogen_kw": "3,0",
        "pk": "4",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "50 - 251",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "20,7"
    },
    {
        "type": "ST-1848",
        "hydraulisch_deel": "MATST1848",
        "motor_1x230v": "-",
        "motor_3x230v": "MST550",
        "motor_3x400v": "MST501",
        "vermogen_kw": "4,0",
        "pk": "5,5",
        "debiet_m3h": "1,5 - 6",
        "opvoerhoogte_m": "70 - 322",
        "aansluiting": "5/4\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "25,2"
    },
    {
        "type": "ST-3530",
        "hydraulisch_deel": "MATST3510",
        "motor_1x230v": "MSM150",
        "motor_3x230v": "MST150",
        "motor_3x400v": "MST151",
        "vermogen_kw": "1,1",
        "pk": "1,5",
        "debiet_m3h": "3 - 8,4",
        "opvoerhoogte_m": "18 - 62",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "13,3"
    },
    {
        "type": "ST-3534",
        "hydraulisch_deel": "MATST3534",
        "motor_1x230v": "MSM200",
        "motor_3x230v": "MST200",
        "motor_3x400v": "MST201",
        "vermogen_kw": "1,5",
        "pk": "2",
        "debiet_m3h": "3 - 8,4",
        "opvoerhoogte_m": "28 - 90",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "16,3"
    },
    {
        "type": "ST-3520",
        "hydraulisch_deel": "MATST3520",
        "motor_1x230v": "MSM300",
        "motor_3x230v": "MST300",
        "motor_3x400v": "MST301",
        "vermogen_kw": "2,2",
        "pk": "3",
        "debiet_m3h": "3 - 8,4",
        "opvoerhoogte_m": "40 - 125",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "19,5"
    },
    {
        "type": "ST-3527",
        "hydraulisch_deel": "MATST3527",
        "motor_1x230v": "-",
        "motor_3x230v": "MST400",
        "motor_3x400v": "MST401",
        "vermogen_kw": "3,0",
        "pk": "4",
        "debiet_m3h": "3 - 8,4",
        "opvoerhoogte_m": "55 - 169",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "22,4"
    },
    {
        "type": "ST-3536",
        "hydraulisch_deel": "MATST3536",
        "motor_1x230v": "-",
        "motor_3x230v": "MST550",
        "motor_3x400v": "MST501",
        "vermogen_kw": "4,0",
        "pk": "5,5",
        "debiet_m3h": "3 - 8,4",
        "opvoerhoogte_m": "72 - 221",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "27,5"
    },
    {
        "type": "ST-3549",
        "hydraulisch_deel": "MATST3549",
        "motor_1x230v": "-",
        "motor_3x230v": "MST750",
        "motor_3x400v": "MST751",
        "vermogen_kw": "5,5",
        "pk": "7,5",
        "debiet_m3h": "3 - 8,4",
        "opvoerhoogte_m": "96 - 302",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "34,5"
    },
    {
        "type": "ST-4006",
        "hydraulisch_deel": "MATST4006",
        "motor_1x230v": "MSM150",
        "motor_3x230v": "MST150",
        "motor_3x400v": "MST181",
        "vermogen_kw": "1,1",
        "pk": "1,5",
        "debiet_m3h": "4,8 - 12",
        "opvoerhoogte_m": "17 - 39",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "12,0"
    },
    {
        "type": "ST-4008",
        "hydraulisch_deel": "MATST4008",
        "motor_1x230v": "MSM200",
        "motor_3x230v": "MST200",
        "motor_3x400v": "MST201",
        "vermogen_kw": "1,5",
        "pk": "2",
        "debiet_m3h": "4,8 - 12",
        "opvoerhoogte_m": "24 - 52",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "14,8"
    },
    {
        "type": "ST-4013",
        "hydraulisch_deel": "MATST4013",
        "motor_1x230v": "MSM300",
        "motor_3x230v": "MST300",
        "motor_3x400v": "MST301",
        "vermogen_kw": "2,2",
        "pk": "3",
        "debiet_m3h": "4,8 - 12",
        "opvoerhoogte_m": "30 - 82",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "17,6"
    },
    {
        "type": "ST-4017",
        "hydraulisch_deel": "MATST4017",
        "motor_1x230v": "-",
        "motor_3x230v": "MST400",
        "motor_3x400v": "MST401",
        "vermogen_kw": "3,0",
        "pk": "4",
        "debiet_m3h": "4,8 - 12",
        "opvoerhoogte_m": "46 - 108",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "19,4"
    },
    {
        "type": "ST-4023",
        "hydraulisch_deel": "MATST4023",
        "motor_1x230v": "-",
        "motor_3x230v": "MST550",
        "motor_3x400v": "MST501",
        "vermogen_kw": "4,0",
        "pk": "5,5",
        "debiet_m3h": "4,8 - 12",
        "opvoerhoogte_m": "60 - 148",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "23,7"
    },
    {
        "type": "ST-4032",
        "hydraulisch_deel": "MATST4032",
        "motor_1x230v": "-",
        "motor_3x230v": "MST750",
        "motor_3x400v": "MST751",
        "vermogen_kw": "5,5",
        "pk": "7,5",
        "debiet_m3h": "4,8 - 12",
        "opvoerhoogte_m": "80 - 202",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "29,6"
    },
]

# Page 7 continuation (MATST series with different column order)
ST_SERIES_PAGE_7 = [
    {
        "type": "ST-5507",
        "hydraulisch_deel": "MATST5507",
        "motor_1x230v": "MSM150",
        "motor_3x230v": "MST150",
        "motor_3x400v": "MST151",
        "vermogen_kw": "1,1",
        "pk": "1,5",
        "debiet_m3h": "0 - 14,4",
        "opvoerhoogte_m": "8 - 41",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "14,0"
    },
    {
        "type": "ST-5510",
        "hydraulisch_deel": "MATST5510",
        "motor_1x230v": "MSM200",
        "motor_3x230v": "MST200",
        "motor_3x400v": "MST201",
        "vermogen_kw": "1,5",
        "pk": "2",
        "debiet_m3h": "0 - 14,4",
        "opvoerhoogte_m": "13 - 58",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "17,1"
    },
    {
        "type": "ST-5514",
        "hydraulisch_deel": "MATST5514",
        "motor_1x230v": "MSM300",
        "motor_3x230v": "MST300",
        "motor_3x400v": "MST301",
        "vermogen_kw": "2,2",
        "pk": "3",
        "debiet_m3h": "0 - 14,4",
        "opvoerhoogte_m": "20 - 83",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "20,5"
    },
    {
        "type": "ST-5518",
        "hydraulisch_deel": "MATST5518",
        "motor_1x230v": "-",
        "motor_3x230v": "MST400",
        "motor_3x400v": "MST401",
        "vermogen_kw": "3,0",
        "pk": "4",
        "debiet_m3h": "0 - 14,4",
        "opvoerhoogte_m": "26 - 107",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "23,2"
    },
    {
        "type": "ST-5524",
        "hydraulisch_deel": "MATST5524",
        "motor_1x230v": "-",
        "motor_3x230v": "MST550",
        "motor_3x400v": "MST501",
        "vermogen_kw": "4,0",
        "pk": "5,5",
        "debiet_m3h": "0 - 14,4",
        "opvoerhoogte_m": "35 - 141",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "28,5"
    },
    {
        "type": "ST-5532",
        "hydraulisch_deel": "MATST5532",
        "motor_1x230v": "-",
        "motor_3x230v": "MST750",
        "motor_3x400v": "MST751",
        "vermogen_kw": "5,5",
        "pk": "7,5",
        "debiet_m3h": "0 - 14,4",
        "opvoerhoogte_m": "47 - 189",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "35,6"
    },
    {
        "type": "ST-8008",
        "hydraulisch_deel": "MATST8008",
        "motor_1x230v": "MSM300",
        "motor_3x230v": "MST300",
        "motor_3x400v": "MST301",
        "vermogen_kw": "2,2",
        "pk": "3",
        "debiet_m3h": "8,4 - 24",
        "opvoerhoogte_m": "12 - 53",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "18,5"
    },
    {
        "type": "ST-8011",
        "hydraulisch_deel": "MATST8011",
        "motor_1x230v": "-",
        "motor_3x230v": "MST400",
        "motor_3x400v": "MST401",
        "vermogen_kw": "3,0",
        "pk": "4",
        "debiet_m3h": "8,4 - 24",
        "opvoerhoogte_m": "18 - 70",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "20,9"
    },
    {
        "type": "ST-8015",
        "hydraulisch_deel": "MATST8015",
        "motor_1x230v": "-",
        "motor_3x230v": "MST550",
        "motor_3x400v": "MST501",
        "vermogen_kw": "4,0",
        "pk": "5,5",
        "debiet_m3h": "8,4 - 24",
        "opvoerhoogte_m": "27 - 97",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "25,4"
    },
    {
        "type": "ST-8020",
        "hydraulisch_deel": "MATST8020",
        "motor_1x230v": "-",
        "motor_3x230v": "MST750",
        "motor_3x400v": "MST751",
        "vermogen_kw": "5,5",
        "pk": "7,5",
        "debiet_m3h": "8,4 - 24",
        "opvoerhoogte_m": "37 - 125",
        "aansluiting": "2\"",
        "pomp_dia_mm": "98",
        "gewicht_kg": "32,1"
    },
]


def create_st_series_record(product, page, image_path):
    """Create a properly structured record for ST-series product with motor variants."""
    
    # Build motor variants as children
    motor_variants = []
    
    if product["motor_1x230v"] != "-":
        motor_variants.append({
            "voltage": "1x230V",
            "motor_code": product["motor_1x230v"],
            "phase": "single"
        })
    
    if product["motor_3x230v"] != "-":
        motor_variants.append({
            "voltage": "3x230V",
            "motor_code": product["motor_3x230v"],
            "phase": "three"
        })
    
    if product["motor_3x400v"] != "-":
        motor_variants.append({
            "voltage": "3x400V",
            "motor_code": product["motor_3x400v"],
            "phase": "three"
        })
    
    return {
        "sku": product["hydraulisch_deel"],  # Use Hydraulisch deel as SKU (Bestelnr)
        "series_id": "bronpompen__4-bronpomp-serie-st",
        "series_name": "4\" BRONPOMP SERIE ST",
        "source_pdf": "bronpompen.pdf",
        "page": page,
        "bestelnr": product["hydraulisch_deel"],
        "type": product["type"],  # Type is the model name (ST-0519, etc.)
        "hydraulisch_deel": product["hydraulisch_deel"],
        "vermogen_kw": product["vermogen_kw"],
        "pk": product["pk"],
        "debiet_m3h": product["debiet_m3h"],
        "opvoerhoogte_m": product["opvoerhoogte_m"],
        "aansluiting": product["aansluiting"],
        "pomp_dia_mm": product["pomp_dia_mm"],
        "gewicht_kg": product["gewicht_kg"],
        "motor_variants": motor_variants,
        "spec_housing": "rvs 304",
        "spec_impeller_material": "noryl",
        "spec_liquid_temp_range": "maximum 30°C",
        "spec_application_desc": "huishoudelijk, landbouw, semi-industrieel",
        "_enriched": {
            "series_raw": "4\" BRONPOMP SERIE ST",
            "series": "4-bronpomp-serie-st",
            "catalog_group": "well_pumps",
            "product_type": "well_pump",
            "material": "rvs 304",
            "family_id": f"well-pumps-4-bronpomp-serie-st-{product['hydraulisch_deel'].lower()}",
            "sku_series": "st",
            "bronpomp_variation": {
                "type": product["type"],
                "nominal_diameter_inch": "4",
                "power_kw": float(product["vermogen_kw"].replace(",", ".")),
                "flow_rate_m3h": product["debiet_m3h"],
                "head_m": product["opvoerhoogte_m"],
                "connection_inch": product["aansluiting"].replace("\"", ""),
                "pump_diameter_mm": float(product["pomp_dia_mm"])
            }
        },
        "image": image_path
    }


def fix_existing_records_image_sharing(records):
    """Fix image sharing for existing records where tables span multiple pages."""
    
    # Group records by series_id
    series_groups = {}
    for rec in records:
        series_id = rec.get("series_id", "")
        if series_id not in series_groups:
            series_groups[series_id] = []
        series_groups[series_id].append(rec)
    
    # For each series, find the first page with an image and share it
    for series_id, group in series_groups.items():
        # Sort by page
        group.sort(key=lambda x: x.get("page", 0))
        
        # Find first record with an image
        first_image = None
        for rec in group:
            if rec.get("image"):
                first_image = rec["image"]
                break
        
        # Apply to all records in series
        if first_image:
            for rec in group:
                if not rec.get("image"):
                    rec["image"] = first_image
    
    return records


def main():
    print("Loading bronpompen.json...")
    records = load_json()
    print(f"Loaded {len(records)} records")
    
    # Check for existing ST-series records and remove duplicates
    existing_st_skus = set()
    records_to_keep = []
    for rec in records:
        sku = rec.get("sku", "")
        if sku.startswith("ST-") or sku.startswith("MATST"):
            existing_st_skus.add(sku)
            # Skip - we'll add corrected versions
        else:
            records_to_keep.append(rec)
    
    print(f"Removed {len(records) - len(records_to_keep)} existing ST-series records")
    records = records_to_keep
    
    # Find the image for ST-series (from page 6)
    st_image = "images/bronpompen/bronpompen__p6__4-bronpomp-serie-st__v1.webp"
    
    # Verify it exists
    if not (IMAGE_DIR / "bronpompen__p6__4-bronpomp-serie-st__v1.webp").exists():
        print("Warning: ST-series image not found. Run image extraction first.")
    
    print(f"Using image for ST-series: {st_image}")
    
    # Add ST-series records from page 6
    print(f"Adding {len(ST_SERIES_PAGE_6)} ST-series products from page 6...")
    for product in ST_SERIES_PAGE_6:
        rec = create_st_series_record(product, 6, st_image)
        records.append(rec)
    
    # Add ST-series records from page 7 (continuation - same image)
    print(f"Adding {len(ST_SERIES_PAGE_7)} ST-series products from page 7...")
    for product in ST_SERIES_PAGE_7:
        rec = create_st_series_record(product, 7, st_image)
        records.append(rec)
    
    # Fix image sharing for all records
    print("Fixing image sharing across multi-page tables...")
    records = fix_existing_records_image_sharing(records)
    
    # Sort by page, then by SKU
    records.sort(key=lambda x: (x.get("page", 0), x.get("sku", "")))
    
    # Save
    print(f"Saving {len(records)} records...")
    save_json(records)
    print("Done!")
    
    # Summary
    pages = sorted(set(r.get("page") for r in records if r.get("page")))
    print(f"\nPages with data: {pages}")
    
    st_count = sum(1 for r in records if r.get("sku", "").startswith("ST-"))
    print(f"ST-series products: {st_count}")


if __name__ == "__main__":
    main()
