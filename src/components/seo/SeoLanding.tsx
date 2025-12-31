"use client";

import Link from "next/link";
import TelLink from "@/components/links/TelLink";
import ReviewButton from "@/components/cta/ReviewButton";
import { useEffect, useState } from "react";
import Billboard from "@/components/billboard/Billboard";
import { themeConfig, billboardThemes } from "@/config/theme";
import Testimonials from "@/components/sections/Testimonials";
import type { BillboardThemeKey } from "@/config/themes/billboard";

export type SeoLandingProps = {
  areaLabel?: string;
  title: string;
  subtitle: string;
  primarySectionTitle?: string;
  bullets: string[];
  whyTitle?: string;
  whyBullets?: string[];
  related?: { href: string; label: string }[];
  faq?: { q: string; a: string }[];
  schema?: unknown[]; // array of JSON-LD objects to inject
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  secondaryCtas?: { href: string; label: string }[];
  showFloatingCta?: boolean;
  themeKey?: BillboardThemeKey;
};

export default function SeoLanding({
  areaLabel = "Local Services",
  title,
  subtitle,
  primarySectionTitle = "What’s included",
  bullets,
  whyTitle = "Why it works",
  whyBullets = [],
  related = [],
  faq = [],
  schema = [],
  primaryCtaHref = "/contact",
  primaryCtaLabel = "Get a quote",
  secondaryCtas = [],
  showFloatingCta = true,
  themeKey,
}: SeoLandingProps) {
  const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
  const resolvedThemeKey: BillboardThemeKey = themeKey ?? themeConfig.billboard.themeKey;
  const t = billboardThemes[resolvedThemeKey];

  return (
    <main
      className={[
        'max-w-7xl overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        t.wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >
      {schema?.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}

      <section className="relative p-4 sm:p-6">
        <Billboard
          label={
            <div className="inline-flex items-center gap-2">
              {areaLabel?.toUpperCase()}
              <span className="h-1 w-1 rounded-full bg-white/70" />
              BILLBOARD
            </div>
          }
          headline={title}
          description={subtitle}
          themeKey={resolvedThemeKey}
          actions={
            <>
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-black"
              >
                {primaryCtaLabel}
                <span aria-hidden className="ml-1">→</span>
              </Link>
              {secondaryCtas.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold border border-black/10 dark:border-white/10"
                >
                  {c.label}
                </Link>
              ))}
            </>
          }
        />

      <section className="grid gap-4 sm:grid-cols-3 mt-2">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5 sm:col-span-2">
          <h2 className="text-base font-semibold mb-2">{primarySectionTitle}</h2>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            {bullets.map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>

          {(whyBullets?.length ?? 0) > 0 && (
            <div className="mt-5 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-4">
              <h3 className="text-sm font-semibold mb-1">{whyTitle}</h3>
              <ul className="list-disc ml-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                {whyBullets.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5">
          {related?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Related</h3>
              <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
                {related.map((r) => (
                  <li key={r.href}><a className="underline" href={r.href}>{r.label}</a></li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4">
            <h4 className="text-sm font-semibold">Spokane, WA</h4>
            <dl className="text-sm text-neutral-700 dark:text-neutral-300">
              <dt className="font-medium mt-2">Service area</dt>
              <dd>Spokane • Spokane Valley • Liberty Lake</dd>
              <dt className="font-medium mt-2">Email</dt>
              <dd><a className="underline" href="mailto:msg@tylerlundin.me">msg@tylerlundin.me</a></dd>
              {PHONE && (
                <>
                  <dt className="font-medium mt-2">Phone</dt>
                  <dd><TelLink phone={PHONE} /></dd>
                </>
              )}
            </dl>
            <div className="mt-2"><ReviewButton /></div>
          </div>
        </aside>
      </section>

      {faq?.length > 0 && (
        <>
          <section className="mt-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5">
            <h2 className="text-base font-semibold mb-2">FAQs</h2>
            <div className="grid gap-3 text-sm text-neutral-700 dark:text-neutral-300">
              {faq.map((f, i) => (
                <div key={i}>
                  <p className="font-medium">{f.q}</p>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>
          </section>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faq.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              }),
            }}
          />
        </>
      )}

      {/* Testimonials (shared across SEO pages) */}
      <div className="mt-4">
        <Testimonials />
      </div>

      <StickyCta visible={showFloatingCta} href={primaryCtaHref} label={primaryCtaLabel} />
      </section>
    </main>
  );
}

function StickyCta({ visible, href, label }: { visible?: boolean; href: string; label: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!visible || !mounted) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[400] md:hidden">
      <a
        href={href}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg bg-neutral-900 text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/10"
      >
        {label}
      </a>
    </div>
  )
}
