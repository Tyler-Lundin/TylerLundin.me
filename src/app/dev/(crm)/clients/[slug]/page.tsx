import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ExternalLink, Building2, Phone, Mail, User, Folder, ChevronLeft } from 'lucide-react'
import EditClientDialog from '../components/EditClientDialog'
import EditContactDialog from '../components/EditContactDialog'
import NewProjectDialog from '../components/NewProjectDialog'
import NewContactDialog from '../components/NewContactDialog'
import { CrmClient, CrmProject } from '@/types/crm'
import { slugify } from '@/lib/utils'

// Align with app route typing where params is a Promise
type PageProps = { params: Promise<{ slug: string }> }

interface ClientContact {
  id: string
  client_id: string
  name: string
  email?: string | null
  phone?: string | null
  title?: string | null
  created_at: string
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    planned:    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
    in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    paused:     'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    completed:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    archived:   'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700',
  }
  const style = styles[value] || styles.planned

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${style}`}>
      {value.replace('_', ' ')}
    </span>
  )
}

export default async function ClientDetailPage(props: PageProps) {
  const { slug } = await props.params
  let sb: any
  try { sb = getSupabaseAdmin() } catch { return notFound() }

  // Determine if param is a UUID; if so, fetch directly by id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug)

  // Resolve client by id or by slugified name
  let client: any | null = null
  let clientError: any | null = null

  if (isUuid) {
    const res = await sb.from('crm_clients').select('*').eq('id', slug).single()
    client = res.data
    clientError = res.error
  } else {
    const res = await sb.from('crm_clients').select('*')
    const row = (res.data || []).find((c: any) => slugify(c.name) === slug)
    client = row || null
    clientError = res.error || (!row ? new Error('Not found') : null)
  }

  if (clientError || !client) {
    return notFound()
  }

  // Parallel fetch: Contacts + Projects using resolved client.id
  const [
    { data: contacts },
    { data: projects, error: projectsError }
  ] = await Promise.all([
    sb.from('crm_client_contacts').select('*').eq('client_id', client.id).order('created_at'),
    sb.from('crm_projects').select('*').eq('client_id', client.id).order('created_at', { ascending: false })
  ])

  if (projectsError) {
    console.error('[ClientDetailPage] projects fetch error:', projectsError)
  }

  const typedClient = client as CrmClient
  const typedContacts = (contacts || []) as ClientContact[]
  const typedProjects = (projects || []) as CrmProject[]

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/dev/clients" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="size-4" /> Back to Clients
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
              <Building2 className="size-7 text-neutral-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{typedClient.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                {typedClient.company && <span>{typedClient.company}</span>}
                {typedClient.website_url && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <a 
                      href={typedClient.website_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {new URL(typedClient.website_url).hostname}
                      <ExternalLink className="size-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <EditClientDialog client={typedClient} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Column (Projects) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Projects Section */}
            <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Active Projects</h3>
                <div className="flex items-center gap-4">
                  <NewProjectDialog clientId={typedClient.id} />
                  <Link href="/dev/projects" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    View all
                  </Link>
                </div>
              </div>
              
              {(typedProjects.length === 0) ? (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 dark:bg-neutral-800">
                    <Folder className="size-5" />
                  </div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">No projects yet</div>
                  <p className="mt-1 text-xs text-neutral-500">Create a project using the link in the header.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {typedProjects.map((p) => (
                    <Link 
                      key={p.id} 
                      href={`/dev/projects/${p.slug}`}
                      className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          <Folder className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400 transition-colors">
                            {p.title}
                          </div>
                          <div className="text-xs text-neutral-500">Created {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge value={p.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Notes Section */}
            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
               <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Billing & Notes</h3>
               {typedClient.billing_notes ? (
                 <p className="whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{typedClient.billing_notes}</p>
               ) : (
                 <p className="text-sm text-neutral-400 italic">No notes added.</p>
               )}
            </section>

          </div>

          {/* Sidebar (Contacts) */}
          <div className="space-y-6">
            
            {/* Contacts Card */}
            <section className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Contacts</h3>
              </div>
              
              {(typedContacts.length === 0) ? (
                <div className="p-5 text-sm text-neutral-500 italic">No contacts listed.</div>
              ) : (
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {typedContacts.map((contact) => (
                    <li key={contact.id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          <User className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-neutral-900 dark:text-white truncate">{contact.name}</div>
                            <EditContactDialog contact={contact} />
                          </div>
                          {contact.title && <div className="text-xs text-neutral-500 truncate">{contact.title}</div>}
                          
                          <div className="mt-3 space-y-1.5">
                            {contact.email && (
                              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                <Mail className="size-3.5" />
                                <a href={`mailto:${contact.email}`} className="hover:text-blue-600 hover:underline dark:hover:text-blue-400 truncate transition-colors">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                <Phone className="size-3.5" />
                                <a href={`tel:${contact.phone}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="border-t border-neutral-100 bg-neutral-50 p-2 text-center dark:border-neutral-800 dark:bg-neutral-900/50 transition-colors">
                 <NewContactDialog clientId={typedClient.id} />
              </div>
            </section>

            {/* Meta Card */}
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
               <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase">Created</div>
                    <div className="text-sm text-neutral-900 dark:text-neutral-200">{new Date(typedClient.created_at).toLocaleDateString()}</div>
                  </div>
                  {typedClient.phone && (
                    <div>
                      <div className="text-xs font-medium text-neutral-500 uppercase">Main Phone</div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-200">{typedClient.phone}</div>
                    </div>
                  )}
               </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
