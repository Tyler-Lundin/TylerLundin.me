"use client"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import AnkrPanel from "./AnkrPanel"

export default function Ankr() {
  const [open, setOpen] = useState(false)

  // Keyboard shortcuts: Cmd/Ctrl+J to toggle, Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      if (isCmdOrCtrl && e.key.toLowerCase() === "j") {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <AnkrButton onClick={toggle} />
      {open && <AnkrPanel onClose={close} />}
    </>
  )
}

function AnkrButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      aria-label="Open Ankr Menu"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 rounded-full outline-none focus-visible:outline-none"
    >
      <div className="group relative">
        {/* Elevated gradient halo (hover/focus) */}
        <div className="pointer-events-none absolute -inset-1 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 blur-[6px] opacity-70" />
          <div className="absolute -inset-3 rounded-full bg-emerald-500/15 blur-2xl" />
        </div>

        {/* avatar with glossy finish */}
        <div className="relative w-14 h-14 p-2 aspect-square rounded-full shadow-xl shadow-emerald-500/0 transition-all duration-300 group-active:scale-95 group-hover:scale-105 group-hover:-translate-y-0.5 overflow-hidden">
          {/* glossy highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Image
            src="/images/ankr.png"
            alt="Ankr AI Assistant"
            width={56}
            height={56}
            className="relative z-[1] select-none w-full h-full object-cover"
            priority
          />
          {/* subtle ring on focus */}
          <div className="pointer-events-none absolute -inset-[3px] rounded-full ring-2 ring-transparent group-focus-visible:ring-emerald-400/80" />
        </div>

        {/* animated accent ring (subtle on idle, vivid on hover/focus) */}
        <div className="pointer-events-none absolute -inset-0.5 -z-10 rounded-full border border-transparent transition-colors duration-300 group-hover:border-emerald-300/60 group-focus-visible:border-emerald-400/80" />

        {/* hint */}
        {hover && (
          <span className="absolute -top-2 right-[110%] whitespace-nowrap rounded bg-zinc-900/90 px-2 py-1 text-xs text-zinc-100 shadow-lg">
            Open Ankr — Cmd/Ctrl+J
          </span>
        )}
      </div>
    </button>
  )
}
