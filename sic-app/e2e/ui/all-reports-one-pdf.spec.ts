import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { World } from '../api/world';
import { Ui } from '../ui';
import { fillAll, submit, selectProject, spaNavigate } from './forms';

// Every document that has a Jasper PDF is made the way a user makes it: the form is opened in the browser, EVERY control is filled, Save is pressed.
// Each saved document is then exported once (Thai): one PDF per document in scratch/report-pdf/all-documents/
// Run: E2E_DB=sic_app_e2e npx playwright test e2e/ui/all-reports-one-pdf.spec.ts --project=ui --retries=0
// A document whose form cannot be saved or exported does not stop the others: it is listed in the summary at the end.
test.setTimeout(1_500_000);

type Mod = {
  name: string; newPath: string; listApi: string; page1?: boolean; spa?: boolean; listPath?: string; noProject?: boolean;
  values?: Record<string, string>; needs?: (w: World) => Promise<unknown>; prepare?: (p: Page) => Promise<void>;
  exportUrl: (id: string, w: World) => [string, Record<string, string>?];
};
const P = '/feature/pm';
const mods: Mod[] = [
  { name: 'contract', newPath: `${P}/contract/new`, listApi: '/api/pm/contracts', exportUrl: (id) => [`/api/pm/contracts/${id}/export-pdf`] },
  { name: 'requirement', newPath: `${P}/requirement/new`, listApi: '/api/pm/requirement', exportUrl: (id) => [`/api/pm/requirement/${id}/export`, { format: 'pdf' }] },
  { name: 'specification', newPath: `${P}/specification/new`, listApi: '/api/pm/specifications', exportUrl: (id) => [`/api/pm/specifications/${id}/export-pdf`] },
  { name: 'design-review', newPath: `${P}/design-review/new`, listApi: '/api/pm/design-reviews', exportUrl: (id) => [`/api/pm/design-reviews/${id}/export-pdf`] },
  { name: 'change-request', newPath: `${P}/change-request/new`, listApi: '/api/pm/change-requests', values: { targetType: 'Specification', assigneeIds: '' }, needs: (w) => w.approvedSpec(), exportUrl: (id) => [`/api/pm/change-requests/${id}/export-pdf`] },
  { name: 'delivery', newPath: `${P}/delivery/new`, listApi: '/api/pm/delivery/paging', page1: true, exportUrl: (id) => [`/api/pm/delivery/${id}/export-pdf`] },
  { name: 'user-manual', newPath: `${P}/manual/new`, listApi: '/api/pm/manual/paging', page1: true, exportUrl: (id) => [`/api/pm/manual/${id}/export-pdf`] },
  {
    name: 'invoice', newPath: `${P}/invoice/new`, listPath: `${P}/invoice`, spa: true, listApi: '/api/pm/invoices/paging', page1: true, values: { contractId: '' },
    prepare: async (page) => {
      await page.getByRole('button', { name: /add item/i }).click();
      await page.getByPlaceholder('e.g. System development phase 1').fill('ค่าพัฒนาระบบ งวดที่ 1');
      await page.getByPlaceholder('Additional details').locator('xpath=following::input[1]').fill('150000');
    },
    exportUrl: (id) => [`/api/pm/invoices/${id}/export-pdf`],
  },
  { name: 'ma-ticket', newPath: `${P}/ma-ticket/new`, listApi: '/api/pm/ma-tickets/paging', page1: true, exportUrl: (id) => [`/api/pm/ma-tickets/${id}/export-pdf`] },
  { name: 'test-case (UAT report)', newPath: `${P}/test-case/new`, listApi: '/api/pm/test-cases/paging', page1: true, needs: (w) => w.testScenario(), exportUrl: (_id, w) => ['/api/pm/test-cases/export-uat-report', { projectId: '', testType: 'ALL' }] },
];

const rowsOf = (b: any): any[] => {
  if (Array.isArray(b)) return b;
  for (const v of Object.values(b ?? {})) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') { const r = rowsOf(v); if (r.length) return r; }
  }
  return [];
};

test('every document: filled in the browser, one PDF each', async ({ browser }) => {
  const w = await World.create();
  const ui = await Ui.open(browser);
  const dir = path.resolve('..', 'scratch', 'report-pdf', 'all-documents');
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f), { force: true }); // files only: a shell standing in the folder locks it on Windows
  const parts: { name: string; file: string }[] = [];
  const failed: string[] = [];
  const created: string[] = [];
  try {
    const customerId = await w.make('/api/pm/customers', {
      customerCode: `C-${Date.now().toString(36)}`, companyNameEn: 'Siam Retail Commerce Holdings Co., Ltd.', companyNameLocal: 'บริษัท สยาม รีเทล คอมเมิร์ซ โฮลดิ้งส์ จำกัด',
      taxId: '0105553212412', branchCode: '00000', addressLocal: '63 อาคารแอทธินี ทาวเวอร์ ชั้น 22 ถนนวิทยุ ปทุมวัน กรุงเทพฯ 10330', phoneNumber: '02-897-4699',
    }, '/api/pm/customers/{id}');
    void customerId;

    const listOf = async (m: Mod) => {
      const r = await w.api.get(m.listApi, { businessId: w.api.businessId!, page: m.page1 ? 1 : 0, size: 200, pageNumber: 1, pageSize: 200 });
      return rowsOf(r.body);
    };
    const save = (name: string, data: Buffer) => { const file = path.join(dir, `${name.replace(/[^\w-]+/g, '_')}.pdf`); fs.writeFileSync(file, data); parts.push({ name, file }); };

    // 1. the project itself (exported last, printed first, so its statistics count everything below)
    await ui.visit(`${P}/project/new`);
    await ui.page.locator('[formcontrolname="projectName"]').first().waitFor({ timeout: 60_000 });
    await fillAll(ui.page, { projectName: w.projectName, budgetManday: '320', customerId: '' });
    expect(await submit(ui.page)).toBe('saved');
    const plist = rowsOf((await w.api.get('/api/pm/customer-projects', { page: 0, size: 200, pageNumber: 1, pageSize: 200 })).body);
    const project = plist.find((r) => r.projectName === w.projectName);
    expect(project, 'project saved in the browser was not found').toBeTruthy();
    w.once('project', async () => project.id);
    const projectId: string = project.id;

    // 2. every other document
    for (const m of mods) {
      try {
        await m.needs?.(w);
        const before = new Set((await listOf(m)).map((r) => r.id));
        if (m.spa) {
          await ui.visit(m.listPath!);
          await selectProject(ui.page, w.projectName);
          await spaNavigate(ui.page, m.newPath);
        } else {
          await ui.visit(m.newPath);
          await selectProject(ui.page, w.projectName);
        }
        await m.prepare?.(ui.page);
        await fillAll(ui.page, m.values ?? {});
        let result = await submit(ui.page);
        for (let i = 0; i < 3 && result !== 'saved'; i++) { await fillAll(ui.page, m.values ?? {}); result = await submit(ui.page); }
        if (result !== 'saved') throw new Error('form still invalid after filling every field');
        let id = '';
        await expect.poll(async () => (id = (await listOf(m)).find((r) => !before.has(r.id))?.id ?? ''), { timeout: 15_000, message: 'saved but no new row' }).not.toBe('');
        created.push(`${m.name}:${id}`);
        const [url, q] = m.exportUrl(id, w);
        const res = await w.api.bytes(url, { lang: 'th', ...(q ?? {}), ...(q && 'projectId' in q ? { projectId } : {}) });
        expect(res.status, `export ${url}`).toBe(200);
        save(m.name, res.data);
      } catch (e) {
        failed.push(`${m.name}: ${String(e).split('\n')[0].slice(0, 300)}`);
      }
    }

    // 3. the project, now that it has children
    const pres = await w.api.bytes(`/api/pm/customer-projects/${projectId}/export`, { lang: 'th' });
    expect(pres.status).toBe(200);
    save('project', pres.data);
    console.log('PDFS', parts.map((p) => path.basename(p.file)).join(', '));
    console.log('FAILED', failed.length ? failed.join('\n  ') : 'none');
    expect(failed, 'documents that could not be made through the browser').toEqual([]);
  } finally {
    await ui.close();
    await w.cleanup();
  }
});
