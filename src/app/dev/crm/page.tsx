import { cmsProject as ZevlinProject } from '@/data/projects/zevlin'

// Mocked, frontend-only dashboard for look & feel (Zevlin-only)
const MOCK_COUNTS = {
  clients: 1,
  projects: 1,
  openItems: (ZevlinProject.lists?.[0]?.items?.length as number) || 0,
  invites: 1,
}

const MOCK_RECENT_PROJECTS = [
  {
    id: ZevlinProject.id,
    title: ZevlinProject.title,
    slug: ZevlinProject.slug,
    client: ZevlinProject.client,
    status: ZevlinProject.status,
    priority: ZevlinProject.priority,
    created_at: ZevlinProject.created_at,
  },
]

const MOCK_INVITES = [
  { id: 'i1', email: 'client@zevlinbike.com', role: 'client', client: 'Zevlin Bike', expires: 'in 3 days' },
]

const MOCK_ACTIVITY = [
  { id: 'a1', text: 'Added production link to Zevlin Bike', ts: '2h ago' },
  { id: 'a2', text: 'Updated priorities for MVP Launch Goals', ts: 'yesterday' },
]

const MOCK_TOP_CLIENTS = [
  { id: ZevlinProject.client.id, name: ZevlinProject.client.name, projects: 1 },
]

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    planned: 'bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]',
    in_progress: 'bg-[#0E3A2A] border-[#0B4A34] text-[#9FEFBC]',
    paused: 'bg-[#3A2A0E] border-[#4A360B] text-[#FDE68A]',
    completed: 'bg-[#0E2A3A] border-[#0B364A] text-[#93C5FD]',
    archived: 'bg-[#2B2C30] border-[#3F4147] text-[#949BA4]',
  }
  return (
    <span className={`px-2 py-0.5 text-xs rounded border ${map[value] || map.planned}`}>{value}</span>
  )
}

function PriorityPill({ value }: { value: string }) {
  const map: Record<string, string> = {
    low: 'bg-[#1E1F22] text-[#949BA4] border-[#3F4147]',
    normal: 'bg-[#1E1F22] text-[#DBDEE1] border-[#3F4147]',
    high: 'bg-[#3A0E0E] text-[#FCA5A5] border-[#4A0B0B]',
    urgent: 'bg-[#4A0B0B] text-[#F87171] border-[#7F1D1D]',
  }
  return (
    <span className={`px-2 py-0.5 text-xs rounded border ${map[value] || map.normal}`}>{value}</span>
  )
}

export default function CrmDashboard() {
  const { clients, projects, openItems, invites } = MOCK_COUNTS

  return (
    <div className="min-h-[70vh] max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">CRM Dashboard</h1>
          <p className="text-sm text-[#949BA4]">Overview of clients, projects, and invites</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search (mock)"
            className="h-9 w-52 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-white placeholder-[#6B7280] focus:outline-none"
            disabled
          />
          <button
            className="h-9 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 text-sm text-white opacity-60 cursor-not-allowed"
            aria-disabled
          >
            New…
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 text-sm">
        <a href="/dev/crm/clients" className="underline text-[#DBDEE1]">Clients</a>
        <span className="opacity-40">/</span>
        <a href="/dev/crm/projects" className="underline text-[#DBDEE1]">Projects</a>
        <span className="opacity-40">/</span>
        <a href="/dev/crm/invitations" className="underline text-[#DBDEE1]">Invitations</a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Active Clients</div>
          <div className="text-3xl font-semibold text-white">{clients}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Active Projects</div>
          <div className="text-3xl font-semibold text-white">{projects}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Open Goals/Tasks</div>
          <div className="text-3xl font-semibold text-white">{openItems}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Pending Invites</div>
          <div className="text-3xl font-semibold text-white">{invites}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Projects */}
        <section className="lg:col-span-2 rounded-lg border border-[#3F4147] overflow-hidden">
          <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent Projects</h2>
            <a href="/dev/crm/projects" className="text-xs underline text-[#DBDEE1]">View all</a>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#1E1F22] text-[#949BA4]">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Client</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Priority</th>
                <th className="text-left px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F4147] bg-[#16171A]">
              {MOCK_RECENT_PROJECTS.map((p) => (
                <tr key={p.id} className="hover:bg-[#1E1F22]">
                  <td className="px-4 py-2">
                    <a className="text-white underline" href={`/dev/crm/projects/${p.slug}`}>{p.title}</a>
                  </td>
                  <td className="px-4 py-2 text-[#DBDEE1]">
                    <a className="underline" href={`/dev/crm/clients/${p.client.id}`}>{p.client.name}</a>
                  </td>
                  <td className="px-4 py-2"><StatusBadge value={p.status} /></td>
                  <td className="px-4 py-2"><PriorityPill value={p.priority} /></td>
                  <td className="px-4 py-2 text-[#949BA4]">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Side Panel: Pending Invites + Activity */}
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-[#3F4147] overflow-hidden">
            <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Pending Invitations</h3>
              <a href="/dev/crm/invitations" className="text-xs underline text-[#DBDEE1]">Manage</a>
            </div>
            <ul className="divide-y divide-[#3F4147] bg-[#16171A]">
              {MOCK_INVITES.map((i) => (
                <li key={i.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-white">{i.email}</div>
                    <div className="text-xs text-[#949BA4]">{i.expires}</div>
                  </div>
                  <div className="text-xs text-[#949BA4]">{i.role} • {i.client}</div>
                </li>
              ))}
              {MOCK_INVITES.length === 0 && (
                <li className="px-4 py-6 text-center text-[#949BA4]">No pending invites.</li>
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-[#3F4147] overflow-hidden">
            <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147]">
              <h3 className="text-sm font-medium text-white">Recent Activity</h3>
            </div>
            <ul className="divide-y divide-[#3F4147] bg-[#16171A]">
              {MOCK_ACTIVITY.map((a) => (
                <li key={a.id} className="px-4 py-3 text-sm flex items-center justify-between">
                  <div className="text-[#DBDEE1]">{a.text}</div>
                  <div className="text-xs text-[#949BA4]">{a.ts}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Top Clients */}
      <section className="mt-4 rounded-lg border border-[#3F4147] overflow-hidden">
        <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Top Clients</h2>
          <a href="/dev/crm/clients" className="text-xs underline text-[#DBDEE1]">Browse</a>
        </div>
        <ul className="divide-y divide-[#3F4147] bg-[#16171A]">
          {MOCK_TOP_CLIENTS.map((c) => (
            <li key={c.id} className="px-4 py-3 text-sm flex items-center justify-between">
              <a className="text-white underline" href={`/dev/crm/clients/${c.id}`}>{c.name}</a>
              <span className="text-xs text-[#949BA4]">{c.projects} projects</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
