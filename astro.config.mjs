// @ts-check
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

import { defaultLocale, locales } from './src/i18n/config.ts';

const site = process.env.SITE_URL ?? 'https://example.com';

export default defineConfig({
	site,
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	trailingSlash: 'always',
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},
	i18n: {
		locales: [...locales],
		defaultLocale,
		// Untranslated entries return 404 rather than duplicating English content.
		// Add `fallback: { id: 'en' }` only if duplicate-content redirects are acceptable.
		routing: {
			prefixDefaultLocale: true,
			// `/` is handled by `src/pages/index.astro`, which returns a 308.
			redirectToDefaultLocale: false,
			fallbackType: 'redirect',
		},
	},
	integrations: [
		mdx(),
		sitemap({
			i18n: {
				defaultLocale,
				locales: { en: 'en', id: 'id' },
			},
			filter: (page) => {
				const { pathname } = new URL(page);
				return pathname !== '/' && !pathname.startsWith('/api/');
			},
		}),
	],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Inter',
			cssVariable: '--font-inter',
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/inter-variable-latin.woff2'],
						weight: '100 900',
						style: 'normal',
					},
				],
			},
		},
	],
	markdown: {
		// Prism emits classes instead of inline styles, so code blocks work under CSP.
		syntaxHighlight: 'prism',
	},
	image: {
		responsiveStyles: true,
	},
	security: {
		checkOrigin: true,
		csp: {
			directives: [
				"default-src 'self'",
				"img-src 'self' data: blob: https:",
				"font-src 'self'",
				"connect-src 'self'",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
			styleDirective: {
				// Tailwind ships an external stylesheet; inline `style` attributes and
				// syntax-highlighted code rely on inline styles.
				resources: ["'self'", "'unsafe-inline'"],
			},
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
	build: {
		inlineStylesheets: 'auto',
	},
});
