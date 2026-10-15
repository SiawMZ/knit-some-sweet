"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Items" },
  { href: "/admin/vessels", label: "Vases & wraps" },
  { href: "/admin/colors", label: "Colors" },
  { href: "/admin/requests", label: "New drawings" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="mt-4 mb-6 flex flex-wrap gap-1 rounded-full bg-white/70 p-1 sm:w-fit">
      {LINKS.map((l) => {
        const current = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current ? "page" : undefined}
            className={`rounded-full px-4 py-2 font-display text-sm transition-colors ${
              current ? "bg-rose text-white" : "text-ink/80 hover:bg-rose/15"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
