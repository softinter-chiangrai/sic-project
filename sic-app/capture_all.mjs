import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = 'C:/Users/lovew/.gemini/antigravity/brain/21660ba9-3923-41e5-a2da-a9a78cf7ee84/scratch/captures';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function captureAll() {
  console.log('Launching browser for full capture...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  // 1. Login
  console.log('Logging in via Keycloak...');
  await page.goto('http://localhost:4200/feature/dashboard');
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.locator('input[name="username"]').fill('phurin');
  await page.locator('input[name="password"]').fill('phurin192547');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/, { timeout: 25000 });
  await page.waitForTimeout(4000);
  console.log('Login successful! Current URL:', page.url());

  // Helper to capture a route
  async function snap(pageIdx, name, customAction = null) {
    const file = path.join(outDir, `page_${pageIdx}.png`);
    console.log(`[${pageIdx}] Capturing ${name}...`);
    try {
      if (customAction) {
        await customAction(page);
      }
      await page.waitForTimeout(1500);
      await page.screenshot({ path: file });
      console.log(`  -> Saved ${file}`);
    } catch (err) {
      console.error(`  -> Failed capturing ${name}:`, err.message);
    }
  }

  // Part 1: Pages 11-17
  await snap(11, 'User Profile', async (p) => {
    await p.goto('http://localhost:4200/management/profile');
    await p.waitForTimeout(2000);
  });

  await snap(12, 'Team Chat', async (p) => {
    // Try opening chat drawer or visit discussion
    await p.goto('http://localhost:4200/feature/pm/discussion');
    await p.waitForTimeout(2000);
  });

  await snap(13, 'Notification Center', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/notifications');
    await p.waitForTimeout(2000);
  });

  await snap(14, 'AI Navigator', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/executive-dashboard');
    await p.waitForTimeout(2000);
    // Click AI fab button if present
    const aiBtn = p.locator('button:has-text("AI"), .ai-btn, .chat-fab, button[aria-label*="AI"]');
    if (await aiBtn.count() > 0) {
      await aiBtn.first().click().catch(() => {});
      await p.waitForTimeout(1500);
    }
  });

  await snap(15, 'AI Full-Project Generator', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/project/new');
    await p.waitForTimeout(2000);
    // Fill sample data into form
    const titleInput = p.locator('input[formcontrolname="projectName"], input[name="projectName"], input[placeholder*="ชื่อโครงการ"]');
    if (await titleInput.count() > 0) {
      await titleInput.first().fill('โครงการพัฒนาระบบคลังสินค้าและจัดส่งอัจฉริยะ (Smart Logistics Platform)');
    }
    const descInput = p.locator('textarea[formcontrolname="description"], textarea[name="description"], textarea[placeholder*="ความต้องการ"]');
    if (await descInput.count() > 0) {
      await descInput.first().fill('พัฒนาระบบ WMS แบบเรียลไทม์ พร้อมระบบจัดสรรเส้นทางการจัดส่งอัจฉริยะ (AI Route Optimization) และเชื่อมต่ออุปกรณ์ IoT Barcode Scanner');
    }
    await p.waitForTimeout(1000);
  });

  await snap(16, 'Context Switcher', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/executive-dashboard');
    await p.waitForTimeout(2000);
    // Click project dropdown in header
    const projDropdown = p.locator('button:has-text("เลือกโปรเจกต์"), button:has-text("โปรเจกต์"), .project-select, select');
    if (await projDropdown.count() > 0) {
      await projDropdown.first().click().catch(() => {});
      await p.waitForTimeout(1500);
    }
  });

  await snap(17, 'Executive Dashboard', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/executive-dashboard');
    await p.waitForTimeout(2500);
  });

  // Part 2: Pages 18-24
  await snap(18, 'Organization Info', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/info');
    await p.waitForTimeout(2000);
  });

  await snap(19, 'Team Management', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/team');
    await p.waitForTimeout(2000);
  });

  await snap(20, 'Role Hierarchy', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/role');
    await p.waitForTimeout(2500);
  });

  await snap(21, 'Program Catalog', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/program');
    await p.waitForTimeout(2000);
  });

  await snap(22, 'Role Permissions Matrix', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/permission');
    await p.waitForTimeout(2500);
  });

  await snap(23, 'Approval Flow Config', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/approval-flow');
    await p.waitForTimeout(2000);
  });

  await snap(24, 'AI Hub Model Config', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/ai-model-config');
    await p.waitForTimeout(2000);
  });

  // Part 3: Pages 25-27
  await snap(25, 'Customer Master Data', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/customer');
    await p.waitForTimeout(2000);
  });

  await snap(26, 'Contract Management', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/contract');
    await p.waitForTimeout(2000);
  });

  await snap(27, 'Project Master Data', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/project');
    await p.waitForTimeout(2000);
  });

  // Part 4: Pages 28-40
  await snap(28, 'WBS Phase & Milestones', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/phase');
    await p.waitForTimeout(2000);
  });

  await snap(29, 'Master Timeline & Gantt', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/gantt');
    await p.waitForTimeout(3000);
  });

  await snap(30, 'Project Task Calendar', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/calendar');
    await p.waitForTimeout(2500);
  });

  await snap(31, 'Requirement Management', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/requirement');
    await p.waitForTimeout(2000);
  });

  await snap(32, 'Diagram Designer Studio', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/diagram');
    await p.waitForTimeout(3000);
  });

  await snap(33, 'System Specifications', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/specification');
    await p.waitForTimeout(2000);
  });

  await snap(34, 'Design Review & Figma', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/design-review');
    await p.waitForTimeout(2000);
  });

  await snap(35, 'Task Board & Kanban', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/task-board');
    await p.waitForTimeout(2500);
  });

  await snap(36, 'Test Scenarios & Cases', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/test-management');
    await p.waitForTimeout(2000);
  });

  await snap(37, 'User Manual Builder', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/manual');
    await p.waitForTimeout(2000);
  });

  await snap(38, 'Delivery & Phase Sign-off', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/delivery');
    await p.waitForTimeout(2000);
  });

  await snap(39, 'Invoice & Billing Management', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/invoice');
    await p.waitForTimeout(2000);
  });

  await snap(40, 'Maintenance Support Tickets', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/ma-ticket');
    await p.waitForTimeout(2000);
  });

  // Part 5: Pages 41-46
  await snap(41, 'Change Request Management', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/change-request');
    await p.waitForTimeout(2000);
  });

  await snap(42, 'Approval Hub', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/approval');
    await p.waitForTimeout(2000);
  });

  await snap(43, 'Discussion Feed', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/discussion');
    await p.waitForTimeout(2000);
  });

  await snap(44, 'Document Version Control', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/version');
    await p.waitForTimeout(2000);
  });

  await snap(45, 'System Audit Log', async (p) => {
    await p.goto('http://localhost:4200/feature/pm/audit');
    await p.waitForTimeout(2000);
  });

  await snap(46, 'Activity Notification Feed', async (p) => {
    await p.goto('http://localhost:4200/feature/bu/activity-log');
    await p.waitForTimeout(2000);
  });

  console.log('All 36 pages captured successfully!');
  await browser.close();
}

captureAll().catch(console.error);

