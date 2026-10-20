import json
import re

with open(r'c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\scratch\all_299_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions")

html_path = r'c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\docs\sic_kahoot_game.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Lobby badge and mode chips
old_lobby_badge = '''        <div class="badge-excluded">
          🚫 กรองออกแล้ว: ไม่รวม Entity, Enum, DB Master Data, entity/pm, entity/su
        </div>

        <div style="font-weight: 600; margin-bottom: 10px; color: #ffa602;">เลือกจำนวนข้อสอบ:</div>
        <div class="option-group" id="modeSelector">
          <div class="mode-chip selected" data-count="10">⚡ 10 ข้อ ด่วนพิเศษ</div>
          <div class="mode-chip" data-count="20">🎯 20 ข้อ มาตรฐาน</div>
          <div class="mode-chip" data-count="35">🔥 35 ข้อ ตะลุยจัดเต็ม</div>
        </div>'''

new_lobby_badge = '''        <div class="badge-excluded" style="background: rgba(38, 137, 12, 0.2); border-color: rgba(38, 137, 12, 0.5); color: #85e874;">
          ✨ รวมครบถ้วน 100% ทั้ง 299 ไฟล์ตาม Architecture Guide (ไม่จำกัดเวลา ตอบเสร็จเฉลยทันที)
        </div>

        <div style="font-weight: 600; margin-bottom: 10px; color: #ffa602;">เลือกจำนวนข้อสอบ:</div>
        <div class="option-group" id="modeSelector">
          <div class="mode-chip selected" data-count="10">⚡ 10 ข้อ ด่วนพิเศษ</div>
          <div class="mode-chip" data-count="25">🎯 25 ข้อ มาตรฐาน</div>
          <div class="mode-chip" data-count="50">🔥 50 ข้อ ซ้อมสอบเข้มข้น</div>
          <div class="mode-chip" data-count="100">👑 100 ข้อ ท้าทายเซียน</div>
          <div class="mode-chip" data-count="299">🏆 ทั้งหมด 299 ข้อ (ครบทุกไฟล์)</div>
        </div>'''

assert old_lobby_badge in html, "Could not find old_lobby_badge in HTML"
html = html.replace(old_lobby_badge, new_lobby_badge)

# 2. Replace Timer bar in HTML with Progress bar
old_timer_html = '''      <div class="timer-container">
        <div class="timer-bar" id="timerBar"></div>
        <span class="timer-seconds" id="timerSeconds">15s</span>
      </div>'''

new_progress_html = '''      <div class="progress-track" title="ความคืบหน้าการทำแบบทดสอบ">
        <div class="progress-bar-fill" id="progressBarFill"></div>
      </div>'''

assert old_timer_html in html, "Could not find old_timer_html in HTML"
html = html.replace(old_timer_html, new_progress_html)

# 3. Replace Timer CSS with Progress Bar CSS
old_timer_css = '''    /* TIMER BAR */
    .timer-container {
      width: 100%;
      height: 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      margin-bottom: 24px;
      overflow: hidden;
      position: relative;
    }

    .timer-bar {
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, #26890c, #ffa602, #e21b3c);
      transition: width 0.1s linear;
    }

    .timer-seconds {
      position: absolute;
      top: -28px;
      right: 0;
      font-size: 1.1rem;
      font-weight: 800;
      color: #ffa602;
    }'''

new_progress_css = '''    /* PROGRESS BAR (UNLIMITED TIME) */
    .progress-track {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      margin-bottom: 24px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .progress-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #ff007a, #7928ca, #1368ce);
      transition: width 0.3s ease;
      border-radius: 6px;
    }'''

assert old_timer_css in html, "Could not find old_timer_css in HTML"
html = html.replace(old_timer_css, new_progress_css)

# 4. Replace Javascript section from QUESTION_BANK to end of script
js_start_marker = "    /* ============================================================\n       QUESTION BANK"
js_end_marker = "  </script>\n</body>"

start_idx = html.find(js_start_marker)
end_idx = html.find(js_end_marker)
assert start_idx != -1 and end_idx != -1, "Could not find JS markers in HTML"

# Prepare QUESTION_BANK json string
q_json = json.dumps(questions, ensure_ascii=False, indent=2)

new_js = f"""    /* ============================================================
       QUESTION BANK - คลังคำถามไฟล์ Backend ทั้งหมด 299 ไฟล์
       ตรงตาม docs/BACKEND_ARCHITECTURE_GUIDE.md ครบ 100%
       ============================================================ */
    const QUESTION_BANK = {q_json};

    /* ============================================================
       WEB AUDIO SYNTHESIZER (Sound Effects)
       ============================================================ */
    let audioCtx = null;
    let soundEnabled = true;

    function getAudioContext() {{
      if (!audioCtx) {{
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }}
      if (audioCtx.state === 'suspended') {{
        audioCtx.resume();
      }}
      return audioCtx;
    }}

    function playTone(freq, type = 'sine', duration = 0.15, delay = 0) {{
      if (!soundEnabled) return;
      try {{
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      }} catch (e) {{}}
    }}

    function playCorrectSound() {{
      playTone(523.25, 'triangle', 0.15, 0.0);
      playTone(659.25, 'triangle', 0.15, 0.08);
      playTone(783.99, 'triangle', 0.25, 0.16);
    }}

    function playWrongSound() {{
      playTone(300, 'sawtooth', 0.18, 0.0);
      playTone(220, 'sawtooth', 0.35, 0.12);
    }}

    function playFanfare() {{
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => playTone(freq, 'triangle', 0.25, idx * 120 / 1000));
    }}

    function toggleSound() {{
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('soundBtn');
      btn.innerText = soundEnabled ? '🔊 เปิดเสียง' : '🔇 ปิดเสียง';
      if (soundEnabled) playCorrectSound();
    }}

    /* ============================================================
       GAME ENGINE STATE & LOGIC (UNLIMITED TIME & AUTO NEXT)
       ============================================================ */
    let currentQuestions = [];
    let currentIndex = 0;
    let score = 0;
    let streak = 0;
    let answered = false;
    let autoNextTimeout = null;
    let resultsLog = [];
    let selectedCount = 10;

    // Mode chips selector
    document.querySelectorAll('.mode-chip').forEach(chip => {{
      chip.addEventListener('click', () => {{
        document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedCount = parseInt(chip.getAttribute('data-count'), 10);
      }});
    }});

    function shuffleArray(arr) {{
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {{
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }}
      return copy;
    }}

    function startGame() {{
      getAudioContext();
      if (autoNextTimeout) {{
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
      }}
      const shuffled = shuffleArray(QUESTION_BANK);
      const limit = Math.min(selectedCount, shuffled.length);
      currentQuestions = shuffled.slice(0, limit);

      currentIndex = 0;
      score = 0;
      streak = 0;
      resultsLog = [];

      switchScreen('quizScreen');
      loadQuestion();
    }}

    function switchScreen(screenId) {{
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(screenId).classList.add('active');
    }}

    function loadQuestion() {{
      answered = false;
      if (autoNextTimeout) {{
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
      }}
      const q = currentQuestions[currentIndex];

      // Update UI Header & Progress
      document.getElementById('progressText').innerText = `ข้อ ${{currentIndex + 1}} / ${{currentQuestions.length}}`;
      document.getElementById('scoreText').innerText = score.toLocaleString();
      
      const pct = ((currentIndex + 1) / currentQuestions.length) * 100;
      const progressFill = document.getElementById('progressBarFill');
      if (progressFill) {{
        progressFill.style.width = `${{pct}}%`;
      }}

      const streakBadge = document.getElementById('streakBadge');
      if (streak >= 2) {{
        streakBadge.innerText = `🔥 ${{streak}} Streak!`;
        streakBadge.style.display = 'inline-block';
      }} else {{
        streakBadge.style.display = 'none';
      }}

      // Reset feedback banner
      const feedbackBanner = document.getElementById('feedbackBanner');
      feedbackBanner.className = 'feedback-banner';
      feedbackBanner.style.display = 'none';

      // Set Question
      document.getElementById('moduleCategory').innerText = `${{q.category}} • ${{q.package}}`;
      document.getElementById('moduleName').innerText = q.module;

      // Generate 4 choices (1 correct + 3 distinct distractors)
      const otherAnswers = QUESTION_BANK
        .filter(item => item.module !== q.module && item.answer !== q.answer)
        .map(item => item.answer);
      const uniqueDistractors = Array.from(new Set(otherAnswers));
      const shuffledDistractors = shuffleArray(uniqueDistractors).slice(0, 3);

      const choiceList = [
        {{ text: q.answer, isCorrect: true }},
        {{ text: shuffledDistractors[0] || 'การทำงานเสริมของระบบ', isCorrect: false }},
        {{ text: shuffledDistractors[1] || 'ฟังก์ชันควบคุมความถูกต้องของข้อมูล', isCorrect: false }},
        {{ text: shuffledDistractors[2] || 'โมดูลจัดการส่วนการเชื่อมต่อภายนอก', isCorrect: false }},
      ];

      const shuffledChoices = shuffleArray(choiceList);

      for (let i = 0; i < 4; i++) {{
        const btn = document.getElementById(`btn${{i}}`);
        const textSpan = document.getElementById(`choiceText${{i}}`);
        btn.disabled = false;
        btn.className = `choice-btn choice-${{['red', 'blue', 'yellow', 'green'][i]}}`;
        textSpan.innerText = shuffledChoices[i].text;
        btn.dataset.correct = shuffledChoices[i].isCorrect;
      }}
    }}

    function selectAnswer(selectedIndex) {{
      if (answered) return;
      answered = true;
      if (autoNextTimeout) {{
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
      }}

      const selectedBtn = document.getElementById(`btn${{selectedIndex}}`);
      const isCorrect = selectedBtn.dataset.correct === 'true';
      const currentQ = currentQuestions[currentIndex];

      // Disable buttons and show colors
      for (let i = 0; i < 4; i++) {{
        const btn = document.getElementById(`btn${{i}}`);
        btn.disabled = true;
        if (btn.dataset.correct === 'true') {{
          btn.classList.add('correct');
        }} else if (i === selectedIndex && !isCorrect) {{
          btn.classList.add('wrong');
        }} else {{
          btn.classList.add('dimmed');
        }}
      }}

      // Calculate score & streak
      if (isCorrect) {{
        streak++;
        const points = 1000 + (streak * 100);
        score += points;
        playCorrectSound();
        showFeedback(true, `+${{points.toLocaleString()}} คะแนน! ถูกต้อง`, currentQ.answer);
        resultsLog.push({{ module: currentQ.module, isCorrect: true, userScore: points }});
      }} else {{
        streak = 0;
        playWrongSound();
        showFeedback(false, "ตอบผิดนะจ๊ะ!", `คำตอบที่ถูกต้องคือ: ${{currentQ.answer}}`);
        resultsLog.push({{ module: currentQ.module, isCorrect: false, userScore: 0 }});
      }}

      document.getElementById('scoreText').innerText = score.toLocaleString();

      // Automatically advance to next question after 1.2s delay
      autoNextTimeout = setTimeout(() => {{
        nextQuestion();
      }}, 1200);
    }}

    function showFeedback(isOk, title, desc) {{
      const banner = document.getElementById('feedbackBanner');
      banner.style.display = 'flex';
      banner.className = `feedback-banner show ${{isOk ? 'is-correct' : 'is-wrong'}}`;
      document.getElementById('feedbackTitle').innerText = (isOk ? '🎉 ' : '❌ ') + title;
      document.getElementById('feedbackDetail').innerText = desc;
    }}

    function nextQuestion() {{
      if (autoNextTimeout) {{
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
      }}
      currentIndex++;
      if (currentIndex < currentQuestions.length) {{
        loadQuestion();
      }} else {{
        endGame();
      }}
    }}

    function endGame() {{
      if (autoNextTimeout) {{
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
      }}
      playFanfare();
      switchScreen('resultScreen');

      document.getElementById('finalScore').innerText = score.toLocaleString();
      const correctCount = resultsLog.filter(r => r.isCorrect).length;
      const wrongCount = resultsLog.length - correctCount;
      const accuracy = resultsLog.length > 0 ? Math.round((correctCount / resultsLog.length) * 100) : 0;

      document.getElementById('statCorrect').innerText = correctCount;
      document.getElementById('statWrong').innerText = wrongCount;
      document.getElementById('statAccuracy').innerText = `${{accuracy}}%`;

      // Rank Title & Trophy
      const rankEl = document.getElementById('resultRank');
      const trophyEl = document.getElementById('trophyIcon');
      if (accuracy >= 90) {{
        trophyEl.innerText = '👑';
        rankEl.innerText = 'ระดับเทพ: Software Architect ปราบโปรเจกต์ได้ 100%!';
      }} else if (accuracy >= 70) {{
        trophyEl.innerText = '🏆';
        rankEl.innerText = 'ระดับเซียน: Senior Developer พร้อมตอบอาจารย์ฉลุย!';
      }} else if (accuracy >= 50) {{
        trophyEl.innerText = '🎖️';
        rankEl.innerText = 'ระดับผ่านเกณฑ์: ทบทวนอีกนิด รับรองเต็มแน่นอน';
      }} else {{
        trophyEl.innerText = '📚';
        rankEl.innerText = 'ต้องทบทวนเพิ่ม: เปิดอ่าน Guide แล้วลองใหม่อีกรอบ!';
      }}

      // Review list
      const reviewList = document.getElementById('reviewList');
      reviewList.innerHTML = '';
      resultsLog.forEach((item, idx) => {{
        const div = document.createElement('div');
        div.className = `review-item ${{item.isCorrect ? 'ok' : 'fail'}}`;
        div.innerHTML = `
          <span><strong>ข้อ ${{idx + 1}}:</strong> <code>${{item.module}}</code></span>
          <span>${{item.isCorrect ? `✅ +${{item.userScore.toLocaleString()}}` : '❌ ผิด'}}</span>
        `;
        reviewList.appendChild(div);
      }});
    }}

    function restartGame() {{
      if (autoNextTimeout) {{
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
      }}
      switchScreen('lobbyScreen');
    }}
"""

html = html[:start_idx] + new_js + html[end_idx:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated sic_kahoot_game.html successfully with all 299 questions and unlimited time auto-advance!")
