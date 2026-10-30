# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js version warning

This is Next.js 16 with breaking changes versus older versions (see `AGENTS.md`). Before writing Next-specific code, read the relevant guide in `node_modules/next/dist/docs/`. `next.config.ts` enables `cacheComponents` and `partialPrefetching`, which affect how routes and data fetching behave.

## Commands

```bash
npm run dev          # next dev (Turbopack)
npm run build        # next build
npm run lint         # eslint (flat config, next core-web-vitals + typescript)
npm run typecheck    # tsc --noEmit

npm run db:generate  # drizzle-kit generate (SQL migrations -> ./drizzle)
npm run db:migrate   # drizzle-kit migrate
npm run db:push      # drizzle-kit push (sync schema directly, no migration files)
npm run db:studio    # drizzle-kit studio
npm run db:seed      # tsx src/db/seed.ts: idempotent upsert of categories + products
```

No test runner is configured.

Setup: copy `.env.example` to `.env.local` (`DATABASE_URL` Neon connection string, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`). Next.js does not load `.env.example`.

## Architecture

Stack: Next.js App Router (`src/app`), TypeScript, Tailwind v4, Better Auth, Drizzle ORM, Neon Postgres. Import alias `@/*` maps to `src/*`.

Request/data flow, which spans several files:

- `src/lib/auth-client.ts` (browser `authClient`) calls `/api/auth/*`.
- `src/app/api/auth/[...all]/route.ts` is a catch-all that exposes `GET`/`POST` via `toNextJsHandler(auth)`.
- `src/lib/auth.ts` is the server `betterAuth` instance. It uses `drizzleAdapter(db, { provider: "pg" })` and the `nextCookies()` plugin so cookies can be set from server actions.
- `src/db/index.ts` exports `db` (Drizzle over the Neon HTTP driver, `drizzle-orm/neon-http`). It throws at import time if `DATABASE_URL` is unset.
- `drizzle.config.ts` loads `.env.local` then `.env` (via `dotenv`, the same files Next.js reads) and points drizzle-kit at `src/db/schema.ts`. Migrations are committed in `./drizzle`.

### Storefront UI

- `src/app/layout.tsx` renders `SiteHeader`/`SiteFooter` around every page. `src/app/page.tsx` composes the homepage from `src/components/home/`. Shared pieces (`SectionHeading`, `ProductCard`) live in `components/layout/` and `components/product/`. All are server components.
- `src/app/products/[slug]/page.tsx` is the product detail page: `components/product/` holds the gallery, info panel and `StockStatus`.
- Catalogue data lives in Postgres (`categories`, `products` in `src/db/schema/catalog.ts`, re-exported by `src/db/schema.ts`). Prices are integer cents (`price_cents`, formatted by `formatPrice` in `src/lib/format.ts`). Stock is `stock_quantity >= 0` on the product row; `getStockState` / `LOW_STOCK_THRESHOLD` (<= 5 is low) in `src/lib/stock.ts` derive in / low / out of stock, which drives the PDP status, the disabled "Add to bag" button and the "Sold out" card badge.
- `src/db/queries/catalog.ts` is the only place storefront code queries products. It is a file-level `"use cache"` module (needed because `cacheComponents` is on) with `cacheLife("minutes")` and `cacheTag("products")`, so after changing stock or prices call `revalidateTag("products")` or wait for expiry. It returns the `Product` DTO from `src/lib/types.ts`, not raw rows.
- Drizzle uses `casing: "snake_case"` in both `drizzle.config.ts` and `src/db/index.ts`; keep them in sync. Schema fields are camelCase in TS and snake_case in SQL.
- `src/lib/site-content.ts` holds editorial content that is NOT in the database (hero, editorial images, homepage collection cards). Homepage collections (women/men/knitwear/outerwear) are deliberately separate from product categories.
- `generateStaticParams` and the homepage read the database, so `next build` needs a reachable `DATABASE_URL` with the migration applied and the seed run.
- `next.config.ts` whitelists `images.unsplash.com` for `next/image`; any new image host must be added to `images.remotePatterns`.
- The PDP "Add to bag" button is not wired to a cart. Products have a single photo, so the second and third gallery frames are zoomed crops of it.
- With Cache Components, `dynamicParams` is unavailable: an unknown `/products/<slug>` renders the not-found UI (with `noindex`) but returns HTTP 200.
- Links to `/collections/*`, `/products/*`, `/cart`, `/search`, `/account` and `/about` point to routes that do not exist yet.

### Design system

All styling lives in `src/app/globals.css` (Tailwind v4, CSS-first, no config file):

- `@theme` defines the tokens: colors (`canvas`, `surface`, `ink`, `ink-muted`, `line`, `accent`), type scale, spacing (`gutter*`, `section*`, `header*`), container widths. Use these tokens instead of raw values.
- `@utility` primitives: `container-site`, `container-prose`, `section`, `product-grid`, `eyebrow`, `heading-display`, `heading-title`, `text-muted`.
- `@layer components` classes: `.btn` with `.btn-primary` / `.btn-outline` / `.btn-light` (for photos) / `.btn-block`, `.link`, `.nav-link`, `.field`, `.product-card` (BEM-style `__media`, `__name`, `__price`), `.rule`, `.panel`.
- Look: monochrome, square corners, hairline borders, no shadows, small uppercase tracked labels, light-only (no dark mode).

## Current state / gotchas

- `src/db/schema.ts` is an empty placeholder. Better Auth's tables (user, session, account, verification) are not defined yet, so auth endpoints fail at runtime until they are generated (`npx @better-auth/cli generate`), added to the schema, and passed to `drizzleAdapter(db, { provider: "pg", schema })`.
- Tailwind v4 is wired through `@tailwindcss/turbopack` rules in `next.config.ts` and `@import "tailwindcss"` in `globals.css`. There is no `tailwind.config` or PostCSS config.
- With `cacheComponents` on, non-deterministic values such as `new Date()` in a server component break prerendering. Compute them on the client, or inside a `"use cache"` function or behind a dynamic data access.
- `public/` still holds the create-next-app starter SVGs, which are unused.
- `.gitignore` ignores `.env*` except `.env.example`.
