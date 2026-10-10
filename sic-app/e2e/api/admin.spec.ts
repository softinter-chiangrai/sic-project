import { test, expect } from '@playwright/test';
import { World, idOf } from './world';
import { mock, userId } from '../api';

// su/* administration: roles, programs (menu), role permissions, user-business, user roles, messages, AI model config, ...

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const data = (b: any) => b?.data ?? b;

test('business role CRUD', async () => {
  const b = (name: string) => ({ businessId: w.api.businessId, roleCode: mock('ROLE'), roleNameEn: name, roleNameLocal: name, sortOrder: 99, isActive: true, color: '#336699' });
  const id = await w.make('/api/su/business-roles/save', { ...b('Role A'), state: 4 }, '/api/su/business-roles/{id}');
  const got = data((await w.api.get(`/api/su/business-roles/${id}`)).body);
  expect(got.roleNameEn).toBe('Role A');
  const upd = await w.api.post('/api/su/business-roles/save', { ...b('Role B'), roleCode: got.roleCode, id, state: 3, rowVersion: got.rowVersion });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect(data((await w.api.get(`/api/su/business-roles/${id}`)).body).roleNameEn).toBe('Role B');
  expect((await w.api.get('/api/su/business-roles/paging', { page: 0, size: 10 })).status).toBe(200);
});

test('program CRUD', async () => {
  const b = (name: string) => ({ programCode: mock('PRG'), programNameEn: name, programNameLocal: name, routePath: '/e2e', sortOrder: 99, isActive: true });
  const id = await w.make('/api/su/programs/save', { ...b('Prog A'), state: 4 }, '/api/su/programs/{id}');
  const got = data((await w.api.get(`/api/su/programs/${id}`)).body);
  expect(got.programNameEn).toBe('Prog A');
  const upd = await w.api.post('/api/su/programs/save', { ...b('Prog B'), programCode: got.programCode, id, state: 3, rowVersion: got.rowVersion });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect(data((await w.api.get(`/api/su/programs/${id}`)).body).programNameEn).toBe('Prog B');
  expect((await w.api.get('/api/su/programs/tree')).status).toBe(200);
});

test('role permissions (role-program) list / save / bulk-save', async () => {
  const roleId = await w.make('/api/su/business-roles/save', { businessId: w.api.businessId, roleCode: mock('ROLE'), roleNameEn: 'Perm role', roleNameLocal: 'Perm role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}');
  const programId = await w.make('/api/su/programs/save', { programCode: mock('PRG'), programNameEn: 'Perm prog', programNameLocal: 'Perm prog', routePath: '/e2e-perm', sortOrder: 99, isActive: true, state: 4 }, '/api/su/programs/{id}');
  // creating a program grants a (role, program) row to every role: find ours and edit it
  const list = await w.api.get('/api/su/business-role-programs/paging', { pageNumber: 1, pageSize: 200, businessRoleId: roleId });
  expect(list.status, JSON.stringify(list.body)).toBe(200);
  const rows = data(list.body)?.data ?? data(list.body)?.content ?? data(list.body);
  const row = rows.find((r: any) => (r.programId ?? r.program?.id) === programId);
  expect(row, 'auto-created role-program row').toBeTruthy();
  const one = await w.api.post('/api/su/business-role-programs/save', { id: row.id, rowVersion: row.rowVersion, businessRoleId: roleId, programId, active: true, add: true, back: true, print: false, remove: false, save: true, search: true });
  expect(one.status, JSON.stringify(one.body)).toBeLessThan(300);
  const bulk = await w.api.post('/api/su/business-role-programs/bulk-save', { roleId, modules: [{ id: row.id, businessRoleId: roleId, programId, active: true, add: false, back: true, print: true, remove: false, save: false, search: true }] });
  expect(bulk.status, JSON.stringify(bulk.body)).toBeLessThan(300);
});

test('user-business + user role', async () => {
  const me = await userId();
  const biz = w.api.businessId!;
  const roleId = await w.make('/api/su/business-roles/save', { businessId: w.api.businessId, roleCode: mock('ROLE'), roleNameEn: 'Assign role', roleNameLocal: 'Assign role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}');
  const ub = (await w.api.get('/api/su/user-businesses', { businessId: biz })).body;
  expect(JSON.stringify(ub)).toContain(me);
  const mine = (data(ub) as any[]).find?.((x: any) => x.userId === me) ?? (data(ub)?.data ?? []).find((x: any) => x.userId === me);
  expect(mine, 'seeded user-business row').toBeTruthy();
  const rid = await w.make('/api/su/user-business-roles/save', { userBusinessId: mine.id, businessRoleId: roleId, isActive: true }, '/api/su/user-business-roles/{id}');
  expect(rid).toBeTruthy();
  expect((await w.api.get('/api/su/user-business-roles', { userBusinessId: mine.id })).status).toBeLessThan(500);
  expect((await w.api.get('/api/su/user-business-roles/paging', { page: 0, size: 10 })).status).toBe(200);
});

test('system message CRUD', async () => {
  const b = (en: string) => ({ moduleCode: 'E2E', programCode: 'E2E', messageCode: mock('MSG'), messageEn: en, messageLocal: en, isActive: true });
  const m = b('Hello');
  const r = await w.api.post('/api/su/messages/save', m);
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  const id = idOf(r.body);
  expect(id).toBeTruthy();
  const upd = await w.api.post('/api/su/messages/save', { ...m, id, messageEn: 'Hello 2' });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get('/api/su/messages')).status).toBe(200);
  expect((await w.api.del(`/api/su/messages/${id}`, { deleteBy: 'e2e' })).status).toBeLessThan(300);
});

test('AI model config CRUD', async () => {
  const b = (name: string) => ({ modelCode: mock('model'), displayName: name, providerLabel: 'e2e', apiFormat: 'OPENAI_COMPATIBLE', apiUrl: 'http://localhost:1/none', apiKey: 'x', maxTokens: 100, isActive: true, isDefault: false, isRecommended: false, sortOrder: 99 });
  const id = await w.make('/api/ai-model-config', b('Model A'), '/api/ai-model-config/{id}');
  const got = data((await w.api.get(`/api/ai-model-config/${id}`)).body);
  expect(got.displayName).toBe('Model A');
  const upd = await w.api.post('/api/ai-model-config', { ...b('Model B'), modelCode: got.modelCode, id, rowVersion: got.rowVersion });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect(data((await w.api.get(`/api/ai-model-config/${id}`)).body).displayName).toBe('Model B');
  expect((await w.api.get('/api/ai-model-config')).status).toBe(200);
});

test('example module (ex) CRUD', async () => {
  test.fixme(true, 'table ex_example has no Flyway migration (not in the real DB either) -> every /api/ex/examples write fails');
  const code = mock('EX');
  const body = { exampleCode: code, messageEn: 'hello', messageLocal: 'hello', isActive: true, isAccept: true, total: 1 };
  const r = await w.api.post('/api/ex/examples/save', body);
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  const id = idOf(r.body);
  expect(id).toBeTruthy();
  expect((await w.api.get(`/api/ex/examples/${id}`)).status).toBe(200);
  expect((await w.api.get('/api/ex/examples/paging', { page: 0, size: 10 })).status).toBe(200);
  expect((await w.api.del(`/api/ex/examples/${id}`)).status).toBeLessThan(300);
});

test('notifications + audit log', async () => {
  expect((await w.api.get('/api/su/notifications')).status).toBe(200);
  expect((await w.api.get('/api/su/notifications/unread-count')).status).toBe(200);
  expect((await w.api.put('/api/su/notifications/read-all')).status).toBeLessThan(300);
  const log = await w.api.post('/api/su/audit-logs', { userId: await userId(), username: 'phurin', action: 'E2E', module: 'E2E', description: 'e2e audit entry', status: 'SUCCESS' });
  expect(log.status, JSON.stringify(log.body)).toBeLessThan(300);
  expect((await w.api.get('/api/su/audit-logs')).status).toBe(200);
});

test('business invite create / delete', async () => {
  const roleId = await w.make('/api/su/business-roles/save', { businessId: w.api.businessId, roleCode: mock('ROLE'), roleNameEn: 'Invite role', roleNameLocal: 'Invite role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}');
  const r = await w.api.post('/api/business/invite', { roleId, inviteType: 'LINK', maxUses: 1 });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  const inv = await w.api.get('/api/business/invite');
  expect(inv.status).toBe(200);
  const id = idOf(r.body) ?? (data(inv.body) as any[])[0]?.id;
  if (id) expect((await w.api.del(`/api/business/invite/${id}`)).status).toBeLessThan(300);
});

test('chat: group create / send / update, direct message', async () => {
  const me = await userId();
  const g = await w.api.post('/api/su/chat/group/create', { name: mock('grp'), groupDescription: 'e2e', memberUserIds: [me] });
  expect(g.status, JSON.stringify(g.body)).toBeLessThan(300);
  const groupId = idOf(g.body) ?? g.body.groupId;
  expect(groupId).toBeTruthy();
  const send = await w.api.post('/api/su/chat/group/send', { groupId, message: 'hello group', messageType: 'TEXT' });
  expect(send.status, JSON.stringify(send.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/su/chat/group/${groupId}/history`)).status).toBe(200);
  const upd = await w.api.post('/api/su/chat/group/update', { groupId, name: mock('grp2'), groupDescription: 'e2e2', memberUserIds: [me] });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get('/api/su/chat/groups')).status).toBe(200);
});
