import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/captures_perfect';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const configs = [
  { page: 8, url: '/management/profile', ratio: 535 / 880, selector: 'form, .card, main' },
  { page: 9, url: '/feature/pm/discussion', ratio: 652 / 880, selector: 'sic-card, .card, main' },
  { page: 10, url: '/feature/pm/notifications', ratio: 676 / 880, selector: 'sic-card, .card, main' },
  { 
    page: 11, 
    url: '/feature/pm/executive-dashboard', 
    ratio: 559 / 880, 
    action: async (p) => {
      const fab = p.locator('button.ai-nav-fab, button:has-text("AI")').first();
      if (await fab.count() > 0) {
        await fab.click().catch(() => {});
        await p.waitForTimeout(1000);
      }
    },
    selector: '.ai-nav-drawer, sic-ai-navigator, aside, main' 
  },
  { 
    page: 12, 
    url: '/feature/pm/project/new', 
    ratio: 1148 / 880, 
    action: async (p) => {
      const btn = p.locator('button:has-text("สร้างด้วย AI")').first();
      if (await btn.count() > 0) {
        await btn.click().catch(() => {});
        await p.waitForTimeout(1000);
      }
      const ta = p.locator('textarea').first();
      if (await ta.count() > 0) {
        await ta.fill('พัฒนาระบบคลังสินค้าและจัดส่งอัจฉริยะ (Smart Logistics Platform) พร้อมระบบสแกนบาร์โค้ด IoT และ AI Route Optimization สำหรับจัดสายรถขนส่งสินค้าอัตโนมัติ');
      }
    },
    selector: 'div[role="dialog"], .modal-content, .p-dialog, form, main' 
  },
  { 
    page: 13, 
    url: '/feature/pm/executive-dashboard', 
    ratio: 714 / 880, 
    action: async (p) => {
      const sw = p.locator('sic-context-switcher button, sic-context-switcher').first();
      if (await sw.count() > 0) {
        await sw.click().catch(() => {});
        await p.waitForTimeout(1000);
      }
    },
    selector: 'sic-context-switcher, sic-card, main' 
  },
  { page: 14, url: '/feature/pm/executive-dashboard', ratio: 1920 / 749, selector: 'sic-card, main' },
  { page: 15, url: '/feature/bu/info', ratio: 585 / 880, selector: 'sic-card, form, main' },
  { page: 16, url: '/feature/bu/team', ratio: 1911 / 524, selector: 'sic-card, .card, table, main' },
  { page: 17, url: '/feature/bu/role', ratio: 895 / 880, selector: 'sic-card, main' },
  { page: 18, url: '/feature/bu/program', ratio: 1753 / 880, selector: 'sic-card, main' },
  { page: 19, url: '/feature/bu/permission', ratio: 1738 / 880, selector: 'sic-card, main' },
  { page: 20, url: '/feature/bu/approval-flow', ratio: 1920 / 879, selector: 'sic-card, main' },
  { page: 21, url: '/feature/bu/ai-model-config', ratio: 1920 / 688, selector: 'sic-card, main' },
  { page: 22, url: '/feature/pm/customer', ratio: 1919 / 540, selector: 'sic-card, .card, table, main' },
  { page: 23, url: '/feature/pm/contract', ratio: 1920 / 709, selector: 'sic-card, .card, table, main' },
  { page: 24, url: '/feature/pm/project', ratio: 1920 / 565, selector: 'sic-card, .card, table, main' },

  // Part 4: Pages 25 - 37
  { page: 25, url: '/feature/pm/phase', ratio: 1749 / 880, selector: 'sic-card, main' },
  { page: 26, url: '/feature/pm/gantt', ratio: 1564 / 880, selector: 'sic-card, main' },
  { page: 27, url: '/feature/pm/calendar', ratio: 1602 / 880, selector: 'main' },
  { page: 28, url: '/feature/pm/requirement', ratio: 1802 / 880, selector: 'sic-card, main' },
  { page: 29, url: '/feature/pm/diagram', ratio: 1536 / 880, selector: 'sic-card, main' },
  { page: 30, url: '/feature/pm/specification', ratio: 1779 / 880, selector: 'sic-card, main' },
  { page: 31, url: '/feature/pm/design-review', ratio: 1759 / 880, selector: 'main' },
  { page: 32, url: '/feature/pm/task-board', ratio: 1668 / 880, selector: 'sic-card, main' },
  { page: 33, url: '/feature/pm/test-management', ratio: 1745 / 880, selector: 'main' },
  { page: 34, url: '/feature/pm/manual', ratio: 1920 / 804, selector: 'sic-card, main' },
  { page: 35, url: '/feature/pm/delivery', ratio: 1840 / 880, selector: 'sic-card, main' },
  { page: 36, url: '/feature/pm/invoice', ratio: 1844 / 880, selector: 'sic-card, main' },
  { page: 37, url: '/feature/pm/ma-ticket', ratio: 1781 / 880, selector: 'main' },

  // Part 5: Pages 38 - 43
  { page: 38, url: '/feature/pm/change-request', ratio: 1920 / 854, selector: 'sic-card, main' },
  { page: 39, url: '/feature/pm/approval', ratio: 1920 / 718, selector: 'sic-card, main' },
  { page: 40, url: '/feature/pm/discussion', ratio: 1372 / 880, selector: 'sic-card, main' },
  { page: 41, url: '/feature/pm/version', ratio: 1758 / 880, selector: 'main' },
  { page: 42, url: '/feature/pm/audit', ratio: 1781 / 880, selector: 'main' },
  { page: 43, url: '/feature/bu/activity-log', ratio: 1701 / 880, selector: 'sic-card, main' }
];

async function run() {
  console.log('Starting full 36-page capture...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  // Login
  console.log('Logging in...');
  await page.goto('http://localhost:4200/feature/dashboard');
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/, { timeout: 25000 });
  await page.waitForTimeout(3000);
  console.log('Logged in successfully!');

  for (const cfg of configs) {
    const outFile = path.join(outDir, `page_${cfg.page}.png`);
    console.log(`[P${cfg.page}] Capturing ${cfg.url} (ratio ${cfg.ratio.toFixed(2)})...`);

    try {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:4200' + cfg.url);
      await page.waitForTimeout(1500);

      if (cfg.action) {
        try {
          await cfg.action(page);
        } catch (e) {
          console.warn(`  Action failed for P${cfg.page}:`, e.message);
        }
        await page.waitForTimeout(800);
      }

      let el = page.locator(cfg.selector).first();
      let count = await el.count();
      if (count === 0) {
        el = page.locator('main').first();
      }

      let box = await el.boundingBox();
      if (!box || box.width <= 0 || box.height <= 0) {
        el = page.locator('body').first();
        box = await el.boundingBox();
      }

      const elRatio = box.width / box.height;
      let clip;
      if (elRatio > cfg.ratio) {
        // Wider than frame -> extend height, keep top fixed so header is not cut off
        const targetHeight = box.width / cfg.ratio;
        clip = {
          x: Math.max(0, box.x),
          y: Math.max(0, box.y),
          width: box.width,
          height: targetHeight
        };
      } else {
        // Taller than frame -> extend width centered
        const targetWidth = box.height * cfg.ratio;
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
      await page.waitForTimeout(200);

      await page.screenshot({ path: outFile, clip });
      console.log(`  -> OK: ${outFile} (${Math.round(clip.width)}x${Math.round(clip.height)}, ratio: ${(clip.width/clip.height).toFixed(2)})`);
    } catch (err) {
      console.error(`  -> ERROR P${cfg.page}:`, err.message);
    }
  }

  await browser.close();
  console.log('Finished capturing all 36 pages!');
}

run().catch(console.error);
