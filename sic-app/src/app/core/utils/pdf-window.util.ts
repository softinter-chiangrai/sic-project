/**
 * แท็บสำหรับแสดง PDF ที่ต้องรอ server สร้าง
 * เบราว์เซอร์ยอมให้เปิดแท็บใหม่ได้แค่ไม่กี่วินาทีหลังผู้ใช้คลิก จึงต้องเรียก openPdfWindow() ทันทีตอนคลิก (ก่อนส่ง request)
 * แล้วค่อย show() เมื่อได้ไฟล์ ถ้าแท็บถูกบล็อกจะดาวน์โหลดเป็นไฟล์แทน และ close() เมื่อสร้างไม่สำเร็จ
 */
export interface PdfWindow {
  show(blob: Blob, fileName: string): void;
  close(): void;
}

export function openPdfWindow(): PdfWindow {
  const win = window.open('about:blank', '_blank');
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
