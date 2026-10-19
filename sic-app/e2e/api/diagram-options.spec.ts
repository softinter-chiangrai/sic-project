import { test, expect } from '@playwright/test';
import { World, today, inDays } from './world';
import { mock } from '../api';

// Every drawing type is one "Diagram" option: approval flows (document type) and project status
// (was DFD / ER separately). Records come from World and are removed in afterAll.

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w?.cleanup();
});

const list = (body: any): any[] => body?.data?.content ?? body?.content ?? body?.data ?? body ?? [];

test('approval flows: one DIAGRAM flow, none for DFD or ER', async () => {
  const flows = list((await w.api.get('/api/pm/approvals/flows')).body);
  const types = flows.map((f: any) => String(f.documentType).toUpperCase());
  expect(types).toContain('DIAGRAM');
  expect(types).not.toContain('DFD');
  expect(types).not.toContain('ER');
  for (const t of ['DFD', 'ER']) expect(list((await w.api.get(`/api/pm/approvals/flows/document-type/${t}`)).body)).toEqual([]);
});

test('impact analysis counts linked diagrams of any drawing type (Flowchart, Use Case), not only DFD / ER', async () => {
  const projectId = await w.project();
  const requirementId = await w.requirement();
  const diagrams: string[] = [];
  for (const [diagramType, script] of [['Flowchart', 'flowchart TD\n  A-->B'], ['Use Case', 'flowchart LR\n  U((User))-->L[Login]']]) {
    const id = await w.make('/api/diagram/tabs', { name: `E2E ${diagramType}`, diagramType, projectId, mermaidScript: script }, '/api/diagram/tabs/{id}');
    // the picker links a diagram with its drawing type
    const link = await w.api.post('/api/trace/links', { projectId, sourceType: 'REQUIREMENT', sourceId: requirementId, targetType: diagramType, targetId: id, relationshipType: 'DESIGNED_BY' });
    expect(link.status, JSON.stringify(link.body)).toBeLessThan(300);
    diagrams.push(id);
  }
  const res = await w.api.get('/api/pm/impact-analysis/preview', { targetType: 'REQUIREMENT', targetId: requirementId });
  expect(res.status, JSON.stringify(res.body)).toBe(200);
  const impacted: string[] = (res.body.data ?? res.body).impactedDiagramIds ?? [];
  for (const id of diagrams) expect(impacted, 'impacted diagram ids').toContain(id);
});

test('project status "Diagram Design" saves, and searching "dfd" or "er" finds it', async () => {
  const projectName = `${w.projectName} diagram status`;
  await w.make(
    '/api/pm/customer-projects',
    { customerId: await w.customer(), projectCode: mock('P'), projectName, status: 'Diagram Design', startDate: today(), plannedEndDate: inDays(30) },
    '/api/pm/customer-projects/{id}',
  );
  for (const keyword of ['dfd', 'er', 'diagram']) {
    const found = list((await w.api.get('/api/pm/customer-projects', { keyword, page: 0, size: 200 })).body);
    expect(found.some((p: any) => p.projectName === projectName && p.status === 'Diagram Design'), `keyword ${keyword}`).toBe(true);
  }
});
