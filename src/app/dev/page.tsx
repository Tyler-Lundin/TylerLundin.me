import { createServiceClient } from '@/lib/supabase/server'

async function getKpis() {
  const sb: any = await createServiceClient()
  const [posts, drafts, commentsPending, members] = await Promise.all([
    sb.from('blog_posts').select('*', { count: 'exact', head: true }),
    sb.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    sb.from('blog_comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('users').select('*', { count: 'exact', head: true }),
  ])
  return {
    posts: posts.count ?? 0,
    drafts: drafts.count ?? 0,
    commentsPending: commentsPending.count ?? 0,
    members: members.count ?? 0,
  }
}

export default async function DevDashboard() {
  const kpis = await getKpis().catch(() => ({ posts: 0, drafts: 0, commentsPending: 0, members: 0 }))
  return (
    <div className="min-h-[70vh] max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Dev Dashboard</h1>
        <p className="text-sm text-[#949BA4]">Key metrics at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Posts</div>
          <div className="text-3xl font-semibold text-white">{kpis.posts}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Drafts</div>
          <div className="text-3xl font-semibold text-white">{kpis.drafts}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Comments Pending</div>
          <div className="text-3xl font-semibold text-white">{kpis.commentsPending}</div>
        </div>
        <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4">
          <div className="text-xs text-[#949BA4]">Team Members</div>
          <div className="text-3xl font-semibold text-white">{kpis.members}</div>
        </div>
      </div>
    </div>
  )
}
