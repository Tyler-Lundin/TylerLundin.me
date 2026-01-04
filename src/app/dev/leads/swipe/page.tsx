"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type Lead = {
  id: string;
  name?: string;
  website?: string | null;
  formatted_address?: string | null;
  phone?: string | null;
  rating?: number | null;
  user_ratings_total?: number | null;
  google_maps_url?: string | null;
};

type Group = { id: string; name: string };

export default function SwipePage() {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string | ''>('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [groupCount, setGroupCount] = useState<number>(0);
  const [groupItems, setGroupItems] = useState<any[]>([]);
  const [showGroup, setShowGroup] = useState<boolean>(false);
  const [countBump, setCountBump] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [groupOffset, setGroupOffset] = useState<number>(0);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/dev/groups', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.items)) setGroups(data.items);
    } catch {}
  }, []);

  const fetchGroupMembers = useCallback(async (gid: string) => {
    if (!gid) { setGroupCount(0); setGroupItems([]); return; }
    try {
      const res = await fetch(`/api/dev/groups/${gid}/members?limit=10`, { cache: 'no-store' });
      const data = await res.json();
      if (typeof data.total === 'number') setGroupCount(data.total);
      if (Array.isArray(data.items)) setGroupItems(data.items);
    } catch {}
  }, []);

  const fetchNext = useCallback(async () => {
    setLoading(true);
    setLoadingNext(true);
    setError(null);
    try {
      if (groupId) {
        // Pull members from selected group, advancing offset until we find one with a website
        let found: any | null = null;
        let nextOffset = groupOffset;
        const limit = 10;
        for (let attempts = 0; attempts < 10 && !found; attempts++) {
          const res = await fetch(`/api/dev/groups/${groupId}/members?limit=${limit}&offset=${nextOffset}`, { cache: 'no-store' });
          const data = await res.json();
          const items = Array.isArray(data.items) ? data.items : [];
          const withSite = items.find((m: any) => !!m?.leads?.website);
          if (withSite) {
            found = {
              id: withSite?.leads?.id,
              name: withSite?.leads?.name,
              website: withSite?.leads?.website,
              formatted_address: withSite?.leads?.formatted_address,
              phone: withSite?.leads?.phone,
              rating: withSite?.leads?.rating,
              user_ratings_total: withSite?.leads?.user_ratings_total,
              google_maps_url: withSite?.leads?.google_maps_url,
            } as Lead;
            // Advance offset
            nextOffset = nextOffset + 1;
          } else if (items.length < limit) {
            // End reached
            break;
          } else {
            nextOffset += limit;
          }
        }
        setGroupOffset(nextOffset);
        setLead(found);
        if (!found) setError('No more leads with websites in this group.');
      } else {
        const res = await fetch('/api/dev/leads/queue?filter=website_swipe&limit=1', { cache: 'no-store' });
        const data = await res.json();
        const item = Array.isArray(data.items) && data.items.length > 0 ? data.items[0] : null;
        setLead(item);
        if (!item) setError('No more leads to review (with websites).');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch queue');
    } finally {
      setLoading(false);
      setLoadingNext(false);
    }
  }, [groupId, groupOffset]);

  useEffect(() => {
    // Seed group from URL (?group=...)
    try {
      const u = new URL(window.location.href);
      const g = u.searchParams.get('group');
      if (g) setGroupId(g);
    } catch {}
    fetchGroups();
    // Call once on mount; group change effect will run another fetchNext if needed
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (groupId) {
      setGroupOffset(0);
      fetchGroupMembers(groupId);
    } else {
      setGroupCount(0);
      setGroupItems([]);
    }
    fetchNext();
    // Trigger a new candidate when group changes
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const decide = useCallback(
    async (decision: 'keep' | 'reject' | 'skip') => {
      if (!lead) return;
      // Immediately blank the iframe and block input while loading next
      try { if (iframeRef.current) iframeRef.current.src = 'about:blank'; } catch {}
      setLoadingNext(true);
      try {
        await fetch('/api/dev/leads/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: lead.id,
            filter_key: 'website_swipe',
            decision,
            reason: decision === 'keep' && !lead.website ? 'no website' : undefined,
            group_id: decision === 'keep' && groupId ? groupId : undefined,
          }),
        });
        if (decision === 'keep' && groupId) {
          // Optimistic UI: bump count and prepend to group list
          setGroupCount((c) => c + 1);
          setCountBump(true);
          setTimeout(() => setCountBump(false), 500);
          setGroupItems((items) => [
            { lead_id: lead.id, added_at: new Date().toISOString(), leads: { id: lead.id, name: lead.name, website: lead.website, formatted_address: lead.formatted_address, phone: lead.phone, rating: lead.rating, user_ratings_total: lead.user_ratings_total, google_maps_url: lead.google_maps_url } },
            ...items
          ].slice(0, 10));
        }
      } catch {}
      await fetchNext();
      if (decision === 'keep' && groupId) fetchGroupMembers(groupId);
    },
    [lead, groupId, fetchNext, fetchGroupMembers]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (loadingNext) return; // block keys while loading next
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        decide('reject');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        decide('keep');
      } else if (e.key === ' ') {
        e.preventDefault();
        decide('skip');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide, loadingNext]);

  const proxyUrl = useMemo(() => {
    if (!lead?.website) return null;
    try {
      const u = new URL(lead.website);
      if (!u.protocol.startsWith('http')) return null;
      const ua = view === 'mobile' ? 'mobile' : 'desktop';
      return `/api/dev/leads/proxy?ua=${ua}&url=${encodeURIComponent(lead.website)}`;
    } catch {
      return null;
    }
  }, [lead, view]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    try {
      const res = await fetch('/api/dev/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      const data = await res.json();
      if (data?.item?.id) {
        await fetchGroups();
        setGroupId(data.item.id);
        setNewGroupName('');
      }
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-semibold mb-4">Website Swipe</h1>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600 dark:text-neutral-400">Group:</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">(none)</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {groupId && (
            <button
              onClick={() => setShowGroup((v) => !v)}
              className="rounded border px-2 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {showGroup ? 'Hide' : 'Show'} group
            </button>
          )}
          {groupId && (
            <span className={`ml-1 inline-flex items-center gap-1 text-xs font-medium ${countBump ? 'scale-110 transition-transform' : ''}`}>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {groupCount}
            </span>
          )}
          <div className="flex items-center gap-2">
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name"
              className="rounded border px-2 py-1 text-sm"
            />
            <button
              onClick={createGroup}
              disabled={creatingGroup || !newGroupName.trim()}
              className="rounded bg-black text-white px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
            View:
            <div className="ml-2 inline-flex rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden">
              <button
                className={`px-3 py-1 ${view==='desktop' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-700 dark:text-neutral-300'}`}
                onClick={() => setView('desktop')}
                disabled={view==='desktop'}
              >Desktop</button>
              <button
                className={`px-3 py-1 ${view==='mobile' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-700 dark:text-neutral-300'}`}
                onClick={() => setView('mobile')}
                disabled={view==='mobile'}
              >Mobile</button>
            </div>
          </div>
          <span>Shortcuts:</span>
          <kbd className="rounded border px-1">←</kbd> reject
          <kbd className="rounded border px-1">→</kbd> keep
          <kbd className="rounded border px-1">Space</kbd> skip
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info card */}
        <div className="lg:col-span-1 rounded-lg border p-4 bg-white dark:bg-neutral-950 dark:border-neutral-800">
          {loading && <p className="text-sm text-neutral-500">Loading…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {lead && (
            <div className="space-y-2">
              <div className="text-lg font-medium">{lead.name || '—'}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">{lead.formatted_address || '—'}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">{lead.phone || '—'}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Rating: {lead.rating ?? '—'} ({lead.user_ratings_total ?? 0})
              </div>
              <div className="text-sm">
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {lead.website}
                  </a>
                ) : (
                  <span className="text-neutral-500">No website</span>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => decide('reject')}
                  className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Reject
                </button>
                <button
                  onClick={() => decide('skip')}
                  className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Skip
                </button>
                <button
                  onClick={() => decide('keep')}
                  className="rounded bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-500"
                >
                  Keep
                </button>
              </div>
              <div className="pt-1 text-xs text-neutral-500">
                If no website, Keep is auto-labeled "no website".
              </div>
              {lead.google_maps_url && (
                <div className="pt-2">
                  <Link href={lead.google_maps_url} target="_blank" className="text-xs text-blue-600 underline">
                    Open in Google Maps
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Website viewer */}
        <div className="lg:col-span-2 rounded-lg border overflow-hidden bg-white dark:bg-neutral-950 dark:border-neutral-800 min-h-[60vh] relative">
          {/* Loading overlay */}
          {loadingNext && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-white/70 dark:bg-black/60">
              <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-200">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                Loading next…
              </div>
            </div>
          )}

          {proxyUrl ? (
            <div className="w-full h-[70vh] grid place-items-center">
              <div className={view==='mobile' ? 'w-[390px] h-full border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-md' : 'w-full h-full'}>
                <iframe
                  ref={iframeRef}
                  src={proxyUrl}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="h-[70vh] grid place-items-center text-sm text-neutral-600 dark:text-neutral-400">
              {lead?.website ? (
                <div>
                  <p className="mb-2">Cannot preview this URL. Open directly:</p>
                  <a className="text-blue-600 underline" href={lead.website} target="_blank" rel="noreferrer">
                    {lead.website}
                  </a>
                </div>
              ) : (
                <div>No website found for this lead.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {showGroup && groupId && (
        <div className="mt-4 rounded-lg border bg-white dark:bg-neutral-950 dark:border-neutral-800">
          <div className="px-4 py-2 text-sm font-medium flex items-center justify-between">
            <span>
              Group preview — {groups.find(g => g.id === groupId)?.name || 'Selected'} ({groupCount})
            </span>
            <a
              href={`/dev/groups/${groupId}`}
              className="text-xs text-blue-600 underline"
            >
              Open group
            </a>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {groupItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-500">No items yet.</div>
            ) : (
              groupItems.map((m) => (
                <div key={m.lead_id} className="px-4 py-3 text-sm flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.leads?.name || '—'}</div>
                    <div className="text-xs text-neutral-500 truncate">
                      {m.leads?.website ? <a href={m.leads.website} target="_blank" className="text-blue-600 underline">{m.leads.website}</a> : '—'}
                    </div>
                  </div>
                  <div className="ml-4 text-xs text-neutral-500">{new Date(m.added_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
