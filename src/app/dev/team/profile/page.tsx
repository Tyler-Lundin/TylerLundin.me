import { getSupabaseAdmin } from '@/lib/supabase/admin'

async function fetchProfile() {
  let sb: any
  try { sb = getSupabaseAdmin() } catch { return { user: null, profile: null } }
  // In a real app, determine current user; for now, pick the first user
  const { data: user } = await sb.from('users').select('id, full_name, email, role').limit(1).maybeSingle()
  if (!user) return { user: null, profile: null }
  const { data: profile } = await sb.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle()
  return { user, profile }
}

export default async function ProfilePage() {
  const { user, profile } = await fetchProfile()
  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto px-4 pt-6 text-[#DBDEE1]">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-sm text-[#949BA4]">Public information and details</p>
      </div>

      <form action="/api/team/profile" method="post" className="space-y-3 rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
        <input type="hidden" name="user_id" defaultValue={user?.id || ''} />
        <div>
          <label className="block text-[11px] text-[#949BA4] mb-1">Full name</label>
          <input name="full_name" defaultValue={user?.full_name || ''} className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]" />
        </div>
        <div>
          <label className="block text-[11px] text-[#949BA4] mb-1">Headline</label>
          <input name="headline" defaultValue={profile?.headline || ''} className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]" />
        </div>
        <div>
          <label className="block text-[11px] text-[#949BA4] mb-1">Avatar URL</label>
          <input name="avatar_url" defaultValue={profile?.avatar_url || ''} className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]" />
        </div>
        <div>
          <label className="block text-[11px] text-[#949BA4] mb-1">Bio</label>
          <textarea name="bio" rows={5} defaultValue={profile?.bio || ''} className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]" />
        </div>
        <div>
          <label className="block text-[11px] text-[#949BA4] mb-1">Socials (JSON)</label>
          <textarea name="socials" rows={3} defaultValue={profile?.socials ? JSON.stringify(profile.socials, null, 2) : ''} className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1] font-mono" />
        </div>
        <ProfileActions />
      </form>
    </div>
  )
}

function ProfileActions() {
  return (
    <div className="flex items-center gap-2">
      <button
        formAction={async (formData) => {
          'use server'
          const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
          const sb: any = getSupabaseAdmin()
          const user_id = String(formData.get('user_id') || '')
          const full_name = String(formData.get('full_name') || '')
          const headline = String(formData.get('headline') || '')
          const avatar_url = String(formData.get('avatar_url') || '')
          const bio = String(formData.get('bio') || '')
          const socialsRaw = String(formData.get('socials') || '')
          let socials: any = null
          try { socials = socialsRaw ? JSON.parse(socialsRaw) : null } catch {}
          if (user_id) await sb.from('users').update({ full_name, updated_at: new Date().toISOString() }).eq('id', user_id)
          if (user_id) await sb.from('user_profiles').upsert({ user_id, headline, avatar_url, bio, socials, updated_at: new Date().toISOString() })
        }}
        className="px-3 py-2 rounded bg-[#5865F2] text-white text-sm"
      >
        Save Profile
      </button>
    </div>
  )
}
