import CommandCenterController from './CommandCenterController'
import { createServiceClient } from '@/lib/supabase/server'

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default async function CommandCenter() {
  const sb = await createServiceClient()
  // Fetch projects, open item counts, leads, messages, and quotes
  const [ 
    { data: rawProjects }, 
    { data: rawLists }, 
    { data: rawOpenItems },
    { data: rawLeads },
    { data: rawMessages },
    { data: rawQuotes }
  ] = await Promise.all([
    sb.from('crm_projects').select('id, title, status, created_at, client:crm_clients(name)').order('created_at', { ascending: false }),
    sb.from('crm_project_lists').select('id, project_id'),
    sb.from('crm_project_list_items').select('list_id, status').neq('status', 'done'),
    sb.from('leads').select('id, name, domain, status, created_at').order('created_at', { ascending: false }).limit(10),
    sb.from('contact_submissions').select('id, name, message, status, created_at').order('created_at', { ascending: false }).limit(10),
    sb.from('quote_requests').select('id, contact_name, project_summary, status, budget_min, budget_max, created_at').order('created_at', { ascending: false }).limit(10)
  ])

  const tasksCountByProject = new Map<string, number>()
  if (rawLists && rawOpenItems) {
    const listProjectMap = new Map<string, string>()
    for (const l of rawLists as any[]) listProjectMap.set(l.id, l.project_id)
    for (const item of rawOpenItems as any[]) {
      const pid = listProjectMap.get(item.list_id)
      if (pid) tasksCountByProject.set(pid, (tasksCountByProject.get(pid) || 0) + 1)
    }
  }

  const initialProjects = (rawProjects || []).map((p: any) => ({
    id: p.id,
    name: p.title,
    client: p.client?.name || 'Unknown',
    branch: 'main',
    env: 'prod' as const,
    deploy: p.status === 'in_progress' ? 'running' as const : 'ready' as const,
    tasksDue: tasksCountByProject.get(p.id) || 0,
    lastActivity: timeAgo(p.created_at)
  }))

  const initialLeads = (rawLeads || []).map((l: any) => ({
    id: l.id,
    name: l.name || l.domain || 'Unknown Lead',
    status: l.status || 'new',
    created_at: l.created_at
  }))

  const messages = (rawMessages || []).map((m: any) => ({
    id: m.id,
    type: 'message' as const,
    name: m.name,
    detail: m.message,
    status: m.status || 'new',
    created_at: m.created_at
  }))

  const quotes = (rawQuotes || []).map((q: any) => ({
    id: q.id,
    type: 'quote' as const,
    name: q.contact_name,
    detail: q.project_summary,
    status: q.status || 'new',
    amount: q.budget_max ? `$${q.budget_min} - $${q.budget_max}` : (q.budget_min ? `$${q.budget_min}+` : 'TBD'),
    created_at: q.created_at
  }))

  // Combine and sort by newest first
  const initialInbound = [...messages, ...quotes].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 15)

  return <CommandCenterController 
    initialProjects={initialProjects} 
    initialLeads={initialLeads}
    initialInbound={initialInbound}
  />
}

