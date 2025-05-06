import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

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
      <body className={inter.className}>
        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
