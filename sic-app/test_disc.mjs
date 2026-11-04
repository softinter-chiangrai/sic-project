import { chromium } from '@playwright/test';

async function testDiscussion() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:4200/feature/dashboard');
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:4200/feature/pm/discussion');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/discussion_screen.png' });
  console.log('Saved discussion_screen.png');
  await browser.close();
}

testDiscussion().catch(console.error);
