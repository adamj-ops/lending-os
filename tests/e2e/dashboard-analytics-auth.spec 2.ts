import { test, expect } from '@playwright/test';

test.describe('Authenticated dashboard + analytics', () => {
  test.skip(!process.env.E2E_STORAGE_STATE && !process.env.E2E_EMAIL, 'Provide storage state or E2E_EMAIL/PASSWORD.');

  test('Dashboard portfolio renders', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/Portfolio Overview/i)).toBeVisible({ timeout: 10000 });
  });

  test('Analytics overview renders', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByText(/Analytics Overview/i)).toBeVisible({ timeout: 10000 });
  });
});

