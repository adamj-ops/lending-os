import { test, expect } from '@playwright/test';

test.describe('Auth smoke (optional)', () => {
  test('Login page loads and redirects after login (if creds provided)', async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;

    await page.goto('/auth/v2/login');
    await expect(page.getByRole('heading', { name: /login to your account/i })).toBeVisible();

    if (!email || !password) {
      test.skip(true, 'E2E_EMAIL/E2E_PASSWORD not provided; skipping interactive login.');
      return;
    }

    // Attempt a basic credential login if the form fields exist
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    // Expect either dashboard or an auth transition
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toMatch(/auth\/v2\/login/);
  });
});

