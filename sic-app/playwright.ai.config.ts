import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  testMatch: /ai-refine-overwrite\.spec\.ts/,
  timeout: 30_000,
  workers: 1,
  reporter: [['list']],
});
