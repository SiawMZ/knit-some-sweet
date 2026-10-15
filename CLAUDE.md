# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Status: the customer builder works against a static catalog (`src/lib/catalog/seed.ts`). Not built yet: the database, the seller admin and auth, analytics, and saved/shared bouquet links. Items marked *(planned)* below don't exist yet.
>
> This is Next.js 16 with `cacheComponents` enabled. Its APIs differ from older versions: read the bundled docs in `node_modules/next/dist/docs/` before using a Next.js API (see `AGENTS.md`).

## What this is

A bouquet builder for **knitsomesweet**, a small crochet-flower brand (Instagram: @knitsomesweet). Customers mix and match crochet flowers and other items into a custom bouquet, then send it to the seller (vendor) or share it with someone. The interaction model is inspired by fori-flower-studio.com (pick stems, adjust each one, then a vase or wrapping). Use it only as a reference for how the flow works. Do not copy its assets, copy text or branding.

Two sides:

- **Customer builder (public)**: add available items; for each one set the quantity, stem height, tilt, layer order and a color (only from that item's allowed colors); pick a vase or wrapping type; preview live; optionally add a needed-by date and remarks; then send the bouquet to the seller or share it. The seller asked for no per-stem size control.
- *(planned)* **Seller admin (auth-protected, single seller)**: create, edit and remove items, wrapping and vases; set the maximum quantity per item and the allowed colors. A dashboard shows the most-selected items and colors, plus site traffic.

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
- *(planned)* **Prisma + PostgreSQL** for the catalog, saved bouquets and analytics events. Docker is installed for a local Postgres, but its daemon isn't always running.
- *(planned)* **Auth.js (NextAuth v5)** with credentials for the single seller account; protect `/admin`.
- *(planned)* **Recharts** for the admin dashboard; **Playwright** for end-to-end flows.

```bash
npm run dev            # dev server on http://localhost:3000
npm run build          # production build
npm run lint
npm run typecheck
npm test               # all unit tests once; npm run test:watch to watch
npx vitest run src/lib/bouquet.test.ts   # single file; add -t "name" for a single test
npm run format         # Prettier
```

`NEXT_PUBLIC_SELLER_WHATSAPP` (digits only, with country code) sets the seller's WhatsApp number for "Send to seller". Without it, the button opens WhatsApp's share sheet instead.

## Architecture

- **The catalog is data, the artwork is code.** `CatalogItem` and `Vessel` (`src/lib/catalog/types.ts`) reference drawings by `artworkKey`, which maps to components in `src/components/artwork/registry.ts`. The seller can add or edit items only for artwork that already exists in the registry. A new shape needs a new SVG component plus a registry entry (with its `stemColor` and thumbnail `reach`).
- **A bouquet is a list of stems.** Each `Stem` (`src/lib/bouquet.ts`) is one physical stem with its own color, `height` (cm), `angle` and base `offset`. The `Bouquet` also carries optional `neededBy` (YYYY-MM-DD) and `remarks`. Quantity is the number of stems per item, capped by `maxQuantity`. `summarize()` groups stems into order lines.
- **State.** `useBuilder` (`src/lib/store.ts`, Zustand) holds stems, the vessel and the selection. It persists to localStorage with `skipHydration` and is rehydrated in `Builder`'s effect, so server HTML always renders an empty bouquet. Stem order is z-order (the last stem is in front), and "Move forward/back" swaps a stem with its neighbor, one layer per click.
- **Rendering.** `BouquetSvg` is the pure renderer: vessel `Back`, then stems, then heads, then vessel `Front`, with stem geometry from `stemGeometry()` (`PX_PER_CM` canvas units per cm). `BouquetCanvas` wraps it with selection and dragging: dragging a head sets the angle and height.
- **Validation is authoritative on the server.** The client enforces limits for UX, but `validateBouquet()` must run server-side on anything saved or sent, because the seller can change the catalog at any time. Today it runs only in `FinishDialog`. It takes `today` as an argument: with `cacheComponents`, reading `new Date()` during render breaks prerendering, so the builder reads the date in the Finish click handler and passes it down.
- **Sending.** `FinishDialog` builds the order text with `orderMessage()` and offers a WhatsApp link, copy-to-clipboard and a PNG export of the SVG.
- *(planned)* **Saved bouquets are snapshots.** Store the stems plus the vessel under a shareable slug, so a shared link still renders after the catalog changes. When this lands, `seed.ts` becomes the Prisma seed.
- *(planned)* **Analytics are first-party events.** Record `page_view`, `item_added` and `bouquet_submitted` events. The admin dashboard aggregates them (most-selected items and colors, visits over time). No customer PII in events.
