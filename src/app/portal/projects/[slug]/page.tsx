import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, Activity } from 'lucide-react';
import PortalMessages from '@/components/portal/PortalMessages';
import { CrmProjectMessage } from '@/types/crm';

export default async function PortalProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login');

  // Fetch Project
  // RLS should filter this to only projects the user has access to via crm_client_users
  const { data: project } = await supabase
    .from('crm_projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!project) return notFound();

  // Fetch Messages
  const { data: messages } = await supabase
    .from('crm_project_messages')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  const typedMessages = (messages || []) as CrmProjectMessage[];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/portal" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6">
        <ChevronLeft className="size-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">{project.title}</h1>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-lg">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-2">
                        <Activity className="size-3" /> Status
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-white capitalize">{project.status.replace('_', ' ')}</div>
                </div>
                <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-2">
                        <Calendar className="size-3" /> Started
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-white">{new Date(project.created_at).toLocaleDateString()}</div>
                </div>
            </div>
        </div>

        <div className="lg:w-[400px]">
            <PortalMessages 
                projectId={project.id} 
                initialMessages={typedMessages} 
                path={`/portal/projects/${slug}`} 
            />
        </div>
      </div>
    </div>
  );
}