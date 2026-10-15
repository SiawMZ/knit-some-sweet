# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Status: the customer builder reads its catalog from Postgres (Prisma), the seller admin at `/admin` (Auth.js login) edits it and shows an analytics dashboard, and submitted bouquets are saved as snapshots with share links. Items marked *(planned)* below don't exist yet.
>
> This is Next.js 16 with `cacheComponents` enabled. Its APIs differ from older versions: read the bundled docs in `node_modules/next/dist/docs/` before using a Next.js API (see `AGENTS.md`).

## What this is

A bouquet builder for **knitsomesweet**, a small crochet-flower brand (Instagram: @knitsomesweet). Customers mix and match crochet flowers and other items into a custom bouquet, then send it to the seller (vendor) or share it with someone. The interaction model is inspired by fori-flower-studio.com (pick stems, adjust each one, then a vase or wrapping). Use it only as a reference for how the flow works. Do not copy its assets, copy text or branding.

Two sides:

- **Customer builder (public)**: add available items; for each one set the quantity, stem height, tilt, layer order and a color (only from that item's allowed colors); pick a vase or wrapping type; preview live; optionally add a needed-by date and remarks; then send the bouquet to the seller or share it. The seller asked for no per-stem size control.
- **Seller admin (`/admin`, single seller)**: create, edit and remove items, vases and wraps; set the maximum quantity, the allowed colors (picked from a shared yarn palette; the first is the default) and the active state, with a live artwork preview. Manage the palette. Request a drawing of a new product by uploading a photo (see "Drawing requests" below). A dashboard shows page views per day, the most-picked items and colors, and the latest bouquets.

## Visual style

Warm, aesthetic, cartoon-like, matching the brand's Instagram: soft pastels (pinks, creams, butter yellow, sage green), rounded shapes and a hand-made feel. The UI should feel cozy, not like a generic e-commerce site. Brand colors are Tailwind theme tokens in `src/app/globals.css` (`paper`, `ink`, `rose`, `butter`, `sage`, ...). Fonts are Fredoka (`font-display`) and Nunito (`font-sans`).

`image_ref/` holds the seller's product photos (WhatsApp JPEGs). These photos are **source references only** and are not served by the app. Each product is redrawn as a cartoonized crochet **SVG React component** in `src/components/artwork/`:

- Each artwork takes a single `color` prop (the seller-chosen main color); secondary shades come from `shade()` in `src/lib/color.ts`, and fixed accents (centers, caps, leaves) are constants. Never bake colors into separate files.
- Anchor convention (documented in `parts.tsx`): stem artwork is drawn with the stem-attachment point at (0, 0), extending upward. Blooms fit in about a 30-unit radius around (0, -28). Fillers (sprigs) carry their own stem up to about y = -100. Vessels are drawn in canvas coordinates (viewBox `0 0 400 520`) as separate `Back` and `Front` layers.
- Crochet texture comes from the dashed `Stitch` overlay and cartoon outlines (`filled()`), not raster textures.
- Coordinates computed with trig must be rounded (see `polar()` in `blooms.tsx`), or server and client markup differ and hydration fails.
- The amigurumi friends (piggy, chick, bear) are original drawings based on the seller's own products. Don't base artwork on existing licensed characters.

## Stack and tooling

- **Next.js (App Router) + TypeScript**, using **npm** (pnpm is not installed on this machine).
- **Tailwind CSS v4**, configured in CSS (`@theme` in `globals.css`); there is no `tailwind.config`.
- **Zustand** for the builder's client-side bouquet state.
- **Motion** (`motion/react`) for the stems' pop-in animation. Dragging is hand-rolled with pointer events in `BouquetCanvas.tsx`.
- **Zod** schemas in `src/lib/bouquet.ts`, shared between client and server.
- **Vitest + React Testing Library** (jsdom) for unit and component tests.
- **ESLint (next config) + Prettier**.
- **Prisma 7 + PostgreSQL** (`prisma/schema.prisma`, config in `prisma.config.ts`, driver adapter `@prisma/adapter-pg`). The client is generated into `src/generated/prisma` (gitignored; `postinstall` runs `prisma generate`). Use `db()` from `src/lib/server/db.ts`, which creates the client lazily so builds never need a database. Local Postgres runs from `docker-compose.yml`; Docker Desktop's engine isn't always running.
- **Auth.js (NextAuth v5 beta)** credentials login for the single seller account (`src/auth.ts`).
- **Recharts** for the admin dashboard.
- *(planned)* **Playwright** for end-to-end flows.

```bash
npm run dev            # dev server on http://localhost:3000
npm run build          # production build
npm run lint
npm run typecheck
npm test               # all unit tests once; npm run test:watch to watch
npx vitest run src/lib/bouquet.test.ts   # single file; add -t "name" for a single test
npm run format         # Prettier
npm run db:up          # start local Postgres (docker compose)
npm run db:migrate     # prisma migrate dev
npm run db:seed        # seed the catalog from src/lib/catalog/seed.ts (re-runnable; never overwrites edits)
npm run hash-password -- "the password"   # prints SELLER_PASSWORD_HASH
npm run drawings -- list|export|done <id> <key>   # drawing-request queue (see /draw-requests)
npm run artwork:render -- <key> [#hex ...]        # render an artwork to drawing-requests/render-<key>.png
```

Environment (see `.env.example`; keep values in `.env`, which both Next.js and the Prisma CLI read):

- `DATABASE_URL`: the Postgres connection string. `DIRECT_URL` (optional) is a non-pooled one that `prisma migrate` prefers (scripts and the seed use `DATABASE_URL`).
- `AUTH_SECRET`, `SELLER_EMAIL`, `SELLER_PASSWORD_HASH`: the seller login. The hash format is `scrypt.<salt>.<key>`, with no `$`, so Next's env expansion leaves it alone.
- `SHOP_TIME_ZONE`: IANA zone for the dashboard's days (defaults to UTC).
- `NEXT_PUBLIC_SELLER_WHATSAPP` (digits only, with country code) sets the seller's WhatsApp number for "Send to seller". Without it, the button opens WhatsApp's share sheet instead.
- `DRAWING_REQUEST_WEBHOOK_URL` (optional) notifies the developer when the seller sends a drawing request. Unset means no notification. The format follows the host (`ntfy.sh` topic URL, Discord or Slack incoming webhook, else plain JSON); `DRAWING_REQUEST_WEBHOOK_FORMAT` (`ntfy`, `discord`, `slack` or `json`) overrides it, for example for a self-hosted ntfy.

## Deployment

Hosted on Vercel from GitHub (`SiawMZ/knit-some-sweet`, branch `main`), with Postgres on Neon. `vercel.json` runs `prisma migrate deploy` before `next build`, so pushed migrations apply on deploy. Set the environment variables above in the Vercel project (`DATABASE_URL` as Neon's pooled URL, `DIRECT_URL` as its direct one). The catalog seed is run once by hand against Neon. To process the live shop's drawing requests, point the local `DATABASE_URL` at Neon.

## Architecture

- **The catalog is data, the artwork is code.** `CatalogItem` and `Vessel` (`src/lib/catalog/types.ts`) reference drawings by `artworkKey`, which maps to components in `src/components/artwork/registry.ts`. The seller can add or edit items only for artwork that already exists in the registry. A new shape needs a new SVG component plus a registry entry (with its `stemColor` and thumbnail `reach`). The admin's zod schemas (`src/lib/catalog/admin.ts`) reject unknown keys.
- **The catalog lives in the database.** Tables: `Color` (the shared palette, keyed by a slug), `Item` and `Vessel`, and the ordered join tables `ItemColor` and `VesselColor` (the lowest `position` is the default color). `toCatalog()` (`src/lib/catalog/rows.ts`) maps rows to a `Catalog` and drops rows whose artwork isn't in the registry or that have no colors. `getCatalog()` (`src/lib/catalog/queries.ts`) is what customers see: active rows only, cached with `"use cache"` under the `catalog` tag. Every admin mutation calls `updateTag(CATALOG_TAG)`. The builder page reads it after `await connection()` inside `<Suspense>`, so prerendering never touches the database.
- **A bouquet is a list of stems.** Each `Stem` (`src/lib/bouquet.ts`) is one physical stem with its own color, `height` (cm), `angle` and base `offset`. The `Bouquet` also carries optional `neededBy` (YYYY-MM-DD) and `remarks`. Quantity is the number of stems per item, capped by `maxQuantity`. `summarize()` groups stems into order lines.
- **State.** `useBuilder` (`src/lib/store.ts`, Zustand) holds stems, the vessel and the selection. It persists to localStorage with `skipHydration` and is rehydrated in `Builder`'s effect, so server HTML always renders an empty bouquet. After rehydrating, `reconcile(catalog)` fits the saved stems to the current catalog (`reconcileStems` and `reconcileVessel` in `bouquet.ts`): stems of removed or hidden items are dropped, colors no longer offered reset to the default, and items over a lowered max are trimmed. Stem order is z-order (the last stem is in front), and "Move forward/back" swaps a stem with its neighbor, one layer per click.
- **Rendering.** `BouquetSvg` is the pure renderer: vessel `Back`, then stems, then heads, then vessel `Front`, with stem geometry from `stemGeometry()` (`PX_PER_CM` canvas units per cm). `BouquetCanvas` wraps it with selection and dragging: dragging a head sets the angle and height.
- **Validation is authoritative on the server.** The client enforces limits for UX, but `validateBouquet()` must run server-side on anything saved or sent, because the seller can change the catalog at any time. The `submitBouquet` Server Action (`src/app/actions/bouquets.ts`) does this through `prepareSubmission()` (`src/lib/server/submission.ts`) against the live `getCatalog()`. `validateBouquet()` takes `today` as an argument: with `cacheComponents`, reading `new Date()` during render breaks prerendering, so the builder reads the date in the Finish click handler and passes it down. The server accepts that date only within a day of its own (`trustedToday()`).
- **Saved bouquets are snapshots.** `submitBouquet` stores the validated bouquet plus `catalogSubset()` (only the items and vessel it uses) in `SavedBouquet` under a random slug, so `/b/[slug]` still renders after the catalog changes. The share page shows the bouquet and its lines but not the needed-by date or remarks; the seller sees those on the dashboard.
- **Sending.** `FinishDialog` first saves the bouquet ("Looks perfect, continue"), then offers WhatsApp, copy link, copy text and save picture. The order text from `orderMessage()` ends with the share link. It renders a PNG of the SVG as soon as it opens. `wa.me` links can only carry text, so on touch devices "WhatsApp" uses the Web Share API to send the PNG and text together (the customer picks the chat). Elsewhere it saves the PNG and opens the `wa.me` link, asking the customer to attach the picture. The PNG must be ready before the click, because `navigator.share` needs a fresh user gesture.
- **Analytics are first-party events** in `AnalyticsEvent`. The browser reports `page_view` (`<PageView />` on customer pages) and `item_added` (picker and duplicate) to `POST /api/events` through `track()` (`src/lib/analytics/client.ts`); `submitBouquet` records `bouquet_submitted`. The route validates with `clientEventSchema` (paths lose query strings, extra fields are dropped), skips bots and link previewers, and counts only picks of real catalog items. Never store PII: no IPs, user agents, names or remarks. The dashboard (`src/lib/analytics/queries.ts`, with pure helpers in `dashboard.ts`) covers the last 30 days: views per day, items by `item_added`, and colors by stems in submitted bouquets.
- **Drawing requests.** New shapes need new artwork code, so the seller can't create them in the app. At `/admin/requests` the seller uploads a photo (downscaled in the browser to a JPEG of at most 1600 px; `serverActions.bodySizeLimit` is 3 MB) with a name, kind and notes. It's stored as a `DrawingRequest` row (the photo is in the database, served only to the seller by `requests/[id]/photo/route.ts`). If `DRAWING_REQUEST_WEBHOOK_URL` is set, `requestDrawing` then pings the developer from `after()` (`notifyDrawingRequest()` in `src/lib/server/notify.ts`, payloads from the pure `buildDrawingWebhook()` in `src/lib/drawing-webhook.ts`): only the name, kind and a link to `/admin/requests`, never the photo or notes, and a failing webhook is only logged. The developer processes the queue in Claude Code with the project skill `/draw-requests` (`.claude/skills/draw-requests/SKILL.md`): `npm run drawings -- export` saves the photos to the gitignored `drawing-requests/`, Claude draws and registers the component and checks it with `npm run artwork:render`, then `npm run drawings -- done <id> <key>` marks it drawn. `drawingState()` (`src/lib/drawings.ts`) shows "Drawn, live after the next site update" until the deploy puts the key in the registry, then "Ready to use" with a **Create item** link that pre-fills `/admin/items/new` (or `/admin/vessels/new`) through `?name=&artwork=&category=`. This is deliberately not automated in the app: the app must not run Claude Code on the developer's subscription. Automatic drawing would need an Anthropic API key.
- **Auth.** `src/proxy.ts` (Next 16's middleware) runs Auth.js's `authorized` callback on `/admin/*` and redirects signed-out visitors to `/admin/login`. That is only a first line: every admin page and Server Action calls `requireSeller()` (`src/lib/server/session.ts`) itself. Admin pages live in the `src/app/admin/(panel)` route group (the login page sits outside it). They read the session per request, so each sets `export const instant = false` and `loading.tsx` shows while they stream. `seed.ts` is now only the source for the Prisma seed.
