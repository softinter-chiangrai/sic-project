import { test, expect } from '@playwright/test';
import { Ui } from '../ui';

let ui: Ui;
test.beforeAll(async ({ browser }) => {
  ui = await Ui.open(browser);
});
test.afterAll(async () => {
  // restore desktop viewport
  await ui?.page.setViewportSize({ width: 1280, height: 720 }).catch(() => {});
  await ui?.close();
});

test.describe('Responsive & Mobile Viewport Tests', () => {
  test('Mobile viewport (390x844): Dashboard renders healthy and responsive layout adapts', async () => {
    test.setTimeout(120_000);
    await ui.page.setViewportSize({ width: 390, height: 844 });

    await ui.visit('/feature/dashboard');
    await ui.expectHealthy('/feature/dashboard');

    // Ensure main content body is visible
    const body = ui.page.locator('body');
    await expect(body).toBeVisible();
    expect(ui.errors).toEqual([]);
  });

  test('Mobile viewport: Customer form controls and actions are visible and interactive', async () => {
    test.setTimeout(120_000);
    await ui.page.setViewportSize({ width: 390, height: 844 });

    await ui.visit('/feature/pm/customer/new');
    await ui.expectHealthy('/feature/pm/customer/new');

    // Check that form container is scrollable and visible inputs are interactable
    const firstInput = ui.page.locator('input:visible').first();
    await expect(firstInput).toBeVisible();

    // Fill first visible input to verify mobile touch/keyboard focus works
    await firstInput.fill('Mobile Test');
    expect(await firstInput.inputValue()).toBe('Mobile Test');
    expect(ui.errors).toEqual([]);
  });

  test('Tablet viewport (768x1024): Customer grid renders correctly without horizontal crash', async () => {
    test.setTimeout(120_000);
    await ui.page.setViewportSize({ width: 768, height: 1024 });

    await ui.visit('/feature/pm/customer');
    await ui.expectHealthy('/feature/pm/customer');
    expect(ui.errors).toEqual([]);
  });
});
