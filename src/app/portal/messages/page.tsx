import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MessageSquareText, Inbox, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function PortalMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login');

  // Fetch Projects for this user
  // First get client_ids the user is a member of
  const { data: clientUsers } = await supabase
    .from('crm_client_users')
    .select('client_id')
    .eq('user_id', user.id);
  
  const clientIds = clientUsers?.map(cu => cu.client_id) || [];
  
  let projects: any[] = [];
  if (clientIds.length > 0) {
    const { data: activeProjects } = await supabase
        .from('crm_projects')
        .select('id, title, description, slug, status, updated_at')
        .in('client_id', clientIds)
        .order('updated_at', { ascending: false });
    projects = activeProjects || [];
  }

  // Fetch Signups
  const { data: signups } = await supabase
    .from('project_signups')
    .select('*')
    .eq('contact_email', user.email || '')
    .order('created_at', { ascending: false });

  const hasItems = projects.length > 0 || (signups && signups.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Messages</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Direct communication with Tyler and the team.</p>
      </header>

      {hasItems ? (
        <div className="grid grid-cols-1 gap-4">
          {projects.map(p => (
            <Link 
              key={p.id} 
              href={`/portal/projects/${p.slug}`} 
              className="group flex items-center justify-between p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:ring-2 hover:ring-blue-500/20 hover:border-blue-500 transition-all"
            >
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MessageSquareText className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{p.title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">Chat regarding this workspace</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Status</div>
                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300 capitalize">{p.status.replace('_', ' ')}</div>
                  </div>
                  <div className="p-2 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="size-5" />
                  </div>
               </div>
            </Link>
          ))}

          {signups?.map(s => (
            <div key={s.id} className="flex items-center justify-between p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm opacity-80">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                    <MessageSquareText className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{s.company_name}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">Pending request — chat will be enabled soon</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    {s.status}
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                <Inbox className="size-10 text-neutral-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No conversations yet</h2>
            <p className="text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
                Messaging is tied to active project workspaces. 
                Once your request is approved and your project is initialized, 
                you'll be able to chat directly with us here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/portal" className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold transition-all hover:bg-neutral-800 dark:hover:bg-neutral-100">
                  Return to Dashboard
              </Link>
              <Link href="/contact" className="px-8 py-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  General Inquiry
              </Link>
            </div>
        </div>
      )}
    </div>
  );
}
