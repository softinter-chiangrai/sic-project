import json
import re

# Load full questions
with open(r'c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\scratch\all_299_questions.json', 'r', encoding='utf-8') as f:
    all_questions = json.load(f)

# Target packages: impl, util, exception, scheduler, websocket, config, interceptor (+ entry)
target_pkgs = {'config', 'interceptor', 'exception', 'scheduler', 'websocket', 'util', 'service/impl'}

filtered_questions = [
    q for q in all_questions 
    if q['package'].lower() in target_pkgs or q['module'] == 'SicApiApplication.java'
]

print(f"Filtered questions: {len(filtered_questions)}")

html_path = r'c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\docs\sic_kahoot_game.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Lobby badge and mode chips
old_lobby_part = re.search(r'<div class="badge-excluded"[^>]*>[\s\S]*?</div>\s*<div style="font-weight: 600; margin-bottom: 10px; color: #ffa602;">เลือกจำนวนข้อสอบ:</div>\s*<div class="option-group" id="modeSelector">[\s\S]*?</div>', html)
assert old_lobby_part is not None, "Could not find lobby badge part"

new_lobby_part = '''<div class="badge-excluded" style="background: rgba(38, 137, 12, 0.2); border-color: rgba(38, 137, 12, 0.5); color: #85e874; line-height: 1.6;">
          🎯 <strong>กรองเฉพาะ Core Logic & Implementation รวม 134 ไฟล์</strong><br>
          <span style="font-size: 0.82rem; color: #bbf7d0;">
            • service/impl (90) • util (18) • config (16) • interceptor (3) • exception (3) • scheduler (2) • websocket (1) • root (1)<br>
            <em>(ตัด service interface และ entity/enum ออกทั้งหมดตามที่กำหนด)</em>
          </span>
        </div>

        <div style="font-weight: 600; margin-bottom: 10px; color: #ffa602;">เลือกจำนวนข้อสอบ:</div>
        <div class="option-group" id="modeSelector">
          <div class="mode-chip selected" data-count="10">⚡ 10 ข้อ ด่วนพิเศษ</div>
          <div class="mode-chip" data-count="25">🎯 25 ข้อ มาตรฐาน</div>
          <div class="mode-chip" data-count="50">🔥 50 ข้อ ซ้อมสอบเข้มข้น</div>
          <div class="mode-chip" data-count="100">👑 100 ข้อ ท้าทายเซียน</div>
          <div class="mode-chip" data-count="134">🏆 ทั้งหมด 134 ข้อ (ครบทุกโมดูล)</div>
        </div>'''

html = html[:old_lobby_part.start()] + new_lobby_part + html[old_lobby_part.end():]

# 2. Update QUESTION_BANK
q_json = json.dumps(filtered_questions, ensure_ascii=False, indent=2)

js_start_marker = "    /* ============================================================\n       QUESTION BANK"
js_end_marker = "    /* ============================================================\n       WEB AUDIO SYNTHESIZER"

start_idx = html.find(js_start_marker)
end_idx = html.find(js_end_marker)
assert start_idx != -1 and end_idx != -1, "Could not find QUESTION_BANK marker in HTML"

new_q_bank = f"""    /* ============================================================
       QUESTION BANK - คลังคำถามเฉพาะ Core Logic & Implementation 134 ไฟล์
       (service/impl, util, config, interceptor, exception, scheduler, websocket, root)
       ============================================================ */
    const QUESTION_BANK = {q_json};

"""

html = html[:start_idx] + new_q_bank + html[end_idx:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Successfully updated sic_kahoot_game.html with 134 core logic files!")
