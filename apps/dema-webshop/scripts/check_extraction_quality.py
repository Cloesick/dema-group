import json
from pathlib import Path

grouped_dir = Path('public/data')

print("=" * 80)
print("EXTRACTION QUALITY REPORT")
print("=" * 80)

total_groups = 0
total_variants = 0
groups_with_images = 0
groups_without_images = 0

catalogs = []

for f in sorted(grouped_dir.glob('*_grouped.json')):
    if f.name == 'products_all_grouped.json':
        continue
    
    data = json.loads(f.read_text(encoding='utf-8'))
    
    catalog_name = f.stem.replace('_grouped', '').replace('_', '-')
    groups = len(data)
    variants = sum(g.get('variant_count', len(g.get('variants', []))) for g in data)
    
    with_img = sum(1 for g in data if g.get('media') and len(g['media']) > 0)
    without_img = groups - with_img
    
    # Check for empty series names
    empty_series = sum(1 for g in data if not g.get('series_name') or g.get('series_name') == 'Unknown')
    
    catalogs.append({
        'name': catalog_name,
        'groups': groups,
        'variants': variants,
        'with_images': with_img,
        'without_images': without_img,
        'empty_series': empty_series,
        'image_coverage': f"{with_img/groups*100:.0f}%" if groups > 0 else "N/A"
    })
    
    total_groups += groups
    total_variants += variants
    groups_with_images += with_img
    groups_without_images += without_img

# Sort by variants descending
catalogs.sort(key=lambda x: x['variants'], reverse=True)

print(f"\n{'Catalog':<45} {'Groups':>8} {'Variants':>10} {'Images':>10} {'Coverage':>10}")
print("-" * 85)

for c in catalogs:
    status = "✓" if c['without_images'] == 0 else f"⚠ {c['without_images']} missing"
    print(f"{c['name']:<45} {c['groups']:>8} {c['variants']:>10} {c['with_images']:>10} {c['image_coverage']:>10}")

print("-" * 85)
print(f"{'TOTAL':<45} {total_groups:>8} {total_variants:>10} {groups_with_images:>10} {groups_with_images/total_groups*100:.0f}%")

print("\n" + "=" * 80)
print("CATALOGS WITH LOW IMAGE COVERAGE (<80%)")
print("=" * 80)
for c in catalogs:
    coverage = c['with_images'] / c['groups'] * 100 if c['groups'] > 0 else 0
    if coverage < 80:
        print(f"  {c['name']}: {c['with_images']}/{c['groups']} groups have images ({coverage:.0f}%)")

print("\n" + "=" * 80)
print("CATALOGS WITH EMPTY SERIES NAMES")
print("=" * 80)
for c in catalogs:
    if c['empty_series'] > 0:
        print(f"  {c['name']}: {c['empty_series']} groups with empty/unknown series")
