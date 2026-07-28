import { getViteConfig } from 'astro/config';

export default getViteConfig({
    test: {
        fileParallelism: false,
        include: [
            'tests/integration/**/*.test.ts',
            'tests/unit/**/*.test.ts',
        ],
    },
} as Parameters<typeof getViteConfig>[0]);
