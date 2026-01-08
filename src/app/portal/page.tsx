import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Layers, Rocket, MessageSquareText, Settings, ArrowRight } from 'lucide-react';

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login');

  // 1. Fetch Signups
  const { data: signups } = await supabase
    .from('project_signups')
    .select('*')
    .eq('contact_email', user.email || '')
    .order('created_at', { ascending: false });

  // 2. Fetch Active Projects
  // Get client_ids for user
  const { data: clientUsers } = await supabase
    .from('crm_client_users')
    .select('client_id')
    .eq('user_id', user.id);
  
  const clientIds = clientUsers?.map(cu => cu.client_id) || [];
  
  let projects: any[] = [];
  if (clientIds.length > 0) {
    const { data: activeProjects } = await supabase
        .from('crm_projects')
        .select('*')
        .in('client_id', clientIds)
        .order('updated_at', { ascending: false });
    projects = activeProjects || [];
  }

  return (
    <div className="p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Welcome Back</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your projects and requests from one place.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Signups / Requests */}
        <section className="bg-white dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                    <Rocket className="size-5 text-blue-600" />
                    Requests
                </h3>
                <span className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500">{signups?.length || 0}</span>
            </div>
            
            {signups && signups.length > 0 ? (
                <div className="space-y-3">
                    {signups.map(s => (
                        <div key={s.id} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-sm text-neutral-900 dark:text-white">{s.company_name}</div>
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${s.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700'}`}>
                                    {s.status}
                                </span>
                            </div>
                            <div className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{s.project_description || 'No description provided.'}</div>
                            <div className="text-[10px] text-neutral-400 mt-3 flex items-center gap-1">
                                <span>Submitted {new Date(s.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-neutral-500 py-8 text-center bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    No pending requests.
                </div>
            )}
            
            <Link href="/start-now" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
                Start New Project <ArrowRight className="size-3" />
            </Link>
        </section>

        {/* Active Projects */}
        <section className="bg-white dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm md:col-span-2 min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                    <Layers className="size-5 text-emerald-500" />
                    Active Workspaces
                </h3>
                <span className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500">{projects.length}</span>
            </div>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map(p => (
                        <Link key={p.id} href={`/portal/projects/${p.slug}`} className="block p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{p.title}</h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500 border border-neutral-100 dark:border-neutral-700">{p.status.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
                            <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Open Dashboard <ArrowRight className="size-3 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        <Layers className="size-8 text-neutral-400" />
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No active projects</h4>
                    <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
                        Once your request is approved and initialized by our team, your project dashboard will appear here.
                    </p>
                </div>
            )}
        </section>

      </div>
    </div>
  );
}