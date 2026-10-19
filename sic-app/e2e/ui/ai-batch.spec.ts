import { test, expect, type Response } from '@playwright/test';
import { Ui } from '../ui';
import { World, idOf } from '../api/world';
import { selectProject } from './forms';
import { t, resetAiStorage } from './ai';

// AI batch modal of every list page (see .claude/skills/playwright/ai-modules.md 3.2 / 4.2).
// The AI answer is faked; "Apply" really saves, and every record it creates is deleted in afterAll.

interface Row {
  moduleType: string;
  route: string;
  item: (tag: string) => Record<string, unknown>; // one AI row; tag makes it findable
  needs?: 'workPackage';
}

const rows: Row[] = [
  { moduleType: 'PHASE', route: '/feature/pm/phase', item: (n) => ({ phaseName: n, description: 'AI phase', color: '#3B82F6' }) },
  { moduleType: 'REQUIREMENT', route: '/feature/pm/requirement', item: (n) => ({ title: n, description: 'AI req', requirementType: 'FUNCTIONAL', priority: 'High' }) },
  { moduleType: 'SPECIFICATION', route: '/feature/pm/specification', item: (n) => ({ title: n, description: 'AI spec', specificationType: 'UI Specification', priority: 'Low' }) },
  { moduleType: 'DESIGN_REVIEW', route: '/feature/pm/design-review', item: (n) => ({ title: n, description: 'AI review', severity: 'High' }) },
  { moduleType: 'TASK', route: '/feature/pm/task-board', needs: 'workPackage', item: (n) => ({ taskName: n, description: 'AI task', priority: 'Medium', estimateManday: 1, color: '#3B82F6' }) },
  { moduleType: 'TEST_CASE', route: '/feature/pm/test-management', item: (n) => ({ title: n, testStep: 'AI step', expectedResult: 'AI result', priority: 'High', testType: 'SIT' }) },
  { moduleType: 'DELIVERY', route: '/feature/pm/delivery', item: (n) => ({ deliveryTitle: n, deliverySummary: 'AI delivery', deliveryType: 'SPRINT' }) },
  { moduleType: 'USER_MANUAL', route: '/feature/pm/manual', item: (n) => ({ manualTitle: n, manualType: 'USER', version: '1.0.0' }) },
  { moduleType: 'MA_TICKET', route: '/feature/pm/ma-ticket', item: (n) => ({ title: n, description: 'AI ticket', severity: 'LOW', ticketType: 'GENERAL_QUESTION' }) },
];

let ui: Ui;
let w: World;
const created: string[] = []; // DELETE paths of records saved through "Apply"

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  await w.project();
  ui = await Ui.open(browser);
  // every save the batch modal makes: POST /api/pm/<module>[/save] -> DELETE /api/pm/<module>/<id>
  ui.page.on('response', async (r: Response) => {
    const req = r.request();
    if (req.method() !== 'POST' || r.status() >= 300 || !/\/api\/pm\//.test(r.url()) || /generate|batch|search|export|list/.test(r.url())) return;
    const id = idOf(await r.json().catch(() => null));
    // /api/pm/projects/<id>/phases (phase create) is deleted at /api/pm/phases/<id>
    if (id) created.push(`${new URL(r.url()).pathname.replace(/\/save$/, '').replace(/\/projects\/[^/]+(?=\/)/, '')}/${id}`);
  });
});

test.afterAll(async () => {
  for (const p of created.reverse()) await w.api.del(p).catch(() => {});
  if (ui) await resetAiStorage(ui).catch(() => {});
  await ui?.close();
  await w?.cleanup();
});

for (const row of rows) {
  test(`AI batch: ${row.moduleType} generates, appends, saves only the ticked rows`, async () => {
    const { page } = ui;
    if (row.needs === 'workPackage') await w.workPackage();
    const keep = `E2E AI keep ${Math.random().toString(36).slice(2, 7)}`;
    const drop = `E2E AI drop ${Math.random().toString(36).slice(2, 7)}`;
    const more = `E2E AI more ${Math.random().toString(36).slice(2, 7)}`;
    const sent: any[] = [];
    let answer = [row.item(keep), row.item(drop)];
    await page.route('**/api/ai/batch-generate', (route) => {
      sent.push(route.request().postDataJSON());
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ moduleType: row.moduleType, items: answer, message: null }) });
    });
    try {
      await resetAiStorage(ui);
      await ui.visit(row.route);
      await ui.expectHealthy(row.route);
      await selectProject(page, w.projectName);
      await page.getByRole('button', { name: t('AI_BATCH_CREATE_BUTTON') }).first().click();
      const modal = page.locator('sic-ai-batch-modal');
      // the name starts with an icon glyph: anchor only the end
      const generate = modal.getByRole('button', { name: new RegExp(`(${t('AI_BATCH_GENERATE')}|${t('AI_BATCH_GENERATE_MORE')})$`) });

      // empty prompt: the button is disabled, nothing is sent
      await expect(generate).toBeDisabled();
      expect(sent).toHaveLength(0);

      await modal.getByPlaceholder(t('AI_BATCH_PROMPT_PLACEHOLDER')).fill('E2E batch prompt');
      await generate.click();
      await expect.poll(() => sent.length).toBe(1);
      expect(sent[0]).toMatchObject({ moduleType: row.moduleType, prompt: 'E2E batch prompt' });
      await expect(modal.locator('tbody tr')).toHaveCount(2);

      // "Generate more" appends, never replaces
      answer = [row.item(more)];
      await generate.click();
      await expect(modal.locator('tbody tr')).toHaveCount(3);

      // rows keep the AI order (keep, drop, more): untick the last two
      for (const i of [1, 2]) await modal.locator('tbody tr').nth(i).locator('input[type=checkbox]').uncheck();
      await modal.getByRole('button', { name: t('AI_BATCH_SAVE_ALL', { count: 1 }) }).click();
      await page.locator('.sic-dialog-overlay-pane').getByRole('button', { name: /^(OK|ตกลง|Close|ปิด)$/ }).last().click({ timeout: 10_000 }).catch(() => {});

      // saved: only the ticked row, under the selected project
      await expect.poll(() => created.length, { timeout: 15_000 }).toBeGreaterThan(0);
      const bodies = await Promise.all(created.map((p) => w.api.get(p).then((r) => JSON.stringify(r.body))));
      expect(bodies.some((b) => b.includes(keep)), 'ticked row saved').toBe(true);
      expect(bodies.some((b) => b.includes(drop) || b.includes(more)), 'unticked rows not saved').toBe(false);
      expect(ui.errors).toEqual([]);
    } finally {
      await page.unroute('**/api/ai/batch-generate');
    }
  });
}
