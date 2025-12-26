"use client"
import React, { useMemo, useRef, useState, useEffect } from 'react'

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

  useEffect(() => {
    // auto-scroll to bottom on mount and when messages change
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  const counts = useMemo(() => {
    return {
      total: messages.length,
      admin: messages.filter((m) => m.author === 'admin').length,
      client: messages.filter((m) => m.author === 'client').length,
    }
  }, [messages])

  function sendMock(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    // purely in-memory mock send for look & feel
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        author: role,
        name: role === 'admin' ? 'Admin' : project.client.name,
        text: draft.trim(),
        ts: new Date().toLocaleTimeString(),
        attachments: attachments.length ? attachments : undefined,
      },
    ])
    setDraft('')
    // clear attachments and revoke URLs
    attachments.forEach((a) => a.url.startsWith('blob:') && URL.revokeObjectURL(a.url))
    setAttachments([])
  }

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
    // reset input value to allow re-selecting same file
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
    <section className="rounded-lg border border-[#3F4147] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">Messages</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232428] border border-[#3F4147] text-[#949BA4]">{counts.total}</span>
          <span className="hidden sm:inline text-[10px] text-[#949BA4]">{counts.admin} admin · {counts.client} client</span>
        </div>
        <button className="h-7 px-2 rounded border border-[#3F4147] bg-[#232428] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Open full chat</button>
      </div>

      {/* Messages list */}
      <div ref={listRef} className="max-h-72 overflow-y-auto bg-[#0F1115]">
        <ul className="px-3 py-3 space-y-2">
          {messages.map((m) => (
            <li key={m.id} className={`flex ${m.author === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg border px-3 py-2 text-sm leading-5 ${
                m.author === 'admin'
                  ? 'bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]'
                  : 'bg-[#0E2A3A] border-[#0B364A] text-[#93C5FD]'
              }`}>
                <div className="text-[10px] opacity-70 mb-0.5">{m.name} · {m.ts}</div>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {m.attachments.map((a) => (
                      <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded border border-[#3F4147] bg-black/20">
                        <img src={a.url} alt={a.name || 'attachment'} className="h-24 w-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
          {messages.length === 0 && (
            <li className="text-[12px] text-[#949BA4]">No messages yet.</li>
          )}
        </ul>
      </div>

      {/* Composer (mock-send, local only) */}
      <form onSubmit={sendMock} className="px-3 sm:px-4 py-3 bg-[#16171A] border-t border-[#3F4147] flex flex-col gap-2">
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {attachments.map((a) => (
              <div key={a.id} className="relative w-14 h-14 rounded-md overflow-hidden border border-[#3F4147]">
                <img src={a.url} alt={a.name || ''} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeAttachment(a.id)} className="absolute top-0 right-0 m-0.5 text-[10px] bg-black/50 px-1 rounded">×</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as ChatAuthor)}
          className="h-8 rounded-md bg-[#1E1F22] border border-[#3F4147] px-2 text-xs text-[#DBDEE1]"
        >
          <option value="admin">Admin</option>
          <option value="client">Client</option>
        </select>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPaste={onPaste}
          placeholder="Type a message (mock)"
          className="flex-1 h-9 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-white placeholder-[#6B7280] focus:outline-none"
        />
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" multiple hidden onChange={(e) => onFilesSelected(e.target.files)} />
        <button type="button" onClick={onPickImage} className="h-9 px-3 rounded-md border border-[#3F4147] bg-[#1E1F22] text-sm text-[#DBDEE1] hover:bg-[#2a2b30]">Attach image</button>
        <button type="submit" className="h-9 px-3 rounded-md border border-[#3F4147] bg-[#1E1F22] text-sm text-[#DBDEE1] hover:bg-[#2a2b30]">Send</button>
        </div>
      </form>
    </section>
  )
}
