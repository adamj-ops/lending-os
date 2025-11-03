const { test, expect } = require('@playwright/test');

test.describe('Backdrop + form interactivity', () => {
  test('Login sheet: overlay present and input clickable', async ({ page }) => {
    await page.goto('/auth/login');

    // Ensure the Sheet is open (AuthFlow on this page always renders open)
    const overlay = page.locator('[data-slot="sheet-backdrop"]');
    await expect(overlay).toBeVisible();

    // Validate backdrop styling via class tokens
    const overlayClass = await overlay.getAttribute('class');
    expect(overlayClass || '').toContain('bg-black/90');
    expect(overlayClass || '').toContain('backdrop-blur-md');

    // The email input should be focusable & typeable even with overlay present
    const emailInput = page.locator('#auth-email');
    await expect(emailInput).toBeVisible();
    await emailInput.click();
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });
});

