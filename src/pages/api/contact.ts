import { Resend } from 'resend';
import { getStore } from '@netlify/blobs';

import template from '@lib/contact.html?raw';
import { CONTACT_EMAIL, EMAIL_MAX, EMAIL_PATTERN, MESSAGE_MAX, NAME_MAX } from '@lib/constants';

import type { APIRoute } from 'astro';
import type { Store } from '@netlify/blobs';

const EMAIL_FROM = 'Kevin Huang <noreply@dev.aephonics.com>';
const GLOBAL_KEY = 'contact-global';
const GLOBAL_LIMIT = 50;
const GLOBAL_WINDOW = 86_400_000;
const RATE_LIMIT = 10;
const RATE_WINDOW = 3_600_000;

function escapeHtml(text: string) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function isQuotaExhausted(store: Store, key: string, limit: number, windowDuration: number) {
    const now = Date.now();

    const record = await store.get(key, { type: 'json' });

    const isSameWindow = record && now - record.windowStart < windowDuration;

    if (isSameWindow && record.count >= limit) return true;

    await store.setJSON(key, isSameWindow ? { count: record.count + 1, windowStart: record.windowStart } : { count: 1, windowStart: now });

    return false;
}

async function isRateLimited(clientAddress: string) {
    if (import.meta.env.DEV) return false;

    try {
        const store = getStore({ consistency: 'strong', name: 'rate-limits' });

        if (await isQuotaExhausted(store, `contact-${clientAddress}`, RATE_LIMIT, RATE_WINDOW)) return true;

        return await isQuotaExhausted(store, GLOBAL_KEY, GLOBAL_LIMIT, GLOBAL_WINDOW);
    } catch {
        return false;
    }
}

export const prerender = false;

export const POST: APIRoute = async ({ clientAddress, request }) => {
    let body: Record<string, unknown>;

    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request body.' }, { status: 400 });

    const company = String(body.company ?? '').trim();
    const email = String(body.email ?? '').trim();
    const message = String(body.message ?? '').trim();
    const name = String(body.name ?? '').trim();

    if (company) return Response.json({ sent: true });

    if (!name || name.length > NAME_MAX) {
        return Response.json({ error: `A name is required and must be ${NAME_MAX} characters or fewer.` }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email) || email.length > EMAIL_MAX) {
        return Response.json({ error: `A valid email address is required and must be ${EMAIL_MAX} characters or fewer.` }, { status: 400 });
    }

    if (!message || message.length > MESSAGE_MAX) {
        return Response.json({ error: `A message is required and must be ${MESSAGE_MAX} characters or fewer.` }, { status: 400 });
    }

    if (await isRateLimited(clientAddress)) return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });

    if (import.meta.env.DEV) return Response.json({ sent: true });

    const apiKey = import.meta.env.RESEND_API_KEY;

    if (!apiKey) return Response.json({ error: 'Email service not configured.' }, { status: 503 });

    const replacements: Record<string, string> = {
        email: escapeHtml(email),
        message: escapeHtml(message),
        name: escapeHtml(name),
    };

    const html = template.replace(/\{\{(email|message|name)\}\}/g, (_, token: string) => replacements[token]);

    const { error } = await new Resend(apiKey).emails.send({
        from: EMAIL_FROM,
        html,
        replyTo: email,
        subject: `New inquiry from ${name}`,
        to: CONTACT_EMAIL,
    });

    if (error) return Response.json({ error: 'Failed to send message.' }, { status: 500 });

    return Response.json({ sent: true });
};
