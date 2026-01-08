"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

export default function AnalyticsWrapper() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const saved = localStorage.getItem('cookie-consent');
      if (saved) {
        const consent = JSON.parse(saved);
        setEnabled(!!consent.analytics);
      } else {
        setEnabled(false);
      }
    };

    checkConsent();
    window.addEventListener('cookie-consent-changed', checkConsent);
    return () => window.removeEventListener('cookie-consent-changed', checkConsent);
  }, []);

  if (!enabled) return null;

  return <Analytics />;
}
