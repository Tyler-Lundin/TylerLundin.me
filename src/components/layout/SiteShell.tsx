'use client'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import ReactiveBackground from '@/components/ReactiveBackground'
import StatsDrawer from '@/components/sections/StatsDrawer'
import Greeting from '../Greeting'

export function SiteShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')
  const isHome = pathname === '/'
  const isAbout = pathname === '/about' || pathname === '/about/'
  const isProjectSlug = /^\/project\/[^/]+\/?$/.test(pathname) || /^\/projects\/[^/]+\/?$/.test(pathname)

  if (!isDevRoute) return <UserShell children={children}/>

  return <DevShell children={children}/>
}


function UserShell({ children }:{ children: React.ReactNode }) {
  return (
    <>
      <div className={`relative max-w-7xl mx-auto`}>
        <Navbar bannerVisible={false} />
      </div>
      {/* Global UI elements that should break the page frame */}
      <div className="relative max-w-screen min-h-screen overflow-x-hidden">
        {/* Dimmed particles background */}
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-50">
          <ReactiveBackground />
        </div>

        <div className="pt-24 max-w-7xl mx-auto">
          {children}
          <Footer />
          <Greeting />
        </div>
      </div>
    </>
  )
}

function DevShell({ children }:{ children: React.ReactNode }) {
  return(
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  )
}
