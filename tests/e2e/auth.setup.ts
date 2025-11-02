import { test as setup, expect } from '@playwright/test';
import path from 'path';

/**
 * Authentication Setup for Playwright Tests
 * 
 * This file handles authentication setup for E2E tests.
 * It logs in once and saves the authentication state to be reused across tests.
 * 
 * Usage:
 * 1. Add to playwright.config.ts:
 *    projects: [
 *      { name: 'setup', testMatch: /.*\.setup\.ts/ },
 *      { 
 *        name: 'authenticated', 
 *        dependencies: ['setup'],
 *        use: { storageState: 'tests/.auth/user.json' }
 *      }
 *    ]
 * 
 * 2. Run: npx playwright test
 */

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate as ops user', async ({ page }) => {
  // Navigate to login page
  await page.goto('/auth/v2/login');

  // Wait for login form to be ready
  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

  // TODO: Fill in actual login credentials (use env vars)
  const email = process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  // Fill login form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  // Submit form
  await page.getByRole('button', { name: /continue|sign in|login/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/);

  // Verify we're logged in by checking for user menu
  await expect(page.getByRole('button', { name: /arham khan|user menu/i })).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

setup('authenticate as investor user', async ({ page }) => {
  // Similar to above but for investor user
  const authFileInvestor = path.join(__dirname, '../.auth/investor.json');
  
  await page.goto('/auth/v2/login');
  
  // TODO: Use investor credentials
  const email = process.env.TEST_INVESTOR_EMAIL || 'investor@example.com';
  const password = process.env.TEST_INVESTOR_PASSWORD || 'TestPassword123!';
  
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /continue|sign in|login/i }).click();
  
  await page.waitForURL(/\/dashboard/);
  await page.context().storageState({ path: authFileInvestor });
});

setup('authenticate as borrower user', async ({ page }) => {
  // Similar to above but for borrower user
  const authFileBorrower = path.join(__dirname, '../.auth/borrower.json');
  
  await page.goto('/auth/v2/login');
  
  // TODO: Use borrower credentials
  const email = process.env.TEST_BORROWER_EMAIL || 'borrower@example.com';
  const password = process.env.TEST_BORROWER_PASSWORD || 'TestPassword123!';
  
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /continue|sign in|login/i }).click();
  
  await page.waitForURL(/\/dashboard/);
  await page.context().storageState({ path: authFileBorrower });
});

