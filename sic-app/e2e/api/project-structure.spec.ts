import { test, expect } from '@playwright/test';
import { World, firstOf, today, inDays } from './world';
import { mock } from '../api';

// project -> contract -> phase -> milestone -> work package -> task. Each gets full CRUD; all deleted in afterAll.
test.describe.configure({ mode: 'serial' });

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

test('project CRUD', async () => {
  const cid = await w.customer();
  const id = await w.make('/api/pm/customer-projects', { customerId: cid, projectCode: mock('P'), projectName: 'CRUD Project' }, '/api/pm/customer-projects/{id}');
  expect((await w.api.get(`/api/pm/customer-projects/${id}`)).body.projectName).toBe('CRUD Project');
  const put = await w.api.put(`/api/pm/customer-projects/${id}`, { customerId: cid, projectCode: mock('P'), projectName: 'CRUD Project 2' });
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await w.api.get(`/api/pm/customer-projects/${id}`)).body.projectName).toBe('CRUD Project 2');
  expect((await w.api.get('/api/pm/customer-projects')).status).toBe(200);
  expect((await w.api.del(`/api/pm/customer-projects/${id}`)).status).toBeLessThan(300);
});

test('contract CRUD', async () => {
  const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
  const signStatus = firstOf((await w.api.get('/api/pm/contracts/lov-sign-status')).body);
  const b = {
    contractNo: mock('CT'), contractType, signStatus, customerId: await w.customer(), projectId: await w.project(),
    startDate: today(), endDate: inDays(365), contractValue: 1000,
  };
  const id = await w.make('/api/pm/contracts/save', b, '/api/pm/contracts/{id}');
  const got = await w.api.get(`/api/pm/contracts/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/contracts/save', { ...b, id, rowVersion: got.body.rowVersion, contractValue: 2000 });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get('/api/pm/contracts')).status).toBe(200);
  expect((await w.api.get(`/api/pm/contracts/${id}/summary`)).status).toBe(200);
});

test('phase CRUD', async () => {
  const pid = await w.project();
  const p = (name: string) => ({ projectId: pid, phaseCode: mock('PH'), phaseName: name, startDate: today(), endDate: inDays(10) });
  const id = await w.make(`/api/pm/projects/${pid}/phases`, p('Phase A'), '/api/pm/phases/{id}');
  expect((await w.api.get(`/api/pm/phases/${id}`)).status).toBe(200);
  expect((await w.api.get(`/api/pm/projects/${pid}/phases`)).status).toBe(200);
  const put = await w.api.put(`/api/pm/phases/${id}`, p('Phase B'));
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await w.api.get(`/api/pm/phases/${id}`)).body.phaseName).toBe('Phase B');
});

test('milestone CRUD', async () => {
  const phaseId = await w.phase();
  const id = await w.make('/api/pm/milestones', { phaseId, milestoneName: 'MS A', dueDate: inDays(5) }, '/api/pm/milestones/{id}');
  expect((await w.api.get(`/api/pm/milestones/${id}`)).status).toBe(200);
  expect((await w.api.get(`/api/pm/milestones/phase/${phaseId}`)).status).toBe(200);
  const put = await w.api.put(`/api/pm/milestones/${id}`, { phaseId, milestoneName: 'MS B', dueDate: inDays(6) });
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await w.api.get(`/api/pm/milestones/${id}`)).body.milestoneName).toBe('MS B');
});

test('work package CRUD', async () => {
  const milestoneId = await w.milestone();
  const wp = (name: string) => ({ milestoneId, packageName: name, startDate: today(), endDate: inDays(5) });
  const id = await w.make('/api/pm/work-packages', wp('WP A'), '/api/pm/work-packages/{id}');
  expect((await w.api.get(`/api/pm/work-packages/${id}`)).status).toBe(200);
  expect((await w.api.get(`/api/pm/work-packages/milestone/${milestoneId}`)).status).toBe(200);
  const put = await w.api.put(`/api/pm/work-packages/${id}`, wp('WP B'));
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await w.api.get(`/api/pm/work-packages/${id}`)).body.packageName).toBe('WP B');
});

test('task CRUD', async () => {
  const wpId = await w.workPackage();
  const t = (name: string) => ({ workPackageId: wpId, taskCode: mock('T'), taskName: name, startDate: today(), endDate: inDays(3), estimateManday: 1 });
  const id = await w.make('/api/pm/tasks', t('Task A'), '/api/pm/tasks/{id}');
  expect((await w.api.get(`/api/pm/tasks/${id}`)).status).toBe(200);
  expect((await w.api.get(`/api/pm/tasks/work-package/${wpId}`)).status).toBe(200);
  const put = await w.api.put(`/api/pm/tasks/${id}`, t('Task B'));
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await w.api.get(`/api/pm/tasks/${id}`)).body.taskName).toBe('Task B');
});
