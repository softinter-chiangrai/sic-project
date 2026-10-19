import os
import re

root_dir = r"c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\sic-spring\sic\src\main\java\com\softinter\sicapi"

categories = {
    "entry": [],
    "config": [],
    "interceptor": [],
    "exception": [],
    "scheduler": [],
    "websocket": [],
    "util": [],
    "entity_base": [],
    "entity_enums": [],
    "entity_db": [],
    "entity_ex": [],
    "entity_pm": [],
    "entity_su": [],
    "service": [],
    "service_impl": []
}

for root, dirs, files in os.walk(root_dir):
    # Skip controller, dto, repository
    norm_root = os.path.normpath(root).lower()
    if "\\controller" in norm_root or "\\dto" in norm_root or "\\repository" in norm_root:
        continue
    
    for f in sorted(files):
        if not f.endswith(".java"):
            continue
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, root_dir)
        
        # Categorize
        if f == "SicApiApplication.java":
            categories["entry"].append((f, full_path))
        elif "\\config" in norm_root:
            categories["config"].append((f, full_path))
        elif "\\interceptor" in norm_root:
            categories["interceptor"].append((f, full_path))
        elif "\\exception" in norm_root:
            categories["exception"].append((f, full_path))
        elif "\\scheduler" in norm_root:
            categories["scheduler"].append((f, full_path))
        elif "\\websocket" in norm_root:
            categories["websocket"].append((f, full_path))
        elif "\\util" in norm_root:
            categories["util"].append((f, full_path))
        elif "\\entity\\base" in norm_root:
            categories["entity_base"].append((f, full_path))
        elif "\\entity\\enums" in norm_root:
            categories["entity_enums"].append((f, full_path))
        elif "\\entity\\db" in norm_root:
            categories["entity_db"].append((f, full_path))
        elif "\\entity\\ex" in norm_root:
            categories["entity_ex"].append((f, full_path))
        elif "\\entity\\pm" in norm_root:
            categories["entity_pm"].append((f, full_path))
        elif "\\entity\\su" in norm_root:
            categories["entity_su"].append((f, full_path))
        elif "\\service\\impl" in norm_root:
            categories["service_impl"].append((f, full_path))
        elif "\\service" in norm_root:
            categories["service"].append((f, full_path))

total = sum(len(v) for v in categories.values())
print(f"Categorized total: {total}")
for k, v in categories.items():
    print(f"  {k}: {len(v)}")
