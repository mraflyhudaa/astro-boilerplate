# Astro Boilerplate

Production-ready Astro 7 starter: typed content collections, i18n routing, SEO defaults, a strict
quality gate, and a standalone Node/Docker deployment. Every route is prerendered except the API,
which renders on demand.

- **Astro 7** + TypeScript 6 (`astro/tsconfigs/strictest`)
- **Tailwind CSS 4** via `@tailwindcss/vite`, design tokens with light/dark themes
- **Content collections**: MDX, Zod schemas, drafts, image optimization
- **i18n**: `en` + `id`, prefixed default locale, hreflang, per-locale RSS
- **SEO**: canonical URLs, Open Graph, JSON-LD, sitemap, robots.txt, generated OG images
- **Security**: CSP with hashed inline scripts, `checkOrigin`, security headers on SSR responses
- **Quality**: ESLint 10, Prettier 3, Vitest 5, Playwright, Husky, GitHub Actions
- **Deploy**: `@astrojs/node` standalone adapter, multi-stage Dockerfile, compose, healthcheck

## Requirements

- Node.js `>=22.23.4` (`.nvmrc` pins 24)
- pnpm 12+ (`packageManager` pins `pnpm@12.15.0`; lockfile is `pnpm-lock.yaml`)
- Docker only for the container workflow

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm run dev          # http://localhost:4321 → redirects to /en/
```

Use pnpm for every install and script: `pnpm install`, `pnpm run <script>`, `pnpm exec <bin>`. Never use npm or npx in this repo.

The site URL defaults to `https://example.com`. Set `SITE_URL` in `.env` (used at **build** time
for canonical URLs, sitemap, RSS, and OG images).

## Scripts

| Script                  | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `pnpm run dev`          | Dev server with HMR                                       |
| `pnpm run build`        | Prerender pages, build the Node server into `dist/`       |
| `pnpm run preview`      | Preview the build (Astro's preview daemon)                |
| `pnpm run check`        | `astro check`: TypeScript + Astro diagnostics             |
| `pnpm run lint`         | ESLint (`.astro`, `.ts`, `.js`)                           |
| `pnpm run lint:fix`     | ESLint with autofix                                       |
| `pnpm run format`       | Prettier write                                            |
| `pnpm run format:check` | Prettier check (CI gate)                                  |
| `pnpm run test:unit`    | Vitest unit tests                                         |
| `pnpm run test:e2e`     | Playwright against a fresh build + standalone Node server |
| `pnpm run sync`         | Regenerate `.astro` types                                 |

## Project structure

```text
.
├─ astro.config.mjs          # locales, adapter, CSP, fonts, sitemap, Prism, Tailwind
├─ src/
│  ├─ content.config.ts      # glob loader + Zod schema (single source of truth)
│  ├─ content/blog/<locale>/ # MDX entries: id = "<locale>/<slug>"
│  ├─ i18n/                  # locale config, typed UI dictionary, path/date helpers
│  ├─ lib/                   # pure helpers (blog, posts, SEO, OG, RSS) — unit tested
│  ├─ components/
│  │  ├─ pages/              # shared page bodies rendered by per-locale routes
│  │  ├─ BaseHead.astro      # title, canonical, hreflang, OG/Twitter, JSON-LD
│  │  └─ ui/                 # theme toggle, language switcher, date, callout
│  ├─ layouts/               # BaseLayout + BlogPostLayout
│  ├─ pages/
│  │  ├─ index.astro         # `/` → 308 `/en/`
│  │  ├─ en/…, id/…          # explicit locale folders (Astro i18n routing)
│  │  ├─ 404.astro           # locale-aware, noindex
│  │  ├─ api/health/index.ts # on-demand JSON healthcheck
│  │  ├─ og/<locale>/…png.ts # prerendered satori + sharp OG images
│  │  └─ robots.txt.ts
│  ├─ middleware.ts          # App.Locals.locale, request id, security headers
│  └─ styles/global.css      # Tailwind 4 theme + prose + Prism tokens
├─ tests/unit, tests/e2e
├─ Dockerfile, compose.yaml
└─ .github/workflows/ci.yml
```

## Writing content

Create `src/content/blog/en/my-post.mdx` and its translation
`src/content/blog/id/my-post.mdx`:

```mdx
---
title: 'My post' # 1–120 chars
description: 'One sentence.' # 1–200 chars, reused as the meta description
pubDate: 2026-04-01 # coerced to Date
updatedDate: 2026-04-05 # optional
heroImage: '../../../assets/blog/hello-world.jpg'
heroImageAlt: 'Describe the image' # required when heroImage is set
tags: [astro, typescript]
draft: false # filtered out of production builds
translationKey: my-post # links translations for the language switcher
---

Body. MDX components are supported: `import Callout from '../../../components/ui/Callout.astro';`
```

- The entry id is `<locale>/<slug>`; the URL (`/<locale>/blog/<slug>/`), feed links, OG image
  path, and hreflang alternates are all derived from it. Renaming a file changes them together.
- Drafts render in `astro dev` and are excluded from builds, sitemap, RSS, and OG generation.
- A missing translation 404s instead of duplicating content. `i18n.fallback` is intentionally not
  configured: Astro's fallback generation for dynamic routes produced conflicting routes and
  duplicate pages.

## Adding a locale

1. Add the code to `locales` and `localeTags`/`localeLabels`/`ogLocales` in `src/i18n/config.ts`.
2. Add the full dictionary in `src/i18n/ui.ts` (the `Record<TranslationKey, string>` type enforces
   key parity).
3. Create `src/pages/<locale>/` by copying `en/` (thin wrappers around `src/components/pages/`).
4. Add `src/content/blog/<locale>/` entries and `src/pages/<locale>/rss.xml.ts`.
5. Add the locale to the sitemap `i18n.locales` map in `astro.config.mjs`.
6. Add the font subset if the script needs one.

## Rendering model

| Route                               | Rendering                        |
| ----------------------------------- | -------------------------------- |
| `/[locale]/`, `/about/`, `/blog/…`  | Prerendered (`prerender = true`) |
| `/og/<locale>/<slug>.png`           | Prerendered at build             |
| `/robots.txt`, `/sitemap-index.xml` | Prerendered                      |
| `/api/health/`                      | On demand (`prerender = false`)  |
| `/`                                 | On-demand 308 to `/en/`          |

`trailingSlash: 'always'` is enforced, so canonical URLs end with `/`. API clients should call
`/api/health/`; `/api/health` answers with a 301 redirect. The Docker healthcheck uses the
canonical path.

## SEO

- **Canonical + hreflang**: `BaseHead.astro` emits canonical, `hreflang` for every translation, and
  `x-default`. Blog alternates come from `translationKey`, not from path guessing.
- **Structured data**: `WebSite` on the home page, `BlogPosting` on posts.
- **Sitemap**: `@astrojs/sitemap` with i18n alternates; `/api/` and `/` are filtered out.
- **OG images**: generated at build time from the post title/description with satori + sharp and
  the vendored Inter fonts. They are static PNGs, so the runtime image does not need satori.
  Making them on-demand requires moving `satori`/`satori-html` back to `dependencies`.
- **manifest**: `public/site.webmanifest` with 192/512 icons and maskable variant.

## Styling and fonts

Tailwind 4 is wired through the Vite plugin. Theme tokens (`--surface`, `--fg`, `--muted`,
`--border`, `--accent`, …) are defined in `src/styles/global.css` and mapped with
`@theme inline`, so utilities follow the `.dark` class. The theme toggle is inline, hashed by
Astro's CSP, and runs before paint to avoid a flash.

Inter is self-hosted through Astro's Fonts API (`fonts` in `astro.config.mjs`, local provider,
variable `woff2`, preloaded `<Font />`). Code blocks use Prism with custom token colors instead of
Shiki's inline styles, so they work under CSP.

## Security

- CSP is generated at build time as a `<meta>` tag. Inline scripts (theme) are hashed; there are no
  external scripts or styles.
- `frame-ancestors` cannot be enforced through `<meta>`; set it (and HSTS) at your reverse proxy.
- Security headers in `middleware.ts` apply to on-demand responses. Prerendered HTML is served
  straight from disk, so configure headers at the proxy/CDN if you need them on static pages.
- `security.checkOrigin` is enabled: unsafe cross-origin requests to on-demand routes are rejected.

## Testing

```bash
pnpm run test:unit    # pure helpers: ids/slugs, reading time, i18n paths, SEO builders, OG text
pnpm run test:e2e     # builds, starts dist/server/entry.mjs, drives Chromium
pnpm run test         # alias for unit tests
```

E2E covers the root redirect, translations and hreflang, theme persistence, CSP console cleanliness,
drafts/404s, RSS, sitemap, robots, OG PNG signatures, and the health endpoint. Playwright builds the
app itself, so a stale `dist/` cannot mask regressions.

Unit tests are deliberately scoped to pure modules. Files importing `astro:content`,
`astro:i18n`, or `astro:env` run inside Astro, not in the bare Vitest environment.

## CI and hooks

`ppnpm install --frozen-lockfile` installs Husky. Hooks:

- `pre-commit`: `lint-staged` (ESLint fix + Prettier on staged files)
- `pre-push`: `pnpm run check && pnpm run test:unit`

GitHub Actions runs `quality` (check, lint, format, unit, build), `e2e` (Playwright), and `docker`
(image build). Concurrency cancels superseded runs.

## Docker

```bash
docker build --build-arg SITE_URL=https://example.com -t astro-boilerplate .
docker run --rm -p 4321:4321 -e PORT=4321 astro-boilerplate
docker compose up --build
```

- Multi-stage `node:24-alpine`, non-root runtime user, `HEALTHCHECK` on `/api/health/`.
- `SITE_URL` is baked at build time (prerendered URLs); runtime env only affects the server bind
  (`HOST`, `PORT`).
- Bare Node deployment: `HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs`.

## Customization checklist

1. `src/lib/site.ts` and `package.json` metadata.
2. `site`/`SITE_URL` and `i18n` in `astro.config.mjs`.
3. Locale list and UI copy (`src/i18n/`).
4. Theme tokens (`src/styles/global.css`) and the favicon/icons in `public/`.
5. Example content in `src/content/blog/` and the draft entry.
6. Remove the `.example` domain from `site.webmanifest` if you change the name.
