import { test, expect, type Page } from '@playwright/test';
import { Ui } from '../ui';
import { World } from '../api/world';
import { selectProject } from './forms';
import { t, resetAiStorage } from './ai';

// AI draft modal of every create form (see .claude/skills/playwright/ai-modules.md 3.1 / 4.1).
// The AI answer is faked in the browser: these tests check the page, not the LLM.
// Nothing is saved: only World records exist, removed in afterAll.

interface Row {
  name: string;
  route: string;
  endpoint: string;
  open: string; // i18n keys of the buttons / prompt box
  generate: string;
  paste: string;
  prompt: string;
  draft: Record<string, unknown>;
  keep: string; // text input the user filled first: AI must not overwrite it
  filled: [string, string] | string; // [formcontrolname, text] the draft must fill, or text that must appear on the page
  autoPaste?: boolean; // the form applies the draft itself right after generating (no paste click)
}

const rows: Row[] = [
  {
    name: 'Project', route: '/feature/pm/project/new', endpoint: '**/api/pm/customer-projects/generate/draft',
    open: 'PMRT02A_GENERATE_WITH_AI_BUTTON', generate: 'PMRT02A_GENERATE_WITH_AI_LONG_BUTTON', paste: 'PMRT02A_PASTE_INTO_FORM_BUTTON', prompt: 'PMRT02A_AI_PROMPT_PLACEHOLDER',
    draft: { projectName: 'AI project name', description: '<p>AI project description</p>' },
    keep: 'projectName', filled: ['description', 'AI project description'],
  },
  {
    name: 'Contract', route: '/feature/pm/contract/new', endpoint: '**/api/pm/contracts/generate/draft',
    open: 'PMRT04A_CREATE_WITH_AI', generate: 'PMRT04A_GENERATE_WITH_AI', paste: 'PMRT04A_PASTE_TO_FORM', prompt: 'PMRT04A_AI_PROMPT_PLACEHOLDER',
    draft: { contractNo: 'AI-CTR-001', scopeSummary: '<p>AI contract scope</p>', paymentTerms: '<p>AI payment terms</p>' },
    keep: 'contractNo', filled: ['scopeSummary', 'AI contract scope'],
  },
  {
    name: 'Requirement', route: '/feature/pm/requirement/new', endpoint: '**/api/pm/requirement/ai/generate',
    open: 'PMDT04_AI_GENERATE_BTN', generate: 'PMDT04_AI_GENERATE_BTN', paste: 'PMDT04_PASTE_TO_FORM_LABEL', prompt: 'PMDT04_AI_PROMPT_PLACEHOLDER',
    draft: { title: 'AI requirement title', description: '<p>AI requirement description</p>', acceptanceCriteria: '<p>AI criteria</p>' },
    keep: 'title', filled: ['description', 'AI requirement description'],
  },
  {
    name: 'Specification', route: '/feature/pm/specification/new', endpoint: '**/api/pm/specifications/generate/draft',
    open: 'PMDT07_AI_ASSIST_BTN', generate: 'PMDT07_AI_GENERATE_BTN', paste: 'PMDT07_AI_PASTE_BTN', prompt: 'PMDT07_AI_PROMPT_PLACEHOLDER',
    draft: { title: 'AI spec title', description: '<p>AI specification description</p>' },
    keep: 'title', filled: ['description', 'AI specification description'],
  },
  {
    name: 'Test Case', route: '/feature/pm/test-case/new', endpoint: '**/api/pm/test-cases/generate/draft',
    open: 'PMDT12A_GENERATE_WITH_AI', generate: 'PMDT12A_GENERATE_CONTENT', paste: 'PMDT12A_PASTE_TO_FORM', prompt: 'PMDT12A_PROMPT_PLACEHOLDER',
    draft: { title: 'AI test case title', testStep: '<p>AI test step</p>', expectedResult: '<p>AI expected result</p>' },
    keep: 'title', filled: ['testStep', 'AI test step'],
  },
  {
    name: 'Test Scenario', route: '/feature/pm/test-scenario/new', endpoint: '**/api/pm/test-scenarios/generate/draft',
    open: 'PMDT12B_AI_GENERATE_BUTTON', generate: 'PMDT12B_GENERATE', paste: 'PMDT12B_PASTE_INTO_FORM', prompt: 'PMDT12B_AI_PROMPT_PLACEHOLDER',
    draft: { scenarioName: 'AI scenario name', description: '<p>AI scenario description</p>' },
    keep: 'scenarioName', filled: ['description', 'AI scenario description'],
  },
  {
    name: 'Delivery', route: '/feature/pm/delivery/new', endpoint: '**/api/pm/delivery/generate/draft',
    open: 'PMDT14_CREATE_WITH_AI', generate: 'PMDT14_GENERATE_AI_DOC_BTN', paste: 'PMDT14_PASTE_TO_FORM_LONG', prompt: 'PMDT14_AI_PROMPT_PLACEHOLDER',
    draft: { deliveryTitle: 'AI delivery title', deliverySummary: '<p>AI delivery summary</p>' },
    keep: 'deliveryTitle', filled: ['deliverySummary', 'AI delivery summary'],
  },
  {
    name: 'User Manual', route: '/feature/pm/manual/new', endpoint: '**/api/pm/manual/generate/draft',
    open: 'PMDT15_CREATE_WITH_AI', generate: 'PMDT15_GENERATE_AI_MANUAL_BTN', paste: 'PMDT15_PASTE_TO_FORM_LONG', prompt: 'PMDT15_AI_PROMPT_PLACEHOLDER',
    draft: { manualTitle: 'AI manual title', manualType: 'USER', sections: [{ sectionCode: 'SEC-1', sectionTitle: 'AI manual section', content: '<p>AI section body</p>', sortOrder: 1 }] },
    keep: 'manualTitle', filled: 'AI manual section', autoPaste: true,
  },
  {
    name: 'MA Ticket', route: '/feature/pm/ma-ticket/new', endpoint: '**/api/pm/ma-tickets/generate/draft',
    open: 'PMDT17_CREATE_WITH_AI_BUTTON', generate: 'PMDT17_GENERATE_TICKET_AI_BUTTON', paste: 'PMDT17_PASTE_TO_FORM_BUTTON', prompt: 'PMDT17_AI_PROMPT_PLACEHOLDER',
    draft: { title: 'AI ticket title', description: '<p>AI ticket description</p>', severity: 'HIGH', ticketType: 'BUG_SUPPORT' },
    keep: 'title', filled: ['description', 'AI ticket description'],
  },
];

let ui: Ui;
let w: World;

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  await w.project();
  ui = await Ui.open(browser);
});

test.afterAll(async () => {
  if (ui) await resetAiStorage(ui).catch(() => {});
  await ui?.close();
  await w?.cleanup();
});

/** Success / info dialogs the app opens after a generate (they block clicks behind them). */
async function closeDialogs(page: Page) {
  // only the app's message dialog (sic-ng dialog pane), never the AI modal's own Close button
  const button = page.locator('.sic-dialog-overlay-pane').getByRole('button', { name: /^(OK|ตกลง|Close|ปิด)$/ });
  // the dialog can open a moment after the response; dialogs can stack (generated + applied)
  await button.first().waitFor({ timeout: 5000 }).catch(() => {});
  while (await button.count()) await button.last().click();
}

/** Text a form control shows: an input's value, otherwise its rendered text (rich editor). */
async function controlText(page: Page, name: string): Promise<string> {
  return page.locator(`[formcontrolname="${name}"]`).first().evaluate((el) => {
    const input = el.matches('input, textarea') ? (el as HTMLInputElement) : el.querySelector('input, textarea');
    return input && (input as HTMLInputElement).value ? (input as HTMLInputElement).value : (el as HTMLElement).innerText;
  });
}

/** Open the form, optionally type into it first, then open the AI modal and write the prompt. */
async function openForm(row: Row, beforeAi?: () => Promise<void>) {
  const { page } = ui;
  await resetAiStorage(ui);
  await ui.visit(row.route);
  await ui.expectHealthy(row.route);
  await selectProject(page, w.projectName);
  await beforeAi?.();
  await page.getByRole('button', { name: t(row.open) }).first().click();
  await page.getByPlaceholder(t(row.prompt)).fill('E2E prompt: draft for the test');
}

const generateButton = (row: Row) => ui.page.getByRole('button', { name: t(row.generate) }).last();

for (const row of rows) {
  test.describe(`AI draft: ${row.name}`, () => {
    test('sends the prompt, pastes the draft, keeps what the user typed', async () => {
      const { page } = ui;
      let sent: any;
      await page.route(row.endpoint, (route) => {
        sent = route.request().postDataJSON();
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(row.draft) });
      });
      try {
        // the user's own value, typed before opening AI (Smart Preserve)
        await openForm(row, () =>
          page.locator(`[formcontrolname="${row.keep}"] input, input[formcontrolname="${row.keep}"]`).first().fill('E2E user value'),
        );
        await generateButton(row).click();
        await expect.poll(() => sent, { timeout: 15_000 }).toBeTruthy();
        expect(sent.prompt, 'prompt sent').toContain('E2E prompt');
        await closeDialogs(page);
        if (!row.autoPaste) await page.getByRole('button', { name: t(row.paste) }).first().click();
        await closeDialogs(page);

        expect(await controlText(page, row.keep), `${row.keep} must not be overwritten`).toBe('E2E user value');
        if (typeof row.filled === 'string') await expect(page.getByText(row.filled).first()).toBeVisible();
        else await expect.poll(() => controlText(page, row.filled[0]), { timeout: 5000 }).toContain(row.filled[1]);
        expect(ui.errors).toEqual([]);
      } finally {
        await page.unroute(row.endpoint);
      }
    });

    test('shows the backend error and lets the user try again', async () => {
      const { page } = ui;
      await page.route(row.endpoint, (route) =>
        route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'E2E AI is down' }) }),
      );
      try {
        await openForm(row);
        await generateButton(row).click();
        await expect(page.getByText('E2E AI is down').first()).toBeVisible({ timeout: 15_000 });
        await closeDialogs(page);
        await expect(generateButton(row)).toBeEnabled();
      } finally {
        await page.unroute(row.endpoint);
      }
    });
  });
}
