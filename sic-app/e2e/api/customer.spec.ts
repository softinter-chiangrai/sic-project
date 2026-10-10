import { test, expect } from '@playwright/test';
import { seededApi, mock, type Api } from '../api';

// CRUD of /api/pm/customers with mock data; everything created is deleted in afterAll.
test.describe.configure({ mode: 'serial' });

let api: Api;
let id: string;
const code = mock();

test.beforeAll(async () => {
  api = await seededApi();
});

test.afterAll(async () => {
  if (id) await api.del(`/api/pm/customers/${id}`); // no-op if the test already deleted it
});

test('POST creates customer', async () => {
  const r = await api.post('/api/pm/customers', { customerCode: code, companyNameEn: 'E2E Co', email: 'e2e@example.test' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  id = r.body.id;
  expect(id).toBeTruthy();
});

test('GET by id returns it', async () => {
  const r = await api.get(`/api/pm/customers/${id}`);
  expect(r.status).toBe(200);
  expect(r.body.customerCode).toBe(code);
});

test('GET list contains it', async () => {
  const r = await api.get('/api/pm/customers', { businessId: api.businessId!, keyword: code, page: 0, size: 10 });
  expect(r.status).toBe(200);
  expect(JSON.stringify(r.body)).toContain(code);
});

test('PUT updates it', async () => {
  const r = await api.put(`/api/pm/customers/${id}`, { customerCode: code, companyNameEn: 'E2E Co Updated', email: 'e2e@example.test' });
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  expect((await api.get(`/api/pm/customers/${id}`)).body.companyNameEn).toBe('E2E Co Updated');
});

test('DELETE removes it', async () => {
  expect((await api.del(`/api/pm/customers/${id}`)).status).toBe(204);
  expect((await api.get(`/api/pm/customers/${id}`)).status).toBeGreaterThanOrEqual(400);
});
