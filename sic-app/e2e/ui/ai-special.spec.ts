import { test, expect } from '@playwright/test';
import { Ui } from '../ui';
import { World } from '../api/world';
import { userId } from '../api';
import { t, resetAiStorage } from './ai';

// Phase WBS, Bug Smart Resolution, Change Request impact analysis (ai-modules.md 4.3). AI answers are faked,
// so WBS creates nothing; World records are removed in afterAll.

let ui: Ui;
let w: World;

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  ui = await Ui.open(browser);
});

test.afterAll(async () => {
  if (ui) await resetAiStorage(ui).catch(() => {});
  await ui?.close();
  await w?.cleanup();
});

test.beforeEach(() => resetAiStorage(ui));

const json = (body: unknown, status = 200) => (route: any) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

test.describe('Phase WBS with AI', () => {
  for (const [name, answer, expected] of [
    ['reports what was created', { milestones: 1, workPackages: 2, tasks: 3, message: 'E2E WBS created' }, 'E2E WBS created'],
    ['warns when AI produced nothing', { milestones: 0, workPackages: 0, tasks: 0, message: 'E2E WBS empty' }, 'E2E WBS empty'],
  ] as const) {
    test(name, async () => {
      const { page } = ui;
      const phaseId = await w.phase();
      let sent: any;
      await page.route('**/api/pm/ai/phase-wbs/generate', (route) => {
        sent = route.request().postDataJSON();
        return json(answer)(route);
      });
      try {
        await ui.visit(`/feature/pm/phase/${phaseId}`);
        await ui.expectHealthy('/feature/pm/phase/:id');
        await page.getByRole('button', { name: t('PMDT02_AI_WBS_BTN') }).first().click();
        await page.getByPlaceholder(t('PMDT02_AI_WBS_PROMPT_PLACEHOLDER')).fill('E2E WBS prompt');
        await page.getByRole('button', { name: new RegExp(`${t('PMDT02_AI_WBS_GENERATE')}$`) }).click();
        await expect(page.getByText(expected).first()).toBeVisible({ timeout: 15_000 });
        expect(sent).toMatchObject({ phaseId, prompt: 'E2E WBS prompt' });
      } finally {
        await page.unroute('**/api/pm/ai/phase-wbs/generate');
      }
    });
  }

  test('shows the backend error', async () => {
    const { page } = ui;
    const phaseId = await w.phase();
    await page.route('**/api/pm/ai/phase-wbs/generate', json({ message: 'E2E WBS failed' }, 400));
    try {
      await ui.visit(`/feature/pm/phase/${phaseId}`);
      await page.getByRole('button', { name: t('PMDT02_AI_WBS_BTN') }).first().click();
      await page.getByRole('button', { name: new RegExp(`${t('PMDT02_AI_WBS_GENERATE')}$`) }).click();
      await expect(page.getByText('E2E WBS failed').first()).toBeVisible({ timeout: 15_000 });
    } finally {
      await page.unroute('**/api/pm/ai/phase-wbs/generate');
    }
  });
});

test.describe('Bug Smart AI Resolution', () => {
  test('asks for a title first, then appends the AI guide to the description', async () => {
    const { page } = ui;
    let sent: any;
    await page.route('**/api/pm/bugs/ai-smart-resolution', (route) => {
      sent = route.request().postDataJSON();
      return json({ rootCause: 'E2E root cause', suggestedFix: 'E2E fix', codeSnippet: '', preventionTest: 'E2E test', lang: 'en' })(route);
    });
    try {
      await ui.visit('/feature/pm/bug/new');
      await ui.expectHealthy('/feature/pm/bug/new');
      const resolve = page.getByRole('button', { name: t('PMDT12_AI_RESOLUTION_BTN') });
      await resolve.click();
      await expect(page.getByText(t('PMDT12_AI_BUG_NEED_INPUT_MSG'))).toBeVisible();
      expect(sent).toBeUndefined();
      await page.getByRole('button', { name: /^(OK|ตกลง|Close|ปิด)$/ }).last().click({ timeout: 3000 }).catch(() => page.keyboard.press('Escape'));

      await page.locator('[formcontrolname="taskName"] input, input[formcontrolname="taskName"]').first().fill('E2E login button does nothing');
      await resolve.click();
      await expect(page.getByText('E2E root cause').first()).toBeVisible({ timeout: 15_000 });
      expect(sent).toMatchObject({ title: 'E2E login button does nothing' });

      const description = page.locator('textarea[formcontrolname="description"]');
      await description.fill('E2E steps the tester wrote');
      await page.getByRole('button', { name: t('PMDT12_AI_APPLY_TO_DESC') }).click();
      // appended after what the tester wrote, never replacing it
      await expect(description).toHaveValue(/^E2E steps the tester wrote[\s\S]*E2E root cause/);
    } finally {
      await page.unroute('**/api/pm/bugs/ai-smart-resolution');
    }
  });
});

test.describe('Change Request AI impact analysis', () => {
  // the AI button shows once a target document is chosen: use a saved CR on an approved specification
  const changeRequest = async () =>
    w.make('/api/pm/change-requests', { projectId: await w.project(), targetType: 'SPECIFICATION', targetId: await w.approvedSpec(), title: 'E2E AI impact CR', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId() }, '/api/pm/change-requests/{id}');

  for (const [name, status, body, expected] of [
    ['shows the AI rationale', 200, { aiRationale: 'E2E impact rationale', mandayImpact: 3 }, 'E2E impact rationale'],
    ['shows the error when AI fails', 400, { message: 'E2E impact failed' }, 'E2E impact failed'],
  ] as const) {
    test(name, async () => {
      const { page } = ui;
      const crId = await changeRequest();
      await page.route(`**/api/pm/impact-analysis/ai-analyze/${crId}`, (route) => json({ changeRequestId: crId, ...body }, status)(route));
      try {
        await ui.visit(`/feature/pm/change-request/${crId}/edit`);
        await ui.expectHealthy('/feature/pm/change-request/:id/edit');
        await page.getByRole('button', { name: t('PMDT06_AI_ANALYZE_BTN') }).click();
        await expect(page.getByText(expected).first()).toBeVisible({ timeout: 15_000 });
      } finally {
        await page.unroute(`**/api/pm/impact-analysis/ai-analyze/${crId}`);
      }
    });
  }
});
