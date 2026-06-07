import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import robots from 'astro-robots-txt';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
    adapter: netlify(),
    devToolbar: {
        enabled: false,
    },
    integrations: [
        react(),
        robots(),
        sitemap({ lastmod: new Date() }),
    ],
    site: 'https://dev.aephonics.com',
    vite: {
        plugins: [tailwind()],
    },
});
