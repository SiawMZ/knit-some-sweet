import type { Metadata } from "next";

/**
 * What WhatsApp and other apps show when a link to the site is shared. The picture
 * is `src/app/opengraph-image.jpg`. Browser tab titles are set per page.
 */
export const LINK_PREVIEW = {
  title: "Knitsomesweet",
  description: "Create bouquet with me",
  siteName: "knitsomesweet",
  type: "website",
} satisfies Metadata["openGraph"];
