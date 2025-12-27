import Link from 'next/link'
import { cmsProject as ZevlinProject } from '@/data/projects/zevlin'
import { HealthTerminal, HealthItem } from '@/components/dev/health'
import ProjectMessages from '@/components/dev/crm/ProjectMessages'
import ProjectLists from '@/components/dev/crm/ProjectLists'
import ProjectBilling from '@/components/dev/crm/ProjectBilling'
import ProjectInvoices from '@/components/dev/crm/ProjectInvoices'
import ProjectDocuments from '@/components/dev/crm/ProjectDocuments'
import ProjectSubscription from '@/components/dev/crm/ProjectSubscription'

// Align with app route typing where params is a Promise
type PageProps = { params: Promise<{ slug: string }> }

const MOCK_PROJECTS = { [ZevlinProject.slug]: ZevlinProject }

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    planned: 'bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]',
    in_progress: 'bg-[#0E3A2A] border-[#0B4A34] text-[#9FEFBC]',
    paused: 'bg-[#3A2A0E] border-[#4A360B] text-[#FDE68A]',
    completed: 'bg-[#0E2A3A] border-[#0B364A] text-[#93C5FD]',
    archived: 'bg-[#2B2C30] border-[#3F4147] text-[#949BA4]',
  }
  return <span className={`px-2 py-0.5 text-xs rounded border ${map[value] || map.planned}`}>{value}</span>
}

function PriorityPill({ value }: { value: string }) {
  const map: Record<string, string> = {
    low: 'bg-[#1E1F22] text-[#949BA4] border-[#3F4147]',
    normal: 'bg-[#1E1F22] text-[#DBDEE1] border-[#3F4147]',
    high: 'bg-[#3A0E0E] text-[#FCA5A5] border-[#4A0B0B]',
    urgent: 'bg-[#4A0B0B] text-[#F87171] border-[#7F1D1D]',
  }
  return <span className={`px-2 py-0.5 text-xs rounded border ${map[value] || map.normal}`}>{value}</span>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = (MOCK_PROJECTS as any)[slug]

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="text-sm text-[#949BA4]">Mock: project not found.</div>
        <div className="mt-4"><Link href="/dev/projects" className="text-sm underline text-[#DBDEE1]">← Back to Projects</Link></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-[#949BA4]">Project</div>
        <h1 className="text-2xl font-semibold text-white">{project.title}</h1>
        <div className="mt-1 text-sm text-[#949BA4]">
          <span>
            for <Link className="underline" href={`/dev/clients/${project.client.id}`}>{project.client.name}</Link>
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <StatusBadge value={project.status} />
          <PriorityPill value={project.priority} />
        </div>
        {project.description ? (
          <p className="mt-3 text-[#DBDEE1] text-sm leading-6">{project.description}</p>
        ) : null}
      </div>

      {/* Repository updates */}
      <RepoUpdates project={project} />

      {/* Health terminal (dev-only UI) */}
      <div className="mt-4">
        <HealthTerminal
          title="Health Terminal"
          items={[
            { id: 'h1', label: 'Storefront reachable', status: 'ok', detail: 'GET / — 200 OK (128 ms)' },
            { id: 'h2', label: 'Admin dashboard auth', status: 'warn', detail: 'Sign-in flow needs stricter RLS for admin paths' },
            { id: 'h3', label: 'Stripe webhook', status: 'error', detail: 'POST /api/webhooks/stripe — 401 Unauthorized' },
          ]}
        />
      </div>

      {/* Messages */}
      <div className="mt-4">
        <ProjectMessages
          project={project}
          initialMessages={[
            { id: 'm1', author: 'client', name: project.client.name, text: 'Can we confirm shipping rates today?', ts: '9:35 AM' },
            { id: 'm2', author: 'admin', name: 'Admin', text: 'Yes — validating Shippo webhook, will update shortly.', ts: '9:41 AM' },
            { id: 'm3', author: 'client', name: project.client.name, text: 'Perfect, thanks!', ts: '9:42 AM' },
          ]}
        />
      </div>

      {/* Billing + Invoices */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectBilling
          invoices={[
            { id: 'inv_1', number: 'INV-1001', date: '2025-12-24', due_at: '2026-01-05', amount_cents: 250000, currency: 'USD', status: 'paid', url: '#' },
            { id: 'inv_2', number: 'INV-1002', date: '2025-12-25', due_at: '2026-01-10', amount_cents: 120000, currency: 'USD', status: 'open', url: '#' },
            { id: 'inv_3', number: 'INV-1003', date: '2025-12-26', due_at: '2026-01-12', amount_cents: 45000, currency: 'USD', status: 'overdue', url: '#' },
          ]}
          paymentsLinked={Array.isArray(project.services) && project.services.some((s: any) => String(s.key).includes('payment'))}
        />
        <ProjectInvoices
          invoices={[
            { id: 'inv_3', number: 'INV-1003', date: '2025-12-26', due_at: '2026-01-12', amount_cents: 45000, currency: 'USD', status: 'overdue', url: '#' },
            { id: 'inv_2', number: 'INV-1002', date: '2025-12-25', due_at: '2026-01-10', amount_cents: 120000, currency: 'USD', status: 'open', url: '#' },
            { id: 'inv_1', number: 'INV-1001', date: '2025-12-24', due_at: '2026-01-05', amount_cents: 250000, currency: 'USD', status: 'paid', url: '#' },
          ]}
        />
      </div>

      {/* Subscription + Documents */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectSubscription
          linked={true}
          subscription={{
            id: 'sub_123',
            status: 'active',
            plan_name: 'Pro',
            amount_cents: 19900,
            currency: 'USD',
            interval: 'month',
            started_at: '2025-12-01',
            current_period_end: '2025-12-31',
            next_invoice_at: '2026-01-01',
            payment_method: { brand: 'visa', last4: '4242' },
            seats: 5,
            usage: { used: 12, limit: 100 },
          }}
        />
        <ProjectDocuments
          docs={[
            { id: 'd1', kind: 'contract', title: 'Master Services Agreement — Zevlin Bike', status: 'signed', url: '#' },
            { id: 'd2', kind: 'sow', title: 'Statement of Work — MVP scope', status: 'pending', url: '#' },
          ]}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-lg border border-[#3F4147] overflow-hidden">
          <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Links</h2>
            <button className="h-7 px-2 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Add</button>
          </div>
          <ul className="divide-y divide-[#3F4147] bg-[#16171A]">
            {project.links.map((l: any) => (
              <li key={l.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-[#DBDEE1]">
                    <span className="mr-2 text-xs uppercase tracking-wide text-[#949BA4]">{l.type}</span>
                    <a className="underline" href={l.url} target="_blank" rel="noreferrer">{l.label || l.url}</a>
                  </div>
                  <div className="text-xs text-[#949BA4]">{new Date(l.created_at).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ProjectLists
          lists={project.lists || []}
          pinnedListIds={(project.lists || []).filter((l: any) => l.key === 'goals').map((l: any) => l.id)}
        />
      </div>

      <div className="mt-6">
        <Link href="/dev/projects" className="text-sm underline text-[#DBDEE1]">← Back to Projects</Link>
      </div>
    </div>
  )
}

function RepoUpdates({ project }: { project: any }) {
  // Find a GitHub repo link from project.links
  const repoLink = (project.links || []).find((l: any) => l.type === 'repo')
  const repoUrl: string | null = repoLink?.url || null

  // Build mock commits only if a repo is present
  const mockCommits = repoUrl
    ? [
        { sha: '3c1a2f7', message: 'Checkout: add Stripe webhook signature verification' },
        { sha: '8b7d9e1', message: 'Catalog: seed initial products and variants' },
        { sha: 'f24e0a5', message: 'Auth: tighten RLS policies and service role access' },
      ]
    : []

  return (
    <section className="mb-4 rounded-lg border border-[#3F4147] overflow-hidden relative">
      <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Repository Updates</h2>
        {repoUrl ? (
          <a href={repoUrl} target="_blank" rel="noreferrer" className="text-xs underline text-[#DBDEE1]">View Repo</a>
        ) : null}
      </div>
      <div className="relative">
        {/* Content area (blur if no repo) */}
        <div className={repoUrl ? 'bg-[#16171A]' : 'bg-[#16171A] blur-sm select-none pointer-events-none'}>
          <ul className="divide-y divide-[#3F4147]">
            {(mockCommits.length > 0 ? mockCommits : [
              { sha: '0000000', message: 'Commit message example A' },
              { sha: '0000000', message: 'Commit message example B' },
              { sha: '0000000', message: 'Commit message example C' },
            ]).map((c, idx) => (
              <li key={idx} className="px-4 py-3">
                {repoUrl ? (
                  <a
                    className="text-sm text-white hover:underline"
                    href={`${normalizeRepoUrl(repoUrl)}/commit/${c.sha}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {c.message}
                  </a>
                ) : (
                  <span className="text-sm text-[#DBDEE1]">{c.message}</span>
                )}
                <div className="text-xs text-[#949BA4] my-1">{repoUrl ? c.sha : '0000000'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function normalizeRepoUrl(url: string) {
  // Ensure base repo URL without trailing slash
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname.replace(/\/$/, '')}`
  } catch {
    return url.replace(/\/$/, '')
  }
}

