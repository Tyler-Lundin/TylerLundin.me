import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HealthTerminal } from '@/components/dev/health'
import HealthRunner from '@/components/dev/health/HealthRunner'
import HealthHistory from '@/components/dev/health/HealthHistory'
import HealthTabs from '@/components/dev/health/HealthTabs'
import React from 'react'
import ProjectTasks from '@/components/dev/crm/ProjectTasks'
import { getProjectAiTasksAction } from '@/app/dev/actions/ai-tasks'
import ProjectMessages from '@/components/dev/crm/ProjectMessages'
import ProjectLists, { ProjectList as UIProjectList } from '@/components/dev/crm/ProjectLists'
import ProjectBilling, { Invoice as BillingInvoice } from '@/components/dev/crm/ProjectBilling'
import ProjectInvoices from '@/components/dev/crm/ProjectInvoices'
import ProjectDocuments from '@/components/dev/crm/ProjectDocuments'
import ProjectSubscription from '@/components/dev/crm/ProjectSubscription'
import { ChevronLeft, ExternalLink, Folder, GitCommit, Github } from 'lucide-react'
import { getLatestCommits, GitHubCommit } from '@/lib/github'
import AddRepoDialog from './components/AddRepoDialog'
import EditProjectDialog from './components/EditProjectDialog'
import HealthSettingsButton from './components/HealthSettingsButton'
import ShortcutMenu from './components/ShortcutMenu'
import { 
  CrmProject, 
  CrmProjectLink, 
  CrmProjectList, 
  CrmProjectMessage, 
  CrmProjectDocument,
  Invoice 
} from '@/types/crm'
import { slugify } from '@/lib/utils'

export const revalidate = 0;

// Align with app route typing where params is a Promise
type PageProps = { params: Promise<{ slug: string }> }

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    planned: 'bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]',
    in_progress: 'bg-[#0E3A2A] border-[#0B4A34] text-[#9FEFBC]',
    paused: 'bg-[#3A2A0E] border-[#4A360B] text-[#FDE68A]',
    completed: 'bg-[#0E2A3A] border-[#0B364A] text-[#93C5FD]',
    archived: 'bg-[#2B2C30] border-[#3F4147] text-[#949BA4]',
  }
  return <span className={`px-2 py-0.5 text-xs rounded border capitalize ${map[value] || map.planned}`}>{value.replace('_', ' ')}</span>
}

function PriorityPill({ value }: { value: string }) {
  const map: Record<string, string> = {
    low: 'bg-[#1E1F22] text-[#949BA4] border-[#3F4147]',
    normal: 'bg-[#1E1F22] text-[#DBDEE1] border-[#3F4147]',
    high: 'bg-[#3A0E0E] text-[#FCA5A5] border-[#4A0B0B]',
    urgent: 'bg-[#4A0B0B] text-[#F87171] border-[#7F1D1D]',
  }
  return <span className={`px-2 py-0.5 text-xs rounded border capitalize ${map[value] || map.normal}`}>{value}</span>
}

export default async function ProjectDetailPage(props: PageProps) {
  const { slug } = await props.params
  const sb = await createServiceClient()

  // 1. Fetch Project
  const { data: project, error: pError } = await sb
    .from('crm_projects')
    .select('*, client:crm_clients(*)')
    .eq('slug', slug)
    .single()

  if (pError || !project) {
    return notFound()
  }

  // Fetch AI Tasks
  const aiTasks = await getProjectAiTasksAction(project.id)

  // 2. Parallel Fetch: Links, Lists, Invoices, Messages, Docs
  const [
    { data: links },
    { data: lists },
    { data: invoices },
    { data: messages },
    { data: docs }
  ] = await Promise.all([
    sb.from('crm_project_links').select('*').eq('project_id', project.id).order('created_at'),
    sb.from('crm_project_lists').select('*, items:crm_project_list_items(*)').eq('project_id', project.id).order('created_at'),
    sb.from('invoices').select('*').eq('project_id', project.id).order('created_at', { ascending: false }),
    sb.from('crm_project_messages').select('*').eq('project_id', project.id).order('created_at'),
    sb.from('crm_project_documents').select('*').eq('project_id', project.id).order('created_at', { ascending: false })
  ])

  const typedProject = project as CrmProject
  const typedLinks = (links || []) as CrmProjectLink[]
  const typedLists = (lists || []) as CrmProjectList[]
  const typedInvoices = (invoices || []) as Invoice[]
  const typedMessages = (messages || []) as CrmProjectMessage[]
  const typedDocs = (docs || []) as CrmProjectDocument[]

  const mappedMessages = typedMessages.map(m => ({
    id: m.id,
    author: m.author_role,
    name: m.author_name,
    text: m.text,
    ts: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    attachments: m.attachments
  }))

  const mappedInvoices: BillingInvoice[] = typedInvoices.map(inv => ({
    id: inv.id,
    number: inv.number,
    date: inv.created_at,
    due_at: inv.due_at || '',
    amount_cents: inv.amount_cents,
    currency: inv.currency,
    status: inv.status as BillingInvoice['status'],
    url: '' 
  }))

  // 3. Fetch GitHub commits if repo exists
  const repoLink = typedLinks.find(l => l.type === 'repo')
  const commits = repoLink ? await getLatestCommits(repoLink.url) : []
  const healthEnabled = (project as any).project_health_enabled as boolean | undefined
  const healthUrl = (project as any).project_health_url as string | undefined

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
      <ShortcutMenu />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/dev/projects" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="size-4" /> Back to Projects
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Project Workspace</div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">{typedProject.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-neutral-500">
              <span>
                for <Link className="font-medium text-blue-600 hover:underline dark:text-blue-400" href={`/dev/clients/${slugify(typedProject.client?.name || '')}`}>{typedProject.client?.name}</Link>
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <div className="flex items-center gap-2">
                <StatusBadge value={typedProject.status} />
                <PriorityPill value={typedProject.priority} />
              </div>
            </div>
            {typedProject.description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {typedProject.description}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <EditProjectDialog project={{ id: typedProject.id, title: typedProject.title, slug: typedProject.slug, description: typedProject.description || '', status: typedProject.status as any, priority: typedProject.priority as any }} />
          </div>
        </div>

        {/* Repository updates */}
        <RepoUpdates project={typedProject} repoLink={repoLink} commits={commits} />

        {/* AI Tasks */}
        <div className="mt-6">
          <ProjectTasks projectId={typedProject.id} tasks={aiTasks} repoUrl={repoLink?.url} />
        </div>

        {/* Health terminal (dev-only UI) */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {healthEnabled && healthUrl ? (
              <HealthTabs
                projectId={typedProject.id}
                settings={<HealthSettingsButton projectId={typedProject.id} url={healthUrl} enabled={healthEnabled} />}
                viewAllHref={`/dev/projects/${slug}/health`}
              />
            ) : (
              <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Health Terminal</h2>
                <p className="mt-1 text-sm text-neutral-500">Set a health URL and shared secret to enable live checks.</p>
                <HealthSetupForm projectId={typedProject.id} defaultUrl={healthUrl || ''} />
              </section>
            )}
          </div>
          <div>
            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Health Guide</h3>
              <p className="mt-2 text-xs text-neutral-500">Expose a <code className="font-mono">/health</code> endpoint and protect it with an <code className="font-mono">X-Health-Key</code>. Save the URL and secret here.</p>
              <ul className="mt-3 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <li>• URL: your app’s <code className="font-mono">/health</code></li>
                <li>• Secret: same value in both projects</li>
                <li>• Click “Run checks” to verify</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Messages */}
        <div className="mt-6">
          <ProjectMessages
            project={{ 
              id: typedProject.id, 
              title: typedProject.title, 
              client: { 
                id: typedProject.client?.id || '', 
                name: typedProject.client?.name || 'Unknown' 
              } 
            }}
            initialMessages={mappedMessages} 
          />
        </div>

        {/* Billing + Invoices */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectBilling
            invoices={mappedInvoices}
            paymentsLinked={false}
          />
          <ProjectInvoices
            invoices={mappedInvoices}
          />
        </div>

        {/* Subscription + Documents */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectSubscription
            linked={false}
            subscription={null}
          />
          <ProjectDocuments
            docs={typedDocs.map(d => ({
              id: d.id,
              kind: d.kind,
              title: d.title,
              status: d.status,
              url: d.url || undefined,
              created_at: d.created_at
            }))} 
          />
        </div>

        {/* Links + Lists */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between dark:border-neutral-800/50">
              <h2 className="font-semibold text-neutral-900 dark:text-white">Artifacts & Links</h2>
              <button className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">
                Add Link
              </button>
            </div>
            {typedLinks.length === 0 ? (
              <div className="p-10 text-center text-sm text-neutral-500">No project links added yet.</div>
            ) : (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {typedLinks.map((l) => (
                  <li key={l.id} className="px-5 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded dark:bg-neutral-800 dark:text-neutral-500">{l.type}</span>
                          <a className="font-medium text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1" href={l.url} target="_blank" rel="noreferrer">
                            {l.label || new URL(l.url).hostname}
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                        <div className="text-[10px] text-neutral-400">{l.url}</div>
                      </div>
                      <div className="text-xs text-neutral-400">{new Date(l.created_at).toLocaleDateString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ProjectLists
            lists={typedLists as UIProjectList[]}
            pinnedListIds={typedLists.filter(l => l.key === 'goals').map(l => l.id)}
          />
        </div>

        <div className="mt-10">
          <Link href="/dev/projects" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
            ← Back to Projects
          </Link>
        </div>
      </div>
    </div>
  )
}

import RepoDetailModal from './components/RepoDetailModal'

function RepoUpdates({ project, repoLink, commits }: { project: CrmProject, repoLink?: CrmProjectLink, commits: GitHubCommit[] }) {
  const repoUrl = repoLink?.url || null

  return (
    <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between dark:border-neutral-800/50">
        <div className="flex items-center gap-2">
           <Github className="size-4 text-neutral-400" />
           <h2 className="font-semibold text-neutral-900 dark:text-white">Repository Feed</h2>
        </div>
        <div className="flex items-center gap-4">
          {repoUrl && (
            <RepoDetailModal repoUrl={repoUrl} projectName={project.title} />
          )}
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1">
              View on GitHub <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
      <div className="relative min-h-[120px]">
        <div className={repoUrl ? '' : 'blur-[2px] select-none pointer-events-none opacity-50'}>
          <RepoDetailModal repoUrl={repoUrl || ''} projectName={project.title}>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(commits.length > 0 ? commits : [
                { sha: '-------', message: 'Connect a repository to see activity', author: { name: 'System', avatar_url: '' }, date: '' },
                { sha: '-------', message: 'Feed will display latest git commits', author: { name: 'System', avatar_url: '' }, date: '' },
              ]).map((c, idx) => (
                <li key={idx} className="px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        {c.author.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.author.avatar_url} alt="" className="size-full rounded-full" />
                        ) : (
                          <GitCommit className="size-4 text-neutral-400" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-200">{c.author.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{c.sha}</span>
                        </div>
                        <div className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">{c.message}</div>
                    </div>
                    <div className="text-[10px] text-neutral-400 whitespace-nowrap pt-1">
                        {c.date ? timeAgo(c.date) : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </RepoDetailModal>
        </div>
        
        {!repoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-center p-6 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl border border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-500 mb-4 font-medium">No repository connected</p>
                <AddRepoDialog projectId={project.id} />
             </div>
          </div>
        )}
      </div>
    </section>
  )
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function normalizeRepoUrl(url: string) {
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname.replace(/\/$/, '')}`
  } catch {
    return url.replace(/\/$/, '')
  }
}

// Moved HealthTabs into a dedicated client component

async function HealthSetupForm({ projectId, defaultUrl }: { projectId: string; defaultUrl: string }) {
  async function save(formData: FormData) {
    'use server'
    const { updateProjectHealthAction } = await import('@/app/dev/actions/crm')
    await updateProjectHealthAction(null as any, formData)
  }

  return (
    <form action={save} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={projectId} />
      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-500">Health URL</label>
        <input
          name="project_health_url"
          defaultValue={defaultUrl}
          placeholder="https://your-app.example.com/health"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
          required
          type="url"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-500">Shared Secret</label>
        <input
          name="project_health_secret"
          placeholder="Set the same key in the target project"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
          type="text"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="project_health_enabled" defaultChecked className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" />
        Enable health checks
      </label>
      <div className="pt-2">
        <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">Save</button>
      </div>
    </form>
  )
}