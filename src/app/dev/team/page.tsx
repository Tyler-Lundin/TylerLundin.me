import { createServiceClient } from '@/lib/supabase/server'
import { Users, Mail, Shield, UserPlus } from 'lucide-react'

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

async function fetchTeamStats() {
  const sb: any = await createServiceClient()
  const [{ count: activeCount }, { count: adminCount }] = await Promise.all([
    sb.from('crm_profiles').select('*', { count: 'exact', head: true }),
    sb.from('crm_profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin')
  ])
  return {
    activeCount: activeCount || 0,
    adminCount: adminCount || 0
  }
}

// Client side manager wrapper (avoids ESM mismatch in server file)
function InviteManagerWrapper({ invites }: { invites: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const InviteManager = require('@/components/dev/team/InviteManager').default
  return <InviteManager initialInvites={invites as any} />
}

function KpiCard({ title, value, icon }: { title: string, value: string | number, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}

export default async function TeamIndex() {
  const [invites, stats] = await Promise.all([
    fetchInvites(),
    fetchTeamStats()
  ])
  
  const pendingCount = invites.filter((i: any) => i.status === 'pending').length

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Team Management</h1>
          <p className="text-sm text-neutral-500">Manage access, roles, and invitations</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Active Members" value={stats.activeCount} icon={<Users className="h-5 w-5 text-neutral-400" />} />
          <KpiCard title="Pending Invites" value={pendingCount} icon={<Mail className="h-5 w-5 text-neutral-400" />} />
          <KpiCard title="Admins" value={stats.adminCount} icon={<Shield className="h-5 w-5 text-amber-500" />} />
          <KpiCard title="Total Seats" value="Unlimited" icon={<span className="flex size-2 rounded-full bg-emerald-500" />} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Invite Form (Left Column) */}
          <div className="lg:col-span-5">
             <InviteForm />
          </div>

          {/* Invite Manager (Right Column) */}
          <div className="lg:col-span-7">
             <InviteManagerWrapper invites={invites} />
          </div>
        </div>

      </div>
    </div>
  )
}

function InviteForm() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center gap-2">
         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <UserPlus className="h-4 w-4" />
         </div>
         <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Invite New Member</h2>
      </div>
      
      <form action="/api/team/invite" method="post" className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="colleague@example.com"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Role</label>
            <select 
              name="role" 
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
            >
              <option value="member">Member</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Personal Message (Optional)</label>
            <textarea 
              name="inviteMessage" 
              rows={3} 
              placeholder="Welcome to the team!"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800" 
            />
          </div>
        </div>
        
        <div className="pt-2">
          <InviteActions />
        </div>
      </form>
    </div>
  )
}

function InviteActions() {
  return (
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
        console.log('[dev/team] invite: provider=%s resend=%s brevo=%s baseUrl=%s to=%s link=%s',
          process.env.BREVO_API_KEY ? 'brevo' : (process.env.RESEND_API_KEY ? 'resend' : 'none'),
          process.env.RESEND_API_KEY ? 'set' : 'unset',
          process.env.BREVO_API_KEY ? 'set' : 'unset',
          baseUrl,
          email,
          joinUrl,
        )
        const { auditLog } = await import('@/lib/audit')
        const sent = await sendInviteEmail({ to: email, message: inviteMessage, link: joinUrl })
        console.log('[dev/team] invite email result:', sent)
        await auditLog({
          route: '/dev/team (server action)',
          action: 'team.invite.send',
          method: 'SERVER_ACTION',
          status: 200,
          actorEmail: null,
          payload: { email, role },
          result: sent,
          error: (sent as any)?.error ? String((sent as any).error) : null,
        })
      }}
      className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-200 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus:ring-neutral-700"
    >
      Send Invitation
    </button>
  )
}
