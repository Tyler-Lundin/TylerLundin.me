'use client'

import { useState, useEffect } from 'react'
import { Session, AuthChangeEvent, User as SupabaseAuthUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/types/database.types'

export function useSupabaseAuth() {
  const [auth, setAuth] = useState<SupabaseAuthUser | null>(null) // raw auth user
  const [user, setUser] = useState<User | null>(null) // profile from public.users
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Initial session fetch and auth change listener
  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        setError(error.message)
      }
      setAuth(user || null)
      setLoading(false)
    }

    fetchAuthUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setAuth(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Fetch profile from `public.users` table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth) {
        setUser(null)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', auth.id)
        .single()

      if (error) {
        setError(error.message)
        setUser(null)
      } else {
        setUser(data)
      }
    }

    fetchUserProfile()
  }, [auth, supabase])

  return { auth, user, supabase, loading, error }
} 