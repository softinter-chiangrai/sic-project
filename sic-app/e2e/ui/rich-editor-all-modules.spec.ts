import { test, expect } from '@playwright/test';
import { World } from '../api/world';
import { PAGE, hasText, probe, type Probe } from '../api/rich';
import { RICH_REPORTS } from '../api/rich-docs';
import { Ui } from '../ui';
import { RichEditor, pictureFile, save } from './rich-editor';

// The same browser path in every module that has a rich-text field and a PDF: open the document, put a picture and a table
// into its first rich field with the real editor, Save, then export the PDF and look for both.
test.setTimeout(240_000);

let w: World;
let ui: Ui;
test.beforeAll(async ({ browser }) => {
  w = await World.create();
  ui = await Ui.open(browser);
});
test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

const data = (b: any) => b?.data ?? b;
let n = 0;

for (const report of RICH_REPORTS.filter((r) => r.ui)) {
  test(`${report.name}: picture and table made in the browser reach the PDF`, async () => {
    const t = Math.random().toString(36).slice(2, 6);
    const size = { w: 361 + ++n * 3, h: 101 + n };
    const doc = await report.create(w, Object.fromEntries(report.fields.map((f) => [f, '<p>start</p>'])));
    expect(doc.id, `${report.name}: create returned no id`).toBeTruthy();

    await ui.visit(report.ui!.edit(doc.id!));
    const editor = new RichEditor(ui.page, 0);
    await editor.ready();
    await editor.addImage(pictureFile('png', size.w, size.h));
    await editor.insertTable();
    await editor.fillCell(0, 0, `Head${t}`);
    await editor.fillCell(1, 0, `Body${t}`);
    await save(ui.page);

    const body = (await w.api.get(report.ui!.get(doc.id!))).body;
    const html = report.ui!.read ? report.ui!.read(body) : String(data(body)[report.ui!.field] ?? '');
    expect(html, `${report.name}.${report.ui!.field}: the picture was not saved`).toContain('<img');
    expect(html, `${report.name}.${report.ui!.field}: the table was not saved`).toContain('<table');

    const res = await w.api.bytes(doc.path, { lang: 'th', ...doc.params });
    expect(res.status).toBe(200);
    const pdf: Probe = probe(res.data);
    const drawn = pdf.placed.find((p) => p.size === `${size.w}x${size.h}`);
    expect.soft(drawn, `${report.name}: picture ${size.w}x${size.h} missing from the PDF (${pdf.placed.map((p) => p.size).join(', ')})`).toBeTruthy();
    if (drawn) {
      expect.soft(drawn.x, `${report.name}: picture outside the left margin`).toBeGreaterThanOrEqual(PAGE.left - 1);
      expect.soft(drawn.x + drawn.w, `${report.name}: picture outside the right margin`).toBeLessThanOrEqual(PAGE.right + 1);
    }
    expect.soft(hasText(pdf.text, `Head${t}`), `${report.name}: table header cell missing from the PDF`).toBeTruthy();
    expect.soft(hasText(pdf.text, `Body${t}`), `${report.name}: table body cell missing from the PDF`).toBeTruthy();
  });
}
