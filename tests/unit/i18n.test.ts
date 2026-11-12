import { describe, expect, it } from 'vitest';

import {
	formatDate,
	getLocaleFromPath,
	interpolate,
	translate,
	useTranslations,
} from '../../src/i18n/utils';
import { ui } from '../../src/i18n/ui';

describe('getLocaleFromPath', () => {
	it.each([
		['/en/', 'en'],
		['/id/blog/selamat-datang/', 'id'],
		['/blog/', 'en'],
		['/', 'en'],
	])('%s resolves to %s', (path, locale) => {
		expect(getLocaleFromPath(path)).toBe(locale);
	});
});

describe('translations', () => {
	it('has the same keys in every locale', () => {
		expect(Object.keys(ui.id).sort()).toEqual(Object.keys(ui.en).sort());
	});

	it('returns locale-specific copy', () => {
		expect(translate('en', 'nav.blog')).toBe('Blog');
		expect(translate('id', 'nav.blog')).toBe('Blog');
		expect(translate('id', 'notFound.home')).toBe('Kembali ke beranda');
	});

	it('exposes a bound translator', () => {
		expect(useTranslations('id')('nav.about')).toBe('Tentang');
	});
});

describe('interpolate', () => {
	it('replaces known placeholders', () => {
		expect(interpolate('{minutes} min read', { minutes: 4 })).toBe('4 min read');
		expect(interpolate('{count} items', { count: 0 })).toBe('0 items');
	});

	it('keeps unknown placeholders intact', () => {
		expect(interpolate('{minutes} of {total}', { minutes: 2 })).toBe('2 of {total}');
	});
});

describe('formatDate', () => {
	it('formats in UTC and respects the locale', () => {
		const date = new Date('2026-01-15T23:30:00.000Z');
		const en = formatDate(date, 'en');
		const id = formatDate(date, 'id');

		expect(en).toContain('2026');
		expect(en).toContain('January');
		expect(id).not.toBe(en);
		expect(id).toContain('2026');
	});
});
