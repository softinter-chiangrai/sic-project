import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4200...');
  await page.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('Current URL:', page.url());
  if (page.url().includes('8080') || page.url().includes('realms')) {
    console.log('Filling Keycloak login...');
    await page.fill('input[name="username"]', 'phurin');
    await page.fill('input[name="password"]', 'phurin192547');
    await page.click('#kc-login, input[type="submit"], button[type="submit"]');
    console.log('Submitted login. Waiting for navigation back...');
    await page.waitForURL(url => url.origin === 'http://localhost:4200', { timeout: 15000 });
    console.log('Back to app! URL:', page.url());
  }

  await page.waitForTimeout(4000);
  console.log('Navigating to /feature/pm/executive-dashboard...');
  await page.goto('http://localhost:4200/feature/pm/executive-dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const outPath = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/test_dash.png';
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
