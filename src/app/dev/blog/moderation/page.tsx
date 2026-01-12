import { requireAdmin } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { approveCommentAction, deleteCommentAction } from '@/app/dev/actions/comments'

export default async function ModerationPage() {
  await requireAdmin()
  let sb: any
  try { sb = getSupabaseAdmin() } catch { sb = null }

  const { data } = sb ? await sb
    .from('blog_comments')
    .select('id, content, author_name, author_email, website_url, created_at, post_id, blog_posts ( slug, title )')
    .eq('status', 'pending')
    .order('created_at', { ascending: false }) : { data: [] }

  const pending = (data || []) as any[]

  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Comment Moderation</h1>
          <a href="/dev" className="text-sm underline">Back to Dev</a>
        </div>

        {pending.length === 0 ? (
          <div className="text-neutral-600 dark:text-neutral-300">No pending comments.</div>
        ) : (
          <ul className="space-y-4">
            {pending.map((c) => (
              <li key={c.id} className="rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4">
                <div className="text-sm mb-2 whitespace-pre-wrap">{c.content}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-2">
                  <span>{c.author_name || 'Anonymous'}</span>
                  {c.author_email && <span>• {c.author_email}</span>}
                  {c.website_url && <span>• {c.website_url}</span>}
                  <span>• {new Date(c.created_at).toLocaleString()}</span>
                  {c.blog_posts?.slug && (
                    <span>• <a className="underline" href={`/dev/blog/${c.blog_posts.slug}`}>{c.blog_posts.title || c.blog_posts.slug}</a></span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <form>
                    <button formAction={approveCommentAction.bind(null, c.id)} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm">Approve</button>
                  </form>
                  <form>
                    <button formAction={deleteCommentAction.bind(null, c.id)} className="px-3 py-1.5 rounded bg-rose-600 text-white text-sm">Delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
