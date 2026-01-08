import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'
import { slugify } from '@/lib/utils'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(['admin', 'owner'])
    const { id: leadId } = await params
    const supa = getAdminClient()

    // 1. Fetch Lead
    const { data: lead, error: leadErr } = await supa
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadErr || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    if (!lead.email) return NextResponse.json({ error: 'Lead email is required to generate an invite link' }, { status: 400 })

    // 2. Ensure CRM Client exists (Idempotent)
    let client = null
    const { data: existingClient } = await supa
      .from('crm_clients')
      .select('id, name')
      .eq('lead_id', leadId)
      .maybeSingle()
    
    if (existingClient) {
      client = existingClient
    } else {
      const { data: newClient, error: clientErr } = await supa
        .from('crm_clients')
        .insert({
          name: lead.name || lead.domain || 'Client',
          website_url: lead.website || null,
          phone: lead.phone || null,
          lead_id: lead.id,
          domain: lead.domain || null,
        })
        .select('id, name')
        .single()
      
      if (clientErr) throw clientErr
      client = newClient
    }

    // 3. Ensure CRM Project exists (Idempotent)
    const { data: existingProject } = await supa
      .from('crm_projects')
      .select('id')
      .eq('client_id', client.id)
      .limit(1)
      .maybeSingle()

    if (!existingProject) {
      const projectTitle = `${lead.website ? 'Website Redesign' : 'New Website'} – ${client.name}`
      const projectSlug = slugify(projectTitle) + '-' + Math.random().toString(36).substring(2, 5)
      
      await supa.from('crm_projects').insert({
        client_id: client.id,
        title: projectTitle,
        slug: projectSlug,
        status: 'planned',
        priority: 'normal'
      })
    }

    // 4. Ensure Auth User exists (Find or Create)
    let authUser = null
    const { data: { users } } = await supa.auth.admin.listUsers()
    const foundUser = users.find((u: any) => u.email === lead.email)

    if (foundUser) {
      authUser = foundUser
    } else {
      const { data: newUser, error: createError } = await supa.auth.admin.createUser({
        email: lead.email,
        email_confirm: true,
        user_metadata: { full_name: lead.name }
      })
      if (createError) throw createError
      authUser = newUser.user
    }

    // 5. Link User to Client (Idempotent)
    await supa.from('crm_client_users').upsert({
      client_id: client.id,
      user_id: authUser.id,
      role: 'owner'
    }, { onConflict: 'client_id,user_id' })

    // 6. Generate Magic Link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { data: linkData, error: linkErr } = await supa.auth.admin.generateLink({
      type: 'magiclink',
      email: lead.email,
      options: {
        redirectTo: `${siteUrl}/auth/confirm?next=/portal`
      }
    })

    if (linkErr) throw linkErr

    return NextResponse.json({ 
      success: true, 
      link: linkData.properties?.action_link,
      client_id: client.id 
    })

  } catch (e: any) {
    console.error('[Invite Link API] Error:', e)
    return NextResponse.json({ error: e.message || 'Failed to generate link' }, { status: 500 })
  }
}
