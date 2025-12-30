"use server"

import { cookies } from 'next/headers'

export async function setActiveProjectCookie(projectId: string | null) {
  const store = await cookies()
  if (!projectId) {
    store.set('dev_active_project', '', { path: '/', maxAge: 0 })
    return
  }
  store.set('dev_active_project', projectId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

