import { chromium } from '@playwright/test';

const testRoutes = [
  { page: 8, url: '/management/profile' },
  { page: 10, url: '/feature/pm/notifications' },
  { page: 14, url: '/feature/pm/executive-dashboard' },
  { page: 15, url: '/feature/bu/info' },
  { page: 16, url: '/feature/bu/team' },
  { page: 17, url: '/feature/bu/role' },
  { page: 18, url: '/feature/bu/program' },
  { page: 19, url: '/feature/bu/permission' },
  { page: 20, url: '/feature/bu/approval-flow' },
  { page: 21, url: '/feature/bu/ai-model-config' },
  { page: 22, url: '/feature/pm/customer' },
  { page: 23, url: '/feature/pm/contract' },
  { page: 24, url: '/feature/pm/project' },
  { page: 25, url: '/feature/pm/phase' },
  { page: 26, url: '/feature/pm/gantt' },
  { page: 27, url: '/feature/pm/calendar' },
  { page: 28, url: '/feature/pm/requirement' },
  { page: 29, url: '/feature/pm/diagram' },
  { page: 30, url: '/feature/pm/specification' },
  { page: 31, url: '/feature/pm/design-review' },
  { page: 32, url: '/feature/pm/task-board' },
  { page: 33, url: '/feature/pm/test-management' },
  { page: 34, url: '/feature/pm/manual' },
  { page: 35, url: '/feature/pm/delivery' },
  { page: 36, url: '/feature/pm/invoice' },
  { page: 37, url: '/feature/pm/ma-ticket' },
  { page: 38, url: '/feature/pm/change-request' },
  { page: 39, url: '/feature/pm/approval' },
  { page: 40, url: '/feature/pm/discussion' },
  { page: 41, url: '/feature/pm/version' },
  { page: 42, url: '/feature/pm/audit' },
  { page: 43, url: '/feature/bu/activity-log' },
];

async function checkAll() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:4200/feature/dashboard');
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await page.waitForTimeout(2000);

  for (const r of testRoutes) {
    await page.goto('http://localhost:4200' + r.url);
    await page.waitForTimeout(1000);
    const count = await page.locator('sic-card').count();
    console.log(`P${r.page} (${r.url}): sic-card count = ${count}`);
  }

  await browser.close();
}

checkAll().catch(console.error);
