import { test, expect } from '@playwright/test';
import { World, idOf } from './world';

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w?.cleanup();
});

const data = (b: any) => b?.data ?? b;

test.describe('File Upload & Storage Services (SeaweedFS / API)', () => {
  test('Upload text document -> get URL -> download -> delete', async () => {
    const textContent = 'Hello World from E2E automated storage test';
    const buffer = Buffer.from(textContent, 'utf-8');

    const uploadRes = await w.api.upload('/api/storage/upload/image', {
      file: { name: 'document.txt', mimeType: 'text/plain', buffer },
    });
    expect(uploadRes.status).toBeLessThan(300);

    const fileId = idOf(uploadRes.body) ?? data(uploadRes.body)?.fileId ?? data(uploadRes.body)?.uploadId;
    expect(fileId).toBeTruthy();

    // Activate upload
    await w.api.post(`/api/storage/uploads/${fileId}/activate`);

    // Fetch storage url
    const urlRes = await w.api.get(`/api/storage/url/${fileId}`);
    expect(urlRes.status).toBe(200);

    // Download content
    const dlRes = await w.api.get(`/api/storage/download/${fileId}`);
    expect(dlRes.status).toBe(200);

    // Delete
    const delRes = await w.api.del(`/api/storage/${fileId}`);
    expect(delRes.status).toBeLessThan(300);
  });

  test('Upload PDF binary -> verify file ID created and accessible', async () => {
    // Minimal PDF header
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\nxref\n0 2\n0000000000 65535 f \ntrailer<</Size 2/Root 1 0 R>>\nstartxref\n50\n%%EOF', 'utf-8');

    const uploadRes = await w.api.upload('/api/storage/upload/image', {
      file: { name: 'sample.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
    });
    expect(uploadRes.status).toBeLessThan(300);

    const fileId = idOf(uploadRes.body) ?? data(uploadRes.body)?.fileId ?? data(uploadRes.body)?.uploadId;
    expect(fileId).toBeTruthy();

    await w.api.del(`/api/storage/${fileId}`).catch(() => {});
  });

  test('Downloading non-existent file ID returns 4xx, not server crash', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await w.api.get(`/api/storage/download/${fakeId}`);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
