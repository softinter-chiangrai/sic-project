import { test, expect } from '@playwright/test';
import { World } from './world';
import { mock } from '../api';
import { hasText, probe, rich, type Rich } from './rich';
import { RICH_REPORTS } from './rich-docs';

// Picture and table typed into a Tiptap field must show up in the exported PDF, in every report that prints rich text.
// Each field gets its own picture size and its own words; the PDF is opened with OpenPDF (tools/PdfProbe.java) and we look
// for that picture and for every table cell. A missing piece names the report and the field, so one run shows all gaps.
test.setTimeout(240_000);

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

for (const report of RICH_REPORTS) {
  test(`${report.name}: picture, paragraph and table of every rich field are printed`, async () => {
    const fields: Record<string, Rich> = Object.fromEntries(report.fields.map((f) => [f, rich(`${report.name}${f}`)]));
    const doc = await report.create(w, Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.html])));
    const res = await w.api.bytes(doc.path, { lang: 'th', ...doc.params });
    expect(res.status, `${report.name}: export -> ${res.status}`).toBe(200);
    const pdf = probe(res.data);
    for (const [field, r] of Object.entries(fields)) {
      expect.soft(pdf.images, `${report.name}.${field}: picture ${r.image} is not in the PDF (images: ${[...new Set(pdf.images)].join(', ')})`).toContain(r.image);
      expect.soft(hasText(pdf.text, r.tokens.text), `${report.name}.${field}: paragraph text "${r.tokens.text}" is missing`).toBeTruthy();
      for (const cell of r.tokens.cells) {
        expect.soft(hasText(pdf.text, cell), `${report.name}.${field}: table cell "${cell}" is missing`).toBeTruthy();
      }
    }
  });
}

test('English export prints the same rich content (language switch must not drop it)', async () => {
  const r = rich('En');
  const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Rich req EN', projectId: await w.project(), state: 4, isActive: true, description: r.html }, '/api/pm/requirement/{id}');
  const res = await w.api.bytes(`/api/pm/requirement/${id}/export`, { format: 'pdf', lang: 'en' });
  expect(res.status).toBe(200);
  const pdf = probe(res.data);
  expect(pdf.images).toContain(r.image);
  expect(hasText(pdf.text, r.tokens.cells[3])).toBeTruthy();
});
