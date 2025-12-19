import json
from pathlib import Path

data = json.loads(Path('public/data/slangklemmen_grouped.json').read_text(encoding='utf-8'))

print(f"Total groups: {len(data)}")
print(f"Total variants: {sum(g.get('variant_count', 0) for g in data)}")
print(f"\nAll groups:")
for i, g in enumerate(data):
    has_img = "✓" if g.get('images') else "✗"
    print(f"  {i+1}. {g['name']} - {g.get('variant_count')} variants [{has_img}]")
