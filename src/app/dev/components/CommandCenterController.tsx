"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DevCommandCenterHero, { ProjectMeta, LeadMeta, InboundItem } from './DevCommandCenterHero'
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

type ControllerProps = {
  initialProjects?: ProjectMeta[]
  initialLeads?: LeadMeta[]
  initialInbound?: InboundItem[]
}

export default function CommandCenterController({ initialProjects, initialLeads, initialInbound }: ControllerProps) {
  const router = useRouter()

  const handleAction = useCallback(async (action: string, ctx: { projectId?: string }) => {
    
    if (action === 'new_project') {
      router.push('/dev/clients')
      return
    }

    if (action === 'view_project' && ctx.projectId) {
      const slug = await getProjectSlugById(ctx.projectId)
      router.push(slug ? `/dev/projects/${slug}` : '/dev/projects')
      return
    }

    console.log('Action:', action, ctx)

  }, [router])

  return (
    <DevCommandCenterHero 
      onAction={handleAction} 
      initialProjects={initialProjects}
      initialLeads={initialLeads}
      initialInbound={initialInbound}
    />
  )
}