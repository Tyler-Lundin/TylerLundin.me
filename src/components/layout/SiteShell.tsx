'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Greeting from '../Greeting'
import DevBreadcrumbs from '../dev/DevBreadcrumbs'
import AdminMenu from '../dev/AdminMenu'
import AdminMenuToggle from '../dev/AdminMenuToggle'
import AuthRefresher from '../dev/AuthRefresher'

// Defer loading particles background to idle time to reduce LCP/main-thread
const ReactiveBackground = dynamic(() => import('@/components/ReactiveBackground'), {
  ssr: false,
  loading: () => null,
})

export function SiteShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const isDevRoute = pathname.includes('/dev')
  // const isHome = pathname === '/'
  // const isAbout = pathname === '/about' || pathname === '/about/'
  // const isProjectSlug = /^\/project\/[^/]+\/?$/.test(pathname) || /^\/projects\/[^/]+\/?$/.test(pathname)

  if (!isDevRoute) return <UserShell children={children} />

  return <DevShell children={children} />
}


function UserShell({ children }: { children: React.ReactNode }) {
  const [adminOpen, setAdminOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~') {
        e.preventDefault()
        setAdminOpen((v) => !v)
      }
      if (e.key === 'Escape') setAdminOpen(false)
    }
    const onEvt = () => setAdminOpen((v) => !v)
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
        {showBg && (
          <div className="hidden sm:fixed inset-0 -z-10 pointer-events-none opacity-50">
            <ReactiveBackground />
          </div>
        )}

        <div className="pt-24 pb-2 max-w-7xl mx-auto">
          {children}
          <Footer />
          <Greeting />
        </div>
      </div>
      <AdminMenu openProp={adminOpen} onClose={() => setAdminOpen(false)} onToggle={() => setAdminOpen((v)=>!v)} />
      <AdminMenuToggle />
    </>
  )
}

function DevShell({ children }: { children: React.ReactNode }) {
  const [adminOpen, setAdminOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~') {
        e.preventDefault()
        setAdminOpen((v) => !v)
      }
      if (e.key === 'Escape') setAdminOpen(false)
    }
    const onEvt = () => setAdminOpen((v) => !v)
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
      <div className="hidden sm:fixed inset-0 -z-10 pointer-events-none opacity-50">
        <ReactiveBackground />
      </div>
      <div className={`max-w-7xl mx-auto ${!isDisabled && "pt-12"}`}>
      {!isDisabled && (<DevBreadcrumbs />)}
        {children}
      </div>
      {/* Keep access token fresh while on dev pages */}
      <AuthRefresher />
      <AdminMenu openProp={adminOpen} onClose={() => setAdminOpen(false)} onToggle={() => setAdminOpen((v)=>!v)} />
      <AdminMenuToggle />
    </div>
  )
}
