import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/captures_perfect';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const pagesConfig = [
  // Part 1: Pages 8 - 14
  {
    page: 8,
    url: '/management/profile',
    ratio: 535 / 880,
    title: 'User Profile',
    selector: 'form',
    align: 'top'
  },
  {
    page: 9,
    url: '/feature/pm/discussion',
    ratio: 652 / 880,
    title: 'Team Chat',
    selector: 'sic-card, .card, main',
    align: 'top'
  },
  {
    page: 10,
    url: '/feature/pm/notifications',
    ratio: 676 / 880,
    title: 'Notification Center',
    selector: 'sic-card, .card, main',
    align: 'top'
  },
  {
    page: 11,
    url: '/feature/pm/executive-dashboard',
    ratio: 559 / 880,
    title: 'AI Navigator',
    action: async (p) => {
      const btn = p.locator('button:has-text("AI"), .ai-btn, sic-ai-navigator button').first();
      await btn.click().catch(() => {});
      await p.waitForTimeout(1000);
    },
    selector: 'sic-ai-navigator .drawer, sic-ai-navigator > div, sic-ai-navigator, aside.ai-nav',
    fallbackSelector: 'main',
    align: 'top'
  },
  {
    page: 12,
    url: '/feature/pm/project/new',
    ratio: 1148 / 880,
    title: 'AI Generator Modal',
    action: async (p) => {
      const aiBtn = p.locator('button:has-text("สร้างด้วย AI"), button:has-text("AI")').first();
      if (await aiBtn.count() > 0) {
        await aiBtn.click();
        await p.waitForTimeout(1000);
      }
      const textarea = p.locator('textarea').first();
      if (await textarea.count() > 0) {
        await textarea.fill('พัฒนาระบบคลังสินค้าและจัดส่งอัจฉริยะ (Smart Logistics Platform) พร้อมระบบสแกนบาร์โค้ด IoT และ AI Route Optimization สำหรับจัดสายรถขนส่งสินค้าอัตโนมัติ');
      }
    },
    selector: '.modal-content, .modal-dialog, p-dialog, div[role="dialog"], form',
    fallbackSelector: 'main',
    align: 'center'
  },
  {
    page: 13,
    url: '/feature/pm/executive-dashboard',
    ratio: 714 / 880,
    title: 'Context Switcher',
    action: async (p) => {
      const sw = p.locator('sic-context-switcher button, sic-context-switcher').first();
      await sw.click().catch(() => {});
      await p.waitForTimeout(1000);
    },
    selector: 'sic-context-switcher, sic-card, main',
    align: 'top'
  },
  {
    page: 14,
    url: '/feature/pm/executive-dashboard',
    ratio: 1920 / 749,
    title: 'Executive Dashboard',
    selector: 'sic-card, main',
    align: 'top'
  },

  // Part 2: Pages 15 - 21
  {
    page: 15,
    url: '/feature/bu/info',
    ratio: 585 / 880,
    title: 'Organization Info',
    selector: 'sic-card, form, main',
    align: 'top'
  },
  {
    page: 16,
    url: '/feature/bu/team',
    ratio: 1911 / 524,
    title: 'Team Management',
    selector: 'sic-card, .card, table',
    align: 'top'
  },
  {
    page: 17,
    url: '/feature/bu/role',
    ratio: 895 / 880,
    title: 'Role Hierarchy',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 18,
    url: '/feature/bu/program',
    ratio: 1753 / 880,
    title: 'Program Catalog',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 19,
    url: '/feature/bu/permission',
    ratio: 1738 / 880,
    title: 'Role Permissions Matrix',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 20,
    url: '/feature/bu/approval-flow',
    ratio: 1920 / 879,
    title: 'Approval Flow Config',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 21,
    url: '/feature/bu/ai-model-config',
    ratio: 1920 / 688,
    title: 'AI Model Hub',
    selector: 'sic-card, main',
    align: 'top'
  },

  // Part 3: Pages 22 - 24
  {
    page: 22,
    url: '/feature/pm/customer',
    ratio: 1919 / 540,
    title: 'Customer Master Data',
    selector: 'sic-card, .card, table',
    align: 'top'
  },
  {
    page: 23,
    url: '/feature/pm/contract',
    ratio: 1920 / 709,
    title: 'Contract Management',
    selector: 'sic-card, .card, table',
    align: 'top'
  },
  {
    page: 24,
    url: '/feature/pm/project',
    ratio: 1920 / 565,
    title: 'Project Master Data',
    selector: 'sic-card, .card, table',
    align: 'top'
  },

  // Part 4: Pages 25 - 37
  {
    page: 25,
    url: '/feature/pm/phase',
    ratio: 1749 / 880,
    title: 'SDLC Phases & Milestones',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 26,
    url: '/feature/pm/gantt',
    ratio: 1564 / 880,
    title: 'Gantt Chart & Timeline',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 27,
    url: '/feature/pm/calendar',
    ratio: 1602 / 880,
    title: 'Project Task Calendar',
    selector: 'main',
    align: 'top'
  },
  {
    page: 28,
    url: '/feature/pm/requirement',
    ratio: 1802 / 880,
    title: 'Requirement Management',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 29,
    url: '/feature/pm/diagram',
    ratio: 1536 / 880,
    title: 'Diagram Designer Studio',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 30,
    url: '/feature/pm/specification',
    ratio: 1779 / 880,
    title: 'System Specifications',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 31,
    url: '/feature/pm/design-review',
    ratio: 1759 / 880,
    title: 'Design Review & Figma',
    selector: 'main',
    align: 'top'
  },
  {
    page: 32,
    url: '/feature/pm/task-board',
    ratio: 1668 / 880,
    title: 'Task Board & Traceability',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 33,
    url: '/feature/pm/test-management',
    ratio: 1745 / 880,
    title: 'Test Cases SIT/UAT',
    selector: 'main',
    align: 'top'
  },
  {
    page: 34,
    url: '/feature/pm/manual',
    ratio: 1920 / 804,
    title: 'User Manual Builder',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 35,
    url: '/feature/pm/delivery',
    ratio: 1840 / 880,
    title: 'Delivery & Phase Sign-off',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 36,
    url: '/feature/pm/invoice',
    ratio: 1844 / 880,
    title: 'Invoice & Billing Management',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 37,
    url: '/feature/pm/ma-ticket',
    ratio: 1781 / 880,
    title: 'Maintenance Tickets',
    selector: 'main',
    align: 'top'
  },

  // Part 5: Pages 38 - 43
  {
    page: 38,
    url: '/feature/pm/change-request',
    ratio: 1920 / 854,
    title: 'Change Request Management',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 39,
    url: '/feature/pm/approval',
    ratio: 1920 / 718,
    title: 'Approval Hub',
    selector: 'main',
    align: 'top'
  },
  {
    page: 40,
    url: '/feature/pm/discussion',
    ratio: 1372 / 880,
    title: 'Project Discussion Feed',
    selector: 'sic-card, main',
    align: 'top'
  },
  {
    page: 41,
    url: '/feature/pm/version',
    ratio: 1758 / 880,
    title: 'Document Version Control',
    selector: 'main',
    align: 'top'
  },
  {
    page: 42,
    url: '/feature/pm/audit',
    ratio: 1781 / 880,
    title: 'System Audit Log',
    selector: 'main',
    align: 'top'
  },
  {
    page: 43,
    url: '/feature/bu/activity-log',
    ratio: 1701 / 880,
    title: 'Activity Feed',
    selector: 'sic-card, main',
    align: 'top'
  }
];

async function captureAllPerfect() {
  console.log('Launching Chromium for perfect aspect-ratio captures...');
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
  console.log('Login successful!');

  for (const cfg of pagesConfig) {
    const file = path.join(outDir, `page_${cfg.page}.png`);
    console.log(`[P${cfg.page}] ${cfg.title} (target ratio ${cfg.ratio.toFixed(2)})...`);

    try {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:4200' + cfg.url);
      await page.waitForTimeout(1500);

      if (cfg.action) {
        await cfg.action(page);
        await page.waitForTimeout(1000);
      }

      // Find element
      let el = page.locator(cfg.selector).first();
      let hasEl = (await el.count()) > 0;
      if (!hasEl && cfg.fallbackSelector) {
        el = page.locator(cfg.fallbackSelector).first();
        hasEl = (await el.count()) > 0;
      }
      if (!hasEl) {
        el = page.locator('main').first();
      }

      const box = await el.boundingBox();
      if (!box || box.width <= 0 || box.height <= 0) {
        console.warn(`  Warning: element has invalid box, falling back to full page`);
        await page.screenshot({ path: file });
        continue;
      }

      // Calculate exact clip matching target ratio
      const elRatio = box.width / box.height;
      let clip;

      if (elRatio > cfg.ratio) {
        // Element is wider than target frame -> needs more height
        // Keep top at box.y so header is NEVER cropped!
        const targetHeight = box.width / cfg.ratio;
        clip = {
          x: Math.max(0, box.x),
          y: Math.max(0, box.y),
          width: box.width,
          height: targetHeight
        };
      } else {
        // Element is taller than target frame -> needs more width
        const targetWidth = box.height * cfg.ratio;
        clip = {
          x: Math.max(0, box.x - (targetWidth - box.width) / 2),
          y: Math.max(0, box.y),
          width: targetWidth,
          height: box.height
        };
      }

      // Ensure viewport is large enough to cover the clip
      const reqW = Math.ceil(Math.max(1920, clip.x + clip.width + 50));
      const reqH = Math.ceil(Math.max(1080, clip.y + clip.height + 50));
      await page.setViewportSize({ width: reqW, height: reqH });
      await page.waitForTimeout(300);

      await page.screenshot({ path: file, clip });
      console.log(`  -> Saved ${file} (clip: ${Math.round(clip.width)}x${Math.round(clip.height)}, ratio: ${(clip.width/clip.height).toFixed(2)})`);
    } catch (err) {
      console.error(`  -> Failed P${cfg.page}:`, err.message);
    }
  }

  await browser.close();
  console.log('All 36 perfect screenshots captured!');
}

captureAllPerfect().catch(console.error);
