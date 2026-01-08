import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import Script from "next/script";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdPlacement from "@/components/marketing/AdPlacement";
import BannerWrapper from "@/components/marketing/BannerWrapper";
import CookiesFAB from "@/components/CookiesFAB";
import TopLoader from "@/components/ui/TopLoader";
import AnalyticsWrapper from "@/components/analytics/AnalyticsWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tyler Lundin - Web Developer in Spokane, WA | Spokane Web Development",
  description: "Professional web developer and designer based in Spokane, WA. Specializing in custom website development, e-commerce solutions, and digital marketing for businesses in the Inland Northwest.",
  keywords: ["web developer spokane", "spokane web development", "spokane website design", "inland northwest web developer", "washington web development services"],
  openGraph: {
    title: "Tyler Lundin - Web Developer in Spokane, WA",
    description: "Professional web developer and designer based in Spokane, WA. Specializing in custom website development, e-commerce solutions, and digital marketing for businesses in the Inland Northwest.",
    url: "https://tylerlundin.me",
    siteName: "Tyler Lundin",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyler Lundin - Web Developer in Spokane, WA",
    description: "Professional web developer and designer based in Spokane, WA. Specializing in custom website development, e-commerce solutions, and digital marketing for businesses in the Inland Northwest.",
  },
  alternates: {
    canonical: "https://tylerlundin.me",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-light.ico" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.ico" media="(prefers-color-scheme: dark)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Tyler Lundin',
              url: 'https://tylerlundin.me',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.google.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Tyler Lundin',
              url: 'https://tylerlundin.me',
              jobTitle: 'Web Developer',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Spokane',
                addressRegion: 'WA',
                addressCountry: 'US',
              },
              sameAs: [
                'https://github.com/Tyler-Lundin',
                'https://www.linkedin.com/in/tyler-l-81b839378',
              ],
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  anonymize_ip: true,
                  send_page_view: false
                });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className={[inter.className, "max-w-screen overflow-x-hidden"].join(" ")}>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <Suspense fallback={null}>
          <BannerWrapper>
            <AdPlacement placement="top_banner" />
          </BannerWrapper>
          <SiteShell>
            {children}
          </SiteShell>
        </Suspense>
        <CookiesFAB />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          </Suspense>
        ) : null}
        <Suspense fallback={null}>
          <AnalyticsWrapper />
        </Suspense>
      </body>
    </html>
  );
}
