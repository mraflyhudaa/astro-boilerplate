import rss from '@astrojs/rss';

import type { Locale } from '../i18n/config';
import { localeTags } from '../i18n/config';
import { translate } from '../i18n/utils';
import type { TranslationKey } from '../i18n/ui';
import { entryHref, getBlogPosts } from '../lib/posts';
import { resolveSite, SITE } from '../lib/site';

/** Shared RSS body used by the per-locale endpoints. */
export async function createRssResponse(lang: Locale, site: URL | undefined): Promise<Response> {
	const posts = await getBlogPosts(lang);
	const base = resolveSite(site);
	const t = (key: TranslationKey) => translate(lang, key);

	return rss({
		title: `${SITE.name} — ${t('blog.title')}`,
		description: t('site.description'),
		site: base,
		trailingSlash: true,
		customData: `<language>${localeTags[lang]}</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: entryHref(post),
			categories: post.data.tags,
		})),
	});
}
