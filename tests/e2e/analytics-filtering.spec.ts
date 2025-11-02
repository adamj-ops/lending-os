import { test, expect } from '@playwright/test';

test.describe('Analytics Filtering', () => {
  test('should display filter controls on loans page', async ({ page }) => {
    await page.goto('/analytics/loans');
    
    // Verify filters section is visible
    await expect(page.getByText(/Filters/)).toBeVisible();
    
    // Verify filter buttons
    await expect(page.getByRole('button', { name: /Reset/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Apply/ })).toBeVisible();
  });

  test('should open date range picker', async ({ page }) => {
    await page.goto('/analytics/loans');
    
    // Click start date button
    const startDateButton = page.getByRole('button', { name: /Start date/ });
    await startDateButton.click();
    
    // Verify calendar is visible
    await expect(page.locator('[data-slot="calendar"]')).toBeVisible();
    
    // Select a date (current month, day 15)
    const day15 = page.locator('button[data-day*="-15"]').first();
    if (await day15.isVisible()) {
      await day15.click();
    }
  });

  test('should apply filters and refetch data', async ({ page }) => {
    await page.goto('/analytics/loans');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Note: Real-time event listener may cause background API calls, but waitForResponse
    // will wait for the specific response from the Apply button action
    
    // Apply button should trigger data fetch
    const applyButton = page.getByRole('button', { name: /Apply/ });
    
    // Listen for API request (will ignore background polling requests)
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/v1/loans/analytics') && response.status() === 200
    );
    
    await applyButton.click();
    
    // Verify API was called
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  });

  test('should reset filters', async ({ page }) => {
    await page.goto('/analytics/loans');
    
    const resetButton = page.getByRole('button', { name: /Reset/ });
    await resetButton.click();
    
    // After reset, active filter count should be 0
    const filterBadge = page.locator('text=/Filters/').locator('..').locator('[data-slot="badge"]');
    await expect(filterBadge).not.toBeVisible();
  });

  test('should show loan filter dropdown', async ({ page }) => {
    await page.goto('/analytics/loans');
    
    const loanFilterButton = page.getByRole('button', { name: /Select loans/ });
    await loanFilterButton.click();
    
    // Verify popover opens (it may show "Loading..." or "No loans available" or actual loans)
    const popover = page.locator('[data-slot="popover-content"]');
    await expect(popover).toBeVisible();
  });
});

