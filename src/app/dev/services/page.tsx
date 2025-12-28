"use client"
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Check, Search, Plus, MoreHorizontal, Copy, Archive, Layers, Package, Link as LinkIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function DevServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [bundles, setBundles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Selection state
  const [selectedServiceSlugs, setSelectedServiceSlugs] = useState<Set<string>>(new Set())
  const [selectedBundleSlugs, setSelectedBundleSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchData() {
      const sb = createClient()
      
      const [
        { data: sData },
        { data: bData },
        { data: bsData }
      ] = await Promise.all([
        sb.from('crm_services').select('*').order('title'),
        sb.from('crm_bundles').select('*').order('title'),
        sb.from('crm_bundle_services').select('*')
      ])

      const servicesList = (sData || []).map(s => ({
        ...s,
        priceRange: s.price_range,
        updatedAt: s.updated_at,
        category: s.category || 'general'
      }))

      // Map join table to expand bundles
      const bundlesList = (bData || []).map(b => {
        const myServiceSlugs = (bsData || [])
          .filter((x: any) => x.bundle_slug === b.slug)
          .map((x: any) => x.service_slug)
        
        const myServices = servicesList.filter(s => myServiceSlugs.includes(s.slug))
        
        return {
          b: {
            ...b,
            priceRange: b.price_range,
            bgImg: b.bg_img,
            serviceSlugs: myServiceSlugs
          },
          expanded: {
            services: myServices
          }
        }
      })

      setServices(servicesList)
      setBundles(bundlesList)
      setLoading(false)
    }

    fetchData()
  }, [])

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
    for (const { b } of bundles) {
      for (const slug of (b.serviceSlugs || [])) {
        m.set(slug, (m.get(slug) || 0) + 1)
      }
    }
    return m
  }, [bundles])

  const linkedServices = services.filter((s) => (usage.get(s.slug) || 0) > 0)
  const unlinkedServices = services.length - linkedServices.length
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[]
  const selectedBundlesCount = selectedBundleSlugs.size
  const selectedServicesCount = selectedServiceSlugs.size

  const selectAllBundles = () => setSelectedBundleSlugs(new Set(bundles.map(({ b }) => b.slug)))
  const clearBundles = () => setSelectedBundleSlugs(new Set())
  const selectAllServices = () => setSelectedServiceSlugs(new Set(services.map((s) => s.slug)))
  const clearServices = () => setSelectedServiceSlugs(new Set())

  if (loading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-neutral-500">Loading catalog...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header / Toolbar */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Services & Bundles</h1>
            <p className="text-sm text-neutral-500">Manage service catalog and package configurations</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                disabled
                placeholder="Search services..."
                className="h-10 w-64 rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-neutral-900 disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-white"
              />
            </div>
            <button className="flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Service</span>
            </button>
          </div>
        </div>

        {/* Insights */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Services" value={services.length} icon={<Layers className="h-5 w-5 text-neutral-400" />} />
          <KpiCard title="Total Bundles" value={bundles.length} icon={<Package className="h-5 w-5 text-neutral-400" />} />
          <KpiCard title="Linked Services" value={linkedServices.length} icon={<LinkIcon className="h-5 w-5 text-emerald-500" />} />
          <KpiCard title="Unlinked Services" value={unlinkedServices} icon={<span className="flex size-2 rounded-full bg-amber-500" />} />
        </section>

        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button key={c} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800">
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Bundles */}
        <motion.section layout transition={{ duration: 0.2 }} className="mb-8 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Bundles</h2>
              <div className="text-xs text-neutral-500">{bundles.length} configurations</div>
            </div>
            
            {/* Overlay bundles action bar */}
            <AnimatePresence initial={false}>
              {selectedBundlesCount > 0 && (
                <motion.div
                  key="bundles-action-bar"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-10 flex items-center justify-between bg-white px-6 dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white">
                      {selectedBundlesCount} selected
                    </span>
                    <button onClick={selectAllBundles} className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Select all</button>
                    <button onClick={clearBundles} className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Clear</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
                    <button className="flex h-8 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"><Archive className="h-3.5 w-3.5" /> Archive</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="w-1 px-0 py-0" />
                  <th className="px-6 py-3 font-medium">Bundle</th>
                  <th className="px-6 py-3 font-medium">Billing</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Services</th>
                  <th className="px-6 py-3 font-medium text-right">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {bundles.map(({ b, expanded }) => {
                  const selected = selectedBundleSlugs.has(b.slug)
                  return (
                  <tr
                    key={b.slug}
                    className={`group cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${selected ? "bg-neutral-50 dark:bg-neutral-800/50" : ""}`}
                    onClick={() => toggleBundle(b.slug)}
                  >
                    <td className="px-0 py-0">
                      <div className={`h-full w-1 transition-colors ${selected ? "bg-blue-500" : "bg-transparent"}`} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-16 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                          {b.bgImg && <Image src={b.bgImg} alt={b.title} fill className="object-cover" />}
                          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-white">
                            {b.title}
                            {selected && <Check className="h-3.5 w-3.5 text-blue-500" />}
                          </div>
                          <div className="flex gap-1.5 mt-0.5">
                            {b.tags?.slice(0, 2).map((t: string) => (
                              <span key={t} className="inline-flex text-[10px] text-neutral-500">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{b.billing || '—'}</td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{b.priceRange || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(expanded.services || []).slice(0, 3).map((s: any) => (
                          <span key={s.slug} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            {s.title}
                          </span>
                        ))}
                        {expanded.services.length > 3 && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500 dark:bg-neutral-800">
                            +{expanded.services.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-xs text-neutral-400">{b.tags?.length || 0}</span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Services */}
        <motion.section layout transition={{ duration: 0.2 }} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">All Services</h2>
              <div className="text-xs text-neutral-500">{services.length} services</div>
            </div>
            
            <AnimatePresence initial={false}>
              {selectedServicesCount > 0 && (
                <motion.div
                  key="services-action-bar"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-10 flex items-center justify-between bg-white px-6 dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white">
                      {selectedServicesCount} selected
                    </span>
                    <button onClick={selectAllServices} className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Select all</button>
                    <button onClick={clearServices} className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Clear</button>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="flex h-8 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
                     <button className="flex h-8 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"><Archive className="h-3.5 w-3.5" /> Archive</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="w-1 px-0 py-0" />
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium text-right">In Bundles</th>
                  <th className="px-6 py-3 font-medium text-right">Updated</th>
                  <th className="px-6 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {services.map((s) => {
                  const count = usage.get(s.slug) || 0
                  const status = s.status || 'active'
                  const updated = s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '—'
                  const selected = selectedServiceSlugs.has(s.slug)
                  return (
                    <tr
                      key={s.slug}
                      className={`group cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${selected ? "bg-neutral-50 dark:bg-neutral-800/50" : ""}`}
                      onClick={() => toggleService(s.slug)}
                    >
                      <td className="px-0 py-0">
                        <div className={`h-full w-1 transition-colors ${selected ? "bg-blue-500" : "bg-transparent"}`} />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-white">
                            {s.title}
                            {selected && <Check className="h-3.5 w-3.5 text-blue-500" />}
                          </div>
                          <div className="font-mono text-xs text-neutral-400">/{s.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{s.category || '—'}</td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border capitalize
                           ${status === 'active' 
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' 
                             : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                           }`}
                         >
                           {status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{s.priceRange || '—'}</td>
                      <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">{count}</td>
                      <td className="px-6 py-4 text-right text-xs text-neutral-500">{updated}</td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/services/${s.slug}`} 
                          onClick={(e) => e.stopPropagation()} 
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-neutral-400 hover:bg-white hover:text-neutral-900 hover:shadow-sm dark:hover:bg-neutral-800 dark:hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Footer links */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-neutral-500">
          <Link href="/services" className="hover:text-neutral-900 dark:hover:text-white">Public Page</Link>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <Link href="/services/faq" className="hover:text-neutral-900 dark:hover:text-white">Pricing FAQ</Link>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, icon }: { title: string, value: string | number, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</span>
        {icon}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}