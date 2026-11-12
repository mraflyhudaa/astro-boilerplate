import type { APIRoute } from 'astro';

import { resolveSite } from '../lib/site';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
	const base = resolveSite(site);
	const sitemap = new URL('sitemap-index.xml', base).href;
	const body = ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${sitemap}`, ''].join(
		'\n',
	);

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
