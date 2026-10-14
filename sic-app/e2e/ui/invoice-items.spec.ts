import { test, expect } from '@playwright/test';
import { World, today, inDays } from '../api/world';
import { Ui } from '../ui';
import { save } from './rich-editor';

// Invoice items carry code / quantity / unit price / discount. In the form the amount of a row is quantity x unit price - discount
// (read only while the row has both), a row without them keeps the typed amount, and everything comes back after Save.
test.describe.configure({ mode: 'serial' });

let w: World;
let ui: Ui;
let invoiceId: string;

const read = async () => {
  const body = (await w.api.get(`/api/pm/invoices/${invoiceId}`)).body;
  return (body.data ?? body) as { subtotalAmount: number; totalAmount: number; items: any[] };
};

test.beforeAll(async ({ browser }) => {
  test.setTimeout(180_000);
  w = await World.create();
  ui = await Ui.open(browser);
  invoiceId = await w.make('/api/pm/invoices/save', {
    customerId: await w.customer(), projectId: await w.project(), billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30),
    subtotalAmount: 1000, vatRate: 7, vatAmount: 70, totalAmount: 1070, state: 4,
    items: [{ itemName: 'Old row', amount: 1000, sortOrder: 1, state: 4 }],
  }, '/api/pm/invoices/{id}');
});
test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

const rows = () => ui.page.locator('table tbody tr').filter({ has: ui.page.locator('[data-testid=item-amount]') });

test('the items table has the new columns and an old row keeps its typed amount', async () => {
  await ui.visit(`/feature/pm/invoice/${invoiceId}/edit`);
  await ui.expectHealthy('/feature/pm/invoice/:id/edit');
  await expect(rows()).toHaveCount(1, { timeout: 30_000 });
  const old = rows().first();
  await expect(old.getByTestId('item-qty')).toHaveValue('');
  await expect(old.getByTestId('item-amount')).toBeEnabled();
  await expect(old.getByTestId('item-amount')).toHaveValue('1000');
});

test('typing quantity, unit price and discount computes the amount and the subtotal', async () => {
  await ui.page.locator('button').filter({ has: ui.page.locator('i.bi-plus-lg') }).first().click();
  await expect(rows()).toHaveCount(2);
  const row = rows().last();
  await row.locator('input[type=text]').first().fill('SKU-001'); // code
  await row.locator('input[type=text]').nth(1).fill('Widget'); // name
  await row.getByTestId('item-qty').fill('3');
  await row.getByTestId('item-unit-price').fill('250');
  await row.getByTestId('item-discount').fill('50');
  await expect(row.getByTestId('item-amount')).toHaveValue('700');
  await expect(row.getByTestId('item-amount')).toBeDisabled();
  // changing the discount recomputes
  await row.getByTestId('item-discount').fill('0');
  await expect(row.getByTestId('item-amount')).toHaveValue('750');
  await row.getByTestId('item-discount').fill('50');
  await expect(row.getByTestId('item-amount')).toHaveValue('700');
  await expect(ui.page.locator('sic-input-number[formcontrolname="subtotalAmount"] input')).toHaveValue(/1,?700/);
});

test('Save keeps code, quantity, unit price, discount and the totals', async () => {
  await save(ui.page);
  const inv = await read();
  const item = inv.items.find((i) => i.itemName === 'Widget');
  expect(item, JSON.stringify(inv.items)).toBeTruthy();
  expect(item).toMatchObject({ itemCode: 'SKU-001', quantity: 3, unitPrice: 250, discount: 50, amount: 700 });
  expect(inv.items.find((i) => i.itemName === 'Old row')).toMatchObject({ amount: 1000 });
  expect(inv.subtotalAmount).toBe(1700);
  expect(inv.totalAmount).toBe(1819); // + 7 % VAT
});

test('the server computes the amount itself when quantity and unit price are sent', async () => {
  const id = await w.make('/api/pm/invoices/save', {
    customerId: await w.customer(), projectId: await w.project(), billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 1, vatRate: 7, state: 4, // the server replaces the subtotal by the sum of the rows
    items: [{ itemName: 'Server math', itemCode: 'S-1', quantity: 4, unitPrice: 12.5, discount: 5, amount: 999999, sortOrder: 1, state: 4 }],
  }, '/api/pm/invoices/{id}');
  const body = (await w.api.get(`/api/pm/invoices/${id}`)).body;
  const inv = body.data ?? body;
  expect(inv.items[0]).toMatchObject({ itemCode: 'S-1', quantity: 4, unitPrice: 12.5, discount: 5, amount: 45 }); // 4 x 12.5 - 5
  expect(inv.subtotalAmount).toBe(45);
});

test('the exported PDF shows the new columns', async () => {
  const pdf = await w.api.bytes(`/api/pm/invoices/${invoiceId}/export-pdf`, { lang: 'th' });
  expect(pdf.status).toBe(200);
  const { probe, hasText } = await import('../api/rich');
  const text = probe(pdf.data).text;
  for (const t of ['ลำดับที่', 'รหัสสินค้า', 'ราคา/หน่วย', 'ส่วนลด', 'SKU-001', 'Widget', 'Net Total', 'บาท']) expect(hasText(text, t), t).toBe(true);
});

test('the AI draft fills code, quantity, unit price and discount of the rows (AI answer faked in the browser)', async () => {
  await ui.page.route('**/api/pm/invoices/generate/draft', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      invoiceTitle: 'AI draft', billingType: 'MILESTONE', vatRate: 7, remark: '<p>ai remark</p>',
      items: [{ itemCode: 'AI-001', itemDescription: 'AI item', quantity: 2, unitPrice: 1000, discount: 100, amount: 1900 },
              { itemCode: 'AI-002', itemDescription: 'AI second', quantity: 1, unitPrice: 500, discount: 0, amount: 500 }],
    }),
  }));
  await ui.page.evaluate(() => localStorage.setItem('app-lang', 'en'));
  await ui.visit(`/feature/pm/invoice/${invoiceId}/edit`);
  await ui.expectHealthy('/feature/pm/invoice/:id/edit');
  await ui.page.locator('button').filter({ has: ui.page.locator('i.bi-stars') }).first().click();
  await ui.page.getByRole('button', { name: /Generate Invoice with AI/ }).click();
  await expect(rows()).toHaveCount(2, { timeout: 30_000 });
  const first = rows().first();
  await expect(first.locator('input[type=text]').first()).toHaveValue('AI-001');
  await expect(first.getByTestId('item-qty')).toHaveValue('2');
  await expect(first.getByTestId('item-unit-price')).toHaveValue('1000');
  await expect(first.getByTestId('item-discount')).toHaveValue('100');
  await expect(first.getByTestId('item-amount')).toHaveValue('1900');
  await expect(rows().nth(1).locator('input[type=text]').first()).toHaveValue('AI-002');
  await expect(ui.page.locator('sic-input-number[formcontrolname="subtotalAmount"] input')).toHaveValue(/2,?400/);
  await ui.page.unroute('**/api/pm/invoices/generate/draft');
});

for (const [lang, headers] of [
  ['en', ['Code', 'Qty', 'Unit Price', 'Discount', 'Amount']],
  ['th', ['รหัสสินค้า', 'จำนวน', 'ราคา/หน่วย', 'ส่วนลด', 'ยอดเงิน']],
] as const) {
  test(`switching the system language to ${lang} changes the item columns`, async () => {
    await ui.page.evaluate((l) => localStorage.setItem('app-lang', l), lang);
    await ui.visit(`/feature/pm/invoice/${invoiceId}/edit`);
    await ui.expectHealthy('/feature/pm/invoice/:id/edit');
    const head = ui.page.locator('table thead').first();
    for (const h of headers) await expect(head, h).toContainText(h, { timeout: 30_000 });
    // and the other language is gone
    const other = lang === 'en' ? 'รหัสสินค้า' : 'Unit Price';
    await expect(head).not.toContainText(other);
  });
}
