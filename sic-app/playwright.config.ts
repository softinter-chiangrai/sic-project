import { defineConfig } from '@playwright/test';

try { process.loadEnvFile('e2e/.env.local'); } catch {}

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:4200', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm start', url: 'http://localhost:4200', reuseExistingServer: true, timeout: 300_000 },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'pages', testMatch: /pages\.spec\.ts/, dependencies: ['setup'], use: { storageState: 'e2e/.auth/user.json' } },
  ],
});
