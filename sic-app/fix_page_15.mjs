import { chromium } from '@playwright/test';

async function fixModalText() {
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
  await page.waitForTimeout(2000);

  // Visit project new & open AI modal
  await page.goto('http://localhost:4200/feature/pm/project/new');
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("สร้างด้วย AI")').click();
  await page.waitForTimeout(1000);

  // Fill the first textarea inside modal
  const ta = page.locator('textarea').first();
  await ta.fill('พัฒนาระบบบริหารจัดการคลังสินค้าอัจฉริยะ (Smart WMS) เชื่อมต่ออุปกรณ์สแกนบาร์โค้ดไร้สาย จัดการสินค้าคงคลังหลายสาขา (Multi-Warehouse) และคำนวณเส้นทางจัดส่งสินค้าอัตโนมัติด้วย AI');
  await page.waitForTimeout(1000);

  const file = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/captures/page_15.png';
  await page.screenshot({ path: file });
  console.log('Saved page_15.png with populated textarea!');

  await browser.close();
}

fixModalText().catch(console.error);
