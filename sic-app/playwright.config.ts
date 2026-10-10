import { defineConfig } from '@playwright/test';

try { process.loadEnvFile('e2e/.env.local'); } catch {}

// Angular dev server is only needed by UI projects; skip it when the CLI selects API-only projects.
const selected = process.argv.flatMap((a, i, all) => (a.startsWith('--project=') ? [a.slice(10)] : a === '--project' ? [all[i + 1]] : []));
const apiOnly = selected.length > 0 && selected.every((p) => ['api', 'seed', 'setup-api'].includes(p));

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  workers: 1,
  retries: 1, // UI steps depend on a loaded dev machine; a real defect fails twice
  globalSetup: './e2e/global.setup.ts', // backend -> throwaway DB sic_app_e2e
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { actionTimeout: 15_000, baseURL: 'http://localhost:4200', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: apiOnly ? undefined : { command: 'npm start', url: 'http://localhost:4200', reuseExistingServer: true, timeout: 300_000 },
  projects: [
    // api: no Angular dev server needed. ui/pages: log in through the app.
    { name: 'setup-api', testMatch: /auth\.setup\.ts/, grep: /API tokens/ },
    { name: 'setup', testMatch: /auth\.setup\.ts/, grep: /via Keycloak/ },
    { name: 'seed', testMatch: /seed\.setup\.ts/, dependencies: ['setup-api'] },
    { name: 'pages', testMatch: /pages\.spec\.ts/, dependencies: ['seed', 'setup'], use: { storageState: 'e2e/.auth/user.json' } },
    { name: 'ui', testMatch: /ui\/.*\.spec\.ts/, dependencies: ['seed', 'setup'], use: { storageState: 'e2e/.auth/user.json' } },
    { name: 'api', testMatch: /api\/.*\.spec\.ts/, dependencies: ['seed'] },
  ],
});
