import sharp from 'sharp';
import satori from 'satori';
import { html } from 'satori-html';
import type { APIRoute } from 'astro';

import interBold from '../../../assets/fonts/inter-700.woff?inline';
import interRegular from '../../../assets/fonts/inter-400.woff?inline';
import { localeTags, locales, toLocale } from '../../../i18n/config';
import type { Locale } from '../../../i18n/config';
import { translate } from '../../../i18n/utils';
import { escapeHtml, truncate } from '../../../lib/og';
import { entryLang, entrySlug, getBlogPosts } from '../../../lib/posts';
import { resolveSite, SITE } from '../../../lib/site';

export const prerender = true;

const WIDTH = 1200;
const HEIGHT = 630;

function decodeDataUrl(dataUrl: string): Buffer {
	const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
	return Buffer.from(base64, 'base64');
}

const fonts = [
	{
		name: 'Inter',
		data: decodeDataUrl(interRegular),
		weight: 400 as const,
		style: 'normal' as const,
	},
	{ name: 'Inter', data: decodeDataUrl(interBold), weight: 700 as const, style: 'normal' as const },
];

export async function getStaticPaths() {
	const posts = await getBlogPosts();
	return [
		...locales.map((lang) => ({ params: { lang, slug: 'home' } })),
		...posts.map((post) => ({ params: { lang: entryLang(post), slug: entrySlug(post) } })),
	];
}

function cardMarkup({
	title,
	description,
	lang,
	host,
	tags,
}: {
	title: string;
	description: string;
	lang: Locale;
	host: string;
	tags: readonly string[];
}) {
	return html`
		<div
			style="display:flex;width:100%;height:100%;flex-direction:column;justify-content:space-between;padding:64px;background:linear-gradient(135deg,#0b1220 0%,#111a2e 55%,#1e293b 100%);color:#f8fafc;font-family:Inter;"
		>
			<div style="display:flex;align-items:center;justify-content:space-between;">
				<div style="display:flex;align-items:center;gap:16px;">
					<div
						style="display:flex;width:48px;height:48px;border-radius:12px;background:#2563eb;align-items:center;justify-content:center;font-size:24px;font-weight:700;"
					>
						A
					</div>
					<div style="display:flex;font-size:24px;color:#94a3b8;">${escapeHtml(host)}</div>
				</div>
				<div
					style="display:flex;font-size:20px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;"
				>
					${localeTags[lang]}
				</div>
			</div>
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div style="display:flex;font-size:62px;font-weight:700;line-height:1.1;">
					${escapeHtml(truncate(title, 84))}
				</div>
				<div style="display:flex;font-size:26px;line-height:1.4;color:#cbd5e1;">
					${escapeHtml(truncate(description, 150))}
				</div>
			</div>
			<div style="display:flex;justify-content:space-between;font-size:20px;color:#94a3b8;">
				<div style="display:flex;">${escapeHtml(SITE.name)}</div>
				<div style="display:flex;">${escapeHtml(tags.map((tag) => `#${tag}`).join('  '))}</div>
			</div>
		</div>
	`;
}

export const GET: APIRoute = async ({ params, site }) => {
	const lang = toLocale(params.lang);
	const slug = params.slug ?? 'home';
	const base = resolveSite(site);

	let title: string;
	let description: string;
	let tags: readonly string[] = [];

	if (slug === 'home') {
		title = SITE.name;
		description = translate(lang, 'site.description');
	} else {
		const posts = await getBlogPosts(lang);
		const post = posts.find((candidate) => entrySlug(candidate) === slug);
		if (!post) {
			return new Response('Not found', {
				status: 404,
				headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
			});
		}
		title = post.data.title;
		description = post.data.description;
		tags = post.data.tags;
	}

	const markup = cardMarkup({ title, description, lang, host: base.host, tags });
	const svg = await satori(markup as unknown as Parameters<typeof satori>[0], {
		width: WIDTH,
		height: HEIGHT,
		fonts,
	});
	const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
