/**
 * Single source of truth for the site's locales.
 *
 * This module is imported by `astro.config.mjs`, so it must stay free of
 * Astro virtual modules and browser globals.
 */
export const locales = ['en', 'id'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** BCP 47 tags used for `hreflang`, `Intl`, and the `<html lang>` attribute. */
export const localeTags: Record<Locale, string> = {
	en: 'en',
	id: 'id',
};

/** Open Graph locale tags (`og:locale`). */
export const ogLocales: Record<Locale, string> = {
	en: 'en_US',
	id: 'id_ID',
};

/** Human-readable labels for the language switcher. */
export const localeLabels: Record<Locale, string> = {
	en: 'English',
	id: 'Bahasa Indonesia',
};

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function toLocale(value: string | undefined): Locale {
	return isLocale(value) ? value : defaultLocale;
}
