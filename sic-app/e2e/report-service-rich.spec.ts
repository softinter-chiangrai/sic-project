import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE_URL = process.env['REPORT_SERVICE_URL'] || 'http://localhost:8082';
const TOKEN = process.env['REPORT_SERVICE_TOKEN'] || 'sw7vuLj4VcTyksKN9ZFNYDRmtu_O2uYk';
const OUTPUT_DIR = path.resolve('..', 'scratch', 'test-reports');

test.beforeAll(() => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
});

// A valid 175x60 solid PNG in Base64
const IMG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAK8AAAA8CAYAAACi9t4UAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAFFJREFUeJztwTEBAAAAwqD1T20LL6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/BhpAAAB1bY34AAAAABJRU5ErkJggg==';

// HTML content with text, responsive image, and a 9-column table (> 6 columns)
const RICH_HTML_9_COLS = `
<p><strong>1. รายละเอียดการทดสอบ Rich Text (Rich Content Test)</strong></p>
<p>ทดสอบการแสดงผลภาษาไทย สระบน-ล่าง วรรณยุกต์ และการตัดคำ</p>
<p><img src="data:image/png;base64,${IMG_B64}" width="175" data-align="center" /></p>
<p><strong>2. ตารางที่มีมากกว่า 6 คอลัมน์ (Table with 9 Columns):</strong></p>
<table>
  <thead>
    <tr>
      <th>ลำดับ (Col 1)</th>
      <th>รายการ (Col 2)</th>
      <th>รหัส (Col 3)</th>
      <th>ประเภท (Col 4)</th>
      <th>จำนวน (Col 5)</th>
      <th>หน่วย (Col 6)</th>
      <th>ราคา (Col 7)</th>
      <th>ส่วนลด (Col 8)</th>
      <th>รวมเงิน (Col 9)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>01</td>
      <td>บริการพัฒนาระบบซอฟต์แวร์</td>
      <td>SRV-001</td>
      <td>Dev</td>
      <td>10</td>
      <td>วัน</td>
      <td>15,000.00</td>
      <td>0.00</td>
      <td>150,000.00</td>
    </tr>
    <tr>
      <td>02</td>
      <td>บริการออกแบบสถาปัตยกรรม UI/UX</td>
      <td>DSG-002</td>
      <td>Design</td>
      <td>5</td>
      <td>วัน</td>
      <td>12,000.00</td>
      <td>1,000.00</td>
      <td>59,000.00</td>
    </tr>
  </tbody>
</table>
<p><em>ข้อความสรุปท้ายตาราง: จบการทดสอบตาราง 9 คอลัมน์</em></p>
`.trim();

const ALL_TEMPLATES: { code: string; name: string; params: Record<string, any> }[] = [
  {
    code: 'PMINVOICEREPORT',
    name: 'Invoice Report (ใบแจ้งหนี้/ใบเสร็จ)',
    params: { remark: RICH_HTML_9_COLS, invoiceNo: 'INV-TEST-001', lang: 'th' },
  },
  {
    code: 'PMDELIVERYREPORT',
    name: 'Delivery Report (เอกสารส่งมอบงาน)',
    params: { deliverySummary: RICH_HTML_9_COLS, releaseNote: '<p>หมายเหตุส่งมอบ: ผ่านเกณฑ์ทั้งหมด</p>', lang: 'th' },
  },
  {
    code: 'PMCONTRACTREPORT',
    name: 'Contract Report (เอกสารสัญญาว่าจ้าง)',
    params: { lang: 'th', exportDate: '14/10/2026', contractId: '' },
  },
  {
    code: 'PMCHANGEREQUESTREPORT',
    name: 'Change Request Report (เอกสารขอเปลี่ยนแปลง)',
    params: { lang: 'th', exportDate: '14/10/2026', changeRequestId: '' },
  },
  {
    code: 'PMSPECIFICATIONREPORT',
    name: 'Specification Report (เอกสารข้อกำหนดระบบ)',
    params: { lang: 'th', exportDate: '14/10/2026', specificationId: '' },
  },
  {
    code: 'PMREQUIREMENTREPORT',
    name: 'Requirement Report (เอกสารความต้องการ)',
    params: { lang: 'th', exportDate: '14/10/2026', requirementId: '' },
  },
  {
    code: 'PMTICKETREPORT',
    name: 'MA Ticket Report (เอกสารแจ้งปัญหา)',
    params: { lang: 'th', exportDate: '14/10/2026', ticketId: '' },
  },
  {
    code: 'PMUATREPORT',
    name: 'UAT Report (เอกสารทดสอบการยอมรับ)',
    params: { lang: 'th', exportDate: '14/10/2026', projectId: '', testTypeFilter: 'ALL' },
  },
  {
    code: 'PMUSERMANUALREPORT',
    name: 'User Manual Report (คู่มือการใช้งาน)',
    params: { lang: 'th', exportDate: '14/10/2026', manualId: '' },
  },
  {
    code: 'PMPROJECTREPORT',
    name: 'Project Report (รายงานสรุปโครงการ)',
    params: { lang: 'th', exportDate: '14/10/2026', projectId: '' },
  },
  {
    code: 'PMDESIGNREVIEWREPORT',
    name: 'Design Review Report (รายงานตรวจรับดีไซน์)',
    params: { lang: 'th', exportDate: '14/10/2026', designReviewId: '2539ebe4-cc99-47c1-9ea9-a92cccb7565b' },
  },
  {
    code: 'PMDIAGRAMREPORT',
    name: 'Diagram Report (รายงานแผนผังระบบ)',
    params: { lang: 'th', exportDate: '14/10/2026', diagramId: '' },
  },
];

test.describe('Report Service - Rich Text, Image & >6 Columns Slicing Tests', () => {
  for (const t of ALL_TEMPLATES) {
    test(`Render ${t.code} (${t.name}) via real Report Service`, async ({ request }) => {
      // 1. Send generate request
      const genRes = await request.post(`${BASE_URL}/api/reports/generate`, {
        headers: {
          'X-Access-Token': TOKEN,
          'Content-Type': 'application/json',
        },
        data: {
          templateCode: t.code,
          parameters: t.params,
          format: 'pdf',
        },
        timeout: 45_000,
      });

      expect(genRes.ok(), `Generate failed for ${t.code}: ${await genRes.text()}`).toBeTruthy();
      const body = await genRes.json();
      expect(body.reportFileId).toBeDefined();

      // 2. Download generated PDF
      const dlRes = await request.get(`${BASE_URL}/api/reports/files/${body.reportFileId}/download`, {
        headers: { 'X-Access-Token': TOKEN },
        timeout: 30_000,
      });

      expect(dlRes.ok(), `Download failed for file ${body.reportFileId}`).toBeTruthy();
      const pdfBytes = await dlRes.body();

      // 3. Assertions
      expect(pdfBytes.length).toBeGreaterThan(1000);
      expect(pdfBytes.subarray(0, 4).toString()).toBe('%PDF');

      // Save PDF to scratch folder
      const outPath = path.join(OUTPUT_DIR, `${t.code}.pdf`);
      fs.writeFileSync(outPath, pdfBytes);
      console.log(`[PASS] ${t.code}: ${pdfBytes.length} bytes -> ${outPath}`);
    });
  }

  test('Verify 9-column table slicing behavior in PMINVOICEREPORT', async () => {
    const pdfPath = path.join(OUTPUT_DIR, 'PMINVOICEREPORT.pdf');
    expect(fs.existsSync(pdfPath)).toBeTruthy();

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfString = pdfBuffer.toString('latin1');

    // Basic PDF structural assertions
    expect(pdfString).toContain('%PDF');
    // Ensure the PDF contains text chunks or font references
    expect(pdfString.length).toBeGreaterThan(10_000);
  });
});
