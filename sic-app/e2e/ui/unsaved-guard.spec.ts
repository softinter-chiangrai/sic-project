import { test, expect } from '@playwright/test';
import { World, today, inDays, firstOf, idOf } from '../api/world';
import { mock, userId } from '../api';
import { Ui } from '../ui';

// Unsaved-changes guard (CanDeactivateGuard) on every form route that has it:
//  - open the form, change nothing, leave through the app -> no "unsaved changes" dialog
//  - type into a field, leave -> the dialog appears (the guard still works)

let w: World;
let ui: Ui;
let ids: Record<string, string> = {};

test.beforeAll(async ({ browser }) => {
  test.setTimeout(240_000);
  w = await World.create();
  ui = await Ui.open(browser);
  const projectId = await w.project();
  const customerId = await w.customer();
  const me = await userId();
  const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
  const signStatus = firstOf((await w.api.get('/api/pm/contracts/lov-sign-status')).body);
  const requirement = await w.requirement();
  const specification = await w.specification();
  const versionNo = mock('v');
  const members = await w.api.get('/api/su-user-business/members', { businessId: w.api.businessId! });
  const memberRows = members.body?.data ?? members.body?.content ?? members.body;
  ids = {
    customer: customerId,
    project: projectId,
    contract: await w.make('/api/pm/contracts/save', { contractNo: mock('CT'), contractType, signStatus, customerId, projectId, startDate: today(), endDate: inDays(365), contractValue: 1000 }, '/api/pm/contracts/{id}'),
    phase: await w.phase(),
    requirement,
    specification,
    changeRequest: await w.make('/api/pm/change-requests', { projectId, targetType: 'SPECIFICATION', targetId: await w.approvedSpec(), title: 'UI CR', description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: me }, '/api/pm/change-requests/{id}'),
    designReview: await w.make('/api/pm/design-reviews', { projectId, reviewCode: mock('DR'), title: 'UI review' }, '/api/pm/design-reviews/{id}'),
    testCase: await w.make('/api/pm/test-cases/save', { projectId, scenarioId: await w.testScenario(), taskId: await w.task(), testCaseCode: mock('TC'), title: 'UI case', testStep: '1', expectedResult: 'ok', state: 4 }, '/api/pm/test-cases/{id}'),
    // the bug form edits a bug *task* (pmdt12C), not a pm_bug row
    bug: await w.make('/api/pm/tasks', { workPackageId: await w.workPackage(), taskCode: `BUG-${mock('T')}`, taskName: '[BUG] UI bug', startDate: today(), endDate: inDays(1), estimateManday: 1 }, '/api/pm/tasks/{id}'),
    delivery: await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'UI delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}'),
    docVersion: await w.make('/api/pm/document-versions', { documentType: 'REQUIREMENT', documentId: requirement, versionNo, projectId, changeSummary: 'ui' }, '/api/pm/document-versions/{id}'),
    role: await w.make('/api/su/business-roles/save', { businessId: w.api.businessId, roleCode: mock('ROLE'), roleNameEn: 'UI role', roleNameLocal: 'UI role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}'),
    member: (Array.isArray(memberRows) ? memberRows : [])[0]?.id,
    program: await w.make('/api/su/programs/save', { programCode: mock('PRG'), programNameEn: 'UI prog', programNameLocal: 'UI prog', routePath: '/e2e-ui', sortOrder: 99, isActive: true, state: 4 }, '/api/su/programs/{id}'),
    flow: await w.make('/api/pm/approval-flows', { flowCode: mock('F'), flowName: 'UI flow', documentType: 'REQUIREMENT', approvalMode: 'CHAIN', isActive: true, steps: [{ stepOrder: 1, stepName: 'S1', approverUserId: me, isRequired: true }] }, '/api/pm/approval-flows/{id}'),
    aiModel: await w.make('/api/ai-model-config', { modelCode: mock('model'), displayName: 'UI model', providerLabel: 'e2e', apiFormat: 'OPENAI_COMPATIBLE', apiUrl: 'http://localhost:1/none', apiKey: 'x', maxTokens: 100, isActive: true, isDefault: false, isRecommended: false, sortOrder: 99 }, '/api/ai-model-config/{id}'),
  };
  void idOf;
});

test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

// every route with canDeactivate: [route, key of ids or '' for create pages]
const routes: [string, string][] = [
  ['/feature/pm/customer/new', ''], ['/feature/pm/customer/:id/edit', 'customer'],
  ['/feature/pm/project/new', ''], ['/feature/pm/project/:id/edit', 'project'],
  ['/feature/pm/contract/new', ''], ['/feature/pm/contract/:id/edit', 'contract'], ['/feature/pm/contract/renew/:id', 'contract'],
  ['/feature/pm/phase/new', ''], ['/feature/pm/phase/:id/edit', 'phase'],
  ['/feature/pm/requirement/new', ''], ['/feature/pm/requirement/:id/edit', 'requirement'],
  ['/feature/pm/change-request/new', ''], ['/feature/pm/change-request/:id/edit', 'changeRequest'],
  ['/feature/pm/specification/new', ''], ['/feature/pm/specification/:id/edit', 'specification'],
  ['/feature/pm/design-review/new', ''], ['/feature/pm/design-review/:id/edit', 'designReview'],
  ['/feature/pm/test-case/new', ''], ['/feature/pm/test-case/:id/edit', 'testCase'],
  ['/feature/pm/test-scenario/new', ''],
  ['/feature/pm/bug/new', ''], ['/feature/pm/bug/:id/edit', 'bug'],
  ['/feature/pm/delivery/new', ''], ['/feature/pm/delivery/:id/edit', 'delivery'],
  ['/feature/pm/manual/new', ''], ['/feature/pm/invoice/new', ''], ['/feature/pm/ma-ticket/new', ''],
  ['/feature/pm/version/new', ''], ['/feature/pm/version/:id/edit', 'docVersion'],
  ['/feature/bu/permission/:id', 'role'], ['/feature/bu/team/:id/edit', 'member'],
  ['/feature/bu/program/new', ''], ['/feature/bu/program/:id/edit', 'program'],
  ['/feature/bu/approval-flow/new', ''], ['/feature/bu/approval-flow/:id/edit', 'flow'],
  ['/feature/bu/ai-model-config/new', ''], ['/feature/bu/ai-model-config/:id/edit', 'aiModel'],
];

const PROMPT = /มีการเปลี่ยนแปลงที่ยังไม่บันทึก|Unsaved Changes/;

const crumbs = () => ui.page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link');

/** Leave through the router (a full page load would bypass the guard): click the first breadcrumb link. */
async function leave() {
  const { page } = ui;
  await page.keyboard.press('Escape').catch(() => {});
  const link = crumbs().first();
  if (await link.count()) await link.click();
  else await page.evaluate(() => (document.querySelector('a[href^="/feature"]') as HTMLElement | null)?.click());
}

async function promptShown() {
  return ui.page.getByText(PROMPT).first().isVisible({ timeout: 3_000 }).catch(() => false)
    .then(async (v) => v || (await ui.page.getByText(PROMPT).first().waitFor({ timeout: 3_000 }).then(() => true, () => false)));
}

/** Dev build only: list dirty form controls of every component on the page (Angular debug API `ng`). */
async function dirtyReport(): Promise<string[]> {
  return ui.page.evaluate(() => {
    const ng = (window as any).ng;
    if (!ng?.getComponent) return ['(no ng debug api)'];
    const out = new Set<string>();
    const walk = (ctrl: any, path: string) => {
      if (!ctrl || typeof ctrl !== 'object' || !('dirty' in ctrl)) return;
      if (ctrl.controls) {
        for (const [k, c] of Object.entries(ctrl.controls)) walk(c, path ? `${path}.${k}` : k);
      } else if (ctrl.dirty) {
        let v: string;
        try { v = JSON.stringify(ctrl.value); } catch { v = String(ctrl.value); }
        out.add(`${path}=${(v ?? '').slice(0, 60)}`);
      }
    };
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const comp = ng.getComponent(el);
      if (!comp) continue;
      for (const key of Object.keys(comp)) {
        const val = comp[key];
        const fg = val?.controls ? val : val?.formGroup?.controls ? val.formGroup : val?.form?.controls ? val.form : null;
        if (fg?.dirty) walk(fg, `${comp.constructor?.name}.${key}`);
      }
    }
    return [...out];
  });
}

/** Click into every field and open/close every dropdown without changing a value (what a user "playing around" does). */
async function touchEverything() {
  const { page } = ui;
  const fields = page.locator('input:visible:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]):not([readonly]):not([disabled]), textarea:visible:not([readonly]):not([disabled]), .ProseMirror:visible');
  const n = Math.min(await fields.count(), 40);
  for (let i = 0; i < n; i++) {
    const f = fields.nth(i);
    if (await f.evaluate((el) => !!el.closest('nav, header, [role=navigation], .sic-sidebar, app-sic-sidebar'))) continue;
    await f.click({ timeout: 2_000 }).catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await page.keyboard.press('Tab').catch(() => {});
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
}

async function dismissPrompt() {
  // stay on the page, so the next check starts from the same state
  await ui.page.getByRole('button', { name: /ยกเลิก|Cancel/ }).last().click().catch(() => {});
}

for (const [template, key] of routes) {
  test(template, async () => {
    test.setTimeout(150_000);
    test.skip(key !== '' && !ids[key], `no mock ${key} could be created`);
    const path = key ? template.replace(':id', ids[key]) : template;
    const { page } = ui;

    // 1. open, change nothing, leave -> no prompt
    await ui.visit(path);
    await crumbs().first().waitFor({ timeout: 30_000 }).catch(() => {});
    const before = page.url();
    await leave();
    const falsePrompt = await promptShown();
    if (falsePrompt) {
      await page.screenshot({ path: `test-results/unsaved-guard${template.replace(/[/:]/g, '_')}.png` });
      await dismissPrompt();
    }
    expect.soft(falsePrompt, `${template}: unchanged form must not ask about unsaved changes`).toBe(false);
    if (!falsePrompt) expect.soft(page.url(), `${template}: leaving did not navigate`).not.toBe(before);

    // 2. click into every field / open every dropdown, change nothing, leave -> no prompt
    await ui.visit(path);
    await crumbs().first().waitFor({ timeout: 30_000 }).catch(() => {});
    await touchEverything();
    const dirtyAfterTouch = await dirtyReport();
    await leave();
    const touchPrompt = await promptShown();
    if (touchPrompt) {
      await page.screenshot({ path: `test-results/unsaved-guard-touch${template.replace(/[/:]/g, '_')}.png` });
      await dismissPrompt();
    }
    expect.soft(touchPrompt, `${template}: touched-but-unchanged form must not ask; dirty: ${dirtyAfterTouch.join(' | ')}`).toBe(false);

    // 3. type into a field, leave -> prompt
    await ui.visit(path);
    await crumbs().first().waitFor({ timeout: 30_000 }).catch(() => {});
    const field = page.locator('main input[type=text]:visible:not([readonly]):not([disabled]):not(.sic-combobox__field-input):not(.sic-search-input), main textarea:visible:not([readonly]):not([disabled]), input.sic-input__field:visible:not([readonly]):not([disabled]):not(.sic-search-input)').first();
    if (!(await field.count())) {
      test.info().annotations.push({ type: 'no-text-field', description: template });
      return;
    }
    await field.click();
    await field.pressSequentially('x');
    const typedInto = await field.evaluate((el) => `${el.tagName.toLowerCase()}${el.getAttribute('formcontrolname') ? '[' + el.getAttribute('formcontrolname') + ']' : ''}.${el.className}`.slice(0, 80));
    const dirtyAfterType = await dirtyReport();
    await leave();
    const shown = await promptShown();
    expect.soft(shown, `${template}: edited form must ask about unsaved changes; typed into ${typedInto}; dirty: ${dirtyAfterType.join(' | ')}`).toBe(true);
    if (shown) {
      await page.getByRole('button', { name: /ตกลง|ยืนยัน|OK|Confirm|Leave|ออก/ }).last().click().catch(() => {});
    }
  });
}
