import { expect, test } from '@playwright/test';

test.describe('index page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('loads with correct title', async ({ page }) => {
        await expect(page).toHaveTitle('Dev');
    });
});
