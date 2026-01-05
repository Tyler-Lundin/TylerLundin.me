"use client"

import CommentsSection from '@/components/blog/CommentsSection'

export default function CommentsClient({ postId }: { postId: string }) {
  return <CommentsSection postId={postId} />
}

