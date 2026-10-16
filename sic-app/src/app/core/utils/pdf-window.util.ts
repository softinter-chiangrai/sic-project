/**
 * แท็บสำหรับแสดง PDF ที่ต้องรอ server สร้าง
 * เบราว์เซอร์ยอมให้เปิดแท็บใหม่ได้แค่ไม่กี่วินาทีหลังผู้ใช้คลิก จึงต้องเรียก openPdfWindow() ทันทีตอนคลิก (ก่อนส่ง request)
 * แล้วค่อย show() เมื่อได้ไฟล์ ถ้าแท็บถูกบล็อกจะดาวน์โหลดเป็นไฟล์แทน และ close() เมื่อสร้างไม่สำเร็จ
 * ระหว่างรอ แท็บแสดงหน้า "กำลังสร้างเอกสาร…" (ไม่ใช่หน้าขาว) — เปิดแท็บหลังโหลดเสร็จไม่ได้ เพราะเบราว์เซอร์จะบล็อกเป็น popup
 */
export interface PdfWindow {
  show(blob: Blob, fileName: string): void;
  close(): void;
}

/** what the waiting tab shows instead of a blank white page: a spinner in the app's theme and language */
function showLoading(win: Window) {
  let th = true;
  try {
    th = (localStorage.getItem('app-lang') ?? 'th') === 'th';
  } catch {}
  const dark = document.documentElement.classList.contains('dark');
  const [bg, fg, ring] = dark ? ['#101215', '#cbd5e1', '#2a2d33'] : ['#f8fafc', '#334155', '#e2e8f0'];
  const text = th ? 'กำลังสร้างเอกสาร…' : 'Generating document…';
  const hint = th ? 'เอกสารจะแสดงในแท็บนี้เมื่อพร้อม' : 'It will open in this tab when ready';
  try {
    win.document.title = text;
    win.document.body.innerHTML = `
      <style>
        html,body{margin:0;height:100%;background:${bg};color:${fg};font-family:system-ui,'Sarabun',sans-serif}
        .w{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
        .s{width:40px;height:40px;border:4px solid ${ring};border-top-color:#10b981;border-radius:50%;animation:r .8s linear infinite}
        .h{font-size:13px;opacity:.6}
        @keyframes r{to{transform:rotate(360deg)}}
      </style>
      <div class="w"><div class="s"></div><div>${text}</div><div class="h">${hint}</div></div>`;
  } catch {} // the tab may already be gone
}

export function openPdfWindow(): PdfWindow {
  const win = window.open('about:blank', '_blank');
  if (win) showLoading(win);
  return {
    show(blob, fileName) {
      const pdf = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdf);
      if (win && !win.closed) {
        win.location.href = url;
        return;
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      a.click();
    },
    close() {
      win?.close();
    },
  };
}
