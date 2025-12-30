"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DevCommandCenterHero, { type ActionId } from './DevCommandCenterHero'
import { createClient } from '@/lib/supabase/client'

async function getProjectSlugById(id: string): Promise<string | null> {
  try {
    const sb = createClient()
    const { data, error } = await sb.from('crm_projects').select('slug').eq('id', id).single()
    if (error) return null
    return (data as { slug?: string } | null)?.slug || null
  } catch {
    return null
  }
}

async function getProjectRepoUrl(id: string): Promise<string | null> {
  try {
    const sb = createClient()
    const { data, error } = await sb
      .from('crm_project_links')
      .select('url')
      .eq('project_id', id)
      .eq('type', 'repo')
      .limit(1)
      .single()
    if (error) return null
    return (data as { url?: string } | null)?.url || null
  } catch {
    return null
  }
}

export default function CommandCenterController({ initialProjects }: { initialProjects?: { id: string; name: string; client: string; branch: string; env: 'preview'|'prod'|'dev'; deploy: 'ready'|'running'|'failed'; tasksDue: number; lastActivity: string; }[] }) {
  const router = useRouter()

  const handleAction = useCallback(async (action: ActionId, ctx: { projectId: string }) => {
    const { projectId } = ctx

    switch (action) {
      case 'new_project': {
        // Route to Clients page to choose a client and create a project
        router.push('/dev/clients')
        break
      }
      case 'add_task': {
        const slug = await getProjectSlugById(projectId)
        if (slug) router.push(`/dev/projects/${slug}`)
        else router.push('/dev/projects')
        break
      }
      case 'open_repo': {
        const repoUrl = await getProjectRepoUrl(projectId)
        if (repoUrl) {
          // Best-effort: open in new tab; fallback to project page
          try {
            window.open(repoUrl, '_blank', 'noopener,noreferrer')
          } catch {
            const slug = await getProjectSlugById(projectId)
            router.push(slug ? `/dev/projects/${slug}` : '/dev/projects')
          }
        } else {
          const slug = await getProjectSlugById(projectId)
          router.push(slug ? `/dev/projects/${slug}` : '/dev/projects')
        }
        break
      }
      case 'deploy_preview':
      case 'view_logs':
      default: {
        // For now, route to the project page for contextual actions/logs
        const slug = await getProjectSlugById(projectId)
        router.push(slug ? `/dev/projects/${slug}` : '/dev/projects')
        break
      }
    }
  }, [router])

  return <DevCommandCenterHero onAction={handleAction} initialProjects={initialProjects} />
}
