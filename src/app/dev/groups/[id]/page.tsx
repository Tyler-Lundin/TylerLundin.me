import { getAdminClient } from '@/lib/leadgen/supabaseServer';
import Link from 'next/link';
import GroupMembersClient from './GroupMembersClient';
import GroupHeaderActions from './GroupHeaderActions';
import { GroupStats, GroupAutomation } from './MockComponents';
import { 
  ArrowLeft, 
  Layers, 
  Settings, 
  Users, 
  Info,
  ExternalLink
} from 'lucide-react';

async function fetchGroup(id: string) {
  const supa = getAdminClient();
  if (!supa) return { group: null, total: 0 };
  const [{ data: group }, { count }] = await Promise.all([
    supa.from('lead_groups').select('*').eq('id', id).maybeSingle(),
    supa.from('lead_group_members').select('lead_id', { count: 'exact', head: true }).eq('group_id', id),
  ]);
  return { group, total: count || 0 } as { group: any; total: number };
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { group, total } = await fetchGroup(id);

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Group not found</h1>
        <Link href="/dev/leads" className="flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 pb-20">
      
      {/* Top Navigation Bar */}
      <div className="border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dev/leads" className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Groups</span>
            </Link>
            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700"></div>
            <div className="flex items-center gap-2">
               <Layers className="h-4 w-4 text-neutral-400" />
               <h1 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px] sm:max-w-none">
                 {group.name}
               </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <GroupHeaderActions group={{ id, name: group.name, description: group.description }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
             <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] uppercase font-bold tracking-wider border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                Lead Group
             </span>
             <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                {total} Members
             </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2">{group.name}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-neutral-400" />
            {group.description || 'Manage and organize your leads within this specialized collection.'}
          </p>
        </div>

        <GroupStats total={total} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Column: Members List */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                   <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-neutral-400" />
                      Group Members
                   </h3>
                   <div className="text-[10px] text-neutral-400 font-medium uppercase">
                      Last update: {new Date().toLocaleDateString()}
                   </div>
                </div>
                <GroupMembersClient groupId={id} />
             </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <GroupAutomation />
             
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                   <Settings className="h-4 w-4 text-neutral-400" />
                   Group Properties
                </h3>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Internal ID</label>
                      <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 truncate">{id}</div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Created At</label>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">{new Date(group.created_at || Date.now()).toLocaleString()}</div>
                   </div>
                   <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <Link 
                        href={`/dev/leads/swipe?group=${encodeURIComponent(id)}`}
                        className="flex items-center justify-between text-xs font-medium text-neutral-600 hover:text-blue-600 transition-colors group"
                      >
                        <span>Swipe leads in this group</span>
                        <ExternalLink className="h-3 w-3 text-neutral-400 group-hover:text-blue-500" />
                      </Link>
                   </div>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
