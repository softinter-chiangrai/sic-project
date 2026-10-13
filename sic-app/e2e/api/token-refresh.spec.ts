import * as fs from 'node:fs';
import { test, expect, request } from '@playwright/test';
import { API, API_PORT, FIRST_TOKEN } from '../api';

const TOKEN_URL = 'http://localhost:8080/realms/sic-project/protocol/openid-connect/token';

test.describe('Token Lifecycle & Session Refresh', () => {
  test('Refresh token successfully exchanges for a new valid Access Token', async () => {
    test.skip(!fs.existsSync(FIRST_TOKEN), 'Skipping: token file not yet created');

    const { refresh_token } = JSON.parse(fs.readFileSync(FIRST_TOKEN, 'utf8'));
    expect(refresh_token).toBeTruthy();

    const ctx = await request.newContext();
    const tokenRes = await ctx.post(TOKEN_URL, {
      form: {
        grant_type: 'refresh_token',
        client_id: 'sic-app',
        refresh_token,
      },
    });

    expect(tokenRes.ok()).toBe(true);
    const body = await tokenRes.json();

    expect(body.access_token).toBeTruthy();
    expect(body.expires_in).toBeGreaterThan(0);

    // Verify the refreshed access token works on backend API
    const apiRes = await ctx.get(`${API}/api/business/my-business`, {
      headers: {
        Authorization: `Bearer ${body.access_token}`,
      },
    });

    expect(apiRes.status()).toBe(200);
    await ctx.dispose();
  });

  test('Forged or invalid refresh token is rejected by Keycloak', async () => {
    const ctx = await request.newContext();
    const tokenRes = await ctx.post(TOKEN_URL, {
      form: {
        grant_type: 'refresh_token',
        client_id: 'sic-app',
        refresh_token: 'fake.invalid.refresh.token',
      },
    });

    expect(tokenRes.status()).toBe(400);
    const body = await tokenRes.json();
    expect(body.error).toBeTruthy();
    await ctx.dispose();
  });
});
