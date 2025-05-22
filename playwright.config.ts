import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { join } from 'path';

// Define the BDD configuration using defineBddConfig
const bddConfig = defineBddConfig({
  features: './src/features/**/*.feature', // Updated to match nested structure
  steps: './src/steps/**/*.ts', // Allow for nested step files
  outputDir: './src/features-gen', // Relative path for generated files
});

export default defineConfig({
  testDir: './src/features-gen', // Align with outputDir
  testMatch: 'features/**/*.spec.js', // Relative to testDir
  use: {
    headless: process.env.HEADLESS !== 'true', // Default to headless unless explicitly false
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'on',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  reporter: [['list'], ['allure-playwright']],
  // Enable TypeScript execution
  tsConfig: join(__dirname, 'tsconfig.json'),
});