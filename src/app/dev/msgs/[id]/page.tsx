import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function MessageDetailPage({ params }: Props) {
  const { id } = await params
  const sb = await createServiceClient()

  // Try fetching from both tables in parallel
  const [msgRes, quoteRes] = await Promise.all([
    sb.from('contact_submissions').select('*').eq('id', id).single(),
    sb.from('quote_requests').select('*').eq('id', id).single()
  ])

  const message = msgRes.data
  const quote = quoteRes.data

  if (!message && !quote) {
    return notFound()
  }

  const type = quote ? 'Quote Request' : 'Contact Message'
  const data = (quote || message)!
  const name = quote ? quote.contact_name : message!.name
  const email = quote ? quote.contact_email : message!.email
  const phone = quote ? quote.phone : message!.phone
  const status = data.status || 'new'
  const createdAt = data.created_at ? new Date(data.created_at).toLocaleString() : 'Unknown'
  const detail = quote ? quote.project_summary : message!.message
  
  // Specific fields
  const budget = quote ? (
      quote.budget_max 
      ? `$${quote.budget_min} - $${quote.budget_max}` 
      : (quote.budget_min ? `$${quote.budget_min}+` : 'N/A')
  ) : (message!.budget || 'N/A')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6">
        <Link href="/dev" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          &larr; Back to Command Center
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        
        {/* Header */}
        <div className="border-b border-neutral-100 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{name}</h1>
                 <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide
                    ${type === 'Quote Request' 
                       ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                       : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {type}
                 </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-neutral-500">
                <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                {phone && <span className="border-l border-neutral-200 pl-4 dark:border-neutral-800">{phone}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-neutral-900 dark:text-white capitalize">{status}</div>
              <div className="text-xs text-neutral-500">{createdAt}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
           
           <div className="mb-8">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {quote ? 'Project Summary' : 'Message'}
              </h3>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300 whitespace-pre-wrap">
                 {detail}
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                 <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Budget</h3>
                 <div className="font-mono text-sm text-neutral-900 dark:text-white">{budget}</div>
              </div>
              
              {quote && (
                <>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Company</h3>
                    <div className="text-sm text-neutral-900 dark:text-white">{quote.company || '—'}</div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Timeline</h3>
                    <div className="text-sm text-neutral-900 dark:text-white">{quote.timeline || '—'}</div>
                  </div>
                   <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Source</h3>
                    <div className="text-sm text-neutral-900 dark:text-white">{quote.source || '—'}</div>
                  </div>
                </>
              )}
           </div>
           
           {quote && quote.scope && (
             <div className="mt-8">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Scope / Tags</h3>
                <div className="flex flex-wrap gap-2">
                   {/* Handle scope JSON or tags array if present */}
                   {quote.tags && quote.tags.map((tag: string) => (
                      <span key={tag} className="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                        {tag}
                      </span>
                   ))}
                   {!quote.tags && <span className="text-sm text-neutral-400 italic">No tags</span>}
                </div>
             </div>
           )}

        </div>

      </div>
    </div>
  )
}
