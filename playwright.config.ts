import { defineConfig } from '@playwright/test';

export default defineConfig({
    outputDir: '.playwright',
    testDir: 'tests/e2e',
    webServer: {
        command: 'bun start',
        port: 8888,
        reuseExistingServer: true,
    },
});
