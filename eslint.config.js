import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import astro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import * as astroParser from 'astro-eslint-parser';

export default [
	{
		ignores: [
			'dist/**',
			'.astro/**',
			'node_modules/**',
			'coverage/**',
			'playwright-report/**',
			'test-results/**',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...astro.configs.recommended,
	{
		files: ['**/*.astro'],
		languageOptions: {
			parser: astroParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.astro'],
			},
		},
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ fixStyle: 'separate-type-imports' },
			],
		},
	},
	eslintConfigPrettier,
];
