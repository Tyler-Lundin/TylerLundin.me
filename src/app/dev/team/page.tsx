import { createServiceClient } from '@/lib/supabase/server'

async function fetchInvites() {
  const sb: any = await createServiceClient()
  const { data, error } = await sb
    .from('team_invites')
    .select('id, email, role, status, created_at, expires_at, accepted_at, message')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return []
  return Array.isArray(data) ? data : []
}

// Client side manager wrapper (avoids ESM mismatch in server file)
function InviteManagerWrapper({ invites }: { invites: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const InviteManager = require('@/components/dev/team/InviteManager').default
  return <InviteManager initialInvites={invites as any} />
}

export default async function TeamIndex() {
  const invites = await fetchInvites()
  return (
    <div className="min-h-[70vh] max-w-5xl mx-auto px-4 pt-6 text-[#DBDEE1]">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-white">Team</h1>
        <p className="text-sm text-[#949BA4]">Invite and manage members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InviteForm />
        <InviteManagerWrapper invites={invites} />
      </div>
    </div>
  )
}

function InviteForm() {
  return (
    <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
      <div className="mb-3 text-sm font-medium text-white">Invite Member</div>
      <form action="/api/team/invite" method="post" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-[#949BA4] mb-1">Role</label>
            <select name="role" className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]">
              <option value="member">Member</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[#949BA4] mb-1">Email</label>
            <input name="email" type="email" required className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-[#949BA4] mb-1">Invite message</label>
          <textarea name="inviteMessage" rows={4} className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]" placeholder="A short welcome note (optional)" />
        </div>
        <InviteActions />
      </form>
    </div>
  )
}

function InviteActions() {
  return (
    <div className="flex items-center gap-2">
      <button
        formAction={async (formData) => {
          'use server'
          const { createServiceClient } = await import('@/lib/supabase/server')
          const { sendInviteEmail } = await import('@/lib/email')
          const sb: any = await createServiceClient()
          const role = String(formData.get('role') || 'member')
          const email = String(formData.get('email') || '')
          const inviteMessage = String(formData.get('inviteMessage') || '')
          if (!email) return
          const key = Math.floor(1000 + Math.random() * 9000).toString()
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          await sb.from('team_invites').insert({ email, role, message: inviteMessage, invite_key: key, status: 'pending', expires_at: expires.toISOString() })
          const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined) ||
            (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000') ||
            ''
          const joinUrl = `${baseUrl}/join?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`
          const sent = await sendInviteEmail({ to: email, message: inviteMessage, link: joinUrl })
          console.log('[dev/team] invite email result:', sent)
        }}
        className="px-3 py-2 rounded bg-[#5865F2] text-white text-sm"
      >
        Send Invite
      </button>
    </div>
  )
}
