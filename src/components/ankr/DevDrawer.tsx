"use client"
import { useState } from 'react'
import type { TransparencyInfo } from './TransparencyChips'

type Status = 'OFF' | 'LOADING' | 'ON'

export type DevDrawerProps = {
  devOpen: boolean
  status: { retrieval: Status; generation: Status; citations: Status }
  turnInfo: TransparencyInfo | null
  sendLocked: boolean
  actionBatch: null | { ids: string[]; names: Record<string,string>; results: Record<string, { status: string; info: any }> }
  setActionBatch: (v: any) => void
  setMessages: (fn: any) => void
  setDevLog: (fn: any) => void
  devLog: any[]
  DEV_VIEW: boolean
  pollTimeoutRef: any
  hintBtnRef: any
  statusInfoRef: any
  showStatusInfo: boolean
  setShowStatusInfo: (v: boolean) => void
  loadDevActions: (s: 'requested' | 'acknowledged' | 'running' | 'failed') => void
  devFilter: 'requested' | 'acknowledged' | 'running' | 'failed'
  devActions: any[]
  executeAction: (id: string, force?: boolean) => void
  setSendLocked: (v: boolean) => void
}

export default function DevDrawer(props: DevDrawerProps) {
  const { devOpen, turnInfo, devLog } = props
  const slide = devOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
  return (
    <div className={`absolute right-0 top-[63px] bottom-0 w-full lg:w-[380px] overflow-y-auto border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 ease-out ${slide}`}>
      <CollapsibleSection title="Step 1 Analysis" defaultOpen onCopy={async () => {
        const ma: any = (turnInfo as any)?.messageAnalysis || {}
        const parts: string[] = []
        parts.push(`Intent: ${ma.intent || '—'} (${(ma.intentConfidence ?? 0).toFixed(2)})`)
        parts.push(`Primary: ${ma.primaryIntent || '—'}`)
        parts.push(`Route: ${ma.route || '—'}`)
        parts.push(`Needs Context: ${String(ma.needsContext)} • Scope: ${ma.contextScope || '—'}`)
        parts.push(`Complexity: ${(ma.complexity ?? 0).toFixed(2)} • Effort: ${ma.effort || '—'} • Time: ${(ma.timeSensitivity ?? 0).toFixed(2)}`)
        parts.push(`Tone: ${ma.tone || '—'} • Urgency: ${ma.urgency || '—'} • Certainty: ${(ma.certainty ?? 0).toFixed(2)}`)
        parts.push(`Inputs: code=${ma.hasCode} err=${ma.hasErrorLog} trace=${ma.hasStackTrace} diff=${ma.hasDiffPatch} sql=${ma.hasSQL} cfg=${ma.hasConfig} mcfg=${ma.mentionsConfig ?? false} wantsArtifact=${ma.wantsArtifact ?? false} hasArtifact=${ma.hasArtifact ?? false} img=${ma.hasScreenshotOrImageRef} link=${ma.hasLinks}`)
        if (Array.isArray(ma.entities) && ma.entities.length) {
          parts.push('Entities:')
          parts.push(...ma.entities.map((e: any) => `- ${e.type}: ${e.value} (${(e.weight ?? 0).toFixed(2)})`))
        }
        if (Array.isArray((ma as any).issues) && (ma as any).issues.length) {
          parts.push('Issues:')
          parts.push(...((ma as any).issues || []).map((it: any) => `- ${it.summary} (${(it.weight ?? 0).toFixed(2)})`))
        }
        if (Array.isArray((ma as any).changes) && (ma as any).changes.length) {
          parts.push('Changes:')
          parts.push(...((ma as any).changes || []).map((ch: any) => {
            let desc = '(unspecified)'
            if (ch.current || ch.desired) {
              desc = `${ch.current ? `Current: ${ch.current}` : ''}${ch.current && ch.desired ? ' -> ' : ''}${ch.desired ? `Desired: ${ch.desired}` : ''}`
            } else if (typeof ch.value === 'string' && ch.value.trim() !== '') {
              desc = ch.value.trim()
              if (typeof ch.location === 'string' && ch.location.trim() !== '') desc += ` @ ${ch.location.trim()}`
            } else if (ch.polarity === 'negated') {
              desc = 'Negate current value'
            }
            if (ch.polarity && desc !== 'Negate current value') desc += ` [${ch.polarity}]`
            return `- ${ch.field}: ${desc} (${(ch.weight ?? 0).toFixed(2)})`
          }))
        }
        if (Array.isArray(ma.missingInfo) && ma.missingInfo.length) {
          parts.push('Missing Info:')
          parts.push(...ma.missingInfo.map((m: any) => `- ${m.key} (${(m.weight ?? 0).toFixed(2)})`))
        }
        if (Array.isArray((ma as any).clarifiers) && (ma as any).clarifiers.length) {
          parts.push('Clarifiers:')
          parts.push(...((ma as any).clarifiers || []).map((c: any) => `- ${c.question} (${(c.weight ?? 0).toFixed(2)})`))
        }
        if (Array.isArray(ma.suggestedActions) && ma.suggestedActions.length) {
          parts.push('Suggested Actions:')
          parts.push(...ma.suggestedActions.map((a: any) => `- ${a.name} (${(a.weight ?? 0).toFixed(2)})`))
        }
        if (Array.isArray(ma.actionProposals) && ma.actionProposals.length) {
          parts.push('Action Proposals:')
          parts.push(JSON.stringify(ma.actionProposals, null, 2))
        }
        if (Array.isArray(ma.retrievalQueries) && ma.retrievalQueries.length) {
          parts.push('Retrieval Queries:')
          parts.push(...ma.retrievalQueries.map((q: string) => `- ${q}`))
        }
        if (Array.isArray(ma.memoryCandidates) && ma.memoryCandidates.length) {
          parts.push('Memory Candidates:')
          parts.push(...ma.memoryCandidates.map((m: any) => `- ${m.key}: ${m.value} (${(m.weight ?? 0).toFixed(2)})`))
        }
        await navigator.clipboard?.writeText(parts.join('\n'))
      }}>
        {(() => {
          const ma = (turnInfo as any)?.messageAnalysis
          if (!ma) return <div className="text-[12px] text-zinc-500">(none)</div>
          return (
            <div className="text-[12px] text-zinc-700 dark:text-zinc-200">
              <ul className="space-y-0.5">
                <li>Intent: <span className="text-zinc-900 dark:text-zinc-100">{ma.intent}</span> <span className="text-zinc-600 dark:text-zinc-400">({(ma.intentConfidence ?? 0).toFixed(2)})</span></li>
                <li>Primary: <code className="text-zinc-800 dark:text-zinc-100">{(ma as any).primaryIntent ?? '—'}</code></li>
                <li>Route: <code className="text-zinc-800 dark:text-zinc-100">{ma.route}</code></li>
                <li>Needs Context: {String(ma.needsContext)} • Scope: <code className="text-zinc-800 dark:text-zinc-100">{ma.contextScope}</code></li>
                <li>Complexity: {(ma.complexity ?? 0).toFixed(2)} • Effort: <code className="text-zinc-800 dark:text-zinc-100">{ma.effort}</code> • Time: {(ma.timeSensitivity ?? 0).toFixed(2)}</li>
                <li>Tone: <code className="text-zinc-800 dark:text-zinc-100">{ma.tone}</code> • Urgency: <code className="text-zinc-800 dark:text-zinc-100">{ma.urgency}</code> • Certainty: {(ma.certainty ?? 0).toFixed(2)}</li>
                <li>Inputs: code={String(ma.hasCode)} err={String(ma.hasErrorLog)} trace={String(ma.hasStackTrace)} diff={String(ma.hasDiffPatch)} sql={String(ma.hasSQL)} cfg={String(ma.hasConfig)} mcfg={String((ma as any).mentionsConfig ?? false)} wantsArtifact={String((ma as any).wantsArtifact ?? false)} hasArtifact={String((ma as any).hasArtifact ?? false)} img={String(ma.hasScreenshotOrImageRef)} link={String(ma.hasLinks)}</li>
                <li>Safety: secrets={String(ma.containsSecretsRisk)} privacy={String(ma.privacyRisk)} pay={String(ma.paymentRisk)} legal={String(ma.legalRisk)}</li>
              </ul>
              <div className="mt-2">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Entities</div>
                {(Array.isArray(ma.entities) && ma.entities.length > 0) ? (
                  <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                    {ma.entities.slice(0,12).map((e: any, i: number) => (
                      <li key={i}><code className="text-zinc-800 dark:text-zinc-100">{e.type}</code>: {e.value} <span className="text-zinc-600 dark:text-zinc-400">({(e.weight ?? 0).toFixed(2)})</span></li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-zinc-500">(none)</div>
                )}
              </div>
              {(Array.isArray((ma as any).issues) || Array.isArray((ma as any).changes)) && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Issues</div>
                    {(Array.isArray((ma as any).issues) && (ma as any).issues.length > 0) ? (
                      <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                        {((ma as any).issues || []).map((it: any, i: number) => (
                          <li key={i}>• {it.summary} <span className="text-zinc-600 dark:text-zinc-400">({(it.weight ?? 0).toFixed(2)})</span></li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-zinc-500">(none)</div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Changes</div>
                    {(Array.isArray((ma as any).changes) && (ma as any).changes.length > 0) ? (
                      <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                        {((ma as any).changes || []).map((ch: any, i: number) => {
                          let desc = '(unspecified)'
                          if (ch.current || ch.desired) {
                            desc = `${ch.current ? `Current: ${ch.current}` : ''}${ch.current && ch.desired ? ' → ' : ''}${ch.desired ? `Desired: ${ch.desired}` : ''}`
                          } else if (typeof ch.value === 'string' && ch.value.trim() !== '') {
                            desc = ch.value.trim()
                            if (typeof ch.location === 'string' && ch.location.trim() !== '') desc += ` @ ${ch.location.trim()}`
                          } else if (ch.polarity === 'negated') {
                            desc = 'Negate current value'
                          }
                          if (ch.polarity && desc !== 'Negate current value') desc += ` [${ch.polarity}]`
                          return (
                            <li key={i}><code className="text-zinc-800 dark:text-zinc-100">{ch.field}</code>: {desc} <span className="text-zinc-600 dark:text-zinc-400">({(ch.weight ?? 0).toFixed(2)})</span></li>
                          )
                        })}
                      </ul>
                    ) : (
                      <div className="text-zinc-500">(none)</div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-2">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Missing Info</div>
                {(Array.isArray(ma.missingInfo) && ma.missingInfo.length > 0) ? (
                  <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                    {ma.missingInfo.map((m: any, i: number) => (
                      <li key={i}>{m.key} <span className="text-zinc-600 dark:text-zinc-400">({(m.weight ?? 0).toFixed(2)})</span></li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-zinc-500">(none)</div>
                )}
              </div>
              {'clarifiers' in ma && Array.isArray((ma as any).clarifiers) && (
                <div className="mt-2">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Clarifiers (non-blocking)</div>
                  {((ma as any).clarifiers || []).length > 0 ? (
                    <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                      {((ma as any).clarifiers || []).map((c: any, i: number) => (
                        <li key={i}>• {c.question} <span className="text-zinc-600 dark:text-zinc-400">({(c.weight ?? 0).toFixed(2)})</span></li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-zinc-500">(none)</div>
                  )}
                </div>
              )}
              {'actionProposals' in ma && Array.isArray((ma as any).actionProposals) && (
                <div className="mt-2">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Action Proposals</div>
                  {((ma as any).actionProposals || []).length > 0 ? (
                    <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                      {((ma as any).actionProposals || []).map((p: any, i: number) => (
                        <li key={i}><code className="text-zinc-800 dark:text-zinc-100">{p.name}</code> → <span className="text-zinc-800 dark:text-zinc-100">{JSON.stringify(p.args)}</span> <span className="text-zinc-600 dark:text-zinc-400">({(p.weight ?? p.confidence ?? 0).toFixed(2)})</span>{p.reason ? <span className="ml-1 text-zinc-500">— {p.reason}</span> : null}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-zinc-500">(none)</div>
                  )}
                </div>
              )}
              {'retrievalQueries' in ma && Array.isArray((ma as any).retrievalQueries) && (
                <div className="mt-2">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Retrieval Queries</div>
                  {((ma as any).retrievalQueries || []).length > 0 ? (
                    <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                      {((ma as any).retrievalQueries || []).map((q: string, i: number) => (
                        <li key={i}><code className="text-zinc-800 dark:text-zinc-100">{q}</code></li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-zinc-500">(none)</div>
                  )}
                </div>
              )}
              <div className="mt-2">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Memory Candidates</div>
                {(Array.isArray(ma.memoryCandidates) && ma.memoryCandidates.length > 0) ? (
                  <ul className="text-[12px] text-zinc-700 dark:text-zinc-200">
                    {ma.memoryCandidates.map((m: any, i: number) => (
                      <li key={i}><code className="text-zinc-800 dark:text-zinc-100">{m.key}</code>: {m.value} <span className="text-zinc-600 dark:text-zinc-400">({(m.weight ?? 0).toFixed(2)})</span></li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-zinc-500">(none)</div>
                )}
              </div>
            </div>
          )
        })()}
      </CollapsibleSection>

      <CollapsibleSection title="Logs" defaultOpen={false} onCopy={async () => {
        await navigator.clipboard?.writeText(JSON.stringify(devLog || [], null, 2))
      }}>
        <DevLogs devLog={devLog} />
      </CollapsibleSection>
    </div>
  )
}

function CollapsibleSection({ title, defaultOpen = true, onCopy, children }: { title: string; defaultOpen?: boolean; onCopy?: () => void | Promise<void>; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const [copied, setCopied] = useState(false)
  const doCopy = async (e: any) => {
    e?.stopPropagation?.()
    try {
      if (onCopy) await onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 900)
    } catch {}
  }
  return (
    <div className="border-b ankr-section-border">
      <div className="flex w-full items-center justify-between px-3 py-2 text-[12px] text-zinc-600 dark:text-zinc-300">
        <button type="button" className="flex-1 text-left hover:underline" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span className="text-[11px] uppercase tracking-wide text-zinc-400">{title}</span>
        </button>
        {onCopy && (
          <button type="button" className="ml-2 rounded border ankr-section-border bg-white dark:bg-zinc-950 px-2 py-0.5 text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900" onClick={doCopy} aria-label={`Copy ${title}`}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        <button type="button" className="ml-2 text-[11px] opacity-70 hover:underline" onClick={() => setOpen((v) => !v)}>{open ? 'Hide' : 'Show'}</button>
      </div>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  )
}

function DevLogs({ devLog }: { devLog: any[] }) {
  const [expanded, setExpanded] = useState(false)
  const logArr = Array.isArray(devLog) ? devLog : []
  const preview = logArr.slice(-6)
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-zinc-400">Logs</div>
        <button className="rounded border ankr-section-border bg-white dark:bg-black px-2 py-0.5 text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Preview' : 'Full view'}
        </button>
      </div>
      {expanded ? (
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-[10px]">{JSON.stringify(logArr, null, 2)}</pre>
      ) : (
        <ul className="max-h-56 overflow-auto text-[11px] text-zinc-600 dark:text-zinc-300">
          {preview.map((e, i) => (
            <li key={i} className="py-0.5">{String(e.type)} {e.status ? `(${e.status})` : ''} {e.id ? `#${e.id}` : ''}</li>
          ))}
          {logArr.length === 0 && <li className="text-zinc-400">No events.</li>}
        </ul>
      )}
    </div>
  )
}
