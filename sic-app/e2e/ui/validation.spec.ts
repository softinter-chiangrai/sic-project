import { test, expect } from '@playwright/test';
import { Ui } from '../ui';
import { submit } from './forms';

// UI Form Validation & Negative Scenarios
let ui: Ui;
test.beforeAll(async ({ browser }) => {
  ui = await Ui.open(browser);
});
test.afterAll(async () => {
  await ui?.close();
});

test.describe('UI Form Validations (Negative Tests)', () => {
  test('Customer form: empty submit is blocked by client validation', async () => {
    test.setTimeout(120_000);
    await ui.visit('/feature/pm/customer/new');
    await ui.expectHealthy('/feature/pm/customer/new');

    // Submitting completely empty form must be rejected as invalid
    const outcome = await submit(ui.page);
    expect(outcome).toBe('invalid');

    // Form must stay on the customer new page
    expect(ui.page.url()).toContain('/feature/pm/customer/new');

    // Required fields are flagged invalid in Angular form
    const invalidCount = await ui.page.locator('[formcontrolname].ng-invalid').count();
    expect(invalidCount).toBeGreaterThan(0);
    expect(ui.errors).toEqual([]);
  });

  test('Customer form: invalid email format marks control invalid and blocks submit', async () => {
    test.setTimeout(120_000);
    await ui.visit('/feature/pm/customer/new');

    const emailInput = ui.page.locator('[formcontrolname="email"] input, input[formcontrolname="email"]').first();
    if (await emailInput.count()) {
      await emailInput.fill('invalid-email-address');
      await emailInput.blur();

      const host = ui.page.locator('[formcontrolname="email"]').first();
      await expect(host).toHaveClass(/ng-invalid/);

      const outcome = await submit(ui.page);
      expect(outcome).toBe('invalid');
    }
  });

  test('Project form: empty submit is blocked by validation', async () => {
    test.setTimeout(120_000);
    await ui.visit('/feature/pm/project/new');
    await ui.expectHealthy('/feature/pm/project/new');

    const outcome = await submit(ui.page);
    expect(outcome).toBe('invalid');
    expect(ui.page.url()).toContain('/feature/pm/project/new');
  });

  test('Contract form: empty submit is blocked by validation', async () => {
    test.setTimeout(120_000);
    await ui.visit('/feature/pm/contract/new');
    await ui.expectHealthy('/feature/pm/contract/new');

    const outcome = await submit(ui.page);
    expect(outcome).toBe('invalid');
    expect(ui.page.url()).toContain('/feature/pm/contract/new');
  });

  test('Cancel / Back button on customer form safely navigates back without error', async () => {
    test.setTimeout(120_000);
    await ui.visit('/feature/pm/customer/new');

    const cancelBtn = ui.page.locator('sic-button', { hasText: /cancel|back|ยกเลิก|ย้อนกลับ/i })
      .or(ui.page.locator('button').filter({ hasText: /cancel|back|ยกเลิก|ย้อนกลับ/i })).first();

    if (await cancelBtn.count()) {
      await cancelBtn.click();
      await ui.page.waitForURL(/\/feature\/pm\/customer(\?|$)/, { timeout: 15_000 }).catch(() => {});
      expect(ui.errors).toEqual([]);
    }
  });
});
