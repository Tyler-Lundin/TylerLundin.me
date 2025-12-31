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
            'object-cover bundle-pan-vert',
            'transition-opacity duration-200',
          ].join(' ')}
          priority={isCurrent}
          fetchPriority={isCurrent ? 'high' : 'auto'}
          // Smaller default travel; tweak with --bundle-pan-end if needed
          style={{ ['--bundle-pan-end' as any]: '12%' }}
        />
      )}

      {/* Cinematic overlays: light mode uses white scrim, dark uses black */}
      {/* Ensure overlay sits above image but below content */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t 
                      from-black via-orange-400/25 to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_60%)]" />
      <div className="absolute inset-0 ring-1 ring-white/5" />
    </div>
  )
}
