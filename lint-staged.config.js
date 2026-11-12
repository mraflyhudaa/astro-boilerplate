export default {
	'**/*.{astro,js,mjs,ts}': ['eslint --fix', 'prettier --write'],
	'**/*.{css,json,md,mdx,yml,yaml,html}': 'prettier --write',
};
