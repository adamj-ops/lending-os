import { test, expect } from '@playwright/test';

test.describe('Public routes smoke', () => {
  test('Login page renders', async ({ page }) => {
    await page.goto('/auth/v2/login');
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with/i })).toBeVisible();
  });

  test('Register page renders', async ({ page }) => {
    await page.goto('/auth/v2/register');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });

  test('Unauthorized page renders', async ({ page }) => {
    await page.goto('/unauthorized');
    await expect(page.getByRole('heading', { name: 'Unauthorized Access' })).toBeVisible();
  });
});

test.describe('API unauthenticated responses', () => {
  test('Analytics snapshot requires auth', async ({ request }) => {
    const res = await request.get('/api/v1/analytics/snapshots/2024-01-01');
    // Some handlers redirect unauthenticated to login; accept 3xx and 401/403
    expect([401, 403, 302, 307]).toContain(res.status());
  });

  test('Recent events requires auth', async ({ request }) => {
    const res = await request.get('/api/v1/events/recent');
    expect([401, 403, 302, 307]).toContain(res.status());
  });
});
