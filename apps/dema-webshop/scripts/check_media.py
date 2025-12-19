import json
from pathlib import Path

data = json.loads(Path('public/data/rvs_draadfittingen_grouped.json').read_text(encoding='utf-8'))

# Check how many groups have media vs don't
with_media = 0
without_media = 0
for g in data:
    if g.get('media') and len(g['media']) > 0:
        with_media += 1
    else:
        without_media += 1

print(f'With media: {with_media}')
print(f'Without media: {without_media}')

# Check a specific example
for g in data:
    if '245' in g.get('name', ''):
        print(f"\nGroup: {g['name']}")
        print(f"Media: {g.get('media')}")
        print(f"Images: {g.get('images')}")
        break

