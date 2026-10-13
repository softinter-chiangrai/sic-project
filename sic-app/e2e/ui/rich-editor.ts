import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { expect, type Locator, type Page } from '@playwright/test';
import { png } from '../api/rich';

/** Driving the real Tiptap editor (angular-tiptap-editor) the way a user does: toolbar buttons, file chooser, mouse drag. */
export class RichEditor {
  constructor(readonly page: Page, readonly index = 0) {}

  /** the editable area of the n-th rich-text field on the page */
  get area(): Locator {
    return this.page.locator('.ProseMirror').nth(this.index);
  }
  /** the toolbar buttons that belong to this editor (each editor has its own toolbar) */
  private tool(name: RegExp): Locator {
    return this.page.getByRole('button', { name }).nth(this.index);
  }

  async ready() {
    await this.area.waitFor({ timeout: 30_000 });
    await this.area.scrollIntoViewIfNeeded();
  }

  async type(text: string) {
    await this.area.click();
    await this.page.keyboard.type(text);
  }

  /** "Add Image" -> the editor opens a file chooser; we answer it with the file, like picking it in the dialog. */
  async addImage(file: string) {
    const before = await this.area.locator('img').count();
    const chooser = this.page.waitForEvent('filechooser');
    await this.tool(/Add Image/).click();
    await (await chooser).setFiles(file);
    await expect(this.area.locator('img')).toHaveCount(before + 1, { timeout: 30_000 });
  }

  /** the n-th picture in this editor */
  image(n = 0): Locator {
    return this.area.locator('img').nth(n);
  }

  /** click a picture so its bubble menu and resize handles show */
  async select(n = 0) {
    await this.image(n).click();
    await expect(this.area.locator('.resize-handle').first()).toBeAttached({ timeout: 10_000 });
  }

  /** bubble-menu size buttons of a selected picture: Small | Medium | Large | Original */
  async size(label: 'Small' | 'Medium' | 'Large' | 'Original', n = 0) {
    await this.select(n);
    await this.page.getByRole('button', { name: new RegExp(`^${label}$`) }).first().click();
  }

  /** drag the east handle of a picture by dx pixels (negative = narrower) */
  async dragEast(dx: number, n = 0) {
    await this.select(n);
    const handle = this.area.locator('.resize-handle-e').nth(n);
    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + dx / 2, y, { steps: 6 });
    await this.page.mouse.move(x + dx, y, { steps: 6 });
    await this.page.mouse.up();
  }

  /** "Insert Table" makes a 3x3 table with a header row; the cursor lands in its first cell */
  async insertTable() {
    await this.area.click();
    await this.page.keyboard.press('Control+End'); // the click may have selected a picture: never replace it, add the table after it
    await this.tool(/Insert Table/).click();
    await expect(this.area.locator('table')).toHaveCount(1, { timeout: 10_000 });
  }

  cell(row: number, col: number): Locator {
    return this.area.locator('table tr').nth(row).locator('th, td').nth(col);
  }

  /** type into a table cell */
  async fillCell(row: number, col: number, text: string) {
    await this.cell(row, col).click();
    await this.page.keyboard.type(text);
  }

  /** width attribute of the n-th picture, as the editor holds it */
  async width(n = 0): Promise<number> {
    return Number(await this.image(n).getAttribute('width'));
  }
}

/** click Save and wait until the page has sent the document (any 2xx POST to the API that is not a version-history call) */
export async function save(page: Page) {
  const button = page.locator('button').filter({ hasText: /^\s*Save\b/ }).first();
  await button.waitFor({ state: 'attached', timeout: 15_000 });
  if (await button.isDisabled()) {
    // say which form fields refuse the Save instead of timing out
    const invalid = await page.locator('.ng-invalid:not(form):not(.ng-pristine), .ng-invalid:not(form)').evaluateAll((els) =>
      els.slice(0, 12).map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute('formcontrolname') ?? e.getAttribute('name') ?? e.getAttribute('ng-reflect-name') ?? e.className.toString().slice(0, 30)}]`));
    throw new Error(`Save is disabled; invalid form fields: ${invalid.join(', ') || 'none found'}`);
  }
  const saved = page.waitForResponse((r) => ['POST', 'PUT', 'PATCH'].includes(r.request().method()) && r.status() < 300 && /\/api\/pm\/(?!document-versions|approvals)/.test(r.url()), { timeout: 30_000 });
  await page.locator('button').filter({ hasText: /^\s*Save\b/ }).first().click();
  await saved;
}

/** Picture files for the file chooser. jpg / gif / bmp come from tools/ImgGen.java, png from the hand-made encoder. */
export function pictureFile(format: 'png' | 'jpg' | 'gif' | 'bmp', w: number, h: number): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-pic-'));
  const file = path.join(dir, `pic-${w}x${h}.${format}`);
  if (format === 'png') fs.writeFileSync(file, png(w, h, [20, 120, 60]));
  else execFileSync('java', [path.resolve('e2e/tools/ImgGen.java'), format, String(w), String(h), file]);
  return file;
}

/** A WebP file made by the browser itself (Chromium can encode WebP from a canvas; Node cannot). */
export async function webpFile(page: Page, w: number, h: number): Promise<string> {
  const b64 = await page.evaluate(async ({ w, h }) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    g.fillStyle = '#2a7fd0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f0c040';
    g.fillRect(w / 4, h / 4, w / 2, h / 2);
    const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), 'image/webp', 0.9));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = '';
    for (const b of buf) s += String.fromCharCode(b);
    return btoa(s);
  }, { w, h });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-pic-'));
  const file = path.join(dir, `pic-${w}x${h}.webp`);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  return file;
}

/** the PDF the page's own "PDF (Jasper)" button exports: returns the file the backend answered with */
export async function exportFromPage(page: Page): Promise<Buffer> {
  const response = page.waitForResponse((r) => /\/export/.test(r.url()) && r.request().method() === 'GET', { timeout: 90_000 });
  await page.locator('button').filter({ hasText: /PDF \(Jasper\)/ }).first().click();
  const r = await response;
  expect(r.status(), `export -> ${r.status()}`).toBe(200);
  return await r.body();
}
