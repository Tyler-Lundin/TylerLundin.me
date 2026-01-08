"use client"

import { useEffect, useState } from 'react'
import { Loader2, Plus, MessageSquare, Sparkles } from 'lucide-react'

interface Note {
  id: string
  body: string
  created_at: string
  author?: { full_name: string }
}

export function RealLeadNotes({ leadId }: { leadId: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/dev/leads/${leadId}/notes`)
      .then(res => res.json())
      .then(data => {
        setNotes(data.items || [])
        setLoading(false)
      })
  }, [leadId])

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!body.trim() || saving) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/dev/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      })
      const data = await res.json()
      if (data.item) {
        setNotes([data.item, ...notes])
        setBody('')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-neutral-400" />
        Internal Notes
      </h2>

      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-neutral-400" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">No notes yet.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{note.body}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <span>{note.author?.full_name || 'System'}</span>
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="relative">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Type a new note..."
          rows={2}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
        />
        <button
          disabled={!body.trim() || saving}
          type="submit"
          className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50 transition-all hover:bg-blue-700"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </button>
      </form>
    </div>
  )
}

export function RealLeadActivity({ leadId }: { leadId: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivity = () => {
    fetch(`/api/dev/leads/${leadId}/activity`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.items || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchActivity()
    
    const handleRefresh = () => fetchActivity()
    window.addEventListener('lead-activity-refresh', handleRefresh)
    return () => window.removeEventListener('lead-activity-refresh', handleRefresh)
  }, [leadId])

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Lead Activity</h3>
      <div className="relative space-y-6">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-100 dark:bg-neutral-800" />
        {events.length === 0 ? (
          <p className="text-xs text-neutral-500 pl-6">No activity recorded.</p>
        ) : (
          events.map((e, idx) => (
            <div key={idx} className="relative pl-8">
              <div className={`absolute left-0 top-1.5 size-3 rounded-full ring-4 ring-white dark:ring-neutral-900 
                ${e.type === 'init_client_project' ? 'bg-emerald-500' : 
                  e.type === 'note_added' ? 'bg-blue-500' : 
                  e.type === 'outreach_sent' ? 'bg-purple-500' :
                  e.type === 'strategy_generated' ? 'bg-amber-500' :
                  'bg-neutral-400'}`} 
              />
              <p className="text-sm font-semibold text-neutral-900 dark:text-white capitalize">
                {e.type.replace(/_/g, ' ')}
                {e.type === 'outreach_sent' && e.payload?.channel && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 lowercase font-normal">
                    via {e.payload.channel}
                  </span>
                )}
              </p>
              {e.type === 'outreach_sent' && e.payload?.to && (
                <p className="text-[10px] text-neutral-400 font-medium">To: {e.payload.to}</p>
              )}
              {e.type === 'outreach_sent' && e.payload?.subject && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 italic">"{e.payload.subject}"</p>
              )}
              <p className="text-[10px] text-neutral-500 mt-0.5">{new Date(e.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function RealLeadAIStrategy({ leadId, initialStrategy }: { leadId: string, initialStrategy?: any }) {
  const [strategy, setStrategy] = useState(initialStrategy)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dev/leads/${leadId}/strategy`, { method: 'POST' })
      const data = await res.json()
      if (data.strategy) setStrategy(data.strategy)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 dark:bg-purple-900/10 dark:border-purple-800/50 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
         <Sparkles className="size-20 text-purple-500" />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-purple-900 dark:text-purple-100 uppercase tracking-tight">AI Sales Strategy</h3>
          <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 font-bold uppercase tracking-widest">Powered by GPT-4o</p>
        </div>
      </div>

      {!strategy ? (
        <div className="py-4 space-y-4">
          <p className="text-sm text-purple-800/70 dark:text-purple-200/70">
            Generate a custom pitch strategy based on this business's niche, rating, and website status.
          </p>
          <button 
            onClick={generate}
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : 'Generate Pitch Strategy'}
          </button>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
          <div>
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-1">Email Hook</span>
            <p className="text-sm font-medium text-neutral-900 dark:text-white leading-relaxed italic">
              &ldquo;{strategy.hook}&rdquo;
            </p>
          </div>
          
          <div>
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-1.5">Key Pain Points</span>
            <ul className="space-y-1.5">
              {strategy.pain_points?.map((p: string, i: number) => (
                <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-white/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-1">Unique Value Prop</span>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-normal">{strategy.value_prop}</p>
          </div>

          <button 
            onClick={generate}
            disabled={loading}
            className="w-full text-[10px] font-bold text-purple-500 hover:text-purple-700 transition-colors py-2 uppercase tracking-widest"
          >
            {loading ? 'Regenerating...' : 'Regenerate Strategy'}
          </button>
        </div>
      )}
    </div>
  )
}
