"use client"
import React from 'react'

export type ProjectDoc = {
  id: string
  kind: 'contract' | 'sow' | 'nda' | 'other'
  title: string
  status: 'signed' | 'pending' | 'draft'
  url?: string
  created_at?: string
}

export default function ProjectDocuments({ docs = [] }: { docs?: ProjectDoc[] }) {
  return (
    <section className="rounded-lg border border-[#3F4147] overflow-hidden">
      <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Documents</h2>
        <button className="h-7 px-2 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Upload</button>
      </div>
      <ul className="bg-[#16171A] divide-y divide-[#3F4147]">
        {docs.map((d) => (
          <li key={d.id} className="px-4 py-3 text-sm flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#232428] border border-[#3F4147] text-[#949BA4] uppercase">{d.kind}</span>
              {d.url ? (
                <a href={d.url} target="_blank" rel="noreferrer" className="text-white underline truncate">{d.title}</a>
              ) : (
                <span className="text-white truncate">{d.title}</span>
              )}
            </div>
            <span className={`text-[11px] px-1.5 py-0.5 rounded border ${
              d.status === 'signed' ? 'bg-[#0E3A2A] border-[#0B4A34] text-[#9FEFBC]' : d.status === 'pending' ? 'bg-[#3A2A0E] border-[#4A360B] text-[#FDE68A]' : 'bg-[#232428] border-[#3F4147] text-[#DBDEE1]'
            }`}>{d.status}</span>
          </li>
        ))}
        {docs.length === 0 && (
          <li className="px-4 py-6 text-center text-[#949BA4] text-sm">No documents.</li>
        )}
      </ul>
    </section>
  )
}

