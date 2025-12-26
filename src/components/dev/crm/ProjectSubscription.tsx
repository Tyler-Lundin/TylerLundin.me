"use client"
import React from 'react'

export type Subscription = {
  id: string
  status: 'active' | 'trialing' | 'past_due' | 'paused' | 'canceled'
  plan_name: string
  amount_cents: number
  currency?: string
  interval: 'month' | 'year'
  started_at?: string
  current_period_end?: string
  next_invoice_at?: string
  payment_method?: { brand: string; last4: string } | null
  seats?: number | null
  usage?: { used: number; limit?: number | null }
}

export default function ProjectSubscription({
  subscription,
  linked = false,
}: {
  subscription?: Subscription | null
  linked?: boolean
}) {
  const sub = subscription || null
  const pillClass = sub ? statusPill(sub.status) : 'bg-[#232428] border-[#3F4147] text-[#DBDEE1]'

  return (
    <section className="rounded-lg border border-[#3F4147] overflow-hidden">
      <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Subscription</h2>
        {sub ? (
          <span className={`text-[11px] px-1.5 py-0.5 rounded border ${pillClass}`}>{sub.status}</span>
        ) : null}
      </div>

      <div className="relative">
        <div className={linked ? 'bg-[#16171A]' : 'bg-[#16171A] blur-sm select-none pointer-events-none'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4">
            {/* Plan */}
            <div className="rounded-lg border border-[#3F4147] bg-[#0F1115] p-3">
              <div className="text-[11px] text-[#949BA4]">Plan</div>
              <div className="text-white font-medium">
                {sub ? sub.plan_name : '—'}
                {sub?.seats ? <span className="ml-2 text-[11px] text-[#949BA4]">{sub.seats} seats</span> : null}
              </div>
              <div className="text-[12px] text-[#949BA4] mt-1">
                {sub ? `${formatMoney(sub.amount_cents, sub.currency)}/${sub.interval}` : ''}
              </div>
            </div>

            {/* Period */}
            <div className="rounded-lg border border-[#3F4147] bg-[#0F1115] p-3">
              <div className="text-[11px] text-[#949BA4]">Period</div>
              <div className="text-white font-medium">
                {sub?.started_at ? new Date(sub.started_at).toLocaleDateString() : '—'} → {sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}
              </div>
              <div className="text-[12px] text-[#949BA4] mt-1">Next invoice {sub?.next_invoice_at ? new Date(sub.next_invoice_at).toLocaleDateString() : '—'}</div>
            </div>

            {/* Payment method */}
            <div className="rounded-lg border border-[#3F4147] bg-[#0F1115] p-3">
              <div className="text-[11px] text-[#949BA4]">Payment method</div>
              <div className="text-white font-medium">
                {sub?.payment_method ? `${capitalize(sub.payment_method.brand)} •••• ${sub.payment_method.last4}` : '—'}
              </div>
            </div>

            {/* Usage */}
            <div className="rounded-lg border border-[#3F4147] bg-[#0F1115] p-3">
              <div className="text-[11px] text-[#949BA4]">Usage</div>
              <div className="text-white font-medium">
                {sub?.usage ? `${sub.usage.used}${sub.usage.limit ? ` / ${sub.usage.limit}` : ''}` : '—'}
              </div>
            </div>
          </div>

          <div className="px-3 sm:px-4 pb-3 flex items-center gap-2">
            <button className="h-7 px-2 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Update plan</button>
            <button className="h-7 px-2 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Cancel</button>
          </div>
        </div>

        {!linked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22]/90 backdrop-blur p-4 text-center max-w-sm mx-auto">
              <div className="text-sm text-white font-medium">Create or link subscription</div>
              <div className="mt-1 text-xs text-[#949BA4]">Connect this project to a subscription to manage plan, billing cycle, and usage.</div>
              <div className="mt-3">
                <button className="px-3 h-8 rounded-md border border-[#3F4147] bg-[#232428] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Link Subscription</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function statusPill(status: Subscription['status']) {
  switch (status) {
    case 'active':
      return 'bg-[#0E3A2A] border-[#0B4A34] text-[#9FEFBC]'
    case 'trialing':
      return 'bg-[#0E2A3A] border-[#0B364A] text-[#93C5FD]'
    case 'past_due':
      return 'bg-[#4A0B0B] border-[#7F1D1D] text-[#F87171]'
    case 'paused':
      return 'bg-[#3A2A0E] border-[#4A360B] text-[#FDE68A]'
    case 'canceled':
      return 'bg-[#2B2C30] border-[#3F4147] text-[#949BA4]'
    default:
      return 'bg-[#232428] border-[#3F4147] text-[#DBDEE1]'
  }
}

function formatMoney(cents: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `$${(cents / 100).toFixed(2)}`
  }
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

