import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

const inter = Inter({ subsets: ["latin"] });

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
