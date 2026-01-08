import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Globe, 
  Globe2, 
  TrendingUp, 
  Search, 
  MapPin, 
  Settings2, 
  Filter, 
  Database
} from 'lucide-react';

export function StatsCards({ stats }: { stats: any }) {
  const totals = stats?.totals || {};
  const groups = stats?.groups || {};

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <Link href="/dev/leads/all" className="block group">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50 transition-all hover:border-blue-500/50 hover:shadow-md active:scale-[0.98]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Leads</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{totals.leads ?? '—'}</span>
            {totals.leads24h > 0 && (
               <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                 <TrendingUp className="h-3 w-3" /> +{totals.leads24h}
               </span>
            )}
          </div>
          <div className="mt-1 text-xs text-neutral-400">View all database records &rarr;</div>
        </div>
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">With Website</span>
          <Globe className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{totals.withWebsite ?? '—'}</span>
           <span className="text-xs text-neutral-500">
             {totals.leads ? Math.round((totals.withWebsite / Math.max(1, totals.leads)) * 100) : 0}% rate
           </span>
        </div>
        <div className="mt-1 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totals.leads ? (totals.withWebsite / totals.leads) * 100 : 0}%` }}></div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">No Website</span>
          <Globe2 className="h-4 w-4 text-orange-500" />
        </div>
        <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{totals.withoutWebsite ?? '—'}</span>
           <span className="text-xs text-neutral-500">
             {totals.leads ? Math.round((totals.withoutWebsite / Math.max(1, totals.leads)) * 100) : 0}% rate
           </span>
        </div>
         <div className="mt-1 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${totals.leads ? (totals.withoutWebsite / totals.leads) * 100 : 0}%` }}></div>
        </div>
      </div>

       <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Groups</span>
          <Database className="h-4 w-4 text-purple-500" />
        </div>
        <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{groups.count ?? '—'}</span>
           <span className="text-xs text-neutral-500">active</span>
        </div>
        <div className="mt-1 text-xs text-neutral-400">{groups.members ?? 0} total assignments</div>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/20">
      <div className="h-16 w-16 bg-white dark:bg-neutral-800 rounded-full shadow-sm flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No leads generated yet</h3>
      <p className="text-sm text-neutral-500 max-w-sm mt-2">
        Enter a niche and location above to start generating leads from Google Places. Results will appear here.
      </p>
    </div>
  );
}

export function AdvancedFiltersMock() {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer">
        <Filter className="h-3 w-3" />
        <span>Filters</span>
      </div>
      <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
      
      {['Has Website', 'Has Phone', 'Rating 4.0+', 'Verified Only'].map((f) => (
        <div key={f} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 transition-all cursor-pointer select-none">
          <div className="h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-600 group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors"></div>
          {f}
        </div>
      ))}
      <div className="ml-auto text-xs text-neutral-400 flex items-center gap-1">
        <Settings2 className="h-3 w-3" />
        <span>Advanced Config</span>
      </div>
    </div>
  );
}

export function SuggestionCard({ title, icon: Icon, items, onItemClick, action, loading }: any) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-100 dark:border-neutral-700">
             <Icon className="h-4 w-4 text-neutral-500" />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-y-auto max-h-[300px] custom-scrollbar">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 italic">
            {loading ? 'Loading...' : 'No items available'}
          </div>
        ) : (
          items.map((item: any, i: number) => (
            <button
              key={i}
              onClick={() => onItemClick(item)}
              className="w-full text-left p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm text-neutral-900 dark:text-neutral-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.niche}
                  </div>
                  <div className="text-xs text-neutral-500 truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {item.location}
                  </div>
                </div>
                {item.meta && (
                   <div className="shrink-0 text-right">
                      {item.meta}
                   </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
