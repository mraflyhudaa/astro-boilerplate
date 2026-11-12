import { expect, test } from '@playwright/test';

test.describe('localized shell', () => {
	test('root redirects to the default locale', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/en\/$/);
	});

	test('home renders content, language and navigation', async ({ page }) => {
		await page.goto('/en/');
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Ship a fast');
		await expect(page.getByRole('link', { name: 'Blog', exact: true }).first()).toBeVisible();
		await expect(page.getByRole('main')).toBeVisible();
	});

	test('skip link points at the main landmark', async ({ page }) => {
		await page.goto('/en/');
		await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
			'href',
			'#main',
		);
		await expect(page.locator('#main')).toBeVisible();
	});

	test('language switcher lands on the translated post', async ({ page }) => {
		await page.goto('/en/blog/hello-world/');
		await page.locator('nav[aria-label="Language"] a[hreflang="id"]').click();
		await expect(page).toHaveURL('/id/blog/selamat-datang/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Selamat datang');
		await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
			'href',
			/\/en\/blog\/hello-world\/$/,
		);
	});

	test('theme toggle persists across reloads', async ({ page }) => {
		await page.goto('/en/');
		const html = page.locator('html');
		const before = await html.evaluate((element) => element.classList.contains('dark'));

		await page.locator('[data-theme-toggle]').click();
		await expect
			.poll(() => html.evaluate((element) => element.classList.contains('dark')))
			.toBe(!before);

		await page.reload();
		expect(await html.evaluate((element) => element.classList.contains('dark'))).toBe(!before);
	});

	test('404 is localized and keeps the status code', async ({ page }) => {
		const response = await page.goto('/id/does-not-exist/');
		expect(response?.status()).toBe(404);
		await expect(page.getByText('Halaman tidak ditemukan')).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'id');
	});

	test('content pages emit no console errors or CSP violations', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (message) => {
			if (message.type() === 'error') errors.push(message.text());
		});
		page.on('pageerror', (error) => errors.push(error.message));

		await page.goto('/en/blog/content-collections/');
		await expect(page.locator('pre code .token').first()).toBeVisible();
		expect(errors).toEqual([]);
	});
});

test.describe('link integrity', () => {
	test('footer links resolve and never double the trailing slash', async ({ page, request }) => {
		await page.goto('/en/');
		const hrefs = await page
			.locator('footer a')
			.evaluateAll((links) =>
				links.map((link) => link.getAttribute('href')).filter((href) => href !== null),
			);

		expect(hrefs).toContain('/en/');
		expect(hrefs).toContain('/en/rss.xml');
		expect(hrefs.some((href) => href.includes('//'))).toBe(false);

		for (const href of hrefs) {
			const response = await request.get(href, { maxRedirects: 0 });
			expect(response.status(), href).toBe(200);
		}
	});
});

test('CSP allows hashed inline scripts and same-origin styles', async ({ page }) => {
	await page.goto('/en/');
	const content = await page
		.locator('meta[http-equiv="content-security-policy"]')
		.getAttribute('content');

	expect(content).toContain("script-src 'self'");
	expect(content).toMatch(/'sha256-[^']+'/);
	expect(content).toContain("style-src 'self'");
});
