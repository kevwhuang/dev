import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = () => Response.json({ error: 'Not found' }, { status: 404 });
