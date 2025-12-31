"use client"
import { Sora } from "next/font/google";
const sora = Sora({ subsets: ["latin"], display: "swap" });


export default function BundleTitle({ title }: { title: string }) {
  return (
    <h2
      style={{...sora.style}}
      className={[
        "font-extrabold tracking-tight",
        "text-xl sm:text-3xl leading-[1.0]",
        // The Tech Effect:
        "text-transparent bg-clip-text",
        // Light Mode: Black fading into a very deep, professional emerald
        "bg-gradient-to-br",
        // Dark Mode: Pure white fading into a 'glowing' light emerald
        "from-white to-emerald-400",
        // Adds a tiny crisp shadow to improve legibility against the gradient
        "drop-shadow-sm",
        "text-balance"
      ].join(" ")}
    >
      {title}
    </h2>
  )
}
