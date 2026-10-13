import { test, expect } from '@playwright/test';
import { World, today, inDays } from './world';
import { mock } from '../api';

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w?.cleanup();
});

const text = (b: unknown) => (typeof b === 'string' ? b : JSON.stringify(b));
const SQL_LEAK = /insert into|could not execute|violates|SQL \[|constraint \[|org\.hibernate|org\.postgresql/i;

test.describe('Boundary & Edge Cases (API Level)', () => {
  test('XSS & Special Unicode characters in text fields are safely handled', async () => {
    const xssPayload = `<script>alert('xss-${mock('x')}')</script> <b>bold</b> "quotes" & 'single' 🚀 ไทย`;
    const code = mock('C');
    const r = await w.api.post('/api/pm/customers', {
      customerCode: code,
      companyNameEn: xssPayload,
      companyNameTh: 'ทดสอบชื่อบริษัท',
    });

    // Should either succeed (stored safely) or return 4xx validation error, but NEVER leak 500 SQL crash
    expect(r.status, text(r.body)).not.toBe(500);
    expect(text(r.body)).not.toMatch(SQL_LEAK);

    if (r.status === 200 || r.status === 201) {
      const id = typeof r.body === 'string' ? r.body : (r.body as any)?.id ?? (r.body as any)?.data;
      if (id) {
        // Read back and ensure it didn't corrupt storage
        const fetched = await w.api.get(`/api/pm/customers/${id}`);
        expect(fetched.status).toBe(200);
        await w.api.del(`/api/pm/customers/${id}`).catch(() => {});
      }
    }
  });

  test('Overly long string input (>2000 chars) does not crash database with 500 error', async () => {
    const oversizedCode = 'C_'.repeat(1000);
    const r = await w.api.post('/api/pm/customers', {
      customerCode: oversizedCode,
      companyNameEn: 'Oversized Code Test',
    });

    // Must be rejected as client error (4xx) and not leak an unhandled SQL constraint stack trace
    expect(r.status, text(r.body)).toBeGreaterThanOrEqual(400);
    expect(r.status, text(r.body)).toBeLessThan(500);
    expect(text(r.body)).not.toMatch(SQL_LEAK);
  });

  test('Completely empty body POST is rejected with 4xx, not 500', async () => {
    const r = await w.api.post('/api/pm/customer-projects', {});
    expect(r.status, text(r.body)).toBeGreaterThanOrEqual(400);
    expect(r.status, text(r.body)).toBeLessThan(500);
    expect(text(r.body)).not.toMatch(SQL_LEAK);
  });

  test('Negative numbers in contractValue are rejected politely or handled cleanly', async () => {
    const r = await w.api.post('/api/pm/contracts/save', {
      contractNo: mock('CT_NEG'),
      customerId: await w.customer(),
      projectId: await w.project(),
      startDate: today(),
      endDate: inDays(30),
      contractValue: -9999999,
      contractType: 'FIXED_PRICE',
      signStatus: 'DRAFT',
    });

    // Should not cause internal server 500 crash
    expect(r.status, text(r.body)).not.toBe(500);
    expect(text(r.body)).not.toMatch(SQL_LEAK);
  });

  test('Inverted date range (start date after end date) is handled safely without 500 crash', async () => {
    const r = await w.api.post('/api/pm/contracts/save', {
      contractNo: mock('CT_DATE'),
      customerId: await w.customer(),
      projectId: await w.project(),
      startDate: inDays(365),
      endDate: today(), // end is in the past compared to start
      contractValue: 10000,
      contractType: 'FIXED_PRICE',
      signStatus: 'DRAFT',
    });

    expect(r.status, text(r.body)).not.toBe(500);
    expect(text(r.body)).not.toMatch(SQL_LEAK);
  });
});
