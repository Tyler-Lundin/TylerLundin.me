'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import ParallaxBackground from '@/components/ParallaxBackground'
import Banner from '../Banner'
import { useState } from 'react'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [bannerVisible, setBannerVisible] = useState(true);

  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')

  return (
    <>
      <Banner isVisible={bannerVisible} setIsVisible={setBannerVisible} />
      {!isDevRoute && (
        <div className={`${bannerVisible ? 'mt-0' : 'mt-2'} relative`}>
          <Navbar bannerVisible={bannerVisible} />
          <ParallaxBackground />
        </div>
      )}
      {children}
      {!isDevRoute && (
        <Footer />
      )}
    </>
  )
} 