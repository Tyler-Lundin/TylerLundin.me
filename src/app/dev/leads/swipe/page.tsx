"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Smartphone, 
  Monitor, 
  Check, 
  X, 
  SkipForward, 
  MapPin, 
  Star, 
  ExternalLink, 
  ChevronRight, 
  Loader2,
  Keyboard,
  Info,
  Layers,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [groupCount, setGroupCount] = useState<number>(0);
  const [groupItems, setGroupItems] = useState<{ lead_id: string; added_at: string; leads: Lead }[]>([]);
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
        let found: Lead | null = null;
        let nextOffset = groupOffset;
        const limit = 10;
        for (let attempts = 0; attempts < 10 && !found; attempts++) {
          const res = await fetch(`/api/dev/groups/${groupId}/members?limit=${limit}&offset=${nextOffset}`, { cache: 'no-store' });
          const data = await res.json();
          const items = Array.isArray(data.items) ? data.items : [];
          const withSite = items.find((m: { leads: Lead }) => !!m?.leads?.website);
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
            };
            nextOffset = nextOffset + 1;
          } else if (items.length < limit) {
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
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch queue';
      setError(message);
    } finally {
      setLoading(false);
      setLoadingNext(false);
    }
  }, [groupId, groupOffset]);

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const g = u.searchParams.get('group');
      if (g) setGroupId(g);
    } catch {}
    fetchGroups();
    fetchNext();
  }, [fetchGroups, fetchNext]);

  useEffect(() => {
    if (groupId) {
      setGroupOffset(0);
      fetchGroupMembers(groupId);
    } else {
      setGroupCount(0);
      setGroupItems([]);
    }
    fetchNext();
  }, [groupId, fetchGroupMembers, fetchNext]);

  const decide = useCallback(
    async (decision: 'keep' | 'reject' | 'skip') => {
      if (!lead) return;
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
      if (loadingNext) return;
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
        setShowCreateGroup(false);
      }
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 flex flex-col">
      {/* Top Navigation */}
      <div className="border-b bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dev/leads" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ChevronLeft className="size-5 text-neutral-500" />
            </Link>
            <h1 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-neutral-400">
              <Smartphone className="size-4 text-blue-600" />
              Swipe Review
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Group Control */}
            <div className="hidden md:flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-inner">
              <div className="flex items-center gap-2 px-2 text-xs font-bold text-neutral-500 uppercase tracking-tight">
                <Layers className="size-3.5" /> Group:
              </div>
              <select
                className="bg-white dark:bg-neutral-900 rounded-lg border-0 px-3 py-1.5 text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">Queue (All)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              
              <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />
              
              <button
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  showCreateGroup ? "bg-white dark:bg-neutral-900 text-blue-600 shadow-sm" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
                title="Create New Group"
              >
                <Plus className="size-4" />
              </button>

              <button
                onClick={() => setShowGroup(!showGroup)}
                className={cn(
                  "p-1.5 rounded-lg transition-all relative",
                  showGroup ? "bg-blue-600 text-white shadow-lg" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
                title="Toggle Group Preview"
              >
                <Info className="size-4" />
                {groupId && (
                  <span className={cn(
                    "absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[8px] font-black text-white transition-transform",
                    countBump && "scale-125"
                  )}>
                    {groupCount}
                  </span>
                )}
              </button>
            </div>

            <div className="h-6 w-px bg-neutral-200 dark:border-neutral-800 hidden sm:block mx-2" />

            {/* View Toggles */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  view === 'desktop' ? "bg-white dark:bg-neutral-900 text-blue-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                )}
                onClick={() => setView('desktop')}
              >
                <Monitor className="size-4" />
              </button>
              <button
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  view === 'mobile' ? "bg-white dark:bg-neutral-900 text-blue-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                )}
                onClick={() => setView('mobile')}
              >
                <Smartphone className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Create Group Dropdown */}
        <AnimatePresence>
          {showCreateGroup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-3">
                <input
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter new group name..."
                  className="flex-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && createGroup()}
                />
                <button
                  onClick={createGroup}
                  disabled={creatingGroup || !newGroupName.trim()}
                  className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {creatingGroup ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Create Group
                </button>
                <button onClick={() => setShowCreateGroup(false)} className="p-2 text-neutral-400 hover:text-neutral-600">
                  <X className="size-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Left: Info & Decision (1/3) */}
        <div className="w-full lg:w-[400px] flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 relative z-20 overflow-y-auto">
          <div className="flex-1 p-6 space-y-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-neutral-400"
                >
                  <Loader2 className="size-8 animate-spin mb-4" />
                  <p className="text-sm font-medium">Fetching next lead...</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-center"
                >
                  <Info className="size-8 text-rose-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                  <button onClick={fetchNext} className="mt-4 text-xs font-bold uppercase text-rose-600 dark:text-rose-400 underline">Retry</button>
                </motion.div>
              ) : lead ? (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight tracking-tight">
                      {lead.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{lead.rating || '-'}</span>
                        <Star className="size-3 text-amber-400 fill-current" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                        {lead.user_ratings_total || 0} reviews
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <MapPin className="size-4 text-neutral-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {lead.formatted_address || 'Address hidden'}
                      </p>
                    </div>
                    {lead.phone && (
                      <div className="flex gap-3">
                        <Smartphone className="size-4 text-neutral-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{lead.phone}</p>
                      </div>
                    )}
                    {lead.website && (
                      <div className="flex gap-3">
                        <ExternalLink className="size-4 text-neutral-400 shrink-0 mt-0.5" />
                        <a href={lead.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline break-all">
                          {lead.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Keyboard Guide */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
                      <Keyboard className="size-3" /> Shortcuts
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-center">
                        <kbd className="text-xs font-black text-neutral-600 dark:text-neutral-300">←</kbd>
                        <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Reject</p>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-center">
                        <kbd className="text-xs font-black text-neutral-600 dark:text-neutral-300">SPACE</kbd>
                        <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Skip</p>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-center">
                        <kbd className="text-xs font-black text-neutral-600 dark:text-neutral-300">→</kbd>
                        <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Keep</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Action Buttons Footer */}
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => decide('reject')}
                disabled={loadingNext || !lead}
                className="flex-1 h-14 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:border-rose-500 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
              >
                <X className="size-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-black uppercase tracking-wider">Reject</span>
              </button>
              <button
                onClick={() => decide('keep')}
                disabled={loadingNext || !lead}
                className="flex-[1.5] h-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
              >
                <Check className="size-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-black uppercase tracking-wider">Keep Lead</span>
              </button>
            </div>
            <button
              onClick={() => decide('skip')}
              disabled={loadingNext || !lead}
              className="w-full h-10 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <SkipForward className="size-3.5" /> Skip for now
            </button>
          </div>
        </div>

        {/* Right: Iframe Viewer (2/3) */}
        <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 relative overflow-hidden flex items-center justify-center p-4 lg:p-8">
          {/* Loading Overlays */}
          <AnimatePresence>
            {loadingNext && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 grid place-items-center bg-white/60 dark:bg-black/60 backdrop-blur-[2px]"
              >
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center gap-4">
                  <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Loader2 className="size-6 text-blue-600 animate-spin" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400">Loading Content</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {proxyUrl ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "relative transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800",
                view === 'mobile' ? "w-[390px] h-full" : "w-full h-full"
              )}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 z-10 opacity-50" />
              <iframe
                ref={iframeRef}
                src={proxyUrl}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="w-full h-full"
              />
            </motion.div>
          ) : (
            <div className="text-center max-w-sm px-6">
              <div className="size-20 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                <Monitor className="size-10 text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Preview Available</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                We couldn&apos;t generate a secure preview for this website. You can still review the lead info or open it directly.
              </p>
              {lead?.website && (
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
                >
                  Open Website <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          )}

          {/* Group Preview Overlay */}
          <AnimatePresence>
            {showGroup && groupId && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="absolute bottom-8 right-8 w-80 max-h-[400px] flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-40"
              >
                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Recently Saved</span>
                  </div>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{groupCount}</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                  {groupItems.map((m) => (
                    <div key={m.lead_id} className="p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-200 truncate">{m.leads?.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 truncate">{m.leads?.website || 'No site'}</div>
                    </div>
                  ))}
                  {groupItems.length === 0 && (
                    <div className="p-8 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No items saved yet</div>
                  )}
                </div>
                <Link href={`/dev/groups/${groupId}`} className="p-3 text-center text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                  View Full Group <ChevronRight className="size-3 inline ml-1" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}