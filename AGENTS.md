# Project conventions

Astro 7 + TypeScript 6 (strictest) + Tailwind 4. Read `README.md` for the architecture.

## Commands

```bash
pnpm run dev            # dev server (Astro 7 supports `astro dev --background` for agents)
pnpm run check          # astro check — must pass before pushing
pnpm run lint           # ESLint 10 flat config
pnpm run format:check   # Prettier
pnpm run test:unit      # Vitest (pure helpers only)
pnpm run test:e2e       # Playwright: builds + runs dist/server/entry.mjs
pnpm run build
```

## Package manager (hard rule)

Use **pnpm only**: never invoke `npm`, `npm install`, `npm ci`, `npx`, `yarn`, or `bun` in this repo.

- Install: `pnpm install`; CI and Docker use `pnpm install --frozen-lockfile`.
- Run scripts: `pnpm run <script>`.
- One-off binaries: `pnpm exec <bin>`; temporary packages: `pnpm dlx <pkg>`.
- Dependencies: `pnpm add`, `pnpm add -D`, `pnpm remove`; commit `pnpm-lock.yaml` and never hand-edit it.
- The `packageManager` field pins `pnpm@12.15.0`; pnpm's build-script allowlist permits only `sharp` (`pnpm-workspace.yaml` → `onlyBuiltDependencies`).

## Rules that prevent real bugs

- Content ids are `<locale>/<slug>`. Never hand-write URLs for posts; use `src/lib/posts.ts`.
- `.astro` frontmatter must use separate `import type { X } from '…'` statements. The Astro 7
  compiler rejects inline `type X` specifiers inside named imports in `.astro` files.
- Inline `<script is:inline>` is only allowed in the layout head, because Astro hashes inline
  scripts there for the CSP. Component-level inline scripts are blocked at runtime. Add event
  handlers through delegation in `BaseLayout.astro` instead.
- Code fences use languages Prism knows (`ts`, `js`, `bash`, `md`). `mdx` is not a Prism language
  and logs a build warning.
- `trailingSlash: 'always'` — canonical and internal URLs end with `/`. Endpoints live at
  `src/pages/api/<name>/index.ts` so their canonical path also ends with `/`.
- OG endpoints are prerendered; `satori` and `satori-html` are dev dependencies. Moving to
  on-demand OG images requires promoting them to dependencies.
- Prerendered pages do not run `middleware.ts`; security headers there only cover SSR responses.
  CSP is meta-based and applies to prerendered HTML.

## Verification

Run `pnpm run check && pnpm run lint && pnpm run format:check && pnpm run test:unit && pnpm run test:e2e`
before claiming work is done. Do not add unit tests that import `astro:content` (Vitest has no
Astro virtual modules without `getViteConfig`); test the pure helpers in `src/lib/` instead.
