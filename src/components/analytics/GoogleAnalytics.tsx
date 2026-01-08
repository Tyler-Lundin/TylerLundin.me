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

    const checkConsent = () => {
      const saved = localStorage.getItem('cookie-consent');
      if (saved) {
        const consent = JSON.parse(saved);
        if (!consent.analytics) {
          // Disable GA
          // @ts-ignore
          window[`ga-disable-${measurementId}`] = true;
          return false;
        }
      } else {
        // Default to disabled if no consent yet
        // @ts-ignore
        window[`ga-disable-${measurementId}`] = true;
        return false;
      }
      
      // Enable GA
      // @ts-ignore
      window[`ga-disable-${measurementId}`] = false;
      return true;
    };

    if (!checkConsent()) return;

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

    const handleConsentChange = () => {
      if (checkConsent()) {
        if (typeof gtag === "function") {
          gtag("config", measurementId, {
            page_path: url,
          });
        }
      }
    };

    window.addEventListener('cookie-consent-changed', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-changed', handleConsentChange);
  }, [measurementId, pathname, searchParams]);

  return null;
}

