import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ParallaxBackground from "@/components/ParallaxBackground";
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tyler Lundin - Web Developer in Logan, Utah | Northern Utah Web Development",
  description: "Professional web developer and designer based in Logan, Utah. Specializing in custom website development, e-commerce solutions, and digital marketing for businesses in Northern Utah.",
  keywords: ["web developer logan utah", "northern utah web development", "logan utah website design", "cache valley web developer", "utah web development services"],
  openGraph: {
    title: "Tyler Lundin - Web Developer in Logan, Utah",
    description: "Professional web developer and designer based in Logan, Utah. Specializing in custom website development, e-commerce solutions, and digital marketing for businesses in Northern Utah.",
    url: "https://tylerlundin.me",
    siteName: "Tyler Lundin",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyler Lundin - Web Developer in Logan, Utah",
    description: "Professional web developer and designer based in Logan, Utah. Specializing in custom website development, e-commerce solutions, and digital marketing for businesses in Northern Utah.",
  },
  alternates: {
    canonical: "https://tylerlundin.me",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Tyler Lundin",
              "image": "https://tylerlundin.me/images/professional.png",
              "description": "Professional web developer and designer based in Logan, Utah",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Logan",
                "addressRegion": "UT",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 41.7370,
                "longitude": -111.8338
              },
              "url": "https://tylerlundin.me",
              "telephone": "+1-435-555-5555",
              "priceRange": "$$",
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "09:00",
                "closes": "17:00"
              }
            })
          }}
        />
      </head>
      <body className={roboto.className}>
        <Navbar />
        <ParallaxBackground />
        {children}
        <Footer />
      </body>
    </html>
  );
}
