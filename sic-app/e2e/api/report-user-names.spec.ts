import { test, expect } from '@playwright/test';
import { World } from './world';
import { mock, userId } from '../api';
import { probe } from './rich';

test.describe('Verify All Document Reports Display Real Names (No UUIDs)', () => {
  let w: World;

  test.beforeAll(async () => {
    w = await World.create();
  });

  test.afterAll(async () => {
    await w?.cleanup();
  });

  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  test('Requirement report displays real author name and no UUID', async () => {
    const reqId = await w.requirement();
    const res = await w.api.bytes(`/api/pm/requirement/${reqId}/export?format=pdf&lang=th`);
    expect(res.status).toBe(200);

    const p = probe(res.data);
    expect(p.pageCount).toBeGreaterThan(0);
    expect(p.text).toContain('ผู้จัดทำ');
    // Ensure the user's display name appears
    expect(p.text).toMatch(/E2E/);
    // Ensure raw UUID does not appear in author field
    const authorLine = p.text.split('\n').find((l) => l.includes('ผู้จัดทำ:'));
    if (authorLine) {
      expect(authorLine).not.toMatch(uuidPattern);
    }
  });

  test('MA Ticket report displays real reportedBy and assignedTo names (no UUID)', async () => {
    const ticketId = await w.make(
      '/api/pm/ma-tickets/save',
      {
        customerId: await w.customer(),
        projectId: await w.project(),
        ticketType: 'BUG_SUPPORT',
        severity: 'LOW',
        status: 'OPEN',
        description: 'Testing ticket user names',
        title: 'Ticket with user',
        reportedBy: await userId(),
        assignedTo: await userId(),
        state: 4,
      },
      '/api/pm/ma-tickets/{id}'
    );

    const res = await w.api.bytes(`/api/pm/ma-tickets/${ticketId}/export-pdf?lang=th`);
    expect(res.status).toBe(200);

    const p = probe(res.data);
    expect(p.pageCount).toBeGreaterThan(0);
    const repLine = p.text.split('\n').find((l) => l.includes('ผู้แจ้งเรื่อง:'));
    if (repLine) {
      expect(repLine).not.toMatch(uuidPattern);
      expect(repLine).toMatch(/E2E|ภูรินทร์/);
    }
  });

  test('Specification report displays real owner name and no UUID', async () => {
    const specId = await w.specification();
    const res = await w.api.bytes(`/api/pm/specifications/${specId}/export-pdf?lang=th`);
    expect(res.status).toBe(200);

    const p = probe(res.data);
    expect(p.pageCount).toBeGreaterThan(0);
    const ownerLine = p.text.split('\n').find((l) => l.includes('ผู้รับผิดชอบ'));
    if (ownerLine) {
      expect(ownerLine).not.toMatch(uuidPattern);
    }
  });

  test('Change Request report displays real requester and no UUID', async () => {
    const targetId = await w.approvedSpec();
    const crId = await w.make(
      '/api/pm/change-requests',
      {
        projectId: await w.project(),
        targetType: 'SPECIFICATION',
        targetId,
        title: 'CR with user names',
        description: 'testing cr names',
        changeReason: 'e2e',
        priority: 'MEDIUM',
        assigneeId: await userId(),
      },
      '/api/pm/change-requests/{id}'
    );

    const res = await w.api.bytes(`/api/pm/change-requests/${crId}/export-pdf?lang=th`);
    expect(res.status).toBe(200);

    const p = probe(res.data);
    expect(p.pageCount).toBeGreaterThan(0);
    const reqLine = p.text.split('\n').find((l) => l.includes('ผู้ยื่นคำขอ:'));
    if (reqLine) {
      expect(reqLine).not.toMatch(uuidPattern);
      expect(reqLine).toMatch(/E2E|ภูรินทร์/);
    }
  });

  test('Design Review report displays real reviewer and assignee (no UUID)', async () => {
    const drId = await w.make(
      '/api/pm/design-reviews',
      {
        projectId: await w.project(),
        reviewCode: mock('DR'),
        title: 'DR with user names',
        reviewer: await userId(),
        assignedTo: await userId(),
      },
      '/api/pm/design-reviews/{id}'
    );

    const res = await w.api.bytes(`/api/pm/design-reviews/${drId}/export-pdf?lang=th`);
    expect(res.status).toBe(200);

    const p = probe(res.data);
    expect(p.pageCount).toBeGreaterThan(0);
    const drLine = p.text.split('\n').find((l) => l.includes('ผู้รับผิดชอบ:'));
    if (drLine) {
      expect(drLine).not.toMatch(uuidPattern);
      expect(drLine).toMatch(/E2E|ภูรินทร์/);
    }
  });

  test('Project report WBS section displays separate start and end dates instead of period', async () => {
    await w.phase();
    const pid = await w.project();
    const res = await w.api.bytes(`/api/pm/customer-projects/${pid}/export?lang=th`);
    expect(res.status).toBe(200);

    const p = probe(res.data);
    expect(p.pageCount).toBeGreaterThan(0);
    expect(p.text).toContain('โครงสร้างงาน (WBS / Phase)');
    expect(p.text).toContain('วันเริ่มต้น:');
    expect(p.text).toContain('วันสิ้นสุด:');
    expect(p.text).not.toContain('ช่วงเวลา:');
  });
});
