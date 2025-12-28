import React from 'react'

export type HealthStatus = 'ok' | 'warn' | 'error' | 'pending'

export type HealthItemData = {
  id: string
  label: string
  status: HealthStatus
  detail?: string
  link?: string
  ts?: string
}

export function StatusDot({ status }: { status: HealthStatus }) {
  const color =
    status === 'ok'
      ? 'bg-emerald-400 ring-emerald-500/30'
      : status === 'warn'
      ? 'bg-amber-400 ring-amber-500/30'
      : status === 'error'
      ? 'bg-rose-500 ring-rose-500/30'
      : 'bg-slate-400 ring-slate-500/30'

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ring-2 ${color}`} />
}

export default function HealthItem({ item }: { item: HealthItemData }) {
  return (
    <li className="px-3 sm:px-4 py-2.5 flex items-start gap-3">
      <div className="pt-1"><StatusDot status={item.status} /></div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {item.link ? (
            <a href={item.link} target="_blank" rel="noreferrer" className="text-xs sm:text-[13px] font-medium text-neutral-900 hover:underline dark:text-white">
              {item.label}
            </a>
          ) : (
            <span className="text-xs sm:text-[13px] font-medium text-neutral-900 dark:text-white">{item.label}</span>
          )}
          {item.ts ? <span className="text-[10px] text-neutral-500 dark:text-[#949BA4]">{item.ts}</span> : null}
        </div>
        {item.detail ? (
          <div className="mt-0.5 text-[11px] text-neutral-600 leading-snug dark:text-[#B5BAC1]">
            {item.detail}
          </div>
        ) : null}
      </div>
    </li>
  )
}
