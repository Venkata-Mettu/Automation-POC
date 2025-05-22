import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as dotenv from 'dotenv';
import { AddUsersPopupPage } from '../pages/AddUsersPopupPage';
dotenv.config();
const { Given, When, Then } = createBdd();

let browser: Browser;
let context: BrowserContext;
let page: Page;
let page1: Page;
let page2: Page;

// State object to hold references to pages across steps
const state: { page1?: Page; page2?: Page } = {};

Given('I am logged in using Microsoft Entra SSO', async () => {
  browser = await chromium.launch({ headless: false, slowMo: 100 });
  context = await browser.newContext();
  page = await context.newPage();

  await page.goto(process.env.SSO_URL || '');

  await page.waitForSelector('a[href*="ExternalLogin/Challenge"][href*="EntraID"]', { state: 'visible' });
  await page.click('a[href*="ExternalLogin/Challenge"][href*="EntraID"]');

  await page.waitForSelector('input[type="email"], input[name="loginfmt"]', { state: 'visible', timeout: 10000 });
  await page.fill('input[type="email"], input[name="loginfmt"]', process.env.SSO_USERNAME || '');
  await page.click('button[type="submit"], input[type="submit"], button:has-text("Next")');

  await page.waitForSelector('input[type="password"], input[name="passwd"]', { state: 'visible', timeout: 10000 });
  await page.fill('input[type="password"], input[name="passwd"]', process.env.SSO_PASSWORD || '');

  await page.waitForSelector('input[type="submit"][id="idSIButton9"], button:has-text("Sign in")', { state: 'visible', timeout: 10000 });
  await page.click('input[type="submit"][id="idSIButton9"], button:has-text("Sign in")');

  try {
    await page.waitForSelector('input[type="submit"][value="Yes"], button:has-text("Yes")', { state: 'visible', timeout: 5000 });
    await page.click('input[type="submit"][value="Yes"], button:has-text("Yes")');
  } catch {}

  await page.waitForURL('**/dashboard', { timeout: 10000 });
});

When('I navigate to the Users section', async () => {
  await page.getByRole('link', { name: '' }).click();
});

When('I click the add users button', async () => {
  await page.getByRole('button', { name: '+ Add User(s)' }).click();
});

When('I fill and submit the popup with email {string}, role {string}, and workspace {string}', async ({}, email, roleId, workspaceId) => {
  console.log(`Filling and submitting popup with email: ${email}, role: ${roleId}, workspace: ${workspaceId}`);
  const popupPage = new AddUsersPopupPage(page);
  await popupPage.inviteUsersForm(email, roleId, workspaceId);
});

Then('the invitation email should be sent to {string}', async ({}, email: string) => {
  await page.waitForTimeout(1000);
});

When('I open Yopmail and check the inbox for {string}', async ({ context }, email) => {
  console.log('Opening Yopmail for:', email);
  const newPage = await context.newPage();
  state.page1 = newPage;
  await newPage.goto(process.env.YOPMAIL_URL || 'https://yopmail.com/');
  try {
    await newPage.locator('.fc-dialog-overlay').click({ timeout: 3000 });
  } catch (e) {
    console.log('No dialog overlay found, proceeding...');
  }
  await newPage.getByRole('textbox', { name: 'Login' }).fill(email);
  await newPage.getByRole('button', { name: /|Check Inbox/i }).click();
});

When('I click the link in the invitation email', async ({}, page1 = state.page1) => {
  console.log('Clicking "Join with e-mail (legacy)" link...');
  const inboxFrame = page1.frameLocator('iframe[name="ifmail"]');
  const page2Promise = page1.waitForEvent('popup');
  await inboxFrame.getByRole('link', { name: /Join with e-mail \(legacy/i }).click();
  state.page2 = await page2Promise;
});

When('I complete the registration form with:', async ({}, dataTable, page2 = state.page2) => {
  const data = dataTable.rowsHash();
  console.log('Completing registration form:', data);
  await page2.getByRole('textbox', { name: 'First Name' }).fill(data['First Name']);
  await page2.getByRole('textbox', { name: 'Last Name' }).fill(data['Last Name']);
  await page2.getByRole('textbox', { name: 'Password', exact: true }).fill(data['Password']);
  await page2.getByRole('textbox', { name: 'Confirm Password' }).fill(data['Confirm Password']);
});

When('I submit the registration', async ({}, page2 = state.page2) => {
  if (!page2) throw new Error('page2 is not initialized');
  await page2.getByRole('button', { name: 'Register' }).click();
});

Then('I should see a confirmation and be able to continue', async ({}, page2 = state.page2) => {
  if (!page2) throw new Error('page2 is not initialized');
  await page2.getByRole('link', { name: 'Continue' }).click();
});

When('I search for {string} in the Users section', async ({}, email: string, page2 = state.page2) => {
  if (!page2) throw new Error('page2 is not initialized');
  await page2.getByRole('link', { name: '' }).click();
  await page2.getByRole('textbox', { name: 'Search user...' }).fill(email);
  await page2.locator('.input-group-text').click();
});

Then('I should see the user "test flow" with email {string} and role {string}', async ({}, email: string, roleText: string, page2 = state.page2) => {
  if (!page2) throw new Error('page2 is not initialized');
  await expect(page2.getByRole('cell', { name: 'test flow' })).toBeVisible();
  await expect(page2.getByRole('cell', { name: email })).toBeVisible();
  await expect(page2.getByText(roleText)).toBeVisible();
});

When('I delete the user {string}', async ({}, email: string, page2 = state.page2) => {
  if (!page2) throw new Error('page2 is not initialized');
  await page2.getByRole('cell', { name: email }).click();
  await page2.getByRole('link', { name: ' Edit' }).click();
  await page2.getByRole('button', { name: ' Delete User' }).click();
  await page2.getByRole('button', { name: 'Yes' }).click();
});

Then('searching for {string} should show "No users found."', async ({}, email: string, page2 = state.page2) => {
  if (!page2) throw new Error('page2 is not initialized');
  await page2.getByRole('textbox', { name: 'Search user...' }).fill(email);
  await page2.locator('.input-group-text').click();
  await expect(page2.getByRole('cell', { name: 'No users found.' })).toBeVisible();
});

// Cleanup after all tests
// After(async () => {
//   await browser?.close();
// });