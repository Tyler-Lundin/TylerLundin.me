"use client"

import React, { createContext, useContext, useEffect, useMemo, useState, useTransition } from 'react'
import { setActiveProjectCookie } from '@/app/dev/actions/active-project'

type Ctx = {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  pending: boolean
}

const ActiveProjectContext = createContext<Ctx | null>(null)

function getQueryProject(): string | null {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const q = url.searchParams.get('project') || url.searchParams.get('p')
  return q && q.trim().length > 0 ? q : null
}

export function ActiveProjectProvider({ initialProjectId, children }: { initialProjectId?: string | null; children: React.ReactNode }) {
  const [pending, startTransition] = useTransition()
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(initialProjectId || null)

  // Initialize from URL or localStorage if no cookie-provided value
  useEffect(() => {
    const fromQuery = getQueryProject()
    if (fromQuery && fromQuery !== activeProjectId) {
      setActiveProjectIdState(fromQuery)
      return
    }
    if (!activeProjectId) {
      try {
        const stored = window.localStorage.getItem('dev.activeProject')
        if (stored) setActiveProjectIdState(stored)
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setActiveProjectId = (id: string | null) => {
    startTransition(async () => {
      setActiveProjectIdState(id)
      // URL param (replaceState)
      try {
        const url = new URL(window.location.href)
        if (id) url.searchParams.set('project', id)
        else url.searchParams.delete('project')
        window.history.replaceState({}, '', url.toString())
      } catch {}
      // Persist cookie (server action) and localStorage (fallback)
      try { await setActiveProjectCookie(id) } catch {}
      try {
        if (id) window.localStorage.setItem('dev.activeProject', id)
        else window.localStorage.removeItem('dev.activeProject')
      } catch {}
      // Also set a client-visible cookie as a fallback
      try {
        if (typeof document !== 'undefined') {
          if (id) document.cookie = `dev_active_project=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 30}`
          else document.cookie = 'dev_active_project=; path=/; max-age=0'
        }
      } catch {}
    })
  }

  const value = useMemo<Ctx>(() => ({ activeProjectId, setActiveProjectId, pending }), [activeProjectId, pending])

  return (
    <ActiveProjectContext.Provider value={value}>
      {children}
    </ActiveProjectContext.Provider>
  )
}

export function useActiveProject() {
  return useContext(ActiveProjectContext)
}

