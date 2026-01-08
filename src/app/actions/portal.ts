'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendMessageAction(projectId: string, text: string, path: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');
  if (!text || !text.trim()) throw new Error('Message cannot be empty');

  // 1. Rate Limit: Max 5 messages in 10 seconds
  const { count } = await supabase
    .from('crm_project_messages')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId) // Limit check to this project to use index
    .eq('author_role', 'client') // Only check client messages
    .gt('created_at', new Date(Date.now() - 10000).toISOString());

  if (count && count >= 5) {
    return { success: false, message: 'You are sending messages too fast. Please wait a moment.' };
  }

  // 2. Insert Message
  const name = user.user_metadata.full_name || user.email?.split('@')[0] || 'Client';

  const { error } = await supabase.from('crm_project_messages').insert({
    project_id: projectId,
    author_role: 'client',
    author_name: name,
    text: text.trim()
  });

  if (error) {
    console.error('Send Message Error:', error);
    return { success: false, message: 'Failed to send message.' };
  }

  revalidatePath(path);
  return { success: true };
}
