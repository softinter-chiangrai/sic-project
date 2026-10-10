import { test, expect } from '@playwright/test';
import { World, today, inDays } from './world';
import { mock } from '../api';

// delivery -> invoice (+items) -> payment, MA ticket, user manual (+sections). Full CRUD each.
test.describe.configure({ mode: 'serial' });

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

test('delivery CRUD', async () => {
  const projectId = await w.project();
  const b = (title: string) => ({ projectId, deliveryCode: mock('D'), deliveryTitle: title, deliveryDate: today(), deliveryVersion: '1.0' });
  const id = await w.make('/api/pm/delivery/save', { ...b('Delivery A'), state: 4 }, '/api/pm/delivery/{id}');
  const got = await w.api.get(`/api/pm/delivery/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/delivery/save', { ...b('Delivery B'), id, state: 3, rowVersion: got.body.rowVersion, deliveryCode: got.body.deliveryCode });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/delivery/${id}`)).body.deliveryTitle).toBe('Delivery B');
  expect((await w.api.get('/api/pm/delivery/paging', { page: 0, size: 10 })).status).toBe(200);
});

test('invoice + payment CRUD', async () => {
  const base = { customerId: await w.customer(), projectId: await w.project(), billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 1000, vatRate: 7, vatAmount: 70, totalAmount: 1070 };
  const id = await w.make('/api/pm/invoices/save', { ...base, state: 4, items: [{ itemName: 'Item 1', amount: 1000, sortOrder: 1, state: 4 }] }, '/api/pm/invoices/{id}');
  const got = await w.api.get(`/api/pm/invoices/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/invoices/save', { ...base, id, state: 3, rowVersion: got.body.rowVersion, invoiceNo: got.body.invoiceNo, remark: 'edited', items: [] });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/invoices/${id}`)).body.remark).toBe('edited');
  expect((await w.api.get('/api/pm/invoices/paging', { page: 0, size: 10 })).status).toBe(200);

  const pid = await w.make('/api/pm/payments/save', { invoiceId: id, paymentDate: today(), paymentMethod: 'CASH', amount: 100, state: 4 }, '/api/pm/payments/{id}');
  const pg = await w.api.get(`/api/pm/payments/${pid}`);
  expect(pg.status).toBe(200);
  const pu = await w.api.post('/api/pm/payments/save', { invoiceId: id, paymentDate: today(), paymentMethod: 'CASH', amount: 200, id: pid, state: 3, rowVersion: pg.body.rowVersion, paymentNo: pg.body.paymentNo });
  expect(pu.status, JSON.stringify(pu.body)).toBeLessThan(300);
  expect((await w.api.get('/api/pm/payments/paging', { page: 0, size: 10 })).status).toBe(200);
});

test('MA ticket CRUD', async () => {
  const base = { customerId: await w.customer(), projectId: await w.project(), ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN', description: 'e2e issue' };
  const id = await w.make('/api/pm/ma-tickets/save', { ...base, title: 'Ticket A', state: 4 }, '/api/pm/ma-tickets/{id}');
  const got = await w.api.get(`/api/pm/ma-tickets/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/ma-tickets/save', { ...base, title: 'Ticket B', id, state: 3, rowVersion: got.body.rowVersion, ticketNo: got.body.ticketNo });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/ma-tickets/${id}`)).body.title).toBe('Ticket B');
  expect((await w.api.get('/api/pm/ma-tickets/paging', { page: 0, size: 10 })).status).toBe(200);
});

test('user manual CRUD', async () => {
  const projectId = await w.project();
  const section = { sectionCode: 'S1', sectionTitle: 'Intro', content: 'hello', sortOrder: 1, state: 4 };
  const id = await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'Manual A', state: 4, sections: [section] }, '/api/pm/manual/{id}');
  const got = await w.api.get(`/api/pm/manual/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/manual/save', { projectId, manualCode: got.body.manualCode, manualTitle: 'Manual B', id, state: 3, rowVersion: got.body.rowVersion, sections: [] });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/manual/${id}`)).body.manualTitle).toBe('Manual B');
  expect((await w.api.get('/api/pm/manual/paging', { page: 0, size: 10 })).status).toBe(200);
});
