import json

# Expected counts from PDF images
expected = {
    "NR 90 - KNIE 90°": 12,
    "NR 120 - KNIE 45°": 12,
    "NR 240 - VERLOOPMOF": 21,
    "NR 241 - VERLOOPRING": 31,
    "NR 245 - VERLOOPNIPPEL": 31,
    "NR 290 - PLUG": 12,
    "NR 300 - DOP ZESKANT": 12,
    "NR 471 - MUURKNIE": 3,
    "NR 341 - RACCORD": 12,
    "NR 23 - PIJPNIPPEL": 20,
}

with open('public/data/rvs_draadfittingen_grouped.json') as f:
    data = json.load(f)

print("Series Verification:")
print("-" * 60)
all_ok = True
for g in data:
    name = g['name'].split(' (Page')[0]  # Remove page suffix
    if name in expected:
        actual = g['variant_count']
        exp = expected[name]
        status = "✓" if actual == exp else "✗"
        if actual != exp:
            all_ok = False
        print(f"{status} {name}: {actual}/{exp}")

print("-" * 60)
print("All OK!" if all_ok else "Some series have incorrect counts")
