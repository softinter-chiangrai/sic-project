import { test, expect } from '@playwright/test';
import { World } from './world';

test.describe.configure({ mode: 'serial' });

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w.cleanup();
});

const SAMPLE_ER_XML = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="orders&#xa;id: PK&#xa;customer_id: UUID&#xa;status: varchar&#xa;total_amount: decimal" vertex="1" parent="1"/>
    <mxCell id="3" value="order_items&#xa;id: PK&#xa;order_id: UUID&#xa;product_id: UUID&#xa;quantity: int" vertex="1" parent="1"/>
    <mxCell id="4" edge="1" source="2" target="3" parent="1"/>
  </root>
</mxGraphModel>
`;

test('AI Database Design Validation - Thai (TH)', async () => {
  const payload = {
    xml: SAMPLE_ER_XML,
    vendor: 'postgresql',
    pageName: 'Orders Module',
    lang: 'th',
  };

  const res = await w.api.post('/api/ai/validate-db-design', payload);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('score');
  expect(res.body).toHaveProperty('grade');
  expect(res.body).toHaveProperty('summary');
  expect(res.body.lang).toBe('th');
  expect(Array.isArray(res.body.missingIndexes)).toBe(true);
  expect(Array.isArray(res.body.normalizationRisks)).toBe(true);
});

test('AI Database Design Validation - English (EN)', async () => {
  const payload = {
    xml: SAMPLE_ER_XML,
    vendor: 'postgresql',
    pageName: 'Orders Module',
    lang: 'en',
  };

  const res = await w.api.post('/api/ai/validate-db-design', payload);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('score');
  expect(res.body).toHaveProperty('grade');
  expect(res.body).toHaveProperty('summary');
  expect(res.body.lang).toBe('en');
  expect(Array.isArray(res.body.missingIndexes)).toBe(true);
});

test('AI Smart Bug Resolution - Thai (TH)', async () => {
  const payload = {
    title: 'Cannot complete checkout when cart has out-of-stock item',
    description: 'User clicks checkout but screen freezes with unhandled promise rejection error',
    stepsToReproduce: '1. Add last item\n2. Wait for item to sell out\n3. Click Checkout',
    environment: 'Staging Chrome 120',
    lang: 'th',
  };

  const res = await w.api.post('/api/pm/bugs/ai-smart-resolution', payload);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('rootCause');
  expect(res.body).toHaveProperty('suggestedFix');
  expect(res.body).toHaveProperty('recommendedSeverity');
  expect(res.body.lang).toBe('th');
});

test('AI Smart Bug Resolution - English (EN)', async () => {
  const payload = {
    title: 'NullPointerException on user profile update',
    description: 'Server returns HTTP 500 when updating profile without phone number',
    stepsToReproduce: '1. Clear phone field\n2. Click Save',
    environment: 'Production',
    lang: 'en',
  };

  const res = await w.api.post('/api/pm/bugs/ai-smart-resolution', payload);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('rootCause');
  expect(res.body).toHaveProperty('suggestedFix');
  expect(res.body).toHaveProperty('recommendedSeverity');
  expect(res.body.lang).toBe('en');
});
