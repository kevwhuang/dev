import { expect, test } from '@playwright/test';

test.describe('500 page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/500');
    });

    test('displays 500 heading', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('500');
    });
});
