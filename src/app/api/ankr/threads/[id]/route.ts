import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase: any = await createServiceClient()
  const { id: threadId } = await params
  if (!threadId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const [{ data: thread, error: tErr }, { data: msgs, error: mErr }] = await Promise.all([
    supabase.from('ankr_threads').select('*').eq('id', threadId).single(),
    supabase
      .from('ankr_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(100),
  ])
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 404 })
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

  const { data: topicLinks, error: lErr } = await supabase.from('ankr_thread_topics').select('topic_id, pinned').eq('thread_id', threadId)
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 })
  const topicIds = topicLinks?.map((l: any) => l.topic_id) || []
  let topics: any[] = []
  if (topicIds.length > 0) {
    const { data: tData } = await supabase.from('ankr_topics').select('*').in('id', topicIds)
    topics = tData || []
  }

  return NextResponse.json({ thread, topics, messages: msgs })
}
