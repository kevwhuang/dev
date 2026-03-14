/// <reference types="vitest/config" />

import { getViteConfig } from 'astro/config';

export default getViteConfig({
    test: {
        include: [
            'tests/integration/**/*.test.ts',
            'tests/unit/**/*.test.ts',
        ],
    },
});
