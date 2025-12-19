import json

with open('documents/Product_pdfs/json/rvs-draadfittingen.json') as f:
    data = json.load(f)

missing_skus = ['9ZF902', '9ZF903']
for p in data:
    if p['sku'] in missing_skus:
        print(f"SKU: {p['sku']}")
        print(f"  series_name: {p.get('series_name', 'NONE')}")
        print(f"  series_id: {p.get('series_id', 'NONE')}")
        print(f"  series_slug: {p.get('series_slug', 'NONE')}")
        print()
