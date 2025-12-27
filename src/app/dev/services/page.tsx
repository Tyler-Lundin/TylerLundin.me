"use client"
import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getServices, getBundles, expandBundle } from '@/services'
import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function DevServicesPage() {
  const services = getServices()
  const bundlesRaw = getBundles()
  const bundles = useMemo(() => bundlesRaw.map((b) => ({ b, expanded: expandBundle(b, services) })), [bundlesRaw, services])

  // Selection state (mock)
  const [selectedServiceSlugs, setSelectedServiceSlugs] = useState<Set<string>>(new Set())
  const [selectedBundleSlugs, setSelectedBundleSlugs] = useState<Set<string>>(new Set())

  const toggleService = (slug: string) => {
    setSelectedServiceSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }
  const toggleBundle = (slug: string) => {
    setSelectedBundleSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  // Derived insights
  const usage = useMemo(() => {
    const m = new Map<string, number>()
    for (const b of bundlesRaw) for (const slug of b.serviceSlugs) m.set(slug, (m.get(slug) || 0) + 1)
    return m
  }, [bundlesRaw])
  const linkedServices = services.filter((s) => (usage.get(s.slug) || 0) > 0)
  const unlinkedServices = services.length - linkedServices.length
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[]
  const selectedBundlesCount = selectedBundleSlugs.size
  const selectedServicesCount = selectedServiceSlugs.size

  const selectAllBundles = () => setSelectedBundleSlugs(new Set(bundlesRaw.map((b) => b.slug)))
  const clearBundles = () => setSelectedBundleSlugs(new Set())
  const selectAllServices = () => setSelectedServiceSlugs(new Set(services.map((s) => s.slug)))
  const clearServices = () => setSelectedServiceSlugs(new Set())

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">
      {/* Header / Toolbar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Services</h1>
          <p className="text-sm text-[#949BA4]">Internal dashboard for CRUD and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            disabled
            placeholder="Search services (mock)"
            className="h-9 w-56 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-white placeholder-[#6B7280]"
          />
          <select disabled className="h-9 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-[#949BA4]">
            <option>Status: All</option>
          </select>
          <button className="h-9 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 text-sm text-white opacity-60 cursor-not-allowed">
            New Service
          </button>
          <button className="h-9 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 text-sm text-white opacity-60 cursor-not-allowed">
            New Bundle
          </button>
        </div>
      </div>

      {/* Insights */}
      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#3F4147] bg-[#121316] p-3">
          <div className="text-[11px] text-[#949BA4]">Total services</div>
          <div className="mt-1 text-xl font-semibold text-white">{services.length}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#121316] p-3">
          <div className="text-[11px] text-[#949BA4]">Total bundles</div>
          <div className="mt-1 text-xl font-semibold text-white">{bundles.length}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#121316] p-3">
          <div className="text-[11px] text-[#949BA4]">Linked in bundles</div>
          <div className="mt-1 text-xl font-semibold text-white">{linkedServices.length}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#121316] p-3">
          <div className="text-[11px] text-[#949BA4]">Unlinked services</div>
          <div className="mt-1 text-xl font-semibold text-white">{unlinkedServices}</div>
        </div>
      </section>
      {categories.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <span key={c} className="text-[11px] px-1.5 py-0.5 rounded bg-[#232428] border border-[#3F4147] text-[#C2C7CE]">
              {c}
            </span>
          ))}
        </div>
      ) : null}

      {/* Bundles */}
      <motion.section layout transition={{ duration: 0.2, ease: 'easeOut' }} className="rounded-lg border border-[#3F4147] overflow-hidden">
        <div className="relative px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Bundles</h2>
          <div className="text-[11px] text-[#949BA4]">{bundles.length} total</div>
          {/* Overlay bundles action bar */}
          <AnimatePresence initial={false}>
            {selectedBundlesCount > 0 && (
              <motion.div
                key="bundles-action-bar"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute inset-0 bg-[#15171A]/95 backdrop-blur flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#3F4147] bg-[#232428] px-2 py-0.5 text-[11px] text-[#C2C7CE]">
                    {selectedBundlesCount} selected
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={selectAllBundles} className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#121316] text-[12px] text-[#C2C7CE] hover:border-[#4b4e55]">Select all</button>
                  <button onClick={clearBundles} className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] hover:border-[#4b4e55]">Clear</button>
                  <span className="mx-2 h-5 w-px bg-[#3F4147]" />
                  <button className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] hover:border-[#4b4e55]">Duplicate</button>
                  <button className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] hover:border-[#4b4e55]">Archive</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="overflow-x-auto bg-[#16171A]">
          <table className="w-full text-sm">
            <thead className="bg-[#1E1F22]/95 backdrop-blur sticky top-0 z-10 text-[#949BA4] border-b border-[#3F4147]">
              <tr>
                <th className="w-1 px-0 py-0" />
                <th className="text-left px-2 py-2 font-medium">Cover</th>
                <th className="text-left px-2 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Billing</th>
                <th className="text-left px-4 py-2 font-medium">Price</th>
                <th className="text-left px-4 py-2 font-medium">Included</th>
                <th className="text-left px-4 py-2 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F4147]">
              {bundles.map(({ b, expanded }) => {
                const selected = selectedBundleSlugs.has(b.slug)
                return (
                <tr
                  key={b.slug}
                  className={["hover:bg-[#1E1F22] cursor-pointer", selected ? "bg-[#15201A]" : ""].join(" ")}
                  onClick={() => toggleBundle(b.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleBundle(b.slug) }}
                >
                  <td className="px-0 py-0 align-top">
                    <div className={["w-1 h-full", selected ? "bg-emerald-700/60" : "bg-transparent"].join(" ")} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="relative h-10 w-16 overflow-hidden rounded bg-[#232428]">
                      {b.bgImg ? (
                        <Image src={b.bgImg} alt={b.title} fill className={["object-cover", b.className || ''].join(' ')} />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2c31] to-[#141519]" />
                      )}
                      <div className="absolute inset-0 ring-1 ring-black/20" />
                    </div>
                  </td>
                  <td className="px-2 py-2 text-white">
                    <div className="font-medium leading-tight flex items-center gap-1.5">
                      {selected && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-900/40 ring-1 ring-emerald-700/30">
                          <Check className="h-3 w-3 text-emerald-300" />
                        </span>
                      )}
                      <span>{b.title}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {b.priceRange ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232428] border border-[#3F4147] text-[#C2C7CE]">
                          {b.priceRange}
                        </span>
                      ) : null}
                      {(b.tags || []).slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border border-[#3F4147] bg-[#181A1E] text-[#949BA4]">#{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-[#DBDEE1]">{b.billing || '—'}</td>
                  <td className="px-4 py-2 text-[#DBDEE1]">{b.priceRange || '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(expanded.services || []).slice(0, 3).map((s) => (
                        <span key={s.slug} className="text-[11px] px-1.5 py-0.5 rounded border border-[#3F4147] text-[#DBDEE1]">
                          {s.title}
                        </span>
                      ))}
                      {expanded.services.length > 3 && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded border border-dashed border-[#3F4147] text-[#949BA4]">
                          +{expanded.services.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {(b.tags || []).length ? (
                      <span className="inline-flex items-center rounded-full border border-[#3F4147] bg-[#232428] px-2 py-0.5 text-[11px] text-[#C2C7CE]">
                        {(b.tags || []).length} tags
                      </span>
                    ) : (
                      <span className="text-[#949BA4]">—</span>
                    )}
                  </td>
                </tr>
              )})}
              {bundles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-[#949BA4]">No bundles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Services */}
      <motion.section layout transition={{ duration: 0.2, ease: 'easeOut' }} className="mt-4 rounded-lg border border-[#3F4147] overflow-hidden">
        <div className="relative px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">All Services</h2>
          <div className="text-[11px] text-[#949BA4]">{services.length} total</div>
          {/* Overlay services action bar */}
          <AnimatePresence initial={false}>
            {selectedServicesCount > 0 && (
              <motion.div
                key="services-action-bar"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute inset-0 bg-[#15171A]/95 backdrop-blur flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#3F4147] bg-[#232428] px-2 py-0.5 text-[11px] text-[#C2C7CE]">
                    {selectedServicesCount} selected
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={selectAllServices} className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#121316] text-[12px] text-[#C2C7CE] hover:border-[#4b4e55]">Select all</button>
                  <button onClick={clearServices} className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] hover:border-[#4b4e55]">Clear</button>
                  <span className="mx-2 h-5 w-px bg-[#3F4147]" />
                  <button className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] hover:border-[#4b4e55]">Edit</button>
                  <button className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] hover:border-[#4b4e55]">Duplicate</button>
                  <button className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] hover:border-[#4b4e55]">Archive</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="overflow-x-auto bg-[#16171A]">
          <table className="w-full text-sm">
            <thead className="bg-[#1E1F22]/95 backdrop-blur sticky top-0 z-10 text-[#949BA4] border-b border-[#3F4147]">
              <tr>
                <th className="w-1 px-0 py-0" />
                <th className="text-left px-2 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Category</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Price</th>
                <th className="text-left px-4 py-2 font-medium">Tags</th>
                <th className="text-left px-4 py-2 font-medium">In Bundles</th>
                <th className="text-left px-4 py-2 font-medium">Updated</th>
                <th className="text-left px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F4147]">
              {services.map((s) => {
                const count = usage.get(s.slug) || 0
                const status = s.status || 'active'
                const updated = s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '—'
                const selected = selectedServiceSlugs.has(s.slug)
                return (
                  <tr
                    key={s.slug}
                    className={["hover:bg-[#1E1F22] cursor-pointer", selected ? "bg-[#15201A]" : ""].join(" ")}
                    onClick={() => toggleService(s.slug)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleService(s.slug) }}
                  >
                    <td className="px-0 py-0 align-top">
                      <div className={["w-1 h-full", selected ? "bg-emerald-700/60" : "bg-transparent"].join(" ")} />
                    </td>
                    <td className="px-2 py-2 text-white">
                      <div className="font-medium flex items-center gap-1.5">
                        {selected && (
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-900/40 ring-1 ring-emerald-700/30">
                            <Check className="h-3 w-3 text-emerald-300" />
                          </span>
                        )}
                        <span>{s.title}</span>
                      </div>
                      <div className="text-[11px] text-[#949BA4] font-mono">/{s.slug}</div>
                    </td>
                    <td className="px-4 py-2 text-[#DBDEE1]">{s.category || '—'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={[
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border',
                          status === 'active'
                            ? 'border-emerald-600/20 bg-emerald-900/20 text-emerald-300'
                            : status === 'draft'
                            ? 'border-yellow-600/20 bg-yellow-900/20 text-yellow-300'
                            : 'border-[#3F4147] bg-[#232428] text-[#C2C7CE]'
                        ].join(' ')}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#DBDEE1]">{s.priceRange || '—'}</td>
                    <td className="px-4 py-2">
                      {(s.tags || []).length ? (
                        <span className="inline-flex items-center rounded-full border border-[#3F4147] bg-[#232428] px-2 py-0.5 text-[11px] text-[#C2C7CE]">
                          {(s.tags || []).length} tags
                        </span>
                      ) : (
                        <span className="text-[#949BA4]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-[#DBDEE1]">{count}</td>
                    <td className="px-4 py-2 text-[#949BA4]">{updated}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <button disabled className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] cursor-not-allowed hover:border-[#4b4e55]">Edit</button>
                        <Link href={`/services/${s.slug}`} onClick={(e) => e.stopPropagation()} className="h-7 inline-flex items-center px-2 rounded-md border border-[#3F4147] bg-[#121316] text-[12px] text-emerald-300 hover:text-emerald-200">View</Link>
                        <button disabled className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] cursor-not-allowed hover:border-[#4b4e55]">Duplicate</button>
                        <button disabled className="h-7 px-2 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[12px] text-[#949BA4] cursor-not-allowed hover:border-[#4b4e55]">Archive</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {services.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-[#949BA4]">No services.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Footer links */}
      <div className="mt-4 flex items-center gap-2 text-[12px] text-[#949BA4]">
        <Link href="/services" className="underline decoration-dotted underline-offset-2">View public services page</Link>
        <span aria-hidden>•</span>
        <Link href="/services/faq" className="underline decoration-dotted underline-offset-2">FAQ & Pricing</Link>
      </div>
    </div>
  )
}
