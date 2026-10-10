import { test, expect, type Page } from '@playwright/test';
import { World } from '../api/world';
import type { Api } from '../api';
import { Ui } from '../ui';
import { deleteButtonFor, fillAndSave, selectProject, spaNavigate } from './forms';

// Create / edit / delete through the real forms and grids, for every module. Every step is verified through the API.
// Forms are filled by e2e/ui/forms.ts (required fields are discovered at runtime), so a module only needs its routes + list API.
type Mod = {
  name: string;
  newPath: string;
  listPath: string;
  editPath: (id: string) => string;
  /** list endpoint used to find the record the UI just created */
  listApi: string | ((w: World) => Promise<string>);
  delApi: (id: string) => string;
  /** pick the project first, then open the form from inside the app (the form reads the selection when it is created) */
  spa?: boolean;
  /** extra clicks before the form is auto-filled (e.g. add a line item) */
  prepare?: (page: Page) => Promise<void>;
  /** query string for the new-form URL, for forms that must be opened from a parent record */
  query?: (w: World) => Promise<string>;
  /** the list endpoint counts pages from 1 (default is 0) */
  page1?: boolean;
  /** fields to set explicitly (e.g. a drop-down that other drop-downs depend on); the rest is auto-filled */
  values?: Record<string, string> | ((w: World) => Promise<Record<string, string>>);
  /** records the form needs to pick in its drop-downs */
  needs?: (w: World) => Promise<unknown>;
  /** the grid on listPath has no Delete action */
  noGridDelete?: string;
};

const mods: Mod[] = [
  { name: 'customer', newPath: '/feature/pm/customer/new', listPath: '/feature/pm/customer', editPath: (id) => `/feature/pm/customer/${id}/edit`, listApi: '/api/pm/customers', delApi: (id) => `/api/pm/customers/${id}` },
  { name: 'project', newPath: '/feature/pm/project/new', listPath: '/feature/pm/project', editPath: (id) => `/feature/pm/project/${id}/edit`, listApi: '/api/pm/customer-projects', delApi: (id) => `/api/pm/customer-projects/${id}`, needs: (w) => w.customer() },
  { name: 'contract', newPath: '/feature/pm/contract/new', listPath: '/feature/pm/contract', editPath: (id) => `/feature/pm/contract/${id}/edit`, listApi: '/api/pm/contracts', delApi: (id) => `/api/pm/contracts/${id}`, needs: (w) => w.project() },
  { name: 'phase', newPath: '/feature/pm/phase/new', listPath: '/feature/pm/phase', editPath: (id) => `/feature/pm/phase/${id}/edit`, listApi: '/api/pm/phases', delApi: (id) => `/api/pm/phases/${id}`, needs: (w) => w.project() },
  { name: 'milestone', newPath: '/feature/pm/milestone/new', listPath: '/feature/pm/phase', editPath: (id) => `/feature/pm/milestone/${id}/edit`, listApi: async (w) => `/api/pm/milestones/phase/${await w.phase()}`, delApi: (id) => `/api/pm/milestones/${id}`, needs: (w) => w.phase(), noGridDelete: 'milestones live inside the phase detail page, not in a grid' },
  { name: 'work-package', newPath: '/feature/pm/work-package/new', listPath: '/feature/pm/phase', editPath: (id) => `/feature/pm/work-package/${id}/edit`, listApi: async (w) => `/api/pm/work-packages/milestone/${await w.milestone()}`, delApi: (id) => `/api/pm/work-packages/${id}`, needs: (w) => w.milestone(), noGridDelete: 'work packages live inside the phase detail page, not in a grid' },
  { name: 'task', newPath: '/feature/pm/task/new', listPath: '/feature/pm/task-board', editPath: (id) => `/feature/pm/task/${id}/edit`, listApi: '/api/pm/tasks/business', delApi: (id) => `/api/pm/tasks/${id}`, needs: (w) => w.workPackage(), noGridDelete: 'tasks are managed on the task board, not in a grid' },
  { name: 'requirement', newPath: '/feature/pm/requirement/new', listPath: '/feature/pm/requirement', editPath: (id) => `/feature/pm/requirement/${id}/edit`, listApi: '/api/pm/requirement', delApi: (id) => `/api/pm/requirement/${id}`, needs: (w) => w.project() },
  { name: 'change-request', values: { targetType: 'Specification', assigneeIds: '' }, // assignee is NOT NULL in the DB but optional in the form
    newPath: '/feature/pm/change-request/new', listPath: '/feature/pm/change-request', editPath: (id) => `/feature/pm/change-request/${id}/edit`, listApi: '/api/pm/change-requests', delApi: (id) => `/api/pm/change-requests/${id}`, needs: (w) => w.approvedSpec() },
  { name: 'specification', newPath: '/feature/pm/specification/new', listPath: '/feature/pm/specification', editPath: (id) => `/feature/pm/specification/${id}/edit`, listApi: '/api/pm/specifications', delApi: (id) => `/api/pm/specifications/${id}`, needs: (w) => w.requirement() },
  { name: 'design-review', newPath: '/feature/pm/design-review/new', listPath: '/feature/pm/design-review', editPath: (id) => `/feature/pm/design-review/${id}/edit`, listApi: '/api/pm/design-reviews', delApi: (id) => `/api/pm/design-reviews/${id}`, needs: (w) => w.specification() },
  { name: 'test-scenario', newPath: '/feature/pm/test-scenario/new', listPath: '/feature/pm/test-management', editPath: (id) => `/feature/pm/test-scenario/${id}/edit`, listApi: '/api/pm/test-scenarios', delApi: (id) => `/api/pm/test-scenarios/${id}`, needs: (w) => w.task() },
  { name: 'test-case', page1: true, newPath: '/feature/pm/test-case/new', listPath: '/feature/pm/test-management', editPath: (id) => `/feature/pm/test-case/${id}/edit`, listApi: '/api/pm/test-cases/paging', delApi: (id) => `/api/pm/test-cases/${id}`, needs: (w) => w.testScenario() },
  { name: 'bug', page1: true, query: async (w) => `taskId=${await w.task()}`, newPath: '/feature/pm/bug/new', listPath: '/feature/pm/test-management', editPath: (id) => `/feature/pm/bug/${id}/edit`, listApi: async (w) => `/api/pm/tasks/work-package/${await w.workPackage()}`, delApi: (id) => `/api/pm/tasks/${id}`, needs: (w) => w.task(), noGridDelete: 'a bug is a task named [BUG]; test-management lists PmBug rows, so no grid row (and no Delete action) exists for it' },
  { name: 'delivery', values: { contractId: '' }, page1: true, newPath: '/feature/pm/delivery/new', listPath: '/feature/pm/delivery', editPath: (id) => `/feature/pm/delivery/${id}/edit`, listApi: '/api/pm/delivery/paging', delApi: (id) => `/api/pm/delivery/${id}`, needs: (w) => w.contract() },
  { name: 'manual', page1: true, newPath: '/feature/pm/manual/new', listPath: '/feature/pm/manual', editPath: (id) => `/feature/pm/manual/${id}/edit`, listApi: '/api/pm/manual/paging', delApi: (id) => `/api/pm/manual/${id}`, needs: (w) => w.project() },
  { name: 'invoice', spa: true, values: { contractId: '' }, prepare: async (page) => {
    // subtotal is computed from line items: add one
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByPlaceholder('e.g. System development phase 1').fill('E2E item');
    await page.getByPlaceholder('Additional details').locator('xpath=following::input[1]').fill('1000');
  }, page1: true, newPath: '/feature/pm/invoice/new', listPath: '/feature/pm/invoice', editPath: (id) => `/feature/pm/invoice/${id}/edit`, listApi: '/api/pm/invoices/paging', delApi: (id) => `/api/pm/invoices/${id}`, needs: (w) => w.contract() },
  { name: 'ma-ticket', page1: true, newPath: '/feature/pm/ma-ticket/new', listPath: '/feature/pm/ma-ticket', editPath: (id) => `/feature/pm/ma-ticket/${id}/edit`, listApi: '/api/pm/ma-tickets/paging', delApi: (id) => `/api/pm/ma-tickets/${id}`, needs: (w) => w.project() },
  { name: 'program', newPath: '/feature/bu/program/new', listPath: '/feature/bu/program', editPath: (id) => `/feature/bu/program/${id}/edit`, listApi: '/api/su/programs/paging', delApi: (id) => `/api/su/programs/${id}` },
  { name: 'approval-flow', newPath: '/feature/bu/approval-flow/new', listPath: '/feature/bu/approval-flow', editPath: (id) => `/feature/bu/approval-flow/${id}/edit`, listApi: '/api/pm/approval-flows', delApi: (id) => `/api/pm/approval-flows/${id}` },
  { name: 'ai-model-config', newPath: '/feature/bu/ai-model-config/new', listPath: '/feature/bu/ai-model-config', editPath: (id) => `/feature/bu/ai-model-config/${id}/edit`, listApi: '/api/ai-model-config', delApi: (id) => `/api/ai-model-config/${id}` },
  { name: 'version', // the form has no document picker: documentId only arrives through the query string (opened from a document)
    query: async (w) => {
      const id = await w.requirement();
      const code = (await w.api.get(`/api/pm/requirement/${id}`)).body.requirementCode;
      return `projectId=${await w.project()}&documentType=REQUIREMENT&documentId=${id}&documentCode=${code}`;
    }, newPath: '/feature/pm/version/new', listPath: '/feature/pm/version', editPath: (id) => `/feature/pm/version/${id}/edit`, listApi: '/api/pm/document-versions', delApi: (id) => `/api/pm/document-versions/${id}`, needs: (w) => w.requirement() },
];

// MODULE=customer,project npx playwright test --project=ui e2e/ui/crud.spec.ts
const only = (process.env['MODULE'] ?? '').split(',').filter(Boolean);

function rowsOf(body: any): any[] {
  if (Array.isArray(body)) return body;
  for (const v of Object.values(body ?? {})) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') {
      const r = rowsOf(v);
      if (r.length) return r;
    }
  }
  return [];
}

/** keyword narrows the search where the endpoint supports it (lists often return only the first 10 rows) */
async function list(w: World, m: Mod, keyword?: string, byProject = true): Promise<any[]> {
  const path = typeof m.listApi === 'string' ? m.listApi : await m.listApi(w);
  const r = await w.api.get(path, { businessId: w.api.businessId!, page: m.page1 ? 1 : 0, size: 200, pageNumber: 1, pageSize: 200, ...(byProject ? { projectId: await w.project() } : {}), ...(keyword ? { keyword } : {}) });
  expect(r.status, `list ${path} ${JSON.stringify(r.body).slice(0, 200)}`).toBe(200);
  return rowsOf(r.body);
}

const markerOf = (typed: Record<string, string>) => {
  const entries = Object.entries(typed).filter(([, v]) => v);
  return (entries.find(([k]) => /code|no$/i.test(k)) ?? entries[0])?.[1];
};

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

for (const m of mods.filter((x) => !only.length || only.includes(x.name))) {
  test.describe(m.name, () => {
    test.describe.configure({ mode: 'serial' });
    let id = '';
    let marker = '';
    let edited = '';
    let shown: string[] = []; // every text typed into the form: whichever one the list shows identifies the row

    test.afterAll(async () => {
      if (id) await w.api.del(m.delApi(id)).catch(() => {}); // no-op when the UI test already deleted it
    });

    test('create via form', async () => {
      test.setTimeout(240_000);
      await m.needs?.(w);
      await w.project(); // the project the form will be bound to must exist before the switcher is opened
      const before = new Set((await list(w, m)).map((r) => r.id));
      const url = m.query ? `${m.newPath}?${await m.query(w)}` : m.newPath;
      if (m.spa) {
        await ui.visit(m.listPath);
        await selectProject(ui.page, w.projectName);
        await spaNavigate(ui.page, url);
      } else {
        await ui.visit(url);
        if (m.newPath.includes('/pm/')) await selectProject(ui.page, w.projectName);
      }
      await m.prepare?.(ui.page);
      const values = typeof m.values === 'function' ? await m.values(w) : m.values;
      const typed = await fillAndSave(ui.page, values);
      marker = markerOf(typed) ?? '';
      shown = Object.values(typed).filter((v) => v.length > 3);
      let created: any[] = [];
      await expect
        .poll(
          async () => {
            const byKeyword = marker ? (await list(w, m, marker)).filter((r) => !before.has(r.id)) : [];
            created = byKeyword.length ? byKeyword : (await list(w, m)).filter((r) => !before.has(r.id));
            // some forms save the record without a project (e.g. MA ticket): look again without the project filter
            if (!created.length) created = (await list(w, m, marker || undefined, false)).filter((r) => !before.has(r.id));
            return created.length;
          }, { timeout: 15_000, message: `UI saved but no new row appeared in ${m.listApi}. ${JSON.stringify(ui.errors)}` })
        .toBe(1);
      id = created[0].id;
      // generated codes (invoice no., ...) are what the list shows when the form had no code field
      shown.push(...Object.entries(created[0]).filter(([k, v]) => typeof v === 'string' && v.length > 2 && v.length < 60 && /code|no$|name|title/i.test(k)).map(([, v]) => v as string));
      expect(ui.errors).toEqual([]);
    });

    test('edit via form', async () => {
      test.setTimeout(240_000);
      expect(id, 'create step failed').toBeTruthy();
      await ui.visit(m.editPath(id));
      // change the first free-text field that is not a code (codes are usually locked after creation)
      const field = await ui.page
        .locator('sic-input[formcontrolname], sic-input-area[formcontrolname], textarea[formcontrolname], sic-tiptap-editor[formcontrolname], input[formcontrolname]:not([type=checkbox]):not([type=radio]):not([type=number]):not([type=date]):not([type=hidden])')
        .evaluateAll((els) => els.map((e) => e.getAttribute('formcontrolname')!).find((n) => !/code|no$|email|phone|tax|zip|value|amount|price|manday|rate|qty|total|number|days?$|hours?$|percent/i.test(n)));
      expect(field, 'no free-text field to edit').toBeTruthy();
      edited = `E2E-EDITED-${Date.now().toString(36)}`;
      await fillAndSave(ui.page, { [field!]: edited });
      const rows = [...(await list(w, m, marker)), ...(await list(w, m)), ...(await list(w, m, undefined, false))];
      expect(JSON.stringify(rows.find((r) => r.id === id)), 'edited value not persisted').toContain(edited);
    });

    test('delete via grid', async () => {
      test.setTimeout(240_000);
      expect(id, 'create step failed').toBeTruthy();
      test.skip(!!m.noGridDelete, m.noGridDelete ?? '');
      await ui.visit(m.listPath);
      // grids show rows, some lists show cards; the visible text is the typed marker or the edited value
      // the Delete control next to the most specific text we know (what the test typed, then generated strings)
      const wanted = [...new Set([marker, edited, ...shown].filter(Boolean))];
      const find = async () => {
        for (const t of wanted) {
          const btn = await deleteButtonFor(ui.page, t);
          if (btn) return btn;
        }
        return null;
      };
      await ui.page.getByText(wanted[0]).first().waitFor({ timeout: 20_000 }).catch(() => {}); // list is rendered after its data arrives
      let button = await find();
      if (!button) {
        // lists are paged: use the page's own search box to bring the row up
        const search = ui.page.getByPlaceholder(/^search/i).first();
        for (const t of wanted) {
          if (!(await search.count())) break;
          await search.fill(t);
          await ui.page.waitForTimeout(1500);
          if ((button = await find())) break;
        }
      }
      expect(button, `no Delete control next to "${wanted.join('" / "')}" on ${m.listPath}`).toBeTruthy();
      await button!.evaluate((b) => (b as HTMLElement).click()); // DOM click: overlays (AI button) can cover the row actions
      await ui.page.getByRole('button', { name: 'Confirm' }).click();
      if (process.env['DEBUG_FORMS']) console.log('CONFIRMED_AT', new Date().toISOString());
      await expect.poll(async () => [...(await list(w, m, marker || edited)), ...(await list(w, m)), ...(await list(w, m, undefined, false))].some((r) => r.id === id), { timeout: 40_000, message: `record still exists after delete: ${JSON.stringify((await list(w, m, undefined, false)).find((r) => r.id === id)).slice(0, 400)}` }).toBe(false);
      id = '';
    });
  });
}
