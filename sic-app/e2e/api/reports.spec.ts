import { test, expect } from '@playwright/test';
import { World } from './world';

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w?.cleanup();
});

test.describe('Report Generation & Document Export', () => {
  test('Export Requirement to PDF/document returns valid non-empty response', async () => {
    test.setTimeout(120_000);
    const reqId = await w.requirement();

    const res = await w.api.get(`/api/pm/requirement/${reqId}/export`);
    expect(res.status).toBeLessThan(300);
    expect(res.body).toBeTruthy();
  });

  test('Export Specification to PDF returns valid response', async () => {
    test.setTimeout(120_000);
    const specId = await w.specification();

    const res = await w.api.get(`/api/pm/specifications/${specId}/export-pdf`);
    expect(res.status).toBeLessThan(300);
    expect(res.body).toBeTruthy();
  });

  test('Export Customer Project returns valid response', async () => {
    test.setTimeout(120_000);
    const projectId = await w.project();

    const res = await w.api.get(`/api/pm/customer-projects/${projectId}/export`);
    expect(res.status).toBeLessThan(300);
    expect(res.body).toBeTruthy();
  });

  test('Export non-existent record returns gracefully without 500 server crash', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await w.api.get(`/api/pm/requirement/${fakeId}/export`);
    // Endpoint either generates an empty document (200) or returns 4xx, but never crashes with 500
    expect(res.status).not.toBe(500);
    expect([200, 400, 404]).toContain(res.status);
  });
});
