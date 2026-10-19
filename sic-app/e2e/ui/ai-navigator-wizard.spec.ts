import { test, expect } from '@playwright/test';
import { Ui } from '../ui';
import { World } from '../api/world';
import { t, resetAiStorage } from './ai';

// Global AI Navigator, deep link auto-open, AI Full-Project Wizard (ai-modules.md 3.3 - 3.5).
// Every AI answer is faked, so nothing is created; World records are removed in afterAll.

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

const chat = (body: unknown, status = 200) => (route: any) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

async function ask(text: string) {
  const { page } = ui;
  await page.locator('.ai-nav-fab').click();
  await page.locator('.ai-nav-input').fill(text);
  await page.locator('.ai-nav-send').click();
}

test.describe('AI Navigator', () => {
  test('answers, names the session after the question, and its route button navigates', async () => {
    const { page } = ui;
    let sent: any;
    await page.route('**/api/ai/navigator/chat', (route) => {
      sent = route.request().postDataJSON();
      return chat({ answer: 'E2E answer: open the requirement list', suggestedRoutes: [{ label: 'E2E requirements', path: '/feature/pm/requirement' }], openBatchModuleType: null, openBatchRoute: null })(route);
    });
    try {
      await ui.visit('/feature/dashboard');
      await ask('where are requirements?');
      await expect(page.getByText('E2E answer: open the requirement list')).toBeVisible({ timeout: 15_000 });
      expect(sent).toMatchObject({ message: 'where are requirements?' });
      expect(sent.currentPath).toContain('/feature/dashboard');
      expect(sent.model).toBeTruthy();

      const sessions = await page.evaluate(() => JSON.parse(localStorage.getItem('sic_ai_navigator_sessions_v1') || '[]'));
      expect(sessions.some((s: any) => s.title === 'where are requirements?')).toBe(true);

      await page.locator('.ai-nav-route-btn', { hasText: 'E2E requirements' }).click();
      await page.waitForURL(/\/feature\/pm\/requirement$/);
      expect(ui.errors).toEqual([]);
    } finally {
      await page.unroute('**/api/ai/navigator/chat');
    }
  });

  test('an empty message sends nothing; a failed call shows the error in the chat', async () => {
    const { page } = ui;
    let calls = 0;
    await page.route('**/api/ai/navigator/chat', (route) => {
      calls++;
      return chat({ message: 'down' }, 500)(route);
    });
    try {
      await ui.visit('/feature/dashboard');
      await page.locator('.ai-nav-fab').click();
      await expect(page.locator('.ai-nav-send')).toBeDisabled(); // nothing typed, nothing attached
      await page.locator('.ai-nav-input').fill('   ');
      await expect(page.locator('.ai-nav-send')).toBeDisabled(); // blanks only
      expect(calls).toBe(0);
      await page.locator('.ai-nav-input').fill('hello');
      await page.locator('.ai-nav-send').click();
      await expect(page.locator('.ai-nav-bubble', { hasText: t('AI_NAV_ERROR_MSG') })).toBeVisible({ timeout: 15_000 });
    } finally {
      await page.unroute('**/api/ai/navigator/chat');
    }
  });

  test('deep link: the navigator opens the requirement form and starts the AI draft with the question', async () => {
    const { page } = ui;
    await w.project();
    let draftPrompt: string | undefined;
    await page.route('**/api/ai/navigator/chat', chat({ answer: 'opening', suggestedRoutes: [], openBatchModuleType: 'REQUIREMENT', openBatchRoute: '/feature/pm/requirement/new' }));
    await page.route('**/api/pm/requirement/ai/generate', (route) => {
      draftPrompt = route.request().postDataJSON().prompt;
      return chat({ title: 'AI deep link title', description: '<p>x</p>' })(route);
    });
    try {
      await ui.visit('/feature/dashboard');
      await ask('create a login requirement');
      await page.waitForURL(/\/feature\/pm\/requirement\/new/);
      await expect.poll(() => draftPrompt, { timeout: 20_000 }).toContain('create a login requirement');
      await expect.poll(() => page.url()).not.toContain('aiAutoOpen');
    } finally {
      await page.unroute('**/api/ai/navigator/chat');
      await page.unroute('**/api/pm/requirement/ai/generate');
    }
  });

  test('deep link is ignored when the module type does not match the page', async () => {
    const { page } = ui;
    let calls = 0;
    await page.route('**/api/pm/requirement/ai/generate', (route) => {
      calls++;
      return chat({})(route);
    });
    try {
      await ui.visit('/feature/pm/requirement/new?aiAutoOpen=1&aiModuleType=CONTRACT&aiPrompt=x');
      await ui.expectHealthy('/feature/pm/requirement/new');
      await expect(page.getByPlaceholder(t('PMDT04_AI_PROMPT_PLACEHOLDER'))).toHaveCount(0);
      expect(calls).toBe(0);
    } finally {
      await page.unroute('**/api/pm/requirement/ai/generate');
    }
  });
});

test.describe('AI Full-Project Wizard', () => {
  test('preview -> execute -> poll -> summary, then "Review This Project" opens the created project', async () => {
    const { page } = ui;
    test.setTimeout(120_000);
    const projectId = await w.project(); // a real project: the edit page loads it
    let polls = 0;
    await page.route('**/api/pm/ai/pipeline/preview', chat({
      projectCode: 'E2E-AI', projectName: 'E2E wizard project', description: 'x', estimatedDurationWeeks: 12,
      previewRequirements: [{ title: 'E2E wizard requirement' }], previewSpecifications: [], previewTasks: [], previewPhases: [], previewDeliveries: [], message: 'ok',
    }));
    await page.route('**/api/pm/ai/pipeline/execute-async', chat({ jobId: 'e2e-job' }));
    await page.route('**/api/pm/ai/pipeline/jobs/e2e-job', (route) => {
      polls++;
      const done = polls > 1;
      return chat({ jobId: 'e2e-job', status: done ? 'COMPLETED' : 'RUNNING', finished: done, projectId, steps: [], createdCounts: { requirements: 1 } })(route);
    });
    try {
      await ui.visit('/feature/pm/project');
      await page.getByRole('button', { name: t('PMRT02_CREATE_WITH_AI_BTN') }).first().click();
      const modal = page.locator('.ai-wizard-modal');
      await expect(modal.locator('.stepper-item')).toHaveCount(4);
      await modal.getByPlaceholder(t('AIWIZARD_BRIEF_PLACEHOLDER')).fill('E2E wizard brief');
      await modal.getByRole('button', { name: t('AIWIZARD_PREVIEW_BTN') }).click();
      await expect(modal.getByText('E2E wizard requirement')).toBeVisible({ timeout: 15_000 });
      await modal.getByRole('button', { name: t('AIWIZARD_CONFIRM_CREATE_BTN') }).click();
      await expect(modal.getByRole('button', { name: t('AIWIZARD_REVIEW_PROJECT_BTN') })).toBeVisible({ timeout: 20_000 });
      await modal.getByRole('button', { name: t('AIWIZARD_REVIEW_PROJECT_BTN') }).click();
      await page.waitForURL(new RegExp(`/feature/pm/project/${projectId}/edit`));
    } finally {
      for (const p of ['**/api/pm/ai/pipeline/preview', '**/api/pm/ai/pipeline/execute-async', '**/api/pm/ai/pipeline/jobs/e2e-job']) await page.unroute(p);
    }
  });

  test('a failed preview shows the error and stays on step 1', async () => {
    const { page } = ui;
    await page.route('**/api/pm/ai/pipeline/preview', chat({ message: 'E2E wizard failed' }, 400));
    try {
      await ui.visit('/feature/pm/project');
      await page.getByRole('button', { name: t('PMRT02_CREATE_WITH_AI_BTN') }).first().click();
      const modal = page.locator('.ai-wizard-modal');
      const preview = modal.getByRole('button', { name: t('AIWIZARD_PREVIEW_BTN') });
      await expect(preview).toBeDisabled(); // nothing typed yet
      await modal.getByPlaceholder(t('AIWIZARD_BRIEF_PLACEHOLDER')).fill('E2E wizard brief');
      await preview.click();
      await expect(page.getByText('E2E wizard failed').first()).toBeVisible({ timeout: 15_000 });
      await page.getByRole('button', { name: /^(OK|ตกลง)$/ }).last().click({ timeout: 3000 }).catch(() => {});
      await expect(modal.getByPlaceholder(t('AIWIZARD_BRIEF_PLACEHOLDER'))).toBeVisible();
    } finally {
      await page.unroute('**/api/pm/ai/pipeline/preview');
    }
  });
});
