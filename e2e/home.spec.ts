import { test, expect } from '@playwright/test';

test('Homepage loads and core sections are visible', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Orbit/i);

    // Use the unique animation class for the 'SaaS' word to avoid text-matching quirks
    const saasWord = page.locator('.animate-text-shimmer-saas');
    await expect(saasWord).toBeAttached({ timeout: 15000 });

    // Use the specific ID for the CTA button
    const ctaButton = page.locator('#hero-book-appointment');
    await expect(ctaButton).toBeAttached();

    // Wait for the loader complete state transition
    await page.waitForTimeout(5000);

    // Verify deferred sections (like Services) are mounted by checking for the section ID
    await expect(page.locator('#services')).toBeAttached();
});
