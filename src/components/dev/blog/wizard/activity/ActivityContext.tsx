"use client"

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

export type ActivityStatus = 'pending' | 'success' | 'error'

export type Activity = {
  id: string
  label: string
  status: ActivityStatus
  startedAt: number
  endedAt?: number
  detail?: string
}

type Ctx = {
  activities: Activity[]
  start: (label: string) => string
  complete: (id: string, detail?: string) => void
  fail: (id: string, detail?: string) => void
  clearFinished: () => void
}

const ActivityContext = createContext<Ctx | null>(null)

function uid() {
  return Math.random().toString(36).slice(2)
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const activitiesRef = useRef<Activity[]>(activities)
  activitiesRef.current = activities

  const start = useCallback((label: string) => {
    const id = uid()
    const act: Activity = { id, label, status: 'pending', startedAt: Date.now() }
    setActivities((prev) => [act, ...prev])
    return id
  }, [])

  const complete = useCallback((id: string, detail?: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'success', endedAt: Date.now(), detail } : a)))
  }, [])

  const fail = useCallback((id: string, detail?: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'error', endedAt: Date.now(), detail } : a)))
  }, [])

  const clearFinished = useCallback(() => {
    setActivities((prev) => prev.filter((a) => a.status === 'pending'))
  }, [])

  const value = useMemo<Ctx>(() => ({ activities, start, complete, fail, clearFinished }), [activities, start, complete, fail, clearFinished])

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export function useActivity() {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider')
  return ctx
}

