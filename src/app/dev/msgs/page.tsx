'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import {
  Inbox,
  Mail,
  MessageSquareText,
  Search,
  Trash2,
  Filter,
  ChevronRight,
  CalendarClock,
  Building2,
  Phone,
  BadgeDollarSign,
  Tag,
  Copy,
} from 'lucide-react'

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'] & {
  phone?: string | null
  subject?: string | null
  source?: string | null
  handled_at?: string | null
  handled_by?: string | null
}
type QuoteRequest = {
  id: string
  contact_name: string
  contact_email: string
  company?: string | null
  phone?: string | null
  project_summary: string
  budget_min?: number | null
  budget_max?: number | null
  currency?: string | null
  timeline?: string | null
  status?: string | null
  priority?: string | null
  source?: string | null
  tags?: string[] | null
  created_at?: string | null
}
type Unified =
  | { kind: 'contact'; created_at: string; id: string; data: ContactSubmission }
  | { kind: 'quote'; created_at: string; id: string; data: QuoteRequest }

type Tab = 'all' | 'contacts' | 'quotes'

const QUOTE_STATUSES = ['new', 'triage', 'quoted', 'won', 'lost', 'archived'] as const

function timeAgo(date: string) {
  const d = new Date(date)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function MessagesPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Unified[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchMessages = async () => {
      setLoading(true)
      setError(null)
      const [{ data: contacts, error: cErr }, { data: quotes, error: qErr }] = await Promise.all([
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('quote_requests' as any).select('*').order('created_at', { ascending: false }),
      ])
      if (cancelled) return
      if (cErr || qErr) setError(cErr?.message || qErr?.message || 'Failed to load')

      const unified: Unified[] = []
      if (contacts) {
        contacts.forEach((c) => unified.push({ kind: 'contact', id: c.id, created_at: c.created_at || '', data: c as ContactSubmission }))
      }
      if (quotes) {
        const list = (quotes as unknown as QuoteRequest[])
        list.forEach((q) => unified.push({ kind: 'quote', id: q.id, created_at: q.created_at || '', data: q }))
      }
      unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setMessages(unified)
      if (!selectedId && unified.length) setSelectedId(unified[0].id)
      setLoading(false)
    }
    fetchMessages()
    return () => {
      cancelled = true
    }
  }, [supabase])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return messages.filter((m) => {
      if (tab === 'contacts' && m.kind !== 'contact') return false
      if (tab === 'quotes' && m.kind !== 'quote') return false
      if (!s) return true
      if (m.kind === 'contact') {
        const c = m.data
        return [c.name, c.email, c.subject, c.message, c.source, c.phone, c.status]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(s))
      } else {
        const q = m.data
        return [q.contact_name, q.contact_email, q.company, q.project_summary, q.timeline, q.status, q.source]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(s))
      }
    })
  }, [messages, tab, search])

  const selected = filtered.find((m) => m.id === selectedId) || filtered[0] || null

  const handleDelete = async (msg: Unified) => {
    setBusy(true)
    try {
      if (msg.kind === 'contact') {
        const { error } = await supabase.from('contact_submissions').delete().eq('id', msg.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('quote_requests' as any).delete().eq('id', msg.id)
        if (error) throw error
      }
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      setSelectedId((id) => (id === msg.id ? null : id))
    } catch (e: any) {
      setError(e?.message || 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  const updateQuoteStatus = async (id: string, status: typeof QUOTE_STATUSES[number]) => {
    setBusy(true)
    try {
      const { error } = await supabase.from('quote_requests' as any).update({ status }).eq('id', id)
      if (error) throw error
      setMessages((prev) =>
        prev.map((m) => (m.id === id && m.kind === 'quote' ? { ...m, data: { ...m.data, status } } : m))
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to update status')
    } finally {
      setBusy(false)
    }
  }

  const markContactHandled = async (id: string) => {
    setBusy(true)
    try {
      const payload: any = { status: 'handled', handled_at: new Date().toISOString() }
      const { error } = await supabase.from('contact_submissions').update(payload as any).eq('id', id)
      if (error) throw error
      setMessages((prev) =>
        prev.map((m) => (m.id === id && m.kind === 'contact' ? { ...m, data: { ...m.data, status: 'handled' } } : m))
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to mark handled')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
              <Inbox className="size-5 text-neutral-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Inbox</h1>
              <div className="text-xs text-neutral-500">{messages.length} messages total</div>
            </div>
          </div>
          
          <div className="flex items-center rounded-lg bg-white p-1 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
            {(['all', 'contacts', 'quotes'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize
                  ${tab === t 
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white' 
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-3">
          
          {/* Sidebar List */}
          <aside className="border-b border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50 md:col-span-1 md:border-b-0 md:border-r">
            <div className="h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-neutral-400">Loading messages...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-400">No messages found.</div>
              ) : (
                <div className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
                  {filtered.map((m) => {
                    const isActive = selected?.id === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedId(m.id)}
                        className={`w-full p-4 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800
                          ${isActive ? 'bg-white shadow-sm ring-1 ring-inset ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700' : ''}
                        `}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className={`text-xs font-medium uppercase tracking-wider
                             ${m.kind === 'contact' ? 'text-blue-500' : 'text-amber-500'}
                          `}>
                            {m.kind}
                          </span>
                          <span className="text-[10px] text-neutral-400 whitespace-nowrap">{timeAgo(m.created_at)}</span>
                        </div>
                        <div className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white truncate">
                           {m.kind === 'contact' ? (m.data as ContactSubmission).name : (m.data as QuoteRequest).contact_name}
                        </div>
                        <div className="text-xs text-neutral-500 truncate dark:text-neutral-400">
                          {m.kind === 'contact'
                            ? (m.data as ContactSubmission).subject || (m.data as ContactSubmission).message
                            : (m.data as QuoteRequest).project_summary}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Detail View */}
          <section className="bg-white p-6 dark:bg-neutral-900 md:col-span-2 h-[600px] overflow-y-auto">
            {!selected ? (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Select a message to view details
              </div>
            ) : selected.kind === 'contact' ? (
              <ContactDetail
                msg={selected as Extract<Unified, { kind: 'contact' }>}
                onDelete={() => handleDelete(selected)}
                onMarkHandled={() => markContactHandled(selected.id)}
                busy={busy}
              />
            ) : (
              <QuoteDetail
                msg={selected as Extract<Unified, { kind: 'quote' }>}
                onDelete={() => handleDelete(selected)}
                onUpdateStatus={(s) => updateQuoteStatus(selected.id, s)}
                busy={busy}
              />
            )}
          </section>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}

function ContactDetail({
  msg,
  onDelete,
  onMarkHandled,
  busy,
}: {
  msg: Extract<Unified, { kind: 'contact' }>
  onDelete: () => void
  onMarkHandled: () => void
  busy: boolean
}) {
  const c = msg.data
  const copyEmail = () => navigator.clipboard?.writeText(c.email)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{c.name}</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
             <span>{new Date(msg.created_at).toLocaleString()}</span>
             {c.status && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                   {c.status}
                </span>
             )}
          </div>
        </div>
        <div className="flex items-center gap-2">
           {c.status !== 'handled' && (
              <button
                disabled={busy}
                onClick={onMarkHandled}
                className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Mark Handled
              </button>
           )}
           <button
             disabled={busy}
             onClick={onDelete}
             className="rounded-lg p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
             title="Delete"
           >
             <Trash2 className="size-5" />
           </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
           <div className="mb-1 text-xs font-medium text-neutral-500 uppercase">Contact Info</div>
           <div className="space-y-2">
              <div className="flex items-center justify-between group">
                 <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-neutral-400" />
                    <a href={`mailto:${c.email}`} className="text-neutral-900 hover:underline dark:text-neutral-200">{c.email}</a>
                 </div>
                 <button onClick={copyEmail} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600"><Copy className="size-3" /></button>
              </div>
              {c.phone && (
                 <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Phone className="size-4 text-neutral-400" />
                    {c.phone}
                 </div>
              )}
           </div>
        </div>

        <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
           <div className="mb-1 text-xs font-medium text-neutral-500 uppercase">Metadata</div>
           <div className="space-y-2 text-sm">
              {c.subject && <div><span className="text-neutral-500">Subject:</span> {c.subject}</div>}
              {c.source && <div><span className="text-neutral-500">Source:</span> {c.source}</div>}
              {c.budget && (
                 <div className="flex items-center gap-2">
                    <BadgeDollarSign className="size-4 text-neutral-400" />
                    {c.budget}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Message Body */}
      <div>
         <div className="mb-2 text-xs font-medium text-neutral-500 uppercase">Message</div>
         <div className="rounded-xl border border-neutral-200 bg-white p-6 text-neutral-800 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {c.message}
         </div>
      </div>
    </div>
  )
}

function QuoteDetail({
  msg,
  onDelete,
  onUpdateStatus,
  busy,
}: {
  msg: Extract<Unified, { kind: 'quote' }>
  onDelete: () => void
  onUpdateStatus: (s: typeof QUOTE_STATUSES[number]) => void
  busy: boolean
}) {
  const q = msg.data
  const copyEmail = () => navigator.clipboard?.writeText(q.contact_email)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{q.contact_name}</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
             <span className="font-medium text-amber-600 dark:text-amber-500">Quote Request</span>
             <span>•</span>
             <span>{new Date(msg.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <select
             disabled={busy}
             value={q.status || 'new'}
             onChange={(e) => onUpdateStatus(e.target.value as any)}
             className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
           >
             {QUOTE_STATUSES.map((s) => (
               <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
             ))}
           </select>
           <button
             disabled={busy}
             onClick={onDelete}
             className="rounded-lg p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
             title="Delete"
           >
             <Trash2 className="size-5" />
           </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
           <div className="mb-1 text-xs font-medium text-neutral-500 uppercase">Contact Info</div>
           <div className="space-y-2">
              <div className="flex items-center justify-between group">
                 <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-neutral-400" />
                    <a href={`mailto:${q.contact_email}`} className="text-neutral-900 hover:underline dark:text-neutral-200">{q.contact_email}</a>
                 </div>
                 <button onClick={copyEmail} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600"><Copy className="size-3" /></button>
              </div>
              {q.phone && (
                 <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Phone className="size-4 text-neutral-400" />
                    {q.phone}
                 </div>
              )}
              {q.company && (
                 <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Building2 className="size-4 text-neutral-400" />
                    {q.company}
                 </div>
              )}
           </div>
        </div>

        <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
           <div className="mb-1 text-xs font-medium text-neutral-500 uppercase">Project Details</div>
           <div className="space-y-2 text-sm">
              {(q.budget_min || q.budget_max) && (
                 <div className="flex items-center gap-2">
                    <BadgeDollarSign className="size-4 text-neutral-400" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                       {q.budget_min ?? '–'} – {q.budget_max ?? '–'} {q.currency || ''}
                    </span>
                 </div>
              )}
              {q.timeline && (
                 <div className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-neutral-400" />
                    {q.timeline}
                 </div>
              )}
              {q.tags && q.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1 mt-1">
                    {q.tags.map(t => (
                       <span key={t} className="rounded bg-white px-1.5 py-0.5 text-[10px] ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                          {t}
                       </span>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Project Summary */}
      <div>
         <div className="mb-2 text-xs font-medium text-neutral-500 uppercase">Project Summary</div>
         <div className="rounded-xl border border-neutral-200 bg-white p-6 text-neutral-800 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {q.project_summary}
         </div>
      </div>
    </div>
  )
}
