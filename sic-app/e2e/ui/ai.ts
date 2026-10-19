import * as fs from 'node:fs';
import type { Ui } from '../ui';

// Shared by the ai-*.spec.ts files (see .claude/skills/playwright/ai-modules.md).

const en: Record<string, string> = JSON.parse(fs.readFileSync('public/i18n/en.json', 'utf8'));

/** English text of an i18n key ({{name}} placeholders filled from p); throws on a missing key so a renamed key fails loudly. */
export function t(key: string, p: Record<string, unknown> = {}): string {
  if (!(key in en)) throw new Error(`missing en key ${key}`);
  return en[key].replace(/{{\s*(\w+)\s*}}/g, (_, n) => String(p[n] ?? ''));
}

/**
 * Drop the AI history / navigator chats kept in localStorage (keys sic_ai_*) and switch the app to English.
 * Other keys (selected business, theme) are left alone. localStorage needs a page of the app, not about:blank.
 */
export async function resetAiStorage(ui: Ui) {
  if (!ui.page.url().startsWith('http')) await ui.visit('/feature/dashboard');
  await ui.page.evaluate(() => {
    for (const k of Object.keys(localStorage)) if (k.startsWith('sic_ai_')) localStorage.removeItem(k);
    localStorage.setItem('app-lang', 'en');
  });
}
