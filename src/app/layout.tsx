import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ParallaxBackground from "@/components/ParallaxBackground";
const roboto = Roboto({
  weight: '300',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tyler Lundin - Developer • Tinkerer • Creator",
  description: "Personal portfolio and blog of Tyler Lundin, a web developer and creative problem solver.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Navbar />
        <ParallaxBackground />
        {children}
        <Footer />
      </body>
    </html>
  );
}
