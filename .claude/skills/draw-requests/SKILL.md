---
name: draw-requests
description: Turn the seller's waiting drawing requests (photos uploaded at /admin/requests) into cartoon crochet SVG artwork in the knitsomesweet style, register it, and mark the requests drawn. Use when asked to process, draw or work through drawing requests, or run /draw-requests.
---

# Draw the seller's requested items

The seller uploads photos of new products at `/admin/requests`. Each one needs a new SVG
artwork component in the same hand-made cartoon style as the existing ones, so it can be
recolored with any allowed color. You draw them here; they reach the site with the next deploy.

## 1. Fetch the queue

```bash
npm run drawings -- export
```

This writes `drawing-requests/requests.json` and one photo per request (the folder is
gitignored: the photos are the seller's private data, never commit them or copy them into
`public/` or `image_ref/`). It reads `DATABASE_URL` from `.env`; to work on the live
shop's requests, the user must point it at the production database. If nothing is waiting,
say so and stop.

Each entry has `id`, `name`, `kind` (bloom, filler, friend, vase or wrap), `notes`,
`photo`, `registry` (`stemArtworks` or `vesselArtworks`) and a free `suggestedKey`.

## 2. Learn the style before drawing

Read `src/components/artwork/parts.tsx` and the file you will add to, and look at 2–3
existing artworks of the same kind. Render one for reference:
`npm run artwork:render -- tulip`, then read the PNG in `drawing-requests/`.

The rules (also in CLAUDE.md):

- One component per artwork: `export function MiniDaisy({ color }: ArtProps)`.
- **Only `color` varies.** Derive shades with `shade(color, ±n)` from `@/lib/color`.
  Parts that don't change with the seller's color (centers, leaves, faces, caps) use
  constants such as `LEAF_GREEN`, `INK`, `CREAM`, `BUTTER`.
- Cartoon outlines come from `{...filled(fill)}`; crochet texture from dashed
  `<Stitch d=... color=... />` lines along petals and rims. No gradients, filters, raster
  images or text.
- **Anchor:** stem artwork has the stem attachment point at (0, 0) and extends upward
  (negative y). Blooms fit in about a 30-unit radius around (0, -28). Fillers carry their
  own stem up to about y = -100.
- Vessels are drawn in canvas coordinates (viewBox `0 0 400 520`) as separate `…Back` and
  `…Front` components, with a `gather` point where stems meet. Copy the proportions of the
  existing vessels in `vessels.tsx`.
- Round every coordinate you compute with trig (use `polar()` in `blooms.tsx`), or
  server and client markup differ and hydration fails.
- Simplify: capture the silhouette, petal count, and one or two signature details from the
  photo (a two-tone center, ruffled edges, ears). It should read clearly at 80 px.
- Amigurumi friends are original drawings of the seller's own product. Never base a
  drawing on an existing licensed character, even if the photo resembles one; if a request
  looks like one, ask the user instead of drawing it.

## 3. Draw and register

1. Add the component to `blooms.tsx`, `fillers.tsx`, `friends.tsx` or `vessels.tsx`.
2. Add it to the registry in `src/components/artwork/registry.ts` under `suggestedKey`
   (or a clearer free key):
   - stems: `{ Component, stemColor, reach }`. `stemColor` is `green` for most flowers or
     `sameHue` for sprigs and friends; `reach` is how far above (0, 0) the drawing goes
     (the highest point's |y|, used to frame thumbnails).
   - vessels: `{ Back, Front, gather: { x, y } }`.

## 4. Check it by eye, then iterate

```bash
npm run artwork:render -- <key>              # default palette colors
npm run artwork:render -- <key> "#9cbf97"    # or specific colors
```

Read `drawing-requests/render-<key>.png` next to the request's photo. Check that it
matches the photo's shape, sits beside the reference in the same style (outline weight,
stitch density, softness), stays inside the thumbnail frame, and looks right in light
(milk white) and dark colors. Redraw until it does; two or three rounds is normal.

Then run `npm run typecheck`, `npm run lint` and `npm test`.

## 5. Mark the requests drawn

```bash
npm run drawings -- done <id> <key>
```

This refuses keys that aren't in the registry. The seller's page shows "Drawn, live after
the next site update" until the deploy, then "Ready to use" with a **Create item** button
that pre-fills the item form.

## 6. Report

List each request with its key and the render's file path, and remind the user to commit
and deploy. If a photo was too unclear to draw, leave that request waiting and say what
the seller should re-shoot.
