import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import robots from 'astro-robots-txt';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
    adapter: netlify(),
    devToolbar: {
        enabled: false,
    },
    image: {
        experimentalLayout: 'responsive',
    },
    integrations: [
        react(),
        robots(),
        sitemap({ lastmod: new Date() }),
    ],
    prefetch: {
        defaultStrategy: 'hover',
    },
    site: 'https://dev.aephonics.com',
    vite: {
        optimizeDeps: {
            exclude: ['astro/virtual-modules/prefetch.js'],
        },
        plugins: [tailwind()],
    },
});
