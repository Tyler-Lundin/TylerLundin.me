"use client"
import React, { useMemo, useState } from 'react'
import type { Invoice } from './ProjectBilling'

export default function ProjectInvoices({ invoices = [] }: { invoices?: Invoice[] }) {
  const [filter, setFilter] = useState<'all' | 'open' | 'paid' | 'overdue' | 'draft' | 'void'>('all')

  const filtered = useMemo(() => {
    return filter === 'all' ? invoices : invoices.filter((i) => i.status === filter)
  }, [invoices, filter])

  return (
    <section className="rounded-lg border border-[#3F4147] overflow-hidden">
      <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Invoices</h2>
        <div className="flex items-center gap-1 text-[11px]">
          {(['all','open','paid','overdue'] as const).map((k) => (
            <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)}>{k[0].toUpperCase()+k.slice(1)}</FilterChip>
          ))}
          <button className="ml-2 h-7 px-2 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">New invoice</button>
        </div>
      </div>
      <div className="overflow-x-auto bg-[#16171A]">
        <table className="w-full text-sm">
          <thead className="bg-[#1E1F22] text-[#949BA4]">
            <tr>
              <th className="text-left px-4 py-2 font-medium">#</th>
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Due</th>
              <th className="text-left px-4 py-2 font-medium">Amount</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3F4147]">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-[#1E1F22]">
                <td className="px-4 py-2 text-white">{inv.number}</td>
                <td className="px-4 py-2 text-[#DBDEE1]">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-[#DBDEE1]">{new Date(inv.due_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-[#DBDEE1]">{formatMoney(inv.amount_cents, inv.currency)}</td>
                <td className="px-4 py-2 text-[#DBDEE1]"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-2 text-[#949BA4]">
                  {inv.url ? (
                    <a href={inv.url} target="_blank" rel="noreferrer" className="underline">View</a>
                  ) : (
                    <span className="opacity-60">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[#949BA4]">No invoices.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded border text-[11px] ${
        active ? 'bg-[#232428] border-[#3F4147] text-[#DBDEE1]' : 'bg-transparent border-[#2a2b30] text-[#949BA4] hover:text-[#DBDEE1]'
      }`}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const map: Record<Invoice['status'], string> = {
    draft: 'bg-[#232428] border-[#3F4147] text-[#DBDEE1]',
    open: 'bg-[#3A2A0E] border-[#4A360B] text-[#FDE68A]',
    overdue: 'bg-[#4A0B0B] border-[#7F1D1D] text-[#F87171]',
    paid: 'bg-[#0E3A2A] border-[#0B4A34] text-[#9FEFBC]',
    void: 'bg-[#2B2C30] border-[#3F4147] text-[#949BA4]',
  }
  return <span className={`px-1.5 py-0.5 text-[11px] rounded border ${map[status]}`}>{status}</span>
}

function formatMoney(cents: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `$${(cents / 100).toFixed(2)}`
  }
}

