"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";

/** Records one `page_view` per page load of a customer page. */
export function PageView() {
  // The pathname is only known at request time for dynamic routes.
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}

function Tracker() {
  const pathname = usePathname();
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (sent.current === pathname) return;
    sent.current = pathname;
    track({ type: "page_view", path: pathname });
  }, [pathname]);
  return null;
}
