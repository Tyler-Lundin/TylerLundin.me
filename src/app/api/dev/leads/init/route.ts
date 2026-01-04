import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'
import { slugify } from '@/lib/utils'

type PostBody = {
  lead_id?: string
  bundle_key?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody
    const lead_id = body.lead_id?.trim()
    const bundleKey = (body.bundle_key || 'standard').trim()
    if (!lead_id) return NextResponse.json({ error: 'lead_id required' }, { status: 400 })

    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 200 })

    // 1) Load lead
    const { data: lead, error: leadErr } = await supa
      .from('leads')
      .select('id, name, phone, website, domain, niche, location')
      .eq('id', lead_id)
      .single()
    if (leadErr || !lead) return NextResponse.json({ error: leadErr?.message || 'Lead not found' }, { status: 404 })

    const domain = (lead.domain || '').toLowerCase() || undefined

    // 2) Idempotent client lookup by lead_id or domain
    let client = null as any
    if (lead.id) {
      const { data: byLead } = await supa
        .from('crm_clients')
        .select('id, name')
        .eq('lead_id', lead.id)
        .maybeSingle()
      if (byLead) client = byLead
    }
    if (!client && domain) {
      const { data: byDomain } = await supa
        .from('crm_clients')
        .select('id, name')
        .ilike('domain', domain)
        .maybeSingle()
      if (byDomain) client = byDomain
    }

    const willCreateClient = !client
    if (!client) {
      const { data: created, error: cErr } = await supa
        .from('crm_clients')
        .insert({
          name: lead.name || domain || 'Client',
          website_url: lead.website || null,
          phone: lead.phone || null,
          lead_id: lead.id,
          domain: domain || null,
        } as any)
        .select('id, name')
        .single()
      if (cErr || !created) return NextResponse.json({ error: cErr?.message || 'Failed to create client' }, { status: 500 })
      client = created
    }

    // 3) Project: prefer readable, unique slug
    const baseSlug = slugify(`${client.name}-${bundleKey}`)
    let slug = baseSlug
    // ensure uniqueness
    if (slug) {
      const { data: existing } = await supa.from('crm_projects').select('id').eq('slug', slug).maybeSingle()
      if (existing) slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`
    }

    // Check for an existing active project for this client (planned/in_progress)
    const { data: existingProject } = await supa
      .from('crm_projects')
      .select('id, title, status, slug')
      .eq('client_id', client.id)
      .in('status', ['planned', 'in_progress'])
      .limit(1)
      .maybeSingle()

    let project = existingProject
    const willCreateProject = !project
    if (!project) {
      const title = `${lead.website ? 'Website Redesign' : 'New Website'} – ${client.name}`
      const { data: created, error: pErr } = await supa
        .from('crm_projects')
        .insert({
          client_id: client.id,
          title,
          slug,
          status: 'planned',
          priority: 'normal',
          bundle_key: bundleKey,
        } as any)
        .select('id, title, status, slug')
        .single()
      if (pErr || !created) return NextResponse.json({ error: pErr?.message || 'Failed to create project' }, { status: 500 })
      project = created
    }

    // 4) Seed checklist tasks on first creation only
    if (willCreateProject && project) {
      const tasks = [
        'Discovery call',
        'Site audit',
        'Content inventory',
        'Timeline',
      ].map((title, i) => ({ project_id: project!.id, title, sort: (i + 1) * 10 }))
      await supa.from('crm_project_tasks').insert(tasks as any)
    }

    // 5) Log event on the lead
    await supa.from('lead_events').insert({
      lead_id: lead.id,
      type: 'init_client_project',
      payload: { client_id: client.id, project_id: project?.id || null, bundle_key: bundleKey, created: { client: willCreateClient, project: willCreateProject } },
    } as any)

    return NextResponse.json({
      client_id: client.id,
      project_id: project?.id || null,
      project_slug: project?.slug || null,
      created: { client: willCreateClient, project: willCreateProject },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
