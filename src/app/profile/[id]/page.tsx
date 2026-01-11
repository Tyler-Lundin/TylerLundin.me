import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import ProfileView from '@/components/profile/ProfileView'

export const dynamic = 'force-dynamic'

export default async function PublicOrEditableProfile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ view?: string; mode?: string }> }) {
  const { id } = await params
  const sp = (await (searchParams || Promise.resolve({} as any))) as any
  let sb: any
  try { sb = getSupabaseAdmin() } catch { sb = null }
  const me = await getAuthUser()
  let meId: any = (me as any)?.id || (me as any)?.sub || null
  if (sb && !meId && (me as any)?.email) {
    const { data: u } = await sb.from('users').select('id').ilike('email', String((me as any).email)).maybeSingle()
    if (u?.id) meId = String(u.id)
  }
  const isOwner = meId && String(meId) === String(id)

  // Load user (service role to bypass users RLS for public display)
  const { data: user } = sb ? await sb.from('users').select('id, full_name, role').eq('id', id).maybeSingle() : { data: null }
  const { data: profile } = sb ? await sb.from('user_profiles').select('headline, bio, avatar_url, visibility, socials, created_at').eq('user_id', id).maybeSingle() : { data: null }

  if (!user && !isOwner) return notFound()
  
  // Role Check
  const teamRoles = ['admin', 'owner', 'head_of_marketing', 'head of marketing', 'marketing_editor', 'marketing_analyst', 'member'];
  const isTeam = teamRoles.includes(user?.role || '');
  const isProfileClient = !isTeam;
  
  const isAdmin = (me as any)?.role === 'admin' || (me as any)?.role === 'owner';
  
  const viewOnly = !!(isOwner && ((sp?.view === '1') || (sp?.mode === 'view')))

  // Data for Client Profile
  let clientProjects: any[] = [];
  let clientInvoices: any[] = [];
  
  if (sb && isProfileClient) {
      // Find client_ids
      const { data: clientUsers } = await sb.from('crm_client_users').select('client_id').eq('user_id', id);
      const clientIds = clientUsers?.map((cu: any) => cu.client_id) || [];
      
      if (clientIds.length > 0) {
          const { data: projs } = await sb.from('crm_projects').select('id, title, slug, status, description').in('client_id', clientIds).order('updated_at', { ascending: false });
          clientProjects = projs || [];
          
          // Only fetch invoices if owner or admin viewing
          if (isOwner || isAdmin) {
             const { data: invs } = await sb.from('invoices').select('id, number, status, amount_cents, currency, due_at').in('project_id', clientProjects.map(p => p.id)).order('created_at', { ascending: false }).limit(5);
             clientInvoices = invs || [];
          }
      }
  }

  // Load published posts by this author (only if NOT client)
  const { data: posts } = (sb && !isProfileClient) ? await sb
    .from('blog_posts')
    .select('slug, title, excerpt, cover_image_url, published_at')
    .eq('status', 'published')
    .eq('author_id', id)
    .order('published_at', { ascending: false })
    : { data: [] }

  return (
    <ProfileView 
      user={user || { full_name: 'User' }} 
      profile={profile || {}} 
      isOwner={isOwner} 
      viewOnly={viewOnly}
      isClient={isProfileClient}
      posts={posts || []}
      clientProjects={clientProjects}
      clientInvoices={clientInvoices}
    />
  )
}
