import { chromium } from '@playwright/test';

async function testSelectors() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:4200/feature/dashboard');
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await page.waitForTimeout(3000);

  // Check P8: /management/profile
  await page.goto('http://localhost:4200/management/profile');
  await page.waitForTimeout(2000);
  console.log('P8 card count:', await page.locator('sic-card, .card, form').count());

  // Check P9: Chat
  await page.goto('http://localhost:4200/feature/pm/executive-dashboard');
  await page.waitForTimeout(1500);
  const chatBtn = page.locator('button[title*="แชท"], button:has-text("แชท"), .bi-chat, .bi-chat-dots, sic-headchat button');
  console.log('Chat button count:', await chatBtn.count());

  // Check P10: Notification
  const notifBtn = page.locator('button[title*="แจ้งเตือน"], .bi-bell, sic-notification button, button:has(.bi-bell)');
  console.log('Notif button count:', await notifBtn.count());

  // Check P11: AI Navigator
  const aiBtn = page.locator('button:has-text("AI"), sic-ai-navigator button, .ai-btn');
  console.log('AI button count:', await aiBtn.count());

  // Check P13: Context switcher
  const switcher = page.locator('sic-context-switcher button, sic-context-switcher');
  console.log('Context switcher count:', await switcher.count());

  await browser.close();
}

testSelectors().catch(console.error);
