import json
from pathlib import Path

grouped = json.loads(Path('public/data/products_all_grouped.json').read_text(encoding='utf-8'))

catalogs = {}
for g in grouped:
    cat = g.get('catalog', 'unknown')
    if cat not in catalogs:
        catalogs[cat] = {'groups': 0, 'variants': 0}
    catalogs[cat]['groups'] += 1
    catalogs[cat]['variants'] += g.get('variant_count', len(g.get('variants', [])))

for cat in sorted(catalogs.keys()):
    c = catalogs[cat]
    print(f"{cat}: {c['groups']} groups, {c['variants']} variants")
