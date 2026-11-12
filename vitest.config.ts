import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/unit/**/*.test.ts'],
		environment: 'node',
		restoreMocks: true,
		coverage: {
			provider: 'v8',
			include: ['src/lib/**/*.ts', 'src/i18n/**/*.ts'],
			exclude: ['src/lib/posts.ts', 'src/lib/rss.ts'],
			reporter: ['text', 'html'],
		},
	},
});
