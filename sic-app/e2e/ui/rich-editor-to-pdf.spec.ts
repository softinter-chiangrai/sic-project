import { test, expect } from '@playwright/test';
import { World, firstOf } from '../api/world';
import { mock } from '../api';
import { PAGE, hasText, probe, type Placed, type Probe } from '../api/rich';
import { Ui } from '../ui';
import { RichEditor, exportFromPage, pictureFile, save, webpFile } from './rich-editor';

// The whole path a user takes: pick a picture / insert a table in the real Tiptap editor, press Save, export the PDF.
// What the editor stored is read back through the API, and the PDF is opened with OpenPDF (tools/PdfProbe.java).
test.setTimeout(180_000);

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

const uid = () => Math.random().toString(36).slice(2, 6);
const where = (pdf: Probe) => pdf.placed.map((p) => `${p.size}@p${p.page}:${p.x},${p.w}x${p.h}`).join(' | ');
const inside = (p: Placed, what: string) => {
  expect.soft(p.x, `${what}: left edge ${p.x} is outside the margin`).toBeGreaterThanOrEqual(PAGE.left - 1);
  expect.soft(p.x + p.w, `${what}: right edge ${p.x + p.w} is outside the margin`).toBeLessThanOrEqual(PAGE.right + 1);
};

/** a fresh requirement, opened in the browser on its edit page; returns the editor of its description */
async function open() {
  // type and priority are required by the form: without them Save is refused
  const requirementType = firstOf((await w.api.get('/api/pm/requirement/lov-type')).body);
  const priority = firstOf((await w.api.get('/api/pm/requirement/lov-priority')).body);
  const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Browser editor', projectId: await w.project(), requirementType, priority, state: 4, isActive: true, description: '<p>start</p>' }, '/api/pm/requirement/{id}');
  await ui.visit(`/feature/pm/requirement/${id}/edit`);
  const editor = new RichEditor(ui.page, 0);
  await editor.ready();
  return { id, editor };
}

async function stored(id: string): Promise<string> {
  const body = (await w.api.get(`/api/pm/requirement/${id}`)).body;
  return String((body.data ?? body).description ?? '');
}

async function pdf(id: string): Promise<Probe> {
  const res = await w.api.bytes(`/api/pm/requirement/${id}/export`, { format: 'pdf', lang: 'th' });
  expect(res.status).toBe(200);
  return probe(res.data);
}

/** the pictures of the document, the logo left out */
const pictures = (p: Probe) => p.placed.filter((x) => x.size !== '421x143');
const widths = (html: string) => [...html.matchAll(/<img[^>]*?\swidth="(\d+)"/g)].map((m) => Number(m[1]));

test.describe('upload', () => {
  test('a PNG picked in the editor is stored with its size and printed at that size', async () => {
    const { id, editor } = await open();
    await editor.addImage(pictureFile('png', 301, 151));
    await save(ui.page);
    const html = await stored(id);
    expect(html, 'the editor stored no picture').toContain('<img');
    expect(widths(html)).toEqual([301]);
    const p = await pdf(id);
    const d = pictures(p).find((x) => x.size === '301x151');
    expect(d, `picture missing from the PDF (${where(p)})`).toBeTruthy();
    expect(Math.abs(d!.w - 301)).toBeLessThanOrEqual(4);
    inside(d!, 'uploaded PNG');
  });

  for (const format of ['jpg', 'gif'] as const) {
    test(`a ${format.toUpperCase()} picked in the editor is printed`, async () => {
      const { id, editor } = await open();
      await editor.addImage(pictureFile(format, 311, 121));
      await save(ui.page);
      const html = await stored(id);
      expect(html, 'the editor stored no picture').toContain('<img');
      const p = await pdf(id);
      const d = pictures(p).find((x) => x.size === '311x121');
      expect(d, `${format} picture missing from the PDF; the editor stored ${html.match(/data:image\/[a-z+]+/)?.[0]} (${where(p)})`).toBeTruthy();
      inside(d!, `uploaded ${format}`);
    });
  }

  // The editor re-encodes every picture on a canvas in the file's own type; BMP cannot be encoded there, so nothing is inserted.
  test('a BMP is not accepted by the editor (nothing is inserted, nothing breaks)', async () => {
    const { id, editor } = await open();
    const chooser = ui.page.waitForEvent('filechooser');
    await ui.page.getByRole('button', { name: /Add Image/ }).first().click();
    await (await chooser).setFiles(pictureFile('bmp', 311, 121));
    await ui.page.waitForTimeout(3000);
    expect(await editor.area.locator('img').count(), 'the editor inserted a BMP').toBe(0);
    expect(await stored(id)).not.toContain('<img');
  });

  // Chromium encodes WebP and the editor keeps the file's own type; the backend decodes WebP and prints it as PNG.
  test('a WebP picked in the editor is printed', async () => {
    const { id, editor } = await open();
    await editor.addImage(await webpFile(ui.page, 321, 131));
    await save(ui.page);
    const html = await stored(id);
    expect(html).toContain('data:image/webp');
    const p = await pdf(id);
    expect(pictures(p).find((x) => x.size === '321x131'), `WebP picture missing from the PDF (${where(p)})`).toBeTruthy();
  });

  test('a picture far bigger than the editor limit is shrunk by the editor and still fits the page', async () => {
    const { id, editor } = await open();
    await editor.addImage(pictureFile('png', 3000, 2000));
    const w0 = await editor.width();
    expect(w0, 'the editor should shrink big pictures (max 1920 wide)').toBeLessThanOrEqual(1920);
    await save(ui.page);
    const p = await pdf(id);
    const d = pictures(p)[0];
    expect(d, `picture missing from the PDF (${where(p)})`).toBeTruthy();
    inside(d, 'big upload');
    expect(Math.abs(d.w / d.h - 3000 / 2000)).toBeLessThan(0.05);
  });
});

test.describe('size buttons and dragging', () => {
  for (const label of ['Small', 'Medium', 'Large', 'Original'] as const) {
    test(`"${label}": the printed width follows the width the editor stored`, async () => {
      const { id, editor } = await open();
      await editor.addImage(pictureFile('png', 801, 401));
      await editor.size(label);
      const editorWidth = await editor.width();
      await save(ui.page);
      const html = await stored(id);
      const [stored0] = widths(html);
      expect(stored0, `the editor did not store a width (${html.slice(0, 200)})`).toBe(editorWidth);
      const p = await pdf(id);
      const d = pictures(p).find((x) => x.size === '801x401');
      expect(d, `picture missing from the PDF (${where(p)})`).toBeTruthy();
      expect(Math.abs(d!.w - Math.min(stored0, 513)), `${label}: editor width ${stored0}, printed ${d!.w}`).toBeLessThanOrEqual(4);
      expect(Math.abs(d!.w / d!.h - 801 / 401)).toBeLessThan(0.05);
      inside(d!, label);
    });
  }

  test('dragging the right handle makes the picture narrower in the editor and in the PDF', async () => {
    const { id, editor } = await open();
    await editor.addImage(pictureFile('png', 401, 201));
    const before = await editor.width();
    await editor.dragEast(-150);
    const after = await editor.width();
    expect(after, 'the drag did not change the width').toBeLessThan(before);
    await save(ui.page);
    const [storedWidth] = widths(await stored(id));
    expect(storedWidth).toBe(after);
    const p = await pdf(id);
    const d = pictures(p).find((x) => x.size === '401x201');
    expect(d, `picture missing from the PDF (${where(p)})`).toBeTruthy();
    expect(Math.abs(d!.w - after)).toBeLessThanOrEqual(4);
    expect(Math.abs(d!.w / d!.h - 401 / 201)).toBeLessThan(0.05);
  });
});

test.describe('table', () => {
  test('a table typed in the editor is printed with every cell', async () => {
    const { id, editor } = await open();
    const t = uid();
    await editor.insertTable();
    await editor.fillCell(0, 0, `HdrA${t}`);
    await editor.fillCell(0, 1, `HdrB${t}`);
    await editor.fillCell(1, 0, `CellA${t}`);
    await editor.fillCell(1, 1, `CellB${t}`);
    await editor.fillCell(2, 2, `Last${t}`);
    await save(ui.page);
    expect(await stored(id)).toContain('<table');
    const p = await pdf(id);
    for (const cell of ['HdrA', 'HdrB', 'CellA', 'CellB', 'Last']) {
      expect.soft(hasText(p.text, `${cell}${t}`), `table cell ${cell}${t} is missing from the PDF`).toBeTruthy();
    }
  });

  test('text, a picture and a table in one description keep their order', async () => {
    const { id, editor } = await open();
    const t = uid();
    await editor.type(` Before${t}`);
    await editor.addImage(pictureFile('png', 331, 141));
    await editor.insertTable();
    await editor.fillCell(0, 0, `Head${t}`);
    await editor.fillCell(1, 0, `Body${t}`);
    await save(ui.page);
    const p = await pdf(id);
    expect(hasText(p.text, `Before${t}`)).toBeTruthy();
    expect(hasText(p.text, `Head${t}`)).toBeTruthy();
    expect(hasText(p.text, `Body${t}`)).toBeTruthy();
    expect(pictures(p).some((x) => x.size === '331x141'), `picture missing (${where(p)})`).toBeTruthy();
  });

  // The text grid cannot hold a picture inside a cell, so it is printed right after its row.
  test('a picture placed inside a table cell is printed (after its row)', async () => {
    const { id, editor } = await open();
    const t = uid();
    await editor.insertTable();
    await editor.fillCell(0, 0, `Cell${t}`);
    await editor.cell(1, 0).click();
    await editor.addImage(pictureFile('png', 341, 91));
    await save(ui.page);
    const html = await stored(id);
    expect(html, 'the picture did not end up inside a table cell').toMatch(/<t[dh][^>]*>(?:(?!<\/t[dh]>).)*<img/s);
    const p = await pdf(id);
    expect(pictures(p).some((x) => x.size === '341x91'), `picture inside the cell is missing from the PDF (${where(p)})`).toBeTruthy();
  });
});

test.describe('the export button of the page itself', () => {
  test('"PDF (Jasper)" prints the picture and the table that were just saved', async () => {
    const { id, editor } = await open();
    const t = uid();
    await editor.addImage(pictureFile('png', 351, 111));
    await editor.insertTable();
    await editor.fillCell(0, 0, `Btn${t}`);
    await save(ui.page);
    expect(await stored(id)).toContain('<img');
    // Save leaves the edit page: open the document again, as a user would, and press the page's own export button
    await ui.visit(`/feature/pm/requirement/${id}/edit`);
    await new RichEditor(ui.page, 0).ready();
    const p = probe(await exportFromPage(ui.page));
    expect(pictures(p).some((x) => x.size === '351x111'), `picture missing (${where(p)})`).toBeTruthy();
    expect(hasText(p.text, `Btn${t}`)).toBeTruthy();
  });
});
