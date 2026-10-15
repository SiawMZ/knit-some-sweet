"use client";

import { useActionState, useState } from "react";
import { requestDrawing } from "@/app/admin/actions";
import { DRAWING_KINDS, PHOTO_MAX_SIDE } from "@/lib/drawings";

/** Downscale a photo to a JPEG, so phone pictures (even HEIC on iPhones) upload quickly. */
async function downscale(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("Could not read that photo.");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

export function DrawingRequestForm() {
  const [state, action, pending] = useActionState(requestDrawing, undefined);
  return (
    <div className="card h-fit space-y-3">
      <h3 className="font-display text-xl">Request a new drawing</h3>
      <p className="text-sm text-ink/70">
        Upload a photo of a new product. We&apos;ll redraw it as a cartoon in the same style as your other items, in
        whichever colors you choose later.
      </p>
      {/* A fresh form after each successful request. */}
      <Fields key={state?.message ?? "new"} action={action} pending={pending} />
      {state?.error && (
        <p role="alert" className="rounded-2xl bg-rose/15 px-3 py-2 text-sm">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="rounded-2xl bg-sage/30 px-3 py-2 text-sm">
          {state.message}
        </p>
      )}
    </div>
  );
}

function Fields({ action, pending }: { action: (fd: FormData) => void; pending: boolean }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  const pick = async (file: File | undefined) => {
    setPhotoError(null);
    if (!file) return;
    setReading(true);
    try {
      const small = await downscale(file);
      setPhoto(small);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(small);
      });
    } catch {
      setPhotoError("We couldn't read that photo. Try a JPEG or PNG.");
    } finally {
      setReading(false);
    }
  };

  return (
    <form
      action={(fd) => {
        if (photo) fd.set("photo", photo);
        action(fd);
      }}
      className="space-y-3"
    >
      <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-ink/25 bg-[#fff6ea] p-3 text-center hover:border-rose">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local blob preview
          <img src={preview} alt="Your photo" className="mx-auto max-h-56 rounded-2xl object-contain" />
        ) : (
          <span className="block py-8 font-display text-ink/70">
            {reading ? "Reading the photo…" : "📷 Choose or take a photo"}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Photo of the item"
          onChange={(e) => void pick(e.target.files?.[0])}
        />
        {preview && <span className="mt-2 block text-xs text-ink/60">Tap to choose another</span>}
      </label>
      {photoError && (
        <p role="alert" className="rounded-2xl bg-rose/15 px-3 py-2 text-sm">
          {photoError}
        </p>
      )}
      <label className="block">
        <span className="font-display">Name</span>
        <input name="name" required maxLength={60} placeholder="Mini daisy" className="field mt-1" />
      </label>
      <label className="block">
        <span className="font-display">Kind</span>
        <select name="kind" defaultValue="bloom" className="field mt-1">
          {Object.entries(DRAWING_KINDS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-display">
          Notes <span className="text-sm text-ink/60">(optional)</span>
        </span>
        <textarea
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="Anything to keep in mind, like “the center is a different yarn”"
          className="field mt-1 resize-none"
        />
      </label>
      <button type="submit" disabled={pending || reading || !photo} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Sending…" : "Request drawing"}
      </button>
    </form>
  );
}
