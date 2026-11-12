import type { Locale } from '../i18n/config';

export interface AlternateLink {
	locale: Locale;
	href: string;
}

export function absoluteUrl(path: string, site: URL): string {
	return new URL(path, site).toString();
}

/** Canonical URLs never carry query strings or fragments. */
export function canonicalUrl(pathname: string, site: URL): string {
	const url = new URL(pathname, site);
	url.search = '';
	url.hash = '';
	return url.toString();
}

export interface WebsiteJsonLdInput {
	name: string;
	description: string;
	url: string;
	inLanguage: Locale;
}

export function websiteJsonLd({ name, description, url, inLanguage }: WebsiteJsonLdInput) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name,
		description,
		url,
		inLanguage,
	};
}

export interface ArticleJsonLdInput {
	title: string;
	description: string;
	url: string;
	image?: string;
	datePublished: Date;
	dateModified?: Date;
	authorName: string;
	inLanguage: Locale;
	tags?: readonly string[];
}

export function articleJsonLd({
	title,
	description,
	url,
	image,
	datePublished,
	dateModified,
	authorName,
	inLanguage,
	tags = [],
}: ArticleJsonLdInput) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: title,
		description,
		url,
		datePublished: datePublished.toISOString(),
		dateModified: (dateModified ?? datePublished).toISOString(),
		author: { '@type': 'Person', name: authorName },
		inLanguage,
		...(image === undefined ? {} : { image }),
		...(tags.length === 0 ? {} : { keywords: tags.join(', ') }),
	};
}
