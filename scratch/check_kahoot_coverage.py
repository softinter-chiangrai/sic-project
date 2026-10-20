import re
import os

html_path = 'docs/sic_kahoot_game.html'
guide_path = 'docs/BACKEND_ARCHITECTURE_GUIDE.md'

with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

with open(guide_path, 'r', encoding='utf-8') as f:
    guide_content = f.read()

# Extract modules from html
html_modules = re.findall(r'"?module"?:\s*"([^"]+)"', html_content)
print(f"Total modules in Kahoot HTML: {len(html_modules)}")

# Extract all files from BACKEND_ARCHITECTURE_GUIDE.md
# In the guide, tables have format: | number | `FileName.java` | description |
guide_files = re.findall(r'\|\s*\d+\s*\|\s*`?([A-Za-z0-9_]+\.java)`?\s*\|\s*([^\|]+)\|', guide_content)
print(f"Total files in Guide: {len(guide_files)}")

# Check which ones from guide are in html
html_set = set(html_modules)
guide_set = set(f[0] for f in guide_files)

missing_in_html = [f[0] for f in guide_files if f[0] not in html_set]
print(f"Missing in HTML: {len(missing_in_html)}")
print("Sample missing in HTML:", missing_in_html[:20])
