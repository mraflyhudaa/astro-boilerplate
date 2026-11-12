import { expect, test } from '@playwright/test';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test('health endpoint returns JSON and security headers', async ({ request }) => {
	const response = await request.get('/api/health/');

	expect(response.status()).toBe(200);
	expect(response.headers()['cache-control']).toBe('no-store');
	expect(response.headers()['x-content-type-options']).toBe('nosniff');
	expect(response.headers()['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
	expect(await response.json()).toMatchObject({ status: 'ok' });
});

test('health without a trailing slash is a permanent redirect', async ({ request }) => {
	const response = await request.get('/api/health', { maxRedirects: 0 });

	expect(response.status()).toBe(301);
	expect(response.headers()['location']).toBe('/api/health/');
});

test('robots.txt advertises the sitemap', async ({ request }) => {
	const response = await request.get('/robots.txt');

	expect(response.status()).toBe(200);
	const body = await response.text();
	expect(body).toContain('Sitemap: https://example.com/sitemap-index.xml');
	expect(body).toContain('Disallow: /api/');
});

test('sitemap lists both locales and excludes API routes', async ({ request }) => {
	const response = await request.get('/sitemap-0.xml');

	expect(response.status()).toBe(200);
	const body = await response.text();
	expect(body).toContain('https://example.com/en/blog/hello-world/');
	expect(body).toContain('https://example.com/id/blog/selamat-datang/');
	expect(body).not.toContain('/api/');
	expect(body).not.toContain('/draft-ideas/');
});

test('per-locale RSS feeds contain the translated posts', async ({ request }) => {
	const feeds = [
		['en', 'Welcome to the Astro boilerplate'],
		['id', 'Selamat datang di boilerplate Astro'],
	] as const;

	for (const [locale, title] of feeds) {
		const response = await request.get(`/${locale}/rss.xml`);
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('xml');
		const body = await response.text();
		expect(body).toContain('<rss');
		expect(body).toContain(title);
	}
});

test('Open Graph images are real PNGs', async ({ request }) => {
	const response = await request.get('/og/en/home.png');

	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toBe('image/png');
	const buffer = await response.body();
	expect(buffer.subarray(0, 8)).toEqual(PNG_SIGNATURE);
	expect(buffer.length).toBeGreaterThan(10_000);
});

test('web manifest is served and parseable', async ({ request }) => {
	const response = await request.get('/site.webmanifest');

	expect(response.status()).toBe(200);
	expect(await response.json()).toMatchObject({ short_name: 'Astro', start_url: '/' });
});

test('root redirect carries SSR security headers', async ({ request }) => {
	const response = await request.get('/', { maxRedirects: 0 });

	expect(response.status()).toBe(308);
	expect(response.headers()['location']).toBe('/en/');
	expect(response.headers()['x-frame-options']).toBe('DENY');
	expect(response.headers()['x-content-type-options']).toBe('nosniff');
	expect(response.headers()['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
});
