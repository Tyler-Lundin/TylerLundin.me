"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ContactLeadWizard from './ContactLeadWizard';

export default function GroupMembersClient({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [sortKey, setSortKey] = useState<'score' | 'reviews' | 'name'>('score');
  const [filter, setFilter] = useState<'all' | 'with_site' | 'no_site'>('all');
  const limit = 25;

  // Selection state
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const headerSelectRef = useRef<HTMLInputElement | null>(null)

  // Context menu state
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuX, setMenuX] = useState(0)
  const [menuY, setMenuY] = useState(0)
  const [menuItem, setMenuItem] = useState<any | null>(null)
  const [menuCol, setMenuCol] = useState<string | null>(null)
  const longPressTimer = useRef<number | null>(null)
  const longPressCol = useRef<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  function scoreForReviews(total: number | null | undefined): number {
    if (!total || total <= 0) return 0.5;
    if (total >= 1 && total <= 20) return 3;
    if (total >= 21 && total <= 50) return 2;
    return 0.5; // 50+
  }

  function applySortFilter(list: any[]) {
    let arr = list
    if (filter === 'with_site') arr = arr.filter((m) => !!m?.leads?.website)
    if (filter === 'no_site') arr = arr.filter((m) => !m?.leads?.website)
    arr.sort((a: any, b: any) => {
      if (sortKey === 'score') {
        const ds = (b._score || 0) - (a._score || 0);
        if (ds !== 0) return ds;
      }
      if (sortKey === 'reviews') {
        const br = (b?.leads?.user_ratings_total ?? 0) - (a?.leads?.user_ratings_total ?? 0);
        if (br !== 0) return br;
      }
      if (sortKey === 'name') {
        const an = (a?.leads?.name || '').localeCompare(b?.leads?.name || '')
        if (an !== 0) return an
      }
      return 0;
    })
    return arr
  }

  async function load(reset = false) {
    setLoading(true);
    try {
      const base = typeof window !== 'undefined' && window.location.pathname.startsWith('/marketing') ? 'marketing' : 'dev'
      const res = await fetch(`/api/${base}/groups/${groupId}/members?limit=${limit}&offset=${reset ? 0 : offset}`, { cache: 'no-store' });
      const data = await res.json();
      setTotal(data.total || 0);
      const next = (Array.isArray(data.items) ? data.items : []).map((m: any) => ({
        ...m,
        _score: scoreForReviews(m?.leads?.user_ratings_total),
      }));
      const merged = applySortFilter(reset ? next : [...items, ...next]);
      setItems(merged);
      setOffset(reset ? next.length : offset + next.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { setItems([]); setOffset(0); load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [groupId]);

  useEffect(() => {
    // re-apply sorting/filter on changes
    setItems((prev) => applySortFilter([...prev]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey, filter])

  // Reset selection when list is reloaded completely
  useEffect(() => {
    if (offset === 0) setSelected(new Set())
  }, [offset])

  // Update header checkbox indeterminate state
  useEffect(() => {
    if (!headerSelectRef.current) return
    const allIds = new Set(items.map((m) => String(m.lead_id)))
    const selectedInView = Array.from(selected).filter((id) => allIds.has(id))
    headerSelectRef.current.indeterminate = selectedInView.length > 0 && selectedInView.length < items.length
  }, [items, selected])

  async function removeMember(leadId: string) {
    if (!confirm('Remove this lead from the group?')) return
    const base = typeof window !== 'undefined' && window.location.pathname.startsWith('/marketing') ? 'marketing' : 'dev'
    const res = await fetch(`/api/${base}/groups/${groupId}/members/${leadId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok || data?.error) {
      alert(data?.error || 'Failed to remove')
      return
    }
    setItems((prev) => prev.filter((m) => m.lead_id !== leadId))
    setTotal((t) => Math.max(0, t - 1))
  }

  async function removeSelected() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    if (!confirm(`Remove ${ids.length} selected ${ids.length === 1 ? 'lead' : 'leads'} from the group?`)) return
    try {
      // Simple sequential deletion to avoid hammering the API
      for (const id of ids) {
        const base = typeof window !== 'undefined' && window.location.pathname.startsWith('/marketing') ? 'marketing' : 'dev'
        const res = await fetch(`/api/${base}/groups/${groupId}/members/${id}`, { method: 'DELETE' })
        // ignore individual failures, but stop on hard failure pattern
        if (!res.ok) {
          // surface first failure
          try { const data = await res.json(); if (data?.error) throw new Error(data.error) } catch {}
        }
      }
    } finally {
      // Optimistically update UI
      setItems((prev) => prev.filter((m) => !selected.has(String(m.lead_id))))
      setTotal((t) => Math.max(0, t - selected.size))
      setSelected(new Set())
    }
  }

  function exportCsv() {
    try {
      setExporting(true)
      const headers = ['name','location','website','phone','reviews','rating','lead_id']
      const rows = items.map((m) => [
        JSON.stringify(m?.leads?.name || ''),
        JSON.stringify(m?.leads?.location || ''),
        JSON.stringify(m?.leads?.website || ''),
        JSON.stringify(m?.leads?.phone || ''),
        String(m?.leads?.user_ratings_total ?? ''),
        String(m?.leads?.rating ?? ''),
        String(m?.leads?.id || ''),
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `group-${groupId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  function exportSelectedCsv() {
    try {
      setExporting(true)
      const headers = ['name','location','website','phone','reviews','rating','lead_id']
      const selectedSet = selected
      const rows = items
        .filter((m) => selectedSet.has(String(m?.leads?.id || m?.lead_id)))
        .map((m) => [
          JSON.stringify(m?.leads?.name || ''),
          JSON.stringify(m?.leads?.location || ''),
          JSON.stringify(m?.leads?.website || ''),
          JSON.stringify(m?.leads?.phone || ''),
          String(m?.leads?.user_ratings_total ?? ''),
          String(m?.leads?.rating ?? ''),
          String(m?.leads?.id || m?.lead_id || ''),
        ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `group-${groupId}-selected.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  function toggleRow(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAllInView(checked: boolean) {
    const ids = items.map((m) => String(m.lead_id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) ids.forEach((id) => next.add(id))
      else ids.forEach((id) => next.delete(id))
      return next
    })
  }

  function openMenu(x: number, y: number, item: any, col?: string | null) {
    // Clamp within viewport (basic padding)
    const maxX = typeof window !== 'undefined' ? Math.max(0, window.innerWidth - 220) : x
    const maxY = typeof window !== 'undefined' ? Math.max(0, window.innerHeight - 160) : y
    setMenuX(Math.min(x, maxX))
    setMenuY(Math.min(y, maxY))
    setMenuItem(item)
    setMenuCol(col || null)
    setMenuOpen(true)
  }

  function closeMenu() {
    setMenuOpen(false)
    setMenuItem(null)
    setMenuCol(null)
  }

  // Focus the menu when opened; close on Escape
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      // Delay to ensure element is in DOM
      const t = setTimeout(() => menuRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [menuOpen])

  return (
    <div className="rounded-lg border bg-white dark:bg-neutral-950 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2 text-sm dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Sort</label>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="h-8 rounded border px-2 text-sm">
            <option value="score">Score</option>
            <option value="reviews">Reviews</option>
            <option value="name">Name</option>
          </select>
          <label className="ml-3 text-xs text-neutral-600 dark:text-neutral-400">Filter</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="h-8 rounded border px-2 text-sm">
            <option value="all">All</option>
            <option value="with_site">With website</option>
            <option value="no_site">No website</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={exportSelectedCsv} disabled={exporting} className="rounded border px-2 py-1 disabled:opacity-50">
              {exporting ? 'Exporting…' : `Export Selected (${selected.size})`}
            </button>
          )}
          <button onClick={exportCsv} disabled={exporting || items.length === 0} className="rounded border px-2 py-1 disabled:opacity-50">{exporting ? 'Exporting…' : 'Export All CSV'}</button>
          <button className="rounded border px-2 py-1" onClick={() => { setItems([]); setOffset(0); load(true); }}>Refresh</button>
        </div>
      </div>
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 border-b px-3 py-2 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-200">
          <div>{selected.size} selected</div>
          <div className="flex items-center gap-2">
            <button className="rounded border px-2 py-1" onClick={() => setSelected(new Set())}>Clear</button>
            <button className="rounded border px-2 py-1" onClick={() => toggleAllInView(true)}>Select all in view</button>
            <button className="rounded border px-2 py-1" onClick={() => setWizardOpen(true)}>Contact selected</button>
            <button className="rounded border px-2 py-1 text-red-600" onClick={removeSelected}>Remove selected</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  ref={headerSelectRef}
                  type="checkbox"
                  aria-label="Select all in view"
                  checked={items.length > 0 && items.every((m) => selected.has(String(m.lead_id)))}
                  onChange={(e) => toggleAllInView(e.target.checked)}
                />
              </th>
              <th className="w-64 px-3 py-2 text-left whitespace-nowrap">Name</th>
              <th className="w-64 px-3 py-2 text-left whitespace-nowrap">Location</th>
              <th className="w-64 px-3 py-2 text-left whitespace-nowrap">Website</th>
              <th className="w-40 px-3 py-2 text-left whitespace-nowrap">Phone</th>
              <th className="w-24 px-3 py-2 text-left whitespace-nowrap">Reviews</th>
              <th className="w-24 px-3 py-2 text-left whitespace-nowrap">Score</th>
              <th className="w-28 px-3 py-2 text-left whitespace-nowrap">Status</th>
              <th className="w-40 px-3 py-2 text-left whitespace-nowrap">Added</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr
                key={m.lead_id}
                className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-950 dark:even:bg-neutral-900"
                onContextMenu={(e) => { e.preventDefault(); openMenu(e.clientX, e.clientY, m, null) }}
                onTouchStart={(e) => {
                  const touch = e.touches[0]
                  if (longPressTimer.current) window.clearTimeout(longPressTimer.current)
                  longPressTimer.current = window.setTimeout(() => {
                    openMenu(touch.clientX, touch.clientY, m, longPressCol.current)
                  }, 550)
                }}
                onTouchEnd={() => { if (longPressTimer.current) window.clearTimeout(longPressTimer.current) }}
                onTouchCancel={() => { if (longPressTimer.current) window.clearTimeout(longPressTimer.current) }}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    aria-label="Select row"
                    checked={selected.has(String(m.lead_id))}
                    onChange={(e) => toggleRow(String(m.lead_id), e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td
                  className="px-3 py-2 whitespace-nowrap"
                  data-col="name"
                  onContextMenu={(e) => { e.preventDefault(); openMenu(e.clientX, e.clientY, m, 'name') }}
                  onTouchStart={() => { longPressCol.current = 'name' }}
                >
                  <div className="max-w-[240px] truncate">
                    {m.leads?.id ? (
                      <Link href={`/dev/leads/${m.leads.id}`} className="truncate text-blue-600 underline">
                        {m.leads?.name || '—'}
                      </Link>
                    ) : (
                      <span className="truncate">{m.leads?.name || '—'}</span>
                    )}
                    {(m.has_active_project || m.has_client) && (
                      <span
                        className={
                          'ml-2 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ' +
                          (m.has_active_project
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800')
                        }
                      >
                        {m.has_active_project ? 'Project' : 'Client'}
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className="px-3 py-2 whitespace-nowrap text-neutral-600 dark:text-neutral-400"
                  data-col="location"
                  onContextMenu={(e) => { e.preventDefault(); openMenu(e.clientX, e.clientY, m, 'location') }}
                  onTouchStart={() => { longPressCol.current = 'location' }}
                >
                  <div className="max-w-[240px] truncate">{m.leads?.location || '—'}</div>
                </td>
                <td
                  className="px-3 py-2 whitespace-nowrap"
                  data-col="website"
                  onContextMenu={(e) => { e.preventDefault(); openMenu(e.clientX, e.clientY, m, 'website') }}
                  onTouchStart={() => { longPressCol.current = 'website' }}
                >
                  <div className="max-w-[240px] truncate">
                    {m.leads?.website ? (
                      <a href={m.leads.website} target="_blank" className="truncate text-blue-600 underline">
                        {m.leads.domain || m.leads.website}
                      </a>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </div>
                </td>
                <td
                  className="px-3 py-2 whitespace-nowrap text-neutral-600 dark:text-neutral-400"
                  data-col="phone"
                  onContextMenu={(e) => { e.preventDefault(); openMenu(e.clientX, e.clientY, m, 'phone') }}
                  onTouchStart={() => { longPressCol.current = 'phone' }}
                >
                  <div className="max-w-[140px] truncate">{m.leads?.phone || '—'}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{m.leads?.user_ratings_total ?? 0}</td>
                <td className="px-3 py-2 whitespace-nowrap">{(m as any)._score?.toFixed ? (m as any)._score.toFixed(2) : (m as any)._score || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {(m.has_active_project || m.has_client) ? (
                    <span
                      className={
                        'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ' +
                        (m.has_active_project
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800')
                      }
                    >
                      {m.has_active_project ? 'Project' : 'Client'}
                    </span>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-500">{new Date(m.added_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu Overlay */}
      {menuOpen && menuItem && (
        <>
          <div onClick={closeMenu} className="fixed inset-0 z-40" />
          <div
            ref={menuRef}
            tabIndex={-1}
            className="fixed z-50 min-w-48 rounded-md border border-neutral-200 bg-white shadow-lg outline-none dark:border-neutral-800 dark:bg-neutral-900"
            style={{ left: menuX, top: menuY }}
            role="menu"
            onKeyDown={(e) => { if (e.key === 'Escape') closeMenu() }}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeMenu() }}
          >
            <div className="px-3 py-2 text-xs text-neutral-500">Lead actions</div>
            {(() => {
              const col = menuCol
              let label = ''
              let value: string | null = null
              if (col === 'name') { label = 'Copy Name'; value = menuItem?.leads?.name || null }
              else if (col === 'phone') { label = 'Copy Phone'; value = menuItem?.leads?.phone || null }
              else if (col === 'website') { label = 'Copy Website'; value = menuItem?.leads?.website || null }
              else if (col === 'location') { label = 'Copy Location'; value = menuItem?.leads?.location || null }
              if (label && value) {
                return (
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(String(value))
                      } catch {
                        const ta = document.createElement('textarea')
                        ta.value = String(value)
                        document.body.appendChild(ta)
                        ta.select()
                        try { document.execCommand('copy') } catch {}
                        document.body.removeChild(ta)
                      }
                      closeMenu()
                    }}
                  >
                    {label}
                  </button>
                )
              }
              return null
            })()}
            <button
              className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              onClick={() => { window.open(`/dev/leads/${menuItem.leads?.id}`, '_blank'); closeMenu() }}
            >
              Open Lead
            </button>
            {menuItem.leads?.website && (
              <button
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                onClick={() => { window.open(menuItem.leads.website, '_blank'); closeMenu() }}
              >
                Open Website
              </button>
            )}
            <button
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => { removeMember(menuItem.lead_id); closeMenu() }}
            >
              Remove from Group
            </button>
          </div>
        </>
      )}

      <div className="flex items-center justify-between px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400">
        <div>
          Showing {items.length} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded border px-2 py-1 disabled:opacity-50"
            disabled={loading || items.length >= total}
            onClick={() => load(false)}
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      </div>
      <ContactLeadWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        groupId={groupId}
        members={items.filter((m) => selected.has(String(m.lead_id)))}
      />
    </div>
  );
}
