"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitBouquet } from "@/app/actions/bouquets";
import { STICKER_FILTER_ID } from "@/components/bouquet/BouquetSvg";
import {
  type Bouquet,
  REMARKS_MAX,
  orderMessage,
  summarize,
  validateBouquet,
} from "@/lib/bouquet";
import type { Catalog } from "@/lib/catalog/types";
import { useBuilder } from "@/lib/store";

const SELLER_WHATSAPP = process.env.NEXT_PUBLIC_SELLER_WHATSAPP ?? "";

const PICTURE_NAME = "my-knitsomesweet-bouquet.png";

/**
 * Picture layout, top to bottom: some breathing room, the bouquet (about 60% of the
 * height), an empty band kept free for an optional message later, then a small brand
 * logo (cut out of the Instagram profile picture) centered at the bottom.
 */
const PICTURE = { width: 800, height: 1040 };
const BOUQUET_AREA = { x: 40, y: 96, width: 720, height: 624 };
const LOGO_SRC = "/brand/logo.png";
const LOGO = { width: 150, bottom: 36 };
/** Canvas units kept around the bouquet's drawn edges, room for the sticker edge and its shadow. */
const BOUQUET_PAD = 16;

async function loadImage(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

/** The box the bouquet is drawn in, in canvas units (the backdrop excluded). */
function bouquetBox(svg: SVGSVGElement) {
  const toCanvas = svg.getScreenCTM()?.inverse();
  if (!toCanvas) return null;
  let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const el of Array.from(svg.children)) {
    if (el.hasAttribute("data-backdrop")) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const a = new DOMPoint(r.left, r.top).matrixTransform(toCanvas);
    const b = new DOMPoint(r.right, r.bottom).matrixTransform(toCanvas);
    [left, top, right, bottom] = [Math.min(left, a.x), Math.min(top, a.y), Math.max(right, b.x), Math.max(bottom, b.y)];
  }
  return left < right ? { left, top, right, bottom } : null;
}

/** Render the bouquet to a PNG file, laid out as described at `PICTURE`. */
async function renderPng(svg: SVGSVGElement): Promise<File> {
  const backdrop = svg.querySelector("[data-backdrop]")?.getAttribute("fill") ?? "#fff6ea";
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("[data-selection]").forEach((el) => el.remove());
  // A stem added just before Finish may still be popping in (scaled down, faded): draw it at full size.
  clone.querySelectorAll("[data-pop-in]").forEach((el) => el.removeAttribute("style"));
  clone.querySelector("[data-content]")?.setAttribute("filter", `url(#${STICKER_FILTER_ID})`);

  // Measure the cleaned-up copy (off screen), so popping-in stems count at full size.
  const holder = document.createElement("div");
  holder.style.cssText = "position: fixed; left: -10000px; top: 0; pointer-events: none";
  holder.append(clone);
  document.body.append(holder);
  const viewBox = svg.viewBox.baseVal;
  const box = bouquetBox(clone) ?? {
    left: viewBox.x,
    top: viewBox.y,
    right: viewBox.x + viewBox.width,
    bottom: viewBox.y + viewBox.height,
  };
  holder.remove();

  const x = box.left - BOUQUET_PAD;
  const y = box.top - BOUQUET_PAD;
  const w = box.right - box.left + 2 * BOUQUET_PAD;
  const h = box.bottom - box.top + 2 * BOUQUET_PAD;
  const scale = Math.min(BOUQUET_AREA.width / w, BOUQUET_AREA.height / h);
  const drawn = { width: Math.round(w * scale), height: Math.round(h * scale) };
  clone.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  clone.setAttribute("width", String(drawn.width));
  clone.setAttribute("height", String(drawn.height));
  const data = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([data], { type: "image/svg+xml" }));
  try {
    const [img, logo] = await Promise.all([
      loadImage(url),
      // A missing logo shouldn't stop the customer from getting their picture.
      loadImage(LOGO_SRC).catch(() => null),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = PICTURE.width;
    canvas.height = PICTURE.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, PICTURE.width, PICTURE.height);
      ctx.drawImage(
        img,
        BOUQUET_AREA.x + (BOUQUET_AREA.width - drawn.width) / 2,
        BOUQUET_AREA.y + (BOUQUET_AREA.height - drawn.height) / 2,
        drawn.width,
        drawn.height,
      );
      if (logo) {
        const logoHeight = (LOGO.width * logo.naturalHeight) / logo.naturalWidth;
        const logoTop = PICTURE.height - LOGO.bottom - logoHeight;
        ctx.drawImage(logo, (PICTURE.width - LOGO.width) / 2, logoTop, LOGO.width, logoHeight);
      }
    }
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (!blob) throw new Error("Could not render the bouquet picture.");
    return new File([blob], PICTURE_NAME, { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function saveFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * WhatsApp links can only carry text. On phones the system share sheet can
 * send the picture and text together; elsewhere we save the picture and open
 * the WhatsApp link so the customer can attach it.
 */
function canShareToApps(file: File) {
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

export function FinishDialog({
  open,
  today,
  onClose,
  bouquet,
  catalog,
  svgRef,
}: {
  open: boolean;
  /** Today as YYYY-MM-DD, the earliest date the customer can pick. */
  today: string;
  onClose: () => void;
  bouquet: Bouquet;
  catalog: Catalog;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const setOrderNotes = useBuilder((s) => s.setOrderNotes);

  const [picture, setPicture] = useState<File | null>(null);
  const [note, setNote] = useState<string | null>(null);
  /** The saved bouquet's slug, once the server has accepted it. */
  const [slug, setSlug] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Render the picture as soon as the dialog opens, so sharing it can happen
  // synchronously inside the click (browsers require a fresh user gesture).
  useEffect(() => {
    const svg = svgRef.current;
    if (!open || !svg) return;
    let cancelled = false;
    renderPng(svg).then(
      (file) => !cancelled && setPicture(file),
      () => !cancelled && setPicture(null),
    );
    return () => {
      cancelled = true;
    };
  }, [open, svgRef]);

  const close = () => {
    setSlug(null);
    setServerErrors([]);
    setNote(null);
    onClose();
  };

  const errors = validateBouquet(bouquet, catalog, today);
  const lines = summarize(bouquet.stems, catalog);
  const link = slug ? `${window.location.origin}/b/${slug}` : undefined;
  const message = orderMessage(bouquet, catalog, link);
  const waUrl = `https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(message)}`;

  // The server re-validates against the live catalog and saves a snapshot with a share link.
  const save = () =>
    startSaving(async () => {
      setServerErrors([]);
      try {
        const result = await submitBouquet(bouquet, today);
        if (result.ok) setSlug(result.slug);
        else setServerErrors(result.errors);
      } catch {
        setServerErrors(["We couldn't save your bouquet just now. Please try again."]);
      }
    });

  const copy = async (what: "text" | "link") => {
    await navigator.clipboard.writeText(what === "text" ? message : (link ?? ""));
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  };

  const sendOnWhatsApp = async () => {
    setNote(null);
    if (picture && canShareToApps(picture)) {
      try {
        await navigator.share({ files: [picture], text: message });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        // Sharing failed for another reason: fall back to save + link.
      }
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
    if (picture) {
      saveFile(picture);
      setNote("We saved your bouquet picture. Attach it in WhatsApp before you press send ✿");
    }
  };

  const shownErrors = errors.length > 0 ? errors : serverErrors;

  return (
    <dialog
      ref={ref}
      onClose={close}
      className="m-auto w-[min(92vw,30rem)] rounded-[2rem] border-2 border-ink/10 bg-paper p-0 text-ink backdrop:bg-ink/30"
    >
      <div className="p-6">
        <h2 className="font-display text-3xl">Your bouquet 💐</h2>
        {shownErrors.length > 0 && (
          <ul role="alert" className="mt-4 space-y-1 rounded-2xl bg-rose/15 p-4 text-sm">
            {shownErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {errors.length === 0 && (
          <>
            <ul className="mt-4 divide-y divide-ink/10 rounded-2xl bg-white/70 px-4">
              {lines.map((l) => (
                <li key={`${l.itemId}:${l.colorId}`} className="flex justify-between py-2">
                  <span>
                    {l.itemName} <span className="text-ink/60">· {l.colorName}</span>
                  </span>
                  <span className="tabular-nums">× {l.quantity}</span>
                </li>
              ))}
            </ul>
            {slug === null ? (
              <>
                <div className="mt-5 space-y-3">
                  <label className="block">
                    <span className="font-display">
                      Needed by <span className="text-sm text-ink/60">(optional)</span>
                    </span>
                    <input
                      type="date"
                      min={today}
                      value={bouquet.neededBy ?? ""}
                      onChange={(e) => setOrderNotes({ neededBy: e.target.value })}
                      className="mt-1 block w-full rounded-2xl border-2 border-ink/15 bg-white/80 px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    <span className="font-display">
                      Remarks <span className="text-sm text-ink/60">(optional)</span>
                    </span>
                    <textarea
                      rows={3}
                      maxLength={REMARKS_MAX}
                      value={bouquet.remarks ?? ""}
                      onChange={(e) => setOrderNotes({ remarks: e.target.value })}
                      placeholder="A card message, a pickup time, anything we should know ✿"
                      className="mt-1 block w-full resize-none rounded-2xl border-2 border-ink/15 bg-white/80 px-3 py-2"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="btn-primary mt-5 w-full disabled:opacity-60"
                >
                  {saving ? "Saving your bouquet…" : "Looks perfect, continue ✿"}
                </button>
              </>
            ) : (
              <div className="mt-5 grid gap-2">
                <p className="rounded-2xl bg-sage/30 px-3 py-2 text-sm">
                  Saved! Your bouquet has its own page:{" "}
                  <a href={link} target="_blank" rel="noreferrer" className="font-semibold break-all underline">
                    {link}
                  </a>
                </p>
                <button
                  type="button"
                  onClick={sendOnWhatsApp}
                  disabled={!picture}
                  className="btn-primary disabled:opacity-60"
                >
                  {SELLER_WHATSAPP ? "Send to knitsomesweet on WhatsApp" : "Share on WhatsApp"}
                </button>
                {note && (
                  <p role="status" className="rounded-2xl bg-butter/30 px-3 py-2 text-sm">
                    {note}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="btn-soft px-2" onClick={() => copy("link")}>
                    {copied === "link" ? "Copied!" : "Copy link"}
                  </button>
                  <button type="button" className="btn-soft px-2" onClick={() => copy("text")}>
                    {copied === "text" ? "Copied!" : "Copy text"}
                  </button>
                  <button
                    type="button"
                    className="btn-soft px-2"
                    onClick={() => picture && saveFile(picture)}
                    disabled={!picture}
                  >
                    Save picture
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSlug(null)}
                  className="text-sm text-ink/70 underline underline-offset-4"
                >
                  Change the date or remarks
                </button>
              </div>
            )}
          </>
        )}
        <button type="button" onClick={close} className="mt-4 w-full text-sm text-ink/70 underline underline-offset-4">
          Keep arranging
        </button>
      </div>
    </dialog>
  );
}
