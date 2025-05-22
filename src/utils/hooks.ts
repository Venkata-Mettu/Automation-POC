// import { Page } from '@playwright/test';
// import { createBdd } from 'playwright-bdd';

// const { Before, After } = createBdd();

// Before(async ({ page }: { page: Page }) => {
//   console.log('Starting test scenario');
// });

// After(async ({ page }: { page: Page }) => {
//   if (scenario.result.status === 'failed') {
//     await page.screenshot({ path: `screenshots/${scenario.pickle.name}-${Date.now()}.png` });
//   }
//   await page.close();
// });