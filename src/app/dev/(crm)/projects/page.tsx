import Link from 'next/link'
import { cmsProject as ZevlinProject } from '@/data/projects/zevlin'

const MOCK_PROJECTS = [ZevlinProject]

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

export default function CrmProjectsPage() {
  const projects = MOCK_PROJECTS

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-[#949BA4]">Track work by client and status</p>
        </div>
        <div className="flex items-center gap-2">
          <input disabled placeholder="Search (mock)" className="h-9 w-56 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-white placeholder-[#6B7280]" />
          <button className="h-9 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 text-sm text-white opacity-60 cursor-not-allowed">New Project</button>
        </div>
      </div>

      <div className="rounded-lg border border-[#3F4147] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1E1F22] text-[#949BA4]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Priority</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3F4147] bg-[#16171A]">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-[#1E1F22]">
                <td className="px-4 py-3">
                  <Link className="text-white underline" href={`/dev/projects/${p.slug}`}>{p.title}</Link>
                </td>
                <td className="px-4 py-3 text-[#DBDEE1]">
                  <Link className="underline" href={`/dev/clients/${p.client.id}`}>{p.client.name}</Link>
                </td>
                <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                <td className="px-4 py-3"><PriorityPill value={p.priority} /></td>
                <td className="px-4 py-3 text-[#949BA4]">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

