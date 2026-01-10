"use client"

import { useCallback, useState } from 'react'
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
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [activeCtx, setActiveCtx] = useState<any>(null)

  const handleAction = useCallback(async (action: string, ctx: { projectId?: string }) => {
    setActiveAction(action)
    setActiveCtx(ctx)
    
    if (action === 'new_project') {
      router.push('/dev/projects')
      return
    }

    if (action === 'view_project' && ctx.projectId) {
      const slug = await getProjectSlugById(ctx.projectId)
      router.push(slug ? `/dev/projects/${slug}` : '/dev/projects')
      return
    }

    console.log('Action:', action, ctx)
    setActiveAction(null)
    setActiveCtx(null)

  }, [router])

  return (
    <DevCommandCenterHero 
      onAction={handleAction} 
      initialProjects={initialProjects}
      initialLeads={initialLeads}
      initialInbound={initialInbound}
      activeAction={activeAction}
      activeCtx={activeCtx}
    />
  )
}