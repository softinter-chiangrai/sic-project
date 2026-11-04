import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/captures_clean';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const pages = [
  // Part 1: Pages 8 - 14
  {
    page: 8,
    url: '/management/profile',
    title: 'User Profile',
    capture: async (page, outFile) => {
      const form = page.locator('form, .card, main').first();
      await form.waitFor({ state: 'visible', timeout: 5000 });
      await form.screenshot({ path: outFile });
    }
  },
  {
    page: 9,
    url: '/feature/pm/discussion',
    title: 'Team Chat',
    capture: async (page, outFile) => {
      const card = page.locator('sic-card, .card, main').first();
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.screenshot({ path: outFile });
    }
  },
  {
    page: 10,
    url: '/feature/pm/notifications',
    title: 'Notification Center',
    capture: async (page, outFile) => {
      const card = page.locator('sic-card, .card, main').first();
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.screenshot({ path: outFile });
    }
  },
  {
    page: 11,
    url: '/feature/pm/executive-dashboard',
    title: 'AI Navigator Assistant',
    capture: async (page, outFile) => {
      const fab = page.locator('button.ai-nav-fab, button:has-text("AI")').first();
      if (await fab.count() > 0) {
        await fab.click();
        await page.waitForTimeout(1000);
      }
      const drawer = page.locator('.ai-nav-drawer, sic-ai-navigator > div, aside, main').first();
      await drawer.screenshot({ path: outFile });
    }
  },
  {
    page: 12,
    url: '/feature/pm/project/new',
    title: 'AI Full-Project Generator Modal',
    capture: async (page, outFile) => {
      const btn = page.locator('button:has-text("สร้างด้วย AI")').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1000);
      }
      const ta = page.locator('textarea').first();
      if (await ta.count() > 0) {
        await ta.fill('พัฒนาระบบบริหารจัดการคลังสินค้าอัจฉริยะ (Smart WMS) เชื่อมต่ออุปกรณ์สแกนบาร์โค้ดไร้สาย จัดการสินค้าคงคลังหลายสาขา (Multi-Warehouse) และคำนวณเส้นทางจัดส่งสินค้าอัตโนมัติด้วย AI');
        await page.waitForTimeout(500);
      }
      const dialog = page.locator('div[role="dialog"], .modal-content, .p-dialog, form').first();
      await dialog.screenshot({ path: outFile });
    }
  },
  {
    page: 13,
    url: '/feature/pm/executive-dashboard',
    title: 'Context Switcher',
    capture: async (page, outFile) => {
      const sw = page.locator('sic-context-switcher button, sic-context-switcher').first();
      if (await sw.count() > 0) {
        await sw.click();
        await page.waitForTimeout(800);
      }
      const el = page.locator('sic-context-switcher, sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 14,
    url: '/feature/pm/executive-dashboard',
    title: 'Executive SDLC Dashboard',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },

  // Part 2: Pages 15 - 21
  {
    page: 15,
    url: '/feature/bu/info',
    title: 'Organization Master Data',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, form, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 16,
    url: '/feature/bu/team',
    title: 'Team & User Management',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card').first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 17,
    url: '/feature/bu/role',
    title: 'Role Hierarchy',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 18,
    url: '/feature/bu/program',
    title: 'Program & Route Catalog',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 19,
    url: '/feature/bu/permission',
    title: 'Role Permissions Matrix',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 20,
    url: '/feature/bu/approval-flow',
    title: 'Approval Flow Configuration',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 21,
    url: '/feature/bu/ai-model-config',
    title: 'AI Hub Model Management',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card').first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      await el.screenshot({ path: outFile });
    }
  },

  // Part 3: Pages 22 - 24
  {
    page: 22,
    url: '/feature/pm/customer',
    title: 'Customer Master Data',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card').first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 23,
    url: '/feature/pm/contract',
    title: 'Contract Management',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card').first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 24,
    url: '/feature/pm/project',
    title: 'Project Master Data',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card').first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      await el.screenshot({ path: outFile });
    }
  },

  // Part 4: Pages 25 - 37
  {
    page: 25,
    url: '/feature/pm/phase',
    title: 'SDLC Phases & Milestones',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 26,
    url: '/feature/pm/gantt',
    title: 'Gantt Chart & Project Timeline',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 27,
    url: '/feature/pm/calendar',
    title: 'Project Task Calendar',
    capture: async (page, outFile) => {
      const el = page.locator('main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 28,
    url: '/feature/pm/requirement',
    title: 'Requirement Management',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 29,
    url: '/feature/pm/diagram',
    title: 'Diagram Designer Studio',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 30,
    url: '/feature/pm/specification',
    title: 'System Specifications',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 31,
    url: '/feature/pm/design-review',
    title: 'Design Review & Figma Integration',
    capture: async (page, outFile) => {
      const el = page.locator('main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 32,
    url: '/feature/pm/task-board',
    title: 'Task Board & Kanban Traceability',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 33,
    url: '/feature/pm/test-management',
    title: 'Test Cases SIT/UAT',
    capture: async (page, outFile) => {
      const el = page.locator('main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 34,
    url: '/feature/pm/manual',
    title: 'User Manual Builder',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 35,
    url: '/feature/pm/delivery',
    title: 'Delivery & Phase Sign-off',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 36,
    url: '/feature/pm/invoice',
    title: 'Invoice & Billing Management',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 37,
    url: '/feature/pm/ma-ticket',
    title: 'Maintenance Support Tickets',
    capture: async (page, outFile) => {
      const el = page.locator('main').first();
      await el.screenshot({ path: outFile });
    }
  },

  // Part 5: Pages 38 - 43
  {
    page: 38,
    url: '/feature/pm/change-request',
    title: 'Change Request / CR Management',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 39,
    url: '/feature/pm/approval',
    title: 'Approval Hub',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 40,
    url: '/feature/pm/discussion',
    title: 'Project Context Discussion Feed',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 41,
    url: '/feature/pm/version',
    title: 'Document Version Control',
    capture: async (page, outFile) => {
      const el = page.locator('main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 42,
    url: '/feature/pm/audit',
    title: 'System Audit Log',
    capture: async (page, outFile) => {
      const el = page.locator('main').first();
      await el.screenshot({ path: outFile });
    }
  },
  {
    page: 43,
    url: '/feature/bu/activity-log',
    title: 'Activity Notification Feed',
    capture: async (page, outFile) => {
      const el = page.locator('sic-card, main').first();
      await el.screenshot({ path: outFile });
    }
  }
];

async function main() {
  console.log('Launching browser for 36 clean captures...');
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

  for (const item of pages) {
    const outFile = path.join(outDir, `page_${item.page}.png`);
    console.log(`[P${item.page}] ${item.title} -> ${item.url}...`);
    try {
      await page.goto('http://localhost:4200' + item.url);
      await page.waitForTimeout(1800);
      await item.capture(page, outFile);
      console.log(`  -> Saved: ${outFile}`);
    } catch (err) {
      console.error(`  -> Failed P${item.page}:`, err.message);
      // fallback to main screenshot
      try {
        await page.locator('main, body').first().screenshot({ path: outFile });
        console.log(`  -> Fallback saved: ${outFile}`);
      } catch (e2) {}
    }
  }

  await browser.close();
  console.log('Done! All 36 clean screenshots ready.');
}

main().catch(console.error);
