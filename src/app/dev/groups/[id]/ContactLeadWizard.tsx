"use client";
import { useEffect, useMemo, useState } from 'react'

type LeadMember = {
  lead_id: string
  added_at?: string
  leads?: {
    id?: string
    name?: string | null
    location?: string | null
    website?: string | null
    domain?: string | null
    phone?: string | null
    google_maps_url?: string | null
  }
}

type Channel = 'email' | 'sms' | 'call'
type Mode = 'bulk' | 'one_by_one'

function renderTemplate(tpl: string, vars: Record<string, string | undefined>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
}

function findPlaceholders(tpl: string): string[] {
  const found = new Set<string>()
  const re = /\{(\w+)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(tpl))) found.add(m[1])
  return Array.from(found)
}

export default function ContactLeadWizard({
  open,
  onClose,
  groupId,
  members,
}: {
  open: boolean
  onClose: () => void
  groupId: string
  members: LeadMember[]
}) {
  const [mode, setMode] = useState<Mode>('one_by_one')
  const [channel, setChannel] = useState<Channel>('email')
  const [activeIndex, setActiveIndex] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simple in-component templates (can evolve to saved templates)
  const [subject, setSubject] = useState<string>('Quick question for {name}')
  const [body, setBody] = useState<string>(
    "Hi {name},\n\nI came across {domain} and wanted to reach out. Would you be open to a quick chat?\n\nBest,\nTyler"
  )

  // Per-lead overrides for missing data
  const [overrides, setOverrides] = useState<Record<string, { email?: string; phone?: string; name?: string }>>({})
  const [templates, setTemplates] = useState<{ id: string; key: string | null; name: string; channel: 'email'|'sms'; subject: string | null; body: string }[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | ''>('')

  useEffect(() => {
    if (!open) return
    setError(null)
    setSending(false)
    setActiveIndex(0)
    // Load templates for current channel
    ;(async () => {
      try {
        const res = await fetch(`/api/dev/outreach/templates?channel=${channel}`)
        const data = await res.json()
        if (res.ok) setTemplates(Array.isArray(data.items) ? data.items : [])
      } catch {}
    })()
  }, [open])

  useEffect(() => {
    // Reload templates on channel switch while open
    if (!open) return
    ;(async () => {
      try {
        const res = await fetch(`/api/dev/outreach/templates?channel=${channel}`)
        const data = await res.json()
        if (res.ok) setTemplates(Array.isArray(data.items) ? data.items : [])
      } catch {}
    })()
  }, [channel, open])

  const selected = members || []
  const active = selected[activeIndex]

  const placeholders = useMemo(() => {
    const set = new Set<string>([...findPlaceholders(subject), ...findPlaceholders(body)])
    return Array.from(set)
  }, [subject, body])

  function varsFor(m: LeadMember): Record<string, string | undefined> {
    const ov = overrides[m.lead_id] || {}
    return {
      name: ov.name || m.leads?.name || undefined,
      location: m.leads?.location || undefined,
      website: m.leads?.website || undefined,
      domain: m.leads?.domain || undefined,
      phone: ov.phone || m.leads?.phone || undefined,
      email: ov.email || undefined,
    }
  }

  function missingFor(m: LeadMember): string[] {
    const vars = varsFor(m)
    return placeholders.filter((k) => !vars[k])
  }

  function updateOverride(id: string, patch: Partial<{ email: string; phone: string; name: string }>) {
    setOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }

  async function sendEmailBatch() {
    setSending(true)
    setError(null)
    try {
      const payload = selected.map((m) => {
        const vars = varsFor(m)
        return {
          lead_id: m.lead_id,
          to: vars.email, // may be undefined; server should validate
          subject: renderTemplate(subject, vars),
          body: renderTemplate(body, vars),
          defaults: vars,
        }
      })

      const res = await fetch('/api/dev/leads/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, channel: 'email', items: payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) throw new Error(data?.error || 'Failed to send')
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  function openSms(m: LeadMember) {
    const vars = varsFor(m)
    const text = encodeURIComponent(renderTemplate(body, vars))
    const phone = (vars.phone || '').replace(/[^\d+]/g, '')
    window.open(`sms:${phone}?&body=${text}`, '_blank')
  }

  function openCall(m: LeadMember) {
    const vars = varsFor(m)
    const phone = (vars.phone || '').replace(/[^\d+]/g, '')
    window.open(`tel:${phone}`, '_blank')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 z-[91] bg-black/50 backdrop-blur-sm sm:backdrop-blur" onClick={onClose} />
      <div className="absolute inset-4 sm:inset-8 z-[92] rounded-lg border bg-white pt-8 dark:bg-neutral-950 dark:border-neutral-800 flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-neutral-800">
          <div>
            <div className="text-lg font-semibold">Contact Leads</div>
            <div className="text-xs text-neutral-500">{selected.length} selected • {mode === 'bulk' ? 'Bulk' : 'One by one'} • {channel.toUpperCase()}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Templates */}
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                const id = e.target.value
                setSelectedTemplateId(id)
                const tpl = templates.find((t) => t.id === id)
                if (tpl) {
                  if (channel === 'email') setSubject(tpl.subject || '')
                  setBody(tpl.body || '')
                }
              }}
              className="h-8 rounded border px-2 text-sm max-w-[240px]"
            >
              <option value="">Templates…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="h-8 rounded border px-2 text-sm">
              <option value="one_by_one">One by one</option>
              <option value="bulk">Bulk</option>
            </select>
            <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)} className="h-8 rounded border px-2 text-sm">
              <option value="email">Email</option>
              <option value="sms">Text</option>
              <option value="call">Call</option>
            </select>
            <button onClick={onClose} className="h-8 rounded border px-3 text-sm">Close</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 flex-1 min-h-0">
          <div className="border-r dark:border-neutral-800 min-h-0 flex flex-col">
            <div className="px-3 py-2 text-xs text-neutral-500">Queue</div>
            <div className="flex-1 overflow-auto">
              {selected.map((m, i) => {
                const miss = missingFor(m)
                const isActive = i === activeIndex
                return (
                  <button
                    key={m.lead_id}
                    onClick={() => setActiveIndex(i)}
                    className={
                      'flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 ' +
                      (isActive ? 'bg-neutral-50 dark:bg-neutral-900' : '')
                    }
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{m.leads?.name || 'Untitled'}</div>
                      <div className="truncate text-xs text-neutral-500">{m.leads?.website || m.leads?.domain || m.leads?.phone || '—'}</div>
                    </div>
                    {miss.length > 0 && (
                      <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">{miss.length} missing</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2 min-h-0 flex flex-col">
            {/* Composer */}
            <div className="border-b px-4 py-3 text-sm dark:border-neutral-800">
              {channel === 'email' && (
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="mb-2 w-full rounded border px-2 py-1"
                />
              )}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={channel === 'email' ? 'Email body…' : channel === 'sms' ? 'Text message…' : 'Call notes…'}
                className="h-36 w-full rounded border px-2 py-1"
              />
              <div className="mt-2 text-xs text-neutral-500">
                Available variables: {'{name} {domain} {website} {phone} {location} {email}'}
              </div>
            </div>

            {/* Active lead details and preview */}
            {active && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 flex-1 min-h-0">
                <div className="border-r p-4 dark:border-neutral-800 flex flex-col gap-3">
                  <div className="text-sm font-medium">Lead Details</div>
                  <div className="text-xs text-neutral-500">Fill required fields for this lead.</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="block text-xs text-neutral-500">Name</label>
                      <input
                        value={overrides[active.lead_id]?.name || active.leads?.name || ''}
                        onChange={(e) => updateOverride(active.lead_id, { name: e.target.value })}
                        className="w-full rounded border px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500">Email</label>
                      <input
                        value={overrides[active.lead_id]?.email || ''}
                        onChange={(e) => updateOverride(active.lead_id, { email: e.target.value })}
                        placeholder="required for email"
                        className="w-full rounded border px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500">Phone</label>
                      <input
                        value={overrides[active.lead_id]?.phone || active.leads?.phone || ''}
                        onChange={(e) => updateOverride(active.lead_id, { phone: e.target.value })}
                        placeholder="required for SMS/Call"
                        className="w-full rounded border px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500">Website</label>
                      <input disabled value={active.leads?.website || active.leads?.domain || ''} className="w-full rounded border px-2 py-1 disabled:opacity-70" />
                    </div>
                  </div>
                  {missingFor(active).length > 0 && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      Missing: {missingFor(active).join(', ')}
                    </div>
                  )}
                </div>
                <div className="p-4 min-h-0 flex flex-col">
                  <div className="mb-2 text-sm font-medium">Preview</div>
                  <div className="rounded border bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-950">
                    {channel === 'email' && (
                      <div className="mb-3 border-b pb-2 text-[13px] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
                        <div><span className="font-medium">Subject:</span> {renderTemplate(subject, varsFor(active))}</div>
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap text-[13px] leading-5">{renderTemplate(body, varsFor(active))}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="border-t px-4 py-3 flex items-center justify-between text-sm dark:border-neutral-800">
              {error ? <div className="text-xs text-red-600">{error}</div> : <div className="text-xs text-neutral-500">Use variables to personalize; missing fields require input.</div>}
              <div className="flex items-center gap-2">
                {mode === 'one_by_one' ? (
                  channel === 'email' ? (
                    <button disabled={sending} onClick={sendEmailBatch} className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-60">
                      {sending ? 'Sending…' : 'Send Email'}
                    </button>
                  ) : channel === 'sms' ? (
                    <button onClick={() => active && openSms(active)} className="rounded border px-3 py-1.5">Open SMS</button>
                  ) : (
                    <button onClick={() => active && openCall(active)} className="rounded border px-3 py-1.5">Call</button>
                  )
                ) : (
                  channel === 'email' ? (
                    <button disabled={sending} onClick={sendEmailBatch} className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-60">
                      {sending ? 'Sending…' : `Send Email to ${selected.length}`}
                    </button>
                  ) : channel === 'sms' ? (
                    <button onClick={() => selected.forEach((m) => openSms(m))} className="rounded border px-3 py-1.5">Open SMS for all</button>
                  ) : (
                    <button onClick={() => selected.forEach((m) => openCall(m))} className="rounded border px-3 py-1.5">Call each</button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
