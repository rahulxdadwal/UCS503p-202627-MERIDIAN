import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 180_000,
  expect: { timeout: 120_000 },
  workers: 1,
  retries: 0,
  reporter: 'list',
  outputDir: 'test-results',
});
