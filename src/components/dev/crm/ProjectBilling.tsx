"use client"
import React, { useMemo } from 'react'

export type Invoice = {
  id: string
  number: string
  date: string
  due_at: string
  amount_cents: number
  currency?: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'overdue'
  url?: string
}

export default function ProjectBilling({
  invoices = [],
  paymentsLinked = false,
}: {
  invoices?: Invoice[]
  paymentsLinked?: boolean
}) {
  const { total, paid, outstanding, overdue } = useMemo(() => {
    const sum = (s: Invoice['status'][]): number =>
      invoices.filter((i) => s.includes(i.status)).reduce((acc, i) => acc + i.amount_cents, 0)
    const total = invoices.reduce((acc, i) => acc + i.amount_cents, 0)
    const paid = sum(['paid'])
    const open = sum(['open'])
    const overdue = sum(['overdue'])
    return { total, paid, outstanding: open + overdue, overdue }
  }, [invoices])

  return (
    <section className="rounded-lg border border-[#3F4147] overflow-hidden">
      <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Billing Overview</h2>
        <div className="text-[11px] text-[#949BA4]">{invoices.length} invoices</div>
      </div>

      <div className="relative">
        <div className={paymentsLinked ? '' : 'blur-[2px] select-none pointer-events-none opacity-40'}>
          {/* Summary tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-4 bg-[#16171A]">
            <SummaryTile label="Total Invoiced" value={formatMoney(total)} />
            <SummaryTile label="Paid" value={formatMoney(paid)} />
            <SummaryTile label="Outstanding" value={formatMoney(outstanding)} sub={overdue > 0 ? `${formatMoney(overdue)} overdue` : undefined} />
          </div>

          {/* Payment provider connection bar */}
          <div className="px-3 sm:px-4 py-3 flex items-center justify-between bg-[#16171A] border-t border-[#3F4147]/50">
            <div className="text-sm text-[#DBDEE1]">Stripe account connected</div>
            <div className="text-[11px] text-[#949BA4]">Payouts enabled</div>
          </div>
        </div>

        {!paymentsLinked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="rounded-xl border border-[#3F4147] bg-[#1E1F22]/90 backdrop-blur-md p-6 text-center max-w-sm w-full shadow-2xl">
              <div className="text-sm text-white font-semibold">Link Stripe account</div>
              <div className="mt-2 text-xs text-[#949BA4] leading-relaxed">Connect payments to create and collect invoices seamlessly.</div>
              <div className="mt-4">
                <button className="w-full px-4 h-9 rounded-lg bg-neutral-100 hover:bg-white text-sm font-semibold text-neutral-900 transition-colors cursor-not-allowed opacity-80">Connect Stripe</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[#3F4147] bg-[#0F1115] p-3">
      <div className="text-[11px] text-[#949BA4]">{label}</div>
      <div className="text-xl font-semibold text-white">{value}</div>
      {sub && <div className="text-[11px] text-[#949BA4] mt-1">{sub}</div>}
    </div>
  )
}

function formatMoney(cents: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `$${(cents / 100).toFixed(2)}`
  }
}

