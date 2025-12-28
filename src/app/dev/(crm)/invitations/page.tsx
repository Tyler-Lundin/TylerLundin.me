import { Search, Plus, Mail, Copy, XCircle, Calendar } from 'lucide-react'

const MOCK_INVITES = [
  { id: 'i1', email: 'client@zevlinbike.com', role: 'client', client: 'Zevlin Bike', status: 'pending', expires: 'in 3 days', created_at: '2025-12-25T10:00:00Z' },
]

export default function CrmInvitationsPage() {
  const invites = MOCK_INVITES

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Invitations</h1>
            <p className="text-sm text-neutral-500">Issue and manage client/admin invites</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                disabled
                placeholder="Search invites..."
                className="h-10 w-64 rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-neutral-900 disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-white"
              />
            </div>
            <button className="flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Invitation</span>
            </button>
          </div>
        </div>

        {/* Invites Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
             <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Pending Invites</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Expires</th>
                  <th className="px-6 py-3 font-medium text-right">Created</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {invites.map((i) => (
                  <tr key={i.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">{i.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 capitalize">{i.role}</td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{i.client || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border capitalize
                        ${i.status === 'pending' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{i.expires}</td>
                    <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(i.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="inline-flex h-8 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800">
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copy Link
                        </button>
                        <button className="inline-flex h-8 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-neutral-800 dark:text-rose-400 dark:hover:bg-rose-900/20">
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invites.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">No pending invitations.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


