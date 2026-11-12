import { defaultLocale, isLocale, localeTags } from './config';
import type { Locale } from './config';
import { ui } from './ui';
import type { TranslationKey } from './ui';

/** Returns the locale encoded in the first path segment, or the default locale. */
export function getLocaleFromPath(pathname: string): Locale {
	const [first] = pathname.split('/').filter(Boolean);
	return isLocale(first) ? first : defaultLocale;
}

export function useTranslations(locale: Locale) {
	const dictionary = ui[locale];
	return (key: TranslationKey): string => dictionary[key];
}

export function translate(locale: Locale, key: TranslationKey): string {
	return ui[locale][key];
}

export function formatDate(date: Date, locale: Locale): string {
	return new Intl.DateTimeFormat(localeTags[locale], {
		dateStyle: 'long',
		timeZone: 'UTC',
	}).format(date);
}

export function interpolate(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) => {
		const value = values[key];
		return value === undefined ? match : String(value);
	});
}
