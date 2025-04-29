'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import ParallaxBackground from '@/components/ParallaxBackground'
import Banner from '@/components/Banner'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')

  return (
    <>
      {!isDevRoute && (
        <>
          <Banner />
          <Navbar />
          <ParallaxBackground />
        </>
      )}
      {children}
      {!isDevRoute && (
        <Footer />
      )}
    </>
  )
} 