import Link from 'next/link'
import { BookOpenText, PlusCircle, Inbox, MessageSquare } from 'lucide-react'

export default function DevDashboard() {
  return (
    <div className="min-h-[70vh] max-w-6xl mx-auto px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-white">Dev</h1>
        <p className="text-sm text-[#949BA4]">Quick actions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/dev/blog" className="group rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4 hover:border-[#5865F2] hover:bg-[#202124] transition-colors">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center"><BookOpenText className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="font-medium text-white">Blog Manager</div>
              <div className="text-xs text-[#949BA4]">View posts, filter, create new</div>
            </div>
          </div>
        </Link>

        <Link href="/dev/blog/wizard" className="group rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4 hover:border-[#5865F2] hover:bg-[#202124] transition-colors">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center"><PlusCircle className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="font-medium text-white">Create New Post</div>
              <div className="text-xs text-[#949BA4]">Open the blog wizard</div>
            </div>
          </div>
        </Link>

        <Link href="/dev/msgs" className="group rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4 hover:border-[#5865F2] hover:bg-[#202124] transition-colors">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center"><Inbox className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="font-medium text-white">Inbox</div>
              <div className="text-xs text-[#949BA4]">Messages and notifications</div>
            </div>
          </div>
        </Link>

        <Link href="/dev/blog/moderation" className="group rounded-lg border border-[#3F4147] bg-[#1E1F22] p-4 hover:border-[#5865F2] hover:bg-[#202124] transition-colors">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center"><MessageSquare className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="font-medium text-white">Comment Moderation</div>
              <div className="text-xs text-[#949BA4]">Approve or delete comments</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
