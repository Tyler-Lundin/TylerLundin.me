import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdminPasswords() {
  try {
    // Generate password hashes
    const password1 = process.env.ADMIN_PASSWORD_1
    const password2 = process.env.ADMIN_PASSWORD_2
    const password3 = process.env.ADMIN_PASSWORD_3

    if (!password1 || !password2 || !password3) {
      console.error('Missing admin passwords in environment variables')
      process.exit(1)
    }

    const password1Hash = await bcrypt.hash(password1, 10)
    const password2Hash = await bcrypt.hash(password2, 10)
    const password3Hash = await bcrypt.hash(password3, 10)

    // Insert or update the password hashes
    const { error } = await supabase
      .from('admin_passwords')
      .upsert({
        password_1_hash: password1Hash,
        password_2_hash: password2Hash,
        password_3_hash: password3Hash,
        created_at: new Date().toISOString(),
      })

    if (error) {
      throw error
    }

    console.log('Admin passwords set up successfully')
  } catch (error) {
    console.error('Error setting up admin passwords:', error)
    process.exit(1)
  }
}

setupAdminPasswords() 