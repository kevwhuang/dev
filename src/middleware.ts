import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    if (context.url.pathname === '/500') return next();

    const isApi = context.url.pathname.startsWith('/api/');

    try {
        const response = await next();

        if (!isApi && response.status >= 500) return context.rewrite('/500');

        return response;
    } catch {
        if (isApi) return Response.json({ error: 'Internal server error' }, { status: 500 });

        return context.rewrite('/500');
    }
});
