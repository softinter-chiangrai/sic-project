import { chromium } from '@playwright/test';

async function testVersion() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Login
  await page.goto('http://localhost:4200/feature/dashboard');
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/, { timeout: 25000 });
  await page.waitForTimeout(2000);

  console.log('Navigating to /feature/pm/version...');
  await page.goto('http://localhost:4200/feature/pm/version');
  await page.waitForTimeout(4000);

  const file = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/captures/page_44.png';
  await page.screenshot({ path: file });
  console.log('Saved page_44.png, size:', (await page.content()).length);

  await browser.close();
}

testVersion().catch(console.error);

