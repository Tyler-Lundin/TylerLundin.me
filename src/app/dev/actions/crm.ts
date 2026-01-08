"use server"

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'
import { z } from 'zod'
import { withAuditAction } from '@/lib/audit'

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  billing_notes: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  contact_title: z.string().optional()
})

const updateClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  billing_notes: z.string().optional(),
})

const createProjectSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  status: z.enum(['planned', 'in_progress', 'paused', 'completed', 'archived']).default('planned'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
})

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['planned', 'in_progress', 'paused', 'completed', 'archived']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
})

const createContactSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
})

const createLinkSchema = z.object({
  project_id: z.string().uuid(),
  type: z.enum(['live', 'staging', 'repo', 'docs', 'design', 'tracker', 'other']),
  url: z.string().url('Must be a valid URL'),
  label: z.string().optional(),
  is_client_visible: z.boolean().default(true),
})

const createProjectMessageSchema = z.object({
  project_id: z.string().uuid(),
  author_role: z.enum(['admin', 'client']),
  author_name: z.string().min(1),
  text: z.string().min(1),
})

const createProjectListSchema = z.object({
  project_id: z.string().uuid(),
  key: z.enum(['goals', 'bugs', 'tasks', 'custom']),
  title: z.string().min(1),
})

const createProjectListItemSchema = z.object({
  list_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'done']).default('open'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  due_at: z.string().optional().nullable(),
  is_client_visible: z.boolean().default(false),
})

const updateProjectHealthSchema = z.object({
  id: z.string().uuid(),
  // Allow empty when disabled; validated below when enabled
  project_health_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  project_health_secret: z.string().optional().or(z.literal('')),
  project_health_enabled: z.union([z.literal('on'), z.literal('true'), z.literal('false'), z.literal('')]).optional(),
})

const individualLeadSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  niche: z.string().min(1, 'Niche is required'),
  location: z.string().min(1, 'Location is required'),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

async function _createClientAction(prevState: any, formData: FormData) {
  const raw = {
    name: formData.get('name'),
    company: formData.get('company'),
    website_url: formData.get('website_url'),
    phone: formData.get('phone'),
    billing_notes: formData.get('billing_notes'),
    contact_name: formData.get('contact_name'),
    contact_email: formData.get('contact_email'),
    contact_phone: formData.get('contact_phone'),
    contact_title: formData.get('contact_title')
  }

  const result = clientSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const { contact_name, contact_email, contact_phone, contact_title, ...clientData } = result.data
  const sb = await createServiceClient()
  
  const { data: client, error: clientError } = await sb.from('crm_clients').insert(clientData as any).select().single()
  if (clientError) return { error: clientError.message }

  if (contact_name && client) {
    await sb.from('crm_client_contacts').insert({
      client_id: client.id,
      name: contact_name,
      email: contact_email,
      phone: contact_phone,
      title: contact_title
    } as any)
  }

  revalidatePath('/dev/clients')
  return { success: true, client }
}

async function _updateClientAction(prevState: any, formData: FormData) {
  const raw = {
    id: formData.get('id'),
    name: formData.get('name'),
    company: formData.get('company'),
    website_url: formData.get('website_url'),
    phone: formData.get('phone'),
    billing_notes: formData.get('billing_notes'),
  }

  const result = updateClientSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const { id, ...data } = result.data
  const sb = await createServiceClient()
  const { error } = await sb.from('crm_clients').update(data as any).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/dev/clients/${id}`)
  // also revalidate slug path for new URL scheme
  const slug = slugify(result.data.name)
  if (slug) revalidatePath(`/dev/clients/${slug}`)
  revalidatePath('/dev/clients')
  return { success: true }
}

async function _createProjectAction(prevState: any, formData: FormData) {
  const raw = {
    client_id: formData.get('client_id'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    status: formData.get('status'),
    priority: formData.get('priority'),
  }

  const result = createProjectSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_projects').insert(result.data as any)
  if (error) return { error: error.message }

  revalidatePath(`/dev/clients/${result.data.client_id}`)
  // revalidate slug-based path
  try {
    const { data: client } = await sb.from('crm_clients').select('name').eq('id', result.data.client_id).single()
    const slug = client?.name ? slugify(client.name) : ''
    if (slug) revalidatePath(`/dev/clients/${slug}`)
  } catch {}
  revalidatePath('/dev/projects')
  return { success: true }
}

const updateContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
})

async function _createContactAction(prevState: any, formData: FormData) {
  const raw = {
    client_id: formData.get('client_id'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    title: formData.get('title'),
  }

  const result = createContactSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_client_contacts').insert(result.data as any)
  if (error) return { error: error.message }

  revalidatePath(`/dev/clients/${result.data.client_id}`)
  // revalidate slug-based path
  try {
    const { data: client } = await sb.from('crm_clients').select('name').eq('id', result.data.client_id).single()
    const slug = client?.name ? slugify(client.name) : ''
    if (slug) revalidatePath(`/dev/clients/${slug}`)
  } catch {}
  return { success: true }
}

async function _updateContactAction(prevState: any, formData: FormData) {
  const raw = {
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    title: formData.get('title'),
  }

  const result = updateContactSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const { id, ...data } = result.data
  const sb = await createServiceClient()
  const { data: contact } = await sb.from('crm_client_contacts').select('client_id').eq('id', id).single()
  const { error } = await sb.from('crm_client_contacts').update(data as any).eq('id', id)
  if (error) return { error: error.message }

  if (contact?.client_id) {
    revalidatePath(`/dev/clients/${contact.client_id}`)
    try {
      const { data: client } = await sb.from('crm_clients').select('name').eq('id', contact.client_id).single()
      const slug = client?.name ? slugify(client.name) : ''
      if (slug) revalidatePath(`/dev/clients/${slug}`)
    } catch {}
  }
  
  return { success: true }
}

async function _addProjectLinkAction(prevState: any, formData: FormData) {
  const raw = {
    project_id: formData.get('project_id'),
    type: formData.get('type'),
    url: formData.get('url'),
    label: formData.get('label') || undefined,
    is_client_visible: formData.get('is_client_visible') === 'true',
  }

  const result = createLinkSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_project_links').insert(result.data as any)
  if (error) return { error: error.message }

  revalidatePath('/dev/projects', 'layout') 
  return { success: true }
}

async function _createProjectMessageAction(prevState: any, formData: FormData) {
  const raw = {
    project_id: formData.get('project_id'),
    author_role: formData.get('author_role'),
    author_name: formData.get('author_name'),
    text: formData.get('text'),
  }

  const result = createProjectMessageSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_project_messages').insert(result.data as any)
  if (error) return { error: error.message }

  revalidatePath('/dev/projects', 'layout')
  return { success: true }
}

async function _createProjectListAction(prevState: any, formData: FormData) {
  const raw = {
    project_id: formData.get('project_id'),
    key: formData.get('key'),
    title: formData.get('title'),
  }

  const result = createProjectListSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_project_lists').insert(result.data as any)
  if (error) return { error: error.message }

  revalidatePath('/dev/projects', 'layout')
  return { success: true }
}

async function _createProjectListItemAction(prevState: any, formData: FormData) {
  const raw = {
    list_id: formData.get('list_id'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    status: formData.get('status') || 'open',
    priority: formData.get('priority') || 'normal',
    due_at: formData.get('due_at') || null,
    is_client_visible: formData.get('is_client_visible') === 'true',
  }

  const result = createProjectListItemSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_project_list_items').insert(result.data as any)
  if (error) return { error: error.message }

  revalidatePath('/dev/projects', 'layout')
  return { success: true }
}

async function _updateProjectHealthAction(_prev: any, formData: FormData) {
  const raw = {
    id: formData.get('id'),
    project_health_url: formData.get('project_health_url'),
    project_health_secret: formData.get('project_health_secret') || '',
    project_health_enabled: String(formData.get('project_health_enabled') || ''),
  }

  const parsed = updateProjectHealthSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const enabled = ['on', 'true'].includes(parsed.data.project_health_enabled || '')
  const url = (parsed.data.project_health_url || '').trim()
  if (enabled && !url) {
    return { error: { project_health_url: ['URL is required when enabled'] } }
  }

  const sb = await createServiceClient()
  const { error } = await sb
    .from('crm_projects')
    .update({
      project_health_url: enabled ? url : null,
      project_health_secret: enabled ? (parsed.data.project_health_secret || null) : null,
      project_health_enabled: enabled,
    } as any)
    .eq('id', parsed.data.id)
  if (error) return { error: error.message }

  revalidatePath('/dev/projects', 'layout')
  return { success: true }
}

async function _updateProjectAction(_prev: any, formData: FormData) {
  const raw = {
    id: formData.get('id'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description') || '',
    status: formData.get('status'),
    priority: formData.get('priority'),
  }

  const parsed = updateProjectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  const payload: any = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    status: parsed.data.status,
    priority: parsed.data.priority,
  }
  const { error } = await sb.from('crm_projects').update(payload).eq('id', parsed.data.id)
  if (error) return { error: error.message }

  revalidatePath('/dev/projects', 'layout')
  return { success: true }
}

async function _deleteProjectAction(_prev: any, formData: FormData) {
  const id = formData.get('id')
  if (!id || typeof id !== 'string') return { error: 'Invalid ID' }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_projects').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dev/projects', 'layout')
  return { success: true }
}

async function _deleteClientAction(_prev: any, formData: FormData) {
  const id = formData.get('id')
  if (!id || typeof id !== 'string') return { error: 'Invalid ID' }

  const sb = await createServiceClient()
  const { error } = await sb.from('crm_clients').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dev/clients')
  return { success: true }
}

async function _createIndividualLeadAction(_prev: any, formData: FormData) {
  const raw = {
    name: formData.get('name'),
    niche: formData.get('niche'),
    location: formData.get('location'),
    website: formData.get('website'),
    phone: formData.get('phone'),
    email: formData.get('email'),
  }

  const result = individualLeadSchema.safeParse(raw)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  const sb = await createServiceClient()
  
  // Extract domain if website exists
  let domain = null
  if (result.data.website) {
    try {
      domain = new URL(result.data.website).hostname.replace(/^www\./, '')
    } catch {}
  }

  const { data, error } = await sb
    .from('leads')
    .insert({
      ...result.data,
      domain,
      google_place_id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      status: 'new'
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dev/leads')
  return { success: true, id: data.id }
}

async function _convertSignupAction(_prev: any, formData: FormData) {
  const signupId = formData.get('signup_id') as string;
  if (!signupId) return { error: 'Signup ID is required' };

  const sb = await createServiceClient();

  // 1. Get Signup
  const { data: signup, error: signupErr } = await sb
    .from('project_signups')
    .select('*')
    .eq('id', signupId)
    .single();

  if (signupErr || !signup) return { error: 'Signup not found' };

  // 2. Create or Find Client
  let clientId: string;
  const { data: existingClient } = await sb
    .from('crm_clients')
    .select('id')
    .eq('name', signup.company_name)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error: clientErr } = await sb
      .from('crm_clients')
      .insert({
        name: signup.company_name,
        company: signup.company_name,
        website_url: signup.company_website || null,
      })
      .select('id')
      .single();

    if (clientErr) return { error: `Failed to create client: ${clientErr.message}` };
    clientId = newClient.id;
  }

  // 3. Create Contact
  await sb.from('crm_client_contacts').insert({
    client_id: clientId,
    name: signup.contact_name,
    email: signup.contact_email,
  });

  // 4. Create Project
  const projectTitle = `${signup.company_name} - Initial Project`;
  const projectSlug = slugify(projectTitle) + '-' + Math.random().toString(36).substring(2, 5);
  
  const { data: project, error: projectErr } = await sb.from('crm_projects').insert({
    client_id: clientId,
    title: projectTitle,
    slug: projectSlug,
    description: signup.project_description || 'Created from public signup.',
    status: 'planned',
    priority: 'normal',
  }).select('id, slug').single();

  if (projectErr) return { error: `Failed to create project: ${projectErr.message}` };

  // 5. Update Signup Status
  await sb.from('project_signups').update({ status: 'processed' }).eq('id', signupId);

  // 6. Handle User Auth & Notification
  try {
    const { sendClientWelcomeEmail } = await import('@/lib/email');
    
    // 6.1 Ensure Auth User exists
    let authUser = null;
    const { data: { users } } = await sb.auth.admin.listUsers();
    const foundUser = users.find((u: any) => u.email === signup.contact_email);

    if (foundUser) {
      authUser = foundUser;
    } else {
      const { data: newUser, error: createError } = await sb.auth.admin.createUser({
        email: signup.contact_email,
        email_confirm: true,
        user_metadata: { full_name: signup.contact_name }
      });
      if (!createError) authUser = newUser.user;
    }

    if (authUser) {
      // 6.2 Link User to Client
      await sb.from('crm_client_users').upsert({
        client_id: clientId,
        user_id: authUser.id,
        role: 'owner'
      }, { onConflict: 'client_id,user_id' });

      // 6.3 Generate Magic Link
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const { data: linkData } = await sb.auth.admin.generateLink({
        type: 'magiclink',
        email: signup.contact_email,
        options: {
          redirectTo: `${siteUrl}/auth/confirm?next=/portal`
        }
      });

      if (linkData?.properties?.action_link) {
        // 6.4 Send Branded Email
        await sendClientWelcomeEmail({
          to: signup.contact_email,
          name: signup.contact_name,
          link: linkData.properties.action_link
        });
      }
    }
  } catch (emailErr) {
    console.warn('[convertSignupAction] Email/Auth phase failed:', emailErr);
    // We don't fail the whole action if just the email fails, as the CRM records are already created.
  }

  revalidatePath('/dev/projects');
  revalidatePath('/dev/clients');
  
  return { success: true, projectSlug: project?.slug };
}

export const createClientAction = withAuditAction('crm.client.create', _createClientAction)
export const updateClientAction = withAuditAction('crm.client.update', _updateClientAction)
export const deleteClientAction = withAuditAction('crm.client.delete', _deleteClientAction)
export const createProjectAction = withAuditAction('crm.project.create', _createProjectAction)
export const deleteProjectAction = withAuditAction('crm.project.delete', _deleteProjectAction)
export const createContactAction = withAuditAction('crm.contact.create', _createContactAction)
export const updateContactAction = withAuditAction('crm.contact.update', _updateContactAction)
export const addProjectLinkAction = withAuditAction('crm.project.link.add', _addProjectLinkAction)
export const createProjectMessageAction = withAuditAction('crm.project.message.create', _createProjectMessageAction)
export const createProjectListAction = withAuditAction('crm.project.list.create', _createProjectListAction)
export const createProjectListItemAction = withAuditAction('crm.project.list.item.create', _createProjectListItemAction)
export const updateProjectHealthAction = withAuditAction('crm.project.health.update', _updateProjectHealthAction)
export const updateProjectAction = withAuditAction('crm.project.update', _updateProjectAction)
export const convertSignupAction = withAuditAction('crm.signup.convert', _convertSignupAction)
export const createIndividualLeadAction = withAuditAction('crm.lead.create', _createIndividualLeadAction)
