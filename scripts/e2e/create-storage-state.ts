/*
  Usage:
  E2E_EMAIL=... E2E_PASSWORD=... npx tsx scripts/e2e/create-storage-state.ts
  Produces: .playwright/auth.json which will be used if E2E_STORAGE_STATE points to it.
*/
import { chromium } from '@playwright/test';
import fs from 'fs';

async function main() {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    console.error('E2E_EMAIL and E2E_PASSWORD are required to create storage state.');
    process.exit(1);
  }
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:3000/auth/v2/login');

  // Try generic selectors; adjust to your login form if needed
  await page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).fill(email);
  await page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  await page.waitForLoadState('networkidle');
  await context.storageState({ path: '.playwright/auth.json' });
  await browser.close();
  console.log('✅ Storage state saved to .playwright/auth.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

