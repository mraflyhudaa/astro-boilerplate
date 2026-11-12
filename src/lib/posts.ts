import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { parsePostId, postPath, sortPosts } from './blog';
import type { Locale } from '../i18n/config';
import type { AlternateLink } from './seo';

export type BlogEntry = CollectionEntry<'blog'>;

export function entryLang(entry: BlogEntry): Locale {
	return parsePostId(entry.id).lang;
}

export function entrySlug(entry: BlogEntry): string {
	return parsePostId(entry.id).slug;
}

export function entryHref(entry: BlogEntry): string {
	return postPath(entry.id);
}

export async function getBlogPosts(locale?: Locale): Promise<BlogEntry[]> {
	const entries = await getCollection('blog');
	const published = entries.filter((entry) => import.meta.env.DEV || entry.data.draft !== true);
	const scoped =
		locale === undefined ? published : published.filter((entry) => entryLang(entry) === locale);
	return sortPosts(scoped);
}

/**
 * Returns every published translation of an entry, keyed by `translationKey`.
 * Falls back to the entry itself when no key is set.
 */
export async function getTranslations(entry: BlogEntry): Promise<AlternateLink[]> {
	const key = entry.data.translationKey;
	if (key === undefined) {
		return [{ locale: entryLang(entry), href: entryHref(entry) }];
	}
	const entries = (await getCollection('blog')).filter(
		(candidate) =>
			candidate.data.translationKey === key &&
			(import.meta.env.DEV || candidate.data.draft !== true),
	);
	return entries.map((candidate) => ({
		locale: entryLang(candidate),
		href: entryHref(candidate),
	}));
}

/** Adjacent posts within the same locale, newest-first ordering preserved. */
export async function getAdjacentPosts(entry: BlogEntry): Promise<{
	previous: BlogEntry | undefined;
	next: BlogEntry | undefined;
}> {
	const posts = await getBlogPosts(entryLang(entry));
	const index = posts.findIndex((candidate) => candidate.id === entry.id);
	return {
		previous: index > 0 ? posts[index - 1] : undefined,
		next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
	};
}
