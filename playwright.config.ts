import { defineConfig } from '@playwright/test';

export default defineConfig({
    outputDir: '.playwright',
    testDir: 'tests/e2e',
    webServer: {
        command: 'bun start',
        env: { ASTRO_DEV_BACKGROUND: '1' },
        port: 8888,
        reuseExistingServer: true,
    },
    workers: 1,
});
