import { expect, test } from '@playwright/test';

test.describe('404 page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/this-page-does-not-exist');
    });

    test('returns 404 status', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('404');
        expect(page.url()).toContain('/this-page-does-not-exist');
    });

    test('displays 404 heading', async ({ page }) => {
        const h1 = page.locator('h1');
        await expect(h1).toContainText('404');
    });

    test('has return link to home', async ({ page }) => {
        const link = page.locator('a[aria-label="Return to home"]');
        await expect(link).toHaveAttribute('href', '/');
    });

    test('return link navigates home', async ({ page }) => {
        await page.click('a[aria-label="Return to home"]');
        await expect(page).toHaveTitle('Dev');
    });
});
