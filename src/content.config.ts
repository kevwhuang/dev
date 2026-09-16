import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { TIERS } from '@lib/constants';

const calendar = defineCollection({
    loader: glob({ base: './src/content/calendar', pattern: '**/*.json' }),
    schema: z.object({
        end: z.string(),
        kind: z.enum(['booked', 'travel']),
        place: z.string().optional(),
        start: z.string(),
    }),
});

const projects = defineCollection({
    loader: glob({ base: './src/content/projects', pattern: '**/*.json' }),
    schema: z.object({
        completed: z.string().optional(),
        description: z.string(),
        domain: z.string().optional(),
        featured: z.boolean().optional(),
        industry: z.string(),
        name: z.string(),
        tier: z.enum(TIERS.map(tier => tier.id)),
    }),
});

export const collections = { calendar, projects };
