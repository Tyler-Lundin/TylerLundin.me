"use client"

import { useEffect, useRef, useState } from 'react'
import StickerTyler from '@/components/StickerTyler'

type Props = {
  className?: string
  sticker?: Parameters<typeof StickerTyler>[0]['sticker']
  size?: Parameters<typeof StickerTyler>[0]['size']
}

// Subtle cursor parallax + gentle 3D tilt for the sticker.
export default function StickerParallax({ className, sticker = 'prepared', size = 6 }: Props) {
  const frameRef = useRef<number | null>(null)
  const [t, setT] = useState({ x: 0, y: 0, rx: 0, ry: 0 })

  useEffect(() => {
    const maxX = 8 // px translate
    const maxY = 6 // px translate
    const maxRX = 6 // deg rotateX
    const maxRY = 6 // deg rotateY
    let rafPending = false

    const onMove = (e: MouseEvent) => {
      if (rafPending) return
      rafPending = true
      frameRef.current = requestAnimationFrame(() => {
        rafPending = false
        const vw = window.innerWidth || 1
        const vh = window.innerHeight || 1
        const nx = (e.clientX / vw) * 2 - 1 // -1..1
        const ny = (e.clientY / vh) * 2 - 1 // -1..1
        setT({
          x: nx * maxX,
          y: ny * maxY,
          rx: -ny * maxRX, // invert so moving down tilts back
          ry: nx * maxRY
        })
      })
    }

    // Respect reduced motion
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div className={['relative select-none pointer-events-none', className].filter(Boolean).join(' ')} aria-hidden>
      <div
        className="relative will-change-transform"
        style={{ transformStyle: 'preserve-3d', perspective: '700px' }}
      >
        <div
          style={{
            transform: `translate3d(${t.x}px, ${t.y}px, 0) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
            transformOrigin: 'center'
          }}
        >
          <StickerTyler sticker={sticker} size={size} className="scale-x-[-1]" />
        </div>
      </div>
    </div>
  )
}

