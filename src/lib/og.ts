export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

/** Truncates text on a word boundary so titles never overflow an OG canvas. */
export function truncate(value: string, maxLength: number): string {
	if (value.length <= maxLength) return value;
	const clipped = value.slice(0, maxLength);
	const lastSpace = clipped.lastIndexOf(' ');
	return `${(lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
