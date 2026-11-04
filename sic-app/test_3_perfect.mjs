import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function testCap() {
  const browser = await chromium.launch({ headless: true });
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
  await page.waitForTimeout(2500);

  // Helper to capture target ratio
  async function captureCard(url, targetRatio, outPath) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:4200' + url);
    await page.waitForTimeout(2000);

    let el = page.locator('sic-card').first();
    if (await el.count() === 0) el = page.locator('main').first();

    const box = await el.boundingBox();
    console.log(`${url} box:`, box);

    const elRatio = box.width / box.height;
    let clip;
    if (elRatio > targetRatio) {
      const targetHeight = box.width / targetRatio;
      clip = {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: box.width,
        height: targetHeight
      };
    } else {
      const targetWidth = box.height * targetRatio;
      clip = {
        x: Math.max(0, box.x - (targetWidth - box.width) / 2),
        y: Math.max(0, box.y),
        width: targetWidth,
        height: box.height
      };
    }

    const reqW = Math.ceil(Math.max(1920, clip.x + clip.width + 50));
    const reqH = Math.ceil(Math.max(1080, clip.y + clip.height + 50));
    await page.setViewportSize({ width: reqW, height: reqH });
    await page.waitForTimeout(300);

    await page.screenshot({ path: outPath, clip });
    console.log(`Saved ${outPath} -> clip: ${Math.round(clip.width)}x${Math.round(clip.height)}, ratio: ${(clip.width/clip.height).toFixed(2)}`);
  }

  // Page 16: Frame 1911 x 524 (ratio 3.6469)
  await captureCard('/feature/bu/team', 1911 / 524, 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/perfect_p16.png');

  // Page 25: Frame 1749 x 880 (ratio 1.9875)
  await captureCard('/feature/pm/phase', 1749 / 880, 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/perfect_p25.png');

  // Page 26: Frame 1564 x 880 (ratio 1.7773)
  await captureCard('/feature/pm/gantt', 1564 / 880, 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/perfect_p26.png');

  await browser.close();
}

testCap().catch(console.error);
