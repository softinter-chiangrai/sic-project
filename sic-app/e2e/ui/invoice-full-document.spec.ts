import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { World, today, inDays } from '../api/world';
import { mock } from '../api';
import { Ui } from '../ui';
import { save } from './rich-editor';
import { hasText, probe } from '../api/rich';

// A whole invoice made the way a user makes it: business and customer master data filled in, every field of the invoice form typed in the
// browser (4 priced rows, remark), Save, then the exported PDF must carry all of it on the right pages:
//   page 1  issuer + customer boxes, document data, the 4 rows with code / quantity / unit price / discount / amount, the totals box with the
//           amount in words right under the table;  page 2  remark + signatures.
// The invoice id and the numbers are written to scratch/report-pdf/invoice-e2e/ so the same document can be rendered to PNG and looked at.
test.describe.configure({ mode: 'serial' });
test.setTimeout(240_000);

let w: World;
let ui: Ui;
let invoiceId: string;
let customerId: string;

const ROWS = [
  { code: 'SVC-001', name: 'ค่าพัฒนาระบบจัดการคำสั่งซื้อ', qty: 1, price: 150000, discount: 0 },
  { code: 'LIC-010', name: 'ค่าลิขสิทธิ์ซอฟต์แวร์ (ต่อผู้ใช้)', qty: 25, price: 1200, discount: 3000 },
  { code: 'TRN-002', name: 'ค่าอบรมการใช้งานระบบ', qty: 2, price: 8500, discount: 0 },
  { code: 'MA-003', name: 'ค่าบำรุงรักษาระบบ (12 เดือน)', qty: 12, price: 5000, discount: 6000 },
];
const amountOf = (r: (typeof ROWS)[number]) => r.qty * r.price - r.discount;
const SUBTOTAL = ROWS.reduce((s, r) => s + amountOf(r), 0); // 248,000
const VAT = Math.round(SUBTOTAL * 7) / 100; // 17,360
const TOTAL = SUBTOTAL + VAT; // 265,360
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PROJECT = 'ระบบจัดการคำสั่งซื้อออนไลน์ (Omnichannel)';
const REMARK = 'กรุณาโอนเงินเข้าบัญชี ธนาคารกสิกรไทย เลขที่บัญชี 123-4-56789-0';

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  ui = await Ui.open(browser);
  // issuer: the business the test user works in. The API has no call that returns/updates all its fields, so the fixture is written to the throwaway DB.
  const sql = `update su_business set first_name_local='บริษัท ซอฟต์อินเตอร์ จำกัด', first_name_en='Softinter Co., Ltd.', last_name_local=null, last_name_en=null, tax_id='0105559012345', branch_code='00000',
    address_local='99/9 อาคารซอฟต์ทาวเวอร์ ชั้น 12 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500', address_en='99/9 Soft Tower, Silom Rd., Bangrak, Bangkok 10500', phone_number='02-123-4567' where id='${w.api.businessId}'`;
  const db = process.env['E2E_DB'] ?? 'sic_app_e2e';
  if (db === 'sic_app') throw new Error('this spec edits the business row: run it against the throwaway DB (E2E_DB=sic_app_e2e)');
  execFileSync('docker', ['exec', 'sic-database', 'psql', '-U', 'administrator', '-d', db, '-v', 'ON_ERROR_STOP=1', '-c', sql]);
  // customer with a full address
  customerId = await w.make('/api/pm/customers', {
    customerCode: mock('C'), companyNameEn: 'Siam Retail Commerce Holdings Co., Ltd.', companyNameLocal: 'บริษัท สยาม รีเทล คอมเมิร์ซ โฮลดิ้งส์ จำกัด', taxId: '0105553212412', branchCode: '00000',
    addressLocal: '63 อาคารแอทธินี ทาวเวอร์ ชั้น 22 ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330', phoneNumber: '02-897-4699',
  }, '/api/pm/customers/{id}');
  // the invoice takes its customer from the project: make the project of that customer
  const projectId = await w.make('/api/pm/customer-projects', { customerId, projectCode: mock('P'), projectName: PROJECT, startDate: today(), plannedEndDate: inDays(90) }, '/api/pm/customer-projects/{id}');
  // the invoice starts with one empty-priced row; the browser fills the rest
  invoiceId = await w.make('/api/pm/invoices/save', {
    customerId, projectId, billingType: 'MILESTONE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 1, vatRate: 7, state: 4,
    remark: `<p>${REMARK}</p><p>ชำระภายใน 30 วัน</p>`, items: [{ itemName: 'placeholder', amount: 1, sortOrder: 1, state: 4 }],
  }, '/api/pm/invoices/{id}');
});
test.afterAll(async () => {
  await ui?.close();
  if (!process.env['KEEP_DATA']) await w?.cleanup(); // KEEP_DATA=1: leave the invoice in the throwaway DB so it can be rendered to PNG
});

const rows = () => ui.page.locator('table tbody tr').filter({ has: ui.page.locator('[data-testid=item-amount]') });

test('fill every item row in the browser and save', async () => {
  await ui.visit(`/feature/pm/invoice/${invoiceId}/edit`);
  await ui.expectHealthy('/feature/pm/invoice/:id/edit');
  await expect(rows()).toHaveCount(1, { timeout: 30_000 });
  // remove the placeholder row, add the four real ones
  await rows().first().locator('button').last().click();
  for (const [i, r] of ROWS.entries()) {
    await ui.page.locator('button').filter({ has: ui.page.locator('i.bi-plus-lg') }).first().click();
    const row = rows().nth(i);
    await row.locator('input[type=text]').first().fill(r.code);
    await row.locator('input[type=text]').nth(1).fill(r.name);
    await row.getByTestId('item-qty').fill(String(r.qty));
    await row.getByTestId('item-unit-price').fill(String(r.price));
    await row.getByTestId('item-discount').fill(String(r.discount));
    await expect(row.getByTestId('item-amount')).toHaveValue(String(amountOf(r)));
  }
  await expect(ui.page.locator('sic-input-number[formcontrolname="subtotalAmount"] input')).toHaveValue(new RegExp(String(SUBTOTAL).replace(/(\d)(?=(\d{3})+$)/, '$1,?')));
  await save(ui.page);
  const body = (await w.api.get(`/api/pm/invoices/${invoiceId}`)).body;
  const inv = body.data ?? body;
  expect(inv.subtotalAmount).toBe(SUBTOTAL);
  expect(inv.vatAmount).toBe(VAT);
  expect(inv.totalAmount).toBe(TOTAL);
  expect(inv.items.filter((i: any) => i.state !== 2 && i.itemName !== 'placeholder').length).toBe(ROWS.length);
});

test('the exported PDF holds every field on the right page', async () => {
  const res = await w.api.bytes(`/api/pm/invoices/${invoiceId}/export-pdf`, { lang: 'th' });
  expect(res.status).toBe(200);
  const pdf = probe(res.data);
  const body = (await w.api.get(`/api/pm/invoices/${invoiceId}`)).body;
  const invoiceNo = (body.data ?? body).invoiceNo as string;
  fs.mkdirSync(path.resolve('..', 'scratch', 'report-pdf', 'invoice-e2e'), { recursive: true });
  fs.writeFileSync(path.resolve('..', 'scratch', 'report-pdf', 'invoice-e2e', 'invoice.pdf'), res.data);
  fs.writeFileSync(path.resolve('..', 'scratch', 'report-pdf', 'invoice-e2e', 'invoice.json'), JSON.stringify({ invoiceId, invoiceNo, subtotal: fmt(SUBTOTAL), vat: fmt(VAT), total: fmt(TOTAL), projectName: PROJECT }));

  // the text of each page (probe joins pages with a newline; split it back by the page footer number)
  const page1 = pdfPage(res.data, 0);
  const page2 = pdfPage(res.data, 1);

  // page 1: parties, document data, table, totals
  for (const t of ['ผู้ออกเอกสาร', 'บริษัท ซอฟต์อินเตอร์ จำกัด', '0105559012345', '02-123-4567', 'อาคารซอฟต์ทาวเวอร์',
    'ผู้รับเอกสาร', 'บริษัท สยาม รีเทล คอมเมิร์ซ โฮลดิ้งส์ จำกัด', '0105553212412', '02-897-4699', 'อาคารแอทธินี',
    PROJECT, invoiceNo, 'ลำดับที่', 'รหัสสินค้า', 'ราคา/หน่วย', 'ส่วนลด']) expect(hasText(page1, t), `page 1 lacks: ${t}`).toBe(true);
  for (const r of ROWS) {
    for (const t of [r.code, r.name, String(r.qty), fmt(r.price), fmt(amountOf(r))]) expect(hasText(page1, t), `page 1 row ${r.code} lacks: ${t}`).toBe(true);
  }
  expect(hasText(page1, fmt(3000)) && hasText(page1, fmt(6000)), 'discounts on page 1').toBe(true);
  for (const t of [fmt(SUBTOTAL), fmt(VAT), fmt(TOTAL), 'Net Total', 'สองแสนหกหมื่นห้าพันสามร้อยหกสิบบาทถ้วน']) expect(hasText(page1, t), `totals box lacks: ${t}`).toBe(true);
  // page 2: remark and signatures
  for (const t of [REMARK, 'ชำระภายใน 30 วัน', 'ผู้จัดทำ', 'ผู้อนุมัติ']) expect(hasText(page2, t), `page 2 lacks: ${t}`).toBe(true);
  expect(pdf.pageCount).toBe(2);
});

/** text of one page of a PDF (PdfProbe returns it per page; probe() joins them, so ask the tool again for the page list) */
function pdfPage(pdf: Buffer, index: number): string {
  const file = path.join(os.tmpdir(), `inv-full-${process.pid}.pdf`);
  fs.writeFileSync(file, pdf);
  try {
    const jar = process.env['OPENPDF_JAR'] ?? findOpenPdf();
    const out = execFileSync('java', ['-cp', jar, path.resolve('e2e/tools/PdfProbe.java'), file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return (JSON.parse(out.trim().split('\n').pop()!).pages as string[])[index] ?? '';
  } finally {
    fs.rmSync(file, { force: true });
  }
}
function findOpenPdf(): string {
  const dir = path.join(os.homedir(), '.m2', 'repository', 'com', 'github', 'librepdf', 'openpdf');
  const v = fs.readdirSync(dir).sort().pop()!;
  return path.join(dir, v, `openpdf-${v}.jar`);
}
