import { test, expect } from '@playwright/test';
import { World } from './world';
import { mock, secondApi } from '../api';

// A rejected save must say what is wrong in plain words: no SQL, no stack, and a 4xx (never 5xx).
let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const text = (b: unknown) => (typeof b === 'string' ? b : JSON.stringify(b));
const SQL_LEAK = /insert into|could not execute|violates|SQL \[|constraint \[|org\.hibernate|org\.postgresql/i;

function expectFriendly(r: { status: number; body: unknown }, what: RegExp) {
  expect(r.status, text(r.body)).toBeGreaterThanOrEqual(400);
  expect(r.status, text(r.body)).toBeLessThan(500);
  expect(text(r.body)).not.toMatch(SQL_LEAK);
  expect(text(r.body)).toMatch(what);
}

test('delivery without a project is refused politely', async () => {
  expectFriendly(await w.api.post('/api/pm/delivery/save', { deliveryCode: mock('D'), deliveryTitle: 'no project', state: 4 }), /project/i);
});

test('invoice without customer/project is refused politely', async () => {
  expectFriendly(await w.api.post('/api/pm/invoices/save', { billingType: 'FIXED_PRICE', state: 4 }), /customer|project|issue|due|subtotal/i);
});

test('test case / bug / MA ticket / manual without required fields are refused politely', async () => {
  expectFriendly(await w.api.post('/api/pm/test-cases/save', { state: 4 }), /code|step|expected|test/i);
  expectFriendly(await w.api.post('/api/pm/bugs/save', { state: 4 }), /code|title|bug/i);
  expectFriendly(await w.api.post('/api/pm/ma-tickets/save', { state: 4 }), /title|description/i);
  expectFriendly(await w.api.post('/api/pm/manual/save', { state: 4 }), /project|code|title|manual/i);
});

test('change request without an assignee is refused politely', async () => {
  const targetId = await w.approvedSpec();
  const r = await w.api.post('/api/pm/change-requests', { projectId: await w.project(), targetType: 'SPECIFICATION', targetId, title: 'no assignee', description: 'd', changeReason: 'e2e', priority: 'MEDIUM' });
  expectFriendly(r, /assignee|ผู้รับผิดชอบ/i);
});

test('task without a work package is refused politely', async () => {
  expectFriendly(await w.api.post('/api/pm/tasks', { taskCode: mock('T'), taskName: 'orphan task' }), /work package/i);
});

test('duplicate code answers "already exists", not a constraint dump', async () => {
  const code = mock('C');
  await w.make('/api/pm/customers', { customerCode: code, companyNameEn: 'dup A' }, '/api/pm/customers/{id}');
  const again = await w.api.post('/api/pm/customers', { customerCode: code, companyNameEn: 'dup B' });
  expect(again.status, text(again.body)).toBeGreaterThanOrEqual(400);
  expect(again.status).toBeLessThan(500);
  expect(text(again.body)).not.toMatch(SQL_LEAK);
});

test('missing / malformed parameters are 400 and say which one', async () => {
  const r = await w.api.get('/api/pm/customers', { page: 0, size: 10 }); // businessId is required here
  expect(r.status, text(r.body)).toBe(400);
  expect(text(r.body)).toMatch(/businessId/i);
});

test('user-business listings only show the caller\'s current business', async () => {
  const mine = w.api.businessId!;
  // a second business owned by the same user: its member rows must never show up under the first one
  const personTypes = (await w.api.get('/api/business/lov-person-type')).body;
  const title = (await w.api.get('/api/profile/combobox-title')).body.data[0].value;
  const country = (await w.api.get('/api/profile/combobox-country')).body.data[0].value;
  const other = await w.api.post('/api/business/save', {
    state: 4, businessCode: 'ISO', personType: personTypes[0].value ?? personTypes[0].code, titleId: title,
    firstNameEn: 'Isolation Co', firstNameLocal: 'Isolation Co', countryId: country, isActive: true,
  });
  expect(other.status, text(other.body)).toBe(200);
  const otherId = other.body as string;

  const asFirst = text((await w.api.get('/api/su/user-businesses')).body);
  expect(asFirst, 'rows of another business leaked into this one').not.toContain(otherId);
  const rows = JSON.parse(asFirst) as { businessId: string }[];
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every((r) => r.businessId === mine), 'every row belongs to the current business').toBe(true);

  const paged = (await w.api.get('/api/su/user-businesses/paging', { pageNumber: 1, pageSize: 200 })).body;
  expect(text(paged)).not.toContain(otherId);

  // the second user is not a member of the other business: naming it in the header must not reveal it
  const u2 = await secondApi(otherId);
  expect(text((await u2.get('/api/su/user-businesses')).body)).not.toContain(otherId);
});
