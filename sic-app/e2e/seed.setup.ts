import { test as setup, expect } from '@playwright/test';
import { Api, SECOND_TOKEN, userId } from './api';
import { sql } from './infra/db';

// Empty throwaway DB: give the test user a profile (SQL, e-mail OTP can't be done by API) and a business (API).
setup('seed profile + business', async () => {
  const api = new Api();
  const first = async (path: string) => (await api.get(path)).body.data[0].value as string;

  if (!(await api.get('/api/profile/activation')).body.profileComplete) {
    const uid = await userId();
    sql(
      `INSERT INTO su_profile (id, created_date, updated_date, user_id, title_id, first_name_en, first_name_local, email)
       VALUES (gen_random_uuid(), now(), now(), '${uid}', '${await first('/api/profile/combobox-title')}', 'E2E', 'E2E', 'e2e@example.test')`,
    );
  }

  if (!(await api.get('/api/business/activation')).body) {
    const personTypes = (await api.get('/api/business/lov-person-type')).body;
    const r = await api.post('/api/business/save', {
      state: 4, // ADDED
      businessCode: 'E2E',
      personType: personTypes[0].value ?? personTypes[0].code,
      titleId: await first('/api/profile/combobox-title'),
      firstNameEn: 'E2E Business',
      firstNameLocal: 'E2E Business',
      countryId: await first('/api/profile/combobox-country'),
      isActive: true,
    });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
  }
  expect((await api.get('/api/business/activation')).body).toBe(true);

  // Second user: profile (SQL, same reason as above) + membership of the same business (API, done by the first user).
  const uid2 = await userId(SECOND_TOKEN);
  if (!sql(`select 1 from su_profile where user_id='${uid2}'`)) {
    sql(
      `INSERT INTO su_profile (id, created_date, updated_date, user_id, title_id, first_name_en, first_name_local, email)
       VALUES (gen_random_uuid(), now(), now(), '${uid2}', '${await first('/api/profile/combobox-title')}', 'E2E2', 'E2E2', 'e2e-second@example.test')`,
    );
  }
  const businessId = (await api.get('/api/business/my-business')).body[0].id as string;
  if (!sql(`select 1 from su_user_business where user_id='${uid2}' and business_id='${businessId}' and is_delete=false`)) {
    const m = await api.post('/api/su-user-business/members', undefined, { businessId, userId: uid2 });
    expect(m.status, JSON.stringify(m.body)).toBeLessThan(300);
  }
  const second = new Api(SECOND_TOKEN);
  expect((await second.get('/api/business/my-business')).body.length, 'second user must belong to the business').toBeGreaterThan(0);
});
