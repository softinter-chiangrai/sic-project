import { test, expect } from '@playwright/test';
import { World, inDays, firstOf } from './world';
import { mock } from '../api';

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w.cleanup();
});

test.describe('Contract Renewal Flow & Duplicate Avoidance (API)', () => {

  test('1. Next Renewal No: สัญญาฉบับใหม่ที่ยังไม่เคยต่อสัญญา จะได้ต่อท้ายด้วย -R1', async () => {
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('CT-REN1');

    // 1.1 สร้างสัญญาหลัก
    const parentId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-365),
        endDate: inDays(0),
        contractValue: 100000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    // 1.2 เรียก endpoint หาเลขถัดไป
    const res = await w.api.get(`/api/pm/contracts/${parentId}/next-renewal-no`);
    expect(res.status).toBe(200);
    const nextNo = res.body?.nextContractNo ?? res.body?.data?.nextContractNo ?? res.body?.data ?? res.body;
    expect(nextNo).toBe(`${contractNo}-R1`);
  });

  test('2. หลบเลขซ้ำและคำนวณใน DB Transaction: เมื่อส่ง [สร้างอัตโนมัติ] Backend คำนวณและบันทึกเลขจริงเป็น -R1 และ -R2', async () => {
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('CT-REN2');

    // 2.1 สร้างสัญญาหลัก
    const parentId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-365),
        endDate: inDays(0),
        contractValue: 100000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    // 2.2 ส่งบันทึกสัญญาต่ออายุฉบับแรกโดยใช้ [สร้างอัตโนมัติ] ตามที่ฟรอนต์เอนด์ส่ง
    const r1Id = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: `${contractNo}-[สร้างอัตโนมัติ]`,
        parentContractId: parentId,
        contractType,
        signStatus: 'Signed',
        renewalStatus: 'ต่อสัญญาแล้ว',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(1),
        endDate: inDays(365),
        contractValue: 100000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    expect(r1Id).toBeDefined();

    // ตรวจสอบว่า Backend บันทึกลง DB เป็น -R1 จริง
    const r1Data = (await w.api.get(`/api/pm/contracts/${r1Id}`)).body;
    const r1Contract = r1Data?.data || r1Data;
    expect(r1Contract.contractNo).toBe(`${contractNo}-R1`);

    // 2.3 ยกเลิกสัญญาฉบับ -R1
    const cancelRes = await w.api.post(`/api/pm/contracts/${r1Id}/cancel`, { reason: 'ยกเลิกเพื่อทดสอบต่อใหม่' });
    expect(cancelRes.status).toBe(200);

    // 2.4 ตรวจสอบว่า endpoint แนะนำเลขสัญญาถัดไปเป็น -R2
    const nextNoRes = await w.api.get(`/api/pm/contracts/${parentId}/next-renewal-no`);
    expect(nextNoRes.status).toBe(200);
    const nextNo = nextNoRes.body?.nextContractNo ?? nextNoRes.body?.data?.nextContractNo ?? nextNoRes.body?.data ?? nextNoRes.body;
    expect(nextNo).toBe(`${contractNo}-R2`);

    // 2.5 สร้างสัญญาต่ออายุรอบสองโดยส่ง [สร้างอัตโนมัติ] อีกครั้ง
    // Backend Transaction ต้องคำนวณและลงเลขจริงเป็น -R2 อัตโนมัติโดยไม่ชนกับ -R1 ที่เคยมี
    const r2Id = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: `${contractNo}-[สร้างอัตโนมัติ]`,
        parentContractId: parentId,
        contractType,
        signStatus: 'Draft',
        renewalStatus: 'ต่อสัญญาแล้ว',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(1),
        endDate: inDays(365),
        contractValue: 100000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    expect(r2Id).toBeDefined();

    // 2.6 ดึงข้อมูลสัญญาที่สร้างใหม่เพื่อยืนยันว่าบันทึกสำเร็จด้วยเลข -R2
    const getR2Res = await w.api.get(`/api/pm/contracts/${r2Id}`);
    expect(getR2Res.status).toBe(200);
    const r2Data = getR2Res.body?.data || getR2Res.body;
    expect(r2Data.contractNo).toBe(`${contractNo}-R2`);
  });

  test('3. อัปเดตสิทธิ์: บันทึก Program Permissions สำเร็จและไม่เกิด 500 Error', async () => {
    const rolesRes = await w.api.get(`/api/su/business-roles/lov?businessId=${w.api.businessId}`);
    expect(rolesRes.status).toBe(200);
    const roles = rolesRes.body?.data || rolesRes.body || [];
    if (roles.length > 0) {
      const roleId = roles[0].id || roles[0].value;
      const bulkSaveRes = await w.api.post('/api/su/business-role-programs/bulk-save', {
        roleId,
        modules: []
      });
      expect(bulkSaveRes.status).toBe(200);
    }
  });

});
