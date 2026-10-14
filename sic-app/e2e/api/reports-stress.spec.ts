import { test, expect } from '@playwright/test';
import { World } from './world';
import { mock } from '../api';
import { hasText, img, probe, type Probe } from './rich';
import { RICH_REPORTS } from './rich-docs';

// Reports with a lot in them: long tables that run over several pages, long documents, long Thai text, awkward characters.
// Nothing may be cut off or lost: every token we put in must be in the PDF, and the export must not fail or take forever.
// (Positions are checked only for pictures; for text we check presence, which is what a cut-off or clipped line would lose.)
test.setTimeout(300_000);

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const uid = () => Math.random().toString(36).slice(2, 7);

async function requirement(description: string) {
  const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Stress', projectId: await w.project(), state: 4, isActive: true, description }, '/api/pm/requirement/{id}');
  const t0 = Date.now();
  const res = await w.api.bytes(`/api/pm/requirement/${id}/export`, { format: 'pdf', lang: 'th' });
  expect(res.status, 'export status').toBe(200);
  return { pdf: probe(res.data), ms: Date.now() - t0 };
}
const table = (rows: string[][], head?: string[]) =>
  `<table><tbody>${head ? `<tr>${head.map((c) => `<th><p>${c}</p></th>`).join('')}</tr>` : ''}${rows.map((r) => `<tr>${r.map((c) => `<td><p>${c}</p></td>`).join('')}</tr>`).join('')}</tbody></table>`;
const missing = (pdf: Probe, tokens: string[]) => tokens.filter((t) => !hasText(pdf.text, t));

test.describe('tables', () => {
  test('a table of 150 rows runs over several pages and keeps every row, first to last', async () => {
    const t = uid();
    const rows = Array.from({ length: 150 }, (_, i) => [`R${i}a${t}`, `R${i}b${t}`, `R${i}c${t}`]);
    const { pdf } = await requirement(`<p>start${t}</p>${table(rows, [`H1${t}`, `H2${t}`, `H3${t}`])}<p>end${t}</p>`);
    expect(pdf.pageCount, 'a 150-row table should need more than one page').toBeGreaterThan(2);
    const lost = missing(pdf, [`start${t}`, `end${t}`, `H1${t}`, ...rows.flat()]);
    expect(lost, `${lost.length} cells are missing, e.g. ${lost.slice(0, 5).join(', ')}`).toEqual([]);
  });

  test('cells with a lot of text wrap and are printed whole', async () => {
    const t = uid();
    const long = (c: string) => `${c}${t} ${'ข้อความยาวมากในเซลล์ตาราง '.repeat(30)} จบ${c}${t}`;
    const { pdf } = await requirement(table([[long('A'), long('B'), long('C')], [long('D'), long('E'), long('F')]]));
    const lost = missing(pdf, ['A', 'B', 'C', 'D', 'E', 'F'].flatMap((c) => [`${c}${t}`, `จบ${c}${t}`]));
    expect(lost, `cell text cut off: ${lost.join(', ')}`).toEqual([]);
  });

  test('a table with more than 6 columns keeps every column', async () => {
    const t = uid();
    const rows = Array.from({ length: 4 }, (_, r) => Array.from({ length: 9 }, (_, c) => `C${r}x${c}${t}`));
    const { pdf } = await requirement(table(rows));
    const lost = missing(pdf, rows.flat());
    expect(lost, `columns beyond the 6th are lost: ${lost.slice(0, 6).join(', ')}`).toEqual([]);
  });

  test('empty cells, merged-looking rows and a one-column table do not break the page', async () => {
    const t = uid();
    const { pdf } = await requirement(`${table([['', '', ''], [`only${t}`, '', ''], ['', `mid${t}`, '']])}${table([[`single${t}`], [`single2${t}`]])}<p>after${t}</p>`);
    expect(missing(pdf, [`only${t}`, `mid${t}`, `single${t}`, `single2${t}`, `after${t}`])).toEqual([]);
  });
});

test.describe('long documents', () => {
  test('300 paragraphs (dozens of pages) are all printed, quickly enough', async () => {
    const t = uid();
    const paras = Array.from({ length: 300 }, (_, i) => `<p>บรรทัดที่ ${i} ${t} ${'เนื้อหาเอกสารยาว '.repeat(8)}</p>`);
    const { pdf, ms } = await requirement(paras.join(''));
    expect(pdf.pageCount, 'a 300-paragraph document should be many pages').toBeGreaterThan(15);
    expect(missing(pdf, [`บรรทัดที่0${t}`, `บรรทัดที่150${t}`, `บรรทัดที่299${t}`])).toEqual([]);
    expect(ms, `export took ${ms} ms`).toBeLessThan(90_000);
  });

  test('text, pictures and tables mixed over many pages keep every picture', async () => {
    const t = uid();
    const parts: string[] = [];
    const sizes: string[] = [];
    for (let i = 0; i < 12; i++) {
      const w0 = 200 + i * 7;
      const h0 = 90 + i;
      sizes.push(`${w0}x${h0}`);
      parts.push(`<p>section ${i} ${t}</p>${img('png', w0, h0)}${table([[`c${i}a${t}`, `c${i}b${t}`]])}${'<p>filler filler filler filler filler filler</p>'.repeat(25)}`);
    }
    const { pdf } = await requirement(parts.join(''));
    expect(pdf.pageCount).toBeGreaterThan(5);
    const drawn = new Set(pdf.placed.map((p) => p.size));
    const lostPictures = sizes.filter((s) => !drawn.has(s));
    expect(lostPictures, `pictures missing from the PDF: ${lostPictures.join(', ')}`).toEqual([]);
    for (const p of pdf.placed.filter((x) => sizes.includes(x.size))) {
      expect.soft(p.x + p.w, `picture ${p.size} on page ${p.page} leaves the right margin`).toBeLessThanOrEqual(556);
      expect.soft(p.y, `picture ${p.size} on page ${p.page} is below the page`).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('long and odd text', () => {
  test('one Thai paragraph of ~20,000 characters without line breaks is printed to the end', async () => {
    const t = uid();
    const body = 'การพัฒนาระบบสารสนเทศเพื่อการบริหารจัดการโครงการอย่างมีประสิทธิภาพ'.repeat(300);
    const { pdf } = await requirement(`<p>เริ่ม${t} ${body} สิ้นสุด${t}</p>`);
    expect(missing(pdf, [`เริ่ม${t}`, `สิ้นสุด${t}`])).toEqual([]);
    expect(pdf.pageCount).toBeGreaterThan(3);
  });

  test('a 900-character string with no spaces or break points wraps instead of being clipped', async () => {
    const t = uid();
    const word = `LONG${t}${'x'.repeat(900)}END${t}`;
    const { pdf } = await requirement(`<p>${word}</p><p>after${t}</p>`);
    expect(missing(pdf, [`LONG${t}`, `END${t}`, `after${t}`]), 'a long unbroken string lost its tail').toEqual([]);
  });

  test('Thai tone marks and vowels above/below the line, numbers and mixed Thai-English stay intact', async () => {
    const t = uid();
    const samples = ['ก็ได้ ผู้ใหญ่ ปู่ ผู้ชาย เก๋ ไม้เอก ไม้โท', 'น้ำ ก๊วน เกี่ยว อื่น ๆ ฯลฯ', `Project ${t} ระยะที่ 2 งบ 1,250,000.50 บาท`];
    const { pdf } = await requirement(samples.map((s) => `<p>${s}</p>`).join(''));
    expect(missing(pdf, samples), 'some Thai text changed in the PDF').toEqual([]);
  });

  test('characters that look like markup (< > & quotes, entities, tags typed as text) are printed as typed', async () => {
    const t = uid();
    const cases = [`a &lt; b &amp;&amp; c &gt; d ${t}`, `quote &quot;double&quot; and &#39;single&#39; ${t}`, `&lt;style isBold=&quot;true&quot;&gt;not markup${t}&lt;/style&gt;`, `1 &lt; 2 &gt; 0 ${t}`];
    const { pdf } = await requirement(cases.map((s) => `<p>${s}</p>`).join(''));
    const expected = [`a<b&&c>d${t}`, `quote"double"and'single'${t}`, `<styleisBold="true">notmarkup${t}</style>`, `1<2>0${t}`];
    const lost = expected.filter((e) => !hasText(pdf.text, e));
    expect(lost, `characters were changed or dropped: ${lost.join(' | ')}`).toEqual([]);
  });

  test('non-breaking spaces, tabs, soft line breaks and empty paragraphs do not swallow text', async () => {
    const t = uid();
    const { pdf } = await requirement(`<p>one&nbsp;two${t}</p><p></p><p>line1${t}<br>line2${t}</p><p>&nbsp;</p><p>last${t}</p>`);
    expect(missing(pdf, [`onetwo${t}`, `line1${t}`, `line2${t}`, `last${t}`])).toEqual([]);
  });

  test('emoji and symbols: the text around them survives and the export works', async () => {
    const t = uid();
    const { pdf } = await requirement(`<p>before😀${t} ✅ ❌ ⚠️ ★ → © ™ after${t}</p><p>next${t} 🚀🎉 end${t}</p>`);
    // the report font may have no emoji glyph; what matters is that nothing around them is lost or breaks the line
    expect(missing(pdf, [`before`, `after${t}`, `next${t}`, `end${t}`])).toEqual([]);
  });

  test('right-to-left and other scripts do not break the export', async () => {
    const t = uid();
    const { pdf } = await requirement(`<p>start${t} مرحبا بالعالم שלום עולם 你好世界 こんにちは 안녕하세요 end${t}</p>`);
    expect(missing(pdf, [`start${t}`, `end${t}`])).toEqual([]);
  });
});

// The same awkward content in every report that prints rich text: no report may lose or break on it.
test.describe('every report with long and awkward content', () => {
  for (const report of RICH_REPORTS) {
    test(report.name, async () => {
      const t = uid();
      const rows = Array.from({ length: 40 }, (_, i) => [`${report.name}R${i}a${t}`, `R${i}b${t}`]);
      const html = Object.fromEntries(
        report.fields.map((f, i) => [
          f,
          `<p>top${f}${t} &lt;b&gt; &amp; "quoted" ก็ได้ ผู้ใหญ่ 😀</p>${table(rows.map((r) => r.map((c) => `${f}${i}${c}`)))}` +
            `<p>${'ข้อความไทยยาว '.repeat(200)} จบ${f}${t}</p>`,
        ]),
      );
      const doc = await report.create(w, html);
      const t0 = Date.now();
      const res = await w.api.bytes(doc.path, { lang: 'th', ...doc.params });
      expect(res.status, `${report.name} export`).toBe(200);
      const pdf = probe(res.data);
      for (const [i, f] of report.fields.entries()) {
        const lost = missing(pdf, [`top${f}${t}`, `จบ${f}${t}`, `${f}${i}${rows[0][0]}`, `${f}${i}${rows[39][1]}`]);
        expect.soft(lost, `${report.name}.${f}: lost ${lost.join(', ')}`).toEqual([]);
      }
      expect(Date.now() - t0, `${report.name}: export too slow`).toBeLessThan(90_000);
    });
  }
});
