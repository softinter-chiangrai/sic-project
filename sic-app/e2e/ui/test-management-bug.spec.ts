import { test, expect } from '@playwright/test';
import { World, today } from '../api/world';
import { mock } from '../api';
import { Ui } from '../ui';

let w: World;
let ui: Ui;

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  ui = await Ui.open(browser);
});

test.afterAll(async () => {
  await w?.cleanup();
  await ui?.close();
});

test.describe('UI: Test Management Failed Test & Bug Creation', () => {
  test('Failed test case displays "ไม่ผ่าน" badge and prominent "เปิด Bug" button on /feature/pm/test-management', async () => {
    test.setTimeout(60_000);

    const projectId = await w.project();
    const taskId = await w.task();
    const scenarioId = await w.testScenario();

    // Create a failed test case
    const tcCode = mock('TC');
    await w.make('/api/pm/test-cases/save', {
      projectId,
      scenarioId,
      taskId,
      testCaseCode: tcCode,
      title: 'UI E2E Failed Test Case',
      testStep: 'Step 1: Click Login',
      expectedResult: 'Success',
      actualResult: 'Failed with 500 internal server error',
      testStatus: 'FAIL',
      tester: 'QA Tester',
      testDate: today(),
      state: 3,
    }, '/api/pm/test-cases/{id}');

    // Navigate to /feature/pm/test-management?projectId=${projectId}
    await ui.visit(`/feature/pm/test-management?projectId=${projectId}`);

    // Look for our test case row in the table
    const row = ui.page.locator(`tr:has-text("${tcCode}")`).first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    // Assert that status does NOT say "รอ Re-test"
    // Instead it must say "Fail" or "ไม่ผ่าน" (FAIL)
    await expect(row).not.toContainText(/รอ Re-test/i);
    await expect(row).toContainText(/Fail|ไม่ผ่าน/i);

    // Assert that the prominent "เปิด Bug" button is present and visible
    const openBugBtn = row.getByRole('button', { name: /เปิด Bug|Open bug/i }); // th or en UI
    await expect(openBugBtn).toBeVisible();

    // Click "เปิด Bug" and verify navigation to /feature/pm/bug/new
    await openBugBtn.click();
    await ui.page.waitForURL(/bug\/new/);

    // Verify URL contains bug/new with testCaseCode
    expect(ui.page.url()).toContain('/feature/pm/bug/new');
    expect(ui.page.url()).toContain(`testCaseCode=${tcCode}`);
  });
});
