import Link from 'next/link'
import { getServices, getBundles, expandBundle } from '@/services'

export default function DevServicesPage() {
  const services = getServices()
  const bundles = getBundles().map((b) => ({ b, expanded: expandBundle(b, services) }))

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Services</h1>
          <p className="text-sm text-[#949BA4]">Catalog of services and bundles</p>
        </div>
        <div className="flex items-center gap-2">
          <input disabled placeholder="Search (mock)" className="h-9 w-56 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-white placeholder-[#6B7280]" />
          <button className="h-9 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 text-sm text-white opacity-60 cursor-not-allowed">New Service</button>
        </div>
      </div>

      {/* Bundles */}
      <section className="rounded-lg border border-[#3F4147] overflow-hidden">
        <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Bundles</h2>
          <div className="text-[11px] text-[#949BA4]">{bundles.length} total</div>
        </div>
        <div className="bg-[#16171A] divide-y divide-[#3F4147]">
          {bundles.map(({ b, expanded }) => (
            <div key={b.slug} className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-medium">{b.title}</div>
                  <div className="text-[12px] text-[#949BA4] mt-0.5">{b.summary}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#232428] border border-[#3F4147] text-[#949BA4]">{b.priceRange || '—'}</span>
                    {(expanded.services || []).map((s) => (
                      <span key={s.slug} className="text-[11px] px-1.5 py-0.5 rounded border border-[#3F4147] text-[#DBDEE1]">{s.title}</span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-[11px] text-[#949BA4]">{expanded.services.length} services</div>
              </div>
            </div>
          ))}
          {bundles.length === 0 && (
            <div className="px-4 py-6 text-center text-[#949BA4] text-sm">No bundles.</div>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="mt-4 rounded-lg border border-[#3F4147] overflow-hidden">
        <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">All Services</h2>
          <div className="text-[11px] text-[#949BA4]">{services.length} total</div>
        </div>
        <div className="overflow-x-auto bg-[#16171A]">
          <table className="w-full text-sm">
            <thead className="bg-[#1E1F22] text-[#949BA4]">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Category</th>
                <th className="text-left px-4 py-2 font-medium">Price</th>
                <th className="text-left px-4 py-2 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F4147]">
              {services.map((s) => (
                <tr key={s.slug} className="hover:bg-[#1E1F22]">
                  <td className="px-4 py-2 text-white">{s.title}</td>
                  <td className="px-4 py-2 text-[#DBDEE1]">{s.category || '—'}</td>
                  <td className="px-4 py-2 text-[#DBDEE1]">{s.priceRange || '—'}</td>
                  <td className="px-4 py-2 text-[#949BA4]">{(s.tags || []).join(', ') || '—'}</td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#949BA4]">No services.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

