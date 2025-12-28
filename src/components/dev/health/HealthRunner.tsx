"use client"

import React, { useMemo } from 'react'
import HealthTerminal from './HealthTerminal'
import type { HealthItemData } from './HealthItem'

// Simple in-memory cache keyed by projectId for recent results
const CACHE_WINDOW_MS = 30_000
const cache: Record<string, { ts: number; data: HealthItemData[] }> = {}

export default function HealthRunner({ projectId, initialItems = [], actions, autoRun = true }: { projectId: string; initialItems?: HealthItemData[]; actions?: React.ReactNode; autoRun?: boolean }) {
  async function run(): Promise<{ items: HealthItemData[]; ts?: number }> {
    try {
      const now = Date.now()
      const entry = cache[projectId]
      if (entry && now - entry.ts < CACHE_WINDOW_MS) {
        return { items: entry.data, ts: entry.ts }
      }
      const res = await fetch(`/api/dev/projects/${projectId}/health`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Health API ${res.status}`)
      const data = (await res.json()) as HealthItemData[]
      cache[projectId] = { ts: now, data }
      return { items: data, ts: now }
    } catch (e: any) {
      const data: HealthItemData[] = [
        { id: 'health', label: 'Health API error', status: 'error', detail: e?.message || 'Failed to fetch' },
      ]
      cache[projectId] = { ts: Date.now(), data }
      return { items: data, ts: Date.now() }
    }
  }

  // If the caller didn't supply initialItems, start with empty and auto-run will fetch
  const seed = useMemo(() => initialItems, [initialItems])
  return <HealthTerminal title="Health Terminal" items={seed} onRun={run} actions={actions} autoRun={autoRun} />
}
