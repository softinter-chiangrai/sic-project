// ข้อความ toast กลางที่ใช้ร่วมกันทุกหน้า (login, register, forgot-password, update-
// password ฯลฯ) ตอนผู้ใช้กด submit ทั้งที่ยังกรอกข้อมูลที่จำเป็นไม่ครบ — ตั้งใจให้
// เหมือนกันทุกหน้าแทนที่จะเขียนข้อความเฉพาะทีละหน้า (เช่น "กรุณากรอกชื่อผู้ใช้และ
// รหัสผ่าน" ของหน้า login แบบเดิม)
export const PLEASE_INPUT_DATA_MESSAGE = 'Please Input Data.';

// ---------------------------------------------------------------------------
// TemplateComponent ของ Keycloakify ตั้ง browser tab title ให้เองจาก
// `pageComponent.documentTitle` ถ้ามี ไม่งั้น fallback เป็น i18n.msgStr('loginTitle',
// realmName) = "Sign in to {realm}" เสมอ (ดู node_modules/@keycloakify/angular/src/
// login/template/template.component.ts) — ถูกกับหน้า login.ftl พอดี แต่หน้าอื่น
// (register, forgot password ฯลฯ) ที่ไม่ได้ set documentTitle เองจะโชว์ title ผิดหน้า
// ("Sign in to ...") ไปด้วย ทุกหน้า custom ที่ไม่ใช่ login.ftl จึงต้อง set
// documentTitle เองผ่าน helper นี้ ให้ตรงกับหัวข้อจริงของหน้านั้น
// ---------------------------------------------------------------------------
export function buildDocumentTitle(
  realm: { displayName?: string; name?: string } | undefined,
  pageTitle: string,
): string {
  const brand = realm?.displayName || realm?.name;
  return brand ? `${pageTitle} · ${brand}` : pageTitle;
}
