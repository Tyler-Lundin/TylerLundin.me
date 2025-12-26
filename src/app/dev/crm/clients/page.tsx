import Link from 'next/link'
import { cmsProject as ZevlinProject } from '@/data/projects/zevlin'

const MOCK_CLIENTS = [
  {
    id: ZevlinProject.client.id,
    name: ZevlinProject.client.name,
    company: ZevlinProject.client.name,
    website_url: ZevlinProject.links.find((l: any) => l.type === 'production')?.url || '',
    created_at: ZevlinProject.created_at,
  },
]

export default function CrmClientsPage() {
  const clients = MOCK_CLIENTS

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clients</h1>
          <p className="text-sm text-[#949BA4]">Manage client organizations and contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <input disabled placeholder="Search (mock)" className="h-9 w-56 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-white placeholder-[#6B7280]" />
          <button className="h-9 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 text-sm text-white opacity-60 cursor-not-allowed">New Client</button>
        </div>
      </div>

      <div className="rounded-lg border border-[#3F4147] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1E1F22] text-[#949BA4]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Company</th>
              <th className="text-left px-4 py-3 font-medium">Website</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3F4147] bg-[#16171A]">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-[#1E1F22]">
                <td className="px-4 py-3 text-white">
                  <Link className="underline" href={`/dev/crm/clients/${c.id}`}>{c.name}</Link>
                </td>
                <td className="px-4 py-3 text-[#DBDEE1]">{c.company || '—'}</td>
                <td className="px-4 py-3">
                  {c.website_url ? (
                    <a href={c.website_url} target="_blank" rel="noreferrer" className="text-[#9CDCFE] underline">{c.website_url}</a>
                  ) : (
                    <span className="text-[#949BA4]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#949BA4]">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
