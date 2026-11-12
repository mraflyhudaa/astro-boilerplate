import { describe, expect, it } from 'vitest';

import { escapeHtml, truncate } from '../../src/lib/og';

describe('escapeHtml', () => {
	it('escapes characters that break satori markup', () => {
		expect(escapeHtml(`<script>"a" & 'b'</script>`)).toBe(
			'&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;',
		);
	});
});

describe('truncate', () => {
	it('keeps short text untouched', () => {
		expect(truncate('short', 10)).toBe('short');
	});

	it('cuts on a word boundary and appends an ellipsis', () => {
		const result = truncate('one two three four five', 14);
		expect(result).toBe('one two three…');
		expect(result.length).toBeLessThanOrEqual(15);
	});

	it('hard cuts when no boundary is available', () => {
		expect(truncate('abcdefghijklmnop', 8)).toBe('abcdefgh…');
	});
});
