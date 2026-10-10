import { test, expect } from '@playwright/test';
import { seededApi } from '../api';
import { getEndpoints } from './endpoints';

// Backend maps every RuntimeException to 400, so a bug can hide behind a 4xx: also look for internal-error signatures.
const INTERNAL = /no session|could not initialize proxy|could not execute|NullPointer|Unimplemented|ClassCast|IndexOutOfBounds|LazyInitialization|JDBC|SQL|violates/i;

// ex_example has no Flyway migration (real DB too): the whole /api/ex module cannot work yet.
const KNOWN_BROKEN = ['/api/ex/examples'];

// Every param-less GET must not blow up (no 5xx, no leaked internals). Plain 4xx is fine: some need query params.
test('GET endpoints never answer 5xx or leak internal errors', async () => {
  test.setTimeout(10 * 60_000);
  const api = await seededApi();
  const bad: string[] = [];
  for (const path of getEndpoints) {
    if (KNOWN_BROKEN.some((k) => path.startsWith(k))) { test.info().annotations.push({ type: 'known-issue', description: path }); continue; }
    const r = await api.get(path);
    const text = typeof r.body === 'string' ? r.body : JSON.stringify(r.body);
    if (r.status >= 500 || (r.status >= 400 && INTERNAL.test(text))) bad.push(`${r.status} GET ${path} ${text.slice(0, 160)}`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});
