import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Seller corner · knitsomesweet" };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm tracking-widest text-rose-deep uppercase">knitsomesweet</p>
          <h1 className="font-display text-3xl text-ink">Seller corner 🧶</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-soft">
            View shop
          </Link>
          <form action={logout}>
            <button type="submit" className="btn-soft">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <Suspense fallback={<div className="mt-4 mb-6 h-11" />}>
        <AdminNav />
      </Suspense>
      {/* Admin pages read the session per request; loading.tsx shows while they stream in. */}
      {children}
    </div>
  );
}
