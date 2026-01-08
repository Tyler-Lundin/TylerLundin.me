import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { auditLog } from '@/lib/audit'

const INVITE_SECRET = process.env.INVITE_SECRET || process.env.JWT_SECRET || 'invite-secret'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, profile } = body || {}
    if (!token) {
      return NextResponse.json({ ok: false, message: 'Invalid payload' }, { status: 400 })
    }

    let payload: any
    try {
      payload = jwt.verify(token, INVITE_SECRET)
    } catch {
      return NextResponse.json({ ok: false, message: 'Invalid token' }, { status: 400 })
    }

    const { inviteId, email, role } = payload || {}
    if (!inviteId || !email) {
      return NextResponse.json({ ok: false, message: 'Invalid token payload' }, { status: 400 })
    }

    const sb: any = await createServiceClient()

    // 1. Ensure Auth User exists
    let authUserId: string | null = null;
    
    const { data: { users: existingUsers } } = await sb.auth.admin.listUsers();
    const existingUser = existingUsers.find((u: any) => u.email === email);
    
    if (existingUser) {
      authUserId = existingUser.id;
    } else {
      const { data: newUser, error: createError } = await sb.auth.admin.createUser({
        email,
        password: 'TempPassword_' + Math.random().toString(36).slice(2) + '!',
        email_confirm: true,
        user_metadata: { full_name: profile?.full_name }
      });
      
      if (createError) {
        return NextResponse.json({ ok: false, message: 'Failed to create auth user: ' + createError.message }, { status: 500 })
      }
      authUserId = newUser.user.id;
    }

    // 2. Update public.users
    const { data: user, error: userErr } = await sb
      .from('users')
      .upsert({ 
        id: authUserId,
        email, 
        full_name: profile?.full_name || null, 
        role: role || 'member', 
        updated_at: new Date().toISOString() 
      })
      .select('id')
      .single()

    if (userErr) return NextResponse.json({ ok: false, message: userErr.message }, { status: 500 })
    if (!user) return NextResponse.json({ ok: false, message: 'Failed to update user profile' }, { status: 500 })

    // 3. Update user_profiles
    await sb.from('user_profiles').upsert({
      user_id: user.id,
      headline: profile?.headline || null,
      bio: profile?.bio || null,
      updated_at: new Date().toISOString()
    });

    // 4. Mark invite accepted
    await sb
      .from('team_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', inviteId)

    // 5. Generate Magic Link for immediate access
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Admins/Team go to /dev or /marketing, guests go to /portal
    const isTeam = ['admin', 'owner', 'head_of_marketing', 'head of marketing'].includes(role);
    const nextPath = isTeam ? '/dev' : '/portal';

    const { data: linkData } = await sb.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/confirm?next=${nextPath}`
      }
    });

    // Audit
    const headers = Object.fromEntries(request.headers.entries())
    const ip = (headers['x-forwarded-for'] || headers['x-real-ip'] || '').split(',')[0]?.trim() || null
    const ua = headers['user-agent'] || null
    await auditLog({
      route: '/api/team/complete-onboarding',
      action: 'team.onboard.complete',
      method: 'POST',
      status: 200,
      actorEmail: email,
      actorId: user.id,
      actorRole: role,
      ip,
      userAgent: ua,
      payload: { profile: { full_name: profile?.full_name || null } },
      result: { ok: true },
    })

    return NextResponse.json({ ok: true, link: linkData?.properties?.action_link || null })
  } catch (e: any) {
    try { await auditLog({ route: '/api/team/complete-onboarding', action: 'team.onboard.complete', method: 'POST', status: 500, error: e?.message || String(e) }) } catch {}
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}
