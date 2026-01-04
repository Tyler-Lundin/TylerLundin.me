import React from 'react';
import { 
  Users, 
  Target, 
  Zap, 
  FileDown, 
  Mail, 
  Settings,
  Search,
  TrendingUp,
  Star
} from 'lucide-react';

export function GroupStats({ total }: { total: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Group Size</span>
          <Users className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{total}</span>
          <span className="text-xs text-neutral-400">leads</span>
        </div>
        <div className="mt-1 text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">Capacity: 85% full</div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Avg Rating</span>
          <Star className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">4.2</span>
          <span className="text-xs text-neutral-500">/ 5.0</span>
        </div>
        <div className="mt-1 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: '84%' }}></div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact Rate</span>
          <Mail className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">12%</span>
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> +2%
          </span>
        </div>
        <div className="mt-1 text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">Target: 20%</div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Potential MRR</span>
          <Target className="h-4 w-4 text-purple-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">$4.5k</span>
          <span className="text-xs text-neutral-500">est.</span>
        </div>
        <div className="mt-1 text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">Based on niche avg</div>
      </div>
    </div>
  );
}

export function GroupAutomation() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2 bg-neutral-50/50 dark:bg-neutral-900/50">
        <Zap className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold">Group Automation</h3>
      </div>
      <div className="p-4 space-y-3">
        <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md group-hover:bg-blue-100 transition-colors">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-semibold">Cold Email Sequence</div>
              <div className="text-[10px] text-neutral-500">Schedule multi-step outreach</div>
            </div>
          </div>
          <Settings className="h-3.5 w-3.5 text-neutral-400" />
        </button>

        <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md group-hover:bg-purple-100 transition-colors">
              <Search className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-semibold">AI Enrichment</div>
              <div className="text-[10px] text-neutral-500">Scrape additional contact info</div>
            </div>
          </div>
          <Settings className="h-3.5 w-3.5 text-neutral-400" />
        </button>

        <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md group-hover:bg-emerald-100 transition-colors">
              <FileDown className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-semibold">Bulk Export</div>
              <div className="text-[10px] text-neutral-500">JSON / CSV with SEO metadata</div>
            </div>
          </div>
          <Settings className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      </div>
    </div>
  );
}

export function EmptyGroupState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/20">
      <div className="h-16 w-16 bg-white dark:bg-neutral-800 rounded-full shadow-sm flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No members in this group</h3>
      <p className="text-sm text-neutral-500 max-w-sm mt-2">
        Add leads to this group from the Lead Generator to start managing them here.
      </p>
    </div>
  );
}
