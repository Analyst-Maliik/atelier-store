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
npm run auth:make-admin -- <email> [--demote]   # grant/remove the admin role for an existing user
```

No test runner is configured.

Setup: copy `.env.example` to `.env.local` (`DATABASE_URL` Neon connection string, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`). Next.js does not load `.env.example`.

## Architecture

Stack: Next.js App Router (`src/app`), TypeScript, Tailwind v4, Better Auth, Drizzle ORM, Neon Postgres. Import alias `@/*` maps to `src/*`.

Request/data flow, which spans several files:

- `src/lib/auth-client.ts` (browser `authClient`) calls `/api/auth/*`.
- `src/app/api/auth/[...all]/route.ts` is a catch-all that exposes `GET`/`POST` via `toNextJsHandler(auth)`.
- `src/lib/auth.ts` is the server `betterAuth` instance: email + password only (min 10 chars, no email verification yet), `drizzleAdapter(db, { provider: "pg", schema })`, the `admin` plugin (roles `user` / `admin`) and `nextCookies()` (keep last). Sessions are DB-backed, 30 days, rolling (refreshed daily). There is deliberately no `cookieCache`: a cached copy would outlive sign-out, bans and role changes.
- Auth tables live in `src/db/schema/auth.ts` (generated with `npx auth@latest generate --config src/lib/auth.ts --output src/db/schema/auth.ts`, then timestamps made `withTimezone` and `role` given a default). Re-run the generator after adding or changing plugins.
- `src/lib/session.ts` is the data-access layer: `getSession()`, `requireUser(next)`, `requireAdmin(next)`. Every protected page and server action must call these itself; `src/proxy.ts` only does an optimistic cookie check for `/account/*` and `/admin/*` and never replaces them. They read headers, so render them inside `<Suspense>` (see `app/account/page.tsx`). A bogus cookie passes the proxy, and the page then redirects client-side (HTTP 200, no data leaked).
- Validation rules live in `src/lib/auth-validation.ts` and are used twice: by the server actions (authoritative, returns `fieldErrors` plus the typed `values` so the form keeps them, since React resets uncontrolled forms after an action) and by `components/auth/auth-form.tsx` for instant inline errors, focus management, the password show/hide toggle and the pending state. Sign-in never reveals the password policy and uses one generic credentials error.
- Account area (`src/app/account/`): `layout.tsx` arranges a sidebar (tab row below `lg`) built by `components/account/account-nav.tsx` (client, `usePathname` for `aria-current`, sign-out form). The admin link is added by the async `AccountSidebar` inside `<Suspense>` with the static nav as fallback. The layout does NOT authorize; each page (`page.tsx` overview, `details/page.tsx` read-only profile) calls `requireUser()` inside its own `<Suspense>`. New account pages must do the same and be added to the `baseItems` in `account-nav.tsx`. Order history, addresses and profile editing are not built yet.
- Sign up / sign in / sign out are server actions in `src/app/actions/auth.ts` (POST forms via `components/auth/auth-form.tsx`, pages in `app/(auth)/`). They call `auth.api.*` directly, which bypasses Better Auth's HTTP rate limiter, so they use `src/lib/rate-limit.ts` (fixed window in the `rate_limit` table). `safeNext()` in `src/lib/safe-redirect.ts` guards the `?next=` redirect against open redirects.
- First admin: sign up, then `npm run auth:make-admin -- <email>` (add `--demote` to revert). There is no auto-promotion. Sign-up reveals whether an email is registered (no verification yet).
- `src/db/index.ts` exports `db` (Drizzle over the Neon HTTP driver, `drizzle-orm/neon-http`). It throws at import time if `DATABASE_URL` is unset.
- `drizzle.config.ts` loads `.env.local` then `.env` (via `dotenv`, the same files Next.js reads) and points drizzle-kit at `src/db/schema.ts`. Migrations are committed in `./drizzle`.

### Storefront UI

- `src/app/layout.tsx` renders `SiteHeader`/`SiteFooter` around every page. `src/app/page.tsx` composes the homepage from `src/components/home/`. Shared pieces (`SectionHeading`, `ProductCard`) live in `components/layout/` and `components/product/`. All are server components.
- `src/app/products/[slug]/page.tsx` is the product detail page: `components/product/` holds the gallery, info panel and `StockStatus`.
- Catalogue data lives in Postgres (`categories`, `products` in `src/db/schema/catalog.ts`, re-exported by `src/db/schema.ts`). Prices are integer cents (`price_cents`, formatted by `formatPrice` in `src/lib/format.ts`). Stock is `stock_quantity >= 0` on the product row; `getStockState` / `LOW_STOCK_THRESHOLD` (<= 5 is low) in `src/lib/stock.ts` derive in / low / out of stock, which drives the PDP status, the disabled "Add to bag" button and the "Sold out" card badge.
- `/new-arrivals` (`src/app/new-arrivals/page.tsx`) lists products newest first via `getNewArrivals(limit)` (order by `created_at desc, id desc`). The homepage "New arrivals" grid uses the same query (limit 8) and links to it.
- `/collections/[slug]` (`src/app/collections/[slug]/page.tsx`) is the category page: the slug is a `categories.slug` row (handbags, bags, knitwear, outerwear, watches, ready-to-wear, women, men, accessories), listing its products newest first with links to the other categories. `women`, `men` and `accessories` are real categories too, so every header and homepage collection link resolves.
- `/search?q=` (`src/app/search/page.tsx`) is a plain GET form (works without JS; queries are not sensitive, unlike credentials). `normalizeQuery()` in `src/lib/search.ts` trims and caps the query at 80 chars (it also bounds the `"use cache"` keys); `searchProducts()` ANDs up to 5 words across product name, description and category name with `ILIKE`, escaping `%`, `_` and `\` via `escapeLike()`, ranking name matches first. The page reads `searchParams`, so its results render inside `<Suspense>`.
- Cart (bag): stored in an HttpOnly cookie `atelier_cart` holding only `[{s: slug, q: quantity}]` (max 20 lines, 10 per line), no database tables, shared by guests and signed-in users and unaffected by sign-in/out. Prices, names and stock are NEVER in the cookie: `getCart()` (`src/lib/cart-server.ts`) rebuilds the bag on every read from `src/db/queries/cart.ts`, which is deliberately uncached (catalog queries are cached up to ~1 min). Pure helpers/limits/cookie parsing are in `src/lib/cart.ts` (parsing drops anything malformed). Server actions in `src/app/actions/cart.ts` (`addToCart`, `setQuantity`, `removeFromCart`) re-read product stock live, reject or clamp to `maxQuantity(stock)`, rate-limit, and are the only writers of the cookie (components cannot set cookies while rendering). Read-time reconciliation shows lowered quantities and sold-out lines and excludes them from the subtotal. The header count (`components/cart/bag-count.tsx`) is cookie-only inside `<Suspense>`, so pages are now partial prerenders (static shell, dynamic bag count) and the count can differ from the purchasable item count when stock changed. Adding to the bag does NOT reserve stock; checkout must enforce it atomically (`UPDATE products SET stock_quantity = stock_quantity - n WHERE slug = ... AND stock_quantity >= n`). `product-columns.ts` holds the column mapping shared by cached and uncached queries.
- Cart UI (`app/cart/page.tsx`, `components/cart/`): `cart-line.tsx` (server) renders a line with `StockStatus` for low stock (<= 5) plus notices for `reduced` / `sold-out` lines; `cart-line-controls.tsx` (client) holds the quantity stepper and Remove as plain forms with `useFormStatus` so the row dims (`has-[[aria-busy=true]]`) while an action runs. The page shows an availability banner when any line changed, a screen-reader-only live region with the item count and subtotal, and `cart-summary.tsx` notes how many sold-out items are excluded. `components/layout/category-links.tsx` is shared by the search and cart empty states. Checkout is a disabled placeholder.
- Checkout (Stripe-hosted Checkout Sessions; plugin guidance in `stripe-best-practices`): env `STRIPE_SECRET_KEY` (restricted `rk_` key from a Stripe SANDBOX; `src/lib/stripe.ts` refuses live keys outside production) and `STRIPE_WEBHOOK_SECRET` (`whsec_`, from `stripe listen --forward-to localhost:3000/api/stripe/webhook`); return URLs use `BETTER_AUTH_URL`. Nothing price/status related is ever taken from the browser: `startCheckout` (`app/actions/checkout.ts`) rebuilds the bag from the cart cookie + live DB prices, computes shipping (`lib/checkout.ts`: free from $250, else $15, US only), inserts a `pending` order with line snapshots (`orders`, `order_items` in `db/schema/orders.ts`, `db/queries/orders.ts`), then creates the Session with `client_reference_id`/`metadata.order_id`. Stock is validated before the session and DECREMENTED ONLY when payment is confirmed: `settlePaidOrder` flips pending->paid and decrements every line in ONE SQL statement (the `stock_quantity >= 0` check fails the whole statement on a sell-out race -> order `refunding` and an idempotent Stripe refund). Payment state comes from Stripe only: `/api/stripe/webhook` verifies the signature on the raw body, dedupes by event id in `stripe_events` (`processed_at` set only after success, so a crashed delivery is retried), and `lib/checkout-events.ts` applies it with conditional updates (`WHERE status = 'pending'`) so replays, concurrent deliveries and out-of-order events are no-ops; the paid amount/currency must equal `orders.total_cents` or the order goes to `needs_review`. `/checkout/return` re-fetches the session from Stripe (the `session_id` query is only a lookup key), applies the same logic and clears the bag only when the order is paid. Statuses: pending, paid, failed, expired, refunding, refunded, needs_review. Abandoned checkouts just expire (no stock was taken). The Neon HTTP driver has no interactive transactions: use single statements or `db.batch`. Untested against real Stripe so far: only signed fake events were used.
- `src/db/queries/catalog.ts` is the only place storefront code queries products. It is a file-level `"use cache"` module (needed because `cacheComponents` is on) with `cacheLife("minutes")` and `cacheTag("products")`, so after changing stock or prices call `revalidateTag("products")` or wait for expiry. It returns the `Product` DTO from `src/lib/types.ts`, not raw rows.
- Drizzle uses `casing: "snake_case"` in both `drizzle.config.ts` and `src/db/index.ts`; keep them in sync. Schema fields are camelCase in TS and snake_case in SQL.
- `src/lib/site-content.ts` holds editorial content that is NOT in the database (hero, editorial images, homepage collection cards). Homepage collection cards (women/men/knitwear/outerwear) are editorial content that happens to link to same-named category pages.
- `generateStaticParams` and the homepage read the database, so `next build` needs a reachable `DATABASE_URL` with the migration applied and the seed run.
- Newsletter signup (footer): `components/layout/newsletter-form.tsx` (client, `useActionState`) posts to the `subscribeToNewsletter` server action in `src/app/actions/newsletter.ts`, which stores lowercased emails in `newsletter_subscribers` (unique). Forms that collect personal data must POST (server action), never GET, so the value stays out of URLs and history. Do not add `method`/`encType` props to a form whose `action` is a function: React already submits it as POST (the HTML shows `method="POST"`) and warns if you set them. The action never logs the email, returns the same success message for duplicates, and has a hidden honeypot field. There is no rate limiting yet.
- `next.config.ts` whitelists `images.unsplash.com` for `next/image`; any new image host must be added to `images.remotePatterns`.
- The PDP "Add to bag" button is not wired to a cart. Products have a single photo, so the second and third gallery frames are zoomed crops of it.
- With Cache Components, `dynamicParams` is unavailable: an unknown `/products/<slug>` renders the not-found UI (with `noindex`) but returns HTTP 200.
- Links to `/about` point to a route that does not exist yet.

### Design system

All styling lives in `src/app/globals.css` (Tailwind v4, CSS-first, no config file):

- `@theme` defines the tokens: colors (`canvas`, `surface`, `ink`, `ink-muted`, `line`, `accent`), type scale, spacing (`gutter*`, `section*`, `header*`), container widths. Use these tokens instead of raw values.
- `@utility` primitives: `container-site`, `container-prose`, `section`, `product-grid`, `eyebrow`, `heading-display`, `heading-title`, `text-muted`.
- `@layer components` classes: `.btn` with `.btn-primary` / `.btn-outline` / `.btn-light` (for photos) / `.btn-block`, `.link`, `.nav-link`, `.field`, `.product-card` (BEM-style `__media`, `__name`, `__price`), `.rule`, `.panel`.
- Look: monochrome, square corners, hairline borders, no shadows, small uppercase tracked labels, light-only (no dark mode).

## Current state / gotchas

- `src/db/schema.ts` re-exports `catalog`, `newsletter` and `auth`; `drizzle.config.ts` and the Better Auth adapter both read it.
- Tailwind v4 is wired through `@tailwindcss/turbopack` rules in `next.config.ts` and `@import "tailwindcss"` in `globals.css`. There is no `tailwind.config` or PostCSS config.
- With `cacheComponents` on, non-deterministic values such as `new Date()` in a server component break prerendering. Compute them on the client, or inside a `"use cache"` function or behind a dynamic data access.
- `public/` still holds the create-next-app starter SVGs, which are unused.
- `.gitignore` ignores `.env*` except `.env.example`.
