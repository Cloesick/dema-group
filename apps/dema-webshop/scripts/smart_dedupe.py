#!/usr/bin/env python3
"""Deduplicate images based on visual content using perceptual hashing.

This script:
1. Scans all images in the Product_pdfs/images directory
2. Computes perceptual hashes (pHash) for each image
3. Groups visually identical/similar images together
4. Keeps one canonical image per group, removes duplicates
5. Updates JSON files to point to the canonical image

Usage:
    python smart_dedupe.py [--dry-run] [--threshold 5] [--update-json]
    
Options:
    --dry-run       Show what would be deleted without actually deleting
    --threshold N   Hamming distance threshold for similarity (default: 5)
    --update-json   Update JSON files to use canonical image paths
"""

import argparse
import json
import os
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

try:
    from PIL import Image
    import imagehash
except ImportError:
    print("ERROR: Required packages not installed. Run:")
    print("  pip install Pillow imagehash")
    exit(1)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

IMAGES_DIR = Path(r"C:\Users\nicol\Projects\dema-webshop\documents\Product_pdfs\images")
JSON_DIR = Path(r"C:\Users\nicol\Projects\dema-webshop\documents\Product_pdfs\json")

# Default Hamming distance threshold for considering images as duplicates
# Lower = stricter matching, Higher = more lenient
# 0 = exact match only
# 5 = very similar (recommended)
# 10 = somewhat similar
DEFAULT_THRESHOLD = 5


# ---------------------------------------------------------------------------
# Perceptual Hashing
# ---------------------------------------------------------------------------

def compute_image_hash(image_path: Path) -> Optional[imagehash.ImageHash]:
    """Compute perceptual hash for an image."""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
            # Use pHash (perceptual hash) - robust to scaling and minor changes
            return imagehash.phash(img)
    except Exception as e:
        print(f"  Warning: Could not hash {image_path.name}: {e}")
        return None


def hamming_distance(hash1: imagehash.ImageHash, hash2: imagehash.ImageHash) -> int:
    """Calculate Hamming distance between two hashes."""
    return hash1 - hash2


# ---------------------------------------------------------------------------
# Duplicate Detection
# ---------------------------------------------------------------------------

def find_all_images(images_dir: Path) -> List[Path]:
    """Find all image files in the directory tree."""
    extensions = {'.webp', '.png', '.jpg', '.jpeg', '.gif'}
    images = []
    
    for root, dirs, files in os.walk(images_dir):
        # Skip brands folder
        if 'brands' in root:
            continue
        for file in files:
            if Path(file).suffix.lower() in extensions:
                images.append(Path(root) / file)
    
    return sorted(images)


def group_duplicates(
    images: List[Path],
    threshold: int = DEFAULT_THRESHOLD
) -> List[List[Path]]:
    """Group images by visual similarity using perceptual hashing.
    
    Returns list of groups, where each group contains visually similar images.
    """
    print(f"Computing hashes for {len(images)} images...")
    
    # Compute hashes for all images
    hashes: Dict[Path, imagehash.ImageHash] = {}
    for i, img_path in enumerate(images):
        if (i + 1) % 100 == 0:
            print(f"  Processed {i + 1}/{len(images)} images...")
        
        h = compute_image_hash(img_path)
        if h is not None:
            hashes[img_path] = h
    
    print(f"  Computed {len(hashes)} hashes")
    
    # Group similar images
    print("Finding duplicates...")
    processed: Set[Path] = set()
    groups: List[List[Path]] = []
    
    hash_items = list(hashes.items())
    
    for i, (path1, hash1) in enumerate(hash_items):
        if path1 in processed:
            continue
        
        # Start a new group with this image
        group = [path1]
        processed.add(path1)
        
        # Find all similar images
        for path2, hash2 in hash_items[i + 1:]:
            if path2 in processed:
                continue
            
            distance = hamming_distance(hash1, hash2)
            if distance <= threshold:
                group.append(path2)
                processed.add(path2)
        
        if len(group) > 1:
            groups.append(group)
    
    return groups


def choose_canonical(group: List[Path]) -> Tuple[Path, List[Path]]:
    """Choose the canonical (keeper) image from a group of duplicates.
    
    Strategy:
    1. Prefer images with shorter filenames (simpler naming)
    2. Prefer images without version suffix (v1, v2, etc.)
    3. Prefer larger file size (higher quality)
    
    Returns (canonical_path, duplicate_paths)
    """
    def score(path: Path) -> Tuple[int, int, int]:
        name = path.stem
        # Penalty for version suffix
        has_version = '__v' in name or name.endswith(('_v1', '_v2', '_v3', '_v4', '_v5'))
        version_penalty = 1 if has_version else 0
        # Prefer shorter names
        name_length = len(name)
        # Prefer larger files (negative because we want max)
        file_size = -path.stat().st_size
        return (version_penalty, name_length, file_size)
    
    sorted_group = sorted(group, key=score)
    canonical = sorted_group[0]
    duplicates = sorted_group[1:]
    
    return canonical, duplicates


# ---------------------------------------------------------------------------
# JSON Update
# ---------------------------------------------------------------------------

def update_json_files(
    canonical_map: Dict[str, str],
    json_dir: Path
) -> int:
    """Update JSON files to use canonical image paths.
    
    Args:
        canonical_map: Dict mapping old image path -> canonical image path
        json_dir: Directory containing JSON files
        
    Returns:
        Number of records updated
    """
    updated_total = 0
    
    for json_file in json_dir.glob("*.json"):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"  Warning: Could not read {json_file.name}: {e}")
            continue
        
        if not isinstance(data, list):
            continue
        
        updated_count = 0
        for record in data:
            # Update 'image' field
            if 'image' in record and record['image'] in canonical_map:
                record['image'] = canonical_map[record['image']]
                updated_count += 1
            
            # Update 'images' array
            if 'images' in record and isinstance(record['images'], list):
                new_images = []
                for img in record['images']:
                    if img in canonical_map:
                        canonical = canonical_map[img]
                        if canonical not in new_images:
                            new_images.append(canonical)
                    elif img not in new_images:
                        new_images.append(img)
                record['images'] = new_images
        
        if updated_count > 0:
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  Updated {updated_count} records in {json_file.name}")
            updated_total += updated_count
    
    return updated_total


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Deduplicate images based on visual content"
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be deleted without actually deleting'
    )
    parser.add_argument(
        '--threshold',
        type=int,
        default=DEFAULT_THRESHOLD,
        help=f'Hamming distance threshold (default: {DEFAULT_THRESHOLD})'
    )
    parser.add_argument(
        '--update-json',
        action='store_true',
        help='Update JSON files to use canonical image paths'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Smart Image Deduplication")
    print("=" * 60)
    print(f"Images directory: {IMAGES_DIR}")
    print(f"Threshold: {args.threshold}")
    print(f"Dry run: {args.dry_run}")
    print("=" * 60)
    
    # Find all images
    images = find_all_images(IMAGES_DIR)
    print(f"\nFound {len(images)} images")
    
    if not images:
        print("No images found!")
        return
    
    # Find duplicate groups
    groups = group_duplicates(images, threshold=args.threshold)
    
    if not groups:
        print("\nNo duplicates found!")
        return
    
    print(f"\nFound {len(groups)} groups of duplicates")
    
    # Process each group
    total_duplicates = 0
    total_saved_bytes = 0
    canonical_map: Dict[str, str] = {}  # old_path -> canonical_path
    
    for i, group in enumerate(groups):
        canonical, duplicates = choose_canonical(group)
        total_duplicates += len(duplicates)
        
        # Calculate space savings
        saved_bytes = sum(d.stat().st_size for d in duplicates)
        total_saved_bytes += saved_bytes
        
        # Build relative paths for JSON mapping
        canonical_rel = f"images/{canonical.parent.name}/{canonical.name}"
        
        print(f"\nGroup {i + 1}: {len(group)} images")
        print(f"  Canonical: {canonical.name}")
        for dup in duplicates:
            dup_rel = f"images/{dup.parent.name}/{dup.name}"
            canonical_map[dup_rel] = canonical_rel
            print(f"  Duplicate: {dup.name} ({dup.stat().st_size:,} bytes)")
            
            if not args.dry_run:
                dup.unlink()
                print(f"    -> Deleted")
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Duplicate groups found: {len(groups)}")
    print(f"Total duplicates: {total_duplicates}")
    print(f"Space saved: {total_saved_bytes:,} bytes ({total_saved_bytes / 1024 / 1024:.2f} MB)")
    
    if args.dry_run:
        print("\n[DRY RUN] No files were deleted")
    else:
        print(f"\nDeleted {total_duplicates} duplicate images")
    
    # Update JSON files if requested
    if args.update_json and canonical_map:
        print("\nUpdating JSON files...")
        updated = update_json_files(canonical_map, JSON_DIR)
        print(f"Updated {updated} records in JSON files")
    
    print("=" * 60)


if __name__ == "__main__":
    main()
