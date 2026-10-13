import { test, expect } from '@playwright/test';
import { World } from './world';
import { mock } from '../api';
import { PAGE, hasText, img, probe, type ImageFormat, type Placed, type Probe } from './rich';
import { RICH_REPORTS } from './rich-docs';

// The pictures Tiptap really produces and the odd ones a paste can bring:
//  - dragging a handle in the editor stores BOTH width and height on <img> (ratio kept) and the alignment as style="text-align: …"
//  - several pictures in one paragraph, pictures with float / align attributes written by other editors
//  - file types: PNG (also with transparency), JPEG, GIF, BMP, WebP, SVG
// Positions are read from the PDF itself (tools/PdfProbe.java), in points, content box x 40..555.
test.setTimeout(240_000);

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const TOL = 4;
const near = (actual: number, expected: number, what: string, tol = TOL) =>
  expect.soft(Math.abs(actual - expected), `${what}: ${actual} is not within ${tol} of ${expected}`).toBeLessThanOrEqual(tol);
const inside = (p: Placed, what: string) => {
  expect.soft(p.x, `${what}: left edge ${p.x} is outside the margin`).toBeGreaterThanOrEqual(PAGE.left - 1);
  expect.soft(p.x + p.w, `${what}: right edge ${p.x + p.w} is outside the margin`).toBeLessThanOrEqual(PAGE.right + 1);
};
const drawn = (pdf: Probe, size: string) => pdf.placed.find((p) => p.size === size);
const where = (pdf: Probe) => pdf.placed.map((p) => `${p.size}@p${p.page}:${p.x},${p.y} ${p.w}x${p.h}`).join(' | ');

async function exportRequirement(description: string) {
  const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Image variants', projectId: await w.project(), state: 4, isActive: true, description }, '/api/pm/requirement/{id}');
  const res = await w.api.bytes(`/api/pm/requirement/${id}/export`, { format: 'pdf', lang: 'th' });
  expect(res.status).toBe(200);
  return probe(res.data);
}

test.describe('what the editor writes after a drag-resize', () => {
  test('width + height on the picture: the width is used, the ratio of the file is kept', async () => {
    // 404x101 dragged to 200 wide -> editor stores width="200" height="50"
    const pdf = await exportRequirement(`<p>drag</p>${img('png', 404, 101, 'width="200" height="50"')}`);
    const p = drawn(pdf, '404x101');
    expect(p, `picture missing (${where(pdf)})`).toBeTruthy();
    near(p!.w, 200, 'width from the editor');
    near(p!.h, 50, 'height follows the ratio');
    inside(p!, 'resized picture');
  });

  test('resized and aligned (style merged with text-align), for each alignment', async () => {
    const pdf = await exportRequirement(
      `<p>drag + align</p>${img('png', 406, 101, 'width="180" height="45" style="text-align: left"')}` +
        `${img('png', 416, 101, 'width="180" height="44" style="text-align: center"')}` +
        `${img('png', 426, 101, 'width="180" height="42" style="text-align: right"')}`,
    );
    const [l, c, r] = [drawn(pdf, '406x101'), drawn(pdf, '416x101'), drawn(pdf, '426x101')];
    expect(l && c && r, `a picture is missing (${where(pdf)})`).toBeTruthy();
    near(l!.x, PAGE.left, 'left');
    near(c!.x + c!.w / 2, (PAGE.left + PAGE.right) / 2, 'centre');
    near(r!.x + r!.w, PAGE.right, 'right');
    for (const p of [l!, c!, r!]) near(p.w, 180, 'width 180');
  });

  test('a picture dragged larger than the page is capped at the content width', async () => {
    const pdf = await exportRequirement(`<p>big drag</p>${img('png', 1000, 400, 'width="900" height="360"')}`);
    const p = drawn(pdf, '1000x400');
    expect(p, `picture missing (${where(pdf)})`).toBeTruthy();
    inside(p!, 'oversized drag');
    near(p!.w / p!.h, 1000 / 400, 'ratio', 0.05);
  });

  test('size written in style="width: …px" (not something the editor writes) still prints, inside the margins', async () => {
    const pdf = await exportRequirement(`<p>css size</p>${img('png', 440, 110, 'style="width: 200px; height: 50px"')}`);
    const p = drawn(pdf, '440x110');
    expect(p, `picture missing (${where(pdf)})`).toBeTruthy();
    inside(p!, 'css-sized picture');
  });
});

test.describe('several pictures and floating pictures', () => {
  test('pictures in one paragraph with text between them are all printed, in order, without overlapping', async () => {
    const pdf = await exportRequirement(`<p>First ${img('png', 111, 31)} between ${img('png', 112, 32)} then ${img('png', 113, 33)} end</p>`);
    const ps = ['111x31', '112x32', '113x33'].map((s) => drawn(pdf, s));
    expect(ps.every(Boolean), `a picture is missing (${where(pdf)})`).toBeTruthy();
    const ordered = [...ps].sort((a, b) => a!.page - b!.page || b!.y - a!.y);
    expect.soft(ordered.map((p) => p!.size), 'pictures are printed out of order').toEqual(['111x31', '112x32', '113x33']);
    for (let i = 1; i < ordered.length; i++) {
      const [up, down] = [ordered[i - 1]!, ordered[i]!];
      if (up.page === down.page) expect.soft(down.y + down.h, `pictures ${up.size} and ${down.size} overlap`).toBeLessThanOrEqual(up.y + 1);
    }
    expect(hasText(pdf.text, 'between')).toBeTruthy();
  });

  test('pictures back to back with no text between them are all printed', async () => {
    const pdf = await exportRequirement(`<p>${img('png', 121, 41)}${img('png', 122, 42)}${img('png', 123, 43)}</p>`);
    for (const s of ['121x41', '122x42', '123x43']) expect(drawn(pdf, s), `${s} missing (${where(pdf)})`).toBeTruthy();
  });

  test('pictures written with float / legacy align attributes are printed inside the margins (text wrapping is not supported)', async () => {
    const pdf = await exportRequirement(
      `<p>float</p>${img('png', 131, 51, 'style="float: left"')}<p>text next to a left float</p>` +
        `${img('png', 132, 52, 'style="float: right; margin: 0 0 8px 8px"')}<p>text next to a right float</p>${img('png', 133, 53, 'align="right"')}`,
    );
    for (const s of ['131x51', '132x52', '133x53']) {
      const p = drawn(pdf, s);
      expect(p, `${s} missing (${where(pdf)})`).toBeTruthy();
      inside(p!, `float picture ${s}`);
    }
    expect(hasText(pdf.text, 'textnexttoaleftfloat')).toBeTruthy();
  });
});

// Each field of every report gets one picture per format. JPEG / GIF / BMP / PNG must print; WebP / SVG are checked apart.
const PRINTED: { format: ImageFormat; w: number; h: number }[] = [
  { format: 'png-alpha', w: 301, h: 61 },
  { format: 'jpg', w: 302, h: 62 },
  { format: 'gif', w: 303, h: 63 },
  { format: 'bmp', w: 304, h: 64 },
];

test.describe('file types in every report', () => {
  for (const report of RICH_REPORTS) {
    test(`${report.name}: PNG with transparency, JPEG, GIF and BMP are printed at their size`, async () => {
      test.setTimeout(300_000);
      const html = Object.fromEntries(
        report.fields.map((f, i) => [f, `<p>formats</p>${PRINTED.map((p) => img(p.format, p.w + i * 10, p.h + i)).join('')}`]),
      );
      const doc = await report.create(w, html);
      const res = await w.api.bytes(doc.path, { lang: 'th', ...doc.params });
      expect(res.status, `${report.name} export -> ${res.status}`).toBe(200);
      const pdf = probe(res.data);
      report.fields.forEach((f, i) => {
        for (const p of PRINTED) {
          const size = `${p.w + i * 10}x${p.h + i}`;
          const d = drawn(pdf, size);
          expect.soft(d, `${report.name}.${f}: ${p.format} picture ${size} is not in the PDF (${where(pdf)})`).toBeTruthy();
          if (d) {
            inside(d, `${report.name}.${f} ${p.format}`);
            near(d.w, p.w + i * 10, `${report.name}.${f} ${p.format} width`, 6);
          }
        }
      });
    });
  }
});

test.describe('WebP and SVG', () => {
  // JasperReports/ImageIO in the backend cannot read these; the export must still work and keep the rest of the content.
  for (const format of ['webp', 'svg'] as const) {
    test(`${format}: the export still succeeds and the text around the picture is kept`, async () => {
      const pdf = await exportRequirement(`<p>before ${format}</p>${img(format, 140, 70)}<p>after ${format}</p>`);
      expect(hasText(pdf.text, `before${format}`)).toBeTruthy();
      expect(hasText(pdf.text, `after${format}`)).toBeTruthy();
    });
  }

  // Known gap: the picture is dropped without any message. Marked test.fail(): documents the gap and flags itself once it is fixed
  // (decoding WebP needs an ImageIO plugin in the backend; SVG needs rasterising).
  for (const format of ['webp', 'svg'] as const) {
    test.fail(`${format}: the picture itself is printed`, async () => {
      const pdf = await exportRequirement(`<p>${format} picture</p>${img(format, 140, 70)}`);
      const size = format === 'webp' ? '1x1' : '140x70'; // the sample WebP is 1x1
      expect(drawn(pdf, size), `${format} picture is missing from the PDF (${where(pdf)})`).toBeTruthy();
    });
  }
});
