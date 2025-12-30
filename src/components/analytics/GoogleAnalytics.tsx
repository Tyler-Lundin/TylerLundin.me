"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  measurementId: string;
};

export default function GoogleAnalytics({ measurementId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    // Send a page_view on route changes
    // Using gtag config updates aligns with GA4 SPA guidance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag: any = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("config", measurementId, {
        page_path: url,
      });
    }
  }, [measurementId, pathname, searchParams]);

  return null;
}

