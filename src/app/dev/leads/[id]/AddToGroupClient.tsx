"use client";
import { useEffect, useState } from 'react';

export default function AddToGroupClient({ leadId, onAdded }: { leadId: string; onAdded?: () => void }) {
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dev/groups', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items)) setGroups(d.items);
      })
      .catch(() => {});
  }, []);

  async function add() {
    if (!groupId) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/dev/leads/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, filter_key: 'manual_add', decision: 'keep', group_id: groupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setMsg('Added to group');
      onAdded?.();
    } catch (e: any) {
      setMsg(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select className="rounded border px-2 py-1 text-sm" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
        <option value="">Select group…</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>
      <button onClick={add} disabled={!groupId || loading} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">{loading ? 'Adding…' : 'Add to group'}</button>
      {msg && <span className="text-xs text-neutral-500">{msg}</span>}
    </div>
  );
}

