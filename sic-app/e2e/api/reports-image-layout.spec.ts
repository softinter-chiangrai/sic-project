import { test, expect } from '@playwright/test';
import { World } from './world';
import { mock } from '../api';
import { PAGE, hasText, picture, probe, type Placed, type Probe } from './rich';
import { RICH_REPORTS } from './rich-docs';

// How pictures from the Tiptap editor are laid out in the exported PDF: the width set in the editor is honoured,
// left / centre / right alignment is kept, and a picture wider (or taller) than the page never leaves the margins.
// Positions come from the PDF itself (tools/PdfProbe.java): points, A4 = 595 x 842, content box x 40..555.
test.setTimeout(240_000);

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const TOL = 4; // pt: rounding of the resize and the box padding in the templates

/** The picture drawn from a source of `size` px. The renderer may embed the source as is or the resized copy, so both are accepted. */
function find(pdf: Probe, size: string, ...alt: string[]): Placed {
  const hit = pdf.placed.find((p) => [size, ...alt].includes(p.size));
  expect(hit, `picture ${size} not found on any page (drawn: ${pdf.placed.map((p) => `${p.size}@${p.x},${p.w}x${p.h}`).join(' ')})`).toBeTruthy();
  return hit!;
}
const near = (actual: number, expected: number, what: string, tol = TOL) =>
  expect.soft(Math.abs(actual - expected), `${what}: ${actual} is not within ${tol} of ${expected}`).toBeLessThanOrEqual(tol);
const inside = (p: Placed, what: string) => {
  expect.soft(p.x, `${what}: left edge ${p.x} is outside the margin`).toBeGreaterThanOrEqual(PAGE.left - 1);
  expect.soft(p.x + p.w, `${what}: right edge ${p.x + p.w} is outside the margin`).toBeLessThanOrEqual(PAGE.right + 1);
};

async function exportRequirement(description: string, lang = 'th') {
  const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Image layout', projectId: await w.project(), state: 4, isActive: true, description }, '/api/pm/requirement/{id}');
  const res = await w.api.bytes(`/api/pm/requirement/${id}/export`, { format: 'pdf', lang });
  expect(res.status).toBe(200);
  return probe(res.data);
}

test.describe('size', () => {
  test('a picture without a width is drawn at its own size; a width set in the editor is honoured and the ratio kept', async () => {
    const pdf = await exportRequirement(
      `<p>sizes</p>${picture(121, 41)}<p>x</p>${picture(402, 101, { width: 200 })}<p>y</p>${picture(300, 150, { width: 100 })}`,
    );
    const own = find(pdf, '121x41');
    near(own.w, 121, 'own width');
    near(own.h, 41, 'own height');
    const set = find(pdf, '402x101');
    near(set.w, 200, 'width set to 200');
    near(set.h, 50, 'height keeps the ratio (402x101 at 200 wide)');
    const small = find(pdf, '300x150', '100x50');
    near(small.w, 100, 'width set to 100');
    near(small.h, 50, 'height keeps the ratio (2:1 at 100 wide)');
  });

  test('a picture wider than the page is scaled down to the content width, with its ratio', async () => {
    const pdf = await exportRequirement(`<p>wide</p>${picture(1203, 301)}<p>x</p>${picture(601, 302, { width: 900 })}`);
    const wide = find(pdf, '1203x301', '513x128');
    expect.soft(wide.w, 'wide picture is wider than the page').toBeLessThanOrEqual(PAGE.width + 1);
    near(wide.w, 513, 'wide picture width');
    near(wide.h, Math.round((301 * 513) / 1203), 'wide picture height');
    inside(wide, 'wide picture');
    const big = find(pdf, '601x302', '513x258');
    near(big.w, 513, 'width="900" is capped at the content width');
    near(big.h, Math.round((302 * 513) / 601), 'height of the capped picture');
    inside(big, 'width=900 picture');
  });

  test('a picture taller than a page stays on the page (export works, nothing is cut off)', async () => {
    const pdf = await exportRequirement(`<p>tall</p>${picture(300, 1500)}<p>after tall picture</p>`);
    const tall = find(pdf, '300x1500');
    inside(tall, 'tall picture');
    expect.soft(tall.h, `tall picture height ${tall.h} is taller than the printable page (${PAGE.top - PAGE.bottom})`).toBeLessThanOrEqual(PAGE.top - PAGE.bottom + 1);
    expect.soft(tall.y, `tall picture bottom edge ${tall.y} is below the page`).toBeGreaterThanOrEqual(0);
  });
});

test.describe('alignment', () => {
  // Tiptap stores the alignment on the image either as style="text-align: …" or as data-align
  for (const form of ['style', 'data'] as const) {
    test(`left / centre / right are kept (${form} form)`, async () => {
      const base = form === 'style' ? 410 : 440;
      const pdf = await exportRequirement(
        `<p>align</p>${picture(base + 1, 101, { width: 200, align: 'left', form })}` +
          `${picture(base + 11, 102, { width: 200, align: 'center', form })}` +
          `${picture(base + 21, 103, { width: 200, align: 'right', form })}`,
      );
      const left = find(pdf, `${base + 1}x101`);
      const centre = find(pdf, `${base + 11}x102`);
      const right = find(pdf, `${base + 21}x103`);
      near(left.x, PAGE.left, 'left picture starts at the left margin');
      near(centre.x + centre.w / 2, (PAGE.left + PAGE.right) / 2, 'centre picture is centred on the page');
      near(right.x + right.w, PAGE.right, 'right picture ends at the right margin');
    });
  }
});

test.describe('every report keeps pictures inside the margins', () => {
  // each rich field of each report gets: a picture far wider than the page, and a right-aligned 200pt picture
  for (const report of RICH_REPORTS) {
    test(report.name, async () => {
      const sizes = report.fields.map((f, i) => ({ f, wide: `${1250 + i * 7}x${310 + i}`, aligned: `${430 + i * 7}x${105 + i}` }));
      const html = Object.fromEntries(
        sizes.map(({ f, wide, aligned }) => {
          const [ww, wh] = wide.split('x').map(Number);
          const [aw, ah] = aligned.split('x').map(Number);
          return [f, `<p>layout</p>${picture(ww, wh)}${picture(aw, ah, { width: 200, align: 'right' })}`];
        }),
      );
      const doc = await report.create(w, html);
      const res = await w.api.bytes(doc.path, { lang: 'th', ...doc.params });
      expect(res.status, `${report.name} export -> ${res.status}`).toBe(200);
      const pdf = probe(res.data);
      for (const { f, wide, aligned } of sizes) {
        const [ww, wh] = wide.split('x').map(Number);
        const wideDrawn = pdf.placed.find((p) => p.size === wide);
        expect.soft(wideDrawn, `${report.name}.${f}: wide picture ${wide} missing`).toBeTruthy();
        if (wideDrawn) {
          inside(wideDrawn, `${report.name}.${f} wide picture`);
          near(wideDrawn.w / wideDrawn.h, ww / wh, `${report.name}.${f} wide picture keeps its ratio`, 0.05);
        }
        const right = pdf.placed.find((p) => p.size === aligned);
        expect.soft(right, `${report.name}.${f}: right-aligned picture ${aligned} missing`).toBeTruthy();
        if (right) {
          inside(right, `${report.name}.${f} right-aligned picture`);
          near(right.w, 200, `${report.name}.${f} right-aligned width`, 6);
          // lies in the right half of the page, hugging the right margin
          near(right.x + right.w, PAGE.right, `${report.name}.${f} right-aligned picture ends at the right margin`, 25);
        }
      }
    });
  }
});

test.describe('picture inside a table cell', () => {
  // The text grid of the templates cannot hold a picture inside a cell, so the picture is printed right after its row
  // (before this it was dropped). It must be there, inside the margins, and below the text of its row.
  test('is printed after its row, inside the margins', async () => {
    const t = Math.random().toString(36).slice(2, 6);
    const pdf = await exportRequirement(`<p>before</p><table><tbody><tr><td><p>CellWithPic${t}</p>${picture(77, 33)}</td><td><p>Other${t}</p></td></tr><tr><td><p>NextRow${t}</p></td><td><p>x</p></td></tr></tbody></table><p>after</p>`);
    const p = find(pdf, '77x33');
    inside(p, 'picture from a table cell');
    near(p.w, 77, 'width');
    expect(hasText(pdf.text, `CellWithPic${t}`) && hasText(pdf.text, `NextRow${t}`), 'cell text lost').toBeTruthy();
  });
});
