export interface AiModelOption {
  id: string;
  name: string;
  provider?: string;
  recommended?: boolean;
}

/**
 * โมเดลเริ่มต้นสำหรับ AI ทั้งระบบ
 */
export const DEFAULT_AI_MODEL = 'gemini-3.7-flash';

/**
 * รายการโมเดล AI ที่พร้อมใช้งานในระบบ
 * อัปเดตรายชื่อและจัดการที่จุดนี้จุดเดียว ทุกหน้าจะเปลี่ยนตามโดยอัตโนมัติ
 */
export const AI_MODEL_OPTIONS: AiModelOption[] = [
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash (แนะนำ / ฉลาดและเร็ว)', provider: 'Google', recommended: true },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (เสถียร / คุณภาพสูง)', provider: 'Google' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (เร็วที่สุด / ประหยัด)', provider: 'Google' },
  { id: 'gpt-5.4-mini', name: 'OpenAI GPT-5.4 Mini', provider: 'OpenAI' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'Anthropic' },
];
