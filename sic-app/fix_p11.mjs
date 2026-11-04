import { chromium } from '@playwright/test';

async function fixP11() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:4200/feature/dashboard');
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await page.waitForTimeout(2500);

  await page.goto('http://localhost:4200/feature/pm/executive-dashboard');
  await page.waitForTimeout(1500);

  // Click fab via evaluate
  await page.evaluate(() => {
    const fab = document.querySelector('button.ai-nav-fab');
    if (fab) fab.click();
  });
  await page.waitForTimeout(1000);

  const drawer = page.locator('.ai-nav-drawer').first();
  await drawer.screenshot({ path: 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/captures_clean/page_11.png' });
  console.log('Fixed page_11.png with open AI Navigator drawer!');

  await browser.close();
}

fixP11().catch(console.error);
