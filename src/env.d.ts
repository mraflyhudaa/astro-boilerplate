/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		/** Locale resolved from the URL in `middleware.ts`. */
		// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- ambient declarations must stay global
		locale: import('./i18n/config').Locale;
		/** Correlation id echoed in the `X-Request-Id` response header. */
		requestId: string;
	}
}
