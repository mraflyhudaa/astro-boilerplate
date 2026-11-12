import { describe, expect, it } from 'vitest';

import { absoluteUrl, articleJsonLd, canonicalUrl, websiteJsonLd } from '../../src/lib/seo';

const site = new URL('https://example.com');

describe('absoluteUrl', () => {
	it('resolves paths against the site origin', () => {
		expect(absoluteUrl('/en/blog/', site)).toBe('https://example.com/en/blog/');
		expect(absoluteUrl('og/en/home.png', site)).toBe('https://example.com/og/en/home.png');
	});
});

describe('canonicalUrl', () => {
	it('drops query strings and fragments', () => {
		expect(canonicalUrl('/en/blog/?page=2#comments', site)).toBe('https://example.com/en/blog/');
	});
});

describe('websiteJsonLd', () => {
	it('emits a WebSite schema', () => {
		expect(
			websiteJsonLd({
				name: 'Astro Boilerplate',
				description: 'Starter',
				url: 'https://example.com/en/',
				inLanguage: 'en',
			}),
		).toEqual({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'Astro Boilerplate',
			description: 'Starter',
			url: 'https://example.com/en/',
			inLanguage: 'en',
		});
	});
});

describe('articleJsonLd', () => {
	const published = new Date('2026-02-03T00:00:00.000Z');

	it('serializes dates and author information', () => {
		const schema = articleJsonLd({
			title: 'Post',
			description: 'Summary',
			url: 'https://example.com/en/blog/post/',
			datePublished: published,
			authorName: 'Astro Boilerplate',
			inLanguage: 'en',
			tags: ['astro', 'typescript'],
		});

		expect(schema).toMatchObject({
			'@type': 'BlogPosting',
			headline: 'Post',
			datePublished: '2026-02-03T00:00:00.000Z',
			dateModified: '2026-02-03T00:00:00.000Z',
			author: { '@type': 'Person', name: 'Astro Boilerplate' },
			keywords: 'astro, typescript',
		});
	});

	it('omits optional fields instead of emitting undefined', () => {
		const schema = articleJsonLd({
			title: 'Post',
			description: 'Summary',
			url: 'https://example.com/en/blog/post/',
			datePublished: published,
			authorName: 'Author',
			inLanguage: 'en',
		});

		expect(schema).not.toHaveProperty('image');
		expect(schema).not.toHaveProperty('keywords');
	});
});
