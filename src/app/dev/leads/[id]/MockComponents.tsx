import React from 'react';

export function LeadNotes() {
  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-neutral-950 dark:border-neutral-800 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Internal Notes</h3>
        <button className="text-xs text-blue-600 hover:underline">Add Note</button>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded text-sm text-neutral-600 dark:text-neutral-400">
          <p>Called and left a voicemail. Seemed interested in the initial email outreach.</p>
          <div className="mt-2 text-xs text-neutral-400">Tyler • 2 days ago</div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded text-sm text-neutral-600 dark:text-neutral-400">
          <p>Initial automated scrape completed. High potential based on location.</p>
          <div className="mt-2 text-xs text-neutral-400">System • 1 week ago</div>
        </div>
      </div>
      <div className="mt-3">
        <input 
          type="text" 
          placeholder="Type a note..." 
          className="w-full text-sm rounded border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
    </div>
  );
}

export function LeadActivity() {
  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-neutral-950 dark:border-neutral-800">
      <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
      <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-2 space-y-6">
        <div className="relative pl-6">
          <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-neutral-950"></div>
          <p className="text-sm font-medium">Lead viewed swipe interface</p>
          <p className="text-xs text-neutral-500">Today at 10:23 AM</p>
        </div>
        <div className="relative pl-6">
          <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-neutral-950"></div>
          <p className="text-sm font-medium">Status changed to &quot;Contacted&quot;</p>
          <p className="text-xs text-neutral-500">Yesterday at 4:00 PM</p>
        </div>
        <div className="relative pl-6">
          <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-700 ring-4 ring-white dark:ring-neutral-950"></div>
          <p className="text-sm font-medium">Lead Created via Import</p>
          <p className="text-xs text-neutral-500">Jan 12, 2025</p>
        </div>
      </div>
    </div>
  );
}

export function LeadAIInsights() {
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:bg-purple-900/10 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
        <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Insights</h3>
      </div>
      <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
        <p>
          This lead matches your &quot;High Value&quot; criteria due to 4.8+ rating and established web presence.
        </p>
        <p>
          <strong>Suggested Action:</strong> Send &quot;Portfolio Showcase&quot; email template.
        </p>
      </div>
      <button className="mt-3 w-full rounded bg-white dark:bg-purple-900 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-100 shadow-sm border border-purple-100 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-800 transition-colors">
        Generate Strategy
      </button>
    </div>
  );
}
