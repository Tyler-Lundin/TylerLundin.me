import Link from 'next/link'
import { cmsProject as ZevlinProject } from '@/data/projects/zevlin'

// Align with app route typing where params is a Promise
type PageProps = { params: Promise<{ id: string }> }

const MOCK_CLIENT = {
  id: ZevlinProject.client.id,
  name: ZevlinProject.client.name,
  company: ZevlinProject.client.name,
  website_url: ZevlinProject.links.find((l: any) => l.type === 'production')?.url || '',
}

const MOCK_PROJECTS = [
  {
    id: ZevlinProject.id,
    slug: ZevlinProject.slug,
    title: ZevlinProject.title,
    status: ZevlinProject.status,
    priority: ZevlinProject.priority,
    created_at: ZevlinProject.created_at,
  },
]

export default function ClientDetailPage(_props: PageProps) {
  const client = MOCK_CLIENT
  const projects = MOCK_PROJECTS

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-[#949BA4]">Client</div>
        <h1 className="text-2xl font-semibold text-white">{client.name}</h1>
        <div className="mt-1 text-sm text-[#949BA4]">
          {client.company ? <span>{client.company} • </span> : null}
          {client.website_url ? (
            <a className="underline" href={client.website_url} target="_blank" rel="noreferrer">{client.website_url}</a>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <section className="rounded-lg border border-[#3F4147] overflow-hidden">
          <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Projects</h2>
            <Link href="/dev/projects" className="text-xs underline text-[#DBDEE1]">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#1E1F22] text-[#949BA4]">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Priority</th>
                <th className="text-left px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F4147] bg-[#16171A]">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-[#1E1F22]">
                  <td className="px-4 py-2">
                    <Link className="text-white underline" href={`/dev/projects/${p.slug}`}>{p.title}</Link>
                  </td>
                  <td className="px-4 py-2 text-[#DBDEE1]">{p.status}</td>
                  <td className="px-4 py-2 text-[#DBDEE1]">{p.priority}</td>
                  <td className="px-4 py-2 text-[#949BA4]">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="mt-6">
        <Link href="/dev/clients" className="text-sm underline text-[#DBDEE1]">← Back to Clients</Link>
      </div>
    </div>
  )
}

