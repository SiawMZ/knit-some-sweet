"use client";

import { useEffect, useRef, useState } from "react";
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

/** Render the bouquet SVG to a PNG and trigger a download. */
async function downloadPng(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", "800");
  clone.setAttribute("height", "1040");
  const data = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([data], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1040;
    canvas.getContext("2d")?.drawImage(img, 0, 0, 800, 1040);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "my-knitsomesweet-bouquet.png";
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
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
  const [copied, setCopied] = useState(false);
  const setOrderNotes = useBuilder((s) => s.setOrderNotes);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const errors = validateBouquet(bouquet, catalog, today);
  const lines = summarize(bouquet.stems, catalog);
  const message = orderMessage(bouquet, catalog);
  const waUrl = `https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(message)}`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(92vw,30rem)] rounded-[2rem] border-2 border-ink/10 bg-paper p-0 text-ink backdrop:bg-ink/30"
    >
      <div className="p-6">
        <h2 className="font-display text-3xl">Your bouquet 💐</h2>
        {errors.length > 0 ? (
          <ul className="mt-4 space-y-1 rounded-2xl bg-rose/15 p-4 text-sm">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : (
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
            <div className="mt-5 grid gap-2">
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary text-center">
                {SELLER_WHATSAPP ? "Send to knitsomesweet on WhatsApp" : "Share on WhatsApp"}
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn-soft"
                  onClick={async () => {
                    await navigator.clipboard.writeText(message);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                >
                  {copied ? "Copied!" : "Copy order text"}
                </button>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => svgRef.current && downloadPng(svgRef.current)}
                >
                  Save picture
                </button>
              </div>
            </div>
          </>
        )}
        <button type="button" onClick={onClose} className="mt-4 w-full text-sm text-ink/70 underline underline-offset-4">
          Keep arranging
        </button>
      </div>
    </dialog>
  );
}
