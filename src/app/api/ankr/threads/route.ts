import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase: any = await createServiceClient()
  const body = await req.json().catch(() => ({}))
  const { title, topicIds } = body || {}

  const { data: thread, error } = await supabase
    .from('ankr_threads')
    .insert([{ title: title ?? null, created_by: 'dev' }])
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (Array.isArray(topicIds) && topicIds.length > 0) {
    const links = topicIds.map((tid: string) => ({ thread_id: thread.id, topic_id: tid, pinned: true }))
    const { error: linkErr } = await supabase.from('ankr_thread_topics').insert(links)
    if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 })
  }

  return NextResponse.json(thread, { status: 201 })
}

