import { test } from '@playwright/test';
import { pages as allPages } from './pages';
import { Ui } from './ui';

// PAGE=customer npx playwright test → only routes containing that text
const pages = allPages.filter((p) => !process.env['PAGE'] || p.includes(process.env['PAGE']));

let ui: Ui;
test.beforeAll(async ({ browser }) => { ui = await Ui.open(browser); });
test.afterAll(() => ui.close());

// group by area so the VS Code Testing panel shows pm / bu / management / public
const group = (p: string) => (p.split('/')[2] === 'pm' || p.split('/')[2] === 'bu' ? p.split('/')[2] : p.startsWith('/management') ? 'management' : p.startsWith('/feature') ? 'dashboard' : 'public');

for (const g of [...new Set(pages.map(group))]) {
  test.describe(g, () => {
    for (const path of pages.filter((p) => group(p) === g)) {
      test(path, async () => {
        await ui.visit(path);
        await ui.expectHealthy(path);
      });
    }
  });
}
