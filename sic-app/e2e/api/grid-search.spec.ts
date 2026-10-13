import { test, expect } from '@playwright/test';
import { World } from './world';
import { mock } from '../api';

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w?.cleanup();
});

const rows = (b: any): any[] => {
  const d = b?.data ?? b;
  return Array.isArray(d) ? d : (d?.content ?? d?.rows ?? []);
};

test.describe('Grid Search, Filter & Pagination', () => {
  test('Search with Thai characters returns matching rows without encoding issues', async () => {
    const thaiName = `บริษัททดสอบไทย_${mock('T')}`;
    const code = mock('C_THAI');
    await w.make('/api/pm/customers', {
      customerCode: code,
      companyNameEn: 'Thai Search Co',
      companyNameLocal: thaiName,
    }, '/api/pm/customers/{id}');

    const searchRes = await w.api.get('/api/pm/customers', {
      businessId: w.api.businessId!,
      keyword: 'ทดสอบไทย',
      page: 0,
      size: 50,
    });

    expect(searchRes.status).toBe(200);
    const list = rows(searchRes.body);
    expect(list.some((r) => JSON.stringify(r).includes(code) || JSON.stringify(r).includes(thaiName))).toBe(true);
  });

  test('Search with SQL LIKE wildcards (%, _, \', ") does not trigger SQL syntax error or 500', async () => {
    const wildcards = ['%', '_', "'", '"', '\\', "'; DROP TABLE test; --"];

    for (const char of wildcards) {
      const res = await w.api.get('/api/pm/customers', {
        businessId: w.api.businessId!,
        keyword: char,
        page: 0,
        size: 10,
      });

      expect(res.status, `Failed on wildcard: ${char}`).toBe(200);
      expect(JSON.stringify(res.body)).not.toMatch(/syntax error|SQL|HibernateException/i);
    }
  });

  test('Pagination size parameter correctly limits returned row count', async () => {
    const pageSize = 3;
    const res = await w.api.get('/api/pm/customers', {
      businessId: w.api.businessId!,
      page: 0,
      size: pageSize,
    });

    expect(res.status).toBe(200);
    const list = rows(res.body);
    expect(list.length).toBeLessThanOrEqual(pageSize);
  });

  test('Negative page numbers or oversized size are handled without server crash', async () => {
    const resNeg = await w.api.get('/api/pm/customers', {
      businessId: w.api.businessId!,
      page: -1,
      size: 10,
    });
    expect(resNeg.status).not.toBe(500);

    const resLarge = await w.api.get('/api/pm/customers', {
      businessId: w.api.businessId!,
      page: 0,
      size: 999999,
    });
    expect(resLarge.status).not.toBe(500);
  });
});
