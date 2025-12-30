"use client"
import Image from "next/image"

export default function BundleBackground({ bgImg, title, isCurrent }: { bgImg: string, title: string, isCurrent: boolean }) {
  return (
    <div className="absolute inset-0 ">
      {bgImg && (
        <Image
          src={bgImg}
          fill
          alt={`${title}`}
          className={[
            'object-cover pan-vert',
            'transition-opacity duration-200',
          ].join(' ')}
          priority={isCurrent}
          fetchPriority={isCurrent ? 'high' : 'auto'}
        />
      )}

      {/* Cinematic overlays (mobile slightly darker for readability) */}
      {/* Ensure overlay sits above image but below content */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-black via-black/55 to-black/20 sm:from-black/80 sm:via-black/45 sm:to-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_60%)]" />
      <div className="absolute inset-0 ring-1 ring-white/5" />
    </div>
  )
}
