import { test, expect } from '@playwright/test';
import { World } from './world';
import { userId } from '../api';
import { sql } from '../infra/db';

// สิทธิ์ตาม role ต้องบังคับที่ backend: role ที่ตั้งเป็น "ดูได้อย่างเดียว" อ่านได้ แต่เพิ่ม/แก้/ลบไม่ได้ (403)
let w: World;
let saved: string[] = [];

/** แถวสิทธิ์ของผู้ใช้ e2e ต่อโปรแกรมใน business ที่ seed ไว้ */
const scope = async (program: string) => `brp.id IN (
  SELECT x.id FROM su_business_role_program x
  JOIN su_program p ON p.id = x.program_id
  JOIN su_user_business_role ubr ON ubr.business_role_id = x.business_role_id
  JOIN su_user_business ub ON ub.id = ubr.user_business_id
  WHERE p.program_code = '${program}' AND ub.user_id = '${await userId()}' AND ub.business_id = '${w.api.businessId}')`;

test.beforeAll(async () => {
  w = await World.create();
  const where = await scope('PMRT01');
  saved = sql(`SELECT brp.id || ',' || brp.is_add || ',' || brp.is_save || ',' || brp.is_remove || ',' || brp.is_print
               FROM su_business_role_program brp WHERE ${where}`).split('\n').filter(Boolean);
  expect(saved.length, 'e2e user must have a role row for PMRT01').toBeGreaterThan(0);
  sql(`UPDATE su_business_role_program brp SET is_add = false, is_save = false, is_remove = false, is_print = false WHERE ${where}`);
});

test.afterAll(async () => {
  for (const row of saved) {
    const [id, add, save, remove, print] = row.split(',');
    sql(`UPDATE su_business_role_program SET is_add = ${add}, is_save = ${save}, is_remove = ${remove}, is_print = ${print} WHERE id = '${id}'`);
  }
  await w?.cleanup();
});

test('view-only role: read works, add/delete are refused with a plain message', async () => {
  const perms = (await w.api.get('/api/menu/permissions')).body as any[];
  expect(perms.find((p) => p.programCode === 'PMRT01')).toMatchObject({ add: false, save: false, remove: false, print: false });

  expect((await w.api.get('/api/pm/customers', { businessId: w.api.businessId!, page: 0, size: 5 })).status).toBe(200);

  const add = await w.api.post('/api/pm/customers', { customerCode: 'E2E-NOPERM', companyNameEn: 'x', email: 'x@example.test' });
  expect(add.status).toBe(403);
  expect(add.body.message).toContain('ไม่มีสิทธิ์');

  expect((await w.api.del('/api/pm/customers/00000000-0000-0000-0000-000000000000')).status).toBe(403);
});

test('other programs keep their rights', async () => {
  const perms = (await w.api.get('/api/menu/permissions')).body as any[];
  expect(perms.find((p) => p.programCode === 'PMRT04')?.save).toBe(true);
});
