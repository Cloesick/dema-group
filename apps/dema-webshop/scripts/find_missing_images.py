import json
from pathlib import Path

data = json.loads(Path('public/data/zwarte_draad_en_lasfittingen_grouped.json').read_text(encoding='utf-8'))

for g in data:
    if not g.get('media') or len(g['media']) == 0:
        print(f"Missing image: {g['name']}")
        print(f"  Group ID: {g['group_id']}")
        print(f"  Series: {g.get('series_name')}")
        print(f"  Variants: {g.get('variant_count')}")
        if g.get('variants'):
            print(f"  First SKU: {g['variants'][0].get('sku')}")
            print(f"  Page: {g['variants'][0].get('page')}")
