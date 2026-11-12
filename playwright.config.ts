import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	...(process.env.CI ? { workers: 1 } : {}),
	reporter: process.env.CI
		? [['github'], ['html', { open: 'never' }]]
		: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `pnpm run build && HOST=127.0.0.1 PORT=${PORT} node dist/server/entry.mjs`,
		url: `${baseURL}/en/`,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
