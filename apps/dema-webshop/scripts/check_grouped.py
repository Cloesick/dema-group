import json

with open('public/data/rvs_draadfittingen_grouped.json') as f:
    data = json.load(f)

for g in data:
    if 'NR 90' in g['name'] and 'NR 92' not in g['name']:
        print(f"Group: {g['name']}")
        print(f"Variant count: {g['variant_count']}")
        print(f"SKUs: {[v['sku'] for v in g['variants']]}")
