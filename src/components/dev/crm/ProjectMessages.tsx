"use client"
import React, { useMemo, useRef, useState, useEffect, useActionState } from 'react'
import { createProjectMessageAction } from '@/app/dev/actions/crm'

type ChatAuthor = 'admin' | 'client'

export type ProjectMessage = {
  id: string
  author: ChatAuthor
  name: string
  text: string
  ts: string
  attachments?: { id: string; url: string; name?: string; type?: string }[]
}

export default function ProjectMessages({
  project,
  initialMessages = [],
}: {
  project: { id: string; title: string; client: { id: string; name: string } }
  initialMessages?: ProjectMessage[]
}) {
  const [messages, setMessages] = useState<ProjectMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [role, setRole] = useState<ChatAuthor>('admin')
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<{ id: string; url: string; name?: string; type?: string }[]>([])

  // State for Server Action
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    // Append the dynamic fields that are not in the form but in local state
    formData.append('project_id', project.id)
    formData.append('author_role', role)
    formData.append('author_name', role === 'admin' ? 'Admin' : project.client.name)
    
    const result = await createProjectMessageAction(prev, formData)
    if (result.success) {
      setDraft('')
      setAttachments([])
      // Note: revalidatePath in server action will refresh server data, 
      // but if we want instant optimistic UI, we could push here.
      // For now, we rely on the refresh.
    }
    return result
  }, null)

  // Update messages state when initialMessages (props) change (from server refresh)
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const counts = useMemo(() => {
    return {
      total: messages.length,
      admin: messages.filter((m) => m.author === 'admin').length,
      client: messages.filter((m) => m.author === 'client').length,
    }
  }, [messages])

  function onPickImage() {
    fileInputRef.current?.click()
  }

  function onFilesSelected(files: FileList | null) {
    if (!files) return
    const next: { id: string; url: string; name?: string; type?: string }[] = []
    Array.from(files).forEach((f) => {
      if (!/^image\/(png|jpe?g|gif|webp)$/i.test(f.type)) return
      const url = URL.createObjectURL(f)
      next.push({ id: `${Date.now()}-${f.name}`, url, name: f.name, type: f.type })
    })
    if (next.length) setAttachments((prev) => [...prev, ...next])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const items = e.clipboardData?.items
    if (!items) return
    const images: { id: string; url: string; name?: string; type?: string }[] = []
    for (const it of items) {
      if (it.kind === 'file') {
        const f = it.getAsFile()
        if (f && /^image\/(png|jpe?g|gif|webp)$/i.test(f.type)) {
          const url = URL.createObjectURL(f)
          images.push({ id: `${Date.now()}-${f.name}`, url, name: f.name, type: f.type })
        }
      }
    }
    if (images.length) setAttachments((prev) => [...prev, ...images])
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target && target.url.startsWith('blob:')) URL.revokeObjectURL(target.url)
      return prev.filter((a) => a.id !== id)
    })
  }

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm transition-all">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-neutral-900 dark:text-white">Workspace Chat</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 font-bold">{counts.total}</span>
            <span className="hidden sm:inline text-[10px] text-neutral-400 font-medium tracking-wider uppercase">{counts.admin} admin · {counts.client} client</span>
          </div>
        </div>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">Open full view</button>
      </div>

      <div ref={listRef} className="max-h-80 overflow-y-auto bg-neutral-50/30 dark:bg-neutral-900/20 p-6 custom-scrollbar">
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className={`flex ${m.author === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border ${
                m.author === 'admin'
                  ? 'bg-neutral-900 border-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:border-white'
                  : 'bg-white border-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-60 ${m.author === 'admin' ? 'text-neutral-300 dark:text-neutral-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {m.name} • {m.ts}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{m.text}</div>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {m.attachments.map((a) => (
                      <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-opacity">
                        <img src={a.url} alt={a.name || 'attachment'} className="h-32 w-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
          {messages.length === 0 && (
            <li className="py-10 text-center">
               <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">No conversation history</div>
               <p className="mt-1 text-[11px] text-neutral-500">Messages sent here are visible to the project team.</p>
            </li>
          )}
        </ul>
      </div>

      <form action={formAction} className="p-4 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800/50">
        <div className="flex flex-col gap-3">
          {attachments.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap px-2">
              {attachments.map((a) => (
                <div key={a.id} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-neutral-100 dark:border-neutral-800 shadow-sm group">
                  <img src={a.url} alt={a.name || ''} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeAttachment(a.id)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-lg">×</button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ChatAuthor)}
              className="h-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 text-xs font-bold text-neutral-600 dark:text-neutral-400 outline-none focus:ring-2 focus:ring-neutral-100 transition-all"
            >
              <option value="admin">As Admin</option>
              <option value="client">As Client</option>
            </select>
            <input
              name="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPaste={onPaste}
              required
              placeholder="Type your message..."
              autoComplete="off"
              className="flex-1 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800/50 transition-all"
            />
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" multiple hidden onChange={(e) => onFilesSelected(e.target.files)} />
            <button 
              type="button" 
              onClick={onPickImage} 
              className="hidden sm:flex h-10 px-4 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
            >
              Attach
            </button>
            <button 
              type="submit" 
              disabled={isPending || !draft.trim()}
              className="h-10 px-6 rounded-xl bg-neutral-900 dark:bg-white text-xs font-bold text-white dark:text-neutral-900 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {isPending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}