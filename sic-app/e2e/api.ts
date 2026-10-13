import * as fs from 'node:fs';
import { request, type APIRequestContext } from '@playwright/test';

// E2E_API_PORT lets the test backend run beside a backend you started yourself on :5265 (API tests only; the Angular app is built against :5265)
export const API_PORT = process.env['E2E_API_PORT'] ?? '5265';
export const API = `http://localhost:${API_PORT}`;
const TOKEN_URL = 'http://localhost:8080/realms/sic-project/protocol/openid-connect/token';
export const FIRST_TOKEN = 'e2e/.auth/api-token.json';
export const SECOND_TOKEN = 'e2e/.auth/api-token-2.json';

const cache = new Map<string, { access: string; exp: number }>();

/** Access token from the saved refresh token (rotated tokens are written back). */
async function token(file = FIRST_TOKEN): Promise<string> {
  const hit = cache.get(file);
  if (hit && hit.exp > Date.now() + 30_000) return hit.access;
  const { refresh_token } = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ctx = await request.newContext();
  const r = await ctx.post(TOKEN_URL, { form: { grant_type: 'refresh_token', client_id: 'sic-app', refresh_token } });
  if (!r.ok()) throw new Error(`token refresh failed ${r.status()}: run the setup project again`);
  const j = await r.json();
  fs.writeFileSync(file, JSON.stringify({ refresh_token: j.refresh_token ?? refresh_token }));
  await ctx.dispose();
  cache.set(file, { access: j.access_token, exp: Date.now() + j.expires_in * 1000 });
  return j.access_token;
}

/** Access token of a test user (for clients that are not the REST helper, e.g. WebSocket). */
export const accessToken = (file = FIRST_TOKEN) => token(file);

/** Keycloak user id (JWT sub) of the test user. */
export async function userId(file = FIRST_TOKEN): Promise<string> {
  return JSON.parse(Buffer.from((await token(file)).split('.')[1], 'base64url').toString()).sub;
}

export type Res<T = any> = { status: number; body: T };

/** Tiny REST client against the test backend. businessId (once seeded) goes in X-Business-Id. */
export class Api {
  businessId?: string;
  private ctx?: APIRequestContext;
  /** which Keycloak session signs the requests (first user by default) */
  constructor(private readonly tokenFile = FIRST_TOKEN) {}

  private async call<T>(method: string, path: string, opt: { data?: unknown; params?: Record<string, string | number>; multipart?: Record<string, any> } = {}): Promise<Res<T>> {
    this.ctx ??= await request.newContext({ baseURL: API });
    const headers: Record<string, string> = { Authorization: `Bearer ${await token(this.tokenFile)}` };
    if (this.businessId) headers['X-Business-Id'] = this.businessId;
    const r = await this.ctx.fetch(path, { timeout: 60_000, method, headers, data: opt.data as any, multipart: opt.multipart, params: opt.params });
    const text = await r.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch {}
    return { status: r.status(), body };
  }

  /** GET a binary response (PDF export): the other helpers decode the body as text, which would corrupt it */
  async bytes(path: string, params?: Record<string, string | number>): Promise<{ status: number; data: Buffer }> {
    this.ctx ??= await request.newContext({ baseURL: API });
    const headers: Record<string, string> = { Authorization: `Bearer ${await token(this.tokenFile)}` };
    if (this.businessId) headers['X-Business-Id'] = this.businessId;
    const r = await this.ctx.fetch(path, { timeout: 120_000, method: 'GET', headers, params });
    return { status: r.status(), data: await r.body() };
  }

  /** multipart upload, e.g. upload('/api/storage/upload/image', { file: { name, mimeType, buffer } }) */
  upload = <T = any>(path: string, multipart: Record<string, string | { name: string; mimeType: string; buffer: Buffer }>) => this.call<T>('POST', path, { multipart });
  get = <T = any>(path: string, params?: Record<string, string | number>) => this.call<T>('GET', path, { params });
  post = <T = any>(path: string, data?: unknown, params?: Record<string, string | number>) => this.call<T>('POST', path, { data, params });
  put = <T = any>(path: string, data?: unknown) => this.call<T>('PUT', path, { data });
  del = <T = any>(path: string, data?: unknown) => this.call<T>('DELETE', path, { data });
}

/** Api client already bound to the seeded business. */
export async function seededApi(): Promise<Api> {
  const api = new Api();
  const mine = (await api.get('/api/business/my-business')).body as { id: string; code?: string }[];
  api.businessId = (mine.find((b) => b.code === 'E2E') ?? mine[0]).id; // the seeded business, even if a test created another
  return api;
}

/** Api client of the second user, acting inside the same business (needs the second-user setup). */
export async function secondApi(businessId: string): Promise<Api> {
  const api = new Api(SECOND_TOKEN);
  api.businessId = businessId;
  return api;
}

/** Unique, recognisable mock value, e.g. E2E-4f3a2b. */
export const mock = (prefix = '') => `E2E-${prefix}${Math.random().toString(36).slice(2, 8)}`;
