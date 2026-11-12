import { describe, expect, it } from 'vitest';

import {
	countWords,
	isPublished,
	parsePostId,
	postPath,
	readingTimeMinutes,
	sortPosts,
	stripCodeFences,
} from '../../src/lib/blog';

const post = (id: string, day: number, draft = false) => ({
	id,
	data: { pubDate: new Date(Date.UTC(2026, 0, day)), draft },
});

describe('parsePostId', () => {
	it('splits the locale from the slug', () => {
		expect(parsePostId('en/hello-world')).toEqual({ lang: 'en', slug: 'hello-world' });
	});

	it('keeps nested slugs intact', () => {
		expect(parsePostId('id/panduan/instalasi')).toEqual({
			lang: 'id',
			slug: 'panduan/instalasi',
		});
	});

	it.each(['hello-world', 'fr/bonjour', 'en/', ''])('rejects invalid id %j', (id) => {
		expect(() => parsePostId(id)).toThrow(/must be "<locale>\/<slug>"/);
	});
});

describe('postPath', () => {
	it('builds a trailing-slash URL from the entry id', () => {
		expect(postPath('id/panduan/instalasi')).toBe('/id/blog/panduan/instalasi/');
	});
});

describe('sortPosts', () => {
	it('sorts newest first without mutating the input', () => {
		const input = [post('en/a', 1), post('en/c', 3), post('en/b', 2)];
		const sorted = sortPosts(input);

		expect(sorted.map((entry) => entry.id)).toEqual(['en/c', 'en/b', 'en/a']);
		expect(input.map((entry) => entry.id)).toEqual(['en/a', 'en/c', 'en/b']);
	});
});

describe('isPublished', () => {
	it('keeps drafts during development', () => {
		expect(isPublished(post('en/draft', 1, true), false)).toBe(true);
	});

	it('drops drafts in production', () => {
		expect(isPublished(post('en/draft', 1, true), true)).toBe(false);
		expect(isPublished(post('en/live', 1), true)).toBe(true);
	});
});

describe('countWords', () => {
	it('counts words and ignores markup noise', () => {
		expect(countWords('one two three')).toBe(3);
		expect(countWords('<p>hello <strong>world</strong></p>')).toBe(2);
		expect(countWords('   ')).toBe(0);
	});

	it('ignores fenced code blocks', () => {
		const markdown = ['Intro sentence.', '```ts', 'const many = words_here_ignored;', '```'].join(
			'\n',
		);
		expect(stripCodeFences(markdown)).not.toContain('const');
		expect(countWords(markdown)).toBe(2);
	});
});

describe('readingTimeMinutes', () => {
	it('never reports less than one minute', () => {
		expect(readingTimeMinutes('short')).toBe(1);
	});

	it('rounds up to whole minutes', () => {
		const words = Array.from({ length: 250 }, () => 'word').join(' ');
		expect(readingTimeMinutes(words, 200)).toBe(2);
	});

	it('rejects a non-positive reading speed', () => {
		expect(() => readingTimeMinutes('text', 0)).toThrow(RangeError);
	});
});
