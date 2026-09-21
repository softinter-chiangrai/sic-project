import { ActivatedRoute, Params, Router } from '@angular/router';

export interface AiAutoOpenOptions {
  params: Params;
  router: Router;
  route: ActivatedRoute;
  moduleType: string;
  /** Return false to block auto-open (e.g. page is view-only/locked). Defaults to always allowed. */
  canOpen?: () => boolean;
  setPrompt: (prompt: string) => void;
  open: () => void;
  generate: () => void;
}

/**
 * ตรวจ query params ที่ Global AI Navigator ส่งมา (aiAutoOpen/aiModuleType/aiPrompt) แล้วเปิด
 * AI Draft modal ของหน้านั้นพร้อมกรอก prompt และเริ่ม generate ให้ทันที ใช้ร่วมกันในทุกฟอร์มที่มี
 * ปุ่ม "Generate with AI" แทนการ copy-paste query-param handling ซ้ำในแต่ละไฟล์
 *
 * เรียกจาก route.queryParams.subscribe((params) => tryAiAutoOpen({ params, ... })) เสมอเรียก
 * open() ก่อน setPrompt() เพราะบางฟอร์ม open() จะ reset prompt signal เป็น '' เอง
 */
export function tryAiAutoOpen(opts: AiAutoOpenOptions): void {
  const { params, router, route, moduleType, canOpen, setPrompt, open, generate } = opts;

  if (params['aiAutoOpen'] !== '1' || params['aiModuleType'] !== moduleType) return;
  if (canOpen && !canOpen()) return;

  const prompt = params['aiPrompt'] || '';

  open();
  setPrompt(prompt);
  if (prompt) {
    queueMicrotask(() => generate());
  }

  router.navigate([], {
    relativeTo: route,
    queryParams: { aiAutoOpen: null, aiModuleType: null, aiPrompt: null },
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
}
