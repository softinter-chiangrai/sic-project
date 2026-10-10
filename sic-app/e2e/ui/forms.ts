import { expect, type Locator, type Page, type Response } from '@playwright/test';

const rand = () => Math.random().toString(36).slice(2, 8);

/** Plausible value for a text field, guessed from its formControlName. */
function textFor(name: string, numeric: boolean): string {
  if (numeric) return '1';
  if (/email|mail/i.test(name)) return `e2e-${rand()}@example.test`;
  if (/phone|tel|mobile|fax/i.test(name)) return '0812345678';
  if (/tax/i.test(name)) return String(Math.floor(1e12 + Math.random() * 9e12));
  if (/zip|postal/i.test(name)) return '10110';
  if (/url/i.test(name)) return 'http://localhost/e2e';
  if (/code|no$|number$/i.test(name)) return `E2E-${rand()}`;
  if (/manday|amount|value|price|rate|qty|total|days?$|hours?$|percent|order/i.test(name)) return '1';
  return `E2E ${rand()}`;
}

async function pickCombobox(host: Locator, wanted?: string) {
  await host.locator('.sic-combobox__field-input, input').first().click();
  const options = host.page().locator('.sic-combobox__option');
  await options.first().waitFor({ timeout: 2500 }).catch(() => {});
  if (!(await options.count())) return false; // dependent list is still empty
  const pick = wanted ? options.filter({ hasText: wanted }).first() : options.first();
  await pick.click();
  return true;
}

/** A modal left open by the app (alert, confirmation) blocks every click behind it: close it. */
async function dismissModal(page: Page) {
  const backdrop = page.locator('.cdk-overlay-dark-backdrop');
  if (!(await backdrop.count())) return;
  if (process.env['DEBUG_FORMS']) console.log('MODAL', (await page.locator('.cdk-overlay-container').innerText().catch(() => '')).replace(/s+/g, ' ').slice(0, 200));
  await page.getByRole('button', { name: /^(close|ok|ตกลง|ปิด)$/i }).first().click({ timeout: 1500 }).catch(() => page.keyboard.press('Escape'));
  await backdrop.first().waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});
}

/** Fill one control according to its Angular component. Returns the typed text ('' for pick-lists) or null if it could not be handled. */
async function fillControl(host: Locator, name: string, value?: string): Promise<string | null> {
  const tag = await host.evaluate((e) => e.tagName.toLowerCase());
  const page = host.page();
  await dismissModal(page);
  switch (tag) {
    case 'sic-combobox':
      return (await pickCombobox(host, value)) ? '' : null;
    case 'sic-radio':
      await host.locator('input[type=radio], label').first().click();
      return '';
    case 'sic-checkbox':
      await host.locator('input[type=checkbox], label').first().check({ force: true }).catch(() => host.click());
      return '';
    case 'sic-tiptap-editor': {
      await host.locator('.ProseMirror').fill(value ?? 'E2E content');
      return value ?? 'E2E content';
    }
    case 'sic-datepicker': {
      // the trigger is a button; a calendar dialog opens. Start dates: today. End/due dates: the 15th of next month.
      // DOM click: an overlay (switcher backdrop, AI button) can sit above the field
      const trigger = host.locator('.sic-datepicker__trigger button, button').first();
      await trigger.click({ timeout: 3000 }).catch(() => trigger.evaluate((b) => (b as HTMLElement).click()));
      const dialog = page.locator('[role=dialog]').filter({ has: page.locator('.sic-datepicker__day') }).first();
      const later = /end|due|until|expire|finish|deadline/i.test(name);
      if (later) await dialog.getByRole('button', { name: 'Next' }).click();
      await (later ? dialog.locator('.sic-datepicker__day').filter({ hasText: /^\s*15\s*$/ }).first() : dialog.locator('.sic-datepicker__day--today').first()).click();
      await dialog.waitFor({ state: 'hidden', timeout: 1500 }).catch(() => page.keyboard.press('Escape')); // an open popup would block the next picker
      return '';
    }
    case 'sic-input-area': {
      await host.locator('textarea').first().fill(value ?? 'E2E description');
      return value ?? 'E2E description';
    }
    case 'sic-upload':
    case 'sic-profile':
    case 'sic-colorpicker':
      return null;
    // plain <input formControlName>, <textarea>, <select>: the host is the control itself
    case 'input': {
      const type = (await host.getAttribute('type')) ?? 'text';
      if (type === 'checkbox' || type === 'radio') {
        await host.check({ force: true });
        return '';
      }
      const text = value ?? (type === 'date' ? new Date().toISOString().slice(0, 10) : type === 'email' ? `e2e-${rand()}@example.test` : textFor(name, type === 'number'));
      await host.fill(text);
      return text;
    }
    case 'textarea': {
      await host.fill(value ?? 'E2E description');
      return value ?? 'E2E description';
    }
    case 'select': {
      await host.selectOption({ index: 1 });
      return '';
    }
    default: {
      const input = host.locator('input:not([type=hidden]), textarea').first();
      if (!(await input.count())) return null;
      const numeric = (await input.getAttribute('type')) === 'number' || /number/.test(tag);
      const text = value ?? textFor(name, numeric);
      await input.fill(text);
      return text;
    }
  }
}

/** Fill the given fields, then every required (ng-invalid) one the form still shows. */
export async function fillForm(page: Page, values: Record<string, string> = {}): Promise<Record<string, string>> {
  const typed: Record<string, string> = {};
  for (const [name, value] of Object.entries(values)) {
    const host = page.locator(`[formcontrolname="${name}"]`).first();
    if (await host.count()) typed[name] = (await fillControl(host, name, value)) ?? '';
  }
  return { ...(await fillRequired(page, values)), ...typed };
}

export async function fillRequired(page: Page, values: Record<string, string> = {}): Promise<Record<string, string>> {
  const typed: Record<string, string> = {};
  const attempts = new Map<string, number>(); // a control gets two chances (dependent lists appear late), not one per round
  for (let round = 0; round < 6; round++) {
    const names = await page.locator('[formcontrolname].ng-invalid').evaluateAll((els) => els.map((e) => e.getAttribute('formcontrolname')!));
    const todo = [...new Set(names)].filter((n) => n && (attempts.get(n) ?? 0) < 2);
    if (!todo.length) return typed;
    for (const name of todo) {
      attempts.set(name, (attempts.get(name) ?? 0) + 1);
      if (process.env['DEBUG_FORMS']) console.log('FILL', round, name, new Date().toISOString().slice(17, 23));
      const host = page.locator(`[formcontrolname="${name}"]`).first();
      const tag = await host.evaluate((e) => e.tagName.toLowerCase()).catch(() => '?');
      const t = await fillControl(host, name, values[name]).catch((e) => { if (process.env['DEBUG_FORMS']) console.log('FILLERR', name, tag, String(e).slice(0, 900)); return null; });
      if (process.env['DEBUG_FORMS']) console.log('FILLED', name, tag, JSON.stringify(t));
      if (t) typed[name] = t;
    }
  }
  return typed;
}

const SAVE = /^\s*(create|save|update|submit|confirm|บันทึก|สร้าง)/i;

// writes the page makes on its own (not the save of the form)
const NOT_THE_SAVE = /edit-sessions|audit|notification|\/chat|storage|can-approve|\/ai\//;

/**
 * Click the form's primary button and judge the result by the HTTP write it triggers:
 * 2xx -> 'saved'; 4xx/5xx -> throws with the server message; no write (client validation dialog) -> 'invalid'.
 */
export async function submit(page: Page): Promise<'saved' | 'invalid'> {
  // one save can be several writes (e.g. PUT the parent, then POST the child): judge all of them
  const writes: Response[] = [];
  const collect = (r: Response) => {
    if (['POST', 'PUT'].includes(r.request().method()) && r.url().includes('/api/') && !NOT_THE_SAVE.test(r.url())) writes.push(r);
  };
  page.on('response', collect);
  const write = page
    .waitForResponse((r) => ['POST', 'PUT'].includes(r.request().method()) && r.url().includes('/api/') && !NOT_THE_SAVE.test(r.url()), { timeout: 30_000 }) // a slow server must not look like "nothing happened" (that would submit twice)
    .catch(() => null);
  const invalid = page.getByText(/Invalid form|Please Fill In Data/i).first().waitFor({ timeout: 30_000 }).then(() => true).catch(() => false);

  // the floating AI button covers the bottom-right corner where Save sits, so click the DOM button directly
  const byText = page.locator('sic-button', { hasText: SAVE });
  if (await byText.count()) await byText.last().locator('button').first().evaluate((b) => (b as HTMLElement).click());
  else {
    // some forms use plain <button> (e.g. Thai labels): last button that looks like Save and is not Cancel
    const native = page.locator('button').filter({ hasText: SAVE }).last();
    if (await native.count()) await native.evaluate((b) => (b as HTMLElement).click());
    else await page.locator('sic-button[variant=solid] button').last().evaluate((b) => (b as HTMLElement).click());
  }

  const outcome = await Promise.race([write.then((r) => (r ? { r } : null)), invalid.then((i) => (i ? { invalid: true } : null))]);
  if (outcome && 'r' in outcome) {
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(400); // a follow-up write may start right after the first answer
    page.off('response', collect);
    for (const res of writes) {
      if (process.env['DEBUG_FORMS']) console.log('WRITE', res.request().method(), res.url(), res.status());
      if (res.status() >= 400) throw new Error(`Save failed: ${res.request().method()} ${res.url()} -> ${res.status()} ${(await res.text().catch(() => '')).slice(0, 300)}`);
    }
    return 'saved';
  }
  page.off('response', collect);
  await page.getByRole('button', { name: /close|ปิด/i }).first().click({ timeout: 1500 }).catch(() => {});
  return 'invalid';
}

/** Fill and submit, topping up required fields after each rejection (dependent dropdowns appear late). */
export async function fillAndSave(page: Page, values: Record<string, string> = {}): Promise<Record<string, string>> {
  const typed = await fillForm(page, values);
  for (let i = 0; i < 4; i++) {
    if ((await submit(page)) === 'saved') return typed;
    Object.assign(typed, await fillRequired(page, values));
  }
  const bad = await page.locator('[formcontrolname].ng-invalid').evaluateAll((els) => els.map((e) => e.getAttribute('formcontrolname') + ':' + e.tagName.toLowerCase()));
  expect(bad, 'form still invalid after autofill: fields the helper does not know how to fill').toEqual([]);
  // no invalid control left yet nothing was saved: the page has its own rule (e.g. needs a line item). Show what it said.
  const said = await page.locator('[role=dialog], [class*=toast], [class*=alert], [class*=swal], [class*=error]').allInnerTexts();
  throw new Error(`form was never saved; page said: ${said.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 4).join(' | ')}`);
}

/** Many PM forms take their project from the "Select project" switcher in the header (in-memory state: select after each page load). */
export async function selectProject(page: Page, name = 'E2E Project') {
  const sw = page.locator('sic-context-switcher');
  if (!(await sw.count())) return;
  await sw.locator('button').first().click();
  await page.getByText(name, { exact: true }).first().click();
  await page.getByRole('button', { name: 'Close', exact: true }).first().click().catch(() => page.keyboard.press('Escape'));
}

/** Navigate inside the running SPA (no reload), so in-memory state such as the selected project survives. */
export async function spaNavigate(page: Page, url: string) {
  await page.evaluate((u) => {
    history.pushState({}, '', u);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, url);
  await page.waitForURL((u) => u.pathname + u.search === url, { timeout: 10_000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

/**
 * The Delete control that belongs to the element showing `text`: climb from the text until an ancestor holds a
 * Delete button: the nearest one is that item's own row/card (works for grids, tables and cards).
 */
export async function deleteButtonFor(page: Page, text: string) {
  const el = page.getByText(text).first();
  if (!(await el.count())) return null;
  const handle = await el.evaluateHandle((e) => {
    for (let n: Element | null = e; n; n = n.parentElement) {
      const del = [...n.querySelectorAll<HTMLElement>('button, [title], [aria-label]')].filter((b) => /delete/i.test(`${b.getAttribute('title') ?? ''} ${b.getAttribute('aria-label') ?? ''} ${b.tagName === 'BUTTON' ? (b.textContent ?? '') : ''}`));
      if (del.length) return del[0]; // nearest ancestor with a Delete: that item's own row/card
    }
    return null;
  });
  return handle.asElement();
}
