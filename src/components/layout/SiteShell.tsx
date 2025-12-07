'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import ReactiveBackground from '@/components/ReactiveBackground'
import Banner from '../Banner'
import { useState } from 'react'

export function SiteShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')

  return (
    <>
      {!isDevRoute && (
        <div className={`$relative`}>
          <Navbar bannerVisible={false} />
        </div>
      )}
      {children}
      <ReactiveBackground />
      {!isDevRoute && (
        <Footer />
      )}
    </>
  )
} 
