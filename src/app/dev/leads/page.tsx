"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LeadsCleanerClient from './LeadsCleanerClient';
import { 
  StatsCards, 
  EmptyState, 
  AdvancedFiltersMock, 
  SuggestionCard 
} from './MockComponents';
import { 
  Search, 
  Play, 
  Smartphone, 
  Save, 
  CheckSquare, 
  History, 
  Sparkles,
  MapPin,
  ExternalLink,
  Star,
  Loader2,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

type Lead = {
  google_place_id: string;
  name?: string;
  formatted_address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  niche?: string;
  location?: string;
};

export default function DevLeadsPage() {
  const [stats, setStats] = useState<null | {
    totals: { leads: number; withWebsite: number; withoutWebsite: number; leads24h: number };
    groups: { count: number; members: number };
    topGroups: { group_id: string; name: string; count: number }[];
  }>(null);
  // const [statsError, setStatsError] = useState<string | null>(null);
  const [rankedGroups, setRankedGroups] = useState<{ group_id: string; name: string; lead_count: number; score: number; breakdown: { zero: number; s1_20: number; s21_50: number; g50: number } }[] | null>(null);
  const [niches, setNiches] = useState('dentist');
  const [locations, setLocations] = useState('Spokane, WA');
  const [max, setMax] = useState(50);
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Lead[]>([]);
  const [upserted, setUpserted] = useState<number | null>(null);
  const [originalCount, setOriginalCount] = useState<number | null>(null);
  const [dedupedCount, setDedupedCount] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<{ niche: string; location: string; runs: number; last_searched_at?: string | null; sum_deduped: number; sum_saved: number; save_rate: number }[] | null>(null)
  const [suggestions, setSuggestions] = useState<{ niche: string; location: string; reason?: string }[] | null>(null)
  const [loadingSuggest, setLoadingSuggest] = useState(false)

  useEffect(() => {
    let alive = true;
    fetch('/api/dev/leads/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive) setStats(d); })
      .catch(() => { /* ignore stats error */ });
    fetch('/api/dev/groups/ranked', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive) setRankedGroups(Array.isArray(d.items) ? d.items : []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  async function refreshHistory() {
    try {
      const r = await fetch('/api/dev/leads/history', { cache: 'no-store' })
      const d = await r.json()
      setHistory(d.items || [])
    } catch {}
  }

  async function refreshSuggestions() {
    setLoadingSuggest(true)
    try {
      const res = await fetch('/api/dev/leads/suggest', { method: 'POST' })
      const data = await res.json()
      setSuggestions(Array.isArray(data.items) ? data.items : [])
    } finally {
      setLoadingSuggest(false)
    }
  }

  useEffect(() => { refreshHistory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  async function runSearch() {
    setLoading(true);
    setError(null);
    setResults([]);
    setUpserted(null);
    setSelected(new Set());
    try {
      const res = await fetch('/api/dev/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niches: niches.split(',').map((s) => s.trim()).filter(Boolean),
          locations: locations.split(',').map((s) => s.trim()).filter(Boolean),
          max,
          dryRun,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setOriginalCount(data.originalCount ?? null);
      setDedupedCount(data.dedupedCount ?? (Array.isArray(data.leads) ? data.leads.length : null));
      if (dryRun && Array.isArray(data.leads)) {
        setResults(data.leads);
      }
      if (!dryRun) setUpserted(data.count ?? 0);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
      // Keep history/suggestions fresh after each run
      refreshHistory();
      if (!dryRun) {
        // After saving to DB, refresh stats too
        try {
          const d = await fetch('/api/dev/leads/stats', { cache: 'no-store' }).then((r) => r.json())
          setStats(d)
        } catch {}
      }
      // Update suggestions opportunistically
      refreshSuggestions();
    }
  }

  function runQuick(niche: string, location: string) {
    setNiches(niche)
    setLocations(location)
    // Defer to next tick to ensure state is applied
    setTimeout(() => { void runSearch() }, 0)
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(results.map((r) => r.google_place_id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function saveSelected() {
    const toSave = results.filter((r) => selected.has(r.google_place_id))
    if (!toSave.length) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toSave }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) throw new Error(data?.error || 'Failed to save')
      setUpserted(data.count ?? 0)
      // Refresh aggregates after saving
      refreshHistory()
      try {
        const d = await fetch('/api/dev/leads/stats', { cache: 'no-store' }).then((r) => r.json())
        setStats(d)
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Failed to save selected')
    } finally {
      setSaving(false)
    }
  }

  async function saveAll() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: results }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) throw new Error(data?.error || 'Failed to save')
      setUpserted(data.count ?? 0)
      // Refresh aggregates after saving
      refreshHistory()
      try {
        const d = await fetch('/api/dev/leads/stats', { cache: 'no-store' }).then((r) => r.json())
        setStats(d)
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Failed to save all')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-neutral-50/50 dark:bg-neutral-950/50 min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Lead Generator
          </h1>
          <div className="flex items-center gap-4">
             <Link
              href="/dev/leads/swipe"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Swipe Mode
            </Link>
             <LeadsCleanerClient onBusyChange={setCleaning} />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        
        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Search Column */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Search Card */}
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold">New Search</h2>
                 <div className="flex items-center gap-2 text-xs">
                    <label htmlFor="dry" className="cursor-pointer select-none text-neutral-600 dark:text-neutral-400">Dry Run</label>
                    <button 
                      onClick={() => setDryRun(!dryRun)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${dryRun ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dryRun ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                 </div>
               </div>

               <div className="grid gap-5">
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-medium text-neutral-500 uppercase">Niche / Keywords</label>
                     <input
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={niches}
                        onChange={(e) => setNiches(e.target.value)}
                        placeholder="e.g. dentist, plumber, web design"
                      />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-medium text-neutral-500 uppercase">Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <input
                          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          value={locations}
                          onChange={(e) => setLocations(e.target.value)}
                          placeholder="e.g. Spokane, WA"
                        />
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex items-end gap-4">
                   <div className="space-y-1.5 w-32">
                     <label className="text-xs font-medium text-neutral-500 uppercase">Max Results</label>
                     <input
                        type="number"
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={max}
                        min={1}
                        max={120}
                        onChange={(e) => setMax(Number(e.target.value))}
                      />
                   </div>
                   <button
                      onClick={runSearch}
                      disabled={loading || cleaning}
                      className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[38px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Running Search...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-current" />
                          Start Generation
                        </>
                      )}
                    </button>
                 </div>
               </div>

               <AdvancedFiltersMock />
               
               {error && (
                 <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-start gap-2 text-sm text-red-600 dark:text-red-300">
                    <Trash2 className="h-4 w-4 mt-0.5 shrink-0" />
                    {error}
                 </div>
               )}
             </div>

             {/* Results Area */}
             {results.length > 0 ? (
               <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-sm">Results Found</h3>
                       <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-700">
                         {results.length}
                       </span>
                       {(originalCount !== null || dedupedCount !== null) && (
                         <span className="text-xs text-neutral-400">
                           {originalCount !== null && `(from ${originalCount} raw)`} 
                           {dedupedCount !== null && ` • ${dedupedCount} unique`}
                         </span>
                       )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={selected.size === results.length ? clearSelection : selectAll}
                        className="p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                        title="Toggle Select All"
                      >
                         {selected.size === results.length ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <CheckSquare className="h-4 w-4" />}
                      </button>
                      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
                      <button 
                        onClick={saveSelected} 
                        disabled={saving || selected.size === 0 || cleaning}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Save {selected.size > 0 ? `(${selected.size})` : ''}
                      </button>
                      <button 
                        onClick={saveAll} 
                        disabled={saving || results.length === 0 || cleaning}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium disabled:opacity-50 transition-colors"
                      >
                        Save All
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-16 z-10 backdrop-blur-sm">
                        <tr>
                          <th className="px-4 py-3 w-10">
                             <input
                              type="checkbox"
                              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                              checked={results.length > 0 && results.every((r) => selected.has(r.google_place_id))}
                              onChange={(e) => {
                                if (e.target.checked) selectAll()
                                else clearSelection()
                              }}
                            />
                          </th>
                          <th className="px-4 py-3 font-medium">Business Name</th>
                          <th className="px-4 py-3 font-medium">Contact</th>
                          <th className="px-4 py-3 font-medium text-center">Rating</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {results.map((r) => (
                          <tr key={r.google_place_id} className={`group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${selected.has(r.google_place_id) ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                checked={selected.has(r.google_place_id)}
                                onChange={(e) => toggleSelect(r.google_place_id, e.target.checked)}
                              />
                            </td>
                            <td className="px-4 py-3 max-w-[240px]">
                              <div className="font-medium text-neutral-900 dark:text-neutral-200 truncate" title={r.name}>
                                {r.name}
                              </div>
                              <div className="text-xs text-neutral-500 truncate mt-0.5 flex items-center gap-1" title={r.formatted_address}>
                                <MapPin className="h-3 w-3 shrink-0" />
                                {r.formatted_address}
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <div className="space-y-1">
                                {r.phone && <div className="text-xs truncate">{r.phone}</div>}
                                {r.website ? (
                                  <a href={r.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate">
                                    <ExternalLink className="h-3 w-3" />
                                    {new URL(r.website).hostname.replace(/^www\./, '')}
                                  </a>
                                ) : (
                                  <span className="text-xs text-neutral-400 italic">No website</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50">
                                <span className="font-semibold text-amber-600 dark:text-amber-500">{r.rating || '-'}</span>
                                <Star className="h-3 w-3 text-amber-400 fill-current" />
                              </div>
                              <div className="text-[10px] text-neutral-400 mt-1">{r.user_ratings_total || 0} reviews</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!dryRun && upserted !== null && (
                     <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-300 text-center border-t border-emerald-100 dark:border-emerald-800 font-medium">
                       Successfully upserted {upserted} leads into the database.
                     </div>
                  )}
               </div>
             ) : (
               <EmptyState />
             )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6 sticky top-24 self-start">
            
            <SuggestionCard 
              title="Recent Searches" 
              icon={History}
              items={(history || []).map((h) => ({
                niche: h.niche,
                location: h.location,
                meta: `${h.runs} runs • ${h.sum_saved} saved • ${(h.save_rate*100).toFixed(0)}%` + (h.last_searched_at ? ` • ${new Date(h.last_searched_at).toLocaleDateString()}` : ''),
              }))}
              onItemClick={(h: any) => runQuick(h.niche, h.location)}
              loading={!history}
              action={
                <button
                  onClick={refreshHistory}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Refresh
                </button>
              }
            />

            <SuggestionCard 
              title="Smart Suggestions" 
              icon={Sparkles}
              items={(suggestions || []).map((s) => ({ niche: s.niche, location: s.location, meta: s.reason }))}
              onItemClick={(s: any) => runQuick(s.niche, s.location)}
              loading={loadingSuggest}
              action={
                <button
                  onClick={refreshSuggestions}
                  disabled={loadingSuggest}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {loadingSuggest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Generate'}
                </button>
              }
            />

            {/* Quick Groups Link Mock */}
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Active Groups</h3>
                  <Link href="/dev/groups" className="text-xs text-blue-600 hover:underline">View All</Link>
                </div>
                <div className="space-y-2">
                   {rankedGroups?.slice(0, 5).map((g) => (
                      <Link key={g.group_id} href={`/dev/groups/${g.group_id}`} className="block">
                         <div className="flex items-center justify-between text-sm p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                           <span className="truncate max-w-[140px] font-medium text-neutral-700 dark:text-neutral-300">{g.name}</span>
                           <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500">{g.lead_count}</span>
                         </div>
                      </Link>
                   ))}
                   {(!rankedGroups || rankedGroups.length === 0) && (
                     <div className="text-xs text-neutral-500 italic">No groups found.</div>
                   )}
                </div>
             </div>

          </div>
        </div>
      </main>

      <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-neutral-400 text-center max-w-2xl mx-auto">
            Uses Google Places API. Please respect rate limits and terms of service. 
            Keys are configured in your environment variables.
          </p>
        </div>
      </footer>
    </div>
  );
}
