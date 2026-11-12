import { defineMiddleware } from 'astro:middleware';
import { defaultLocale, isLocale } from './i18n/config';

/**
 * Applied to on-demand responses. Prerendered pages are served straight from
 * disk, so deploy behind a proxy (or use the adapter's static header support)
 * if you need these headers on static HTML as well.
 */
const SECURITY_HEADERS: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Frame-Options': 'DENY',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
};

function withHeaders(response: Response, extra: Record<string, string>): Response {
	const headers = new Headers(response.headers);
	for (const [name, value] of Object.entries(extra)) {
		headers.set(name, value);
	}
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export const onRequest = defineMiddleware(async (context, next) => {
	const [first] = context.url.pathname.split('/').filter(Boolean);
	context.locals.locale = isLocale(first) ? first : defaultLocale;
	context.locals.requestId = crypto.randomUUID();

	const response = await next();
	return withHeaders(response, { ...SECURITY_HEADERS, 'X-Request-Id': context.locals.requestId });
});
