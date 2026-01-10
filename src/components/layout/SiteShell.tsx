'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Greeting from '../Greeting'
import DashboardNav from '../appnav/DashboardNav'
import UserMenu from '../appnav/UserMenu'


export function SiteShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')
  const isMarketingRoute = pathname.includes('/marketing')
  const isPortalRoute = pathname.includes('/portal')
  // const isHome = pathname === '/'
  // const isAbout = pathname === '/about' || pathname === '/about/'
  // const isProjectSlug = /^\/project\/[^/]+\/?$/.test(pathname) || /^\/projects\/[^/]+\/?$/.test(pathname)

  if (isDevRoute) return <DevShell children={children} />
  if (isMarketingRoute) return <MarketingShell children={children} />
  if (isPortalRoute) return <PortalShell children={children} />
  return <UserShell children={children} />
}


function UserShell({ children }: { children: React.ReactNode }) {
  const [adminOpen, setUserOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~') {
        e.preventDefault()
        setUserOpen((v) => !v)
      }
      if (e.key === 'Escape') setUserOpen(false)
    }
    const onEvt = () => setUserOpen((v) => !v)
    window.addEventListener('keydown', onKey)
    window.addEventListener('admin-menu-host-toggle' as any, onEvt)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('admin-menu-host-toggle' as any, onEvt)
    }
  }, [])
  const [showBg, setShowBg] = useState(false)
  // Mount background after browser is idle or small delay
  useEffect(() => {
    const schedule = (cb: () => void) => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        // @ts-ignore
        return window.requestIdleCallback(cb, { timeout: 2500 })
      }
      return window.setTimeout(cb, 1500)
    }
    const id = schedule(() => setShowBg(true))
    return () => {
      // best-effort cleanup; both APIs accept a numeric id
      try { (window as any).cancelIdleCallback?.(id) } catch {}
      try { window.clearTimeout(id as any) } catch {}
    }
  }, [])
  return (
    <>
      <div className={`relative max-w-7xl mx-auto`}>
        <Navbar bannerVisible={false} />
      </div>
      {/* Global UI elements that should break the page frame */}
      <div className="relative max-w-screen min-h-screen overflow-x-hidden">
        {/* Dimmed particles background */}
        <div className="pt-24 pb-2 max-w-7xl mx-auto">
          {children}
          <Footer />
          <Greeting />
        </div>
      </div>
      <UserMenu openProp={adminOpen} onClose={() => setUserOpen(false)} onToggle={() => setUserOpen((v)=>!v)} />
    </>
  )
}

function DevShell({ children }: { children: React.ReactNode }) {
  const [adminOpen, setUserOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~') {
        e.preventDefault()
        setUserOpen((v) => !v)
      }
      if (e.key === 'Escape') setUserOpen(false)
    }
    const onEvt = () => setUserOpen((v) => !v)
    window.addEventListener('keydown', onKey)
    window.addEventListener('admin-menu-host-toggle' as any, onEvt)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('admin-menu-host-toggle' as any, onEvt)
    }
  }, [])
  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')

  const disabledLinks = [
    '/dev/blog/wizard'
  ]

  const isDisabled = disabledLinks.includes(pathname) 

  return (
    <div className="relative max-w-screen min-h-screen overflow-x-hidden">
      {/* Dimmed particles background */}
      {/* Keep background in Dev too, but still deferred by dynamic import */}
      <div className={`max-w-7xl mx-auto ${!isDisabled && "pt-12"}`}>
      {!isDisabled && (<DashboardNav />)}
        {children}
      </div>
      <UserMenu openProp={adminOpen} onClose={() => setUserOpen(false)} onToggle={() => setUserOpen((v)=>!v)} />
    </div>
  )
}

function MarketingShell({ children }: { children: React.ReactNode }) {
  const [adminOpen, setUserOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~') { e.preventDefault(); setUserOpen((v) => !v) }
      if (e.key === 'Escape') setUserOpen(false)
    }
    const onEvt = () => setUserOpen((v) => !v)
    window.addEventListener('keydown', onKey)
    window.addEventListener('admin-menu-host-toggle' as any, onEvt)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('admin-menu-host-toggle' as any, onEvt) }
  }, [])
  return (
    <div className="relative max-w-screen min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto pt-12">
        <DashboardNav />
        {children}
      </div>
      <UserMenu openProp={adminOpen} onClose={() => setUserOpen(false)} onToggle={() => setUserOpen((v)=>!v)} />
    </div>
  )
}

function PortalShell({ children }: { children: React.ReactNode }) {
  const [adminOpen, setUserOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~') { e.preventDefault(); setUserOpen((v) => !v) }
      if (e.key === 'Escape') setUserOpen(false)
    }
    const onEvt = () => setUserOpen((v) => !v)
    window.addEventListener('keydown', onKey)
    window.addEventListener('admin-menu-host-toggle' as any, onEvt)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('admin-menu-host-toggle' as any, onEvt) }
  }, [])
  return (
    <div className="relative max-w-screen min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto pt-12">
        <DashboardNav />
        {children}
      </div>
      <UserMenu openProp={adminOpen} onClose={() => setUserOpen(false)} onToggle={() => setUserOpen((v)=>!v)} />
    </div>
  )
}
