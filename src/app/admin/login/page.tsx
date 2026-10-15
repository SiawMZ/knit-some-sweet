import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Seller login · knitsomesweet" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-[2rem] border-2 border-ink/10 bg-paper-deep/70 p-6">
        <p className="font-display text-sm tracking-widest text-rose-deep uppercase">knitsomesweet</p>
        <h1 className="font-display text-3xl text-ink">Seller corner 🧶</h1>
        <p className="mt-1 text-sm text-ink/70">Sign in to look after your shop.</p>
        <LoginForm />
      </div>
    </main>
  );
}
