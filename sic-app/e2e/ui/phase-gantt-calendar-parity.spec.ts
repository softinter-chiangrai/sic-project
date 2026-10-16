import { test, expect } from '@playwright/test';
import { Ui } from '../ui';

let ui: Ui;

test.beforeAll(async ({ browser }) => {
  ui = await Ui.open(browser);
});

test.afterAll(async () => {
  await ui?.close();
});

test.describe('Parity Check: Phase vs Gantt vs Calendar', () => {
  test('Analyze data parity between Phase, Gantt, and Calendar', async () => {
    test.setTimeout(120_000);

    // Switch business to 'ซอฟท์อินเตอร์' (7528bbda-505d-4d0a-b973-882cfb1b2f3d)
    await ui.page.goto('/feature/dashboard');
    await ui.page.evaluate(() => {
      localStorage.setItem('businessId', '7528bbda-505d-4d0a-b973-882cfb1b2f3d');
    });

    const requests: { [page: string]: string[] } = { phase: [], gantt: [], calendar: [] };
    let currentPage = 'phase';

    ui.page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/pm/')) {
        requests[currentPage].push(`${req.method()} ${url}`);
      }
    });

    // 1. Visit Phase
    currentPage = 'phase';
    await ui.visit('/feature/pm/phase');
    await ui.page.waitForLoadState('networkidle');
    await ui.page.waitForTimeout(2000);

    const phaseCards = await ui.page.locator('.grid > div h3').allTextContents();
    console.log(`\n=== 1. Phase Page (/feature/pm/phase) ===`);
    console.log(`Phase cards rendered (${phaseCards.length}):`, phaseCards);
    console.log(`API calls made:`, requests.phase);

    // 2. Visit Gantt
    currentPage = 'gantt';
    await ui.visit('/feature/pm/gantt');
    await ui.page.waitForLoadState('networkidle');
    await ui.page.waitForTimeout(3000);

    // Read Gantt timeline row labels
    const ganttLabels = await ui.page.locator('.sic-calendar-timeline, [class*="timeline"]').locator('span.font-medium, .truncate').allTextContents();
    const uniqueGanttLabels = [...new Set(ganttLabels.map(s => s.trim()).filter(Boolean))];

    console.log(`\n=== 2. Gantt Page (/feature/pm/gantt) ===`);
    console.log(`Gantt timeline items (${uniqueGanttLabels.length}):`, uniqueGanttLabels);
    console.log(`API calls made:`, requests.gantt);

    // 3. Visit Calendar
    currentPage = 'calendar';
    await ui.visit('/feature/pm/calendar');
    await ui.page.waitForLoadState('networkidle');
    await ui.page.waitForTimeout(3000);

    const calendarEventTexts = await ui.page.locator('.sic-calendar__event, [class*="calendar-event"], [class*="event-item"]').allTextContents();
    console.log(`\n=== 3. Calendar Page (/feature/pm/calendar) ===`);
    console.log(`Calendar events visible on current view (${calendarEventTexts.length}):`, calendarEventTexts);
    console.log(`API calls made:`, requests.calendar);

    // Check project select options in Calendar
    const projectOptions = await ui.page.locator('select option, [role="option"]').allTextContents();
    console.log(`Calendar project options:`, projectOptions.slice(0, 10));
  });
});
