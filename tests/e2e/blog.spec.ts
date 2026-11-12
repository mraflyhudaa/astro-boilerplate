import { expect, test } from '@playwright/test';

test('blog index lists published translations only', async ({ page }) => {
	await page.goto('/en/blog/');

	await expect(page.locator('main article')).toHaveCount(2);
	await expect(page.getByText('Draft: ideas for later')).toHaveCount(0);
});

test('post page renders prose, metadata and structured data', async ({ page }) => {
	const response = await page.goto('/en/blog/hello-world/');
	expect(response?.status()).toBe(200);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Welcome to the Astro boilerplate',
	);
	await expect(page.locator('.prose')).toContainText('This starter is deliberately opinionated');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://example.com/en/blog/hello-world/',
	);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		'content',
		/\/og\/en\/hello-world\.png$/,
	);
	await expect(page.locator('link[rel="alternate"][hreflang="id"]')).toHaveAttribute(
		'href',
		/\/id\/blog\/selamat-datang\/$/,
	);

	const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
	expect(JSON.parse(jsonLd ?? '{}')).toMatchObject({ '@type': 'BlogPosting', inLanguage: 'en' });
});

test('drafts are not reachable in the production build', async ({ request }) => {
	const response = await request.get('/en/blog/draft-ideas/');
	expect(response.status()).toBe(404);
});

test('missing translations 404 instead of duplicating content', async ({ request }) => {
	const response = await request.get('/id/blog/hello-world/');
	expect(response.status()).toBe(404);
});

test('blog nav stays active on post pages', async ({ page }) => {
	await page.goto('/en/blog/hello-world/');
	await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText('Blog');
});
