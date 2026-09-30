export interface AiModelOption {
  id: string;
  name: string;
  provider?: string;
  recommended?: boolean;
  description?: string;
  icon?: string;
}

export const STORAGE_KEY_CACHED_MODELS = 'sic_ai_cached_models';
export const STORAGE_KEY_DEFAULT_MODEL = 'sic_ai_default_model';

function loadCachedModels(): AiModelOption[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CACHED_MODELS) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadCachedDefault(): string {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_DEFAULT_MODEL) : null;
    if (saved) return saved;
  } catch {
    // ignore
  }
  const cached = loadCachedModels();
  const rec = cached.find((m) => m.recommended);
  return rec?.id || cached[0]?.id || '';
}

/**
 * รายการโมเดล AI ในระบบ — โหลดแบบไดนามิกจากฐานข้อมูล (หน้า BURT07 /api/ai/models)
 * ซิงค์อัตโนมัติผ่าน AiModelsService ไม่มีการ Hardcode
 */
export const AI_MODEL_OPTIONS: AiModelOption[] = loadCachedModels();

/**
 * ค่าเริ่มต้นโมเดล AI — ซิงค์แบบไดนามิกจากตัวที่แนะนำในฐานข้อมูล (BURT07)
 */
export const DEFAULT_AI_MODEL: string = loadCachedDefault();
