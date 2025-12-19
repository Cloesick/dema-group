import json

with open('public/data/rvs_draadfittingen_grouped.json') as f:
    data = json.load(f)

for g in data:
    name = g['name']
    if 'NR 240' in name or 'NR 241' in name or 'NR 245' in name or 'NR 180' in name:
        print(f"{name}: {g['variant_count']} variants")
