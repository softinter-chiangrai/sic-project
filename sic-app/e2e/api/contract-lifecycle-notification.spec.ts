import { test, expect } from '@playwright/test';
import { World, today, inDays, firstOf, idOf } from './world';
import { mock } from '../api';

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w.cleanup();
});

const data = (b: any) => b?.data ?? b;

test.describe('Contract Lifecycle & Notification System (API)', () => {

  test('1. ใกล้หมดเวลา: สัญญาเหลือ 30 วัน จะต้องได้รับ Notification แจ้งเตือนใกล้หมดอายุ', async () => {
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('EXP30');

    // สร้างสัญญาที่ลงนามแล้ว (Signed) และวันหมดอายุเหลือ 30 วันพอดี
    const contractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-335),
        endDate: inDays(30),
        contractValue: 50000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    // รัน Lifecycle check
    const runRes = await w.api.post('/api/pm/contracts/run-lifecycle', undefined, { date: today() });
    expect(runRes.status).toBe(200);

    // ตรวจสอบการแจ้งเตือนในระบบ (/api/su/notifications)
    const notifRes = await w.api.get('/api/su/notifications', { unreadOnly: true, size: 200 });
    expect(notifRes.status).toBe(200);
    const items = notifRes.body?.items || [];

    const expiryNotif = items.find((n: any) =>
      n.title?.includes(contractNo) || n.message?.includes(contractNo),
    );

    expect(expiryNotif, `Notification for near-expiry contract ${contractNo} must exist`).toBeDefined();
    expect(expiryNotif.title).toContain('ใกล้หมดอายุ');
    expect(expiryNotif.message).toContain('30 วัน');
    expect(expiryNotif.type).toBe('CONTRACT');
    expect(expiryNotif.linkUrl).toContain(contractId);
  });

  test('2. ต่อสัญญาอัตโนมัติ: สัญญาที่เปิด autoRenew เมื่อใกล้หมดเวลาจะสร้างฉบับต่ออายุ (-R1) และแจ้งเตือนจริง', async () => {
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('AUTOREN');

    // สร้างสัญญาที่เปิด autoRenew = true และเหลือ 30 วัน
    const originalContractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-335),
        endDate: inDays(30),
        contractValue: 120000,
        autoRenew: true,
      },
      '/api/pm/contracts/{id}',
    );

    // รัน Lifecycle check
    const runRes = await w.api.post('/api/pm/contracts/run-lifecycle', undefined, { date: today() });
    expect(runRes.status).toBe(200);

    // 1. ตรวจสอบ Notification แจ้งเตือนการสร้างฉบับต่ออายุอัตโนมัติ
    const notifRes = await w.api.get('/api/su/notifications', { size: 200 });
    expect(notifRes.status).toBe(200);
    const items = notifRes.body?.items || [];

    const autoRenewNotif = items.find((n: any) =>
      n.title?.includes('สร้างฉบับต่ออายุอัตโนมัติ') && n.message?.includes(contractNo),
    );
    expect(autoRenewNotif, `Auto-renew notification for ${contractNo} must exist`).toBeDefined();
    expect(autoRenewNotif.title).toBe('สร้างฉบับต่ออายุอัตโนมัติ');

    // 2. ตรวจสอบว่าในระบบมีสัญญาฉบับต่ออายุ (-R1) ถูกสร้างขึ้นจริง
    const listRes = await w.api.get('/api/pm/contracts', { keyword: contractNo });
    expect(listRes.status).toBe(200);
    const contracts = listRes.body?.data || listRes.body?.items || [];

    const renewedContract = contracts.find((c: any) =>
      c.contractNo === `${contractNo}-R1` || c.parentContractId === originalContractId,
    );

    expect(renewedContract, `Draft renewed contract ${contractNo}-R1 must be created automatically in system`).toBeDefined();
    expect(renewedContract.contractNo).toBe(`${contractNo}-R1`);
    expect(renewedContract.parentContractId).toBe(originalContractId);
    expect(renewedContract.signStatus).toBe('Draft');
    expect(renewedContract.autoRenew).toBe(true);

    // ทำความสะอาดสัญญาต่ออายุที่ระบบสร้างขึ้นอัตโนมัติ
    if (renewedContract?.id) {
      await w.api.del(`/api/pm/contracts/${renewedContract.id}`).catch(() => {});
    }
  });

  test('3. เกินเวลาที่กำหนด: สัญญาที่หมดอายุแล้ว (Overdue/Expired) จะแจ้งเตือนเกินกำหนดเวลา', async () => {
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('OVERDUE');

    // สร้างสัญญาที่หมดอายุเกินกำหนดไปแล้ว 2 วัน (endDate = today - 2)
    const contractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-367),
        endDate: inDays(-2),
        contractValue: 75000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    // รัน Lifecycle check
    const runRes = await w.api.post('/api/pm/contracts/run-lifecycle', undefined, { date: today() });
    expect(runRes.status).toBe(200);

    // ตรวจสอบ Notification เกินกำหนดเวลา
    const notifRes = await w.api.get('/api/su/notifications', { size: 200 });
    expect(notifRes.status).toBe(200);
    const items = notifRes.body?.items || [];

    const overdueNotif = items.find((n: any) =>
      (n.title?.includes(contractNo) || n.message?.includes(contractNo)) &&
      (n.title?.includes('เกินกำหนดระยะเวลา') || n.title?.includes('หมดอายุ')),
    );

    expect(overdueNotif, `Overdue notification for ${contractNo} must exist`).toBeDefined();
    expect(overdueNotif.message).toContain('2 วัน');

    // ตรวจสอบสถานะ lifecycle ของสัญญาในระบบ
    const getRes = await w.api.get(`/api/pm/contracts/${contractId}`);
    expect(getRes.status).toBe(200);
    const contractData = data(getRes.body);
    expect(contractData.lifecycleStatus).toBe('EXPIRED');
  });

  test('4. ระบบจัดการ Notification: Unread count, Mark as read และ Mark all as read ทำงานได้ถูกต้อง', async () => {
    // ดึงจำนวน Unread
    const unreadCountBefore = (await w.api.get('/api/su/notifications/unread-count')).body?.unreadCount;
    expect(typeof unreadCountBefore).toBe('number');

    const notifs = (await w.api.get('/api/su/notifications', { unreadOnly: true, size: 5 })).body?.items || [];
    if (notifs.length > 0) {
      const target = notifs[0];
      // Mark single as read
      const markRes = await w.api.put(`/api/su/notifications/${target.id}/read`);
      expect(markRes.status).toBe(200);
    }

    // Mark all as read
    const markAllRes = await w.api.put('/api/su/notifications/read-all');
    expect(markAllRes.status).toBe(200);

    const unreadCountAfter = (await w.api.get('/api/su/notifications/unread-count')).body?.unreadCount;
    expect(unreadCountAfter).toBe(0);
  });

});
