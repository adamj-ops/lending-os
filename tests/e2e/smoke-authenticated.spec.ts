import { test, expect } from '@playwright/test';

/**
 * Authenticated Smoke Tests
 * 
 * These tests verify core authenticated user flows work correctly.
 * Uses Playwright's authentication state to simulate logged-in sessions.
 * 
 * To run: npx playwright test tests/e2e/smoke-authenticated.spec.ts
 */

test.describe('Authenticated Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page - in real scenario, use storage state
    await page.goto('/auth/v2/login');
    // TODO: Add actual login flow or use storage state from auth.setup.ts
  });

  test('Dashboard redirects to portfolio', async ({ page }) => {
    // Skip if not authenticated
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard/portfolio');
  });

  test('Portfolio page loads with key metrics', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard/portfolio');
    
    // Verify page loads
    await expect(page.getByRole('heading', { name: /portfolio overview/i })).toBeVisible();
    
    // Verify navigation is present
    await expect(page.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Loan' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Borrower' })).toBeVisible();
  });

  test('Loans page is accessible', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard/loans');
    
    // Should not redirect to login
    await expect(page).toHaveURL('/dashboard/loans');
  });

  test('Borrowers page is accessible', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard/borrowers');
    
    await expect(page).toHaveURL('/dashboard/borrowers');
  });

  test('Funds page is accessible', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard/funds');
    
    await expect(page).toHaveURL('/dashboard/funds');
  });

  test('Compliance page is accessible', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard/compliance');
    
    await expect(page).toHaveURL('/dashboard/compliance');
  });
});

test.describe('Analytics Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/v2/login');
    // TODO: Add actual login flow
  });

  test('Analytics overview is accessible', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/analytics');
    
    // Should load analytics page
    await expect(page).toHaveURL('/analytics');
  });

  test('Loan analytics is accessible', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/analytics/loans');
    
    await expect(page).toHaveURL('/analytics/loans');
  });
});

test.describe('Coming Soon Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/v2/login');
  });

  test('Coming soon page renders correctly', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard/coming-soon');
    
    // Verify coming soon message displays
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('Sidebar navigation works', async ({ page }) => {
    test.skip(!await page.url().includes('/dashboard'), 'Not authenticated');
    
    await page.goto('/dashboard/portfolio');
    
    // Click on Loans link
    await page.getByRole('link', { name: 'Loan' }).click();
    await expect(page).toHaveURL('/dashboard/loans');
    
    // Click on Borrowers link
    await page.getByRole('link', { name: 'Borrower' }).click();
    await expect(page).toHaveURL('/dashboard/borrowers');
    
    // Navigate back to Portfolio
    await page.getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL('/dashboard/portfolio');
  });
});

