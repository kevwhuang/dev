import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';

import ErrorNotFound from '../../src/sections/ErrorNotFound.astro';

describe('ErrorNotFound', () => {
    test('renders 404 heading', async () => {
        const container = await AstroContainer.create();

        const html = await container.renderToString(ErrorNotFound);

        expect(html).toMatch(/<h1[^>]*>[\s]*404[\s]*<\/h1>/);
    });

    test('renders return link to home', async () => {
        const container = await AstroContainer.create();

        const html = await container.renderToString(ErrorNotFound);

        expect(html).toContain('href="/"');
        expect(html).toContain('Return');
    });

    test('return link has aria-label', async () => {
        const container = await AstroContainer.create();

        const html = await container.renderToString(ErrorNotFound);

        expect(html).toContain('aria-label="Return to home"');
    });
});
