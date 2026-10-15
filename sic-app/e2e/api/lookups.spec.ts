import { test, expect, request } from '@playwright/test';
import { seededApi, API, type Api } from '../api';

// ComboboxController (/api/profile/combobox-*) and HealthController had only a "returns 200" smoke check.
// Here: the paged lists really page, `value` returns that one row, `keyword` narrows, and the address lists chain province -> district -> sub-district.
let api: Api;
test.beforeAll(async () => {
  api = await seededApi();
});

const C = '/api/profile';
const rows = (b: any): { value: any; text: string }[] => b.data ?? [];

test('GET /health is public and says the API is up', async () => {
  const ctx = await request.newContext({ baseURL: API }); // no token on purpose
  const r = await ctx.get('/health');
  expect(r.status()).toBe(200);
  const b = await r.json();
  expect(b.service).toBe('sic-api');
  expect(b.status).toBe('ok');
  expect(Number.isNaN(Date.parse(b.utc)), `utc is not a date: ${b.utc}`).toBe(false);
});

for (const name of ['title', 'country', 'province']) {
  test.describe(`combobox-${name}`, () => {
    test('has rows with value + text, and pageSize is honoured', async () => {
      const r = await api.get(`${C}/combobox-${name}`, { pageNumber: 1, pageSize: 3 });
      expect(r.status, JSON.stringify(r.body).slice(0, 200)).toBe(200);
      const list = rows(r.body);
      expect(list.length, `${name} list is empty (seed data missing?)`).toBeGreaterThan(0);
      expect(list.length).toBeLessThanOrEqual(3);
      for (const x of list) {
        expect(x.value, `${name}: row without value`).toBeTruthy();
        expect(x.text, `${name}: row without text`).toBeTruthy();
      }
    });

    test('page 2 is a different page than page 1', async () => {
      const p1 = rows((await api.get(`${C}/combobox-${name}`, { pageNumber: 1, pageSize: 2 })).body);
      const p2 = rows((await api.get(`${C}/combobox-${name}`, { pageNumber: 2, pageSize: 2 })).body);
      test.skip(p2.length === 0, `only ${p1.length} ${name} row(s): nothing to page`);
      expect(p2.map((x) => x.value).filter((v) => p1.some((y) => y.value === v)), 'same row on two pages').toEqual([]);
    });

    test('value returns exactly that row, keyword narrows to matching text', async () => {
      const all = rows((await api.get(`${C}/combobox-${name}`, { pageNumber: 1, pageSize: 50 })).body);
      const one = all[0];
      const byValue = rows((await api.get(`${C}/combobox-${name}`, { value: one.value })).body);
      expect(byValue.map((x) => x.value)).toEqual([one.value]);
      const word = one.text.slice(0, 2);
      const found = rows((await api.get(`${C}/combobox-${name}`, { keyword: word, pageSize: 50 })).body);
      expect(found.length, `keyword "${word}" found nothing although "${one.text}" exists`).toBeGreaterThan(0);
      expect(found.length).toBeLessThanOrEqual(all.length);
    });

    test('a keyword nobody matches gives an empty list, not an error', async () => {
      const r = await api.get(`${C}/combobox-${name}`, { keyword: 'zzzz-no-such-value-9q8w7e' });
      expect(r.status).toBe(200);
      expect(rows(r.body)).toEqual([]);
    });
  });
}

test('province -> district -> sub-district chain only returns children of the parent', async () => {
  const province = rows((await api.get(`${C}/combobox-province`, { pageSize: 5 })).body)[0];
  const districts = rows((await api.get(`${C}/combobox-district`, { provinceId: province.value, pageSize: 200 })).body);
  expect(districts.length, `province "${province.text}" has no district`).toBeGreaterThan(0);
  // a different province must not return the same districts
  const other = rows((await api.get(`${C}/combobox-province`, { pageSize: 5 })).body).find((p) => p.value !== province.value);
  if (other) {
    const otherDistricts = rows((await api.get(`${C}/combobox-district`, { provinceId: other.value, pageSize: 200 })).body);
    expect(otherDistricts.filter((d) => districts.some((x) => x.value === d.value)), 'district listed under two provinces').toEqual([]);
  }
  const subs = rows((await api.get(`${C}/combobox-sub-district`, { districtId: districts[0].value, pageSize: 200 })).body);
  expect(subs.length, `district "${districts[0].text}" has no sub-district`).toBeGreaterThan(0);
  const one = rows((await api.get(`${C}/combobox-sub-district`, { value: subs[0].value })).body);
  expect(one.map((x) => x.value)).toEqual([subs[0].value]);
});

test('combobox-role lists the business roles', async () => {
  const r = await api.get(`${C}/combobox-role`);
  expect(r.status).toBe(200);
  expect(Array.isArray(r.body)).toBe(true);
  expect(r.body.length).toBeGreaterThan(0);
});

test('combobox-members lists the business members, and value finds one', async () => {
  const r = await api.get(`${C}/combobox-members`, { businessId: api.businessId! });
  expect(r.status, JSON.stringify(r.body).slice(0, 200)).toBe(200);
  const list = rows(r.body);
  expect(list.length, 'the seeded user is a member of the business').toBeGreaterThan(0);
  const byValue = rows((await api.get(`${C}/combobox-members`, { businessId: api.businessId!, value: String(list[0].value) })).body);
  expect(byValue.map((x) => String(x.value))).toEqual([String(list[0].value)]);
});

test('the same lists answer under /api/business too (second base path of the controller)', async () => {
  const r = await api.get('/api/business/combobox-country', { pageSize: 2 });
  expect(r.status).toBe(200);
  expect(rows(r.body).length).toBeGreaterThan(0);
});

test('without a token the lists are refused', async () => {
  const ctx = await request.newContext({ baseURL: API });
  const r = await ctx.get(`${C}/combobox-country`);
  expect([401, 403]).toContain(r.status());
});
