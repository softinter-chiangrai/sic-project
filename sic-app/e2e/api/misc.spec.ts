import { test, expect } from '@playwright/test';
import { World, idOf } from './world';
import { mock } from '../api';

// dashboards, search, menu, edit sessions, storage, business members, profile checks, diagram chat history, PDF exports.
let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const data = (b: any) => b?.data ?? b;

test('dashboards + task lists + search + menu', async () => {
  const projectId = await w.project();
  await w.task();
  for (const p of ['/api/pm/dashboard/org/summary', '/api/pm/dashboard/org/deadlines', '/api/pm/dashboard/org/project-health', `/api/pm/dashboard/${projectId}`, `/api/pm/projects/${projectId}/tasks`, '/api/pm/tasks/business', '/api/pm/tasks/combobox', '/api/menu', '/api/auth/me', '/api/su/tasks/lov', '/api/users/available']) {
    const r = await w.api.get(p);
    expect(r.status, `GET ${p} ${JSON.stringify(r.body).slice(0, 200)}`).toBe(200);
  }
  expect((await w.api.get('/api/pm/tasks/search', { projectId })).status).toBe(200);
  const s = await w.api.get('/api/search/global', { q: 'E2E' });
  expect(s.status, JSON.stringify(s.body).slice(0, 200)).toBe(200);
});

test('edit session check / close', async () => {
  const targetId = await w.requirement();
  const c = await w.api.get('/api/pm/edit-sessions/check', { targetType: 'REQUIREMENT', targetId });
  expect(c.status, JSON.stringify(c.body)).toBe(200);
  const x = await w.api.post('/api/pm/edit-sessions/close', undefined, { targetType: 'REQUIREMENT', targetId });
  expect(x.status, JSON.stringify(x.body)).toBeLessThan(300);
});

test('storage: upload image -> url -> download -> delete', async () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const up = await w.api.upload('/api/storage/upload/image', { file: { name: 'e2e.png', mimeType: 'image/png', buffer: png } });
  expect(up.status, JSON.stringify(up.body).slice(0, 300)).toBeLessThan(300);
  const fileId = idOf(up.body) ?? data(up.body)?.fileId ?? data(up.body)?.uploadId;
  expect(fileId, JSON.stringify(up.body).slice(0, 300)).toBeTruthy();
  // uploads are staged until activated
  const act = await w.api.post(`/api/storage/uploads/${fileId}/activate`);
  expect(act.status, JSON.stringify(act.body)).toBeLessThan(300);
  const u = await w.api.get(`/api/storage/url/${fileId}`);
  expect(u.status, JSON.stringify(u.body)).toBe(200);
  const d = await w.api.get(`/api/storage/download/${fileId}`);
  expect(d.status, JSON.stringify(d.body)).toBe(200);
  expect((await w.api.del(`/api/storage/${fileId}`)).status).toBeLessThan(300);
});

test('business members add / update / list / remove', async () => {
  const biz = w.api.businessId!;
  const userId = mock('user');
  const add = await w.api.post('/api/su-user-business/members', undefined, { businessId: biz, userId });
  expect(add.status, JSON.stringify(add.body)).toBeLessThan(300);
  const list = await w.api.get('/api/su-user-business/members', { businessId: biz });
  expect(list.status).toBe(200);
  const rows = data(list.body)?.data ?? data(list.body)?.content ?? data(list.body);
  const row = (Array.isArray(rows) ? rows : []).find((r: any) => r.userId === userId);
  const id = idOf(add.body) ?? row?.id;
  expect(id, JSON.stringify(add.body)).toBeTruthy();
  expect((await w.api.get(`/api/su-user-business/members/${id}`)).status).toBe(200);
  expect((await w.api.put(`/api/su-user-business/members/${id}`)).status).toBeLessThan(300);
  expect((await w.api.del(`/api/su-user-business/members/${id}`)).status).toBeLessThan(300);
});

test('profile uniqueness checks', async () => {
  expect((await w.api.get('/api/profile/mail-check', { email: `${mock()}@example.test` })).status).toBe(200);
  expect((await w.api.get('/api/profile/phone-check', { phone: '0999999999' })).status).toBe(200);
  expect((await w.api.get('/api/profile/tax-check', { taxId: '9999999999999' })).status).toBe(200);
});

test('change active business', async () => {
  const r = await w.api.post('/api/business/change-business', { businessId: w.api.businessId });
  expect(r.status, JSON.stringify(r.body)).toBe(200);
});

test('diagram chat history endpoints', async () => {
  const projectId = await w.project();
  const diagramId = await w.make('/api/diagram/tabs', { name: 'Chat diagram', diagramType: 'DFD', projectId, mermaidScript: 'graph TD; A-->B' }, '/api/diagram/tabs/{id}');
  expect((await w.api.get(`/api/diagram/chat/${diagramId}/sessions`)).status).toBe(200);
  expect((await w.api.get(`/api/diagram/chat/${diagramId}/history`)).status).toBe(200);
  expect((await w.api.del(`/api/diagram/chat/${diagramId}/history`)).status).toBeLessThan(300);
});

test('PDF exports answer without server errors', async () => {
  const projectId = await w.project();
  const reqId = await w.requirement();
  const specId = await w.specification();
  const bad: string[] = [];
  for (const p of [`/api/pm/requirement/${reqId}/export`, `/api/pm/specifications/${specId}/export-pdf`, `/api/pm/customer-projects/${projectId}/export`]) {
    const r = await w.api.get(p);
    if (r.status >= 400) bad.push(`${r.status} ${p} ${JSON.stringify(r.body).slice(0, 150)}`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

test('direct chat: send / history / edit / cancel', async () => {
  const me = await (await import('../api')).userId();
  const sent = await w.api.post('/api/su/chat/send', { receiverId: me, message: 'hello me', messageType: 'TEXT' });
  expect(sent.status, JSON.stringify(sent.body)).toBeLessThan(300);
  const msgId = idOf(sent.body);
  expect((await w.api.get(`/api/su/chat/history/${me}`)).status).toBe(200);
  if (msgId) {
    expect((await w.api.post(`/api/su/chat/edit/${msgId}`, { message: 'edited' })).status).toBeLessThan(500);
    expect((await w.api.post(`/api/su/chat/cancel/${msgId}`)).status).toBeLessThan(500);
  }
  expect((await w.api.post('/api/hubs/chat/negotiate')).status).toBeLessThan(500);
});

test('public verify token: unknown token is a client error, never a crash', async () => {
  const r = await w.api.get(`/api/public/verify/token/${mock('nope')}`);
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(500);
});

test('AI endpoints reject an empty request without crashing (no LLM key in test env)', async () => {
  for (const p of ['/api/ai/navigator/chat', '/api/ai/batch-generate', '/api/pm/ai/phase-wbs/generate', '/api/pm/ai/pipeline/preview']) {
    const r = await w.api.post(p, {});
    expect(r.status, `${p} ${JSON.stringify(r.body).slice(0, 200)}`).toBeLessThan(500);
  }
});
