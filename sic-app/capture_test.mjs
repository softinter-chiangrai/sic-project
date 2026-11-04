import { chromium } from '@playwright/test';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5
  });
  const page = await context.newPage();

  console.log('Navigating to /feature/dashboard...');
  await page.goto('http://localhost:4200/feature/dashboard');
  
  console.log('Waiting for login form...');
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  
  console.log('Filling login form...');
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();

  console.log('Waiting for app redirect after login...');
  await page.waitForURL(/localhost:4200\/(?!auth)/, { timeout: 25000 });
  console.log('Logged in successfully! Current URL:', page.url());

  // Wait for Angular components & data to render
  await page.waitForTimeout(4000);

  // Navigate to executive dashboard
  console.log('Visiting /feature/pm/executive-dashboard...');
  await page.goto('http://localhost:4200/feature/pm/executive-dashboard');
  await page.waitForTimeout(5000);

  const outPath = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/exec_dash.png';
  await page.screenshot({ path: outPath });
  console.log('Screenshot saved to:', outPath);

  await browser.close();
}

test().catch(console.error);
