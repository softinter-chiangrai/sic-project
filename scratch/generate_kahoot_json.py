import re
import json

guide_path = 'docs/BACKEND_ARCHITECTURE_GUIDE.md'
with open(guide_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Split by section "## <number>. ..."
sections = re.split(r'\n##\s+', text)
print(f"Total sections: {len(sections)}")

questions = []

for sec in sections[1:]:
    lines = sec.strip().split('\n')
    header = lines[0]
    
    # Ignore the Q&A cheat sheet sections at the end
    if 'Cheat Sheet' in header or '?' in header or 'ทำไม' in header or 'ระบบจัดการ' in header or 'ถ้ามี' in header:
        continue
    
    # Extract package/category from header
    # e.g., "2. แพ็กเกจ `config` (โครงสร้างพื้นฐาน & การตั้งค่าระบบ - 16 ไฟล์)"
    pkg_match = re.search(r'`([^`]+)`', header)
    if pkg_match:
        pkg = pkg_match.group(1)
    else:
        pkg = "Root"
    
    cat_match = re.search(r'\(([^-\)]+)', header)
    category = cat_match.group(1).strip() if cat_match else header
    
    for line in lines:
        m = re.match(r'\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|', line)
        if m:
            fname = m.group(1).strip()
            desc = m.group(2).strip()
            # Clean up markdown formatting inside desc if any for cleaner quiz text
            clean_desc = desc.replace('`', '')
            questions.append({
                "module": fname,
                "package": pkg,
                "category": category,
                "answer": clean_desc
            })

print(f"Total parsed questions: {len(questions)}")
assert len(questions) == 299, f"Expected 299 questions, got {len(questions)}"

with open('scratch/all_299_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Saved scratch/all_299_questions.json successfully!")
