import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { World } from './world';
import { mock } from '../api';

// One-off: new sample PDFs of wide tables (column slices with the first column repeated).
const OUT = path.resolve('../scratch/report-pdf/rich-samples');
let w: World;
test.beforeAll(async () => { w = await World.create(); fs.mkdirSync(OUT, { recursive: true }); });
test.afterAll(async () => { await w?.cleanup(); });

const table = (rows: string[][], head: string[]) =>
  `<table><tbody><tr>${head.map((c) => `<th><p>${c}</p></th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td><p>${c}</p></td>`).join('')}</tr>`).join('')}</tbody></table>`;

async function req(name: string, description: string) {
  const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: name, projectId: await w.project(), state: 4, isActive: true, description }, '/api/pm/requirement/{id}');
  const r = await w.api.bytes(`/api/pm/requirement/${id}/export`, { format: 'pdf', lang: 'th' });
  if (r.status !== 200) throw new Error(`${name}: ${r.status}`);
  fs.writeFileSync(path.join(OUT, `${name}.pdf`), r.data);
}

test('wide table samples', async () => {
  const col = (n: number, p: string) => Array.from({ length: n }, (_, i) => `${p}${i + 1}`);
  await req('05-wide-table-9-columns-slices', `<p>ตาราง 9 คอลัมน์: แบ่งเป็น 2 ชิ้น คอลัมน์แรก (รหัส) และหัวตารางซ้ำทุกชิ้น</p>${table(['A', 'B', 'C', 'D'].map((r) => [`รหัส-${r}`, ...col(8, `${r}`)]), ['รหัส', ...col(8, 'หัวข้อ')])}`);
  await req('05b-wide-table-16-columns-slices', `<p>ตาราง 16 คอลัมน์: แบ่งเป็น 3 ชิ้น</p>${table(['A', 'B', 'C'].map((r) => [`รหัส-${r}`, ...col(15, `${r}`)]), ['รหัส', ...col(15, 'หัวข้อ')])}`);
  await req('05c-wide-table-60-rows-x-8-columns', `<p>ตารางกว้าง 8 คอลัมน์ ยาว 60 แถว</p>${table(Array.from({ length: 60 }, (_, i) => [`แถว-${i + 1}`, ...col(7, `v${i + 1}.`)]), ['แถว', ...col(7, 'ค่า')])}`);
});
