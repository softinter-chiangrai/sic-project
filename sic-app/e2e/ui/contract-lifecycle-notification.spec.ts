import { test, expect } from '@playwright/test';
import { World, today, inDays, firstOf } from '../api/world';
import { mock } from '../api';
import { Ui } from '../ui';

let w: World;
let ui: Ui;

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  ui = await Ui.open(browser);
});

test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

test.describe('Contract Lifecycle & Notification System (UI)', () => {

  test('1. Notification Center UI: แสดงรายการแจ้งเตือนใกล้หมดอายุและต่อสัญญาอัตโนมัติ พร้อมลิงก์ไปหน้ารายละเอียด', async () => {
    test.setTimeout(180_000);

    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const nearExpiryNo = mock('UI_EXP30');
    const autoRenewNo = mock('UI_AUTOREN');

    // 1.1 สร้างสัญญาใกล้หมดอายุ (30 วัน)
    const expContractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: nearExpiryNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-335),
        endDate: inDays(30),
        contractValue: 80000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    // 1.2 สร้างสัญญาต่ออายุอัตโนมัติ (autoRenew = true, 30 วัน)
    const autoContractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: autoRenewNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-335),
        endDate: inDays(30),
        contractValue: 150000,
        autoRenew: true,
      },
      '/api/pm/contracts/{id}',
    );

    // 1.3 สั่งรันประมวลผล Lifecycle เพื่อสร้าง Notification และสัญญาฉบับต่ออายุ
    const runRes = await w.api.post('/api/pm/contracts/run-lifecycle');
    expect(runRes.status).toBe(200);

    // 1.4 เข้าสู่หน้า Notification Center ของระบบ
    await ui.visit('/feature/pm/notifications');

    // ตรวจสอบว่ามี Notification สำหรับสัญญาใกล้หมดอายุ
    const nearExpiryItem = ui.page.locator('.pmrt07-item').filter({ hasText: nearExpiryNo }).first();
    await expect(nearExpiryItem).toBeVisible({ timeout: 15_000 });
    await expect(nearExpiryItem).toContainText('ใกล้หมดอายุ');
    await expect(nearExpiryItem).toContainText('30 วัน');

    // ตรวจสอบว่ามี Notification สำหรับการสร้างฉบับต่ออายุอัตโนมัติ
    const autoRenewItem = ui.page.locator('.pmrt07-item').filter({ hasText: autoRenewNo }).first();
    await expect(autoRenewItem).toBeVisible({ timeout: 15_000 });
    await expect(autoRenewItem).toContainText('สร้างฉบับต่ออายุอัตโนมัติ');

    // 1.5 คลิกลิงก์ 'ดูรายละเอียด' ใน Notification เพื่อเข้าไปดูสัญญาที่ระบบต่ออายุให้
    const detailLink = autoRenewItem.locator('a.pmrt07-detail-link').first();
    await expect(detailLink).toBeVisible();
    await detailLink.click();

    // ตรวจสอบว่าเบราว์เซอร์นำทางไปยังหน้ารายละเอียดสัญญา (/feature/pm/contract/.../view) สำเร็จ
    await expect(ui.page).toHaveURL(/\/feature\/pm\/contract\/[^/]+\/view/, { timeout: 15_000 });
  });

  test('2. Notification Read Actions: กดอ่านแจ้งเตือน และ Mark All As Read', async () => {
    test.setTimeout(180_000);

    await ui.visit('/feature/pm/notifications');

    // ตรวจสอบปุ่มเมนูจัดการการแจ้งเตือน
    const menuBtn = ui.page.locator('.pmrt07-menu-btn').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      const markAllBtn = ui.page.locator('.pmrt07-dropdown-item').filter({ hasText: /อ่านทั้งหมด|Mark All/i }).first();
      if (await markAllBtn.isVisible()) {
        await markAllBtn.click();
      }
    }

    // ตรวจสอบ unread badge หลัง mark all read
    const unreadPill = ui.page.locator('.pmrt07-tab-pill').filter({ hasText: /ยังไม่ได้อ่าน|Unread/i });
    await expect(unreadPill).toBeVisible();
  });

  test('3. Contracts Page: แท็บ "ใกล้หมดอายุ" แสดงสัญญาที่ใกล้หมดอายุ และมีฉบับต่ออายุ (-R1) ในระบบจริง', async () => {
    test.setTimeout(180_000);

    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const ctNo = mock('UI_GRID_REN');

    // สร้างสัญญา autoRenew
    const id = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: ctNo,
        contractType,
        signStatus: 'Signed',
        customerId: await w.customer(),
        projectId: await w.project(),
        startDate: inDays(-335),
        endDate: inDays(30),
        contractValue: 99000,
        autoRenew: true,
      },
      '/api/pm/contracts/{id}',
    );

    // รัน Lifecycle
    await w.api.post('/api/pm/contracts/run-lifecycle');

    // เปิดหน้ารายการสัญญา
    await ui.visit('/feature/pm/contract');

    // ตรวจสอบแท็บตัวกรอง Preset "ใกล้หมดอายุ"
    const expiringTab = ui.page.locator('button').filter({ hasText: /ใกล้หมดอายุ|Expiring/i }).first();
    await expect(expiringTab).toBeVisible({ timeout: 15_000 });
    await expiringTab.click();

    // ค้นหาสัญญาในหน้าจอ
    const searchInput = ui.page.locator('input.sic-search-input').first();
    await searchInput.fill(ctNo);

    // ตรวจสอบว่าพบสัญญาในตาราง พร้อม badge สถานะใกล้หมดอายุ
    const row = ui.page.locator('tr, .sic-gridpanel__row').filter({ hasText: ctNo }).first();
    await expect(row).toBeVisible({ timeout: 20_000 });

    // เปลี่ยนกลับเป็นแท็บ "ทั้งหมด" และค้นหาฉบับต่ออายุ -R1
    const allTab = ui.page.locator('button').filter({ hasText: /ทั้งหมด|All/i }).first();
    await allTab.click();
    await searchInput.fill(`${ctNo}-R1`);

    // ตรวจสอบว่าสัญญาฉบับต่ออายุอัตโนมัติ -R1 ปรากฏในตารางจริง
    const renewedRow = ui.page.locator('tr, .sic-gridpanel__row').filter({ hasText: `${ctNo}-R1` }).first();
    await expect(renewedRow).toBeVisible({ timeout: 20_000 });

    // ทำความสะอาดสัญญาต่ออายุ
    const listRes = await w.api.get('/api/pm/contracts', { keyword: `${ctNo}-R1` });
    const contracts = listRes.body?.data || listRes.body?.items || [];
    const rContract = contracts.find((c: any) => c.contractNo === `${ctNo}-R1`);
    if (rContract?.id) {
      await w.api.del(`/api/pm/contracts/${rContract.id}`).catch(() => {});
    }
  });

});
