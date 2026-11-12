import { isLocale } from '../i18n/config';
import type { Locale } from '../i18n/config';

/**
 * Content entries live at `src/content/blog/<locale>/<slug>.mdx`, so the entry
 * id is the canonical source of both the locale and the URL slug.
 */
export interface PostRef {
	lang: Locale;
	slug: string;
}

export interface PostLike {
	id: string;
	data: {
		pubDate: Date;
		draft?: boolean;
	};
}

export function parsePostId(id: string): PostRef {
	const segments = id.split('/');
	const [first, ...rest] = segments;
	if (!isLocale(first) || rest.length === 0 || rest.some((segment) => segment === '')) {
		throw new Error(`Content entry id "${id}" must be "<locale>/<slug>"`);
	}
	return { lang: first, slug: rest.join('/') };
}

export function postPath(id: string): string {
	const { lang, slug } = parsePostId(id);
	return `/${lang}/blog/${slug}/`;
}

export function sortPosts<T extends PostLike>(posts: readonly T[]): T[] {
	return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function isPublished(post: PostLike, isProduction: boolean): boolean {
	return !isProduction || post.data.draft !== true;
}

/** Removes fenced code blocks so code samples do not inflate reading time. */
export function stripCodeFences(markdown: string): string {
	return markdown.replace(/```[\s\S]*?```/g, ' ').replace(/~~~[\s\S]*?~~~/g, ' ');
}

export function countWords(markdown: string): number {
	const text = stripCodeFences(markdown)
		.replace(/<[^>]+>/g, ' ')
		.replace(/[#>*_`[\]()!-]/g, ' ')
		.trim();
	return text === '' ? 0 : text.split(/\s+/).length;
}

export function readingTimeMinutes(markdown: string, wordsPerMinute = 200): number {
	if (wordsPerMinute <= 0) {
		throw new RangeError('wordsPerMinute must be greater than zero');
	}
	return Math.max(1, Math.ceil(countWords(markdown) / wordsPerMinute));
}
