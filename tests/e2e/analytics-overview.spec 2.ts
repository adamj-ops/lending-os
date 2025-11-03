import { test, expect } from '@playwright/test';

test.describe('Analytics Overview Page', () => {
  test('should load analytics overview with KPIs', async ({ page }) => {
    await page.goto('/analytics');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Analytics Overview');
    
    // Verify description
    await expect(page.getByText(/Comprehensive view of portfolio performance/)).toBeVisible();
    
    // Verify KPI sections render
    await expect(page.getByText(/Fund KPIs/i)).toBeVisible();
    await expect(page.getByText(/Loan KPIs/i)).toBeVisible();
    await expect(page.getByText(/Payment KPIs/i)).toBeVisible();
    await expect(page.getByText(/Inspection KPIs/i)).toBeVisible();
  });

  test('should display key insights section', async ({ page }) => {
    await page.goto('/analytics');
    
    await expect(page.getByText(/Key Insights/)).toBeVisible();
    await expect(page.getByText(/AI-powered analysis/)).toBeVisible();
  });

  test('should navigate to domain-specific analytics pages', async ({ page }) => {
    await page.goto('/analytics');
    
    // Click on Loans link (if available in navigation)
    const loansLink = page.getByRole('link', { name: /loans/i });
    if (await loansLink.isVisible()) {
      await loansLink.click();
      await expect(page).toHaveURL(/\/analytics\/loans/);
    }
  });
});

