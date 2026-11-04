import { chromium } from '@playwright/test';

async function testInspect() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:4200/feature/dashboard');
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/, { timeout: 25000 });
  await page.waitForTimeout(3000);

  const routes = [
    { name: 'P16 Team', url: '/feature/bu/team' },
    { name: 'P21 AI Hub', url: '/feature/bu/ai-model-config' },
    { name: 'P22 Customer', url: '/feature/pm/customer' },
    { name: 'P23 Contract', url: '/feature/pm/contract' },
    { name: 'P24 Project', url: '/feature/pm/project' },
    { name: 'P25 Phase', url: '/feature/pm/phase' },
    { name: 'P26 Gantt', url: '/feature/pm/gantt' },
    { name: 'P27 Calendar', url: '/feature/pm/calendar' },
    { name: 'P39 Approval', url: '/feature/pm/approval' }
  ];

  for (const r of routes) {
    await page.goto('http://localhost:4200' + r.url);
    await page.waitForTimeout(2000);
    const card = page.locator('sic-card');
    if (await card.count() > 0) {
      const box = await card.first().boundingBox();
      console.log(`${r.name} -> sic-card: w=${Math.round(box.width)}, h=${Math.round(box.height)}, ratio=${(box.width/box.height).toFixed(2)}`);
    } else {
      const mainBox = await page.locator('main').boundingBox();
      console.log(`${r.name} -> main: w=${Math.round(mainBox.width)}, h=${Math.round(mainBox.height)}, ratio=${(mainBox.width/mainBox.height).toFixed(2)}`);
    }
  }

  await browser.close();
}

testInspect().catch(console.error);
