export const SITE = {
	name: 'Astro Boilerplate',
	shortName: 'Astro',
	description:
		'A production-ready Astro starter: typed content collections, i18n routing, SEO metadata, tests, and Docker.',
	/** Used when `site` is not configured in `astro.config.mjs`. */
	fallbackUrl: 'https://example.com',
	defaultOgImage: '/og-default.png',
	author: 'Astro Boilerplate',
} as const;

export function resolveSite(site: URL | undefined): URL {
	return site ?? new URL(SITE.fallbackUrl);
}
