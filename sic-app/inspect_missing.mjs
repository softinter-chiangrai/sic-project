import { chromium } from '@playwright/test';

async function checkContainers() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:4200/feature/dashboard');
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await page.waitForTimeout(2000);

  const targets = [
    { p: 8, url: '/management/profile' },
    { p: 27, url: '/feature/pm/calendar' },
    { p: 31, url: '/feature/pm/design-review' },
    { p: 33, url: '/feature/pm/test-management' },
    { p: 37, url: '/feature/pm/ma-ticket' },
    { p: 39, url: '/feature/pm/approval' },
    { p: 41, url: '/feature/pm/version' },
    { p: 42, url: '/feature/pm/audit' },
  ];

  for (const t of targets) {
    await page.goto('http://localhost:4200' + t.url);
    await page.waitForTimeout(1000);
    // Find what is inside main
    const el = page.locator('main > div:nth-child(2), main .overflow-auto, main').first();
    const box = await el.boundingBox();
    console.log(`P${t.p} (${t.url}): w=${Math.round(box.width)}, h=${Math.round(box.height)}, x=${Math.round(box.x)}, y=${Math.round(box.y)}`);
  }
  await browser.close();
}

checkContainers().catch(console.error);
