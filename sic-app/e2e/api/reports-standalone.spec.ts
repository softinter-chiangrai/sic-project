import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { World } from './world';
import { hasText, img, probe, drawn } from './rich';
import { RICH_REPORTS } from './rich-docs';

// The ReportHelper-free templates (src/main/resources/reports-standalone) are meant for report-service, which has no
// com.softinter.sicapi classes. Here every one is rendered the way report-service does it (tools/RenderStandalone.java: Jasper + JDBC
// + report-service's resources, NO sic classes) against documents made through the API, and the PDF must carry everything we put
// into the rich-text fields: text, a 9-column table (key column repeated in its 2 slices) and a real-size picture.
//
// Needs STANDALONE_CP = file holding the classpath (Jasper jars, PostgreSQL driver, Jackson, report-service/src/main/resources),
// e.g. from `mvnw dependency:build-classpath` in sic-spring/sic + ";<repo>/report-service/src/main/resources".
// The DB is E2E_DB (default sic_app_e2e) on localhost:54320 as user administrator, password PGPW. Needs migration V20261014090000.
// PDFs are kept in scratch/report-pdf/standalone-samples.
test.setTimeout(600_000);

const cpFile = process.env['STANDALONE_CP'];
test.skip(!cpFile, 'set STANDALONE_CP to a classpath file (see the header of this spec)');

const TEMPLATE: Record<string, { jrxml: string; idParam: string; extra?: (w: World) => Record<string, string> }> = {
  requirement: { jrxml: 'requirement_report', idParam: 'requirementId' },
  specification: { jrxml: 'specification_report', idParam: 'specificationId' },
  'change request': { jrxml: 'change_request_report', idParam: 'changeRequestId' },
  contract: { jrxml: 'contract_report', idParam: 'contractId' },
  delivery: { jrxml: 'delivery_report', idParam: 'deliveryId' },
  invoice: { jrxml: 'invoice_report', idParam: 'invoiceId' },
  'ma ticket': { jrxml: 'ticket_report', idParam: 'ticketId' },
  'user manual': { jrxml: 'user_manual_report', idParam: 'manualId' },
  'design review': { jrxml: 'design_review_report', idParam: 'designReviewId', extra: (w) => ({ businessId: String(w.api.businessId ?? '') }) },
  uat: { jrxml: 'uat_report', idParam: 'projectId' },
  'project report': { jrxml: 'project_report', idParam: 'projectId' },
};
// rich fields the template reads from a parameter instead of the database
const PARAM_FIELDS: Record<string, Record<string, string>> = {
  delivery: { deliverySummary: 'deliverySummary', releaseNote: 'releaseNote' },
  invoice: { remark: 'remark' },
};

const root = path.resolve('..'); // playwright runs from sic-app
const samples = path.join(root, 'scratch', 'report-pdf', 'standalone-samples');
const jrxmlHelperDir = path.join(root, 'sic-spring', 'sic', 'src', 'main', 'resources', 'reports');
const jrxmlDir = path.join(root, 'sic-spring', 'sic', 'src', 'main', 'resources', 'reports-standalone');

// COMPARE_CP (optional): classpath that also holds the sic classes; the ReportHelper templates (reports/) are rendered too and PNGs of both are written
// next to the PDFs, for looking at the two versions side by side.
function render(jrxml: string, params: Record<string, string>, helper = false): { pdf: Buffer; file: string } {
  const dir = helper ? path.join(samples, 'helper') : samples;
  fs.mkdirSync(path.join(dir, 'png'), { recursive: true });
  const out = path.join(dir, `${jrxml}.pdf`);
  const pfile = path.join(os.tmpdir(), `standalone-${process.pid}-${jrxml}.json`);
  fs.writeFileSync(pfile, JSON.stringify(params));
  try {
    execFileSync('java', ['-cp', fs.readFileSync(helper ? process.env['COMPARE_CP']! : cpFile!, 'utf8').trim(), path.resolve('e2e/tools/RenderStandalone.java'), path.join(helper ? jrxmlHelperDir : jrxmlDir, `${jrxml}.jrxml`), out, process.env['E2E_DB'] ?? 'sic_app_e2e', pfile, ...(process.env['COMPARE_CP'] ? [path.join(dir, 'png', jrxml)] : [])],
      { encoding: 'utf8', env: { ...process.env, PGPW: process.env['PGPW'] ?? 'Sic2026' }, maxBuffer: 64 * 1024 * 1024 });
  } finally {
    fs.rmSync(pfile, { force: true });
  }
  return { pdf: fs.readFileSync(out), file: out };
}

const table = (head: string[], rows: string[][]) =>
  `<table><tbody><tr>${head.map((c) => `<th><p>${c}</p></th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td><p>${c}</p></td>`).join('')}</tr>`).join('')}</tbody></table>`;

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

for (const report of RICH_REPORTS) {
  const spec = TEMPLATE[report.name];
  test(`${report.name}: standalone template prints text, a 9-column table and a picture`, async () => {
    const uid = Math.random().toString(36).slice(2, 6);
    const html: Record<string, string> = {};
    const checks: { field: string; size: string; wide: string; head: string[]; rows: string[][]; texts: string[] }[] = [];
    report.fields.forEach((field, i) => {
      const f = `f${i}`; // short, so a cell never wraps and a row cut by a page break cannot split its text
      const head = Array.from({ length: 9 }, (_, c) => `H${c}${f}${uid}`);
      const rows = Array.from({ length: 3 }, (_, r) => Array.from({ length: 9 }, (_, c) => `V${r}x${c}${f}${uid}`));
      const size = `${150 + i * 7}x${60 + i * 3}`;
      const [pw, ph] = size.split('x').map(Number);
      const texts = [`Intro${f}${uid}`, `ไทย${f}${uid}`, `Tail${f}${uid}`];
      // a second picture the user resized in the editor: its width attribute (140) must win over the file's own width, aligned to the centre
      const wide = `${300 + i}x100`;
      html[field] = `<p>${texts[0]} ${texts[1]}</p>${img('png', pw, ph)}${img('png', 300 + i, 100, 'width="140" data-align="center"')}${table(head, rows)}<p>${texts[2]}</p>`;
      checks.push({ field, size, wide, head, rows, texts });
    });
    const made = await report.create(w, html);
    const params: Record<string, string> = { lang: 'th', exportDate: '14/10/2026 10:00', businessName: 'SOFTINTER CO., LTD.', docVersion: 'v1.0', ...(spec.extra?.(w) ?? {}) };
    params[spec.idParam] = String(made.params?.['projectId'] ?? made.id);
    if (report.name === 'uat') params['testTypeFilter'] = 'ALL';
    for (const [param, field] of Object.entries(PARAM_FIELDS[report.name] ?? {})) params[param] = html[field];

    const { pdf: bytes, file } = render(spec.jrxml, params);
    const pdf = probe(bytes);
    if (process.env['COMPARE_CP']) {
      // exactly what the ReportHelper templates draw: same pictures, same sizes, same positions across the pages
      const sig = (p: typeof pdf) => p.placed.filter((x) => x.size !== '421x143').map((x) => `${x.page} ${x.size} ${x.x.toFixed(0)},${x.y.toFixed(0)} ${x.w.toFixed(0)}x${x.h.toFixed(0)}`);
      const viaHelper = probe(render(spec.jrxml, params, true).pdf);
      expect(sig(pdf), 'pictures differ from the ReportHelper version').toEqual(sig(viaHelper));
      expect(pdf.pageCount, 'page count differs from the ReportHelper version').toBe(viaHelper.pageCount);
    }
    console.log(`${report.name}: ${pdf.pageCount} pages -> ${file}`);

    for (const c of checks) {
      const lost = [...c.texts, ...c.head, ...c.rows.flat()].filter((t) => !hasText(pdf.text, t));
      expect(lost, `${c.field}: missing ${lost.slice(0, 6).join(', ')}`).toEqual([]);
      // 9 columns = key column + 2 slices: the key column is printed in both
      const key = (t: string) => pdf.text.replace(/\s+/g, '').split(t).length - 1;
      expect(key(c.head[0]), `${c.field}: key column repeated in each slice`).toBe(2);
      const p = drawn(pdf, c.size);
      expect(p, `${c.field}: picture ${c.size} not printed`).toBeTruthy();
      expect(Math.round(p!.w), `${c.field}: picture printed at real size`).toBe(Number(c.size.split('x')[0]));
      const q = drawn(pdf, c.wide);
      expect(q, `${c.field}: resized picture ${c.wide} not printed`).toBeTruthy();
      // +-1pt: Jasper rounds the drawn box (the helper version lands on the same numbers, compared above)
      expect(Math.abs(q!.w - 140), `${c.field}: width attribute 140`).toBeLessThanOrEqual(1.5);
      expect(Math.abs(q!.h - (100 * 140) / Number(c.wide.split('x')[0])), `${c.field}: height by ratio`).toBeLessThanOrEqual(1.5);
    }
  });
}
