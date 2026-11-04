import { chromium } from '@playwright/test';

async function testP16() {
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

  await page.goto('http://localhost:4200/feature/bu/team');
  await page.waitForTimeout(2000);
  const card = page.locator('sic-card').first();
  await card.screenshot({ path: 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/test_p16_card.png' });
  console.log('Saved test_p16_card.png');
  await browser.close();
}

testP16().catch(console.error);
