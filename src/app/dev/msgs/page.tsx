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
  Edit3,
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
      ;(contacts || []).forEach((c: any) => unified.push({ kind: 'contact', id: c.id, created_at: c.created_at || '', data: c }))
      ;(quotes || []).forEach((q: any) => unified.push({ kind: 'quote', id: q.id, created_at: q.created_at || '', data: q }))
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
    <div className="min-h-[calc(100vh-6rem)] p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#B5BAC1]">
            <Inbox className="h-5 w-5" />
            <h1 className="text-lg sm:text-xl font-semibold text-[#DBDEE1]">Inbox</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E1F22] ring-1 ring-[#3F4147]">
              {messages.length} total
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              className={
                'px-2.5 py-1 rounded-md ring-1 ring-[#3F4147] ' +
                (tab === 'all' ? 'bg-[#5865F2] text-white' : 'text-[#B5BAC1] hover:bg-[#383A40]')
              }
              onClick={() => setTab('all')}
            >
              All
            </button>
            <button
              className={
                'px-2.5 py-1 rounded-md ring-1 ring-[#3F4147] ' +
                (tab === 'contacts' ? 'bg-[#5865F2] text-white' : 'text-[#B5BAC1] hover:bg-[#383A40]')
              }
              onClick={() => setTab('contacts')}
            >
              Contacts
            </button>
            <button
              className={
                'px-2.5 py-1 rounded-md ring-1 ring-[#3F4147] ' +
                (tab === 'quotes' ? 'bg-[#5865F2] text-white' : 'text-[#B5BAC1] hover:bg-[#383A40]')
              }
              onClick={() => setTab('quotes')}
            >
              Quotes
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 bg-[#1E1F22] ring-1 ring-[#3F4147] rounded-md px-2 py-1.5">
            <Search className="h-4 w-4 text-[#B5BAC1]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, subject, summary..."
              className="flex-1 bg-transparent outline-none text-sm text-[#DBDEE1] placeholder:text-[#8E9399]"
            />
            <Filter className="h-4 w-4 text-[#8E9399]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <aside className="md:col-span-1 rounded-lg bg-[#1E1F22] ring-1 ring-[#3F4147] overflow-hidden">
            <div className="max-h-[55vh] md:max-h-[65vh] overflow-y-auto divide-y divide-[#2E3035]">
              {loading ? (
                <div className="p-4 text-sm text-[#B5BAC1]">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-sm text-[#B5BAC1]">No messages match your filters.</div>
              ) : (
                filtered.map((m) => {
                  const isActive = selected?.id === m.id
                  const base = 'flex items-start gap-3 p-3 cursor-pointer hover:bg-[#232428]'
                  return (
                    <button
                      key={m.id}
                      className={base + (isActive ? ' bg-[#232428]' : '')}
                      onClick={() => setSelectedId(m.id)}
                    >
                      <div className="mt-0.5">
                        {m.kind === 'contact' ? (
                          <Mail className="h-4 w-4 text-[#B5BAC1]" />
                        ) : (
                          <MessageSquareText className="h-4 w-4 text-[#B5BAC1]" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-[#DBDEE1] truncate">
                            {m.kind === 'contact' ? (m.data as ContactSubmission).name : (m.data as QuoteRequest).contact_name}
                          </div>
                          <div className="text-[11px] text-[#8E9399] ml-2 whitespace-nowrap">{timeAgo(m.created_at)}</div>
                        </div>
                        <div className="text-[11px] text-[#B5BAC1] truncate">
                          {m.kind === 'contact'
                            ? (m.data as ContactSubmission).subject || (m.data as ContactSubmission).message
                            : (m.data as QuoteRequest).project_summary}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full ring-1 ring-[#3F4147] text-[#B5BAC1]">
                            {m.kind}
                          </span>
                          {'status' in (m.data as any) && (m as any).data.status && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2E3035] text-[#B5BAC1]">
                              {(m as any).data.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#3F4147]" />
                    </button>
                  )
                })
              )}
            </div>
          </aside>

          <section className="md:col-span-2 rounded-lg bg-[#1E1F22] ring-1 ring-[#3F4147] min-h-[45vh]">
            {!selected ? (
              <div className="p-6 text-sm text-[#B5BAC1]">Select a message to view details.</div>
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
          <div className="mt-4 text-xs text-red-400">{error}</div>
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
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm text-[#8E9399]">Contact</div>
          <h2 className="text-xl font-semibold text-[#DBDEE1]">{c.name}</h2>
          <div className="text-xs text-[#8E9399]">{new Date(msg.created_at).toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={busy}
            onClick={onMarkHandled}
            className="text-xs px-2.5 py-1 rounded-md bg-[#2E3035] text-[#B5BAC1] hover:bg-[#383A40]"
          >
            Mark handled
          </button>
          <button
            disabled={busy}
            onClick={onDelete}
            className="p-2 rounded-md bg-[#2E3035] text-red-300 hover:text-red-200 hover:bg-[#383A40]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />}>
          <span className="mr-2">{c.email}</span>
          <button onClick={copyEmail} className="text-[#8E9399] hover:text-[#DBDEE1]" title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </Field>
        {c.phone && (
          <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>{c.phone}</Field>
        )}
        {c.subject && <Field label="Subject">{c.subject}</Field>}
        {c.source && <Field label="Source">{c.source}</Field>}
        {c.budget && <Field label="Budget" icon={<BadgeDollarSign className="h-3.5 w-3.5" />}>{c.budget}</Field>}
        {c.status && <Field label="Status">{c.status}</Field>}
      </div>

      <div className="mt-4">
        <div className="text-xs text-[#8E9399] mb-1">Message</div>
        <div className="text-sm leading-relaxed text-[#DBDEE1] whitespace-pre-wrap bg-[#232428] rounded-md p-3 ring-1 ring-[#2E3035]">
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
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm text-[#8E9399]">Quote Request</div>
          <h2 className="text-xl font-semibold text-[#DBDEE1]">{q.contact_name}</h2>
          <div className="text-xs text-[#8E9399]">{new Date(msg.created_at).toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            disabled={busy}
            value={q.status || 'new'}
            onChange={(e) => onUpdateStatus(e.target.value as any)}
            className="text-xs px-2.5 py-1 rounded-md bg-[#2E3035] text-[#B5BAC1] hover:bg-[#383A40] outline-none"
            title="Update status"
          >
            {QUOTE_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#1E1F22] text-[#DBDEE1]">{s}</option>
            ))}
          </select>
          <button
            disabled={busy}
            onClick={onDelete}
            className="p-2 rounded-md bg-[#2E3035] text-red-300 hover:text-red-200 hover:bg-[#383A40]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />}>
          <span className="mr-2">{q.contact_email}</span>
          <button onClick={copyEmail} className="text-[#8E9399] hover:text-[#DBDEE1]" title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </Field>
        {q.company && <Field label="Company" icon={<Building2 className="h-3.5 w-3.5" />}>{q.company}</Field>}
        {q.phone && (
          <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>{q.phone}</Field>
        )}
        {(q.budget_min || q.budget_max) && (
          <Field label="Budget" icon={<BadgeDollarSign className="h-3.5 w-3.5" />}>
            {q.budget_min ?? '–'} – {q.budget_max ?? '–'} {q.currency || ''}
          </Field>
        )}
        {q.timeline && <Field label="Timeline" icon={<CalendarClock className="h-3.5 w-3.5" />}>{q.timeline}</Field>}
        {q.tags && q.tags.length > 0 && (
          <Field label="Tags" icon={<Tag className="h-3.5 w-3.5" />}>
            <div className="flex flex-wrap gap-1">
              {q.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2E3035] text-[#B5BAC1]">{t}</span>
              ))}
            </div>
          </Field>
        )}
        {q.source && <Field label="Source">{q.source}</Field>}
        {q.priority && <Field label="Priority">{q.priority}</Field>}
        {q.status && <Field label="Status">{q.status}</Field>}
      </div>

      <div className="mt-4">
        <div className="text-xs text-[#8E9399] mb-1">Project Summary</div>
        <div className="text-sm leading-relaxed text-[#DBDEE1] whitespace-pre-wrap bg-[#232428] rounded-md p-3 ring-1 ring-[#2E3035]">
          {q.project_summary}
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="text-[11px] text-[#8E9399]">{label}</div>
        <div className="text-sm text-[#DBDEE1]">{children}</div>
      </div>
    </div>
  )
}
