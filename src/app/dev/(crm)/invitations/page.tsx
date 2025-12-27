const MOCK_INVITES = [
  { id: 'i1', email: 'client@zevlinbike.com', role: 'client', client: 'Zevlin Bike', status: 'pending', expires: 'in 3 days', created_at: '2025-12-25T10:00:00Z' },
]

export default function CrmInvitationsPage() {
  const invites = MOCK_INVITES

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invitations</h1>
          <p className="text-sm text-[#949BA4]">Issue and manage client/admin invites</p>
        </div>
        <div className="flex items-center gap-2">
          <input disabled placeholder="Search (mock)" className="h-9 w-56 rounded-md bg-[#1E1F22] border border-[#3F4147] px-3 text-sm text-white placeholder-[#6B7280]" />
          <button className="h-9 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 text-sm text-white opacity-60 cursor-not-allowed">New Invitation</button>
        </div>
      </div>

      <div className="rounded-lg border border-[#3F4147] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1E1F22] text-[#949BA4]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Expires</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3F4147] bg-[#16171A]">
            {invites.map((i) => (
              <tr key={i.id} className="hover:bg-[#1E1F22]">
                <td className="px-4 py-3 text-white">{i.email}</td>
                <td className="px-4 py-3 text-[#DBDEE1]">{i.role}</td>
                <td className="px-4 py-3 text-[#DBDEE1]">{i.client || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded border ${i.status === 'pending' ? 'bg-[#3A2A0E] border-[#4A360B] text-[#FDE68A]' : 'bg-[#0E2A3A] border-[#0B364A] text-[#93C5FD]'}`}>{i.status}</span>
                </td>
                <td className="px-4 py-3 text-[#DBDEE1]">{i.expires}</td>
                <td className="px-4 py-3 text-[#949BA4]">{new Date(i.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-[#949BA4]">
                  <div className="flex items-center gap-2">
                    <button className="px-2 h-7 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Copy Link</button>
                    <button className="px-2 h-7 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Revoke</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

