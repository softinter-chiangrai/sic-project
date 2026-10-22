import { test, expect } from '@playwright/test';
import { World } from './world';
import { userId } from '../api';
import { sql } from '../infra/db';

// สิทธิ์ตาม role ต้องบังคับที่ backend (ยิง API ตรงก็ไม่ผ่าน): ดูอย่างเดียว / เพิ่มอย่างเดียว / บันทึกอย่างเดียว / ไม่มี role
let w: World;
let saved: string[] = [];
const created: string[] = []; // DELETE paths ของที่สร้างระหว่างเทส (ลบหลังคืนสิทธิ์)
const PROGRAMS = ['PMRT01', 'PMRT04', 'PMDT16'];

/** แถวสิทธิ์ของผู้ใช้ e2e ต่อโปรแกรมใน business ที่ seed ไว้ */
const scope = async (program: string) => `brp.id IN (
  SELECT x.id FROM su_business_role_program x
  JOIN su_program p ON p.id = x.program_id
  JOIN su_user_business_role ubr ON ubr.business_role_id = x.business_role_id
  JOIN su_user_business ub ON ub.id = ubr.user_business_id
  WHERE p.program_code = '${program}' AND ub.user_id = '${await userId()}' AND ub.business_id = '${w.api.businessId}')`;

const setFlags = async (program: string, flags: string) =>
  sql(`UPDATE su_business_role_program brp SET ${flags} WHERE ${await scope(program)}`);

test.beforeAll(async () => {
  w = await World.create();
  await w.contract(); // สร้างข้อมูลก่อนจำกัดสิทธิ์
  for (const p of PROGRAMS) {
    saved.push(...sql(`SELECT brp.id || ',' || brp.is_add || ',' || brp.is_save || ',' || brp.is_remove || ',' || brp.is_print || ',' || brp.is_active
                       FROM su_business_role_program brp WHERE ${await scope(p)}`).split('\n').filter(Boolean));
  }
  expect(saved.length, 'e2e user must have role rows for the programs').toBeGreaterThanOrEqual(PROGRAMS.length);
});

test.afterAll(async () => {
  for (const row of saved) {
    const [id, add, save, remove, print, active] = row.split(',');
    sql(`UPDATE su_business_role_program SET is_add = ${add}, is_save = ${save}, is_remove = ${remove}, is_print = ${print}, is_active = ${active} WHERE id = '${id}'`);
  }
  for (const p of created) await w.api.del(p).catch(() => {});
  await w?.cleanup();
});

test.describe.configure({ mode: 'serial' });

test('view-only role: read works, add/delete are refused with a plain message', async () => {
  await setFlags('PMRT01', 'is_add = false, is_save = false, is_remove = false, is_print = false');
  const perms = (await w.api.get('/api/menu/permissions')).body as any[];
  expect(perms.find((p) => p.programCode === 'PMRT01')).toMatchObject({ add: false, save: false, remove: false, print: false });

  expect((await w.api.get('/api/pm/customers', { businessId: w.api.businessId!, page: 0, size: 5 })).status).toBe(200);

  const add = await w.api.post('/api/pm/customers', { customerCode: 'E2E-NOPERM', companyNameEn: 'x', email: 'x@example.test' });
  expect(add.status).toBe(403);
  expect(add.body.message).toContain('ไม่มีสิทธิ์');
  expect((await w.api.del('/api/pm/customers/00000000-0000-0000-0000-000000000000')).status).toBe(403);

  // AI สร้างหลายรายการของโปรแกรมนี้ก็ต้องไม่ผ่าน (ตรวจก่อนเรียก AI)
  const ai = await w.api.post('/api/ai/batch-generate', { moduleType: 'CUSTOMER', prompt: 'x', count: 1 });
  expect(ai.status).toBe(403);
});

test('/save: add-only can create but not update; save-only can update but not create', async () => {
  const contractId = await w.contract();
  const current = (await w.api.get(`/api/pm/contracts/${contractId}`)).body;
  const create = { ...current, id: null, rowVersion: null, contractNo: `E2E-CT-${Date.now()}` };
  const update = { ...current, remark: 'perm-check' };

  await setFlags('PMRT04', 'is_add = true, is_save = false');
  const upd1 = await w.api.post('/api/pm/contracts/save', update);
  expect(upd1.status, JSON.stringify(upd1.body)).toBe(403);
  const crt1 = await w.api.post('/api/pm/contracts/save', create);
  expect(crt1.status, JSON.stringify(crt1.body)).not.toBe(403);
  if (crt1.status < 300) created.push(`/api/pm/contracts/${typeof crt1.body === 'string' ? crt1.body : crt1.body?.id}`);

  await setFlags('PMRT04', 'is_add = false, is_save = true');
  const crt2 = await w.api.post('/api/pm/contracts/save', { ...create, contractNo: `E2E-CT2-${Date.now()}` });
  expect(crt2.status, JSON.stringify(crt2.body)).toBe(403);
  const upd2 = await w.api.post('/api/pm/contracts/save', update);
  expect(upd2.status, JSON.stringify(upd2.body)).not.toBe(403);
});

test('save-only can still run non-create actions (bulk-save of role rights)', async () => {
  const roleId = await w.make('/api/su/business-roles/save', { businessId: w.api.businessId, roleCode: `E2E-R${Date.now() % 100000}`, roleNameEn: 'perm role', roleNameLocal: 'perm role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}');
  const rows = sql(`SELECT brp.id || ',' || brp.is_add || ',' || brp.is_save FROM su_business_role_program brp WHERE ${await scope('BURT02')}`).split('\n').filter(Boolean);
  try {
    await setFlags('BURT02', 'is_add = false, is_save = true');
    const r = await w.api.post('/api/su/business-role-programs/bulk-save', { roleId, modules: [] });
    expect(r.status, JSON.stringify(r.body)).not.toBe(403);
  } finally {
    for (const row of rows) {
      const [id, a, s] = row.split(',');
      sql(`UPDATE su_business_role_program SET is_add = ${a}, is_save = ${s} WHERE id = '${id}'`);
    }
  }
});

test('no role on a program: list is refused, lookups by id still work, bulk export needs print', async () => {
  await setFlags('PMDT16', 'is_print = false');
  const bulk = await w.api.post('/api/pm/export/bulk', { kind: 'invoice', ids: ['00000000-0000-0000-0000-000000000000'] });
  expect(bulk.status).toBe(403);

  await setFlags('PMDT16', 'is_active = false');
  const list = await w.api.get('/api/pm/invoices/paging', { page: 0, size: 5 });
  expect(list.status).toBe(403);
  const byId = await w.api.get('/api/pm/invoices/00000000-0000-0000-0000-000000000000');
  expect(byId.status).not.toBe(403);
  const perms = (await w.api.get('/api/menu/permissions')).body as any[];
  expect(perms.find((p) => p.programCode === 'PMDT16')).toBeUndefined();
});
