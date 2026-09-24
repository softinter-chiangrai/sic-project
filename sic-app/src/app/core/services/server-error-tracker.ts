// เก็บข้อความ error ล่าสุดที่ backend ตอบกลับ (เช่น 409 "เอกสารนี้ได้รับการอนุมัติแล้วและถูกล็อก...")
// เพื่อให้ DialogService.error() แสดงเหตุผลจริงแทนข้อความทั่วไป "เกิดข้อผิดพลาด กรุณาลองใหม่" ที่แต่ละหน้าเขียนไว้ตายตัว
// ใช้เฉพาะ error แบบ business rule (4xx) และใช้ได้ครั้งเดียวภายในช่วงเวลาสั้นๆ หลัง request ที่ล้มเหลว

const BUSINESS_ERROR_STATUSES = new Set([400, 403, 404, 409, 422]);
const FRESH_WINDOW_MS = 2000;

let lastError: { message: string; at: number } | null = null;

export function recordServerError(status: number, body: unknown): void {
  if (!BUSINESS_ERROR_STATUSES.has(status)) return;
  const message = (body as { message?: unknown } | null)?.message;
  if (typeof message === 'string' && message.trim()) {
    lastError = { message: message.trim(), at: Date.now() };
  }
}

/** คืนข้อความ error จาก backend ที่เพิ่งเกิดขึ้น (และล้างค่า) หรือ null ถ้าไม่มี/เก่าเกินไป */
export function consumeRecentServerError(): string | null {
  const current = lastError;
  lastError = null;
  if (!current || Date.now() - current.at > FRESH_WINDOW_MS) return null;
  return current.message;
}
