import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AvatarUploader from '@/components/ui/AvatarUploader'
import { revalidatePath } from 'next/cache'
import { Github, Twitter, Instagram, Youtube, Linkedin, Facebook, Globe, Music2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PublicOrEditableProfile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ view?: string; mode?: string }> }) {
  const { id } = await params
  const sp = (await (searchParams || Promise.resolve({} as any))) as any
  const sb: any = await createServiceClient()
  const me = await getAuthUser()
  let meId: any = (me as any)?.id || (me as any)?.sub || null
  if (!meId && (me as any)?.email) {
    const { data: u } = await sb.from('users').select('id').ilike('email', String((me as any).email)).maybeSingle()
    if (u?.id) meId = String(u.id)
  }
  const isOwner = meId && String(meId) === String(id)

  // Load user (service role to bypass users RLS for public display)
  const { data: user } = await sb.from('users').select('id, full_name, role').eq('id', id).maybeSingle()
  const { data: profile } = await sb.from('user_profiles').select('headline, bio, avatar_url, visibility, socials').eq('user_id', id).maybeSingle()

  if (!user && !isOwner) return notFound()
  const isPrivate = profile && profile.visibility === 'private'
  const isNewUser = !profile?.headline && !profile?.bio
  const viewOnly = !!(isOwner && ((sp?.view === '1') || (sp?.mode === 'view')))
  const currentSocials = profile?.socials || {}

  const iconFor = (platform: string) => {
    const p = (platform || '').toLowerCase()
    if (p === 'github') return <Github className="h-4 w-4" />
    if (p === 'twitter' || p === 'x') return <Twitter className="h-4 w-4" />
    if (p === 'instagram' || p === 'ig') return <Instagram className="h-4 w-4" />
    if (p === 'youtube' || p === 'yt') return <Youtube className="h-4 w-4" />
    if (p === 'linkedin' || p === 'li') return <Linkedin className="h-4 w-4" />
    if (p === 'facebook' || p === 'fb') return <Facebook className="h-4 w-4" />
    if (p === 'tiktok' || p === 'tt') return <Music2 className="h-4 w-4" />
    if (p === 'website' || p === 'site' || p === 'blog' || p === 'portfolio') return <Globe className="h-4 w-4" />
    return <Globe className="h-4 w-4" />
  }

  // Load published posts by this author
  const { data: posts } = await sb
    .from('blog_posts')
    .select('slug, title, excerpt, cover_image_url, published_at')
    .eq('status', 'published')
    .eq('author_id', id)
    .order('published_at', { ascending: false })

  return (
    <main className="max-w-full min-h-screen relative overflow-x-hidden mx-2 md:mx-4 bg-white/75 dark:bg-black/75 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible z-10 text-black dark:text-white ">
      {/* Clean Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
              
              {/* Avatar Display (Read-only in header, editable in form below) */}
              <div className="shrink-0">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg bg-neutral-100 dark:bg-neutral-800">
                  <img 
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} 
                    alt="avatar" 
                    className="h-full w-full object-cover" 
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{user?.full_name || 'User'}</h1>
                {profile?.headline ? (
                  <p className="text-lg text-neutral-600 dark:text-neutral-300 font-medium">{profile.headline}</p>
                ) : isOwner ? (
                  <p className="text-neutral-400 italic">Add a headline to complete your profile</p>
                ) : null}

                {/* Social Icons */}
                {profile?.socials && Object.keys(profile.socials).length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    {Object.entries(profile.socials).map(([platform, url]: [string, any]) => (
                      url ? (
                        <a key={platform} href={String(url)} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-white transition-colors border border-neutral-200 dark:border-neutral-700" title={platform}>
                          <span className="sr-only">{platform}</span>
                          {iconFor(platform)}
                        </a>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
              {isOwner && (
                <div className="w-full md:w-auto md:ml-auto">
                  {viewOnly ? (
                    <Link href={`/profile/${id}`} className="inline-flex items-center gap-2 rounded-lg border border-blue-600/20 bg-blue-600/10 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-600/15 transition">
                      Edit Profile
                    </Link>
                  ) : (
                    <Link href={`/profile/${id}?view=1`} className="inline-flex items-center gap-2 rounded-lg border border-neutral-300/50 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition">
                      View Profile
                    </Link>
                  )}
                </div>
              )}
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Bio & Info */}
        <div className="lg:col-span-1 space-y-6">
           {profile?.bio && (
             <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">About</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
             </div>
           )}
           
           {!profile?.bio && !isOwner && (
             <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm text-center">
               <p className="text-neutral-400 text-sm italic">No bio available.</p>
             </div>
           )}
        </div>

        {/* Right/Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {isOwner && !viewOnly && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
               <div className="bg-blue-50/50 dark:bg-blue-900/10 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30">
                 <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                   {isNewUser ? '👋 Complete your profile' : '✏️ Edit Profile'}
                 </h2>
                 {isNewUser && (
                   <p className="text-xs text-blue-900/80 dark:text-blue-200/80 mt-1">Add a name, headline, and photo. These will appear on your blog posts.</p>
                 )}
               </div>
               
               <form action={async (formData) => {
                  'use server'
                  const { createServiceClient } = await import('@/lib/supabase/server')
                  const sb: any = await createServiceClient()
                  
                  const full_name = String(formData.get('full_name') || '')
                  const headline = String(formData.get('headline') || '')
                  const avatar_url = String(formData.get('avatar_url') || formData.get('avatar_url_hidden') || '')
                  const bio = String(formData.get('bio') || '')
                  const visibility = String(formData.get('visibility') || 'public') as 'public' | 'private'
                  
                  const twitter = String(formData.get('social_twitter') || '')
                  const github = String(formData.get('social_github') || '')
                  const linkedin = String(formData.get('social_linkedin') || '')
                  const website = String(formData.get('social_website') || '')
                  
                  const socialsJsonRaw = String(formData.get('socials_json') || '')
                  let baseFromJson: any = {}
                  if (socialsJsonRaw.trim()) {
                    try {
                      const parsed = JSON.parse(socialsJsonRaw)
                      if (parsed && typeof parsed === 'object') baseFromJson = parsed
                    } catch {}
                  }
                  // Merge JSON with individual fields; individual fields win when provided
                  const socials: any = {
                    ...baseFromJson,
                    ...(twitter.trim() && { twitter: twitter.trim() }),
                    ...(github.trim() && { github: github.trim() }),
                    ...(linkedin.trim() && { linkedin: linkedin.trim() }),
                    ...(website.trim() && { website: website.trim() })
                  }

                  await sb.from('users').upsert({ id, full_name, updated_at: new Date().toISOString() }, { onConflict: 'id' })
                  await sb.from('user_profiles').upsert({ 
                    user_id: id, 
                    headline, 
                    avatar_url, 
                    bio, 
                    visibility, 
                    socials: Object.keys(socials).length ? socials : null, 
                    updated_at: new Date().toISOString() 
                  }, { onConflict: 'user_id' })

                  // Ensure profile page re-renders with fresh data
                  revalidatePath(`/profile/${id}`)
                }} className="p-6 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar Uploader in Form */}
                    <div className="shrink-0 flex flex-col items-center gap-2">
                       <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Profile Photo</label>
                       <AvatarUploader uid={id} defaultUrl={profile?.avatar_url} name="avatar_url_hidden" />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Display Name</label>
                        <input name="full_name" defaultValue={user?.full_name || ''} placeholder="e.g. Jane Doe" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Headline</label>
                        <input name="headline" defaultValue={profile?.headline || ''} placeholder="e.g. Software Engineer" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Bio</label>
                    <textarea name="bio" rows={3} defaultValue={profile?.bio || ''} placeholder="Tell us about yourself..." className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Visibility</label>
                      <select name="visibility" defaultValue={(profile?.visibility as any) || 'public'} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">Social Links</label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input name="social_twitter" defaultValue={currentSocials?.twitter || ''} placeholder="Twitter / X URL" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm" />
                      <input name="social_github" defaultValue={currentSocials?.github || ''} placeholder="GitHub URL" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm" />
                      <input name="social_linkedin" defaultValue={currentSocials?.linkedin || ''} placeholder="LinkedIn URL" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm" />
                      <input name="social_website" defaultValue={currentSocials?.website || ''} placeholder="Website URL" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm" />
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">Advanced: Socials JSON</label>
                        <textarea name="socials_json" rows={3} defaultValue={currentSocials && Object.keys(currentSocials).length ? JSON.stringify(currentSocials, null, 2) : ''} placeholder='{"twitter":"https://..."}' className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 text-sm font-mono" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-neutral-100 dark:border-neutral-800">
                    <button className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                      Save Profile
                    </button>
                  </div>
               </form>
            </div>
          )}

          {isPrivate && !isOwner ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">This profile is private</h3>
            </div>
          ) : (
            <section>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Recent Posts</h2>
              <div className="grid gap-4">
                {(posts || []).map((p: any) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group block bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
                    <div className="flex">
                      {p.cover_image_url && (
                        <div className="w-32 sm:w-48 h-auto shrink-0 bg-neutral-100 dark:bg-neutral-800 relative">
                           <img src={p.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-4 sm:p-5 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           {p.published_at && <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{new Date(p.published_at).toLocaleDateString()}</span>}
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">{p.title}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{p.excerpt || 'No description available.'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {(!posts || posts.length === 0) && (
                  <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
                    <p className="text-neutral-500 text-sm">No posts published yet.</p>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </main>
  )
}
