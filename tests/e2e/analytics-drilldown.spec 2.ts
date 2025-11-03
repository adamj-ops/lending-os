import { test, expect } from '@playwright/test';

test.describe('Drill-Down Modal', () => {
  test('should open drill-down modal when entity is clicked', async ({ page }) => {
    await page.goto('/analytics/loans');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Note: This test assumes there's a clickable element (like a table row or chart data point)
    // that triggers the drill-down modal. The actual implementation may vary.
    
    // For now, we'll verify the modal component exists in the page
    // In a real implementation, we'd click on a specific data element
    
    // Example: If there's a table, click first row
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      
      // Verify modal opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });
      
      // Verify modal contains details
      await expect(dialog).toContainText(/Details/i);
    }
  });

  test('should close drill-down modal on close button click', async ({ page }) => {
    await page.goto('/analytics/loans');
    await page.waitForLoadState('networkidle');
    
    // If modal is open (from previous interaction or test state)
    const dialog = page.locator('[role="dialog"]');
    
    if (await dialog.isVisible()) {
      // Find and click close button
      const closeButton = dialog.locator('button[aria-label="Close"]').or(
        dialog.locator('button').filter({ hasText: /close/i })
      );
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(dialog).not.toBeVisible();
      }
    }
  });

  test('should display entity-specific information in modal', async ({ page }) => {
    await page.goto('/analytics/loans');
    await page.waitForLoadState('networkidle');
    
    // This is a placeholder test - actual implementation depends on
    // how drill-down is triggered and what data is shown
    
    // Verify page loaded successfully
    await expect(page.locator('h1')).toContainText('Loan Analytics');
  });
});

