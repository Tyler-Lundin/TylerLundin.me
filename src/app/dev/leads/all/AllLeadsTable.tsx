"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, ExternalLink, Star, MoreHorizontal, Trash2, Globe, Phone, History } from 'lucide-react'

interface Lead {
  id: string
  name: string | null
  formatted_address?: string | null
  website?: string | null
  domain?: string | null
  phone?: string | null
  rating?: number | null
  user_ratings_total?: number | null
  created_at: string
  niche: string | null
}

export default function AllLeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [menu, setMenu] = useState<{ x: number, y: number, leadId: string, leadName: string | null } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, lead: Lead) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, leadId: lead.id, leadName: lead.name })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    const res = await fetch(`/api/dev/leads/${id}`, { method: 'DELETE' })
    if (res.ok) window.location.reload()
  }

  useEffect(() => {
    const handleClick = () => setMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
          <tr>
            <th className="px-6 py-4 font-medium">Business</th>
            <th className="px-6 py-4 font-medium">Niche</th>
            <th className="px-6 py-4 font-medium">Contact</th>
            <th className="px-6 py-4 font-medium text-center">Rating</th>
            <th className="px-6 py-4 font-medium text-right">Added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {initialLeads.map((l) => (
            <tr 
              key={l.id} 
              className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-context-menu"
              onContextMenu={(e) => handleContextMenu(e, l)}
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <Link 
                    href={`/dev/leads/${l.id}`}
                    className="font-bold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {l.name || 'Unknown Business'}
                  </Link>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5 truncate max-w-[200px]">
                    <MapPin className="size-3" />
                    {l.formatted_address}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  {l.niche}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {l.website ? (
                    <a href={l.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                      <Globe className="size-3" />
                      <span className="truncate max-w-[120px]">{l.domain || 'Website'}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-neutral-400 italic">No website</span>
                  )}
                  {l.phone && (
                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
                      <Phone className="size-3" />
                      {l.phone}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="inline-flex flex-col items-center">
                  <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500">
                    {l.rating || '—'}
                    <Star className="size-3 fill-current" />
                  </div>
                  <span className="text-[10px] text-neutral-400">{l.user_ratings_total || 0} revs</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex flex-col items-end">
                  <div className="text-[11px] font-medium text-neutral-900 dark:text-white">
                    {new Date(l.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase">
                    {new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </td>
            </tr>
          ))}
          {initialLeads.length === 0 && (
            <tr>
              <td colSpan={5} className="p-12 text-center text-neutral-500">
                No leads found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Context Menu */}
      {menu && (
        <div 
          className="fixed z-[1000] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">{menu.leadName}</div>
          </div>
          <Link 
            href={`/dev/leads/${menu.leadId}`}
            className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <History className="size-4 text-neutral-400" />
            View Details
          </Link>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
            onClick={() => handleDelete(menu.leadId)}
          >
            <Trash2 className="size-4" />
            Delete Lead
          </button>
        </div>
      )}
    </div>
  )
}
