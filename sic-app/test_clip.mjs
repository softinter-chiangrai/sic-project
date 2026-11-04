import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function testClip() {
  const browser = await chromium.launch({ headless: true });
  // Canva frame on P16: width 1911, height 524 -> ratio = 1911 / 524 = 3.6469
  const targetRatio = 1911 / 524;

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5,
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

  // Navigate to P16: Team
  await page.goto('http://localhost:4200/feature/bu/team');
  await page.waitForTimeout(2000);

  const card = page.locator('sic-card').first();
  const box = await card.boundingBox();
  console.log('Original card box:', box);

  const cardRatio = box.width / box.height;
  console.log('Card ratio:', cardRatio, 'Target ratio:', targetRatio);

  let clip;
  if (cardRatio > targetRatio) {
    // Card is wider than target frame -> needs more height so top is preserved!
    const targetHeight = box.width / targetRatio;
    clip = {
      x: box.x,
      y: box.y, // top aligns with card header!
      width: box.width,
      height: targetHeight
    };
  } else {
    // Card is taller than target frame -> needs more width centered
    const targetWidth = box.height * targetRatio;
    clip = {
      x: box.x - (targetWidth - box.width) / 2,
      y: box.y,
      width: targetWidth,
      height: box.height
    };
  }

  console.log('Calculated clip:', clip);
  console.log('Clip ratio:', clip.width / clip.height);

  // Ensure viewport is large enough for the clip
  await page.setViewportSize({
    width: Math.ceil(Math.max(1920, clip.x + clip.width + 50)),
    height: Math.ceil(Math.max(1080, clip.y + clip.height + 50))
  });
  await page.waitForTimeout(500);

  const outPath = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/test_p16_clipped.png';
  await page.screenshot({ path: outPath, clip });
  console.log('Saved clipped screenshot to', outPath);

  await browser.close();
}

testClip().catch(console.error);
