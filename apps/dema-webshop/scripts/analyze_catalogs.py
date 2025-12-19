"""Analyze catalog structure for AI Product Assistant knowledge base."""
import json
from pathlib import Path

catalogs = {}
for f in Path('public/data').glob('*_grouped.json'):
    if 'products_all' in f.name:
        continue
    name = f.stem.replace('_grouped', '')
    data = json.loads(f.read_text(encoding='utf-8'))
    
    series = set()
    apps = set()
    for g in data:
        if g.get('series_name'):
            series.add(g['series_name'])
        for v in g.get('variants', []):
            if v.get('attributes', {}).get('application'):
                apps.add(v['attributes']['application'])
    
    catalogs[name] = {
        'groups': len(data),
        'series_sample': list(series)[:5],
        'apps_sample': list(apps)[:5]
    }

for name, info in sorted(catalogs.items()):
    print(f"{name}: {info['groups']} groups")
    if info['series_sample']:
        print(f"  Series: {info['series_sample']}")
    if info['apps_sample']:
        print(f"  Apps: {info['apps_sample']}")
