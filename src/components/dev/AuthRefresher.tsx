"use client"
import { useEffect, useRef } from 'react'

export default function AuthRefresher() {
  const ticking = useRef(false)
  const timer = useRef<number | null>(null)

  async function refresh() {
    if (ticking.current) return
    ticking.current = true
    try {
      await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
    } catch {
      // ignore; if refresh fails, next protected request will redirect
    } finally {
      ticking.current = false
    }
  }

  useEffect(() => {
    // Refresh on visibility change (when returning to tab)
    const onVis = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVis)
    // Periodic refresh every 10 minutes
    timer.current = window.setInterval(refresh, 10 * 60 * 1000)
    // Initial refresh shortly after mount to extend sessions
    const boot = window.setTimeout(refresh, 1500)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      if (timer.current) window.clearInterval(timer.current)
      window.clearTimeout(boot)
    }
  }, [])

  return null
}

