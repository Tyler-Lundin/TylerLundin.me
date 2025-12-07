'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import ReactiveBackground from '@/components/ReactiveBackground'
import Banner from '../Banner'
import { useState } from 'react'
import StatsDrawer from '@/components/sections/StatsDrawer'

export function SiteShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')
  const isHome = pathname === '/'

  return (
    <>
      {!isDevRoute && (
        <div className={`$relative`}>
          <Navbar bannerVisible={false} />
        </div>
      )}
      {/* Global UI elements that should break the page frame */}
      {!isDevRoute && isHome && <StatsDrawer />}
      {children}
      <ReactiveBackground />
      {!isDevRoute && (
        <Footer />
      )}
    </>
  )
} 
