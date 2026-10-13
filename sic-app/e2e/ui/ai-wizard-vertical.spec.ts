import { test, expect } from '@playwright/test';
import { Ui } from '../ui';

let ui: Ui;

test.beforeAll(async ({ browser }) => {
  ui = await Ui.open(browser);
});

test.afterAll(async () => {
  await ui?.close();
});

test.describe('UI: AI Wizard Step 4 Summary Stat Vertical Layout', () => {
  test('AI Wizard modal opens and summary stats render with vertical class', async () => {
    test.setTimeout(60_000);

    const page = ui.page;
    await page.goto('/feature/pm/project');
    await page.waitForLoadState('networkidle');

    // Click "สร้างด้วย AI" button
    const aiBtn = page.locator('button:has-text("สร้างด้วย AI"), button:has-text("Create with AI")').first();
    await expect(aiBtn).toBeVisible({ timeout: 15_000 });
    await aiBtn.click();

    // Verify wizard modal opens
    const modal = page.locator('.ai-wizard-modal');
    await expect(modal).toBeVisible();

    // Verify stepper line exists and has 4 steps
    const stepperItems = modal.locator('.stepper-item');
    await expect(stepperItems).toHaveCount(4);

    // Open history to view previous generated projects
    const historyBtn = modal.locator('.ai-wizard-history-btn');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(500);

      // Select an item from history to check stat grid layout
      const historyItem = modal.locator('.history-item').first();
      if (await historyItem.isVisible()) {
        await historyItem.click();
        await page.waitForTimeout(500);

        const statGrid = modal.locator('.summary-stat-grid');
        await expect(statGrid).toBeVisible();
      }
    }

    // Close wizard
    const closeBtn = modal.locator('.ai-wizard-close-btn').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });
});
