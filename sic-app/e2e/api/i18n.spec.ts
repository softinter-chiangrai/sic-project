import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Static check, no server needed: every translation key the code uses exists in both languages,
// and no English value is just the humanised key ("Fill Data Title") that ships to users.
const root = path.resolve('src/app');
const i18n = (lang: string) => JSON.parse(fs.readFileSync(`public/i18n/${lang}.json`, 'utf8')) as Record<string, unknown>;

function flat(o: Record<string, unknown>, prefix = '', out: Record<string, string> = {}) {
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flat(v as Record<string, unknown>, key, out);
    else out[key] = String(v);
  }
  return out;
}

function sources(dir: string, out: string[] = []): string[] {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) sources(p, out);
    else if (/\.(ts|html)$/.test(p)) out.push(p);
  }
  return out;
}

const en = flat(i18n('en'));
const th = flat(i18n('th'));

test('every translation key used by the code exists in en and th', () => {
  const used = new Set<string>();
  for (const f of sources(root)) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/(?:instant|get|stream)\(\s*'([A-Z][A-Z0-9_.]+)'/g)) used.add(m[1]);
    for (const m of s.matchAll(/'([A-Z][A-Z0-9_.]+)'\s*\|\s*translate/g)) used.add(m[1]);
  }
  const missing = [...used].filter((k) => !(k in en) || !(k in th));
  expect(missing, `keys without a translation: ${missing.join(', ')}`).toEqual([]);
});

test('no English value is a humanised key', () => {
  const words = (k: string) => k.split('.').pop()!.split('_').slice(1).join(' ').toLowerCase();
  const suffix = /(Title|Msg|Message|Label|Placeholder|Hint|Text|Desc|Description|Empty|Error|Fail|Success|Warn)$/;
  const keySuffix = /(_TITLE|_MSG|_MESSAGE|_LABEL|_PLACEHOLDER|_HINT|_TEXT|_DESC|_DESCRIPTION|_EMPTY|_ERROR|_FAIL|_SUCCESS|_WARN)/;
  // also code words that never belong in UI text ("Create Button", "Processing Ellipsis", "Desc Ph") and "Ai" cased from AI_
  const codeWord = /\b(Button|Btn|Ellipsis|Tooltip|Ph|Lbl)\b|\bAi\b/;
  const bad = Object.entries(en)
    .filter(([k, v]) => v.toLowerCase() === words(k) && ((keySuffix.test(k) && suffix.test(v)) || codeWord.test(v)))
    .map(([k, v]) => `${k}="${v}"`);
  expect(bad, `placeholder English text: ${bad.slice(0, 10).join(', ')}`).toEqual([]);
});

test('templates have no hardcoded Thai text (it would show in the English UI)', () => {
  const bad: string[] = [];
  for (const f of sources(root).filter((f) => f.endsWith('.html'))) {
    const s = fs.readFileSync(f, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    const where = path.relative(root, f);
    for (const m of s.matchAll(/>([^<>{}]*[฀-๿][^<>{}]*)</g)) if (m[1].trim()) bad.push(`${where}: ${m[1].trim().slice(0, 40)}`);
    for (const m of s.matchAll(/\s(placeholder|title|label|aria-label|alt)="([^"]*[฀-๿][^"]*)"/g)) bad.push(`${where}: ${m[1]}="${m[2].slice(0, 40)}"`);
  }
  expect(bad, `use a translate key instead:\n${bad.slice(0, 15).join('\n')}`).toEqual([]);
});
