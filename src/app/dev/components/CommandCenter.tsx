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
  // Fetch projects and open item counts using service role to bypass RLS for dashboard
  const [ { data: rawProjects }, { data: rawLists }, { data: rawOpenItems } ] = await Promise.all([
    sb.from('crm_projects').select('id, title, status, created_at, client:crm_clients(name)').order('created_at', { ascending: false }),
    sb.from('crm_project_lists').select('id, project_id'),
    sb.from('crm_project_list_items').select('list_id, status').neq('status', 'done')
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

  return <CommandCenterController initialProjects={initialProjects} />
}

