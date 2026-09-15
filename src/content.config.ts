import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { FRAMES_MIN, TIERS } from '@lib/constants';

const FRAMES_MAX = 6;

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
        frames: z.number().int().min(FRAMES_MIN).max(FRAMES_MAX).optional(),
        name: z.string(),
        sector: z.string(),
        tier: z.enum(TIERS.map(tier => tier.id)),
    }),
});

export const collections = { calendar, projects };
