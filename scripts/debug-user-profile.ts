import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const sb = createClient(supabaseUrl, supabaseServiceKey);

async function debug() {
  const targetUserId = 'dbc24b71-00ed-4086-a39f-bd226c5cf6ed';
  console.log(`--- Debugging Public User: ${targetUserId} ---`);

  const { data: user, error } = await sb
    .from('users') // public.users
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (error) {
    console.log('Public user fetch error:', error.message);
  } else {
    console.log('Public user found:', user.email, user.id);
  }
}

debug();
