import { chromium } from '@playwright/test';

async function testInteractive() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:4200/feature/dashboard');
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await page.waitForTimeout(3000);

  // Test Headchat
  const chatToggle = page.locator('button.headchat-toggle').first();
  console.log('Chat toggle exists:', await chatToggle.count());
  if (await chatToggle.count() > 0) {
    await chatToggle.click();
    await page.waitForTimeout(1000);
    const chatPanel = page.locator('.headchat-panel, .headchat-window, .headchat-root').first();
    console.log('Chat panel box:', await chatPanel.boundingBox());
  }

  // Test AI Nav
  const aiFab = page.locator('button.ai-nav-fab').first();
  console.log('AI Fab exists:', await aiFab.count());
  if (await aiFab.count() > 0) {
    await aiFab.click();
    await page.waitForTimeout(1000);
    const aiDrawer = page.locator('.ai-nav-drawer').first();
    console.log('AI drawer box:', await aiDrawer.boundingBox());
  }

  // Test Project New Modal
  await page.goto('http://localhost:4200/feature/pm/project/new');
  await page.waitForTimeout(2000);
  const aiModalBtn = page.locator('button:has-text("สร้างด้วย AI")').first();
  console.log('AI Modal Btn exists:', await aiModalBtn.count());
  if (await aiModalBtn.count() > 0) {
    await aiModalBtn.click();
    await page.waitForTimeout(1000);
    const modal = page.locator('div[role="dialog"], .modal-content, .p-dialog').first();
    console.log('Modal box:', await modal.boundingBox());
  }

  await browser.close();
}

testInteractive().catch(console.error);
